import {LifetimeProcess} from '../../os/process'
import {Utils} from '../../lib/utils'

import {CollectProcess} from '../creepActions/collect'
import {BuildProcess} from '../creepActions/build'

export class BuilderLifetimeProcess extends LifetimeProcess{
  type = 'blf'

  run(){
    let creep = this.getCreep()

    if(!creep){ return }

    if(_.sum(creep.carry) === 0){
      let target = Utils.withdrawTarget(creep, this)
      this.log('Target ' + target);
      if(!target)
      {
        if(creep.room.terminal && creep.room.terminal.my)
        {
          target = creep.room.terminal;
        }
        else
        {
          let structures = creep.room.find(FIND_HOSTILE_STRUCTURES);
          if(structures.length > 0)
          {
            target = _.filter(structures, (s) => {
              if(s.structureType === STRUCTURE_LAB || s.structureType === STRUCTURE_LINK)
              {
                return (s.energy > 0);
              }
              else if(s.structureType === STRUCTURE_STORAGE ||  s.structureType === STRUCTURE_TERMINAL)
              {
                return (s.store.energy > 0);
              }
              return;
            })[0];
          }
        }
      }

      if(target){
        this.fork(CollectProcess, 'collect-' + creep.name, this.priority - 1, {
          creep: creep.name,
          target: target.id,
          resource: RESOURCE_ENERGY
        })

        return
      }else{
        if(creep.room.controller!.level <= 3)
        {
          this.suspend = 2
        }
        else
        {
          this.suspend = 10
        }
        return
      }
    }

    // If the creep has been refilled
    let target = creep.pos.findClosestByRange(this.kernel.data.roomData[creep.room.name].constructionSites)

    if(target){
      this.fork(BuildProcess, 'build-' + creep.name, this.priority - 1, {
        creep: creep.name,
        site: target.id
      })

      return
    }else{
      creep.say('spare')
    }
  }
}
