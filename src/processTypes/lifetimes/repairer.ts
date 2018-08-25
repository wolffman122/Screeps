import {LifetimeProcess} from '../../os/process'
import {Utils} from '../../lib/utils'

import {CollectProcess} from '../creepActions/collect'
import {RepairProcess} from '../creepActions/repair'
import { BuildProcess } from '../creepActions/build';
import { HarvestProcess } from '../creepActions/harvest';

export class RepairerLifetimeProcess extends LifetimeProcess{
  type = 'rlf'

  run()
  {
    let creep = this.getCreep()

    if(!creep){ return }

    if(creep.name === 'sm-E41S41-11139758')
    {
      console.log(this.name, '111111')
    }
    
    if(creep.ticksToLive! < 50 && _.sum(creep.carry) > 0)
    {
      let storage = creep.room.storage;
      if(storage)
      {
        if(!creep.pos.inRangeTo(storage, 1))
        {
          creep.travelTo(storage);
          return;
        }

        if(creep.transferEverything(storage) == OK)
        {
          creep.suicide();
          return;
        }
      }
    }

    if(_.sum(creep.carry) === 0){
      let target = Utils.withdrawTarget(creep, this)

      if(target){
        this.fork(CollectProcess, 'collect-' + creep.name, this.priority - 1, {
          creep: creep.name,
          target: target.id,
          resource: RESOURCE_ENERGY
        })

        return
      }
      else
      {
        let source = creep.pos.findClosestByPath(FIND_SOURCES)[0];
        if(source)
        {
          this.fork(HarvestProcess, 'harvest-' + creep.name, this.priority - 1, {
            creep: creep.name,
            source: source.id
          });

          return;
        }
        else
        {
          this.suspend = 10
          return
        }
      }
    }

    let rampartSites = _.filter(this.kernel.data.roomData[this.metaData.roomName].constructionSites, (cs) => {
      return (cs.structureType === STRUCTURE_RAMPART || cs.structureType === STRUCTURE_WALL);
    });

    if(rampartSites.length > 0)
    {
      let rampartSite = creep.pos.findClosestByPath(rampartSites);

      if(rampartSite)
      {
        if(!creep.pos.inRangeTo(rampartSite, 3))
        {
          creep.travelTo(rampartSite);
        }

        creep.build(rampartSite);
      }
    }
    else
    {
      // If the creep has been refilled
      let repairableObjects = <RepairTarget[]>[].concat(
        <never[]>this.kernel.data.roomData[this.metaData.roomName].containers,
        <never[]>this.kernel.data.roomData[this.metaData.roomName].ramparts,
        <never[]>this.kernel.data.roomData[this.metaData.roomName].walls
      )

      let shortestDecay = 100

      let proc = this;

      let repairTargets = _.filter(repairableObjects, function(object){
        if(object.ticksToDecay < shortestDecay)
        {
          shortestDecay = object.ticksToDecay
        }

        switch (object.structureType)
        {
          case STRUCTURE_RAMPART:
            return (object.hits < Utils.rampartHealth(proc.kernel, proc.metaData.roomName));
          case STRUCTURE_WALL:
            return (object.hits < Utils.wallHealth(proc.kernel, proc.metaData.roomName));
          default:
            return (object.hits < object.hitsMax);
        }

      });


      if(repairTargets.length === 0)
      {
        let repairableObjects = <StructureRoad[]>[].concat(
          <never[]>this.kernel.data.roomData[this.metaData.roomName].roads
        );

        let shortestDecay = 100;

        repairTargets = _.filter(repairableObjects, function(object){
          if(object.ticksToDecay < shortestDecay)
          {
            shortestDecay = object.ticksToDecay;
          }

          return (object.hits <  object.hitsMax);
        });
      }


      if(repairTargets.length > 0)
      {
        let target = creep.pos.findClosestByPath(repairTargets)

        if(target)
        {
          let enemies = target.room.find(FIND_HOSTILE_CREEPS);
          let inRangeEnemies = target.pos.findInRange(enemies, 4);

          if(inRangeEnemies.length === 0)
          {
            this.fork(RepairProcess, 'repair-' + creep.name, this.priority - 1, {
              creep: creep.name,
              target: target.id
            });
          }
          else
          {
            if(creep.idleOffRoad(creep.room!.terminal!, false) === OK)
            {
              this.suspend = 10;
            }
            return;
          }
        }
      }
      else
      {
        let target = creep.pos.findClosestByRange(this.kernel.data.roomData[creep.room.name].constructionSites)

        if(target)
        {
          this.fork(BuildProcess, 'build-' + creep.name, this.priority - 1, {
            creep: creep.name,
            site: target.id
          })
        }
        else
        {
          if(creep.idleOffRoad(creep.room!.terminal!, false) === OK)
          {
            this.suspend = 10;
          }
          return;
        }
      }
    }
  }
}
