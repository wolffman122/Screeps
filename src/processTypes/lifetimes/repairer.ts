import {LifetimeProcess} from '../../os/process'
import {Utils, RAMPARTTARGET} from '../../lib/utils'
import {RepairProcess} from '../creepActions/repair'
import { HarvestProcess } from '../creepActions/harvest';
import { LABDISTROCAPACITY } from '../management/lab';
import { StructureManagementProcess } from 'processTypes/management/structure';

export class RepairerLifetimeProcess extends LifetimeProcess{
  type = 'rlf'
  metaData: RepairerLifetimeProcessMetaData;

  run()
  {
    let creep = this.getCreep()

    if(!creep){ return }
    if(creep.room.memory.shutdown)
    {
      this.completed = true;
      return;
    }

    let room = Game.rooms[this.metaData.roomName];

    if(this.metaData.boosts && !creep.memory.boost)
    {
      creep.boostRequest(this.metaData.boosts, false);
      return;
    }

    //Dump carry before dieing
    if(creep.ticksToLive! < 50 && _.sum(creep.carry) > 0)
    {
      let storage = creep.room.storage;
      if(storage)
      {
        if(!creep.pos.inRangeTo(storage, 1))
        {
          creep.travelTo(storage);
          return;
        }

        if(creep.transferEverything(storage) == OK)
        {
          if(_.sum(creep.carry) === 0)
            creep.suicide();

          return;
        }
      }
    }

    // Fill up
    if(_.sum(creep.carry) === 0)
    {
      creep.memory.target = undefined;
      let target = Utils.withdrawTarget(creep, this)

      if (target)
      {
      if(!creep.pos.isNearTo(target))
        creep.pushyTravelTo(target);
      else
        creep.withdraw(target, RESOURCE_ENERGY);

        return
      }
      else
      {
        if(creep.room.controller && creep.room.controller.level < 8)
        {
          let sources = creep.room.find(FIND_SOURCES);
          let source = creep.pos.findClosestByPath(sources);
          if(source)
          {
            this.fork(HarvestProcess, 'harvest-' + creep.name, this.priority - 1, {
              creep: creep.name,
              source: source.id
            });

            return;
          }
          else
          {
            this.suspend = 10
            return
          }
        }
        else
        {
          this.suspend = 10
          return
        }
      }
    }


    if(room.controller?.level < 8)
    {
      const towers = this.kernel.data.roomData[this.metaData.roomName].towers;
      // If the creep has been refilled
      const repairableObjects = <RepairTarget[]>[].concat(
        <never[]>this.kernel.data.roomData[this.metaData.roomName].containers,
        <never[]>this.kernel.data.roomData[this.metaData.roomName].roads
      )

      if(towers.length === 0)
      {
        const repairTarget = _.min(repairableObjects, (ro) => ro.hits);

        if(repairTarget)
        {
          let enemies = repairTarget.room.find(FIND_HOSTILE_CREEPS);
          let inRangeEnemies = repairTarget.pos.findInRange(enemies, 4);

          if(inRangeEnemies.length === 0)
          {
            if(!creep.pos.inRangeTo(repairTarget, 3))
            {
              creep.travelTo(repairTarget, {range: 3});
            }
            else
            {
              let outcome = creep.repair(repairTarget);
              if(outcome === OK)
                creep.yieldRoad(repairTarget, true);
            }
          }
          else
          {
            if(creep.idleOffRoad(creep.room!.terminal!, false) === OK)
                this.suspend = 10;

            return;
          }
        }
      }
      else
      {
        const constructionSites = this.kernel.data.roomData[this.metaData.roomName].constructionSites;
        if(constructionSites.length)
        {
          const site = creep.pos.findClosestByPath(constructionSites);
          if(!creep.pos.inRangeTo(site, 3))
            creep.travelTo(site, {range: 3});
          else
            creep.build(site);

          return;
        }
      }
    }
    else //////////// Rampart upgrading ///////////////////////
    {
      if(creep.name === 'sm-E47S46-23627651')
        console.log(this.name, 'Should be finding a rampart')

      let target: StructureRampart;

      if(creep.memory.target === undefined)
      {
        const ramparts = this.kernel.data.roomData[this.metaData.roomName].ramparts;
        if(ramparts.length)
        {

          const minRampart = _.min(ramparts, (r) => r.hits);
          if(this.metaData.upgrading)
          {
            if(minRampart)
            {
              creep.memory.target = minRampart.id;
              target = minRampart;
            }
          }
          else
          {
            if(minRampart?.hits < room.memory.rampartTarget)
            {
              creep.memory.target = minRampart.id;
              target = minRampart;
            }
          }
        }
      }
      else
      {
        target = Game.getObjectById(creep.memory.target);
        if(!creep.pos.inRangeTo(target, 3))
          creep.travelTo(target, {range: 3});
        else
        {
          let outcome = creep.repair(target);
          if(outcome === OK)
            creep.yieldRoad(target, true);
        }

        return;
      }
    }
  }
}
