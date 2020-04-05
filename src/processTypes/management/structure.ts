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
          // else if(this.metaData.repairCreeps.length < 1)
          //   spawned = Utils.spawn(this.kernel, this.metaData.roomName, 'worker', creepName, {});

          if(spawned)
          {
            let boosts = []; //upgrading ? [RESOURCE_LEMERGIUM_HYDRIDE] : [];
            //let boosts = [RESOURCE_LEMERGIUM_HYDRIDE];
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
    const rsites = this.kernel.data.roomData[this.metaData.roomName].constructionSites.filter(cs => cs.structureType === STRUCTURE_RAMPART);
    if(rsites.length)
      return true;

    const ramparts = this.kernel.data.roomData[this.metaData.roomName].ramparts;


      let min: number = WALL_HITS_MAX;
      let total = 0;
      for(let i = 0; i < ramparts.length; i++)
      {
        const rampart = ramparts[i];
        if(rampart.hits < min)
          min = rampart.hits;
        total += rampart.hits;
      }

      const average = total / ramparts.length;

      //////////// This should probably be toggled depending on energy reserves ///////////////////////
      const storage = room.storage;
      // if((storage?.store[RESOURCE_ENERGY] ?? 0) > ENERGY_KEEP_AMOUNT * 2.5)
      //   return true;

      if(average > 30000000)
      {
        return false;
      }
      //console.log(this.name, 'Average ramparts', average, 'minimum rampart amount', min);
      if(min < (average - 500000))
        return true;

    const minRampart = _.min(ramparts, r => r.hits);
    if(minRampart.hits < 5500000)
      return true

    return retValue;
  }
}
