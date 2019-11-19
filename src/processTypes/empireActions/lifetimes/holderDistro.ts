import { LifetimeProcess } from "os/process";
import { TransferProcess } from "../transfer";


export class HoldDistroLifetimeProcess extends LifetimeProcess
{
  type = 'holdDistrolf';
  metaData: HoldDistroLifetimeProcessMetaData;

  run()
  {
    let creep = this.getCreep();

    const room = Game.rooms[this.metaData.remoteName];
    const  spawnName = this.metaData.spawnRoom;

    if(!creep)
    {
      return;
    }

    let fleeFlag = Game.flags['RemoteFlee-'+ this.metaData.spawnRoom];

    // Setup for road complete
    if(room.memory.roadComplete === undefined)
      room.memory.roadComplete = 0;

    if(Game.time % 10 === 5 && creep.room.name  !== spawnName)
    {
      let enemies = creep.room!.find(FIND_HOSTILE_CREEPS);

        enemies = _.filter(enemies, (e: Creep)=> {
          return (e.getActiveBodyparts(ATTACK) > 0 || e.getActiveBodyparts(RANGED_ATTACK) > 0);
        });

      if(enemies.length)
        room.memory.enemies = true;
      else
        room.memory.enemies = false;
    }

    if(room.memory.enemies)
    {
      if(_.sum(creep.carry) > 0)
      {
        let storage = Game.rooms[spawnName].storage;
        if(storage?.my)
        {
          if(!creep.pos.inRangeTo(storage, 1))
          {
            if(!creep.fixMyRoad())
            {
              creep.travelTo(storage);
              return;
            }
          }

          creep.transfer(storage, RESOURCE_ENERGY);
          return;
        }
      }
      else
      {

        if(fleeFlag)
        {
          if(!creep.pos.inRangeTo(fleeFlag, 5))
          {
            creep.travelTo(fleeFlag.pos);
          }
          else
          {
            if(creep.ticksToLive < 50)
              creep.suicide();
          }
          return;
        }
        else
        {
          console.log(this.name, 'Need remote flee flag')
          return;
        }
      }
    }

    let sourceContainer = Game.getObjectById<StructureContainer>(this.metaData.sourceContainer);
    if(sourceContainer)
    {
      if(_.sum(creep.carry) === 0 && creep.ticksToLive! > 100)
      {
        const sources = this.kernel.data.roomData[room.name].sources;
        if(!creep.pos.inRangeTo(sourceContainer, 1) && _.sum(sourceContainer.store) > creep.carryCapacity * .5)
        {
          if(creep.room.name === room?.name)
          {
            if(room.memory.roadComplete < sources.length)
            {
              creep.room.createConstructionSite(creep.pos, STRUCTURE_ROAD);
            }
          }

          creep.travelTo(sourceContainer);
          return;
        }
        else
        {
          //console.log(this.name, 'Sitting');
          if(room.memory.roadComplete < sources.length)
            room.memory.roadComplete++;
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
        }
        else if(sourceContainer.store.energy > creep.carryCapacity)
        {
          creep.withdraw(sourceContainer, RESOURCE_ENERGY);
          return;
        }
        else if(room.storage?.store.getUsedCapacity() > 0)
        {
          let storage = room.storage;
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
          if(creep.room.name === this.metaData.spawnRoom)
          {
            if(fleeFlag && !creep.pos.inRangeTo(fleeFlag, 4))
            {
              creep.travelTo(fleeFlag);
              return;
            }
          }
          this.suspend = 20;
          return;
        }
      }
      else if(_.sum(creep.carry) === 0 && creep.room.name !== this.metaData.spawnRoom)
      {
        if(creep.pos.isNearTo(sourceContainer))
        {
          creep.withdraw(sourceContainer, RESOURCE_ENERGY);
          return;
        }
      }
    }

    if(this.kernel.data.roomData[this.metaData.spawnRoom])
    {
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
        if(Game.rooms[this.metaData.spawnRoom].storage.my)
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

      if(_.sum(creep.carry) === 0 && creep.ticksToLive <= 100)
      {
        let container = this.kernel.data.roomData[this.metaData.spawnRoom].generalContainers[0];
        if(container)
        {
          if(creep.pos.inRangeTo(container, 0))
            creep.suicide();

          creep.travelTo(container);
          return;
        }
      }
    }
  }
}
