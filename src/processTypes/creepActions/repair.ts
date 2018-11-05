import {Process} from '../../os/process'

export class RepairProcess extends Process{
  metaData: RepairProcessMetaData
  type = 'repair'

  run(){
    let creep = Game.creeps[this.metaData.creep]
    let target = <Structure>Game.getObjectById(this.metaData.target)

    if(!target || !creep || _.sum(creep.carry) === 0){
      this.completed = true
      this.resumeParent()
      return
    }

    if(creep.name === 'sm-E41S49-11295193')
      console.log(this.name, target.structureType, target.pos.x, target.pos.y);

    if(!creep.pos.inRangeTo(target, 3))
    {
      if(Game.time % 5 === 0)
      {
        if(target.hits > (target.hitsMax * .98))
        {
          this.completed = true
          this.resumeParent()
          return
        }
      }
      creep.travelTo(target);
    }
    else
    {
      if(target.hits === target.hitsMax){
        this.completed = true
        this.resumeParent()
        return
      }

      let outcome = creep.repair(target)
      if(outcome === OK)
      {
        creep.yieldRoad(target, true);
      }
    }
  }
}
