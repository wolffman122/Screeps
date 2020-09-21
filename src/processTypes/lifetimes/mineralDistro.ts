import { LifetimeProcess } from "os/process";

export class MineralDistroLifetimeProcess extends LifetimeProcess {
  type = 'mdlf';
  metaData: MineralDistroLifetimeProcessMetaData
  run() {
    let creep = this.getCreep();

    if (!creep) {
      return;
    }

    if (creep.store.getUsedCapacity() === 0 && creep.ticksToLive! > 50) {

      let container = Game.getObjectById<StructureContainer>(this.metaData.container);

      if (container) {
        if (container.store.getUsedCapacity() >= creep.carryCapacity)    // TODO not sure if this is the best way either.
        {
          if (!creep.pos.inRangeTo(container, 1))
            creep.moveTo(container, {range: 1});
          else
            creep.withdrawEverything(container);

          return;
        }
        else {
          if (!creep.pos.isNearTo(container)) {
            creep.moveTo(container);
            return;
          }

          // creep.idleOffRoad(container, true);
          // this.suspend = 10;
          return;
        }
      }
    }

    if (creep.room.storage && creep.room.terminal) {
      if (creep.room.terminal.store.getUsedCapacity(this.metaData.mineralType) < 10000 && (creep.room.terminal!.store.getUsedCapacity() !== creep.room.terminal!.storeCapacity)) {
        if (creep.pos.inRangeTo(creep.room.terminal, 1)) {
          creep.transferEverything(creep.room.terminal);
          return;
        }

        creep.moveTo(creep.room.terminal);
        return;
      }
      else {
        if (creep.pos.inRangeTo(creep.room.storage, 1)) {
          creep.transferEverything(creep.room.storage);
          return;
        }

        creep.moveTo(creep.room.storage);
        return;
      }
    }
  }
}
