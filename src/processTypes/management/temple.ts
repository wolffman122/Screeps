import { Process } from "os/process";
import { Utils } from "lib/utils";
import { PRODUCTION_AMOUNT } from "processTypes/buildingProcesses/mineralTerminal";

export class TempleProcess extends Process
{
  type = 'temple';
  metaData: TempleProcessMetaData;

  templeRoom: Room;
  feedRoom: Room;
  flag: Flag;
  templeStorage: StructureStorage;
  templeTerminal: StructureTerminal;

  ensureMetaData()
  {
    if(!this.metaData.claim)
      this.metaData.claim = [];

    if(!this.metaData.builders)
      this.metaData.builders = [];

    if(!this.metaData.haulers)
      this.metaData.haulers = [];

    if(!this.metaData.upgraders)
      this.metaData.upgraders = [];

    if(!this.metaData.distros)
      this.metaData.distros = [];
  }

  run()
  {
    this.ensureMetaData();

    console.log(this.name, 'Temple Running');

    const process = this.kernel.getProcessByName('minerals-E37S45');
    if(process)
      console.log(this.name, 'Found process');

    this.flag = Game.flags[this.metaData.flagName];
    this.templeRoom = Game.rooms[this.metaData.roomName];
    if(!this.flag)
    {
      delete this.flag.memory;
      this.completed = true;
      return;
    }

    if(this.templeRoom)
      this.templeRoom.memory.templeRoom = true;

    this.templeStorage = this.templeRoom.storage;
    this.templeTerminal = this.templeRoom.terminal;

    if(!this.metaData.feedRoom)
      this.SetupFeedRoom();
    else
      this.feedRoom = Game.rooms[this.metaData.feedRoom];

    if(!this.metaData.claimed)
      this.metaData.claim = this.spawnCreeps(1, this.metaData.claim, 'claimer');

    let upgraderAmount = 6;
    let haulerAmount = 2;
    let builderAmount = 0;
    let distroAmount = 1;
    const controller = this.templeRoom.controller;
    if(controller?.level < 3)
    {
      upgraderAmount = 5;
      if(this.templeTerminal.store.getUsedCapacity(RESOURCE_ENERGY) < 1000
        && this.templeStorage.store.getUsedCapacity(RESOURCE_ENERGY) < 1000)
        distroAmount = 0;

      haulerAmount = 3;
    }
    else if(controller?.level > 3)
    {

      const spawns = this.roomData().spawns;
      const towers = this.roomData().towers;
      if(spawns.length < 1 && towers.length < 1)
        builderAmount = 1;

        this.TowerHeal();

      if(controller?.level <= 5)
      {
        console.log(this.name, 'Build Storage')
        if(!this.templeStorage)
          builderAmount = 1;

        if(this.templeStorage.store.getUsedCapacity(RESOURCE_ENERGY) < 200000)
        {
          haulerAmount = 7;
          upgraderAmount = 4;
        }
        else if(this.templeStorage.store.getUsedCapacity(RESOURCE_ENERGY) < 500000)
        {
          haulerAmount = 5;
          upgraderAmount = 3;
        }
        else if(this.templeStorage.store.getUsedCapacity(RESOURCE_ENERGY) < 750000)
          haulerAmount = 3;
      }
      else if(controller.level > 5)
      {
        if(!this.templeTerminal || this.roomData().constructionSites.length)
          builderAmount = 1;

        if(this.templeStorage.store.getUsedCapacity(RESOURCE_ENERGY) < 500000)
          haulerAmount = 2;
        else
          haulerAmount = 0;

        distroAmount = 1;

        if(controller.level === 7
          && (controller.progress / controller.progressTotal) > 0.75)
        {
          if(this.templeStorage.store.getUsedCapacity(RESOURCE_ENERGY) < this.templeStorage.store.getCapacity() * .90)
            haulerAmount = 4;
        }
        else if(controller.level === 8)
        {
          this.metaData.claimed = false;
          controller.unclaim();
          return;
        }
      }
    }

    console.log(this.name, 'Creep amounts', upgraderAmount, haulerAmount, builderAmount, distroAmount);
    this.metaData.upgraders = this.spawnCreeps(upgraderAmount, this.metaData.upgraders, 'templeUpgrader');
    this.metaData.haulers = this.spawnCreeps(haulerAmount, this.metaData.haulers, 'shHauler');
    this.metaData.builders = this.spawnCreeps(builderAmount, this.metaData.builders, 'templeBuilder');
    this.metaData.distros = this.spawnCreeps(distroAmount, this.metaData.distros, 'tempDistro')

    console.log(this.name, 'Actions')

    if(!this.metaData.claimed)
    {
      for(let i = 0; i < this.metaData.claim.length; i++)
      {
        const creep = Game.creeps[this.metaData.claim[i]];
        if(creep)
          this.ClaimActions(creep);
      }
    }

    for(let i = 0; i < this.metaData.haulers.length; i++)
    {
      const creep = Game.creeps[this.metaData.haulers[i]];
      if(creep)
        this.HaulerActions(creep);
    }

    for(let i = 0; i < this.metaData.upgraders.length; i++)
    {
      const creep = Game.creeps[this.metaData.upgraders[i]];
      if(creep)
        this.UpgraderActions(creep);
    }

    console.log(this.name, 'Action', 1)
    for(let i = 0; i < this.metaData.builders.length; i++)
    {
      const creep = Game.creeps[this.metaData.builders[i]];
      if(creep)
        this.BuilderActions(creep);
    }

    console.log(this.name, 'Action', 2)
    for(let i = 0; i < this.metaData.distros.length; i++)
    {
      const creep = Game.creeps[this.metaData.distros[i]];
      if(creep)
        this.DistroActions(creep);
    }
  }

