import { Process } from "os/process";
import { StructureManagementProcess } from "./structure";
import { AllTerminalManagementProcess } from "processTypes/buildingProcesses/allTerminal";
import { TerminalManagementProcess } from "processTypes/buildingProcesses/terminal";
import { Utils } from "lib/utils";
import { LabManagementProcess } from "./lab";

export class TransferManagementProcess extends Process
{
  type = 'tmp';
  metaData: TransferManagementProcessMetaData
  sourceRoom: Room;
  destRoom: Room;

  EnsureMetaData()
  {
    if(!this.metaData.upgraders)
      this.metaData.upgraders = [];

    if(!this.metaData.movers)
      this.metaData.movers = [];

    if(!this.metaData.builders)
      this.metaData.builders = [];

    if(!this.metaData.transportHealers)
      this.metaData.transportHealers = [];
  }

  run()
  {
    this.EnsureMetaData();

    console.log('Running &&&&&&&&&&&&&&&&&&&&&&&&', this.metaData.transferFlagName)
    const flag = Game.flags[this.metaData.transferFlagName];
    this.sourceRoom = Game.rooms[this.metaData.roomName];
    const destRoomName = flag.name.split('-')[2];
    this.destRoom = Game.rooms[destRoomName];

    this.ShutDownRamparts();
    this.ShutDownTransfers();
    this.SpawnUpgrader();

    if(this.destRoom.controller.level === 3)
    {
      if(!this.metaData.clearStorage && this.CheckStorage())
        this.metaData.clearStorage = true;

      console.log(this.name, 'Clear Storage', this.metaData.clearStorage);
      if(this.metaData.clearStorage)
        this.SpawnMover();
    }
    else if(this.destRoom.controller.level === 4)
    {
      if(!this.destRoom.storage)
      {
        const sites = this.destRoom.find(FIND_MY_CONSTRUCTION_SITES, {filter: c => c.structureType === STRUCTURE_STORAGE});
        if(sites.length)
        {
          this.SpawnBuilder(sites[0]);
        }
      }
      //if(this.metaData.clearStorage)
//        this.SpawnMover();
    }
    else if(this.destRoom.controller.level === 5)
    {
      if(this.roomInfo(this.destRoom.name).extensions.length < 30)
      {
        const sites = this.destRoom.find(FIND_MY_CONSTRUCTION_SITES);
        if(sites.length)
        {
          this.SpawnBuilder(sites[0]);
        }
      }
    }
    else if(this.destRoom.controller.level === 6)
    {
      if(this.roomInfo(this.destRoom.name).extensions.length < 40)
      {
        const sites = this.roomInfo(this.destRoom.name).constructionSites.filter(x => x.structureType === STRUCTURE_TERMINAL);
        if(sites.length)
          this.SpawnBuilder(sites[0]);
      }
      else if(this.roomInfo(this.destRoom.name).labs?.length < 3)
      {
        const sites = this.roomInfo(this.destRoom.name).constructionSites.filter(x => x.structureType === STRUCTURE_LAB);
        if(sites.length)
          this.SpawnBuilder(sites[0], 2);
      }

      if(this.roomInfo(this.destRoom.name).labs.length === 3)
        this.ShutDownLabs();

      if(!this.destRoom.terminal)
        this.SpawnHealerTransports();
      else
        this.TerminalTransfer(false);
    }
    else if(this.destRoom.controller.level === 6)
    {
      this.DumpMinerals();
    }


    this.CreepActions();

  }

  ShutDownRamparts()
  {
    const structureProcess = this.kernel.getProcessByName('sm-' + this.metaData.roomName);
    if(structureProcess instanceof StructureManagementProcess)
    {
      structureProcess.metaData.shutDownRamparts = true;
    }
  }

  ShutDownTransfers()
  {
    const Atmp = this.kernel.getProcessByName('atmp');
    if(Atmp instanceof AllTerminalManagementProcess)
    {
      if(!Atmp.metaData.shutDownTransfers)
        Atmp.metaData.shutDownTransfers = {};

      Atmp.metaData.shutDownTransfers[this.metaData.roomName] = true;
    }

    const terminal = this.kernel.getProcessByName('terminal')
    if(terminal instanceof TerminalManagementProcess)
    {
      if(!terminal.metaData.shutDownTransfers)
        terminal.metaData.shutDownTransfers = {};

        terminal.metaData.shutDownTransfers[this.metaData.roomName] = true;
    }
  }

