import {CreepBuilder} from './creepBuilder'
import {Kernel} from '../os/kernel'
import {Process} from '../os/process'
import {RoomPathFinder} from './roomPathFinder'

export const Utils = {
  clearDeadCreeps: function(list: string[]){
    return _.filter(list, function(entry){
      return !!Game.creeps[entry]
    })
  },

  clearDeadCreep: function(name: string)
  {
    return !!Game.creeps[name];
  },

  inflateCreeps: function(list: string[]): Creep[]{
    return _.transform(list, function(result, entry){
      result.push(Game.creeps[entry])
    })
  },

  creepPreSpawnCount: function(list: string[], extraTime?: number): Number
  {
    let creeps = _.transform(list, function(result, entry){
      result.push(Game.creeps[entry]);
    }) as Creep[];

    if(creeps.length)
    {
      let count = 0;
      _.forEach(creeps, (c) => {
        let ticksNeeded = c.body.length * 3 + extraTime;
        if(!c.ticksToLive || c.ticksToLive > ticksNeeded) { count++; }
      })

      return count;
    }
    else
    {
      return 0;
    }
  },

  workRate: function(creeps: Creep[], perWorkPart: number){
    var workRate = 0

    _.forEach(creeps, function(creep){
      _.forEach(creep.body, function(part){
        if(part.type == WORK){
          workRate += perWorkPart
        }
      })
    })

    return workRate
  },

  spawn(kernel: Kernel, roomName: string, creepType: string, name: string, memory: any): boolean{
    let body = CreepBuilder.design(creepType, Game.rooms[roomName], memory)

    let spawns = kernel.data.roomData[roomName].spawns
    let outcome = false

    _.forEach(spawns, function(spawn){
      if(!_.includes(kernel.data.usedSpawns, spawn.id) &&!spawn.spawning && spawn.spawnCreep(body, name, {dryRun: true}) === OK){

        let ret = spawn.spawnCreep(body, name, {memory: memory})
        outcome = true
        kernel.data.usedSpawns.push(spawn.id)
      }
    })

    return outcome
  },

  withdrawTarget(creep: Creep, proc: Process){
    let withdraws = <Structure[]>[].concat(
      <never[]>proc.kernel.data.roomData[creep.room.name].generalContainers
    )

    if(proc.kernel.data.roomData[creep.room.name].controllerLink)
    {
      withdraws = [].concat(
        <never[]>withdraws,
        <never[]>[proc.kernel.data.roomData[creep.room.name].controllerLink]
      )
    }

    if(creep.room.storage && creep.room.storage.my)
    {
      withdraws = [].concat(
        <never[]>withdraws,
        <never[]>[creep.room.storage]
      )
    }

    if(withdraws.length === 0){
      withdraws = <never[]>proc.kernel.data.roomData[creep.room.name].spawns
      withdraws = <never[]>_.filter(withdraws, function(spawn: StructureSpawn){
        let ret = (spawn.energy > 250 && spawn.room.energyAvailable > (spawn.room.energyCapacityAvailable - 50))
        return ret;
      })
    }

    withdraws = _.filter(withdraws, (w) => {
      if(w.structureType === STRUCTURE_CONTAINER)
      {
        let container = <StructureContainer>w;
        return (container.store[RESOURCE_ENERGY] >= creep.carryCapacity);
      }
      else if(w.structureType === STRUCTURE_LINK)
      {
        let link = <StructureLink>w;
        return (link.energy >= creep.carryCapacity);
      }
      else if(w.structureType === STRUCTURE_STORAGE)
      {
        let storage = <StructureStorage>w;
        return (storage.store[RESOURCE_ENERGY] >= creep.carryCapacity);
      }
      else if(w.structureType === STRUCTURE_SPAWN)
      {
        let spawn = <StructureSpawn>w;
        return (spawn.energy >= creep.carryCapacity);
      }
      else
        return false;
    });

    return <Structure>creep.pos.findClosestByRange(withdraws)
  },

  /** Returns the room closest to the source room with the required spawn energy */
  nearestRoom(sourceRoom: string, minSpawnEnergy = 0){
      let bestRoom = ''
      let bestDistance = 999


      _.forEach(Game.rooms, function(room){
        if(room.controller && room.controller.my){
          if(room.energyCapacityAvailable > minSpawnEnergy){
            let path = new RoomPathFinder(sourceRoom, room.name).results()

            if(path.length < bestDistance)
            {
              bestDistance = path.length;
              bestRoom = room.name;
            }
          }
        }
      })

      return bestRoom
  },

  pathFind(startPos: RoomPosition, targetPos: RoomPosition)
  {
    let options: PathFinderOpts = {
      plainCost: 2,
      swampCost: 10,

      roomCallback: function(roomName: string) {
        let room = Game.rooms[roomName];

        if(!room)
          return false;

        let costs = new PathFinder.CostMatrix;

        room.find(FIND_STRUCTURES).forEach(function(struct) {
          if (struct.structureType === STRUCTURE_ROAD) {
            // Favor roads over plain tiles
            costs.set(struct.pos.x, struct.pos.y, 1);
          } else if (struct.structureType !== STRUCTURE_CONTAINER &&
                     (struct.structureType !== STRUCTURE_RAMPART ||
                      !struct.my)) {
            // Can't walk through non-walkable buildings
            costs.set(struct.pos.x, struct.pos.y, 0xff);
          }
        });

        // Avoid creeps in the room
        room.find(FIND_CREEPS).forEach(function(creep) {
          costs.set(creep.pos.x, creep.pos.y, 0xff);
        });

        return costs;
      },
    }
  },

  rampartHealth(kernel: Kernel, roomName: string, target?: number)
  {
    let room = Game.rooms[roomName];
    let max = RAMPARTTARGET;
    if(target && (target > RAMPARTTARGET))
      max = target

    if(room.controller!.level < 3)
    {
      return 0;
    }
    else
    {
      let average = Math.ceil(_.sum(<never[]>kernel.data.roomData[roomName].ramparts, 'hits') / kernel.data.roomData[roomName].ramparts.length);

      let target = average + 10000;
      if(target > max)
      {
        return max;
      }
      else
      {
        return target;
      }
    }
  },

  wallHealth(kernel: Kernel, roomName: string)
  {
    let room = Game.rooms[roomName];

    if(room.controller!.level < 8)
    {
      return 0;
    }
    else
    {
      let max = WALLTARGET;

      let average = Math.ceil(_.sum(<never[]>kernel.data.roomData[roomName].walls, 'hits') / kernel.data.roomData[roomName].walls.length);

      let target = average + 10000;
      if(target > max)
      {
        return max;
      }
      else
      {
        return target;
      }
    }
  },

  roomPath(from: RoomPosition, to: RoomPosition)
  {
    let startCpu = Game.cpu.getUsed();
    //let allowedRooms = { [from.roomName]: true };

    let retValue = Game.map.findRoute(from.roomName, to.roomName, {
      routeCallback(roomName) {
        let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);

        let isHighway = false;
        let isSKRoom = false;
        let isMyRoom : boolean | undefined = false;
        if(parsed)
        {
          let coordinates = parsed.map(Number);
          isHighway = (coordinates[1] % 10 === 0) ||
                      (coordinates[2] % 10 === 0);
          //isSKRoom = ((coordinates[1] % 4 === 0 || coordinates[1] % 5 === 0 || coordinates[1] % 6 === 0)) ||
          //               ((coordinates[2] % 4 === 0 || coordinates[2] % 5 === 0 || coordinates[2] % 6 === 0));
          isMyRoom = Game.rooms[roomName] &&
                     Game.rooms[roomName].controller &&
                     Game.rooms[roomName].controller!.my;
        }
        if(isHighway || isMyRoom)
        {
          return 1;
        }
        /*else if(isSKRoom)
        {
          return 2;
        }*/
        else
        {
          return 2.5;
        }
      }
    });

    /*_.forEach(retValue, (r) => {
      allowedRooms[r.room] = true;
      console.log("Room Name",r.room);
    });*/

    return retValue;
  },

  clampDirection(direction: number): number {
    while (direction < 1) direction += 8;
    while (direction > 8) direction -= 8;
    return direction;
  }
  /*

    let options: PathFinderOpts = {
      plainCost: 2,
      swampCost: 10,
      roomCallback(roomName: string)
      {
        if(allowedRooms[roomName])
        {
          let room = Game.rooms[roomName]
          if(!room)
            return false;

          let costs = new PathFinder.CostMatrix;

          room.find(FIND_STRUCTURES).forEach((s) => {
            if(s.structureType === STRUCTURE_ROAD)
            {
              costs.set(s.pos.x, s.pos.y, 1);
            }
            else if (s.structureType !== STRUCTURE_CONTAINER &&
                    (s.structureType !== STRUCTURE_RAMPART ||
                     !s.my))
            {
              costs.set(s.pos.x, s.pos.y, 0xff);
            }
          });

          room.find(FIND_CREEPS).forEach(function(creep) {
            costs.set(creep.pos.x, creep.pos.y, 0xff);
          });

          return costs;
        }

        return false;
      }
    }

    let ret = PathFinder.search(from, to, options);

    console.log("See how this works", ret.path);
    console.log("Used CPU", Game.cpu.getUsed() - startCpu);
  }*/
}

export const RAMPARTTARGET = 11000000;
export const WALLTARGET = 3350000;
