import { LifetimeProcess } from "os/process";


export class HoldDistroLifetimeProcess extends LifetimeProcess
{
  type = 'holdDistrolf';
  metaData: HoldDistroLifetimeProcessMetaData;

  run()
  {
    let creep = this.getCreep();

    let flag = Game.flags[this.metaData.flagName];

    if(!flag)
    {
      this.completed = true;
      return;
    }

    if(!creep)
    {
      return;
    }

    if(Game.time % 10 === 5)
    {
      if(creep.room.name !== flag.pos.roomName)
      {
        /*let flagName = this.metaData.spawnRoom + "-Hold-" + creep.room.name;
        let travelFlag = Game.flags[flagName];
        if(travelFlag)
        {
          if(travelFlag.memory.enemies)
          {
            flag.memory.enemies = travelFlag.memory.enemies;
            flag.memory.timeEnemies = travelFlag.memory.timeEnemies;
          }
          else
          {
            let hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
            if(hostiles.length > 0)
            {
              flag.memory.enemies = travelFlag.memory.enemies = true;
              flag.memory.timeEnemies = travelFlag.memory.timeEnemies = hostiles[0].ticksToLive;
            }
          }
        }*/
      }
    }

    if(flag.memory.enemies)
    {
      let fleeFlag = Game.flags['RemoteFlee-'+this.metaData.spawnRoom];
      if(fleeFlag)
      {
        this.log('Flee Room');
        creep.travelTo(fleeFlag.pos);
        return;
      }
      else
      {
        creep.travelTo(RoomPosition(10,10, this.metaData.spawnRoom));
        return;
      }
    }

    if(_.sum(creep.carry) === 0 && creep.ticksToLive! > 100 && !flag.memory.enemies)
    {
      let sourceContainer = Game.getObjectById<StructureContainer>(this.metaData.sourceContainer);

      if(sourceContainer)
      {
        if(!creep.pos.inRangeTo(sourceContainer, 1))
        {
          if(creep.room.name === flag.room!.name)
          {
            creep.room.createConstructionSite(creep.pos, STRUCTURE_ROAD);
          }
          creep.travelTo(sourceContainer);
          return;
        }

        let resource = <Resource[]>sourceContainer.pos.lookFor(RESOURCE_ENERGY)
        if(resource.length > 0)
        {
          let withdrawAmount = creep.carryCapacity - _.sum(creep.carry) - resource[0].amount;

          if(withdrawAmount >= 0)
          {
            creep.withdraw(sourceContainer, RESOURCE_ENERGY, withdrawAmount);
          }

          creep.pickup(resource[0]);
          return;
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
          return;
        }
        else
        {
          this.suspend = 20;
          return;
        }
      }
    }

    if(this.kernel.data.roomData[this.metaData.spawnRoom].links.length > 0)
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

          if(creep.transfer(link, RESOURCE_ENERGY) == ERR_FULL)
          {
            return;
          }
        }
        else
        {
          let storage = creep.room.storage;
          if(storage)
          {
            if(!creep.pos.inRangeTo(storage,1))
            {
              if(!creep.fixMyRoad())
              {
                creep.travelTo(storage);
                return;
              }
            }

            if(creep.transfer(storage, RESOURCE_ENERGY) === ERR_FULL)
            {
              return;
            }
          }
          else
          {
            this.suspend = 2;
          }
        }
      }
      else
      {
        if(Game.rooms[this.metaData.spawnRoom].storage)
        {
          let target = Game.rooms[this.metaData.spawnRoom].storage;

          if(target)
          {
            if(!creep.pos.inRangeTo(target, 1))
            {
              if(!creep.fixMyRoad())
              {
                creep.travelTo(target);
              }
            }

            if(creep.transfer(target, RESOURCE_ENERGY) == ERR_FULL)
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

        if(target)
        {
          if(!creep.pos.inRangeTo(target, 1))
          {
            if(!creep.fixMyRoad())
            {
              creep.travelTo(target);
            }
          }

          if(creep.transfer(target, RESOURCE_ENERGY) == ERR_FULL)
          {
            return;
          }
        }
      }
    }
  }
}
