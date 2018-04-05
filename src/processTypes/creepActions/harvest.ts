import {Process} from '../../os/process'

interface HarvestMetaData{
  source: string
  creep: string
}

export class HarvestProcess extends Process{
  metaData: HarvestMetaData
  type = 'harvest'

  run(){
    let creep = Game.creeps[this.metaData.creep]

    if(!creep || _.sum(creep.carry) === creep.carryCapacity){
      this.completed = true
      this.resumeParent()
      return
    }


    let source = <Source>Game.getObjectById(this.metaData.source)

    let targetPos = source.pos
    let targetRange = 1

    if(this.kernel.data.roomData[source.room.name].sourceContainerMaps[source.id]){
      targetPos = this.kernel.data.roomData[source.room.name].sourceContainerMaps[source.id].pos
      targetRange = 0
    }

    if(!creep.pos.inRangeTo(targetPos, targetRange)){
      creep.travelTo(targetPos);
    }
    else
    {
      let container = this.kernel.data.roomData[source.room.name].sourceContainerMaps[source.id];
      if(container)
      {
        if(_.sum(container.store) == container.storeCapacity)
        {
          this.suspend = 5;
        }
      }

      if(creep.harvest(source) === ERR_NOT_ENOUGH_RESOURCES){
        this.suspend = source.ticksToRegeneration
      }
    }
  }
}
