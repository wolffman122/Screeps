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
  }

  run()
  {
    this.ensureMetaData();

    console.log(this.name, 'Should be stopping', this.metaData.haulerDone, this.metaData.harvesterDone
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

    if(this.metaData.harvester.length < harvesterCount && !this.metaData.harvesterDone)
    {
      const creepName = 'deposit-h-' + this.metaData.roomName + '-' + Game.time;
      const spawned = Utils.spawn(this.kernel, this.metaData.roomName,
        'despositMiner', creepName, {});

      if(spawned)
        this.metaData.harvester.push(creepName);
    }

    if(this.metaData.haulers.length < haulerCount && !this.metaData.haulerDone)
    {
      const creepName = 'deposit-m-' + this.metaData.roomName + '-' + Game.time;
      const spawned = Utils.spawn(this.kernel, this.metaData.roomName,
        'skMinerHauler', creepName, {});

      if(spawned)
        this.metaData.haulers.push(creepName);
    }

    //////////// Keep Vision in target room ///////////////////////
    if(!this.metaData.vision)
    {
      const observer = this.roomData().observer;
      observer.observeRoom(this.metaData.targetRoomName);
    }

    let target: Deposit;
    let mining = false;
    const tarRoom = Game.rooms[this.metaData.targetRoomName];
    if(tarRoom)
    {
      let deposits = tarRoom.find(FIND_DEPOSITS);
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
    }

    console.log(this.name, 'Run Actions', mining || !this.metaData.harvesterDone || !this.metaData.haulerDone)
    if(mining || !this.metaData.harvesterDone || !this.metaData.haulerDone)
    {
      for(let i = 0; i < this.metaData.harvester.length; i++)
      {
        const harvester = Game.creeps[this.metaData.harvester[i]];
        if(harvester)
          this.harvesterActions(harvester, target);
      }

      for(let i = 0; i < this.metaData.haulers.length; i++)
      {
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
      if(!creep.memory.boost)
      {
        creep.boostRequest([RESOURCE_UTRIUM_OXIDE], false);
        return;
      }

      if(creep.ticksToLive < 200)
      {
        const spawn = this.roomData().spawns.filter(s => !s.spawning);
        if(spawn.length)
        {
          creep.say('♻');
          if(!creep.pos.isNearTo(spawn[0]))
            creep.travelTo(spawn[0]);
          else
            spawn[0].recycleCreep(creep);
        }
        else if(creep.ticksToLive < 20)
        {
          const container = this.roomData().generalContainers[0];
          if(!creep.pos.inRangeTo(container, 0))
            creep.travelTo(container);
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
          creep.travelTo(container)
        else
        {
          this.metaData.harvesterDone = true;
          creep.suicide();
        }

        return;
      }
      else
        this.metaData.vision = false;

      if(creep.pos.roomName !== target.pos.roomName)
      {
        creep.travelTo(target);
        return;
      }

      if(this.metaData.haulers.length)
      {
        const full = creep.store.getFreeCapacity() <= creep.getActiveBodyparts(WORK);

        // Find empty hauler
        const haulerId = _.find(this.metaData.haulers, (h) => {
          const hauler = Game.creeps[h];
          if(hauler.store.getFreeCapacity() >= creep.store.getCapacity())
            return true;
        })
        if(haulerId)
        {
          const hauler = Game.creeps[haulerId];
          if(hauler.pos.isNearTo(creep) && (full || creep.ticksToLive < 5
            || hauler.ticksToLive < 210))
          {
            creep.transfer(hauler, target.depositType);
            return;
          }
        }
      }

      console.log(this.name, 1)
      this.metaData.vision = true;
      if(!creep.pos.isNearTo(target))
        creep.travelTo(target);
      else if(target.cooldown === 0)
        creep.harvest(target);


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
        console.log(this.name, 1)
        const container = this.roomData().generalContainers[0];
        if(!creep.pos.inRangeTo(container, 0))
        {
          console.log(this.name, 2)
          creep.travelTo(container);
        }
        else
        {
          console.log(this.name, 3)
          this.metaData.haulerDone = true;
          creep.suicide();
        }
        console.log(this.name, 4)
        return;
      }

      if(creep.ticksToLive < 200)
      {
        const spawn = this.roomData().spawns.filter(s => !s.spawning);
        if(spawn.length)
        {
          creep.say('♻');
          if(!creep.pos.isNearTo(spawn[0]))
          {
            const ret = creep.travelTo(spawn[0]);
            console.log(this.name, 1, ret);
          }
          else
          {

            const ret = spawn[0].recycleCreep(creep);
            console.log(this.name, 2, ret);
          }
        }
        else if(creep.ticksToLive < 20)
        {
          const container = this.roomData().generalContainers[0];
          if(!creep.pos.inRangeTo(container, 0))
            creep.travelTo(container);
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
        const factory = this.roomData().factory
        if(!creep.pos.isNearTo(factory))
          creep.travelTo(factory);
        else
          creep.transferEverything(factory);

        if(creep.store.getUsedCapacity() === 0)
        {
          if(target?.lastCooldown >= 80)
            this.metaData.haulerDone = true;

          creep.memory.full = false;
        }

        return;
      }

      let tombStones = creep.room.find(FIND_TOMBSTONES, {filter: t => t.store.getUsedCapacity() > 0});
      if(tombStones.length)
      {
        if(!creep.pos.isNearTo(tombStones[0]))
          creep.travelTo(tombStones[0]);
        else
          creep.withdrawEverything(tombStones[0]);

        return;
      }

      if(creep.pos.roomName !== target.pos.roomName)
      {
        creep.travelTo(target);
        return;
      }

      if(this.metaData.harvester.length)
      {

        const harvester = Game.creeps[this.metaData.harvester[0]];
        let dir = creep.pos.getDirectionTo(harvester) as number;
        dir = +((dir + 4) % 8 === 0) ? 1 : dir+4;
        const pos = harvester.pos.getPositionAtDirection(dir);

        if(harvester.pos.isNearTo(pos))
        {
          creep.travelTo(harvester);
          return;
        }
      }



      this.metaData.vision = true;
      if(!creep.pos.isNearTo(target))
      {
        creep.travelTo(target);
        return;
      }

      if(creep.ticksToLive < 200)
        creep.memory.full = true;

    }
    catch(error)
    {
      console.log(this.name, 'haulerActions', error)
    }
  }
}