  ShutDownLabs()
  {
    const labProcess = this.kernel.getProcessByName('labm-' + this.metaData.roomName);
    if(labProcess instanceof LabManagementProcess)
      labProcess.metaData.shutdownLabs= true;
  }

  CheckStorage()
  {
    const destStorage = this.destRoom.storage;
    const sourceStorage = this.sourceRoom.storage;
    const sourceTerminal = this.sourceRoom.terminal;

    if(destStorage)
    {
      const destAmount = destStorage.store.getUsedCapacity();
      const sourceFreeAmount = sourceStorage.store.getFreeCapacity();
      if(destAmount < sourceFreeAmount)
        return true;
    }
    {
      this.metaData.clearStorage = false;
    }

    return false;
  }

  DumpMinerals()
  {
    this.sourceRoom.memory.spinnerDump = true;
  }

  SpawnUpgrader()
  {
    let count = 1;
    if(this.destRoom.storage?.store[RESOURCE_ENERGY] > 200000)
      count = 2;

    console.log(this.name, 'SpawnUpgrader', this.metaData.upgraders.length)
    this.metaData.upgraders = Utils.clearDeadCreeps(this.metaData.upgraders);
    if(this.metaData.upgraders.length < count)
    {
      const creepName = this.name + '-u-' + Game.time;
      const spawned = Utils.spawn(
        this.kernel,
        this.metaData.roomName,
        'transferUpgrader',
        creepName,
        {});

      if(spawned)
        this.metaData.upgraders.push(creepName);
    }
  }

  SpawnMover()
  {
    this.metaData.movers = Utils.clearDeadCreeps(this.metaData.movers);
    if(this.metaData.movers.length < 1)
    {
      console.log(this.name, 'Spawn Mover');
      const creepName = this.name + '-m-' + Game.time;
      const spawned = Utils.spawn(
        this.kernel,
        this.metaData.roomName,
        'shHauler',
        creepName,
        {});

      if(spawned)
        this.metaData.movers.push(creepName);
    }
  }

  SpawnBuilder(site: ConstructionSite, count?: number)
  {
    const numberOfBuilders = (count) ? count : 1;
    console.log(this.name, 'Builders', this.metaData.builders.length)
    this.metaData.builders = Utils.clearDeadCreeps(this.metaData.builders);
    if(this.metaData.builders.length < numberOfBuilders)
    {
      const creepName = this.name + '-b-' + Game.time;
      const spawned = Utils.spawn(
        this.kernel,
        this.sourceRoom.name,
        'transferUpgrader',
        creepName,
        {target: site.id}
      );

      if(spawned)
        this.metaData.builders.push(creepName);
    }
  }

  SpawnHealerTransports()
  {
    console.log(this.name,'spawn healer trnasport')
    this.metaData.transportHealers = Utils.clearDeadCreeps(this.metaData.transportHealers);
    console.log(this.name,'spawn healer trnasport 1')
    if(this.metaData.transportHealers.length < 1)
    {
      console.log(this.name,'spawn healer trnasport 2')
      const creepName = this.name + '-t-' + Game.time;
      const spawned = Utils.spawn(
        this.kernel,
        this.sourceRoom.name,
        'transportHealer',
        creepName,
        {}
      );

      if(spawned)
        this.metaData.transportHealers.push(creepName);
    }
  }

  TerminalTransfer(everything: boolean)
  {
    const sourceTerminal = this.sourceRoom.terminal;
    const sourceStorage = this.sourceRoom.storage
    const destTerminal = this.destRoom.terminal;

    if(sourceTerminal.cooldown === 0)
    {
      if(sourceStorage.store[RESOURCE_ENERGY] > 100000)
      {
        for(let res in sourceTerminal.store)
        {
          if(destTerminal.store[RESOURCE_ENERGY] < 75000)
          {
            sourceTerminal.send(RESOURCE_ENERGY, 10000, this.destRoom.name);
            return
          }
          else if((res === RESOURCE_ENERGY || res === RESOURCE_CATALYZED_GHODIUM_ACID) && !everything)
            continue;

          if(sourceTerminal.store[res] > 100)
          {
            const cost = Game.market.calcTransactionCost(sourceTerminal.store[res], this.sourceRoom.name, this.destRoom.name);
            if(cost < sourceTerminal.store[RESOURCE_ENERGY]
              && destTerminal.store.getFreeCapacity() > sourceTerminal.store[res])
              sourceTerminal.send(res as ResourceConstant, sourceTerminal.store[res], this.destRoom.name);
          }
        }
      }
    }
  }

