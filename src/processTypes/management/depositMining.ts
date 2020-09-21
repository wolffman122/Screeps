import { Process } from "os/process";
import { Utils } from "lib/utils";

export class DepositMiningManagementProcess extends Process
{
  type = 'dmmp';
  metaData: DepositMiningManagementProcessMetaData

  ensureMetaData()
  {
    if(!this.metaData.harvester)
      this.metaData.harvester = [];

    if(!this.metaData.haulers)
      this.metaData.haulers = [];

    if(!this.metaData.avoidRooms)
      this.metaData.avoidRooms = [];
  }

  run()
  {
    if(this.metaData.roomName === 'E38S35')
    {
      this.completed = true;
      return;
    }

    this.ensureMetaData();

    console.log(this.name, 'Should be stopping spawn room', this.metaData.roomName, this.metaData.haulerDone, this.metaData.harvesterDone
    , this.metaData.harvester.length === 0, this.metaData.haulers.length === 0)
    if(this.metaData.haulerDone && this.metaData.harvesterDone
       && this.metaData.harvester.length === 0 && this.metaData.haulers.length === 0)
    {
       this.completed = true;
       return;
    }

    const room = Game.rooms[this.metaData.roomName];
    room.memory.depositMining = true;

    let harvesterCount = 1
    let haulerCount = 1;
    if(this.metaData.harvesterCount !== undefined)
    {
      harvesterCount = this.metaData.harvesterCount
      haulerCount = 2;
    }


    this.metaData.harvester = Utils.clearDeadCreeps(this.metaData.harvester);
    this.metaData.haulers = Utils.clearDeadCreeps(this.metaData.haulers);

    const hCount = Utils.creepPreSpawnCount(this.metaData.harvester, 50);
    const haulCount = Utils.creepPreSpawnCount(this.metaData.haulers, 50);

    if(this.name === 'dmmp-E42S40')
      console.log(this.name, hCount, harvesterCount, haulCount, haulerCount);
    if(hCount < harvesterCount && !this.metaData.harvesterDone)
    {
      const creepName = 'deposit-h-' + this.metaData.roomName + '-' + Game.time;
      const spawned = Utils.spawn(this.kernel, this.metaData.roomName,
        'despositMiner', creepName, {});

      if(spawned)
        this.metaData.harvester.push(creepName);
    }


    if(haulCount < haulerCount && !this.metaData.haulerDone)
    {
      const creepName = 'deposit-m-' + this.metaData.roomName + '-' + Game.time;
      const spawned = Utils.spawn(this.kernel, this.metaData.roomName,
        'skMinerHauler', creepName, {});

      if(spawned)
        this.metaData.haulers.push(creepName);
    }

    console.log(this.name, 'vision', this.metaData.vision)
    //////////// Keep Vision in target room ///////////////////////
    if(!this.metaData.vision)
    {
      const observer = this.roomData().observer;
      console.log(this.name, this.metaData.roomName, observer)
      observer.observeRoom(this.metaData.targetRoomName);
      //console.log(this.name, 'Observation', observer.room.name);
    }

    let target: Deposit;
    let mining = false;
    const tarRoom = Game.rooms[this.metaData.targetRoomName];
    if(tarRoom)
    {
      let deposits = tarRoom.find(FIND_DEPOSITS).filter(d => (d.lastCooldown ?? 0) < 80);
      if(deposits.length)
      {
        target = deposits[0];
        if(target.lastCooldown < 80)
        {
          if(this.metaData.harvesterCount === undefined)
          {
            const openPos = target.pos.openAdjacentSpots(true);
            if(openPos.length > 1)
              this.metaData.harvesterCount = 2;
          }
          room.memory.depositType = target.depositType;
          mining = true;
        }
      }
      else
      {
        this.metaData.harvesterDone = true;
      }
    }

    //console.log(this.name, 'Run Actions', mining || !this.metaData.harvesterDone || !this.metaData.haulerDone)
    if(mining || !this.metaData.harvesterDone || !this.metaData.haulerDone)
    {
      for(let i = 0; i < this.metaData.harvester.length; i++)
      {
        const harvester = Game.creeps[this.metaData.harvester[i]];
        if(harvester)
          this.harvesterActions(harvester, target);
      }

      //console.log(this.name, 'test1')
      for(let i = 0; i < this.metaData.haulers.length; i++)
      {
        //console.log(this.name, 'test', this.metaData.haulers[i])
        const hauler = Game.creeps[this.metaData.haulers[i]];
        if(hauler || this.metaData.harvesterDone)
          this.haulerActions(hauler, target);
      }
    }
  }

