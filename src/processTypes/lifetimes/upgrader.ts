import {LifetimeProcess} from '../../os/process'
import {Utils} from '../../lib/utils'

import {CollectProcess} from '../creepActions/collect'
import {UpgradeProcess} from '../creepActions/upgrade'
import { LABDISTROCAPACITY } from '../management/lab';
import { LabDistroLifetimeProcess } from './labDistro';

export class UpgraderLifetimeProcess extends LifetimeProcess{
  type = 'ulf'
  metaData: UpgradeLifetimeProcessMetaData;

  run(){
    let creep = this.getCreep()

    if(!creep){ return }

    if((this.kernel.data.roomData[creep.room!.name].labs.length === 0) || (creep.room.controller && creep.room.controller.level < 6))
    {
      this.metaData.boosts = undefined;
    }


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

    if(_.sum(creep.carry) === 0){
      /*let targets = <DeliveryTarget[]>[].concat(
        <never[]>this.kernel.data.roomData[creep.room.name].generalContainers
      )

      let capacity = creep.carryCapacity

      targets = _.filter(targets, function(target){
          return (target.store.energy > capacity)
      })

      if(targets.length > 0){*/
        //let target = creep.pos.findClosestByPath(targets)
        if(this.kernel.data.roomData[creep.pos.roomName].controllerLink)
        {
          let controllerLink = this.kernel.data.roomData[creep.pos.roomName].controllerLink

          if(controllerLink && controllerLink.energy > 500)
          {
            this.fork(CollectProcess, 'collect-' + creep.name, this.priority - 1, {
              target: controllerLink.id,
              creep: creep.name,
              resource: RESOURCE_ENERGY
            });

            return;
          }
          else
          {
            let target = Utils.withdrawTarget(creep, this);

            this.fork(CollectProcess, 'collect-' + creep.name, this.priority - 1, {
              target: target.id,
              creep: creep.name,
              resource: RESOURCE_ENERGY
            });

            return;
          }
        }

        if(this.kernel.data.roomData[creep.room.name].controllerContainer)
        {
          let controller = creep.room.controller;
          if(controller)
          {
            let sign = controller.sign;
            if(sign && sign.username !== "wolffman122")
            {
              if(creep.pos.isNearTo(controller))
              {
                creep.signController(controller, "[YP] Territory");
                return;
              }

              creep.travelTo(controller);
              return;
            }

          }
          let target = this.kernel.data.roomData[creep.room.name].controllerContainer;

          if(target)
          {
            if(creep.pos.isNearTo(target))
            {
              creep.withdraw(target, RESOURCE_ENERGY);
            }
            else
            {
              creep.travelTo(target);
              return;
            }
          }
        }
        else
        {
          let target = Utils.withdrawTarget(creep, this);

          this.fork(CollectProcess, 'collect-' + creep.name, this.priority - 1, {
            target: target.id,
            creep: creep.name,
            resource: RESOURCE_ENERGY
          })

          return
        }
     // }
    }

    // If the creep has been refilled
    if (!creep.pos.inRangeTo(creep.room.controller!, 3)){
      creep.travelTo(creep.room.controller!, {range: 3});
    }else{
      creep.upgradeController(creep.room.controller!);

      if(_.sum(creep.carry) <= creep.getActiveBodyparts(WORK))
      {
        let target = this.kernel.data.roomData[creep.room.name].controllerContainer;

        if(target)
        {
          if(creep.pos.isNearTo(target))
          {
            creep.withdraw(target, RESOURCE_ENERGY);
          }
        }
      }
    }
  }
}
