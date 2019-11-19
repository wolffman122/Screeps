import {Utils, RAMPARTTARGET} from '../../lib/utils'
import {Process} from '../../os/process'
import {BuilderLifetimeProcess} from '../lifetimes/builder'
import {RepairerLifetimeProcess} from '../lifetimes/repairer'
import { DismantleLifetimeProcess } from 'processTypes/lifetimes/dismantler';
import { ENERGY_KEEP_AMOUNT } from 'processTypes/buildingProcesses/mineralTerminal';

export class StructureManagementProcess extends Process{
  metaData: StructureManagementProcessMetaData
  type = 'sm'
  static upgradingRampartCount: number = 0;

  ensureMetaData(){
    if(!this.metaData.spareCreeps)
      this.metaData.spareCreeps = []

    if(!this.metaData.buildCreeps)
      this.metaData.buildCreeps = []

    if(!this.metaData.repairCreeps)
      this.metaData.repairCreeps = []

    if(!this.metaData.dismantleCreeps)
      this.metaData.dismantleCreeps = []
  }

  run()
  {
    this.ensureMetaData()

    if(!this.kernel.data.roomData[this.metaData.roomName]){
      this.completed = true
      return
    }

    let room = Game.rooms[this.metaData.roomName];

    if(room?.controller?.my)
    {
      this.CheckRamparts(room);

      let constructionSites = _.filter(this.kernel.data.roomData[this.metaData.roomName].constructionSites, (cs) => {
        return (cs.structureType != STRUCTURE_RAMPART);
      })
      let numBuilders = _.min([Math.ceil(constructionSites.length / 10), 3, constructionSites.length])

      this.metaData.buildCreeps = Utils.clearDeadCreeps(this.metaData.buildCreeps)
      this.metaData.repairCreeps = Utils.clearDeadCreeps(this.metaData.repairCreeps)
      this.metaData.spareCreeps = Utils.clearDeadCreeps(this.metaData.spareCreeps)
      this.metaData.dismantleCreeps = Utils.clearDeadCreeps(this.metaData.dismantleCreeps);

      if(this.metaData.buildCreeps.length < numBuilders){
        if(this.metaData.spareCreeps.length === 0){
          let creepName = 'sm-' + this.metaData.roomName + '-' + Game.time
          let spawned = Utils.spawn(this.kernel, this.metaData.roomName, 'worker', creepName, {})
          if(spawned){
            this.metaData.buildCreeps.push(creepName)
            this.kernel.addProcess(BuilderLifetimeProcess, 'blf-' + creepName, 30, {
              creep: creepName
            })
          }
        }else{
          let creepName = <string>this.metaData.spareCreeps.pop()
          this.metaData.buildCreeps.push(creepName)
          this.kernel.addProcess(BuilderLifetimeProcess, 'blf-' + creepName, 30, {
            creep: creepName
          })
        }
      }

      let repairableObjects = <Structure[]>[].concat(
        <never[]>this.kernel.data.roomData[this.metaData.roomName].containers,
        <never[]>this.kernel.data.roomData[this.metaData.roomName].roads
      )

      let repairTargets = _.filter(repairableObjects, function(object){
        return (object.hits < object.hitsMax)
      })

      if(repairTargets.length > 0)
      {
        let controller = Game.rooms[this.metaData.roomName].controller;
        if(controller && controller.level === 8)
        {
          let reapirCount = 2;
          let needBoosting = true;

          if(this.roomData().ramparts.length)
          {
            if(!room.memory.rampartsUpgrading)
            {
              needBoosting = false;
              reapirCount = 1;
            }
          }

          if(this.metaData.repairCreeps.length < reapirCount)
          {
            if(this.metaData.spareCreeps.length === 0)
            {
              let creepName = 'sm-' + this.metaData.roomName + '-' + Game.time;
              let controller = Game.rooms[this.metaData.roomName].controller;
              let spawned: boolean;
              if(controller && controller.my && controller.level >= 8)
              {
                spawned = Utils.spawn(this.kernel, this.metaData.roomName, 'bigWorker', creepName, {})
              }
              else
              {
                spawned = Utils.spawn(this.kernel, this.metaData.roomName, 'worker', creepName, {})
              }

              if(spawned)
              {
                this.metaData.repairCreeps.push(creepName)
                if(controller && controller.my && controller.level >= 8)
                {
                  let boosts = needBoosting ? [RESOURCE_LEMERGIUM_HYDRIDE] : [];

                  this.kernel.addProcess(RepairerLifetimeProcess, 'rlf-' + creepName, 29, {
                    creep: creepName,
                    roomName: this.metaData.roomName,
                    boosts: boosts,
                    allowUnboosted: true

                  })
                }
                else
                {
                  this.kernel.addProcess(RepairerLifetimeProcess, 'rlf-' + creepName, 29, {
                    creep: creepName,
                    roomName: this.metaData.roomName
                  })
                }
              }
            }
            else
            {
              let creepName = <string>this.metaData.spareCreeps.pop()
              this.metaData.repairCreeps.push(creepName)
              this.kernel.addProcess(RepairerLifetimeProcess, 'rlf-' + creepName, 29, {
                creep: creepName,
                roomName: this.metaData.roomName
              })
            }
          }
        }
        else
        {
          if(this.metaData.repairCreeps.length == 0)
          {
            if(this.metaData.spareCreeps.length === 0)
            {
              let creepName = 'sm-' + this.metaData.roomName + '-' + Game.time
              let spawned = Utils.spawn(this.kernel, this.metaData.roomName, 'worker', creepName, {})
              if(spawned){
                this.metaData.repairCreeps.push(creepName)
                this.kernel.addProcess(RepairerLifetimeProcess, 'rlf-' + creepName, 29, {
                  creep: creepName,
                  roomName: this.metaData.roomName
                })
              }
            }
            else
            {
              let creepName = <string>this.metaData.spareCreeps.pop()
              this.metaData.repairCreeps.push(creepName)
              this.kernel.addProcess(RepairerLifetimeProcess, 'rlf-' + creepName, 29, {
                creep: creepName,
                roomName: this.metaData.roomName
              })
            }
          }
        }
      }

      let enemyExtensions = <Structure[]>[].concat(
        <never[]>this.kernel.data.roomData[this.metaData.roomName].enemyExtensions,
      )

      let targets = _.filter(enemyExtensions, function(ee: StructureExtension){
        return (ee.energy === 0);
      });

      if(targets.length > 0)
      {
        if(this.metaData.dismantleCreeps.length === 0)
        {
          if(this.metaData.spareCreeps.length === 0)
          {
            let creepName = 'sm-' + this.metaData.roomName + '-' + Game.time;
            let spawned = Utils.spawn(this.kernel, this.metaData.roomName, 'worker', creepName, {})
            if(spawned)
            {
              this.metaData.dismantleCreeps.push(creepName);
              this.kernel.addProcess(DismantleLifetimeProcess, 'dislf-' + creepName, 28, {
                creep: creepName,
                roomName: this.metaData.roomName
              })
            }
          }
          else
          {
            let creepName = <string>this.metaData.spareCreeps.pop();
            this.metaData.dismantleCreeps.push(creepName);
            this.kernel.addProcess(DismantleLifetimeProcess, 'dislf-' + creepName, 28, {
              creep: creepName,
              roomName: this.metaData.roomName
            });
          }
        }
      }
    }
    else
    {
      this.completed = true;
      return;
    }
  }

