import { LifetimeProcess } from "os/process";
import { MineralHarvest } from "processTypes/creepActions/mineralHarvest";
import { DeliverProcess } from "processTypes/creepActions/deliver";

export class MineralHarvesterLifetimeProcess extends LifetimeProcess
{
  type = 'mhlf';

  run()
  {
    let creep = this.getCreep();

    if(!creep)
    {
      return;
    }

    let extractor = this.kernel.data.roomData[creep.pos.roomName].extractor;
    let mineral = this.kernel.data.roomData[creep.pos.roomName].mineral;
    let container: StructureContainer | undefined = this.kernel.data.roomData[creep.pos.roomName].mineralContainer;

    if(!extractor || !mineral || !container)
    {
      return;
    }

    let roomInContainer = container.storeCapacity - _.sum(container.store);

    if(mineral.mineralAmount === 0 && _.sum(creep.carry) > 0 && roomInContainer >= _.sum(creep.carry))
    {
      this.fork(DeliverProcess, creep.name + '-deliver', this.priority - 1, {
        creep: creep.name,
        target: container.id,
        resource: mineral.mineralType
      })
    }
    else
    {
      this.fork(DeliverProcess, creep.name + '-deliver', this.priority - 1, {
        creep: creep.name,
        target: creep.room.terminal!.id,
        resource: mineral.mineralType
      })
    }

    if(_.sum(creep.carry) === 0)
    {
      this.fork(MineralHarvest, 'mineral-harvest-' + creep.name, this.priority = 1, {
        extractor: extractor.id,
        mineral : mineral.id,
        creep: creep.name
      });

      return;
    }



    if((container.storeCapacity - _.sum(container.store)) > _.sum(creep.carry))
    {
      this.fork(DeliverProcess, creep.name + '-deliver', this.priority - 1, {
        creep: creep.name,
        target: container.id,
        resource: mineral.mineralType
      })
    }
    else if(_.sum(creep.carry) === creep.carryCapacity)
    {
      this.fork(DeliverProcess, creep.name + '-deliver', this.priority - 1, {
        creep: creep.name,
        target: creep.room.terminal!.id,
        resource: mineral.mineralType
      })
    }
  }
}
