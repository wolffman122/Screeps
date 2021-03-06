import {Kernel} from '../os/kernel'
import { PRODUCT_LIST_WITH_AMOUNTS, MINERALS_RAW } from 'processTypes/buildingProcesses/mineralTerminal';
//import {Utils} from '../lib/utils'


export const Stats = {
  build(kernel: Kernel){
    if(!Memory.stats){ Memory.stats = {}}

    Memory.stats['gcl.progress'] = Game.gcl.progress
    Memory.stats['gcl.progressTotal'] = Game.gcl.progressTotal

    let last = (Memory.gclAmount === undefined) ? 0 : Memory.gclAmount;
    Memory.stats['gcl.gclAmount'] = Game.gcl.progress - last;
    console.log('Stats', Game.gcl.progress, last, Game.gcl.progress-last)
    console.log('Stats CPU used', Game.cpu.getUsed(), 'Bucket', Game.cpu.bucket)
    Memory.gclAmount = Game.gcl.progress;
    Memory.stats['gcl.level'] = Game.gcl.level
    Memory.stats['cpu.getUsed'] = Game.cpu.getUsed()
    Memory.stats['cpu.limit'] = Game.cpu.limit
    Memory.stats['cpu.bucket'] = Game.cpu.bucket
    Memory.stats['cpu.kernelLimit'] = kernel.limit
    Memory.stats['memory.size'] = RawMemory.get().length
    Memory.stats['memory.roomCount'] = Object.keys(Memory.rooms).length;
    Memory.stats['market.credits'] = Game.market.credits

    Memory.stats['gpl.level'] = Game.gpl.level;
    Memory.stats['gpl.progress'] = Game.gpl.progress;
    Memory.stats['gpl.progressTotal'] = Game.gpl.progressTotal;
    Memory.stats['gpl.powerProcessed'] = global.powerProcessed;
    Memory.stats['gpl.nextLevel'] = Game.gpl.level * 2000 + 1000;

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

    let totalCommoditiesAmount: {
      [commodity: string]: number;
    } = {};

    let totalDepositsAmount: {
      [desposit: string]: number;
    } = {};

    Memory.stats['rooms.E44S51'] = undefined

    let storageEnergy = 0;
    let terminalEnergy = 0;

    let mineralCountdown: {
      [mineralType: string]: number
    } = {}

    let lowMineralRooms: {
      [mineralType: string]: {
        roomName: string,
        amount: number
      }[]
     } = {};

    let lowBoostRooms: {
      [boostType: string]: string[]
    } = {}


    // let roomNames = '';
    // for(let roomName in Game.rooms)
    // {
    //   if(kernel.data.roomData[roomName] === undefined)
    //     {
    //       Memory.stats['rooms.' + roomName + '.rcl.level'] = undefined;
    //       Memory.stats['rooms.' + roomName + '.rcl.progress'] = undefined;
    //       Memory.stats['rooms.' + roomName + '.rcl.progressTotal'] = undefined;
    //       Memory.stats['rooms.' + roomName + '.rcl.ticksToDowngrade'] = undefined;
    //       Memory.stats['rooms.' + roomName + '.energy_available'] = undefined;
    //       Memory.stats['rooms.' + roomName + '.energy_capacity_available'] = undefined;
    //       Memory.stats['rooms.' + roomName + '.num_creeps'] = undefined;
    //       Memory.stats['rooms.' + roomName + '.num_enemy_creeps'] = undefined;
    //       Memory.stats['rooms.' + roomName + '.creep_energy'] = undefined;
    //       Memory.stats['rooms.' + roomName + '.creep_energy'] = undefined;
    //       Memory.stats['rooms.' + roomName + '.tower_energy'] = undefined;
    //       Memory.stats['rooms.' + roomName + '.construction_sites'] = undefined;
    //       Memory.stats['rooms.' + roomName + '.spawns_spawning'] = undefined;
    //       Memory.stats['rooms.' + roomName + '.source_energy'] = undefined;
    //       Memory.stats['rooms.' + roomName + '.link_energy'] = undefined;
    //       Memory.stats['rooms.' + roomName + '.storage.energy'] = undefined;
    //       Memory.stats['rooms.' + roomName + '.storage.minerals'] = undefined;
    //       Memory.stats['rooms.' + roomName + '.terminal.energy'] = undefined;
    //       Memory.stats['rooms.' + roomName + '.terminal.minerals'] = undefined;
    //       Memory.stats['rooms.' + roomName + '.mineral_available'] = undefined;
    //       Memory.stats['rooms.' + roomName + '.tickets_to_regeneration'] = undefined;
    //       Memory.stats['rooms.' + roomName + 'miningStopTime'] = undefined;
    //       Memory.stats['rooms.' + roomName + '.structure_info'] = undefined;
    //       Memory.stats['rooms.' + roomName + '.container_energy'] = undefined;
    //     }
    // }
    // console.log(this.name, roomNames);

    let storageRoomMost = '';
    let terminalRoomMost = '';
    let storageMost = 0;
    let terminalMost = 0;
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
          let creeps = room.find(FIND_MY_CREEPS);
          Memory.stats['rooms.' + roomName + '.num_creeps'] = creeps ? creeps.length : 0;

          Memory.stats['rooms.' + roomName + '.num_enemy_creeps'] = room.memory.hostileCreepIds ? room.memory.hostileCreepIds.length : 0;

          const creep_energy = _.sum(Game.creeps, c => c.pos.roomName == room.name ? c.carry.energy : 0);
          Memory.stats['rooms.' + roomName + '.creep_energy'] = creep_energy;

          const containers = kernel.data.roomData[room.name].containers;
          //const containers = <StructureContainer[]>room.find(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_CONTAINER});
          const container_energy = _.sum(containers, c => c.store.energy);
          Memory.stats['rooms.' + roomName + '.container_energy'] = container_energy;

          const towers = kernel.data.roomData[room.name].towers
          //const towers = <StructureTower[]>room.find(FIND_STRUCTURES, { filter: s =>  s.structureType == STRUCTURE_TOWER});
          Memory.stats['rooms.' + roomName + '.tower_energy'] = _.sum(towers, t => t.energy);

          const const_sites = kernel.data.roomData[room.name].constructionSites;
          //const const_sites = <ConstructionSite[]>room.find(FIND_CONSTRUCTION_SITES, { filter: cs => cs.my});
          Memory.stats['rooms.' + roomName + '.construction_sites'] = const_sites.length;

          const spawns = kernel.data.roomData[room.name].spawns
          //const spawns = <StructureSpawn[]>room.find(FIND_MY_SPAWNS);
          const spawns_spawning = _.sum(spawns, s => s.spawning ? 1 : 0);
          Memory.stats['rooms.' + roomName + '.spawns_spawning'] = spawns_spawning;

          const sources = kernel.data.roomData[room.name].sources;
          //const sources = <Source[]>room.find(FIND_SOURCES);
          const source_energy = _.sum(sources, s => s.energy);
          Memory.stats['rooms.' + roomName + '.source_energy'] = source_energy;

          const links = kernel.data.roomData[room.name].links.filter(l => l.my);
          //const links = <StructureLink[]>room.find(FIND_STRUCTURES, { filter: s => s.structureType == STRUCTURE_LINK && s.my });
          const link_energy = _.sum(links, l => l.energy);
          Memory.stats['rooms.' + roomName + '.link_energy'] = link_energy;

          if(room.storage){
            storageEnergy += room.storage.store.energy;
            Memory.stats['rooms.' + roomName + '.storage.energy'] = room.storage.store.energy
            Memory.stats['rooms.' + roomName + '.storage.minerals'] = room.storage.store.getUsedCapacity() - room.storage.store.energy;
            if(room.storage.store.getUsedCapacity(RESOURCE_OPS) > 0)
            {
              Memory.stats['rooms.' + roomName + '.storage.ops'] = room.storage.store.getUsedCapacity(RESOURCE_OPS);
            }
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
            Memory.stats['rooms.' + roomName + '.terminal.minerals'] = room.terminal.store.getUsedCapacity() - room.terminal.store.energy;

            // Total Production boost amounts in terminals.
            let terminal = room.terminal;
            let storage = room.storage;
            for(let mineral in PRODUCT_LIST_WITH_AMOUNTS)
            {
              let type = PRODUCT_LIST_WITH_AMOUNTS[mineral];
              if(terminal.store.hasOwnProperty(type.res))
              {
                if(!boostTerminalAmounts[type.res])
                {
                  boostTerminalAmounts[type.res] = 0;
                }

                boostTerminalAmounts[type.res] += terminal.store[type.res]!;
              }

              if(storage.store.hasOwnProperty(type.res))
              {
                if(!boostStorageAmounts[type.res])
                {
                  boostStorageAmounts[type.res] = 0;
                }

                boostStorageAmounts[type.res] += storage.store[type.res];
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
              }

              if(terminal.store.hasOwnProperty(type))
              {
                basicTerminalMineralAmounts[type] += terminal.store[type]!;
                if(terminal.store[type]! < 1000)
                {
                  lowMineralRooms[type].push({roomName: room.name, amount: terminal.store[type]});
                }
              }

              for(let boost in PRODUCT_LIST_WITH_AMOUNTS)
              {
                let type = PRODUCT_LIST_WITH_AMOUNTS[boost].res;
                if(!lowBoostRooms[type])
                  lowBoostRooms[type] = [];

                if(!boostTerminalAmounts[type])
                {
                  boostTerminalAmounts[type] = 0;
                  lowBoostRooms[type].push(room.name);
                }

                if(terminal.store.hasOwnProperty(type))
                {
                  boostTerminalAmounts[type] += terminal.store[type];
                  if(terminal.store[type] < 2000)
                    lowBoostRooms[type].push(room.name);
                }
                else
                  lowBoostRooms[type].push(room.name);
              }

              if(!basicStorageMineralAmounts[type])
                basicStorageMineralAmounts[type] = 0;

              if(storage.store.hasOwnProperty(type))
                basicStorageMineralAmounts[type] += storage.store[type]!;

            }

            for(let c of Object.keys(COMMODITIES))
            {
              let amount = 0;
              if(MINERALS_RAW.indexOf(<MineralConstant>c) === -1
                  && c !== RESOURCE_ENERGY
                  && c !== RESOURCE_GHODIUM)
              {
                if(c === RESOURCE_BATTERY)
                {
                  if(room.storage?.store.getUsedCapacity(c) > storageMost)
                  {
                    storageMost = room.storage?.store.getUsedCapacity(c);
                    storageRoomMost = room.name;
                  }

                  if(room.terminal?.store.getUsedCapacity(c) > terminalMost)
                  {
                    terminalMost = room.terminal?.store.getUsedCapacity(c);
                    terminalRoomMost = room.name;
                  }
                }

                if(!totalCommoditiesAmount[c])
                  totalCommoditiesAmount[c] = 0;

                if(room.storage?.store.getUsedCapacity(<CommodityConstant>c) > 0)
                  totalCommoditiesAmount[c] += room.storage?.store.getUsedCapacity(<CommodityConstant>c);

                if(room.terminal?.store.getUsedCapacity(<CommodityConstant>c) > 0)
                  totalCommoditiesAmount[c] += room.terminal?.store.getUsedCapacity(<CommodityConstant>c);

              }
            }

            for(let i = 0; i < global.depositTypes.length; i++)
            {
              const depositType = global.depositTypes[i];
              // if(depositType === RESOURCE_MIST)
              // {
              //   if(room.storage?.store.getUsedCapacity(depositType) > storageMost)
              //   {
              //     storageMost = room.storage?.store.getUsedCapacity(depositType);
              //     storageRoomMost = room.name;
              //   }

              //   if(room.terminal?.store.getUsedCapacity(depositType) > terminalMost)
              //   {
              //     terminalMost = room.terminal?.store.getUsedCapacity(depositType);
              //     terminalRoomMost = room.name;
              //   }
              // }

              if(!totalDepositsAmount[depositType])
                totalDepositsAmount[depositType] = 0;

              if(room.storage?.store.getUsedCapacity(depositType) > 0)
                  totalDepositsAmount[depositType] += room.storage?.store.getUsedCapacity(depositType);

              if(room.terminal?.store.getUsedCapacity(depositType) > 0)
                totalDepositsAmount[depositType] += room.terminal?.store.getUsedCapacity(depositType);
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
          if(room.controller.reservation)
          {
            Memory.stats['remote_rooms.' + roomName + '.reservation'] = room.controller.reservation.ticksToEnd

            const sources = kernel.data.roomData[room.name].sources;
            //const sources = <Source[]>room.find(FIND_SOURCES);
            const source_energy = _.sum(sources, s => s.energy);
            Memory.stats['remote_rooms.' + roomName + '.source_energy'] = source_energy;

            remoteIndex++;
          }
          else
            Memory.stats['rooms.'+ roomName] = undefined;
        }
      }
    })

    console.log('Stat storage', storageRoomMost, storageMost);
    console.log('Stat terminal', terminalRoomMost, terminalMost);

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

    for(let c in totalCommoditiesAmount)
      Memory.stats['commodities.' + c] = totalCommoditiesAmount[c];

    for(let d in totalDepositsAmount)
      Memory.stats['deposits.' + d] = totalDepositsAmount[d];

    //kernel.data.labProcesses[RESOURCE_GHODIUM] = undefined;
    Memory.stats["lab.processCount." + RESOURCE_GHODIUM] = undefined;
    for(let resourceType in PRODUCT_LIST_WITH_AMOUNTS)
    {
      const res = PRODUCT_LIST_WITH_AMOUNTS[resourceType].res
      Memory.stats["lab.processCount." + resourceType] = kernel.data.labProcesses[res] || undefined;
    }



    Memory.stats['lab.activeLabCount'] = kernel.data.activeLabCount;

    console.log("<BOLD>Stats</BOLD>", Game.time);
    console.log("<TABLE border=1><TR><TD>Storage Total Energy</TD><TD>Terminal</TD></TR><TR><TD>", storageEnergy, "</TD><TD>", terminalEnergy, "</TD></TR></TABLE>");
    console.log("<Bold>Minerals</BOLD");

    let table = "<TABLE border=1><TR><TH>Mineral</TH><TH>Count</TH><TH>Min Room</TH></TR>";

    _.forEach(Object.keys(lowMineralRooms), (key)=>{
      const minRoom = _.min(lowMineralRooms[key], lmr => lmr.amount);
      table += "<TR><TD>" + key + "</TD><TD>" + lowMineralRooms[key].length + "</TD><TD>" + (minRoom.roomName ?? "") + "</TD></TR>";
    })


    table += "</TABLE>";

    console.log(table);

    try
    {
      console.log("<BOLD>Boosts</BOLD>");
      let table2 = "<TABLE border=1>";
      _.forEach(Object.keys(lowBoostRooms), (key)=>{
        if(lowBoostRooms[key.length])
        {
          table2 += "<TR><TD>" + key + "</TD>";
          _.forEach(lowBoostRooms[key], (lRoom)=>{
            table2 += "<TD>" + lRoom + "</TD>";
          })
          table2 += "</TR>"
        }
      })

      table2 += "</TABLE>"

      console.log(table2);
    }
    catch(e)
    {
      console.log(this.name, 'table2', e)
    }
  },

  DisplayStats()
  {
    console.log("<BOLD>Stats</BOLD>", Game.time);
  }
}
