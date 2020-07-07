import { LifetimeProcess } from "os/process";
import { HarvestProcess } from "../creepActions/harvest";
import { UpgradeProcess } from "../creepActions/upgrade";
import { LABDISTROCAPACITY } from "../management/lab";
import { LabDistroLifetimeProcess } from "./labDistro";
import { Utils } from "lib/utils";

export class HelperLifetimeProcess extends LifetimeProcess {
  type = 'hlp';
  metaData: HelperLifetimeProcessMetaData;

  run() {
    let creep = this.getCreep()
    let flag = Game.flags[this.metaData.flagName];

    if (!flag || !creep) {
      this.completed = true;
      return;
    }

    console.log(this.name, creep.pos.roomName, creep.pos.x, creep.pos.y);

    if (!creep.memory.boost) {
      creep.boostRequest(this.metaData.boosts, false);
      return;
    }

    let controller = flag.room!.controller;
    if (controller) {
      if (creep.room.name !== controller.room.name) {
        creep.travelTo(flag, { preferHighway: true });
        return;
      }

      if ((creep.store.getUsedCapacity() === 0 || this.metaData.harvesting) && creep.ticksToLive! > 200) {
        this.metaData.harvesting = true;
        if (creep.store.getUsedCapacity() === creep.carryCapacity) {
          this.metaData.harvesting = false;
        }

        let source = <Source>Game.getObjectById(this.metaData.source);
        if (source) {
          let targetPos = source.pos;
          let targetRange = 1

          if (!creep.pos.inRangeTo(targetPos, targetRange)) {
            creep.travelTo(targetPos);
            return;
          }

          if (creep.harvest(source) === ERR_NOT_ENOUGH_RESOURCES) {
            this.metaData.harvesting = false;
          }
          return;
        }
      }

      if (!creep.pos.inRangeTo(controller, 3)) {
        creep.travelTo(controller, { range: 3 });
      }
      else {
        creep.upgradeController(controller);
      }
    }
  }
}
