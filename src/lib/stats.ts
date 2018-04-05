import {Kernel} from '../os/kernel'
//import {Utils} from '../lib/utils'


export const Stats = {
  build(kernel: Kernel){
    if(!Memory.stats){ Memory.stats = {}}

    Memory.stats['gcl.progress'] = Game.gcl.progress
    Memory.stats['gcl.progressTotal'] = Game.gcl.progressTotal
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

    let processCounts = _.reduce(kernel.execOrder, (types, item: {type: string}) => {
      if(!types[item.type])
      {
        types[item.type] = {type: item.type, count: 0};
      }

      types[item.type].count++;
      return types;
    }, {})

    _.forEach(kernel.execOrder, function(execed: {type: string, cpu: number}){
      Memory.stats['processes.types.' + execed.type] += execed.cpu
    })

    _.forEach(processCounts, function(p: {type: string, count: number}) {
      let holder = Memory.stats['processes.types.' + p.type] / p.count;
      Memory.stats['processes.average.counts.' + p.type] = p.count;
      Memory.stats['processes.average.types.' + p.type] = holder;
    })

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
            Memory.stats['rooms.' + roomName + '.storage.energy'] = room.storage.store.energy
            Memory.stats['rooms.' + roomName + '.storage.minerals'] = _.sum(room.storage.store) - room.storage.store.energy;
          }

          if(room.terminal)
          {
            Memory.stats['rooms.' + roomName + '.terminal.energy'] = room.terminal.store.energy
            Memory.stats['rooms.' + roomName + '.terminal.minerals'] = _.sum(room.terminal.store) - room.terminal.store.energy;
          }

          const mineral = <Mineral[]>room.find(FIND_MINERALS);
          Memory.stats['rooms.' + roomName + '.mineral_available'] = mineral[0].mineralAmount
          Memory.stats['rooms.' + roomName + '.tickets_to_regeneration'] = mineral[0].ticksToRegeneration

          /*const ground_resources = <Resource[]>room.find(FIND_DROPPED_RESOURCES);
          const reduced_resources = _.reduce(ground_resources, (acc, res) => { acc[res.resourceType] = _.get(acc, [res.resourceType], 0) + res.amount; return acc; }, {});
          Memory.stats['rooms.' + roomName + '.ground_resources'] = ground_resources: reduced_resources*/

          const structure_types = new Set(room.find(FIND_STRUCTURES).map((s: Structure) => s.structureType));
          const structure_info = {};
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
      }
    })
  }
}
