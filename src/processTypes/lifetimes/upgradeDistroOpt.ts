import { LifetimeProcess } from "os/process";
import { CollectProcess } from "processTypes/creepActions/collect";
import { DeliverProcess } from "processTypes/creepActions/deliver";

export class UpgradeDistroLifetimeOptProcess extends LifetimeProcess
{
  type = 'udlfOpt';

  run()
  {
    let creep = this.getCreep();

    if(!creep)
    {
      return
    }

    if(_.sum(creep.carry) === 0 && creep.ticksToLive! > 50)
    {
      if(creep.room.storage)
      {
        let storage = creep.room.storage;

        if(storage.store.energy > 0)
        {
            if(creep.pos.isNearTo(storage))
            {
                creep.withdraw(storage, RESOURCE_ENERGY);
                return;
            }

            creep.travelTo(storage, {range: 1});
            return;
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

          if(creep.pos.isNearTo(container))
          {
              creep.withdraw(container, RESOURCE_ENERGY);
              return;
          }

          creep.travelTo(container, {range: 1});
          return;
        }
      }
    }



    let target = this.kernel.data.roomData[creep.room.name].controllerContainer;

    if(target && _.sum(target.store) < target.storeCapacity)
    {
      if(creep.pos.isNearTo(target))
      {
          creep.transfer(target, RESOURCE_ENERGY);
          return;
      }

      creep.travelTo(target, {range: 1});
    }
    else
    {
      this.suspend = 5;
    }
  }
}
