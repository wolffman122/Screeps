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
    if(this.metaData.roomName === 'E37S45')
      console.log(this.name, '??????????????????????????????????????????????????????????????????????????');

    // if(this.metaData.upgradeType === 1)
    //   console.log(this.name, 'Should be doing upgrades nows');

    this.ensureMetaData()

    if(!this.kernel.data.roomData[this.metaData.roomName]){
      this.completed = true
      return
    }

    let room = Game.rooms[this.metaData.roomName];
    if(room.memory.shutdown || room.memory.templeRoom)
    {
      this.completed = true;
      return;
    }

    if(room?.controller?.my)
    {
      let constructionSites = _.filter(this.kernel.data.roomData[this.metaData.roomName].constructionSites, (cs) => {
        return (cs.my && cs.structureType != STRUCTURE_RAMPART);
      })

      const constructionLeft = constructionSites.reduce((a, b) => +a + +b.progressTotal, 0) - constructionSites.reduce((a,b) => +a + +b.progress, 0);
      let numBuilders = 0;
      if(constructionLeft > 0 && constructionLeft <= 3000)
        numBuilders = 1;
      else if(constructionLeft > 3000 && constructionLeft <= 6000)
        numBuilders = 2;
      else if(constructionLeft > 6000)
        numBuilders = 4;

      if(numBuilders > 0 && (!room.storage || room.storage?.store.getUsedCapacity(RESOURCE_ENERGY) < 50000))
        numBuilders = 1;

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
        if(room.storage?.store.getUsedCapacity(RESOURCE_ENERGY) >= ENERGY_KEEP_AMOUNT * .8
          ||
          room.name === 'E16S51' || room.name === 'E29S26' || room.name === 'E31S26')
        {
          if(!this.metaData.shutDownRamparts)
          {
            let count = 0;

            if (room.storage?.store.getUsedCapacity(RESOURCE_ENERGY) >= ENERGY_KEEP_AMOUNT + 10000)
              count = 2;
            else if (room.storage.store.getUsedCapacity() > room.storage.store.getCapacity() * .9)
              count = 1;

            if(!room.memory.pauseUpgrading)
            {
              if(room.storage?.store.getUsedCapacity(RESOURCE_ENERGY) < ENERGY_KEEP_AMOUNT)
                count = 0;
            }

            let building = false;
            if (room.name === 'E16S51' || room.name === 'E29S26' || room.name === 'E31S26')
            {
              count = 2;
              building = true;
              console.log(this.name, 'Repair count', count, room.memory.pauseUpgrading, room.storage?.store.getUsedCapacity(RESOURCE_ENERGY) >= ENERGY_KEEP_AMOUNT + 10000);
            }

            let creepName = 'sm-' + this.metaData.roomName + '-' + Game.time
            let spawned = false;
            if(this.metaData.repairCreeps.length < count)
            {
              if (room.name === 'E16S51' || room.name === 'E29S26' || room.name === 'E31S26')
                console.log(this.name, 1)
              const sites = this.roomData().constructionSites.filter(cs => cs.structureType === STRUCTURE_RAMPART);
              if(sites.length)
              {
                this.metaData.rampartCheckTime = undefined;
                building = true;
              }

              if(this.metaData.rampartCheckTime === undefined
                || this.metaData.rampartCheckTime < Game.time - 1000
                || room.name === 'E16S51' || room.name === 'E29S26' || room.name === 'E31S26')
              {
                if (room.name === 'E26S29')
                  console.log(this.name, 2)
                const ramparts = room.find(FIND_MY_STRUCTURES, {filter: s => s.structureType === STRUCTURE_RAMPART});
                if(ramparts.length || building)
                {
                  this.metaData.rampartCheckTime = Game.time;
                  const sum = _.sum(ramparts, 'hits');
                  const average = sum / ramparts.length;
                  if(average < 24000000 || building)
                  {
                    spawned = Utils.spawn(this.kernel, this.metaData.roomName, 'bigWorker', creepName, {});

                    if(spawned)
                    {
                      let boosts: string[] = [];
                      if (room.name === 'E29S26' || room.name === 'E31S26')
                        boosts.push(RESOURCE_LEMERGIUM_ACID);
                      //let boosts = []; //upgrading ? [RESOURCE_LEMERGIUM_HYDRIDE] : [];

                      //if(count === 2 || (room.storage.store.getUsedCapacity() > room.storage.store.getCapacity() * .9))
                        //boosts.push(RESOURCE_LEMERGIUM_HYDRIDE)
                      this.metaData.repairCreeps.push(creepName);

                      this.kernel.addProcess(RepairerLifetimeProcess, 'rlf-' + creepName, 29, {
                        creep: creepName,
                        roomName: this.metaData.roomName,
                        boosts: boosts,
                      });
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  CheckRamparts(room: Room)
  {

  }
}
