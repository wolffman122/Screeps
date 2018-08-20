import { LifetimeProcess } from "os/process";
import { HarvestProcess } from "../creepActions/harvest";
import { BuildProcess } from "../creepActions/build";
import { UpgradeProcess } from "../creepActions/upgrade";
import { LABDISTROCAPACITY } from "../management/lab";
import { LabDistroLifetimeProcess } from "./labDistro";
import { Utils } from "lib/utils";

export class HelperLifetimeProcess extends LifetimeProcess
{
    type = 'hlp';
    metaData: HelperLifetimeProcessMetaData;

    run()
    {
      let creep = this.getCreep()
      let flag = Game.flags[this.metaData.flagName];

      if(!flag || !creep)
      {
        this.completed = true;
        return;
      }

      console.log(this.name, creep.pos.roomName, creep.pos.x, creep.pos.y);

      if(this.metaData.boosts)
      {
        let boosted = true;
        for(let boost of this.metaData.boosts)
        {
          if(creep.memory[boost])
          {
            continue;
          }

          let room = Game.rooms[creep.pos.roomName];

          if(room)
          {
            let requests = room.memory.boostRequests;
            if(!requests)
            {
              creep.memory[boost] = true;
              continue;
            }

            if(!requests[boost])
            {
              requests[boost] = { flagName: undefined, requesterIds: [] };
            }

            // check if already boosted
            let boostedPart = _.find(creep.body, {boost: boost});
            if(boostedPart)
            {
              creep.memory[boost] = true;
              requests[boost!].requesterIds = _.pull(requests[boost].requesterIds, creep.id);
              continue;
            }

            boosted = false;
            if(!_.include(requests[boost].requesterIds, creep.id))
            {
              requests[boost].requesterIds.push(creep.id);
            }

            if(creep.spawning)
              continue;

            let flag = Game.flags[requests[boost].flagName!];
            if(!flag)
            {
              continue;
            }

            let lab = flag.pos.lookForStructures(STRUCTURE_LAB) as StructureLab;

            if(lab.mineralType === boost && lab.mineralAmount >= LABDISTROCAPACITY && lab.energy >= LABDISTROCAPACITY)
            {
              if(creep.pos.isNearTo(lab))
              {
                lab.boostCreep(creep);
              }
              else
              {
                creep.travelTo(lab);
                return;
              }
            }
            else if(this.metaData.allowUnboosted)
            {
              console.log("BOOST: no boost for", creep.name, " so moving on (alloweUnboosted = true)");
              requests[boost].requesterIds = _.pull(requests[boost].requesterIds, creep.id);
              creep.memory[boost] = true;
              return;
            }
            else
            {
              if(Game.time % 10 === 0)
                console.log("BOOST: no boost for", creep.name);
                creep.idleOffRoad(creep.room!.storage!, false);
              return;
            }
          }
        }
      }

      /*if(_.sum(creep.carry) === 0 && creep.room.storage && creep.room.storage.my && creep.room.storage.store.energy >= creep.carryCapacity)
      {
        if(creep.pos.isNearTo(creep.room.storage))
        {
          creep.withdraw(creep.room.storage, RESOURCE_ENERGY);
          return;
        }

        creep.travelTo(creep.room.storage);
        return;
      }*/

      let controller = flag.room!.controller;
      if(controller)
      {
        if(creep.room.name !== controller.room.name)
        {
          console.log(this.name, this.metaData.source);
          creep.travelTo(flag, { preferHighway: true});
          return;
        }

        if(_.sum(creep.carry) === 0 && creep.ticksToLive! > 100)
        {
          console.log(this.name, this.metaData.source);
          this.fork(HarvestProcess, 'harvest-' + creep.name, this.priority-1, {
            source: this.metaData.source,
            creep: creep.name
          })
        }

        if(!creep.pos.inRangeTo(controller, 3))
        {
          creep.travelTo(controller, { range: 3 });
        }
        else
        {
          creep.upgradeController(controller);
        }
      }
    }
}
