import { LifetimeProcess } from "os/process";
import { MineralHarvest } from "processTypes/creepActions/mineralHarvest";

export class MineralHarvesterLifetimeProcess extends LifetimeProcess {
  type = 'mhlf';

  run() {
    let creep = this.getCreep();

    if (!creep) {
      this.completed = true;
      return;
    }

    let extractor = this.kernel.data.roomData[creep.pos.roomName].extractor;
    let mineral = this.kernel.data.roomData[creep.pos.roomName].mineral;
    let openPositions: RoomPosition[]
    if (mineral)
      openPositions = mineral.pos.openAdjacentSpots();
    let container: StructureContainer | undefined = this.kernel.data.roomData[creep.pos.roomName].mineralContainer;

    if (!extractor || !mineral || !container) {
      this.completed = true;
      return;
    }

    if ((creep.ticksToLive ?? 0) < 4) {
      creep.say('TC', true);
      creep.transfer(container, mineral.mineralType);
      return;
    }

    let roomInContainer = container.storeCapacity - container.store.getUsedCapacity();

    if (mineral.mineralAmount !== 0)
      creep.room.memory.miningStopTime = undefined;

    if (mineral.mineralAmount === 0 && creep.store.getUsedCapacity() === 0) {
      creep.room.memory.miningStopTime = Game.time;
      creep.suicide();
      return;
    }

    if (mineral.mineralAmount === 0 && creep.store.getUsedCapacity() > 0 && roomInContainer === 0) {
      if (!creep.pos.inRangeTo(container, 1)) {
        if (!creep.fixMyRoad()) {
          creep.travelTo(container);
        }
      }

      creep.transfer(container, mineral.mineralType);
      return;
    }

    if (creep.room.name === 'E45S53') {
      let target: RoomPosition;
      let spots: { dist: number, pos: RoomPosition }[] = [];
      if (openPositions) {
        let flag = Game.flags['Center-' + creep.room.name];
        _.forEach(openPositions, (o) => {
          const distance = PathFinder.search(flag.pos, o).path.length
          spots.push({ dist: distance, pos: o });
        });

        target = _.max(spots, 'dist').pos

        console.log(this.name, 'Mineral Pos', target.x, target.y);
      }
    }

    if (creep.store.getUsedCapacity() === 0) {
      this.fork(MineralHarvest, 'mineral-harvest-' + creep.name, this.priority = 1, {
        extractor: extractor.id,
        mineral: mineral.id,
        creep: creep.name,
      });

      return;
    }



    if ((container.storeCapacity - container.store.getUsedCapacity()) > creep.store.getUsedCapacity()) {
      if (!creep.pos.inRangeTo(container, 1)) {
        if (!creep.fixMyRoad()) {
          creep.travelTo(container);
        }
      }

      creep.transfer(container, mineral.mineralType);
      return;
    }
    else if (creep.store.getUsedCapacity() === creep.carryCapacity) {
      let terminal = creep.room.terminal;
      if (!creep.pos.inRangeTo(terminal, 1)) {
        if (!creep.fixMyRoad()) {
          creep.travelTo(terminal);
        }
      }

      creep.transfer(terminal, mineral.mineralType);
      return;
    }
  }
}