  CreepActions()
  {
    for(let i = 0; i < this.metaData.upgraders.length; i++)
    {
      const creep = Game.creeps[this.metaData.upgraders[i]];
      if(creep)
        this.UpgraderActions(creep);
    }

    for(let i = 0; i < this.metaData.movers.length; i++)
    {
      const creep = Game.creeps[this.metaData.movers[i]];
      if(creep)
        this.MoversActions(creep);
    }

    for(let i = 0; i < this.metaData.builders.length; i++)
    {
      const creep = Game.creeps[this.metaData.builders[i]];
      if(creep)
        this.BuilderActions(creep)
    }

    for(let i = 0; i < this.metaData.transportHealers.length; i++)
    {
      const creep = Game.creeps[this.metaData.transportHealers[i]];
      if(creep)
        this.TransportHealerActions(creep);
    }
  }

  UpgraderActions(creep: Creep)
  {
    // if(!creep.memory.boost)
    // {
    //   console.log(this.name,'Should not be in this boost part');
    //   const terminal = this.sourceRoom.terminal
    //   let allowUnBoosted = true;
    //   if(terminal?.store[RESOURCE_CATALYZED_GHODIUM_ACID] > 300)
    //     allowUnBoosted = false;

    //   creep.boostRequest([RESOURCE_CATALYZED_GHODIUM_ACID], allowUnBoosted);
    //   return;
    // }

    console.log(this.name, 'We Still upgrading', creep.pos);
    const controller = this.destRoom.controller;

    if(creep.room.name === this.sourceRoom.name && !creep.memory.full)
    {
      const storage = this.sourceRoom.storage;
      if(storage?.store[RESOURCE_ENERGY] > creep.store.getFreeCapacity())
      {
        if(!creep.pos.isNearTo(storage))
          creep.travelTo(storage);
        else
        {
          if(creep.withdraw(storage, RESOURCE_ENERGY) === OK)
            creep.memory.full = true;
        }
        creep.say('🏟');
        return;
      }
    }

    if(creep.room.name === this.sourceRoom.name || creep.memory.full)
    {
      if(!creep.pos.inRangeTo(controller, 3))
        creep.travelTo(controller, {range: 3});
      else
        creep.upgradeController(controller);

      if(creep.store.getUsedCapacity() === 0)
        creep.memory.full = false;

      creep.say('T🔼');
      return;
    }

    if(!creep.memory.full)
    {
      const storage = this.destRoom.storage;
      const terminal = this.destRoom.terminal;
      const container = this.roomInfo(this.destRoom.name).generalContainers[0];
      const controllerContainer = this.roomInfo(this.destRoom.name).controllerContainer;
      const powerSpawn = this.roomInfo(this.destRoom.name).powerSpawn;
      console.log(this.name, 'Container', container);

      if(controllerContainer?.store[RESOURCE_ENERGY] > creep.store.getCapacity())
      {
        if(!creep.pos.isNearTo(controllerContainer))
          creep.travelTo(controllerContainer);
        else
        {
          if(creep.withdraw(controllerContainer, RESOURCE_ENERGY) === OK)
            creep.memory.full = true;
        }

        return;
      }

      if(storage?.store[RESOURCE_ENERGY] > 0)
      {
        if(!creep.pos.isNearTo(storage))
          creep.travelTo(storage);
        else
        {
          if(creep.withdraw(storage, RESOURCE_ENERGY) === OK)
            creep.memory.full = true;
        }

        creep.say('🏟');
        return;
      }

      if(terminal?.store[RESOURCE_ENERGY] > 0)
      {
        if(!creep.pos.isNearTo(terminal))
          creep.travelTo(terminal);
        else
        {
          if(creep.withdraw(terminal, RESOURCE_ENERGY) === OK)
            creep.memory.full = true;
        }

        creep.say('🏦');
        return;
      }

      if(powerSpawn?.store[RESOURCE_ENERGY] > 0)
      {
        if(!creep.pos.isNearTo(powerSpawn))
          creep.travelTo(powerSpawn);
        else
        {
          creep.withdraw(powerSpawn, RESOURCE_ENERGY);

          if(creep.store.getFreeCapacity() === 0)
            creep.memory.full = true;
        }

        return;
      }

      if(container?.store[RESOURCE_ENERGY] > 0)
      {
        if(!creep.pos.isNearTo(container))
          creep.travelTo(container);
        else
        {
          creep.withdraw(container, RESOURCE_ENERGY);

          if(creep.store.getFreeCapacity() === 0)
            creep.memory.full = true;
        }

        creep.say('🕋');
        return;
      }

      let source: Source;
      if(creep.memory.devilName === undefined)
      {
        const sources = this.roomInfo(this.destRoom.name).sources;
        source = creep.pos.findClosestByPath(sources);
        creep.memory.devilName = source.id;
      }
      else
        source = Game.getObjectById(creep.memory.devilName) as Source;

      if(!creep.pos.isNearTo(source))
        creep.travelTo(source);
      else
      {
        creep.harvest(source);

        if(creep.almostFull())
        {
          creep.memory.full = true;
          creep.memory.devilName = undefined;
        }
      }

      return;
    }

  }

