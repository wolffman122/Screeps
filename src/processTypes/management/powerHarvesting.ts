import { Process } from "os/process";
import { WorldMap } from "lib/WorldMap";
import { helper } from "lib/helper";
import { Traveler } from "lib/Traveler";
import { Utils } from "lib/utils";
import { AlleyObservationManagementProcess } from "./alleyObservation";

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

    if(!this.metaData.startTime)
      this.metaData.startTime = Game.time;
  }

  run()
  {
    if(this.name === 'powhm-E46S50')
      console.log(this.name, 'where is this process');
    this.ensureMetaData();

    if((this.metaData.suicideSequence && Game.time > this.metaData.decayTime)
     /*|| this.name === 'powhm-E38S50' */)
    {
      this.completed = true;
      return;
    }

    console.log(this.name, 'Power harvesting', this.metaData.startTime, this.metaData.spawnRoomName, this.metaData.powerBankId);
    if(this.metaData.startTime + 6000 < Game.time)
    {
      this.completed = true;
      return;
    }

    this.spawnRoom = Game.rooms[this.metaData.spawnRoomName];
    this.bankRoom = Game.rooms[this.metaData.roomName];
    this.powerBank = <StructurePowerBank>Game.getObjectById(this.metaData.powerBankId);

    if(this.name === 'powhm-54S50')
      this.metaData.haulerDone = true;
    console.log(this.name, 'should be done', this.metaData.haulers.length, this.metaData.haulerDone)
    if(this.metaData.haulers.length === 0 && this.metaData.haulerDone)
    {
      this.completed = true;
      return;
    }

    // if(this.bankRoom && this.powerBank)
    // {
    //   Game.notify(this.name + 'Bank info ticks to decay: ' + this.powerBank.ticksToDecay + ' power: ' + this.powerBank.power);
    // }

    const attackerAmount = 1;
    const healerAmount = 1;

    let numberOfHaulers = 0;
    let boostLevel = 0;

    // Calculate drop in power hits to account for double attack
    let spawnHaulers = false;
    if(this.powerBank)
    {
      if(this.metaData.previousPowerBankHits)
      {
        const diff = this.metaData.previousPowerBankHits - this.powerBank.hits;
        const hitsToSpawnHaulers = this.powerBank.hits / diff;
        if(hitsToSpawnHaulers <= 240)
          spawnHaulers = true;
      }
      this.metaData.previousPowerBankHits = this.powerBank.hits;
    }

    console.log(this.name, 'SPAWN HAULERS', spawnHaulers);
    if(this.powerBank?.power && spawnHaulers)
    {
      numberOfHaulers = 1;
      console.log(this.name, this.powerBank?.power, this.powerBank.hits)
      if(!this.metaData.powerBankPos)
        this.metaData.powerBankPos = this.powerBank.pos.x + ',' + this.powerBank.pos.y;

        console.log(this.name, 'haul' ,1)
      let amount = this.powerBank.power;

      const unBoostedCarryParts =  Math.ceil(amount / CARRY_CAPACITY);
      const level1BoostedCarryParts = Math.ceil(amount / (CARRY_CAPACITY * BOOSTS.carry.KH.capacity));
      const level2BoostedCarryParts = Math.ceil(amount / (CARRY_CAPACITY * BOOSTS.carry.KH2O.capacity));
      const level3BoostedCarryParts = Math.ceil(amount / (CARRY_CAPACITY * BOOSTS.carry.XKH2O.capacity));
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

      // Test code for more dynamic haulers

      // const level3Carry = (CARRY_CAPACITY * BOOSTS.carry.XKH2O.capacity) * 40;
      // const level2Carry = (CARRY_CAPACITY * BOOSTS.carry.KH2O.capacity) * 40;
      // const level1Carry = (CARRY_CAPACITY * BOOSTS.carry.KH.capacity) * 40;
      // const level0Carry = CARRY_CAPACITY * 40;

      // if(!this.metaData.haulerMakeUp)
      //   this.metaData.haulerMakeUp = [];

      // do
      // {
      //   let totalCarry = 0;
      //   if(this.metaData.haulerMakeUp?.length)
      //     {
      //       for(let i = 0; i < this.metaData.haulerMakeUp.length; i++)
      //       {
      //         totalCarry += this.metaData.haulerMakeUp[i].amount;
      //         console.log(this.name,)
      //       }
      //     }
      //   amount -= totalCarry;

      //   if((amount - level3Carry) >= 0)
      //     this.metaData.haulerMakeUp.push({boostLevel: 3, amount: level3Carry});
      //   else if((amount - level2Carry) >= 0)
      //     this.metaData.haulerMakeUp.push({boostLevel: 2, amount: level2Carry});
      //   else if((amount - level1Carry) >= 0)
      //     this.metaData.haulerMakeUp.push({boostLevel: 1, amount: level1Carry});
      //   else if((amount - level0Carry) >= 0)
      //     this.metaData.haulerMakeUp.push({boostLevel: 0, amount: level0Carry});

      // } while (amount > 0);

    }

    if(!this.metaData.suicideSequence)
    {
      this.metaData.haulers = this.SpawnCreeps(numberOfHaulers, this.metaData.haulers, 'shHauler');
      this.metaData.attackers = this.SpawnCreeps(attackerAmount, this.metaData.attackers, 'powerAttacker');
      this.metaData.healers = this.SpawnCreeps(healerAmount, this.metaData.healers, 'powerHealer');
    }

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

    console.log(this.name, 'haul' ,2, numberOfHaulers, boostLevel);
      for(let i = 0; i < this.metaData.haulers.length; i++)
      {
        const creep = Game.creeps[this.metaData.haulers[i]];
        if(creep)
          this.HaulerActions(creep, boostLevel);
      }
  }

  private SpawnCreeps(amount: number, creeps: string[], type: string): string[]
  {
    creeps = Utils.clearDeadCreeps(creeps);
    const count = Utils.creepPreSpawnCount(creeps, 100);
    if(count < amount && !this.metaData.haulerDone)
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
    if(this.metaData.suicideSequence)
    {
      const spawn = this.roomInfo(this.metaData.spawnRoomName).spawns[0];
      if(!creep.pos.isNearTo(spawn))
        creep.travelTo(spawn, {preferHighway: true, allowHostile: false});
      else
      {
        if(!spawn.spawning)
        {
          if(spawn.recycleCreep(creep) === OK)
            this.completed = true;
        }
        else
        {
          if(creep.suicide() === OK)
            this.completed = true;
        }
      }

      return;
    }
    console.log(this.name, 'AA', 1, creep.memory.boost, creep.name, creep.pos, this.metaData.suicideSequence)
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
      if(this.powerBank?.pos.findInRange(FIND_HOSTILE_CREEPS, 1).length && !creep.pos.isNearTo(this.powerBank))
      {
        console.log(this.name, 'AA', 4)
        this.metaData.suicideSequence = true;
        this.metaData.decayTime = Game.time + this.powerBank.ticksToDecay;
      }

      console.log(this.name, 'AA', 5)

      if(this.powerBank?.hits > 0)
      {
        console.log(this.name, 'AA', 6)
        if(!creep.pos.isNearTo(this.powerBank))
          creep.travelTo(this.powerBank, {preferHighway: true, allowHostile: false});
        else
          creep.attack(this.powerBank);

        return;
      }
      else
      {
        console.log(this.name, 'AA', 7)
        const ruins = creep.room.find(FIND_RUINS);
        const deposits = creep.room.find(FIND_DEPOSITS);
        if(ruins.length || deposits.length)
        {
          const ruin = ruins[0];
          const ruinSpots = ruin.pos.openAdjacentSpots(false);
          const deposit = deposits[0];
          const depositSpots = deposit.pos.openAdjacentSpots(false);
          if(!ruinSpots.length || !depositSpots.length)
          {
            const haulers = Utils.inflateCreeps(this.metaData.haulers);
            if(creep.pos.findInRange(haulers, 1).length)
            {
              const hauler = creep.pos.findClosestByRange(haulers);
              const dir = creep.pos.getDirectionTo(hauler);
              creep.move(dir);
              return;
            }
          }
        }
        else
        {
          const pos = new RoomPosition(25, 25, this.metaData.roomName);
          creep.travelTo(pos, {preferHighway: true, allowHostile: false});
        }
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

      const dir = creep.pos.getDirectionTo(attacker);
      console.log(this.name, 'healA', 3, creep.pos.isNearExit(0), attacker.pos.roomName === creep.pos.roomName, creep.pos, dir)
      if(!creep.pos.isNearTo(attacker))
      {
        const ret = creep.travelTo(attacker);
        console.log(this.name, 'healA', 4, ret)
      }
      else
      {

        console.log(this.name, 'healA', 5, dir)
        const ret = creep.move(dir);
        console.log(this.name, 'healA', 6, ret)

        if(creep.hits < creep.hitsMax)
          creep.heal(creep);

        if(creep.room.name === this.bankRoom?.name)
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
    console.log(this.name, 'haul', 0.1, creep.pos)
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

    if(creep.memory.full && creep.store.getUsedCapacity() === 0
      && creep.room.name === this.metaData.spawnRoomName)
    {
      const spawn = this.roomInfo(this.metaData.spawnRoomName).spawns[0];
      if(!creep.pos.isNearTo(spawn))
        creep.travelTo(spawn);
      else
      {
        if(!spawn.spawning)
          spawn.recycleCreep(creep);
        else
          creep.suicide();
      }
      return;
    }

    if(creep.store.getUsedCapacity() > 0 || creep.memory.full)
    {
      this.metaData.haulerDone = true;
      const terminal = Game.rooms[this.metaData.spawnRoomName].terminal;
      if(!creep.pos.isNearTo(terminal))
        creep.travelTo(terminal, {preferHighway: true, allowHostile: false});
      else
      {
        creep.transferEverything(terminal);
        creep.memory.full;
      }

      return;
    }

    if(creep.room.name === this.metaData.roomName)
    {
      if(this.powerBank)
      {
        if(!creep.pos.inRangeTo(this.powerBank, 2))
          creep.travelTo(this.powerBank, {range: 2});

        return;
      }
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

      console.log(this.name, 'haul res', 1)
      const resources = room.find(FIND_DROPPED_RESOURCES).filter((d) => d.amount > 0);
      console.log(this.name, 'haul res', 1, resources.length)
      if(resources.length)
      {
        console.log(this.name, 'haul res', 1)
        const resource = creep.pos.findClosestByPath(resources);
        if(!creep.pos.isNearTo(resource))
          creep.travelTo(resource);
        else
          creep.pickup(resource);

        return;
      }

      creep.memory.full = true;
    }

    console.log(this.name, 'haul', 1)
    let pos: RoomPosition;
    if(this.powerBank)
      pos = this.powerBank.pos;
    else
    {
      console.log(this.name, 'haul', 2)
      const x = +this.metaData.powerBankPos.split(',')[0];
      const y = +this.metaData.powerBankPos.split(',')[1];
      pos = new RoomPosition(x, y, this.metaData.roomName);
    }

    if(!creep.pos.isNearTo(pos))
      creep.travelTo(pos, {allowHostile: false});



  }
}
