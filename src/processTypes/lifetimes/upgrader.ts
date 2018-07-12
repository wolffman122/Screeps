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

    if(this.metaData.boosts && this.metaData.allowUnboosted !== undefined)
    {
      if(creep.boostRequest(this.metaData.boosts, this.metaData.allowUnboosted) == OK)
      {
        this.metaData.boosts = undefined;
      }
      else
      {
        return;
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
