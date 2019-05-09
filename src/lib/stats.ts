import {Kernel} from '../os/kernel'
import { PRODUCT_LIST, MINERALS_RAW } from 'processTypes/buildingProcesses/mineralTerminal';
//import {Utils} from '../lib/utils'


export const Stats = {
  build(kernel: Kernel){
    if(!Memory.stats){ Memory.stats = {}}

    Memory.stats['gcl.progress'] = Game.gcl.progress
    Memory.stats['gcl.progressTotal'] = Game.gcl.progressTotal

    let last = (Memory.gclAmount === undefined) ? 0 : Memory.gclAmount;
    Memory.stats['gcl.gclAmount'] = Game.gcl.progress - last;
    console.log('Stats', Game.gcl.progress, last, Game.gcl.progress-last)
    Memory.gclAmount = Game.gcl.progress;
    Memory.stats['gcl.level'] = Game.gcl.level
    Memory.stats['cpu.getUsed'] = Game.cpu.getUsed()
    Memory.stats['cpu.limit'] = Game.cpu.limit
    Memory.stats['cpu.bucket'] = Game.cpu.bucket
    Memory.stats['cpu.kernelLimit'] = kernel.limit
    Memory.stats['memory.size'] = RawMemory.get().length
    Memory.stats['market.credits'] = Game.market.credits

    Memory.stats['processes.counts.total'] = Object.keys(kernel.processTable).length
    Memory.stats['processes.counts.run'] = kernel.execOrder.length
    Memory.stats['processes.counts.suspend'] = kernel.suspendCount
    Memory.stats['processes.counts.missed'] = (Object.keys(kernel.processTable).length - kernel.execOrder.length - kernel.suspendCount)

    if(Memory.stats['processes.counts.missed'] < 0){
      Memory.stats['processes.counts.missed'] = 0
    }

    _.forEach(Object.keys(kernel.processTypes), function(type){
      Memory.stats['processes.types.' + type] = 0
    })

    Memory.stats['processes.types.undefined'] = 0
    Memory.stats['processes.types.init'] = 0
    Memory.stats['processes.types.flagWatcher'] = 0

    if(typeof Game.cpu.getHeapStatistics === "function")
    {
      let heapStats = Game.cpu.getHeapStatistics();
      let heapPercent = Math.round(((heapStats.total_heap_size + heapStats.externally_allocated_size) /
                                      heapStats.heap_size_limit) * 100);
      Memory.stats['memory.heapPercent'] = heapPercent;
    }

    let processCounts = _.reduce(kernel.execOrder, (types: {type: string, count: number}[], item: {type: string}) => {
      if(!types[item.type])
      {
        types[item.type] = {type: item.type, count: 0};
      }

      types[item.type].count++;
      return types;
    })

    _.forEach(kernel.execOrder, function(execed: {type: string, cpu: number}){
      Memory.stats['processes.types.' + execed.type] += execed.cpu
    })

    _.forEach(processCounts, function(p: {type: string, count: number}) {
      let holder = Memory.stats['processes.types.' + p.type] / p.count;
      Memory.stats['processes.average.counts.' + p.type] = p.count;
      Memory.stats['processes.average.types.' + p.type] = holder;

      //console.log(p.type, "average", Memory.stats['processes.average.types.' + p.type]);
    })

    let remoteIndex = 0;

    let boostAmounts: {
      [mineralType: string]: number
    } = {};

    let basicMineralAmounts: {
      [mineralType: string]: number
    } = {};

    Memory.stats['rooms.E44S51'] = undefined

    let storageEnergy = 0;
    let terminalEnergy = 0;

    let mineralCountdown: {
      [mineralType: string]: number
    } = {}

    let lowMineralRooms: {
      [mineralType: string]: string[]
    } = {}

    _.forEach(Object.keys(kernel.data.roomData), function(roomName){
      let room = Game.rooms[roomName]

        /*Memory.stats['rooms.E43S58.storage.energy'] = undefined
        Memory.stats['rooms.E43S58.storage.minerals'] = undefined
        Memory.stats['rooms.E43S58.rcl.level'] = undefined
        Memory.stats['rooms.E43S58.rcl.progress'] = undefined
        Memory.stats['rooms.E43S58.rcl.progressTotal'] = undefined
        Memory.stats['rooms.E43S58.rcl.ticksToDowngrade'] = undefined

        Memory.stats['rooms.E43S58.energy_available'] = undefined
        Memory.stats['rooms.E43S58.energy_capacity_available'] = undefined
        Memory.stats['rooms.E43S58.num_creeps'] = undefined
        Memory.stats['rooms.E43S58.link_energy'] = undefined
        Memory.stats['rooms.E43S58.source_energy'] = undefined
        Memory.stats['rooms.E43S58.spawns_spawning'] = undefined
        Memory.stats['rooms.E43S58.construction_sites'] = undefined
        Memory.stats['rooms.E43S58.tower_energy'] = undefined
        Memory.stats['rooms.E43S58.container_energy'] = undefined
        Memory.stats['rooms.E43S58.creep_energy'] = undefined
        Memory.stats['rooms.E43S58.num_enemy_creeps'] = undefined
*/

      if(room)
      {
        if(room.controller && room.controller.my){
          Memory.stats['rooms.' + roomName + '.rcl.level'] = room.controller.level
          Memory.stats['rooms.' + roomName + '.rcl.progress'] = room.controller.progress
          Memory.stats['rooms.' + roomName + '.rcl.progressTotal'] = room.controller.progressTotal
          Memory.stats['rooms.' + roomName + '.rcl.ticksToDowngrade'] = room.controller.ticksToDowngrade

          Memory.stats['rooms.' + roomName + '.energy_available'] = room.energyAvailable
          Memory.stats['rooms.' + roomName + '.energy_capacity_available'] = room.energyCapacityAvailable
          //Memory.stats['rooms.' + roomName + '.ramparts.target'] = Utils.rampartHealth(kernel, roomName)
          let creeps = <Creep[]>_.filter(Game.creeps, c => {
            return (c.pos.roomName === room.name && c.my);
          });
          Memory.stats['rooms.' + roomName + '.num_creeps'] = creeps ? creeps.length : 0;

          const enemyCreeps = room.find(FIND_HOSTILE_CREEPS);
          Memory.stats['rooms.' + roomName + '.num_enemy_creeps'] = enemyCreeps ? enemyCreeps.length : 0;

          const creep_energy = _.sum(Game.creeps, c => c.pos.roomName == room.name ? c.carry.energy : 0);
          Memory.stats['rooms.' + roomName + '.creep_energy'] = creep_energy;

          const containers = <StructureContainer[]>room.find(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_CONTAINER});
          const container_energy = _.sum(containers, c => c.store.energy);
          Memory.stats['rooms.' + roomName + '.container_energy'] = container_energy;

          const towers = <StructureTower[]>room.find(FIND_STRUCTURES, { filter: s =>  s.structureType == STRUCTURE_TOWER});
          Memory.stats['rooms.' + roomName + '.tower_energy'] = _.sum(towers, t => t.energy);

          const const_sites = <ConstructionSite[]>room.find(FIND_CONSTRUCTION_SITES, { filter: cs => cs.my});
          Memory.stats['rooms.' + roomName + '.construction_sites'] = const_sites.length;

          const spawns = <StructureSpawn[]>room.find(FIND_MY_SPAWNS);
          const spawns_spawning = _.sum(spawns, s => s.spawning ? 1 : 0);
          Memory.stats['rooms.' + roomName + '.spawns_spawning'] = spawns_spawning;

          const sources = <Source[]>room.find(FIND_SOURCES);
          const source_energy = _.sum(sources, s => s.energy);
          Memory.stats['rooms.' + roomName + '.source_energy'] = source_energy;

          const links = <StructureLink[]>room.find(FIND_STRUCTURES, { filter: s => s.structureType == STRUCTURE_LINK && s.my });
          const link_energy = _.sum(links, l => l.energy);
          Memory.stats['rooms.' + roomName + '.link_energy'] = link_energy;

          if(room.storage){
            storageEnergy += room.storage.store.energy;
            Memory.stats['rooms.' + roomName + '.storage.energy'] = room.storage.store.energy
            Memory.stats['rooms.' + roomName + '.storage.minerals'] = _.sum(room.storage.store) - room.storage.store.energy;
          }
          else
          {
            Memory.stats['rooms.' + roomName + '.storage.energy'] = undefined;
            Memory.stats['rooms.' + roomName + '.storage.minerals'] = undefined;
          }

          if(room.terminal && room.terminal.my)
          {
            terminalEnergy += room.terminal.store.energy;
            Memory.stats['rooms.' + roomName + '.terminal.energy'] = room.terminal.store.energy
            Memory.stats['rooms.' + roomName + '.terminal.minerals'] = _.sum(room.terminal.store) - room.terminal.store.energy;

            // Total Production boost amounts in terminals.
            let terminal = room.terminal;
            for(let mineral in PRODUCT_LIST)
            {
              let type = PRODUCT_LIST[mineral];
              if(terminal.store.hasOwnProperty(type))
              {
                if(!boostAmounts[type])
                {
                  boostAmounts[type] = 0;
                }

                boostAmounts[type] += terminal.store[type]!;
              }
            }

            // Basic Mineral amounts
            for(let mineral in MINERALS_RAW)
            {

              let type = MINERALS_RAW[mineral];
              if(!lowMineralRooms[type])
              {
                lowMineralRooms[type] = [];
              }

              if(!basicMineralAmounts[type])
              {
                basicMineralAmounts[type] = 0;
                lowMineralRooms[type].push(room.name);
              }

              if(terminal.store.hasOwnProperty(type))
              {
                basicMineralAmounts[type] += terminal.store[type]!;
                if(terminal.store[type]! < 1000)
                {
                  lowMineralRooms[type].push(room.name);
                }
              }
            }
          }
          else
          {
            Memory.stats['rooms.' + roomName + '.terminal.energy'] = undefined
            Memory.stats['rooms.' + roomName + '.terminal.minerals'] = undefined

          }

          const mineral = <Mineral[]>room.find(FIND_MINERALS);
          Memory.stats['rooms.' + roomName + '.mineral_available'] = mineral[0].mineralAmount
          Memory.stats['rooms.' + roomName + '.tickets_to_regeneration'] = mineral[0].ticksToRegeneration;



          //const structure_types = new Set(room.find(FIND_STRUCTURES).map((s: Structure) => s.structureType));

          let structure_types = room.find(FIND_STRUCTURES).map((s: Structure) => s.structureType);
          structure_types = _.unique(structure_types, (h) => {
            return h;
          })

          const structure_info: {[s: string]: { count: number, min_hits: number, max_hits: number}} = {};
          for(const s of structure_types)
          {
            const ss = room.find(FIND_STRUCTURES, {filter: str => str.structureType == s});
            let min = <Structure>_.min(ss, 'hits');
            let min_hits = min.hits;
            let max = <Structure>_.max(ss, 'hits');
            let max_hits = max.hits;
            structure_info[s] = {
              count: ss.length,
              min_hits: min_hits,
              max_hits: max_hits,
            };
          }

          Memory.stats['rooms.' + roomName + '.structure_info'] = structure_info;

        }
        else if(room.controller && !room.controller.my)
        {
          if(roomName === 'E43S58')
            {
              Memory.stats['rooms.' + roomName + '.storage.energy'] = undefined
              Memory.stats['rooms.' + roomName + '.storage.minerals'] = undefined
              Memory.stats['rooms.' + roomName + '.rcl.level'] = undefined
              Memory.stats['rooms.' + roomName + '.rcl.progress'] = undefined
              Memory.stats['rooms.' + roomName + '.rcl.progressTotal'] = undefined
              Memory.stats['rooms.' + roomName + '.rcl.ticksToDowngrade'] = undefined

              Memory.stats['rooms.' + roomName + '.energy_available'] = undefined
              Memory.stats['rooms.' + roomName + '.energy_capacity_available'] = undefined
              Memory.stats['rooms.' + roomName + '.num_creeps'] = undefined
              Memory.stats['rooms.' + roomName + '.link_energy'] = undefined
              Memory.stats['rooms.' + roomName + '.source_energy'] = undefined
              Memory.stats['rooms.' + roomName + '.spawns_spawning'] = undefined
              Memory.stats['rooms.' + roomName + '.construction_sites'] = undefined
              Memory.stats['rooms.' + roomName + '.tower_energy'] = undefined
              Memory.stats['rooms.' + roomName + '.container_energy'] = undefined
              Memory.stats['rooms.' + roomName + '.creep_energy'] = undefined
              Memory.stats['rooms.' + roomName + '.num_enemy_creeps'] = undefined
            }

          if(room.controller.reservation)
          {
            Memory.stats['remote_rooms.' + roomName + '.reservation'] = room.controller.reservation.ticksToEnd

            const sources = <Source[]>room.find(FIND_SOURCES);
            const source_energy = _.sum(sources, s => s.energy);
            Memory.stats['remote_rooms.' + roomName + '.source_energy'] = source_energy;

            remoteIndex++;
          }
        }
      }
    })

    //console.log('Stats stats', boostAmounts, Object.keys(boostAmounts).length)
    _.forEach(Object.keys(boostAmounts), (ba) => {
      Memory.stats['terminals.' + ba + '.amount'] = boostAmounts[ba];
    })


    _.forEach(Object.keys(basicMineralAmounts), (bm) => {
      Memory.stats['terminals.basic.' + bm + '.amount'] = basicMineralAmounts[bm];
    })

    for(let resourceType of PRODUCT_LIST)
    {
      Memory.stats["lab.processCount." + resourceType] = kernel.data.labProcesses[resourceType] || undefined;
    }

    Memory.stats['lab.activeLabCount'] = kernel.data.activeLabCount;

    console.log("<BOLD>Stats</BOLD>", Game.time);
    console.log("<TABLE border=1><TR><TD>Storage Total Energy</TD><TD>Terminal</TD></TR><TR><TD>", storageEnergy, "</TD><TD>", terminalEnergy, "</TD></TR></TABLE>");
    console.log("<Bold>Minerals</BOLD");

    let table = "<TABLE border=1>";
    _.forEach(Object.keys(lowMineralRooms), (key)=>{
      table += "<TR><TD>" + key + "</TD>";
      _.forEach(lowMineralRooms[key], (lRoom)=>{
        table += "<TD>" + lRoom + "</TD>";
      })
      table += "</TR>"
    })


    table += "</TABLE>";

    console.log(table);
  },

  DisplayStats()
  {
    console.log("<BOLD>Stats</BOLD>", Game.time);
  }
}
