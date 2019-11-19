import { Process } from "os/process";
import { Utils } from "lib/utils";
import { AttackerLifetimeProcess } from "processTypes/lifetimes/attacker";
import { HealerLifetimeProcess } from "processTypes/lifetimes/healer";

export class StrongHoldDestructionProcess extends Process
{
  metaData: StrongHoldDestructionProcessMetaData
  type = 'shdp';
  core: StructureInvaderCore
  flag: Flag;
  dismantleDone: boolean;
  haulerAlmostDone: boolean;
  haulerDone: boolean;

  ensureMetaData()
  {
    if(!this.metaData.attackers)
      this.metaData.attackers = [];

    if(!this.metaData.healers)
      this.metaData.healers = [];

    if(!this.metaData.dismantlers)
      this.metaData.dismantlers = [];

    if(!this.metaData.haulers)
      this.metaData.haulers = [];
  }

  run()
  {

    console.log(this.name, 'running');
    this.ensureMetaData();
    this.flag = Game.flags[this.metaData.flagName];
    if(!this.flag)
    {
      this.completed = true;
      return;
    }

    if(this.dismantleDone && this.haulerDone)
    {
      this.flag.memory.coreInfo.invaderCorePresent = false;
      this.completed = true;
      return;
    }

    console.log(this.name, 2);
    if(this.metaData.roomName === undefined)
      this.metaData.roomName = this.flag.room.name;

    let spawnRoom = Game.rooms[this.flag.room.name];
    let observer = this.roomData().observer;


    let coreRoomName = this.flag.name.split('-')[0];
    observer.observeRoom(coreRoomName);

    this.core = Game.getObjectById(this.flag.memory.coreInfo.coreId) as StructureInvaderCore;
    if(!this.core)
    {
      this.core = this.flag.room.findStructures(STRUCTURE_INVADER_CORE)[0] as StructureInvaderCore;
    }

    if(this.core)
    {
      console.log(this.name, 3);
      if(this.core.ticksToDeploy === undefined || this.core.ticksToDeploy < 200)
      {
        console.log(this.name, 4);
        let numberOfAttackers = 0;
        let numberofHealers = 0;

        // MOve to spawning function later
        if(this.core.level <= 2)
        {
          numberOfAttackers = 1;
          numberofHealers = 1;
        }

        this.metaData.attackers = Utils.clearDeadCreeps(this.metaData.attackers);
        this.metaData.healers = Utils.clearDeadCreeps(this.metaData.healers);
        console.log(this.name, 5, this.metaData.attackers[0]);
        if(this.metaData.attackers.length < numberOfAttackers)
        {
          console.log(this.name, 6);
          let creepName = 'atk-' + this.metaData.roomName + '-' + Game.time;
          let spawned = Utils.spawn(this.kernel, this.metaData.roomName, 'testattacker', creepName,
          {
          });

          if(spawned)
          {
            this.metaData.attackers.push(creepName);
          }
        }

        if(this.metaData.healers.length < numberofHealers)
        {
          let creepName = 'heal-' + this.metaData.roomName + '-' + Game.time;
          let spawned = Utils.spawn(this.kernel, this.metaData.roomName, 'testhealer', creepName,
          {
          })

          if(spawned)
          {
            this.metaData.healers.push(creepName);
          }
        }
      }
    }
    else
    {
      // Dismantle and clean up
      const numberOfDistmantlers = 1;
      const numberOfHaulers = 1;

      this.metaData.dismantlers = Utils.clearDeadCreeps(this.metaData.dismantlers);
      this.metaData.haulers = Utils.clearDeadCreeps(this.metaData.haulers);

      if(this.metaData.dismantlers.length < numberOfDistmantlers && !this.dismantleDone)
      {
        let creepName = 'dismantler-' + this.metaData.roomName + '-' + Game.time;
        let spawned = Utils.spawn(this.kernel, this.metaData.roomName, 'dismantleCarry', creepName, {});

        if(spawned)
          this.metaData.dismantlers.push(creepName);
      }

      if(this.metaData.haulers.length < numberOfHaulers && !this.haulerDone)
      {
        const creepName = 'haulers-' + this.metaData.roomName + '-' + Game.time;
        const spawned = Utils.spawn(this.kernel, this.metaData.roomName, 'skMinerHauler', creepName, {});

        if(spawned)
          this.metaData.haulers.push(creepName);
      }

    }


    for(let i = 0; i < this.metaData.attackers.length; i++)
    {
      let attakcer = Game.creeps[this.metaData.attackers[i]];
      if(attakcer)
      {
        this.AttackerActions(attakcer);
      }
    }

    for(let i = 0; i < this.metaData.healers.length; i++)
    {
      let healer = Game.creeps[this.metaData.healers[i]];
      if(healer)
      {
        this.HealerActions(healer);
      }
    }

    for(let i = 0; i < this.metaData.dismantlers.length; i++)
    {
      let dismantler = Game.creeps[this.metaData.dismantlers[i]];
      if(dismantler)
        this.DismantlerActions(dismantler);
    }

    for(let i = 0; i < this.metaData.haulers.length; i++)
    {
      let hauler = Game.creeps[this.metaData.haulers[i]];
      if(hauler)
        this.HaulerActions(hauler);
    }
  }