  MoversActions(creep: Creep)
  {
    if(creep.ticksToLive < 100
      && creep.store.getUsedCapacity() === 0
      && creep.room.name === this.sourceRoom.name)
      creep.suicide();

    console.log(this.name, 'Creep mover name', creep.name, creep.memory.boosts);
    if(!creep.memory.boost)
    {
      creep.boostRequest([RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE, RESOURCE_CATALYZED_KEANIUM_ACID], false);
      return;
    }

    let sourceStorage: StructureStorage;
    let destinationStorage : StructureStorage;

    if(this.destRoom.controller.level === 3)
    {
      sourceStorage = this.destRoom.storage;
      destinationStorage = this.sourceRoom.storage;
    }

    if(!creep.memory.full)
    {
      const dropps = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 2, {filter: d => d.amount > 10})
      if(dropps.length)
      {
        if(!creep.pos.isNearTo(dropps[0]))
          creep.travelTo(dropps[0]);
        else
          creep.pickup(dropps[0]);

        return
      }

      const ruins = creep.pos.findInRange(FIND_TOMBSTONES, 2,{filter: t => t.store.getUsedCapacity() > 0});
      if(ruins.length)
      {
        if(!creep.pos.isNearTo(ruins[0]))
          creep.travelTo(ruins[0]);
        else
          creep.withdrawEverything(ruins[0]);

        return;
      }

      if(!creep.pos.isNearTo(sourceStorage))
        creep.travelTo(sourceStorage);
      else
      {
        creep.withdrawEverythingBut(sourceStorage, RESOURCE_ENERGY);

        if(creep.store.getFreeCapacity() == 0
          || (sourceStorage.store.getUsedCapacity() - sourceStorage.store.getUsedCapacity(RESOURCE_ENERGY) === 0))
          creep.memory.full = true;
      }

      return;
    }

