import { LifetimeProcess } from "os/process";

export class MineralDistroLifetimeProcess extends LifetimeProcess
{
  type = 'mdlf';
  metaData: MineralDistroLifetimeProcessMetaData
  run()
  {
    let creep = this.getCreep();

    if(!creep)
    {
      return;
    }

    if(_.sum(creep.carry) === 0 && creep.ticksToLive! > 50)
    {

      let container = Game.getObjectById<StructureContainer>(this.metaData.container);

      if(container)
      {
        if(_.sum(container.store) >= creep.carryCapacity)    // TODO not sure if this is the best way either.
        {
          if(creep.pos.inRangeTo(container, 1))
          {
            creep.withdrawEverything(container);
            return;
          }

          creep.travelTo(container);
          return;
        }
        else
        {
          creep.idleOffRoad(container, true);
          this.suspend = 10;
          return;
        }
      }
    }

    if(creep.room.storage && creep.room.terminal)
    {
      if(creep.room.storage.store[this.metaData.mineralType]! > 20000 && (_.sum(creep.room.terminal!.store) !== creep.room.terminal!.storeCapacity))
      {
        if(creep.pos.inRangeTo(creep.room.terminal,1))
        {
          creep.transferEverything(creep.room.terminal);
          return;
        }

        creep.travelTo(creep.room.terminal);
        return;
      }
      else
      {
        if(creep.pos.inRangeTo(creep.room.storage,1))
        {
          creep.transferEverything(creep.room.storage);
          return;
        }

        creep.travelTo(creep.room.storage);
        return;
      }
    }
  }
}
