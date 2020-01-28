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
    if(room.memory.shutdown)
    {
      this.completed = true;
      return;
    }

    if(room?.controller?.my)
    {
      let constructionSites = _.filter(this.kernel.data.roomData[this.metaData.roomName].constructionSites, (cs) => {
        return (cs.my && cs.structureType != STRUCTURE_RAMPART);
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

      const towers = this.kernel.data.roomData[this.metaData.roomName].towers;
      if(room.controller?.level <= 3 && towers.length === 0)
      {
        let repairableObjects = <Structure[]>[].concat(
          <never[]>this.kernel.data.roomData[this.metaData.roomName].containers,
          <never[]>this.kernel.data.roomData[this.metaData.roomName].roads
        )

        let repairTargets = _.filter(repairableObjects, function(object){
          return (object.hits < object.hitsMax)
        })

        if(repairTargets.length > 0)
        {
          let controller = room.controller;

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
      else if(room.controller?.level === 8)
      {
        if(!this.metaData.shutDownRamparts)
        {
          const upgrading = this.CheckRamparts(room);
          let creepName = 'sm-' + this.metaData.roomName + '-' + Game.time
          let spawned = false;
          if(upgrading && this.metaData.repairCreeps.length < 2)
            spawned = Utils.spawn(this.kernel, this.metaData.roomName, 'bigWorker', creepName, {});
          else if(this.metaData.repairCreeps.length < 1)
            spawned = Utils.spawn(this.kernel, this.metaData.roomName, 'worker', creepName, {});

          if(spawned)
          {
            let boosts = upgrading ? [RESOURCE_LEMERGIUM_HYDRIDE] : [];
            this.metaData.repairCreeps.push(creepName);

            this.kernel.addProcess(RepairerLifetimeProcess, 'rlf-' + creepName, 29, {
              creep: creepName,
              roomName: this.metaData.roomName,
              boosts: boosts,
              upgrading: upgrading
            });
          }
        }
      }
    }
  }

  CheckRamparts(room: Room)
  {
    let retValue = false;
    const storage = room.storage;
    const ramparts = this.kernel.data.roomData[this.metaData.roomName].ramparts;
    let average = ramparts.reduce((total, next) => total + next.hits, 0) / ramparts.length;
    if(room.memory.rampartTarget === undefined && ramparts.length)
    {
      room.memory.rampartTarget = average;
    }

    const percentDiference = ((room.memory.rampartTarget - average) / room.memory.rampartTarget) * 100;

    if(percentDiference >= 5 && storage.store[RESOURCE_ENERGY] > ENERGY_KEEP_AMOUNT * 1.25)
      retValue = true;
    else if (percentDiference <= 1 && storage.store[RESOURCE_ENERGY] > ENERGY_KEEP_AMOUNT * 1.25)
    {
      if(room.memory.rampartTarget < 11000000)
        room.memory.rampartTarget += 1000;

      retValue = true;
    }

    //console.log(this.name, 'Percent Diference', percentDiference, 'Average', average, 'Target', room.memory.rampartTarget, retValue);
    return retValue;
  }
}