  CheckRamparts(room: Room)
  {
    if(room.memory.rampartsDoneUpgrading)
    {
      console.log(this.name, 'Done upgrading ramparts', room.memory.rampartsUpgrading, room.memory.rampartsDoneUpgrading, StructureManagementProcess.upgradingRampartCount);
      room.memory.rampartsDoneUpgrading = false;
      StructureManagementProcess.upgradingRampartCount -= 1;
      if(StructureManagementProcess.upgradingRampartCount < 0)
        StructureManagementProcess.upgradingRampartCount = 0;

      return;
    }

    if(room.name === 'E45S53' || room.name === 'E55S47' || room.name === 'E52S46' || room.name === 'E47S46' || room.name === 'E32S44')
    {
      let averageRamparts = Math.ceil(_.sum(<never[]>this.kernel.data.roomData[room.name].ramparts, 'hits') / this.kernel.data.roomData[room.name].ramparts.length);
      console.log(this.name, '1', averageRamparts, room.memory.rampartHealth, StructureManagementProcess.upgradingRampartCount)

      let lowest = _.min(this.roomData().ramparts, 'hits');
      console.log(this.name, 'Lowest rampart', lowest.hits);
      // Increasing amount target
      if(room.memory.rampartHealth === RAMPARTTARGET)
        room.memory.rampartHealth = RAMPARTTARGET * 1.03;
      else if(lowest.hits > room.memory.rampartHealth)
      {
        console.log('Time to up the upgrade')
        room.memory.rampartHealth += 10000
      }

      let storage = room.storage;
      let terminal = room.terminal;
      if((storage?.store.getUsedCapacity(RESOURCE_ENERGY) > ENERGY_KEEP_AMOUNT + 150000)
        || (terminal?.store.getFreeCapacity() < 2000))
      {
        console.log(this.name, 'Full storage');
        if(averageRamparts < room.memory.rampartHealth)
        {
            console.log(this.name, 'Need some upgrading', room.memory.rampartsUpgrading);
            if(!room.memory.rampartsUpgrading && StructureManagementProcess.upgradingRampartCount < 5)
            {
              room.memory.rampartsUpgrading = true;
              StructureManagementProcess.upgradingRampartCount += 1;
              console.log(this.name, 'Doing some upgrading', StructureManagementProcess.upgradingRampartCount)
              return;
            }
            console.log(this.name, '2', room.memory.rampartsUpgrading, room.memory.rampartHealth, StructureManagementProcess.upgradingRampartCount);
        }

        console.log(this.name, 'Not above average Ramparts, still upgrading',
        room.memory.rampartsUpgrading, room.memory.rampartHealth, averageRamparts, StructureManagementProcess.upgradingRampartCount);
        // Reset block
        //room.memory.rampartsUpgrading = false;
        //room.memory.rampartHealth = 12920000;
        //StructureManagementProcess.upgradingRampartCount = 0;
      }
    }
  }
}
