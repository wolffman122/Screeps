import { LifetimeProcess } from "os/process";

export class HoldHarvesterOptLifetimeProcess extends LifetimeProcess
{
  type = 'holdHarvesterlfOpt';

  run()
  {
    let creep = this.getCreep();
    let flag = Game.flags[this.metaData.flagName];
    let spawnRoom = this.metaData.flagName.split('-')[0];

    if(!flag)
    {
      this.completed = true;
      return;
    }

    if(!creep)
    {
      return;
    }

    if(Game.time % 10 === 0)
    {

      if(flag.room)
      {
        let enemies = flag.room!.find(FIND_HOSTILE_CREEPS);

        enemies = _.filter(enemies, (e: Creep)=> {
          return (e.getActiveBodyparts(ATTACK) > 0 || e.getActiveBodyparts(RANGED_ATTACK) > 0);
        });

        if(enemies.length > 0)
        {

        }
      }
    }

    if(flag.memory.enemies)
    {
      let fleeFlag = Game.flags['RemoteFlee-'+spawnRoom];
      if(fleeFlag)
      {
        if(_.sum(creep.carry) > 0)
        {
          let storage = Game.rooms[spawnRoom].storage;
          if(storage)
          {
            if(!creep.pos.inRangeTo(storage, 1))
            {
              creep.travelTo(storage);
              return;
            }
            else
            {
              creep.transferEverything(storage);
              return;
            }
          }
        }
        else
        {
          let container = this.kernel.data.roomData[creep.room.name].generalContainers[0];
          if(container)
          {
            if(creep.pos.inRangeTo(container.pos, 0))
            {
              creep.suicide();
              return;
            }

            creep.travelTo(container);
            return;
          }
        }
      }
      return;
    }

    if(flag.memory.enemies === false)
    {
      let source = <Source>Game.getObjectById(this.metaData.source);

      if(this.kernel.data.roomData[source.room.name])
      {
        if(source && this.kernel.data.roomData[source.room.name].sourceContainerMaps[source.id])
        {

          let container = this.kernel.data.roomData[source.room.name].sourceContainerMaps[source.id];

          if(!creep.pos.inRangeTo(container, 0) && !flag.memory.enemies)
          {
            creep.travelTo(container);
          }

          if((container.storeCapacity - _.sum(container.store)) >= (creep.getActiveBodyparts(WORK) * 2))
          {
              creep.harvest(source);
          }

          if(container.hits <= container.hitsMax * .95 && _.sum(creep.carry) > 0)
          {
            creep.repair(container);
          }

          if(container.store.energy < container.storeCapacity && _.sum(creep.carry) == creep.carryCapacity )
          {
            creep.transfer(container, RESOURCE_ENERGY);
          }
        }
      }
    }
  }
}
