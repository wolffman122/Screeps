import { LifetimeProcess } from "os/process";


export class HoldDistroLifetimeProcess extends LifetimeProcess
{
  type = 'holdDistrolf';

  run()
  {
    let creep = this.getCreep();

    if(!creep)
    {
      return;
    }

    if(_.sum(creep.carry) === 0 && creep.ticksToLive > 100)
    {
      let sourceContainer = <Container>Game.getObjectById(this.metaData.sourceContainer);

      if(!creep.pos.inRangeTo(sourceContainer, 1))
      {
        creep.travelTo(sourceContainer);
        return;
      }
      else
      {
        let resource = <Resource[]>sourceContainer.pos.lookFor(RESOURCE_ENERGY)
        if(resource.length > 0)
        {
          let withdrawAmount = creep.carryCapacity - _.sum(creep.carry) - resource[0].amount;

          if(withdrawAmount >= 0)
          {
            creep.withdraw(sourceContainer, RESOURCE_ENERGY, withdrawAmount);
          }

          creep.pickup(resource[0]);
          /*creep.pickup(resource[0]);

          let remainingRoom = creep.carryCapacity - resource[0].amount

          if(sourceContainer.store.energy > remainingRoom)
          {
            creep.withdraw(sourceContainer, RESOURCE_ENERGY)
          }
          else
          {
            this.suspend = 10;
          }*/
        }
        else if(sourceContainer.store.energy > creep.carryCapacity)
        {
          creep.withdraw(sourceContainer, RESOURCE_ENERGY);
        }
        else
        {
          this.log('Suspend');
          this.suspend = 20;
        }
      }
    }

    if(this.kernel.data.roomData[this.metaData.spawnRoom].links.length > 0)
    {
      if(creep.pos.roomName != this.metaData.spawnRoom)
      {
        if(!creep.fixMyRoad())
        {
          let rName: string = this.metaData.spawnRoom;
          creep.travelTo(new RoomPosition(25,25, rName), {range: 24})
        }

      }
      else
      {
        let links = this.kernel.data.roomData[this.metaData.spawnRoom].links

        links = creep.pos.findInRange(links, 6);
        links = _.filter(links, (l) => {
          return (l.energy == 0 || l.cooldown == 0);
        });

        if(links.length > 0)
        {
          let link = creep.pos.findClosestByPath(links);

          if(link.energy < link.energyCapacity)
          {
            if(!creep.pos.inRangeTo(link, 1))
            {
              if(!creep.fixMyRoad())
              {
                creep.travelTo(link);
              }
            }

            if(creep.transfer(link, (this.metaData.resource || RESOURCE_ENERGY)) == ERR_FULL)
            {
              return;
            }
          }
          else
          {
            this.suspend = 2;
          }
        }
        else
        {
          if(Game.rooms[this.metaData.spawnRoom].storage)
          {
            let target = Game.rooms[this.metaData.spawnRoom].storage;

            if(!creep.pos.inRangeTo(target, 1))
            {
              if(!creep.fixMyRoad())
              {
                creep.travelTo(target);
              }
            }

            if(creep.transfer(target, (this.metaData.resource || RESOURCE_ENERGY)) == ERR_FULL)
            {
              return;
            }
          }
        }
      }
    }
    else
    {
      // creep is filled
      if(Game.rooms[this.metaData.spawnRoom].storage)
      {
        let target = Game.rooms[this.metaData.spawnRoom].storage;

        if(!creep.pos.inRangeTo(target, 1))
        {
          if(!creep.fixMyRoad())
          {
            creep.travelTo(target);
          }
        }

        if(creep.transfer(target, (this.metaData.resource || RESOURCE_ENERGY)) == ERR_FULL)
        {
          return;
        }
      }
    }
  }
}