  private SetupFeedRoom()
  {
    console.log(this.name, 2)
    const closeRoomName = Utils.nearestRoom(this.metaData.roomName);
    console.log(this.name, 3, closeRoomName);
    this.feedRoom = Game.rooms[closeRoomName];
    if(this.feedRoom)
      this.metaData.feedRoom = closeRoomName;
  }

  private spawnCreeps(amount: number, creeps: string[], type: string): string[]
  {
    creeps = Utils.clearDeadCreeps(creeps);
    const count = Utils.creepPreSpawnCount(creeps, 50);
    if(count < amount)
    {
      const creepName = type + '-' + this.metaData.roomName + '-' + Game.time;
      const spawned = Utils.spawn(this.kernel, this.feedRoom.name, type, creepName, {});

      if(spawned)
        creeps.push(creepName);
    }

    return creeps;
  }

  private spawnHaulers(amount: number)
  {
    this.metaData.haulers = Utils.clearDeadCreeps(this.metaData.haulers);
    const count = Utils.creepPreSpawnCount(this.metaData.haulers);
    if(count < amount)
    {
      const creepName = 'hauler-' + this.metaData.roomName + '-' + Game.time;
      const spawned = Utils.spawn(this.kernel, this.feedRoom.name, 'shHualer', creepName, {});

      if(spawned)
        this.metaData.haulers.push(creepName);
    }
  }

  private spawnUpgraders(amount: number)
  {
    this.metaData.upgraders = Utils.clearDeadCreeps(this.metaData.upgraders);
    const count = Utils.creepPreSpawnCount(this.metaData.upgraders);
    if(count < amount)
    {
      const creepName = 'upgrader-' + this.metaData.roomName + '-' + Game.time;
      const spawned = Utils.spawn(this.kernel, this.feedRoom.name, 'upgrader', creepName, {});

      if(spawned)
        this.metaData.upgraders.push(creepName);
    }
  }

  private ClaimActions(creep: Creep)
  {
    const controller = this.templeRoom.controller;
    if(controller?.owner)
    {
      const spawn = this.roomInfo(this.feedRoom.name).spawns[0];
      if(!creep.pos.isNearTo(spawn))
        creep.travelTo(spawn);
      else
      {
        if(!spawn.spawnCreep)
          spawn.recycleCreep(creep);
        else
          creep.suicide();
      }

      this.metaData.claimed = true;
    }

    if(!creep.pos.isNearTo(this.flag))
      creep.travelTo(this.flag);
    else
      creep.claimController(this.templeRoom.controller);
  }

