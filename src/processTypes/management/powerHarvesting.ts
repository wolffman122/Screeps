import { Process } from "os/process";
import { WorldMap } from "lib/WorldMap";
import { helper } from "lib/helper";
import { Traveler } from "lib/Traveler";
import { Utils } from "lib/utils";

export class PowerHarvestingManagement extends Process
{
  type = 'powhm';
  bankRoom: Room;
  spawnRoom: Room;
  powerBank: StructurePowerBank;
  attacks: Creep[];
  healers: Creep[];
  carts: Creep[];
  metaData: PowerHarvestingManagementProcessMetaData

  // https://screeps.admon.dev/creep-designer/?share=5-10-0-0-35-0-0-0
  // https://screeps.admon.dev/creep-designer/?share=0-11-0-0-0-0-11-0

  ensureMetaData()
  {
    if(!this.metaData.attackers)
      this.metaData.attackers = [];

    if(!this.metaData.healers)
      this.metaData.healers = [];

    if(!this.metaData.haulers)
      this.metaData.haulers = [];
  }

  run()
  {
    this.completed = true
    return;
  }
  test()
  {
    this.ensureMetaData();

    if(this.name === 'powhm-E34S40')
      return;

    console.log(this.name, 'Power harvesting', this.metaData.spawnRoomName, this.metaData.powerBankId);
    this.spawnRoom = Game.rooms[this.metaData.spawnRoomName];
    this.bankRoom = Game.rooms[this.metaData.roomName];
    this.powerBank = <StructurePowerBank>Game.getObjectById('5ebd42ba884109219783ce3b');
    const observer = this.roomInfo(this.spawnRoom.name).observer;
    if(observer)
    {
      const ret = observer.observeRoom(this.metaData.roomName);
      console.log(this.name, observer, ret, this.powerBank);
    }

    // if(this.bankRoom && this.powerBank)
    // {
    //   Game.notify(this.name + 'Bank info ticks to decay: ' + this.powerBank.ticksToDecay + ' power: ' + this.powerBank.power);
    // }

    const attackerAmount = 1;
    const healerAmount = 1;

    let numberOfHaulers = 0;

    if(this.powerBank?.power && this.powerBank.hits < 200000)
    {
      console.log(this.name, this.powerBank?.power, this.powerBank.hits)
      if(!this.metaData.powerBankPos)
        this.metaData.powerBankPos = this.powerBank.pos.x + ',' + this.powerBank.pos.y;

        console.log(this.name, 'haul' ,1)
      const amount = this.powerBank.power;

      numberOfHaulers = 1;
      let boostLevel = 0;
      const unBoostedCarryParts =  Math.ceil(amount / CARRY_CAPACITY);
      const level1BoostedCarryParts = Math.ceil(amount / (CARRY_CAPACITY * BOOSTS.carry.KH.capacity));
      const level3BoostedCarryParts = Math.ceil(amount / (CARRY_CAPACITY * BOOSTS.carry.XKH2O.capacity));
      const level2BoostedCarryParts = Math.ceil(amount / (CARRY_CAPACITY * BOOSTS.carry.KH2O.capacity));
      if(level3BoostedCarryParts > 40)
      {
         numberOfHaulers = 2;
         boostLevel = 3;
      }
      else if(level2BoostedCarryParts > 40)
        boostLevel = 3;
      else if(level1BoostedCarryParts > 40)
        boostLevel = 2;
      else if(unBoostedCarryParts > 40)
        boostLevel = 1;
      else
        boostLevel = 0;

        console.log(this.name, 'haul' ,2, numberOfHaulers, boostLevel);
      for(let i = 0; i < this.metaData.haulers.length; i++)
      {
        const creep = Game.creeps[this.metaData.haulers[i]];
        if(creep)
          this.HaulerActions(creep, boostLevel);
      }
    }

    this.metaData.haulers = this.SpawnCreeps(numberOfHaulers, this.metaData.haulers, 'shHauler');
    this.metaData.attackers = this.SpawnCreeps(attackerAmount, this.metaData.attackers, 'powerAttacker');
    this.metaData.healers = this.SpawnCreeps(healerAmount, this.metaData.healers, 'powerHealer');

    for(let i = 0; i < this.metaData.attackers.length; i++)
    {
      const creep = Game.creeps[this.metaData.attackers[i]];
      if(creep)
        this.AttackerActions(creep);
    }

    console.log(this.name, 5)
    for(let i = 0; i < this.metaData.healers.length; i++)
    {
      const creep = Game.creeps[this.metaData.healers[i]];
      if(creep)
        this.HealerActions(creep);
    }
  }

  private SpawnCreeps(amount: number, creeps: string[], type: string): string[]
  {
    creeps = Utils.clearDeadCreeps(creeps);
    const count = Utils.creepPreSpawnCount(creeps, 100);
    if(count < amount)
    {
      const creepName = type + '-' + this.metaData.roomName + '-' + Game.time;
      const spawned = Utils.spawn(this.kernel, this.spawnRoom.name, type, creepName, {});

      if(spawned)
        creeps.push(creepName);
    }

    return creeps;

  }

