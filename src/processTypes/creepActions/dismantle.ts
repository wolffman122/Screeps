import { Process } from '../../os/process'

export class DismantleProcess extends Process {
  metaData: DismantleMetaData;
  type = 'dismantle'

  run() {
    let creep = Game.creeps[this.metaData.creep];
    let flag = Game.flags[this.metaData.flagName];
    if (!creep) {
      this.completed = true;
      this.resumeParent();
      return;
    }

    let targets = <Structure[]>flag.pos.lookFor(LOOK_STRUCTURES);

    if (targets.length == 0) {
      let spawn = this.kernel.data.roomData[creep.pos.roomName].enemySpawns[0];
      let targetPos = spawn.pos;

      if (!creep.pos.inRangeTo(targetPos, 1)) {
        creep.travelTo(targetPos);
      }
      else {
        let ret = creep.dismantle(spawn);
      }
    }
    else {
      let target = targets[0];
      let targetPos = targets[0].pos;

      if (creep.store.getUsedCapacity() < creep.carryCapacity) {
        if (!creep.pos.inRangeTo(targetPos, 1)) {
          creep.travelTo(targetPos);
        }
        else {
          creep.dismantle(target);
        }
        return;
      }
      else {
        if (creep.pos.isNearTo(target)) {
          creep.dismantle(target);
          return;
        }

        creep.travelTo(target);
        return;
      }
    }
  }
}
