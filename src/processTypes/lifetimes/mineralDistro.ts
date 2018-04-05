import { LifetimeProcess } from "os/process";
import { CollectProcess } from "processTypes/creepActions/collect";
import { DeliverProcess } from "processTypes/creepActions/deliver";

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
        if(container.store[this.metaData.mineralType]! >= creep.carryCapacity)    // TODO not sure if this is the best way either.
        {
          this.fork(CollectProcess, 'collect-' + creep.name, this.priority - 1, {
            target: container.id,
            creep: creep.name,
            resource: this.metaData.mineralType
          });

          return;
        }
        else if(!creep.pos.inRangeTo(container, 1))
        {
          creep.travelTo(container);
        }
        else
        {
          this.suspend = 10;
        }
      }
    }

    if(creep.room.storage && creep.room.terminal)
    {
      if(creep.room.storage.store[this.metaData.mineralType]! > 20000)
      {
        this.fork(DeliverProcess, 'deliver-' + creep.name, this.priority - 1, {
          target: creep.room.terminal.id,
          creep: creep.name,
          resource: this.metaData.mineralType
        });
      }
      else
      {
        this.fork(DeliverProcess, 'deliver-' + creep.name, this.priority - 1, {
          target: creep.room.storage.id,
          creep: creep.name,
          resource: this.metaData.mineralType
        });
      }
    }
  }
}