  private BuilderActions(creep: Creep)
  {
    if(!creep.memory.boost)
    {
      creep.boostRequest([RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE, RESOURCE_LEMERGIUM_ACID], false);
      return;
    }

    if(creep.room.name === this.feedRoom.name
      && creep.store.getUsedCapacity() === 0)
    {
      if(!creep.pos.isNearTo(this.feedRoom.storage))
        creep.travelTo(this.feedRoom.storage);
      else
        creep.withdraw(this.feedRoom.storage, RESOURCE_ENERGY);

      return;
    }

    if(!this.templeRoom)
    {
      creep.travelTo(this.flag);
      return;
    }

    if(this.roomData().constructionSites?.length && creep.store.getUsedCapacity() > 0)
    {
      const target = this.roomData().constructionSites[0];
      if(!creep.pos.inRangeTo(target, 3))
        creep.travelTo(target, {range: 3});
      else
        creep.build(target);

      return;
    }

    const container = this.roomData().containers[0];
    if(creep.store.getUsedCapacity() === 0)
    {
      if(this.templeStorage)
      {
        if(!creep.pos.isNearTo(this.templeStorage))
          creep.travelTo(this.templeStorage);
        else
          creep.withdraw(this.templeStorage, RESOURCE_ENERGY);

          return;
      }
    }
  }

  private HaulerActions(creep: Creep)
  {
    if(!creep.memory.boost)
    {
      const feedTerminal = this.feedRoom.terminal;
      if(feedTerminal?.store.getUsedCapacity(RESOURCE_CATALYZED_KEANIUM_ACID) >= PRODUCTION_AMOUNT)
        creep.boostRequest([RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE, RESOURCE_CATALYZED_KEANIUM_ACID], false);
      else
        creep.boostRequest([RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE/*, RESOURCE_CATALYZED_KEANIUM_ACID*/], false);
      return;
    }

    console.log(this.name, 'Pickup',1)
    if(creep.memory.target)
    {
      const tombstone = Game.getObjectById(creep.memory.target);
      if(tombstone instanceof Tombstone)
      {
        if(!creep.pos.isNearTo(tombstone))
          creep.travelTo(tombstone);
        else
        {
          creep.withdraw(tombstone, RESOURCE_ENERGY);
          creep.memory.target = undefined;
        }

        return;
      }

      console.log(this.name, 'Pickup',2)
      const dropped = Game.getObjectById(creep.memory.target) as Resource<ResourceConstant>
      if(dropped)
      {
        if(!creep.pos.isNearTo(dropped))
          creep.travelTo(dropped);
        else
        {
          const ret = creep.pickup(dropped);
          console.log(this.name, 'Pickup',ret);
          creep.memory.target = undefined;
        }

        return;
      }
    }

    if(creep.room.name === this.feedRoom.name
      && creep.store.getUsedCapacity() === 0)
    {
      if(!creep.pos.isNearTo(this.feedRoom.storage))
        creep.travelTo(this.feedRoom.storage);
      else
        creep.withdraw(this.feedRoom.storage, RESOURCE_ENERGY);

      return;
    }

    if(!this.templeRoom && creep.store.getFreeCapacity() === 0)
    {
      creep.travelTo(this.flag);
      return;
    }

    if(creep.store.getUsedCapacity() === 0)
    {
      if(!creep.memory.target)
      {
        console.log(this.name, 'find tombstones')
        const tombStone = creep.pos.findClosestByPath(FIND_TOMBSTONES, {filter: t => t.store.getUsedCapacity() >= 500});
        console.log(this.name, 'find tombstones', tombStone)
        if(tombStone)
        {
          creep.memory.target = tombStone.id;
          return;
        }
        else
        {
          console.log(this.name, 'find dropped')
          const dropped = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {filter: t => t.amount >= 1000});
          console.log(this.name, 'find dropped', dropped)
          if(dropped)
          {
            creep.memory.target = dropped.id;
            return;
          }
          else
          {
            creep.memory.target = '';
          }
        }
      }

      creep.travelTo(this.feedRoom.storage);
      return;
    }

    const containerFlag =  Game.flags['Test'];
    const container = this.roomData().containers[0];
    if(containerFlag)
    {
      if(!creep.pos.isEqualTo(containerFlag))
        creep.travelTo(containerFlag);

      return;
    }