  harvesterActions(creep: Creep, target: Deposit)
  {
    try
    {
      if(this.name === 'dmmp-E42S40')
        console.log(this.name, 'ha',1)
      if(!creep.memory.boost)
      {
        creep.boostRequest([RESOURCE_UTRIUM_OXIDE], false);
        return;
      }

      if(!creep.room.controller?.my)
      {
        const index = this.metaData.avoidRooms.indexOf(creep.room.name)
        if(index === -1)
          this.metaData.avoidRooms.push(creep.room.name);
      }

      if(creep.ticksToLive < 200)
      {
        const spawn = this.roomData().spawns[0];
        if(spawn)
        {
          const haulers = Utils.inflateCreeps(this.metaData.haulers);
          if(haulers.length)
          {
            const hauler = creep.pos.findInRange(haulers, 1, {filter: (c: Creep) => c.store.getFreeCapacity() > creep.store.getUsedCapacity()})[0];

            if(hauler)
              creep.transferEverything(hauler);
          }
          creep.say('♻');
          if(!creep.pos.isNearTo(spawn))
            creep.travelTo(spawn, {preferHighway: true, allowHostile: false});
          else if(!spawn.spawning)
            spawn.recycleCreep(creep);
          else if(creep.store.getUsedCapacity() === 0)
            creep.suicide();
        }
        else if(creep.ticksToLive < 20)
        {
          const container = this.roomData().generalContainers[0];
          if(!creep.pos.inRangeTo(container, 0))
            creep.travelTo(container, {preferHighway: true, allowHostile: false});
          else
            creep.suicide();
        }

        return;
      }

      if(target?.lastCooldown >= 80)
      {
        this.metaData.vision = false;
        const container = this.roomData().generalContainers[0];
        if(!creep.pos.inRangeTo(container, 0))
          creep.travelTo(container, {preferHighway: true, allowHostile: false})
        else
        {
          this.metaData.harvesterDone = true;
          creep.suicide();
        }

        return;
      }
      else
        this.metaData.vision = false;

      if(creep.pos.roomName !== target?.pos?.roomName && target?.lastCooldown < 80)
      {
        creep.travelTo(target, {preferHighway: true, allowHostile: false});
        return;
      }

      if(this.metaData.haulers.length)
      {
        const full = creep.store.getFreeCapacity() <= creep.getActiveBodyparts(WORK);

        // Find empty hauler
        const haulerId = _.find(this.metaData.haulers, (h) => {
          return Game.creeps[h].memory.target === creep.name;
        })

        //console.log(this.name, 'harvest', creep.name, haulerId);
        if(haulerId)
        {
          //console.log(this.name, 'harvest', 1, full)
          const hauler = Game.creeps[haulerId];
          if(hauler.pos.isNearTo(creep) && ((full || creep.ticksToLive < 5
            || hauler.ticksToLive < 210) || creep.store.getUsedCapacity() >= hauler.store.getFreeCapacity()))
          {
            const amount = (hauler.store.getFreeCapacity() > creep.store.getCapacity()) ? creep.store.getUsedCapacity() : hauler.store.getFreeCapacity();
            const ret = creep.transfer(hauler, target.depositType, amount);
            //console.log(this.name, 'harvest', 2, ret, amount, target.depositType)
            return;
          }
        }
      }

      //console.log(this.name, 1)
      this.metaData.vision = true;
      if(target)
      {
        if(!creep.pos.isNearTo(target))
          creep.travelTo(target, {preferHighway: true, allowHostile: false});
        else if(target.cooldown === 0 && creep.store.getUsedCapacity() < creep.store.getCapacity())
          creep.harvest(target);
      }
    }
    catch(error)
    {
      console.log(this.name, 'harvesterActions', error)
    }
  }

