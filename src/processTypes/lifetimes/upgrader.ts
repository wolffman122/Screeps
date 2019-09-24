import {LifetimeProcess} from '../../os/process'
import {Utils} from '../../lib/utils'
import { LABDISTROCAPACITY } from '../management/lab';

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

    if(creep.name === 'em-u-E39S35-13761633')
      console.log(this.name, 'problem')

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

          if(room.name === 'E55S48')
          {
            console.log(this.name, 'upgrade 1')
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
          let terminal = flag.room!.terminal;

          if(room.name === 'E55S48')
          {
            console.log(this.name, 'upgrade')
          }
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
          else if(this.metaData.allowUnboosted && terminal && (terminal.store[boost] === undefined || terminal.store[boost] < LABDISTROCAPACITY))
          {
            console.log("BOOST: no boost for", creep.name, " so moving on (alloweUnboosted = true)", boost, terminal, terminal.store[boost]);
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

    if(_.sum(creep.carry) === 0)
    {
      let controllerLink = this.kernel.data.roomData[creep.pos.roomName].controllerLink;

      if(controllerLink)
      {
        if(creep.name === 'em-u-E55S47-20887403')
          console.log(this.name, 'Controller link', 1)
        if(controllerLink && controllerLink.energy > 500)
        {
          if(creep.name === 'em-u-E55S47-20887403')
          console.log(this.name, 'Controller link', 2)
          if(!creep.pos.isNearTo(controllerLink))
            creep.travelTo(controllerLink);
          else
            creep.withdraw(controllerLink, RESOURCE_ENERGY);

            if(creep.name === 'em-u-E55S47-20887403')
            console.log(this.name, 'Controller link', 3)
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

        if(!creep.pos.isNearTo(target))
            creep.travelTo(target);
          else
            creep.withdraw(target, RESOURCE_ENERGY);

        return
      }
    }

    // If the creep has been refilled
    if (!creep.pos.inRangeTo(creep.room.controller!, 3)){
      creep.travelTo(creep.room.controller!, {range: 3});
    }else{
      creep.upgradeController(creep.room.controller!);

      if(_.sum(creep.carry) <= creep.getActiveBodyparts(WORK))
      {
        let target;

        if(this.roomData().controllerLink && this.roomData().controllerLink.energy >= creep.carryCapacity)
          target = this.roomData().controllerLink;
        else if (this.roomData().controllerContainer)
          target = this.roomData().controllerContainer;

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
