import {LifetimeProcess} from '../../os/process'
import {Utils} from '../../lib/utils'
import { LABDISTROCAPACITY } from '../management/lab';

export class UpgraderLifetimeProcess extends LifetimeProcess{
  type = 'ulf'
  metaData: UpgradeLifetimeProcessMetaData;

  run(){
    let creep = this.getCreep()

    if(!creep){ return }
    if(creep.room.memory.shutdown)
    {
      this.completed = true;
      return;
    }

    if(!creep.memory.boost && this.metaData.boosts)
    {
      if(creep.room.name === 'E41S32' || creep.room.name === 'E45S57')
      {
        console.log(this.name, 2, this.metaData.allowUnboosted)
        creep.memory.boost = true;
      }
      creep.boostRequest(this.metaData.boosts, this.metaData.allowUnboosted);
      return;
    }

    if(_.sum(creep.carry) === 0)
    {
      let controllerLink = this.kernel.data.roomData[creep.pos.roomName].controllerLink;

      if(controllerLink)
      {
        if(controllerLink && controllerLink.energy > 500)
        {
          if(!creep.pos.isNearTo(controllerLink))
            creep.travelTo(controllerLink);
          else
            creep.withdraw(controllerLink, RESOURCE_ENERGY);

          return;
        }
      }

      if(this.kernel.data.roomData[creep.room.name].controllerContainer)
      {
        if(creep.name === 'em-u-E39S35-23510934')
          console.log(this.name, 1);
        let controller = creep.room.controller;
        if(controller?.sign?.username !== "wolffman122")
        {
          if(creep.name === 'em-u-E39S35-23510934')
          console.log(this.name, 2)
          if(creep.pos.isNearTo(controller))
          {
            creep.signController(controller, "[YP] Territory");
            return;
          }

          creep.travelTo(controller);
          return;
        }

        let target = this.kernel.data.roomData[creep.room.name].controllerContainer;

        if(creep.name === 'em-u-E39S35-23510934')
          console.log(this.name, 3)
        if(target)
        {
          if(creep.name === 'em-u-E39S35-23510934')
          console.log(this.name, 4)
          if(this.metaData.openSpaces === undefined)
          {
            if(creep.name === 'em-u-E39S35-23510934')
          console.log(this.name, 5)
            const openSpaces = target.pos.openAdjacentSpots(false);
            let flag = Game.flags['Center-' + this.metaData.roomName];
            let maxDistance = 0;
            let position = flag.pos;
            _.forEach(openSpaces, (os) =>{
              let range = flag.pos.getRangeTo(os);
              if(range > maxDistance)
              {
                maxDistance = range;
                position = os;
              }
            })

            this.metaData.openSpaces = position;
          }
          else
          {
            if(this.metaData.roomName === 'E41S32')
              console.log(this.name, 'Location', this.metaData.openSpaces.x, this.metaData.openSpaces.y);
              if(creep.name === 'em-u-E39S35-23510934')
              console.log(this.name, 6)

            let pos = new RoomPosition(this.metaData.openSpaces.x, this.metaData.openSpaces.y, this.metaData.roomName);
            if(creep.pos.isEqualTo(pos))
            {
              creep.withdraw(target, RESOURCE_ENERGY);
            }
            else
            {
              const look = pos.look();
              _.forEach(look, (l) => {
              if(l.type === LOOK_CREEPS)
                this.metaData.openSpaces = undefined;
              })

              creep.travelTo(pos);
              return;
            }
          }
        }
      }
      else // No controller contianer
      {
        let strSay = '🔼';
        let target = Utils.withdrawTarget(creep, this);

        if(!creep.pos.isNearTo(target))
            creep.travelTo(target);
        else
        {
          creep.withdraw(target, RESOURCE_ENERGY);
          strSay += '🏧';
        }

        creep.say(strSay);
        return
      }
    }

    // If the creep has been refilled
    if (!creep.pos.inRangeTo(creep.room.controller!, 3)){
      creep.travelTo(creep.room.controller!, {range: 3});
    }else
    {
      let strSay = '🔼';
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
            strSay += '🏧';
            creep.withdraw(target, RESOURCE_ENERGY);
          }
        }
      }

      creep.say(strSay);
    }
  }
}