  AttackerActions(creep: Creep)
  {
    try
    {
      if(!creep.memory.boost)
      {
        creep.boostRequest([RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE,
          RESOURCE_CATALYZED_UTRIUM_ACID], false);
        return;
      }

      let healer = Game.creeps[this.metaData.healers[0]];
      // Check if healer is around
      if(creep.pos.roomName !== healer.pos.roomName)
      {
        let dir = creep.pos.getDirectionTo(healer);
        dir += 4;
        if(dir > 8)
        {
          const temp = dir % 8;
          dir = temp as DirectionConstant;
        }

        creep.move(dir);
      }
      else if(creep.pos.inRangeTo(healer, 1))
      {
        if(this.core)
        {
          const target = this.FindTarget(creep);

          if(target)
          {
            creep.memory.target = target.id;
            console.log(this.name, 'Target', target.id, target.pos)
            if(!creep.pos.isNearTo(target))
              creep.travelTo(target);
            else
              creep.attack(target);

            return;
          }
        }
        else
        {
          let hostileStructures = creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, 8);
          if(hostileStructures.length)
          {
            const hostiles = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 8);
            if(hostiles.length)
            {
              let target = creep.pos.findClosestByRange(hostiles);
              if(target)
              {
                creep.memory.target = target.id;
                if(creep.pos.isNearTo(target))
                  creep.attack(target)
                else
                  creep.travelTo(target);

                return;
              }
            }
          }
        }
      }
      else
      {
        // healer not around wait
      }

    }
    catch(error)
    {
      console.log(this.name, error);
    }
  }

  HealerActions(creep: Creep)
  {
    try
    {
      if(!creep.memory.boost)
      {
        creep.boostRequest([RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE,
          RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE], false);
        return;
      }

      let attacker = Game.creeps[this.metaData.attackers[0]];

      if(attacker.pos.inRangeTo(creep, 1))
      {
        let target = Game.getObjectById(attacker.memory.target) as Structure;
        if(target && attacker.pos.inRangeTo(target, 3))
        {
          let reverse: number
          let dir = attacker.pos.getDirectionTo(target);
          dir += 4;
          if(dir > 8)
            reverse = dir % 8;
          else
            reverse = dir;

          const pos = attacker.pos.getPositionAtDirection(reverse);
          creep.moveTo(pos);
        }
        else
        {
          let sk = Game.getObjectById(attacker.memory.target) as Creep
          if(sk)
          {
            creep.heal(sk);
            let dir = creep.pos.getDirectionTo(attacker);
            creep.move(dir);
          }
          else
          {
            let dir = creep.pos.getDirectionTo(attacker);
            creep.move(dir);
          }
        }
      }
      else
      {
        if(creep.hits < creep.hitsMax)
          creep.heal(creep);

        creep.travelTo(attacker);
      }

      if(creep.pos.roomName !== this.flag.room.name)
      {
        if(creep.hits < creep.hitsMax)
          creep.heal(creep);
        else if(attacker.hits < attacker.hitsMax)
          creep.heal(attacker);

        return;
      }

      if(attacker.pos.roomName === this.flag.room.name && this.core)
      {
        if(attacker.hits === attacker.hitsMax &&
          creep.hits < creep.hitsMax)
          creep.heal(creep);

        creep.heal(attacker);
      }
    }
    catch(error)
    {
      console.log(this.name, error);
    }
  }

  DismantlerActions(creep: Creep)
  {
    try
    {
      let hauler: Creep;


      if(creep.pos.roomName !== this.flag.pos.roomName)
      {
        creep.travelTo(this.flag);
        return;
      }

      let structures = creep.room.find(FIND_HOSTILE_STRUCTURES);
      if(structures.length)
      {
        structures = _.filter(structures, (s)=> {
          if(s.structureType === STRUCTURE_RAMPART)
          {
            const targetContainer = s.pos.lookForStructures(STRUCTURE_CONTAINER);
            if(targetContainer)
              return true;

            /*const targetTower = s.pos.lookForStructures(STRUCTURE_TOWER);
            if(targetTower)
              return true;*/
          }
        });
        if(structures.length)
        {
          let target = creep.pos.findClosestByPath(structures);
          if(!creep.pos.isNearTo(target))
          {
            creep.travelTo(target);
            return;
          }

          if(this.metaData.haulers.length)
          {
            hauler = Game.creeps[this.metaData.haulers[0]];

            if(creep.pos.isNearTo(hauler) && hauler.store.getFreeCapacity() > 0)
            {
              creep.dismantle(target);
              if(creep.store.getFreeCapacity() === 0)
              {
                creep.transferEverything(hauler);
              }
              return;
            }
          }
        }
        else
        {
          creep.suicide();
          this.dismantleDone = true;
        }
      }
    }
    catch(error)
    {
      console.log(this.name, 'dismantleActions', error);
    }
  }

  HaulerActions(creep: Creep)
  {
    try
    {
      if(!creep.memory.atPlace)
      {
        creep.memory.distance++;
      }

      /*if(!creep.memory.boost)
      {
        creep.boostRequest([RESOURCE_CATALYZED_KEANIUM_ACID], false);
        return;
      }*/

      // Back in main room code
      if(creep.store.getFreeCapacity() === 0 || creep.memory.full)
      {
        console.log(this.name, 'Should be going back');
        creep.memory.full = true;
        let storage = Game.rooms[this.metaData.roomName].storage;
        if(!creep.pos.isNearTo(storage))
        {
          const hostiles = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 10, {filter: c => c.owner.username !== 'Invader'});
          if(hostiles.length)
          {
            console.log(this.name, 'Found enemies');
            this.PathSearch(creep, storage);
            return;
          }
          else
          {
            creep.travelTo(storage);
          }
        }
        else
          creep.transferEverything(storage);

        /*if(creep.ticksToLive < creep.memory.distance * 2.2)
        {
          let container = this.roomData().generalContainers[0];
          if(!creep.pos.inRangeTo(container, 0))
            creep.travelTo(container);
          else
            creep.suicide();
          return;
        }*/

        if(creep.store.getUsedCapacity() === 0)
        {
          if(this.haulerAlmostDone)
            this.haulerDone = true;

          creep.memory.full = false;
        }
        return;
      }

      if(creep.pos.roomName !== this.flag.pos.roomName)
      {
        const hostiles = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 4);
        if(hostiles.length)
        {
          this.PathSearch(creep, this.flag);
          return;
        }

        creep.travelTo(this.flag);
        return;
      }

      let containers = creep.pos.findInRange(FIND_STRUCTURES, 10, {filter: s => s.structureType === STRUCTURE_CONTAINER});
      if(containers.length)
      {
        let container = _.find(containers, (c) => {
          if(c instanceof StructureContainer)
          {
            if(c.store.getUsedCapacity() > 0)
            {
              let ramp = c.pos.lookForStructures(STRUCTURE_RAMPART);
              if(ramp === undefined)
                return true;
            }
          }
        })

        if(container instanceof StructureContainer)
        {
          if(!creep.pos.isNearTo(container))
            creep.travelTo(container);
          else
            creep.withdrawEverything(container);

          return;
        }
      }

      let dismantler = Game.creeps[this.metaData.dismantlers[0]];
      if(!creep.pos.isNearTo(dismantler))
      {
        creep.travelTo(dismantler);
        return;
      }
      else
        creep.memory.atPlace = true;



      let resources = dismantler.pos.lookFor(LOOK_RESOURCES);
      if(resources.length)
      {
        creep.pickup(resources[0]);
        return;
      }

      let ruins = creep.room.find(FIND_RUINS);
      if(ruins)
      {
        let ruin = _.find(ruins, (r) => {
          if(creep.pos.isNearTo(r))
          {
            if(r.store.getUsedCapacity() > 0)
              return true;
          }
        })

        if(ruin)
        {
          if(this.dismantleDone)
          {
            if(!creep.pos.isNearTo(ruin))
              creep.travelTo(ruin);
            else
              creep.withdrawEverything(ruin);

            return;
          }
          creep.withdrawEverything(ruin);
          return;
        }
      }

      let conatinerEmpty = true;
      if(containers.length)
      {
        _.forEach(containers, (c) => {
          if(c instanceof StructureContainer)
            if(c.store.getUsedCapacity() > 0)
              conatinerEmpty = false;
        });
      }

      if(conatinerEmpty)
      {
        creep.memory.full = true;
        this.haulerAlmostDone = true;
      }

    }
    catch(error)
    {
      console.log(this.name, 'hauleractions', error);
    }
  }

  PathSearch(creep: Creep, target: AnyStructure | Creep | Flag)
  {
    let ret = PathFinder.search(
      creep.pos, target.pos,
      {
        plainCost: 2,
        swampCost: 10,

        roomCallback: function(roomName) {
          let room = Game.rooms[roomName];

          if(!room) return;
          let costs = new PathFinder.CostMatrix;

          creep.pos.findInRange(FIND_HOSTILE_CREEPS, 4).forEach(function(h) {
            for(let i = -4; i < 4; i++)
              for(let j = -4; j < 4; j++)
                costs.set(h.pos.x + i, h.pos.y + j, 0xff);
          });

          return costs;
        }
      }
    );

    let pos = ret.path[0];
    creep.move(creep.pos.getDirectionTo(pos));
  }

  FindTarget (creep: Creep)
  {
    try
    {
      let tower = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {filter: s => s.structureType === STRUCTURE_TOWER});
      if(tower)
      {
        let rampart = tower.pos.lookForStructures(STRUCTURE_RAMPART);
        if(rampart)
        {
            console.log(this.name, 'Returning rampart');
            return rampart;
        }
        else
        {
          console.log(this.name, 'Returning rampart');
          return tower;
        }
      }
      else
      {
        console.log(this.name, 'Returning rampart');
        let rampart = this.core.pos.lookForStructures(STRUCTURE_RAMPART);
        if(rampart)
          return rampart;

        return this.core;
      }
    }
    catch(error)
    {
      console.log(this.name, error)
    }
  }
}
