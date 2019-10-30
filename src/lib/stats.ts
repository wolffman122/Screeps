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

    _.forEach(Object.keys(kernel.processLogs), pl => {
      Memory.stats['processLogs.' + pl + '.cpuUsed'] = kernel.processLogs[pl].cpuUsed;
      Memory.stats['processLogs.' + pl + '.count'] = kernel.processLogs[pl].count;
      Memory.stats['processLogs.' + pl + '.average'] = kernel.processLogs[pl].cpuUsed / kernel.processLogs[pl].count;
    })

    if(typeof Game.cpu.getHeapStatistics === "function")
    {
      let heapStats = Game.cpu.getHeapStatistics();
      let heapPercent = Math.round(((heapStats.total_heap_size + heapStats.externally_allocated_size) /
                                      heapStats.heap_size_limit) * 100);
      Memory.stats['memory.heapPercent'] = heapPercent;
    }

    /*let processCounts = _.reduce(kernel.execOrder, (types: {type: string, count: number}[], item: {type: string}) => {
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
    })*/

    let remoteIndex = 0;

    let boostTerminalAmounts: {
      [mineralType: string]: number
    } = {};

    let basicTerminalMineralAmounts: {
      [mineralType: string]: number
    } = {};

    let boostStorageAmounts: {
      [mineralType: string]: number
    } = {};

    let basicStorageMineralAmounts: {
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
            let storage = room.storage;
            for(let mineral in PRODUCT_LIST)
            {
              let type = PRODUCT_LIST[mineral];
              if(terminal.store.hasOwnProperty(type))
              {
                if(!boostTerminalAmounts[type])
                {
                  boostTerminalAmounts[type] = 0;
                }

                boostTerminalAmounts[type] += terminal.store[type]!;
              }

              if(storage.store.hasOwnProperty(type))
              {
                if(!boostStorageAmounts[type])
                {
                  boostStorageAmounts[type] = 0;
                }

                boostStorageAmounts[type] += storage.store[type];
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

              if(!basicTerminalMineralAmounts[type])
              {
                basicTerminalMineralAmounts[type] = 0;
                lowMineralRooms[type].push(room.name);
              }

              if(terminal.store.hasOwnProperty(type))
              {
                basicTerminalMineralAmounts[type] += terminal.store[type]!;
                if(terminal.store[type]! < 1000)
                {
                  lowMineralRooms[type].push(room.name);
                }
              }

              if(!basicStorageMineralAmounts[type])
                basicStorageMineralAmounts[type] = 0;

              if(storage.store.hasOwnProperty(type))
                basicStorageMineralAmounts[type] += storage.store[type]!;

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

          if(mineral[0].ticksToRegeneration !== undefined)
          {
            if(mineralCountdown[mineral[0].mineralType] === undefined)
              mineralCountdown[mineral[0].mineralType] = 50000;

            if(mineralCountdown[mineral[0].mineralType] > mineral[0].ticksToRegeneration)
              mineralCountdown[mineral[0].mineralType] = mineral[0].ticksToRegeneration;
          }

          Memory.stats['rooms.' + roomName + 'miningStopTime'] = 0;
          if(room.memory.miningStopTime !== undefined)
          {
            let total = Game.time - room.memory.miningStopTime;
            Memory.stats['rooms.' + roomName + 'miningStopTime'] = total;
          }




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

    ///////////// Log minimum mineral regeneration tickst ///////////////////////
    _.forEach(Object.keys(mineralCountdown), (mc) => {
      Memory.stats['Resources.Regeneration.' + mc] = mineralCountdown[mc];
    });

    //console.log('Stats stats', boostAmounts, Object.keys(boostAmounts).length)
    _.forEach(Object.keys(boostTerminalAmounts), (ba) => {
      Memory.stats['terminals.' + ba + '.amount'] = boostTerminalAmounts[ba];
    })


    _.forEach(Object.keys(basicTerminalMineralAmounts), (bm) => {
      Memory.stats['terminals.basic.' + bm + '.amount'] = basicTerminalMineralAmounts[bm];
    })

    _.forEach(Object.keys(boostStorageAmounts), (ba)=>{
      Memory.stats['storage.' + ba + '.amount'] = boostStorageAmounts[ba];
    })

    _.forEach(Object.keys(basicStorageMineralAmounts), (bm) => {
      Memory.stats['storages.basic.' + bm + '.amount'] = basicStorageMineralAmounts[bm];
    })

    kernel.data.labProcesses[RESOURCE_CATALYZED_KEANIUM_ACID] = undefined;
    //kernel.data.labProcesses[RESOURCE_GHODIUM] = undefined;
    Memory.stats["lab.processCount." + RESOURCE_GHODIUM] = undefined;
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
