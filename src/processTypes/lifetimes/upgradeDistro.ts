import { LifetimeProcess } from "os/process";
import { CollectProcess } from "processTypes/creepActions/collect";
import { DeliverProcess } from "processTypes/creepActions/deliver";

export class UpgradeDistroLifetimeProcess extends LifetimeProcess
{
  type = 'udlf';

  run()
  {
    let creep = this.getCreep();

    if(!creep)
    {
      return
    }

    if(_.sum(creep.carry) === 0 && creep.ticksToLive! > 100)
    {
      if(creep.room.storage)
      {
        let storage = creep.room.storage;

        if(storage.store.energy > 0)
        {
          this.fork(CollectProcess, 'collect-' + creep.name, this.priority - 1, {
            target: storage.id,
            creep: creep.name,
            resource: RESOURCE_ENERGY
          })

          return;
        }
      }
      else if (creep.room.terminal)
      {
        let terminal = creep.room.terminal;

        if(terminal.store.energy > 0)
        {
          this.fork(CollectProcess, 'collect-' + creep.name, this.priority - 1, {
            target: terminal.id,
            creep: creep.name,
            resource: RESOURCE_ENERGY
          })
        }
      }
      else if(this.kernel.data.roomData[creep.pos.roomName].generalContainers.length > 0)
      {
        let containers = _.filter(this.kernel.data.roomData[creep.pos.roomName].generalContainers, (gc) => {
          return (gc.store.energy > 0);
        });

        if(containers.length > 0)
        {
          let container = creep.pos.findClosestByPath(containers);

          this.fork(CollectProcess, 'collect-' + creep.name, this.priority - 1, {
            target: container.id,
            creep: creep.name,
            resource: RESOURCE_ENERGY
          });

          return;
        }
      }
    }



    let target = this.kernel.data.roomData[creep.room.name].controllerContainer;

    if(target && _.sum(target.store) < target.storeCapacity)
    {
      this.fork(DeliverProcess, 'deliver-' + creep.name, this.priority - 1, {
        creep: creep.name,
        target: target.id,
        resource: RESOURCE_ENERGY
      });
    }
    else
    {
      this.suspend = 5;
    }
  }
}
