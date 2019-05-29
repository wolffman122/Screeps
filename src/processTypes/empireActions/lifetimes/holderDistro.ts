import { LifetimeProcess } from "os/process";
import { TransferProcess } from "../transfer";
import { DeliverProcess } from "../../creepActions/deliver";


export class HoldDistroLifetimeProcess extends LifetimeProcess
{
  type = 'holdDistrolf';
  metaData: HoldDistroLifetimeProcessMetaData;

  run()
  {
    let creep = this.getCreep();

    let flag = Game.flags[this.metaData.flagName];
    let spawnName = flag.name.split('-')[0];
    if(!flag)
    {
      this.completed = true;
      return;
    }

    if(!creep)
    {
      return;
    }

    // Setup for road complete
    if(flag.memory.roadComplete === undefined)
      flag.memory.roadComplete = 0;

    if(Game.time % 10 === 5 && creep.room.name  !== spawnName)
    {
      let enemies = creep.room!.find(FIND_HOSTILE_CREEPS);

      enemies = _.filter(enemies, (e: Creep)=> {
        return (e.getActiveBodyparts(ATTACK) > 0 || e.getActiveBodyparts(RANGED_ATTACK) > 0);
      });

      if(enemies.length > 0)
      {
        flag.memory.enemies = true;
        if(!flag.memory.timeEnemies)
        {
          flag.memory.timeEnemies = Game.time;
        }
      }
    }

    if(flag.memory.enemies)
    {
      if(_.sum(creep.carry) > 0)
      {
        let storage = Game.rooms[spawnName].storage;
        if(storage)
        {
          this.fork(DeliverProcess, 'deliver-' + creep.name, this.priority -1,{
            creep: creep.name,
            target: storage,
            resource: RESOURCE_ENERGY
          })
        }
      }
      else
      {
        let fleeFlag = Game.flags['RemoteFlee-'+this.metaData.spawnRoom];
        if(fleeFlag)
        {
          if(!creep.pos.inRangeTo(fleeFlag, 5))
          {
            creep.travelTo(fleeFlag.pos);
          }
          else
          {
            creep.suicide();
          }
          return;
        }
        else
        {
          creep.suicide();
          return;
        }
      }
    }

    if(_.sum(creep.carry) === 0 && creep.ticksToLive! > 100 && !flag.memory.enemies)
    {
      let sourceContainer = Game.getObjectById<StructureContainer>(this.metaData.sourceContainer);

      if(sourceContainer)
      {
        const sources = this.kernel.data.roomData[flag.pos.roomName].sources;
        if(!creep.pos.inRangeTo(sourceContainer, 1) && _.sum(sourceContainer.store) > creep.carryCapacity * .8)
        {
          if(creep.room.name === flag.room!.name)
          {

            if(flag.memory.roadComplete < sources.length)
            {
              creep.room.createConstructionSite(creep.pos, STRUCTURE_ROAD);
            }
          }

          creep.travelTo(sourceContainer);
          return;
        }
        else
        {
          if(flag.memory.roadComplete < sources.length)
            flag.memory.roadComplete++;
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
        else if(flag.room.storage && _.sum(flag.room.storage.store) > 0)
        {
          let storage = flag.room.storage;
          if(creep.pos.isNearTo(storage))
          {
            creep.withdrawEverything(storage);
            return;
          }
          else
          {
            creep.travelTo(storage);
            return;
          }
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

      links = creep.pos.findInRange(links, 8);
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
            this.suspend = 2;
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
            let target = this.kernel.data.roomData[this.metaData.spawnRoom].generalContainers[0];
            if(target)
            {
              if(creep.pos.isNearTo(target))
              {
                creep.transfer(target, RESOURCE_ENERGY);
                return;
              }

              creep.travelTo(target, {range: 1});
              return;
            }
            else
            {
              this.suspend = 2;
            }
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
        else
        {
          let target = this.kernel.data.roomData[this.metaData.spawnRoom].generalContainers[0];
          if(target)
          {
            if(creep.pos.isNearTo(target))
            {
              creep.transfer(target, RESOURCE_ENERGY);
              return;
            }

            creep.travelTo(target, {range: 1});
            return;
          }
          else
          {
            this.suspend = 2;
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
      else if (this.kernel.data.roomData[this.metaData.spawnRoom].generalContainers.length)
      {
        let target = this.kernel.data.roomData[this.metaData.spawnRoom].generalContainers[0];

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
