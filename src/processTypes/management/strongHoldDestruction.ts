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
    this.ensureMetaData();
    this.flag = Game.flags[this.metaData.flagName];
    if(!this.flag)
    {
      this.completed = true;
      return;
    }

    if(this.metaData.roomName === undefined)
      this.metaData.roomName = this.flag.memory.coreSkFoundRoom;

    let spawnRoom = Game.rooms[this.flag.memory.coreSkFoundRoom];
    let observer = this.roomData().observer;


    let coreRoomName = this.flag.name.split('-')[0];
    observer.observeRoom(coreRoomName);

    this.core = Game.getObjectById(this.flag.memory.coreId) as StructureInvaderCore;
    if(this.core)
    {
      if(this.core.ticksToDeploy === undefined || this.core.ticksToDeploy < 200)
      {
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

        if(this.metaData.attackers.length < numberOfAttackers)
        {
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

      /*if(this.metaData.dismantlers.length < numberOfDistmantlers)
      {
        let creepName = 'dismantler-' + this.metaData.roomName + '-' + Game.time;
        let spawned = Utils.spawn(this.kernel, this.metaData.roomName, 'dismantler', creepName, {});

        if(spawned)
          this.metaData.dismantlers.push(creepName);
      }*/

      /*if(this.metaData.haulers.length < numberOfHaulers)
      {
        const creepName = 'haulers-' + this.metaData.roomName + '-' + Game.time;
        const spawned = Utils.spawn(this.kernel, this.metaData.roomName, 'skMinerHauler', creepName, {});

        if(spawned)
          this.metaData.haulers.push(creepName);
      }*/

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
          if(creep.pos.inRangeTo(this.core, 2) && !creep.pos.inRangeTo(this.core, 1))
            creep.memory.stuck++;

          if(creep.memory.stuck < 2)
          {
            //Move to core
            if(!creep.pos.inRangeTo(this.core, 1) && healer.fatigue === 0)
              creep.travelTo(this.core);
            else
            {
              let rampart = this.core.pos.lookForStructures(STRUCTURE_RAMPART) as StructureRampart;
              if(rampart)
                creep.attack(rampart);
              else
                creep.attack(this.core);
            }
            return;
          }
          else
          {
            let s = creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, 1);
            s = _.filter(s, (t) => t.structureType === STRUCTURE_TOWER);
            if(s.length)
            {
              let target = creep.pos.findClosestByPath(s);
              creep.memory.target = target.id;
              if(!creep.pos.isNearTo(target))
                creep.travelTo(target);
              else
              {
                let rampart = target.pos.lookForStructures(STRUCTURE_RAMPART) as StructureRampart;
                if(rampart)
                {
                  let ret = creep.attack(rampart);
                }
                else
                {
                  let ret = creep.attack(target);
                }
              }
              return;
            }
            else
              creep.memory.stuck = 0;
          }
        }
        else
        {
          /*console.log(this.name, 'Clean up')
          let s = creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, 10);
          if(s.length)
          {
            let target = creep.pos.findClosestByPath(s);
            if(!creep.pos.isNearTo(target))
              creep.travelTo(target);
            else
              creep.attack(target);
          }*/
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
        let dir = creep.pos.getDirectionTo(attacker);
        creep.move(dir);
      }
      else
        creep.travelTo(attacker);

      if(attacker.pos.roomName === this.flag.room.name && this.core)
        creep.heal(attacker);
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
      if(creep.pos.roomName !== this.flag.pos.roomName)
      {
        creep.travelTo(this.flag);
        return;
      }

      let structures = creep.room.find(FIND_HOSTILE_STRUCTURES);
      if(structures.length)
      {
        structures = _.filter(structures, (s)=> s.structureType !== STRUCTURE_KEEPER_LAIR);
        let target = creep.pos.findClosestByPath(structures);
        if(!creep.pos.isNearTo(target))
        {
          creep.travelTo(target);
          return;
        }

        let hauler = Game.creeps[this.metaData.haulers[0]];
        if(creep.pos.isNearTo(hauler))
        {
          creep.dismantle(target);
          return;
        }
      }
    }
    catch(error)
    {
      console.log(this.name, error);
    }
  }

  HaulerActions(creep: Creep)
  {
    try
    {
      if(creep.pos.roomName !== this.flag.pos.roomName)
      {
        creep.travelTo(this.flag);
        return;
      }

      let dismantler = Game.creeps[this.metaData.dismantlers[0]];
      if(!creep.pos.isNearTo(dismantler))
      {
        creep.travelTo(dismantler);
        return;
      }

      let resources = dismantler.pos.lookFor(LOOK_RESOURCES);
      if(resources.length)
      {
        creep.pickup(resources[0]);
        return;
      }

      let ruins = creep.room.find(FIND_RUINS);

    }
    catch(error)
    {
      console.log(this.name, error);
    }
  }
}
