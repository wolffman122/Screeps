import { LifetimeProcess } from "os/process";
import { MoveProcess } from "processTypes/creepActions/move";
import { CollectProcess } from "processTypes/creepActions/collect";
import { BuildProcess } from "processTypes/creepActions/build";
import { RepairProcess } from "processTypes/creepActions/repair";

export class HoldWorkerLifetimeProcess extends LifetimeProcess
{
  type='holdWorkerlf';
  metaData: HoldWorkerLifetimeProcessMetaData;

  run()
  {
    this.log('Hold Worker Life');
    let creep = this.getCreep();

    let flag = Game.flags[this.metaData.flagName];

    if(!flag)
    {
      this.completed = true;
      return;
    }

    if(!creep)
    {
      return;
    }

    if(Game.time % 10 === 5)
    {
      let enemies = flag.room!.find(FIND_HOSTILE_CREEPS);

      enemies = _.filter(enemies, (e: Creep)=> {
        return (e.getActiveBodyparts(ATTACK) > 0 || e.getActiveBodyparts(RANGED_ATTACK) > 0);
      });

      if(enemies.length > 0)
      {
        flag.memory.enemies = true;
        if(flag.memory.timeEnemies === undefined)
        {
          flag.memory.timeEnemies = Game.time;
        }
        
        let fleeRoom = this.metaData.flagName.split('-')[1];
        creep.travelTo(RoomPosition(10,10, fleeRoom));
        return;
      }
      else
      {
        flag.memory.enemies = false;
      }
    }

    let room = Game.rooms[this.metaData.targetRoom];

    if(room.name != creep.pos.roomName && !flag.memory.enemies)
    {
      this.fork(MoveProcess, 'move-' + creep.name, this.priority -1, {
        creep: creep.name,
        pos: Game.flags[this.metaData.flagName].pos,
        range: 10
      })
    }

    if(_.sum(creep.carry) === 0)
    {
      let containers = this.kernel.data.roomData[creep.pos.roomName].containers;
      let target = creep.pos.findClosestByPath(containers);
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

    // full creep
    // Build first
    let sites = this.kernel.data.roomData[creep.pos.roomName].constructionSites;
    if(sites.length > 0)
    {
      let site = creep.pos.findClosestByPath(sites);

      if(site)
      {
        this.fork(BuildProcess, 'build-' + creep.name, this.priority - 1, {
          creep: creep.name,
          site: site.id
        });

        return;
      }
    }

    // Repair
    let repairableObjects = <StructureRoad[]>[].concat(
      <never[]>this.kernel.data.roomData[creep.pos.roomName].roads,
      <never[]>this.kernel.data.roomData[creep.pos.roomName].containers
    )

    let shortestDecay = 100;

    let repairTargets = _.filter(repairableObjects, function(object){
      if(object.ticksToDecay < shortestDecay)
      {
        shortestDecay = object.ticksToDecay;
      }

      return object.hits < object.hitsMax;
    });

    if(repairTargets.length > 0)
    {
      let target = creep.pos.findClosestByPath(repairTargets);

      this.fork(RepairProcess, 'repair-' + creep.name, this.priority - 1, {
        creep: creep.name,
        target: target.id
      });
    }
    else
    {
      this.suspend = shortestDecay;
      return;
    }
  }
}
