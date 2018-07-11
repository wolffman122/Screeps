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

    if(creep.name === 'em-u-E45S48-10023612')
    {
      this.log('Found Creeeeeep')
    }

    if((this.kernel.data.roomData[creep.room!.name].labs.length === 0) || (creep.room.controller && creep.room.controller.level < 6))
    {
      this.metaData.boosts = undefined;
    }

    if(this.metaData.boosts)
    {
      console.log(this.name, "boost start !!!!!!!!!1", this.metaData.boosts)
      let boosted = true;
      for(let boost of this.metaData.boosts)
      {
        console.log(this.name, 'boost 2');
        if(creep.memory[boost])
        {
          console.log(this.name, 'boost 3')
          continue;
        }

        console.log(this.name, 'boost 4')
        let room = Game.rooms[this.metaData.roomName];

        if(room)
        {
          console.log(this.name, 'boost 5')
          let requests = room.memory.boostRequests;
          if(!requests)
          {
            console.log(this.name, 'boost 6')
            creep.memory[boost] = true;
            continue;
          }

          console.log(this.name, 'boost 7')
          if(!requests[boost])
          {
            console.log(this.name, 'boost 8')
            requests[boost] = { flagName: undefined, requesterIds: [] };
          }

          // check if already boosted
          let boostedPart = _.find(creep.body, {boost: boost});
          if(boostedPart)
          {
            console.log(this.name, 'boost 9')
            creep.memory[boost] = true;
            requests[boost].requesterIds = _.pull(requests[boost].requesterIds, creep.id);
            continue;
          }

          console.log(this.name, 'boost 10')
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
            console.log(this.name, 'boost 11')
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
            this.fork(CollectProcess, 'collect-' + creep.name, this.priority - 1, {
              target: target.id,
              creep: creep.name,
              resource: RESOURCE_ENERGY
            });
          }

          return;
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
      creep.travelTo(creep.room.controller!);
    }else{
      creep.upgradeController(creep.room.controller!);
    }
  }
}