    if(creep.memory.full)
    {
      if(!creep.pos.isNearTo(destinationStorage))
        creep.travelTo(destinationStorage);
      else
      {
        creep.transferEverything(destinationStorage);

        if(creep.store.getUsedCapacity() === 0)
          creep.memory.full = false;
      }

      return;
    }
  }

  BuilderActions(creep: Creep)
  {
    const site = Game.getObjectById(creep.memory.target) as ConstructionSite;
    if(!site)
    {
      const sites = this.destRoom.find(FIND_MY_CONSTRUCTION_SITES)
      if(sites.length)
        creep.memory.target = sites[0].id;
      else
      {
        this.metaData.upgraders.push(this.metaData.builders.pop());
        return;
      }
    }

    if(creep.store.getUsedCapacity() === 0
      && creep.room.name === this.sourceRoom.name)
    {
      const storage = this.sourceRoom.storage;
      if(storage?.store[RESOURCE_ENERGY] >= creep.store.getCapacity())
      {
        if(!creep.pos.isNearTo(storage))
          creep.travelTo(storage);
        else
        {
          if(creep.withdraw(storage, RESOURCE_ENERGY) === OK)
            creep.memory.full = true;
        }

        creep.say('🏟');
        return;
      }

      const terminal = this.sourceRoom.terminal;
      if(terminal?.store[RESOURCE_ENERGY] >= creep.store.getCapacity())
      {
        if(!creep.pos.isNearTo(terminal))
          creep.travelTo(terminal);
        else
        {
          if(creep.withdraw(terminal, RESOURCE_ENERGY) === OK)
            creep.memory.full = true;
        }

          creep.say('🏦');
        return;
      }

      if(!creep.pos.inRangeTo(site, 3))
        creep.travelTo(site, {range: 3});
    }

    if(!creep.memory.full || creep.store.getUsedCapacity() === 0)
    {
      creep.memory.full = false;

      const storage = this.destRoom.storage;
      const terminal = this.destRoom.terminal;
      const container = this.roomInfo(this.destRoom.name).generalContainers[0];
      const powerSpawn = this.roomInfo(this.destRoom.name).powerSpawn;

      let tombstones = creep.pos.findInRange(FIND_TOMBSTONES, 3, {filter: ts => ts.store.getUsedCapacity(RESOURCE_ENERGY) > 0});
      console.log(this.name, 'Tombstones')
      if(tombstones.length)
      {
        if(!creep.pos.isNearTo(tombstones[0]))
          creep.travelTo(tombstones[0]);
        else if(creep.withdraw(tombstones[0], RESOURCE_ENERGY) === OK)
          creep.memory.full = true;

        return;
      }

      if(container?.store[RESOURCE_ENERGY] > 0)
      {
        if(!creep.pos.isNearTo(container))
          creep.travelTo(container);
        else
        {
          if(creep.withdraw(container, RESOURCE_ENERGY) === OK)
            creep.memory.full = true;
        }

        creep.say('🕋');
        return;
      }

      if(storage?.store[RESOURCE_ENERGY] > 0)
      {
        if(!creep.pos.isNearTo(storage))
          creep.travelTo(storage);
        else
        {
          if(creep.withdraw(storage, RESOURCE_ENERGY) === OK)
            creep.memory.full = true;
        }

        creep.say('🏟');
        return;
      }

      if(terminal?.store[RESOURCE_ENERGY] > 0)
      {
        if(!creep.pos.isNearTo(terminal))
          creep.travelTo(terminal);
        else
        {
          if(creep.withdraw(terminal, RESOURCE_ENERGY) === OK)
            creep.memory.full = true;
        }

        creep.say('🏦');
        return;
      }

      if(powerSpawn?.store[RESOURCE_ENERGY] > 0)
      {
        if(!creep.pos.isNearTo(powerSpawn))
          creep.travelTo(powerSpawn);
        else
        {
          creep.withdraw(powerSpawn, RESOURCE_ENERGY);

          if(creep.store.getFreeCapacity() === 0)
            creep.memory.full = true;
        }

        return;
      }

      let source: Source;
      if(creep.memory.devilName === undefined)
      {
        const sources = this.roomInfo(this.destRoom.name).sources.filter(s => s.energy > 0);
        source = creep.pos.findClosestByPath(sources);
        creep.memory.devilName = source.id;
      }
      else
        source = Game.getObjectById(creep.memory.devilName) as Source;

      if(!creep.pos.isNearTo(source))
        creep.travelTo(source);
      else
      {
        creep.harvest(source);

        if(creep.almostFull())
        {
          creep.memory.full = true;
          creep.memory.devilName = undefined;
        }
      }

      return;
    }

    if(creep.memory.full)
    {
      if(!creep.pos.inRangeTo(site, 3))
        creep.travelTo(site, {range: 3});
      else
      {
        creep.build(site);

        if(creep.store.getUsedCapacity() === 0)
          creep.memory.full = false;
      }

      creep.say('b');
      return;
    }
  }

  TransportHealerActions(creep: Creep)
  {
    if(!creep.memory.boost)
    {
      creep.boostRequest([RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE], false);
      return;
    }

    const container = this.roomInfo(this.destRoom.name).generalContainers[0];
    if(!creep.pos.isEqualTo(container))
      creep.travelTo(container);
    else
    {
      const spawns = container.pos.findInRange(FIND_STRUCTURES, 1, {filter: f => f.structureType === STRUCTURE_SPAWN});
      if(spawns.length)
      {
        const spawn = spawns[0] as StructureSpawn;
        if(!spawn.spawning)
          spawn.recycleCreep(creep);
      }
    }

    return;
  }
}
