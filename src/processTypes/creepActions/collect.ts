import {Process} from '../../os/process'

export class CollectProcess extends Process{
  metaData: CollectProcessMetaData
  type = 'collect'

  run(){
    let creep = Game.creeps[this.metaData.creep]

    if(!creep){
      this.completed = true
      this.resumeParent()
      return
    }

    let target = <Structure>Game.getObjectById(this.metaData.target)
    if(!target){
      this.completed = true
      this.resumeParent(true)
      return
    }

    if(!creep.pos.isNearTo(target))
    {
      creep.travelTo(target);
    }
    else
    {
      if(this.metaData.collectAmount)
      {
        if(this.metaData.collectAmount <= creep.carryCapacity)
        {
          creep.withdraw(target, this.metaData.resource, this.metaData.collectAmount)
        }
      }
      else
      {
        creep.withdraw(target, this.metaData.resource);
      }

      this.completed = true
      this.resumeParent()
    }
  }
}