    if(creep.name === 'shHauler-E37S45-25979880')
      console.log(this.name, 'Temple storage', !this.templeStorage, !this.templeStorage.isActive())
    if(!this.templeStorage || !this.templeStorage.isActive())
    {
      const tower = this.roomData().towers.filter(t => (t.store[RESOURCE_ENERGY ?? 0]) <= 500)[0];
      if(tower?.isActive())
      {
        if(!creep.pos.isNearTo(tower))
          creep.travelTo(tower);
        else
          creep.transfer(tower, RESOURCE_ENERGY);

        return;
      }

      const spawn = this.roomData().spawns[0];
      if((spawn?.store[RESOURCE_ENERGY] ?? 0) === 300
          && creep.store.getFreeCapacity() >= 300)
      {
        if(!creep.pos.isNearTo(spawn))
          creep.travelTo(spawn);
        else
          creep.withdraw(spawn, RESOURCE_ENERGY);

        return;

      }

      if(container)
      {
        //const pos = new RoomPosition(container.pos.x + 1, container.pos.y + 1, container.room.name);
        if(!creep.pos.isNearTo(container))
          creep.travelTo(container);
        else
        {
          creep.transfer(container, RESOURCE_ENERGY);
          creep.memory.target = undefined;
        }

        return;
      }
    }
    else
    {
      if(!creep.pos.isNearTo(this.templeStorage))
        creep.travelTo(this.templeStorage);
      else
      {
        creep.transfer(this.templeStorage, RESOURCE_ENERGY);
        creep.memory.target = undefined;
      }
    }

  }

  private UpgraderActions(creep: Creep)
  {
    const haulerCreeps = Utils.inflateCreeps(this.metaData.haulers);
    // if(!creep.memory.boost)
    // {
    //   creep.boostRequest([RESOURCE_CATALYZED_GHODIUM_ACID], false);
    //   return;
    // }

    if(!this.templeRoom)
    {
      creep.travelTo(this.flag);
      return;
    }

    const containerFlag =  Game.flags['Test'];
    const container = this.roomData().containers[0];
    const target = containerFlag ? containerFlag : container;
    const controller = this.templeRoom.controller;
    if(controller?.level < 7)
    {
      if(!creep.pos.isNearTo(this.templeStorage))
      {
        creep.travelTo(this.templeStorage);
        return;
      }
    }

    // if(!creep.pos.isNearTo(target))
    // {
    //   creep.travelTo(target);
    // }
    // else
    // {
      const oneAmount = creep.getActiveBodyparts(WORK) * UPGRADE_CONTROLLER_POWER;
      if(creep.store.getUsedCapacity() <= oneAmount)
      {
        if(this.templeStorage)
          creep.withdraw(this.templeStorage, RESOURCE_ENERGY);
        else
        {
          const hauler = creep.pos.findClosestByRange(haulerCreeps);
          if(creep.pos.isNearTo(hauler))
            hauler.transfer(creep, RESOURCE_ENERGY);
        }
      }


      const pos = this.templeStorage.pos;
      const diffX = pos.x - creep.pos.x;
      const diffY = pos.y - creep.pos.y;
      const spawn = this.roomData().spawns[0];
      const cost = creep.getCost();
      const energyNeeded = Math.ceil(cost/2.5/creep.body.length)
      const renewRate = Math.floor(600/creep.body.length);
      let allFull = true;
      if(diffX === 0 && diffY === 1
        && (spawn.store[RESOURCE_ENERGY] ?? 0) > 63)
      {
        if(creep.ticksToLive < 1400)
          allFull = false;
          
        const ret = spawn.renewCreep(creep);
        console.log(this.name, 'Renew', ret)
      }

      if(Game.time % 10 === 0)
      {
        const creeps = Utils.inflateCreeps(this.metaData.upgraders);
        for(let i = 0; i < creeps.length; i++)
        {
          console.log(this.name, 'Creep life', creeps[i].ticksToLive, creeps[i].spawning)
          if(creeps[i].ticksToLive < 900 && !creeps[i].spawning)
            allFull = false;
        }

        console.log(this.name, 'Creep move', allFull);
        if(allFull)
        {
          const moveDir = this.GetMoveDirection(diffX, diffY)
          const ret = creep.move(moveDir);
          console.log(this.name, 'Creep move', 2, moveDir, ret);

        }
      }

      creep.upgradeController(this.templeRoom.controller);

  }

  private DistroActions(creep: Creep)
  {
    if(creep.room.name === this.feedRoom.name
      && creep.store.getUsedCapacity() === 0)
    {
      console.log(this.name, 'Distro', 1)
      const storage = this.feedRoom.storage;
      if(!creep.pos.isNearTo(storage))
        creep.travelTo(storage);
      else
        creep.withdraw(storage, RESOURCE_ENERGY);

      return;
    }

    if(creep.room.name !== this.templeRoom.name)
    {
      console.log(this.name, 'Distro', 2)
      creep.travelTo(this.templeRoom.controller);
      return;
    }

    const distroFlag = Game.flags['Distro-E37S45'];
    if(creep.store.getUsedCapacity() !== creep.store.getCapacity())
    {
      if(!creep.pos.isEqualTo(distroFlag))
        creep.travelTo(distroFlag);
      else
      {
        if(this.templeTerminal.store.getUsedCapacity(RESOURCE_ENERGY) >=  creep.store.getCapacity())
          creep.withdraw(this.templeTerminal, RESOURCE_ENERGY);
        else if(this.templeStorage.store.getUsedCapacity(RESOURCE_ENERGY) >= creep.store.getCapacity())
          creep.withdraw(this.templeStorage, RESOURCE_ENERGY);
      }

      return;
    }

    const tower = this.roomData().towers?.filter(t => (t.store[RESOURCE_ENERGY ?? 0]) <= 500)[0];
    if(tower && (creep.store[RESOURCE_ENERGY] ?? 0) >= 500)
    {
      console.log(this.name, 'Distro', 4)
      if(!creep.pos.isNearTo(tower))
        creep.travelTo(tower);
      else
        creep.transfer(tower, RESOURCE_ENERGY);

      return;
    }

    const spawn = this.roomData().spawns[0];
    if((spawn?.store[RESOURCE_ENERGY] ?? 0) < 63
        && creep.store.getUsedCapacity(RESOURCE_ENERGY) >= 300)
    {
      console.log(this.name, 'Distro', 5)
      if(!creep.pos.isNearTo(spawn))
        creep.travelTo(spawn);
      else
        creep.transfer(spawn, RESOURCE_ENERGY);

      return;

    }

    if(creep.store.getUsedCapacity() === 0)
    {
      if(this.templeTerminal)
      {
        console.log(this.name, 'Distro terminal', 1)
        if((this.templeTerminal.store[RESOURCE_ENERGY] ?? 0) > 0)
        {
          console.log(this.name, 'Distro terminal', 2)
          if(!creep.pos.isEqualTo(distroFlag))
            creep.travelTo(distroFlag);
          else
            creep.withdraw(this.templeTerminal, RESOURCE_ENERGY);

          return;
        }
      }

      console.log(this.name, 'Distro terminal', 3)
      console.log(this.name, 'Distro', 3)
      if(!creep.pos.isEqualTo(distroFlag))
        creep.travelTo(distroFlag);
      else
        creep.withdraw(this.templeStorage, RESOURCE_ENERGY);

      return;
    }


    // if(container?.store.getFreeCapacity() >= creep.store.getCapacity())
    // {
    //   console.log(this.name, 'Distro', 6)
    //   //const pos = new RoomPosition(container.pos.x + 1, container.pos.y + 1, container.room.name);
    //   if(!creep.pos.isNearTo(container))
    //     creep.travelTo(container);
    //   else if(container.store.getFreeCapacity() >= creep.store.getUsedCapacity())
    //     creep.transfer(container, RESOURCE_ENERGY);

    //   return;
    // }

    if(this.templeTerminal?.store.getUsedCapacity(RESOURCE_ENERGY) > 0)
    {
      if(!creep.pos.isEqualTo(distroFlag))
        creep.travelTo(distroFlag);
      else if(this.templeTerminal.store.getUsedCapacity(RESOURCE_ENERGY) > creep.store.getCapacity())
        creep.transfer(this.templeStorage, RESOURCE_ENERGY);
    }
  }

  private GetMoveDirection(diffX: number, diffY: number)
  {
    if(diffX === 0)
    {
      if(diffY === 1)
        return 7;
      else if(diffY === -1)
        return 3;
    }
    else if(diffX === 1)
    {
      if(diffY === 1)
        return 5;
      else if(diffY === 0)
        return 4;
      else if(diffY === -1)
        return 3;
    }
    else if(diffX === -1)
    {
      if(diffY === 0)
        return 8;
      else if(diffY === 1)
        return 7;
      else if(diffY === -1)
        return 1;
    }

  }

  TowerHeal()
  {
    const tower = this.roomData().towers[0];
    if(tower)
    {
      if(this.templeRoom)
      {
        const distros = Utils.inflateCreeps(this.metaData.distros).filter(d => d?.hits < d?.hitsMax);
        if(distros.length)
        {
          const distro = distros[0];
          tower.heal(distro);
          return;
        }

        const upgraders = Utils.inflateCreeps(this.metaData.upgraders).filter(u => u?.hits < u?.hitsMax);
        if(upgraders.length)
        {
          const upgrader = upgraders[0];
          tower.heal(upgrader);
          return;
        }
      }
    }
  }
}
