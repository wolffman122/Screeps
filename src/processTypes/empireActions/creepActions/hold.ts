import { Process } from "os/process";

interface HoldProcessMetaData
{
  creep: string
  flagName: string
}

export class HoldProcess extends Process
{
  metaData: HoldProcessMetaData;
  type = 'hold';

  run()
  {
    let creep = Game.creeps[this.metaData.creep];
    let flag = Game.flags[this.metaData.flagName];

    if(!creep || !flag)
    {
      this.completed = true;
      this.resumeParent();
      return;
    }

    if(Game.time % 10 == 0)
    {
      let enemies = flag.room.find(FIND_HOSTILE_CREEPS)

      enemies = _.filter(enemies, (e: Creep)=> {
        return (e.getActiveBodyparts(ATTACK) > 0 || e.getActiveBodyparts(RANGED_ATTACK) > 0);
      });

      if(enemies.length > 1)
      {
        flag.memory.enemies = true;
      }
      else if (enemies.length == 0)
      {
        flag.memory.enemies = false;
      }

      let dropped = flag.room.find(FIND_DROPPED_RESOURCES);

      let droppedEnergy = <Resource[]>_.filter(dropped, (d: Resource) => {
        return (d.resourceType == RESOURCE_ENERGY && d.amount > 500);
      })

      let totalEnergy = _.sum(droppedEnergy, (de)=> {
        return de.amount;
      });

      if(totalEnergy > 1000)
      {
        flag.memory.droppedResource = true;
      }

    }

    if(!creep.pos.inRangeTo(creep.room.controller!, 1))
    {
      creep.travelTo(creep.room.controller!)
    }
    else
    {
      creep.reserveController(creep.room.controller!);
    }
  }
}