  haulerActions(creep: Creep, target: Deposit)
  {
    try
    {
      if(this.metaData.harvesterDone)
      {
        //console.log(this.name, 1)
        const container = this.roomData().generalContainers[0];
        if(!creep.pos.inRangeTo(container, 0))
        {
          //console.log(this.name, 2)
          creep.travelTo(container, {preferHighway: true, allowHostile: false});
        }
        else
        {
          //console.log(this.name, 3)
          this.metaData.haulerDone = true;
          creep.suicide();
        }
        //console.log(this.name, 4)
        return;
      }

      if(creep.ticksToLive < 200)
      {
        const spawn = this.roomData().spawns[0];
        if(spawn)
        {
          creep.say('♻S');
          if(!creep.pos.isNearTo(spawn))
          {
            const ret = creep.travelTo(spawn, {preferHighway: true, allowHostile: false});
            //console.log(this.name, 1, ret);
          }
          else if(!spawn.spawning)
          {
            const ret = spawn.recycleCreep(creep);
            //console.log(this.name, 2, ret);
          }
        }
        else if(creep.ticksToLive < 20)
        {
          creep.say('♻C');
          const container = this.roomData().generalContainers[0];
          if(!creep.pos.inRangeTo(container, 0))
            creep.travelTo(container, {preferHighway: true, allowHostile: false});
          else
            creep.suicide();
        }

        return;
      }

      if(target?.lastCooldown >= 80)
        creep.memory.full = true;

      if(creep.store.getFreeCapacity() === 0 || creep.memory.full)
      {
        creep.memory.full = true;
        const terminal = Game.rooms[this.metaData.roomName].terminal;
        if(!creep.pos.isNearTo(terminal))
          creep.travelTo(terminal, {preferHighway: true, allowHostile: false});
        else
          creep.transferEverything(terminal);

        if(creep.store.getUsedCapacity() === 0)
        {
          if(target?.lastCooldown >= 80)
            this.metaData.haulerDone = true;

          creep.memory.full = false;
        }

        return;
      }

      //console.log(this.name, 'hauler', creep.name, creep.memory.target)
      const harvesterTarget = Game.creeps[creep.memory.target];
      if(harvesterTarget)
      {
        if(!creep.pos.isNearTo(harvesterTarget))
          creep.travelTo(harvesterTarget, {preferHighway: true, allowHostile: false});

        return;
      }
      else
        creep.memory.target = undefined;

      if(target)
      {
        if(creep.pos.roomName !== target.pos.roomName
          && !creep.pos.inRangeTo(target, 3))
        {
          creep.travelTo(target, {range: 3, preferHighway: true, allowHostile: false});
          return;
        }
      }
      else
      {
        creep.travelTo(new RoomPosition(25, 25, this.metaData.targetRoomName));
        return;
      }

      let tombStones = creep.room.find(FIND_TOMBSTONES, {filter: t => t.store.getUsedCapacity() > 0});
      if(tombStones.length)
      {
        if(!creep.pos.isNearTo(tombStones[0]))
          creep.travelTo(tombStones[0], {preferHighway: true, allowHostile: false});
        else
          creep.withdrawEverything(tombStones[0]);

        return;
      }

      // Equal number or roles
      if(this.metaData.harvester.length === this.metaData.haulers.length)
      {
        if(creep.memory.target === undefined)
        {
          const index = this.metaData.haulers.indexOf(creep.name);
          if(index !== -1)
            creep.memory.target = this.metaData.harvester[index];
        }
      }
      else if(this.metaData.harvester.length)
      {
        const harvester = Game.creeps[this.metaData.harvester[0]];
        let dir = creep.pos.getDirectionTo(harvester) as number;
        dir = +((dir + 4) % 8 === 0) ? 1 : dir+4;
        const pos = harvester.pos.getPositionAtDirection(dir);

        if(harvester.pos.isNearTo(pos))
        {
          creep.travelTo(harvester, {preferHighway: true, allowHostile: false});
          return;
        }
      }

      this.metaData.vision = true;
      if(!creep.pos.isNearTo(target))
      {
        creep.travelTo(target, {preferHighway: true, allowHostile: false});
        return;
      }

      if(creep.ticksToLive < 200)
        creep.memory.full = true;

    }
    catch(error)
    {
      this.metaData.vision = false;
      console.log(this.name, 'haulerActions', error)
    }
  }
}