  private AttackerActions(creep: Creep)
  {
    console.log(this.name, 'AA', 1, creep.memory.boost, creep.name)
    if(!creep.memory.boost)
    {
      console.log(this.name, 'AA', 2)
      creep.boostRequest([RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE,
        RESOURCE_CATALYZED_GHODIUM_ALKALIDE,
        RESOURCE_UTRIUM_HYDRIDE], false);
      return;
    }

    console.log(this.name, 'AA', 3)
    const healer = Game.creeps[this.metaData.healers[0]];

    if(creep.pos.roomName !== healer?.pos.roomName)
    {
      let dir = creep.pos.getDirectionTo(healer);
      dir += 4;
      if(dir > 8)
      {
        const temp = dir % 8;
        dir = temp as DirectionConstant;
      }

      creep.move(dir);

      return;
    }

    if(!creep.pos.isNearTo(healer))
      creep.travelTo(healer);
    else
    {
      console.log(this.name, 'AA', this.powerBank);
      this.powerBank = <StructurePowerBank>creep.room.find(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_POWER_BANK})[0];
      if(this.powerBank?.hits > 0)
      {
        if(!creep.pos.isNearTo(this.powerBank))
          creep.travelTo(this.powerBank);
        else
          creep.attack(this.powerBank);

        return;
      }
      else
      {
        const pos = new RoomPosition(25, 25, this.bankRoom.name);
        creep.travelTo(pos);
      }
    }
  }

  private HealerActions(creep: Creep)
  {
    console.log(this.name, 'healA', 1, creep.pos, creep.name)
    if(!creep.memory.boost)
    {
      creep.boostRequest([RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE], false);
      return;
    }

    const attacker = Game.creeps[this.metaData.attackers[0]]
    console.log(this.name, 'healA', 2, attacker?.name);
    if(attacker)
    {
      if(attacker.ticksToLive === 1)
      {
        creep.suicide();
        return;
      }

      console.log(this.name, 'healA', 3)
      if(!creep.pos.isNearTo(attacker))
      {
        const ret = creep.travelTo(attacker);
        console.log(this.name, 'healA', 4, ret)
      }
      else
      {
        const dir = creep.pos.getDirectionTo(attacker);
        console.log(this.name, 'healA', 5, dir)
        const ret = creep.move(dir);
        console.log(this.name, 'healA', 6, ret)

        if(creep.hits < creep.hitsMax)
          creep.heal(creep);

        if(creep.room.name === this.bankRoom.name)
          creep.heal(attacker);

        console.log(this.name, 'healA', 7)
      }
    }
    else
    {
      if(!creep.pos.isNearTo(this.spawnRoom.storage))
        creep.travelTo(this.spawnRoom.storage);
    }
  }

  private HaulerActions(creep: Creep, boostLevel: number)
  {
    if(!creep.memory.boost)
    {
      let boosts: string[] = [RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE];
      if(boostLevel === 1)
        boosts.push(RESOURCE_KEANIUM_HYDRIDE);
      else if(boostLevel === 2)
        boosts.push(RESOURCE_KEANIUM_ACID);
      else if(boostLevel === 3)
        boosts.push(RESOURCE_CATALYZED_KEANIUM_ACID);

      creep.boostRequest(boosts, false);
      return;
    }

    if(creep.room.name === this.metaData.roomName)
    {
      const room = Game.rooms[this.metaData.roomName];
      const ruins = room.find(FIND_RUINS).filter((r) => r.store.getUsedCapacity() > 0);
      if(ruins.length)
      {
        const ruin = creep.pos.findClosestByPath(ruins);
        if(!creep.pos.isNearTo(ruin))
          creep.travelTo(ruin);
        else
          creep.withdrawEverything(ruin);

        return;
      }

      const resources = room.find(FIND_DROPPED_RESOURCES).filter((d) => d.amount > 0);
      if(resources.length)
      {
        const resource = creep.pos.findClosestByPath(resources);
        if(!creep.pos.isNearTo(resource))
          creep.travelTo(resource);
        else
          creep.withdrawEverything(Resource);

        return;
      }

      if(creep.store.getUsedCapacity() === creep.store.getCapacity() ||
        (resources.length === 0 && ruins.length === 0))
        {
          const terminal = this.spawnRoom.terminal;
          if(!creep.pos.isNearTo(terminal))
            creep.travelTo(terminal, {allowHostile: false});
          else
            creep.transferEverything(terminal);

          return;
        }
    }

    let pos: RoomPosition;
    if(this.powerBank)
      pos = this.powerBank.pos;
    else
    {
      const x = +this.metaData.powerBankPos.split(',')[0];
      const y = +this.metaData.powerBankPos.split(',')[1];
      pos = new RoomPosition(x, y, this.metaData.roomName);
    }

    if(!creep.pos.isNearTo(pos))
      creep.travelTo(pos, {allowHostile: false});



  }
}
