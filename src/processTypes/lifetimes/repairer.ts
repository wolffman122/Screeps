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

    if(creep.room.name === 'E41S32')
    {
        console.log(this.name, 0.1, this.metaData.boosts, creep.memory.boost)
    }
    let room = Game.rooms[this.metaData.roomName];

    if(this.metaData.boosts && !creep.memory.boost)
    {
      if(creep.name === 'sm-E41S32-25419534')
        console.log(this.name, 0.11)
      creep.boostRequest(this.metaData.boosts, false);
      return;
    }

    if(creep.name === 'sm-E41S32-25419534')
        console.log(this.name, 0.2)
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

    if(creep.name === 'sm-E41S32-25419534')
        console.log(this.name, 0.3)
    // Fill up
    if(_.sum(creep.carry) === 0)
    {
      if(creep.name === 'sm-E41S32-25419534')
        console.log(this.name, 'filling', 1)
      creep.memory.target = undefined;
      let target = Utils.withdrawTarget(creep, this)

      if (target)
      {
        if(creep.name === 'sm-E41S32-25419534')
        console.log(this.name, 'filling', 2)
      if(!creep.pos.isNearTo(target))
        creep.pushyTravelTo(target);
      else
        creep.withdraw(target, RESOURCE_ENERGY);

        return
      }
      else
      {
        if(creep.name === 'sm-E41S32-25419534')
        console.log(this.name, 'filling', 3)
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
      let target: ConstructionSite|StructureRampart;;
      const rampartSites = this.kernel.data.roomData[this.metaData.roomName].constructionSites.filter(cs => cs.structureType === STRUCTURE_RAMPART);
      if(rampartSites.length)
      {
        const site = creep.pos.findClosestByPath(rampartSites);
        if(creep.memory.target === undefined)
        {
          creep.memory.target = site.id;
          target = site;
        }
      }
      if(creep.name === 'sm-E41S32-25419534')
        console.log(this.name, 'Should be finding a rampart', creep.memory.target, this.metaData.upgrading)



      if(creep.memory.target === undefined)
      {
        if(creep.name === 'sm-E41S32-25419534')
          console.log(this.name, 1);
        const ramparts = this.kernel.data.roomData[this.metaData.roomName].ramparts;
        if(ramparts.length)
        {
          if(creep.name === 'sm-E41S32-25419534')
          console.log(this.name, 2)
          const minRampart = _.min(ramparts, (r) => r.hits);
          creep.memory.target = minRampart.id;
          target = minRampart;
        }
      }
      else
      {
        if(creep.name === 'sm-E41S32-25419534')
          console.log(this.name, 3)
        target = Game.getObjectById(creep.memory.target);
        if(target)
        {
          if(!creep.pos.inRangeTo(target, 3))
            creep.travelTo(target, {range: 3});
          else
          {
            let outcome: number;
            if(target instanceof StructureRampart)
              outcome = creep.repair(target);
            else if(target instanceof ConstructionSite)
              if(creep.build(target) === OK)
              {
                creep.memory.target = undefined;
                return;
              }

            if(outcome === OK)
              creep.yieldRoad(target, true);
          }

          return;
        }
        else
          creep.memory.target = undefined;
      }
    }
  }
}
