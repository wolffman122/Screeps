import { Process } from '../../os/process'

export class HarvestProcess extends Process {
  metaData: HarvestMetaData
  type = 'harvest'

  run() {
    let creep = Game.creeps[this.metaData.creep]

    if (!creep || creep.store.getUsedCapacity() === creep.carryCapacity) {
      this.completed = true
      this.resumeParent()
      return
    }

    let source = <Source>Game.getObjectById(this.metaData.source)
    if (source) {
      let targetPos = source.pos
      let targetRange = 1

      if (this.kernel.data.roomData[source.room.name].sourceContainerMaps[source.id]) {
        if (creep.getActiveBodyparts(WORK) >= 6) {
          targetPos = this.kernel.data.roomData[source.room.name].sourceContainerMaps[source.id].pos
          targetRange = 0
        }
      }


      if (!creep.pos.inRangeTo(targetPos, targetRange)) {
        creep.travelTo(targetPos);
      }
      else {
        let container = this.kernel.data.roomData[source.room.name].sourceContainerMaps[source.id];
        if (container) {
          if (container.store.getUsedCapacity() == container.storeCapacity) {
            this.suspend = 5;
          }
        }

        if (creep.harvest(source) === ERR_NOT_ENOUGH_RESOURCES) {
          this.suspend = source.ticksToRegeneration
        }
      }
    }
  }
}
