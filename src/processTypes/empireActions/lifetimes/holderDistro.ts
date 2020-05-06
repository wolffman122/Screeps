import { LifetimeProcess } from "os/process";
import { TransferProcess } from "../transfer";


export class HoldDistroLifetimeProcess extends LifetimeProcess
{
  type = 'holdDistrolf';
  metaData: HoldDistroLifetimeProcessMetaData;

  run()
  {
    const creep = this.getCreep();

    const flag = Game.flags[this.metaData.flagName];
    if(!flag)
    {
      this.completed = true;
      return;
    }

    const spawnName = flag.name.split('-')[0];
    const spawnRoom = Game.rooms[spawnName];
    const mineRoom = flag.room;

    if(!creep)
    {
      return;
    }

    const fleeFlag = Game.flags['RemoteFlee-'+this.metaData.spawnRoom];

    // Setup for road complete
    if(flag.memory.enemies)
    {
      if(_.sum(creep.carry) > 0)
      {
        const storage = spawnRoom.storage;
        if(storage)
        {
          if(!creep.pos.inRangeTo(storage, 1))

            creep.travelTo(storage);
          else
            creep.transfer(storage, RESOURCE_ENERGY);

          return;
        }
      }
      else
      {
        if(fleeFlag)
        {
          if(!creep.pos.inRangeTo(fleeFlag, 5))
            creep.travelTo(fleeFlag.pos);

          return;
        }
        else
        {
          console.log(this.name, 'Need remote flee flag')
          return;
        }
      }
    }

    const sourceContainer = Game.getObjectById<StructureContainer>(this.metaData.sourceContainer);
    if(sourceContainer)
    {
      if(creep.store.getUsedCapacity() === 0 && creep.ticksToLive! > 100)
      {
        if(!creep.pos.inRangeTo(sourceContainer, 1))
        {
          // Test code
          if(mineRoom.name === 'E44S49' || mineRoom.name === 'E49S49')
          {
            let holdData: HoldRoomData;
            if(!flag.memory.holdData)
              flag.memory.holdData = {roads: {}, cores: false, enemies: false, roadComplete: false};
            else
              holdData = flag.memory.holdData;

            if(creep.room.name === mineRoom.name && !creep.pos.isNearTo(sourceContainer))
            {

              console.log(this.name, creep.name, 'Hold Data', !holdData.roads[sourceContainer.id]);
              let roomPositions: RoomPosition[] = [];
              if(!holdData.roads[sourceContainer.id])
              {
                console.log(this.name, 'Should not be running this code');
                const ret = PathFinder.search(creep.pos, sourceContainer.pos);
                if(!ret.incomplete)
                {
                  if(Object.keys(Game.constructionSites).length + ret.path.length < 100)
                  {
                    let allCreated = true;
                    for(let i = 0; i < ret.path.length; i++)
                      allCreated = allCreated && (mineRoom.createConstructionSite(ret.path[i], STRUCTURE_ROAD) === OK);

                    if(allCreated)
                      holdData.roads[sourceContainer.id] = true;
                  }
                }
              }
            }
            flag.memory.holdData = holdData;
          }

          creep.travelTo(sourceContainer);
          return;

        }

        const resource = <Resource[]>sourceContainer.pos.lookFor(RESOURCE_ENERGY)
        if(resource.length > 0)
        {
          let withdrawAmount = creep.store.getCapacity() - creep.store.getUsedCapacity() - resource[0].amount;

          if(withdrawAmount >= 0)
            creep.withdraw(sourceContainer, RESOURCE_ENERGY, withdrawAmount);

          creep.pickup(resource[0]);
          return;
        }
        else if(sourceContainer.store[RESOURCE_ENERGY] > creep.store.getCapacity())
        {
          creep.withdraw(sourceContainer, RESOURCE_ENERGY);
          return;
        }
        else if(flag.room.storage && flag.room.storage.store.getUsedCapacity() > 0)
        {
          const storage = flag.room.storage;
          if(!creep.pos.isNearTo(storage))
            creep.travelTo(storage);
          else
            creep.withdrawEverything(storage);

          return;
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
      else if(creep.store.getUsedCapacity() === 0 && creep.room.name !== this.metaData.spawnRoom)
      {
        if(creep.pos.isNearTo(sourceContainer))
          creep.withdraw(sourceContainer, RESOURCE_ENERGY);
      }
    }


    if(creep.store.getFreeCapacity() === 0 || creep.memory.full)
    {
      creep.memory.full = true;
      if(this.kernel.data.roomData[this.metaData.spawnRoom]?.links.length > 0)
      {
        let links = this.kernel.data.roomData[this.metaData.spawnRoom].links

        links = creep.pos.findInRange(links, 8, {filter: l => (l.store[RESOURCE_ENERGY] ?? 0) != 800});

        if(links.length > 0)
        {
          creep.say('L', true);
          const link = creep.pos.findClosestByPath(links);

          if(creep.room.name === 'E43S53')
            console.log(this.name, 'Link Distance', creep.room.memory.linkDistances[link.id]);

          if(!creep.pos.inRangeTo(link, 1))
          {
            if(!creep.fixMyRoad())
            {
              creep.travelTo(link);
            }
          }

          const linkDistance = creep.room.memory.linkDistances[link.id];
          if(link.cooldown < (linkDistance * 1.8))
          {}

          if(creep.transfer(link, RESOURCE_ENERGY) == ERR_FULL)
            this.suspend = 2;

            if(creep.store.getUsedCapacity() === 0)
              creep.memory.full = false;
          return;
        }
      }

      const storage = spawnRoom.storage;
      if(storage)
      {
        creep.say('S', true);
        if(!creep.pos.inRangeTo(storage,1))
        {
          if(!creep.fixMyRoad())
          {
            creep.travelTo(storage);
          }
        }
        else
        {
          creep.transfer(storage, RESOURCE_ENERGY);
          creep.memory.full = false;
        }

        return;
      }

      const target = this.kernel.data.roomData[this.metaData.spawnRoom].generalContainers[0];
      if(target)
      {
        creep.say('C', true);
        if(!creep.pos.isNearTo(target))
        {
          if(!creep.fixMyRoad())
            creep.travelTo(target, {range: 1});
        }
        else
        {
          creep.transfer(target, RESOURCE_ENERGY);
          creep.memory.full = false;
        }

        return;
      }

      this.suspend = 2;
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

