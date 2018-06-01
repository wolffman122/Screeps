import {LifetimeProcess} from '../../os/process'

import {BuildProcess} from '../creepActions/build'
import {HarvestProcess} from '../creepActions/harvest'
import { CollectProcess } from 'processTypes/creepActions/collect';

export class RemoteBuilderLifetimeProcess extends LifetimeProcess{
  type = 'rblf'

  run(){
    let creep = this.getCreep()
    let site = <ConstructionSite>Game.getObjectById(this.metaData.site)

    if(!creep){ return }
    if(!site){
      this.completed = true
      return
    }

    let flag = Game.flags['Claim-1'];
    if(flag)
    {
      if(creep.memory.atPlace === undefined)
      {
        if(creep.pos.isNearTo(flag))
        {
          creep.memory.atPlace = true;
          return;
        }

        creep.travelTo(flag);
        return;
      }
    }

    if(_.sum(creep.carry) === 0 && creep.room.storage && creep.room.storage.my && creep.room.storage.store.energy >= creep.carryCapacity)
    {
      if(creep.pos.isNearTo(creep.room.storage))
      {
        creep.withdraw(creep.room.storage, RESOURCE_ENERGY);
        return;
      }

      creep.travelTo(creep.room.storage);
      return;
    }

    if(_.sum(creep.carry) === 0)
    {
      if(creep.pos.roomName == site.pos.roomName)
      {
        let structures = site.room!.find(FIND_HOSTILE_STRUCTURES);
        if(structures)
        {
          let targets = _.filter(structures, (s) => {
            return ((s.structureType === STRUCTURE_LINK || s.structureType == STRUCTURE_TOWER || s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_LAB) && s.energy > 0);
          });

          console.log('Remote Builder ', targets.length)
          if(targets.length > 0)
          {
            let target = <Structure>creep.pos.findClosestByPath(targets);

            if(target)
            {
                this.fork(CollectProcess, 'collect-' + creep.name, this.priority - 1, {
                  creep: creep.name,
                  target: target.id,
                  resource: RESOURCE_ENERGY
                });

                return;
            }
          }
          else
          {
            let targets = _.filter(structures, (s)=>{
              return ((s.structureType === STRUCTURE_STORAGE || s.structureType === STRUCTURE_TERMINAL) && s.store.energy > 0);
            })

            if(targets.length > 0)
            {
              let target = creep.pos.findClosestByPath(targets);

              if(target)
              {
                this.fork(CollectProcess, 'collect-' + creep.name, this.priority - 1, {
                  creep: creep.name,
                  target: target.id,
                  resource: RESOURCE_ENERGY
                });

                return;
              }
            }
            else
            {
              let source = site.pos.findClosestByRange(this.kernel.data.roomData[site.pos.roomName].sources)

              this.fork(HarvestProcess, 'harvest-' + creep.name, this.priority - 1, {
                creep: creep.name,
                source: source.id
              })

              return
            }
          }
        }
      }
      else
      {
        let source = site.pos.findClosestByRange(this.kernel.data.roomData[site.pos.roomName].sources)

        this.fork(HarvestProcess, 'harvest-' + creep.name, this.priority - 1, {
          creep: creep.name,
          source: source.id
        })

        return
      }
    }

    this.fork(BuildProcess, 'build-' + creep.name, this.priority - 1, {
      creep: creep.name,
      site: site.id
    })
  }
}
