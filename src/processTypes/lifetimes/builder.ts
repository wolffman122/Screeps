import { LifetimeProcess } from '../../os/process'
import { Utils } from '../../lib/utils'
import { HarvestProcess } from '../creepActions/harvest';

export class BuilderLifetimeProcess extends LifetimeProcess {
  type = 'blf'

  run() {
    let creep = this.getCreep()
    let centerFlag  = Game.flags['Center-' + creep.room.name];
    if (!creep) { return }
    if (creep.room.memory.shutdown) {
      this.completed = true;
      return;
    }


    if (creep.name === 'sm-E41S41-11147991')
    {
      console.log(this.name, '22222')
    }

    if (creep.store.getUsedCapacity() === 0) {
      let target: Structure<StructureConstant>;
      let storage = creep.room.storage;
      if (storage && !storage.my && storage.store.energy > 0) {
        target = storage;
      }
      else {
        let terminal = creep.room.terminal;
        if (terminal && !terminal.my && terminal.store.energy > 0) {
          target = terminal;
        }
        else {
          target = Utils.withdrawTarget(creep, this)

          if (!target) {
            if (creep.room.terminal && creep.room.terminal.my) {
              target = creep.room.terminal;
            }
            else
            {
              let structures = creep.room.find(FIND_HOSTILE_STRUCTURES);
              if (structures.length > 0) {
                target = _.filter(structures, (s) => {
                  if (s.structureType === STRUCTURE_LAB || s.structureType === STRUCTURE_LINK) {
                    return (s.energy > 0);
                  }
                  else if (s.structureType === STRUCTURE_STORAGE || s.structureType === STRUCTURE_TERMINAL) {
                    return (s.store.energy > 0);
                  }
                  return;
                })[0];
              }
              else {
                const containers = this.roomInfo(creep.room.name).sourceContainers.filter(sc => sc.store.getUsedCapacity(RESOURCE_ENERGY) >= creep.store.getCapacity());
                if(creep.room.energyAvailable === creep.room.energyCapacityAvailable && containers.length)
                {
                  const container = creep.pos.findClosestByPath(containers);
                  if(!creep.pos.isNearTo(container))
                    creep.moveTo(container);
                  else
                    creep.withdraw(container, RESOURCE_ENERGY);

                  return;
                }

                let sources = creep.room.find(FIND_SOURCES);
                let source = creep.pos.findClosestByPath(sources);
                if (source) {
                  if (creep.name === 'sm-E41S41-11147991') {
                    console.log(this.name, '4')
                  }
                  this.fork(HarvestProcess, 'harvest-' + creep.name, this.priority - 1, {
                    creep: creep.name,
                    source: source.id
                  });

                  return;
                }
              }
            }
          }
        }
      }

      if (target) {
        if (!creep.pos.isNearTo(target))
          creep.travelTo(target);
        else
          creep.withdraw(target, RESOURCE_ENERGY);

        return
      }
      else {
        let source = creep.pos.findClosestByPath(FIND_SOURCES)[0];
        if (source) {
          this.fork(HarvestProcess, 'harvest-' + creep.name, this.priority - 1, {
            creep: creep.name,
            source: source.id
          });

          return;
        }
        else {
          /*if(creep.room.controller!.level <= 3)
          {
            this.suspend = 2
          }
          else
          {
            this.suspend = 10
          }
          return;*/
        }
      }
    }

    // If the creep has been refilled
    let target = centerFlag.pos.findClosestByRange(this.kernel.data.roomData[creep.room.name].constructionSites)

    if (target) {
      if (!creep.pos.inRangeTo(target, 3))
        creep.travelTo(target, { range: 3 });
      else
        if (creep.build(target) === OK)
          creep.yieldRoad(target, true);
      return
    }
    else {
      if (creep.idleOffRoad(creep.room!.terminal!, false) === OK) {
        creep.say('spare')
      }
    }
  }
}
