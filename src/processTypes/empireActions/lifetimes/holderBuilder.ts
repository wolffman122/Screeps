import { LifetimeProcess } from "os/process";
import { HarvestProcess } from "processTypes/creepActions/harvest";
import { MoveProcess } from "../../creepActions/move";


export class HoldBuilderLifetimeProcess extends LifetimeProcess {
  type = 'holdBuilderlf';
  metaData: HoldBuilderLifetimeProcessMetaData;

  run()
  {
    const flag = Game.flags[this.metaData.flagName];
    const creep = this.getCreep();
    const room = flag.room;
    const spawnRoom = Game.rooms[this.metaData.spawnRoomName];


    if (!creep || !flag) {
      this.completed = true;
      return;
    }

    if(creep.store.getUsedCapacity() === 0 && creep.room.name === spawnRoom.name)
    {
      const storage = spawnRoom.storage;
      if(storage?.store.getUsedCapacity(RESOURCE_ENERGY) >= creep.store.getCapacity())
      {
        if(!creep.pos.isNearTo(storage))
          creep.travelTo(storage);
        else
          creep.withdraw(storage, RESOURCE_ENERGY);

        return;
      }
    }

    if(!room)
    {
      creep.travelTo(flag);
      return;
    }
    else
    {
      if(creep.store.getFreeCapacity() === 0)
      {
        creep.memory.filling = false;
        creep.memory.target = undefined;
      }

      // Empty creep
      if(creep.store.getUsedCapacity() === 0 || creep.memory.filling)
      {
        creep.memory.filling = true;
        if(creep.memory.target === undefined)
        {
          const containers = this.roomInfo(room.name).sourceContainers.filter(c => c.store.getUsedCapacity(RESOURCE_ENERGY) >= creep.store.getCapacity());
          const sources = this.roomInfo(room.name).sources.filter(s => s.energy > 0);
          if(containers.length)
          {
            const container = creep.pos.findClosestByPath(containers);
            creep.memory.target = container.id;
          }
          else if(sources.length)
          {
            const source = creep.pos.findClosestByPath(sources);
            creep.memory.target = source.id;
          }
        }
        else
        {
          const target = Game.getObjectById(creep.memory.target);
          if(target instanceof StructureContainer)
          {
            if(!creep.pos.isNearTo(target))
              creep.travelTo(target);
            else
              creep.withdraw(target, RESOURCE_ENERGY);
          }
          else if(target instanceof Source)
          {
            if(!creep.pos.isNearTo(target))
              creep.travelTo(target);
            else
              creep.harvest(target);
          }
          else
            creep.memory.target = undefined;
        }
      }
      else
      {
        if (creep.name === 'hrm-build-E27S28-27937946')
          console.log(this.name, 1);

        const constructionSites = this.roomInfo(room.name).constructionSites;
        if(creep.name === 'hrm-build-E26S28-27705127')
          console.log(this.name, 1, constructionSites.length);
        if(constructionSites.length)
        {
          const site = creep.pos.findClosestByPath(constructionSites);

          if(site)
          {
            creep.memory.target = site.id;

            if(!creep.pos.inRangeTo(site, 3))
              creep.travelTo(site, {range: 3});
            else
              creep.build(site);
          }
          else
          {
            creep.travelTo(flag);
            return;
          }
        }
        else if(creep.room.name === room.name)
        {
          let sources = this.kernel.data.roomData[flag.room.name].sources;
          let sourceContainersMaps = this.kernel.data.roomData[flag.room.name].sourceContainerMaps;

          if (sources.length)
          {
            let missingConatiners = sources.filter(s => {
              return (!sourceContainersMaps[s.id])
            });

            if (missingConatiners.length)
            {
              let openSpaces = missingConatiners[0].pos.openAdjacentSpots(true);
              if (openSpaces.length)
              {
                let clearConstruction = false;
                let openSpace = openSpaces[0];
                const look = openSpace.look();
                _.forEach(look, (l) => {
                  if (LOOK_CONSTRUCTION_SITES === l.type)
                    clearConstruction = true;
                });

                if (clearConstruction)
                {
                  creep.travelTo(openSpace);
                  return;
                }

                missingConatiners[0].room.createConstructionSite(openSpace.x, openSpace.y, STRUCTURE_CONTAINER);
              }
            }
          }
        }
        else
          creep.travelTo(flag);
          
      }
    }
  }
}
