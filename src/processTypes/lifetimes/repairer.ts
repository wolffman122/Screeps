import {LifetimeProcess} from '../../os/process'
import {Utils, RAMPARTTARGET} from '../../lib/utils'

import {CollectProcess} from '../creepActions/collect'
import {RepairProcess} from '../creepActions/repair'
import { BuildProcess } from '../creepActions/build';
import { HarvestProcess } from '../creepActions/harvest';
import { LABDISTROCAPACITY } from '../management/lab';

export class RepairerLifetimeProcess extends LifetimeProcess{
  type = 'rlf'
  metaData: RepairerLifetimeProcessMetaData;

  run()
  {
    let creep = this.getCreep()

    if(!creep){ return }

    if(this.metaData.boosts)
    {
      let boosted = true;
      for(let boost of this.metaData.boosts)
      {
        if(creep.memory[boost])
        {
          continue;
        }

        let room = Game.rooms[creep.pos.roomName];

        if(room)
        {
          let requests = room.memory.boostRequests;
          if(!requests)
          {
            creep.memory[boost] = true;
            continue;
          }

          if(!requests[boost])
          {
            requests[boost] = { flagName: undefined, requesterIds: [] };
          }

          // check if already boosted
          let boostedPart = _.find(creep.body, {boost: boost});
          if(boostedPart)
          {
            creep.memory[boost] = true;
            requests[boost!].requesterIds = _.pull(requests[boost].requesterIds, creep.id);
            continue;
          }

          boosted = false;
          if(!_.include(requests[boost].requesterIds, creep.id))
          {
            requests[boost].requesterIds.push(creep.id);
          }

          if(creep.spawning)
            continue;

          let flag = Game.flags[requests[boost].flagName!];
          if(!flag)
          {
            continue;
          }



          let lab = flag.pos.lookForStructures(STRUCTURE_LAB) as StructureLab;
          let terminal = flag.room!.terminal;

          if(lab.mineralType === boost && lab.mineralAmount >= LABDISTROCAPACITY && lab.energy >= LABDISTROCAPACITY)
          {
            console.log("BOOST: Time to boost");
            if(creep.pos.isNearTo(lab))
            {
              lab.boostCreep(creep);
            }
            else
            {
              creep.travelTo(lab);
              return;
            }
          }
          else if(this.metaData.allowUnboosted && terminal && (terminal.store[boost] === undefined || terminal.store[boost] < LABDISTROCAPACITY))
          {
            console.log("BOOST: no boost for", creep.name, " so moving on (alloweUnboosted = true)");
            requests[boost].requesterIds = _.pull(requests[boost].requesterIds, creep.id);
            creep.memory[boost] = true;
            return;
          }
          else
          {
            if(Game.time % 10 === 0)
              console.log("BOOST: no boost for", creep.name);
              creep.idleOffRoad(creep.room!.storage!, false);
            return;
          }
        }
      }
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
        if(creep.room.controller && creep.room.controller.level < 8)
        {
          let sources = creep.room.find(FIND_SOURCES);
          let source = creep.pos.findClosestByPath(sources);
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


      /*if(repairTargets.length === 0)
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
      }*/


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
              if(creep.name === 'sm-E41S49-11295193')
                console.log(this.name, 'First suspend')
              else
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
          let storage = creep.room.storage;
          if(storage && storage.store.energy > 200000)
          {
            if(creep.room.memory.rampartHealth && creep.room.memory.rampartHealth * 8 <= 7300000)
            {
              creep.room.memory.rampartHealth += 100;
            }
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
}
