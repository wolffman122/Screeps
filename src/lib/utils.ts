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

  inflateCreeps: function(list: string[]): Creep[]{
    return _.transform(list, function(result, entry){
      result.push(Game.creeps[entry])
    })
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
      if(!_.includes(kernel.data.usedSpawns, spawn.id) &&!spawn.spawning && spawn.canCreateCreep(body) === OK){

        spawn.createCreep(body, name, memory)
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

    if(creep.room.name == 'E42S48')
    {
      console.log('WTF WTF WTF 1')
    }

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

    if(creep.room.name == 'E42S48')
    {
      console.log('WTF WTF WTF ' + withdraws.length);
    }

    if(withdraws.length === 0){
      withdraws = <never[]>proc.kernel.data.roomData[creep.room.name].spawns
      withdraws = <never[]>_.filter(withdraws, function(spawn: StructureSpawn){
        if(creep.room.name == 'E42S48')
        {
          console.log('Spawn Energy ' + spawn.energy + ' Room Energy ' + spawn.room.energyAvailable + ' Total Energy ' + (spawn.room.energyCapacityAvailable -50))
        }
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

          if(path.length < bestDistance){
            bestDistance = path.length
            bestRoom = room.name
          }
        }
      }
    })

    return bestRoom
  },

  rampartHealth(kernel: Kernel, roomName: string)
  {
    let room = Game.rooms[roomName];

    if(room.controller!.level < 3)
    {
      return 0;
    }
    else
    {
      let max = room.controller!.level * 484375;

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
      let max = room.controller!.level * 250000;

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
  }
}
