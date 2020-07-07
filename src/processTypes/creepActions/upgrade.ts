import { Process } from '../../os/process';

export class UpgradeProcess extends Process {
  metaData: UpgradeProcessMetaData;
  type = 'upgrade';

  run() {
    let creep = Game.creeps[this.metaData.creep];

    if (!creep || creep.store.getUsedCapacity() === 0) {
      this.completed = true;
      this.resumeParent();
      return;
    }

    if (!creep.pos.inRangeTo(creep.room.controller!, 3)) {
      creep.travelTo(creep.room.controller!, { range: 3 });
    } else {
      creep.upgradeController(creep.room.controller!);
    }
  }
}
