import { Process } from "os/process";
import { Utils } from "lib/utils";
import { AttackerLifetimeProcess } from "processTypes/lifetimes/attacker";
import { HealerLifetimeProcess } from "processTypes/lifetimes/healer";
import { CreepBuilder } from "lib/creepBuilder";

export class StrongHoldDestructionProcess extends Process
{
  metaData: StrongHoldDestructionProcessMetaData
  type = 'shdp';
  core: StructureInvaderCore
  haulerAlmostDone: boolean;
  spawnRoom: Room;
  coreRoom: Room;

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
    try
    {

      if(this.metaData.roomName === 'E44S55')
      {
        this.completed = true;
        return;
      }
      console.log(this.name, 'running');
      this.ensureMetaData();
      console.log(this.name)


      console.log(this.name, 2);
      // Might add back when we check the whole sector
      // if(this.metaData.roomName === undefined)
      // {
      //   this.metaData.roomName = Utils.nearestRoom(this.core.pos.roomName);
      // }

      console.log(this.name, 'Spawn room', this.metaData.roomName);


      this.spawnRoom = Game.rooms[this.metaData.spawnRoomName];

      let observer = this.roomInfo(this.spawnRoom.name).observer;


      this.coreRoom = Game.rooms[this.metaData.roomName];
      this.core = Game.getObjectById(this.metaData.coreId) as StructureInvaderCore;

      console.log(this.name, 3, this.coreRoom)
      if(!this.metaData.vision)
        observer.observeRoom(this.metaData.roomName);

      if(!this.coreRoom && this.metaData.vision)
        this.metaData.vision = false;

      if(this.metaData.haulerDone && this.metaData.dismantleDone)
      {
        const flag = this.spawnRoom.find(FIND_FLAGS, {filter: f => f.color === COLOR_YELLOW && f.secondaryColor === COLOR_YELLOW})[0] as Flag;
        if(flag)
        {
          flag.memory.attackingCore = false;
          this.completed = true;
          return;
        }
      }

      if(this.core || !this.metaData.cleaning)
      {
        this.metaData.cleaning = false;
        if(this.core)
        {
          this.metaData.coreLevel = this.core.level;
          this.metaData.corePos = this.core.pos;
        }

        //console.log(this.name, 'Ticks to deploy', this.core.ticksToDeploy, (this.core.ticksToDeploy === undefined || this.core.ticksToDeploy < 150));

        console.log(this.name, 4);
        let numberOfAttackers = 0;
        let numberofHealers = 0;
        let typeOfAttacker = 'testattacker';
        let typeOfHealer = 'testhealer';

        // MOve to spawning function later
        if(this.metaData.coreLevel === 1 || this.metaData.coreLevel === 2)
        {
          typeOfAttacker = 'soloMage';
          numberOfAttackers = 1;
        }
        else if(this.metaData.coreLevel === 3)
        {
          typeOfAttacker = 'mage';
          numberOfAttackers = 2;
        }
        else if(this.metaData.coreLevel === 4)
        {
          typeOfAttacker = 'mage';
          numberOfAttackers = 4;
        }
        /*else if(this.metaData.coreLevel == 4)
        {
          numberOfAttackers = 2;
          numberofHealers = 2;
          typeOfAttacker = 'SHRange';
          typeOfHealer = 'SH4Heal';
        }*/

        this.metaData.attackers = Utils.clearDeadCreeps(this.metaData.attackers);
        this.metaData.healers = Utils.clearDeadCreeps(this.metaData.healers);
        console.log(this.name, 5, this.metaData.attackers.length, numberOfAttackers, this.metaData.attackers[0]);
        if(this.metaData.attackers.length < numberOfAttackers)
        {
          console.log(this.name, 6, typeOfAttacker);
          let creepName = 'atk-' + this.metaData.spawnRoomName + '-' + Game.time;
          let spawned = Utils.spawn(this.kernel, this.metaData.spawnRoomName, typeOfAttacker, creepName,
          {
          });

          console.log(this.name, 7, spawned);

          if(spawned)
          {
            this.metaData.attackers.push(creepName);
          }
        }

        if(this.metaData.healers.length < numberofHealers)
        {
          let creepName = 'heal-' + this.metaData.spawnRoomName + '-' + Game.time;
          let spawned = Utils.spawn(this.kernel, this.metaData.spawnRoomName, typeOfHealer, creepName,
          {
          })

          if(spawned)
          {
            this.metaData.healers.push(creepName);
          }
        }
      }
      else if(this.metaData.cleaning)
      {
        console.log(this.name, 'Time to do clean up', this.metaData.dismantleDone, this.metaData.haulerDone, this.haulerAlmostDone);

        this.metaData.cleaning = true;
        // Dismantle and clean up
        let numberOfDistmantlers = 0;
        let numberOfHaulers = 0;




        //////////// TODO: Core is gone at this point Need to fix this ///////////////////////
        if(this.metaData.coreLevel === 1)
          numberOfHaulers = 1;
        else if(this.metaData.coreLevel === 2)
          numberOfHaulers = 1;
        else if(this.metaData.coreLevel <= 3)
        {
          numberOfHaulers = 1;
          numberOfDistmantlers = 1;
        }

        this.metaData.dismantlers = Utils.clearDeadCreeps(this.metaData.dismantlers);
        this.metaData.haulers = Utils.clearDeadCreeps(this.metaData.haulers);

        console.log(this.name, 'Hualer info', this.metaData.haulers.length, numberOfHaulers, !this.metaData.haulerDone);
        if(this.metaData.haulers.length < numberOfHaulers && !this.metaData.haulerDone)
        {
          const creepName = 'haulers-' + this.metaData.spawnRoomName + '-' + Game.time;
          console.log(this.name, 'Hualer', creepName);
          const spawned = Utils.spawn(this.kernel, this.metaData.spawnRoomName, 'shHauler', creepName, {});
          console.log(this.name, 'Hualer spawned', spawned);
          if(spawned)
            this.metaData.haulers.push(creepName);
        }

        console.log(this.name, 'Dismantler info', this.metaData.dismantlers.length, numberOfDistmantlers, !this.metaData.dismantleDone);
        if(this.metaData.dismantlers.length < numberOfDistmantlers && !this.metaData.dismantleDone)
        {
          let creepName = 'dismantler-' + this.metaData.spawnRoomName + '-' + Game.time;
          let spawned = Utils.spawn(this.kernel, this.metaData.spawnRoomName, 'dismantleCarry', creepName, {});

          if(spawned)
            this.metaData.dismantlers.push(creepName);
        }

        if(numberOfDistmantlers === 0)
          this.metaData.dismantleDone = true;
      }

      if(this.metaData.attackers.length < 3)
      {
        this.metaData.moving = undefined;
        this.metaData.standPos = undefined;
      }

      console.log(this.name, 'Attacker cleaning', 1, this.metaData.coreLevel)

      if(this.metaData.coreLevel > 2)
      {
        const leader = Game.creeps[this.metaData.attackers[0]];
        if(leader)
          this.LeadAttackerActions(leader);

        for(let i = 1; i < this.metaData.attackers.length; i++)
        {
          const follower = Game.creeps[this.metaData.attackers[i]];
          if(follower)
            this.FollowerAttackerActions(follower);
        }
      }
      else if(this.metaData.coreLevel <= 2)
      {
        console.log(this.name, 'Attacker cleaning', 2)
        for(let i = 0; i < this.metaData.attackers.length; i++)
        {
          let attakcer = Game.creeps[this.metaData.attackers[i]];
          if(attakcer)
          {
            console.log(this.name, 'Attacker cleaning', 3)
            this.AttackerActions(attakcer);
          }
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

      if(this.metaData.dismantleDone && this.metaData.haulerDone)
      {
        if(this.metaData.finishTime === undefined)
          this.metaData.finishTime = Game.time;
        console.log(this.name, "Strong hold clean up should be done shut down process", this.metaData.finishTime);
      }
    }
    catch(error)
    {
      console.log(this.name, 'run', error);
    }
  }

  AttackerActions(creep: Creep)
  {
    try
    {
      let target: string;

      console.log(this.name, creep.name, creep.memory.boost);
      if(!creep.memory.boost)
      {
        creep.boostRequest([RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE,
          RESOURCE_CATALYZED_KEANIUM_ALKALIDE, RESOURCE_CATALYZED_GHODIUM_ALKALIDE,
          RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE], false);
        return;
      }

      console.log(this.name, 'A', 1, creep.pos)
      //////////// TODO: Need way to check for sklairs in the future ///////////////////////
      if(this.core) /*|| this.flag.memory.coreInfo.skLairPresent*/
      {
        console.log(this.name, 'A', 2)
        if(creep.room.name === this.core.room.name)
        {
          console.log(this.name, 'A', 3)

          if(this.core.level === 1)
          {
            if(!creep.pos.isNearTo(this.core))
              creep.travelTo(this.core);

            creep.rangedMassAttack();
          }

          if(this.core.level === 2)
          {
              console.log(this.name, 'A', 5)
            if(!creep.pos.inRangeTo(this.core, 3))
              creep.travelTo(this.core, {range: 3});
            else
            {
              let rampart = this.core.pos.lookForStructures(STRUCTURE_RAMPART);
              if(rampart)
                creep.rangedAttack(rampart);
              else
                creep.rangedAttack(this.core);
            }
          }

            creep.say('💣');
            creep.heal(creep);
            return;
        }
        else
        {
          console.log(this.name, 'A', 6, this.core.pos)
          if(!creep.pos.isNearTo(this.core))
            creep.travelTo(this.core, {allowSK: true});

          creep.heal(creep);

          return;
        }
      }
      else if(creep.room.name !== this.metaData.roomName && !this.metaData.cleaning)
      {
        if(creep.hits < creep.hitsMax)
          creep.heal(creep);

        creep.travelTo(new RoomPosition(25,25,this.metaData.roomName), {allowSK: true});
        return;
      }

      console.log(this.name, 'A', 9)
      const structures = creep.room.find(FIND_HOSTILE_STRUCTURES, {filter: s => s.structureType !== STRUCTURE_KEEPER_LAIR});
      console.log(this.name, 'A', 9, structures.length)
      if(structures.length)
      {
        const containers = this.roomInfo(this.metaData.roomName).containers.filter(c => c.effects.length);
        let unCovered = false;
        containers.forEach( c=> {
          const rampart = c.pos.lookForStructures(STRUCTURE_RAMPART);
          if(!rampart)
            unCovered = true;
        });

        if(unCovered)
          this.metaData.cleaning = true;

        const structure = creep.pos.findClosestByRange(structures);
        if(!creep.pos.isNearTo(structure))
          creep.travelTo(structure);
        else
          creep.rangedMassAttack();

        if(creep.hits < creep.hitsMax)
          creep.heal(creep);

        creep.say('💣');
        return;
      }
      else
        this.metaData.cleaning = true;

      const container = this.roomInfo(this.metaData.spawnRoomName).generalContainers[0];
      if(container)
      {
        const spawns = this.roomInfo(this.metaData.spawnRoomName).spawns.filter(s => !s.spawning);
        if(spawns.length)
        {
          const spawn = spawns[0];
          if(!creep.pos.isNearTo(spawn))
            creep.travelTo(spawn, {allowSK: true});
          else
          {
            if(!spawn.spawning)
              spawn.recycleCreep(creep);
          }
        }
        else
        {
          const spawn = this.roomInfo(this.metaData.spawnRoomName).spawns[0];
          if(!creep.pos.isNearTo(spawn))
            creep.travelTo(spawn, {allowSK: true});
          else
          {
            if(!spawn.spawning)
              spawn.recycleCreep(creep);
          }
        }

        creep.say('☠', true);
        return;

      }
    }
    catch(error)
    {
      console.log(this.name, 'Attacker Actions', error);
    }
  }

  LeadAttackerActions(creep: Creep)
  {
    try
    {
      let target: RoomPosition;
      console.log(this.name, 'Lead', 1);
      if(!creep.memory.boost)
      {
        creep.boostRequest([RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE,
          RESOURCE_CATALYZED_KEANIUM_ALKALIDE, RESOURCE_CATALYZED_GHODIUM_ALKALIDE,
          RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE], false);
        return;
      }

      if(this.metaData.coreLevel === 4 && this.metaData.moving === undefined) // Gather creeps before leaving.
      {
        console.log(this.name, 'Lead', 2, creep.name);
        const remoteFlag = Game.flags['RemoteFlee-' + this.metaData.spawnRoomName];
        if(!creep.pos.isNearTo(remoteFlag))
        {
          creep.travelTo(remoteFlag);
          return;
        }
        else
        {
          creep.memory.atPlace = true;

          let atLocation = this.metaData.attackers.filter(a => {
            const attacker = Game.creeps[a];
            if(attacker?.memory.atPlace)
              return true;
          });

          if(atLocation.length < 4)
            return;
          else
          {
            this.metaData.moving = true;
            this.metaData.attackers.map( a => Game.creeps[a].memory.atPlace = false );
          }
        }
      }

      console.log(this.name, 'LAA', 1, this.core)
      if(!this.core) // Clean up
      {
        console.log(this.name, 'LAA', 1.1)
        this.metaData.cleaning = true;
        // Will need to put new code in for level 4 also
        if(this.metaData.coreLevel === 3)
        {
          console.log(this.name, 'Attack cleanup')
          const hurtCreeps = creep.pos.findInRange(FIND_MY_CREEPS, 5, {filter: c => c.hits < c.hitsMax});
          if(hurtCreeps.length)
          {
            const target = hurtCreeps[0];
            if(!creep.pos.inRangeTo(target,3))
              creep.travelTo(target, {range: 3});
            else
              creep.rangedHeal(target);

            return;
          }
          const tPos = this.core.pos;
          const pos = new RoomPosition(tPos.x+2, tPos.y, tPos.roomName);
          const rampartPos = new RoomPosition(tPos.x+1, tPos.y, tPos.roomName);
          const corePos = new RoomPosition(tPos.x, tPos.y, tPos.roomName);

          let path = creep.pos.findPathTo(corePos);
          console.log(this.name, 'Path length', path.length);   //  Testing to see when ramparts are up what the length is to core

          let lRamparts = creep.room.find(FIND_HOSTILE_STRUCTURES, {filter: s => s.structureType === STRUCTURE_RAMPART});
          if(lRamparts.length === 16)
          {
            lRamparts = _.filter(lRamparts, (l) => {
              return l.pos.lookForStructures(STRUCTURE_CONTAINER);
            })

            if(lRamparts.length)
            {
              const rampart = creep.pos.findClosestByPath(lRamparts);
              if(!creep.pos.isNearTo(rampart))
                creep.travelTo(rampart);
              else
                creep.rangedMassAttack();
              return;
            }
          }
          else
          {
            console.log(this.name, 'Attack cleanup',2)
            if(!creep.pos.isEqualTo(corePos))
            {
              creep.travelTo(pos);
            }

            let ramparts = pos.findInRange(FIND_HOSTILE_STRUCTURES, 5, {filter: s => s.structureType === STRUCTURE_RAMPART});
            if(ramparts.length)
            {
              console.log(this.name, 'Attack cleanup',3)
              creep.rangedMassAttack();
            }
            console.log(this.name, 'Attack cleanup',4)
          }
          console.log(this.name, 'Attack cleanup',5)
          return;
        }
        else if(this.metaData.coreLevel  === 2)
        {
          console.log(this.name, 'LAA', 1.2)
          const skLairs = creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, 8, {filter: s => s.structureType === STRUCTURE_KEEPER_LAIR});
          if(skLairs.length === 0)  // No core present clean up
          {
            console.log(this.name, 'LAA', 1.1)
            let ramparts = creep.room.find(FIND_HOSTILE_STRUCTURES, {filter: s => s.structureType === STRUCTURE_RAMPART});
            if(ramparts.length)
            {
              let target = creep.pos.findClosestByPath(ramparts);
              if(!creep.pos.isNearTo(target))
                creep.travelTo(target);
              else
                creep.rangedMassAttack();
              return;
            }
          }
          else
          {
            console.log(this.name, 'LAA', 1)
            const rampart = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {filter: s=> s.structureType === STRUCTURE_RAMPART});
            if(rampart)
            {
              console.log(this.name, 'LAA', 2)
              if(!creep.pos.isNearTo(rampart))
              {
                console.log(this.name, 'LAA', 3)
                creep.travelTo(rampart);
              }
              else
              {
                console.log(this.name, 'LAA', 4)
                creep.rangedMassAttack();
              }

              return;
            }

            const spawn = this.roomInfo(this.metaData.spawnRoomName).spawns[0];
            if(!creep.pos.isNearTo(spawn))
              creep.travelTo(spawn);
            else if(!spawn.spawning)
              spawn.recycleCreep(creep);
            else
              creep.suicide();
            return;
          }

          const spawn = this.roomInfo(this.metaData.spawnRoomName).spawns[0];
            if(!creep.pos.isNearTo(spawn))
              creep.travelTo(spawn);
            else if(!spawn.spawning)
              spawn.recycleCreep(creep);
            else
              creep.suicide();
            return;
        }
      }

      // Might be good to check attacker size and flee if it is to small.
      const follower = Game.creeps[this.metaData.attackers[1]];

      if(creep.pos.roomName !== follower?.pos.roomName)
      {
        let dir = creep.pos.getDirectionTo(follower);
        dir += 4;
        if(dir > 8)
        {
          const temp = dir % 8;
          dir = temp as DirectionConstant;
        }

        creep.move(dir);
      }
      else if(creep.pos.inRangeTo(follower, 1))
      {
        console.log(this.name, 'LAA', 2)
        if(this.core)
        {
          if(creep.room.name === this.core.room.name)
            this.metaData.vision = true;
          console.log(this.name, 'LAA', 3)
          if(creep.memory.standPos === undefined)
          {
            console.log(this.name, 'LAA', 4)
            if(this.metaData.coreLevel  === 4)
            {
              console.log(this.name, 'LAA', 5)
              const tPos = this.metaData.corePos;
              const standPos = new RoomPosition(tPos.x + 4, tPos.y - 4, tPos.roomName);
              creep.memory.standPos = standPos;
              target = standPos;
              console.log(this.name, 'LAA', 5.1, target);
            }
            else if(this.core?.level === 3)
            {
              const tPos = this.metaData.corePos;
              const standPos = new RoomPosition(tPos.x+3, tPos.y, tPos.roomName)
              creep.memory.standPos = standPos;
              target = standPos;
            }
            else if(this.core?.level === 2)
            {
              console.log(this.name, 'LAA', 6, target);
              const tPos = this.metaData.corePos;
              const leftPos = new RoomPosition(tPos.x -3, tPos.y, tPos.roomName);
              const rightPos = new RoomPosition(tPos.x + 3, tPos.y, tPos.roomName);
              const leftPath = creep.pos.findPathTo(leftPos);
              const rightPath = creep.pos.findPathTo(rightPos);
              target = (leftPath.length < rightPath.length) ? leftPos : rightPos;
              creep.memory.standPos = target;
            }
          }
          else
          {
            const tPos = creep.memory.standPos
            target = new RoomPosition(tPos.x, tPos.y, tPos.roomName);
          }

          console.log(this.name, 'LAA', 6)
          if(creep.room.name === this.coreRoom.name)
          {
            if(!this.metaData.stage)
              this.metaData.stage = 1;

            let strSay = '';
            console.log(this.name, 'distance to core', creep.pos.inRangeTo(target, 10))

            if(this.metaData.coreLevel === 4 && creep.pos.inRangeTo(target, 10))
            {
              const friendlies = creep.pos.findInRange(FIND_MY_CREEPS, 3, {filter: c => c.fatigue === 0});
              console.log(this.name, 'LAA', 7, target, 'friends length', friendlies.length)
              if(follower.fatigue === 0 && friendlies.length === 4)
              {
                strSay += '🚶‍♂️';
                creep.travelTo(target);
              }
            }
            else if(!creep.pos.inRangeTo(target, 0))
            {
              if(follower.fatigue === 0)
              {
                strSay += '🚶‍♂️';
                creep.travelTo(target);
              }
            }
            else
              creep.memory.atPlace = true;

            if(this.core?.level === 2)
            {
              if(creep.pos.inRangeTo(this.core, 3))
              {
                let rampart = this.core.pos.lookForStructures(STRUCTURE_RAMPART);
                if(rampart)
                {
                  creep.memory.target = rampart.id;
                  strSay += '🔫🛡';
                  creep.rangedAttack(rampart);
                }
                else
                {
                  creep.memory.target = this.core.id
                  strSay += '🔫⚙';
                  creep.rangedAttack(this.core);
                }
              }
            }
            else if(this.core?.level === 3)
            {
              if(creep.pos.inRangeTo(this.core, 3))
              {
                const rampartsLook = this.core.pos.lookForStructures(STRUCTURE_RAMPART);
                if(rampartsLook)
                {
                  creep.memory.target = rampartsLook.id;
                  strSay += '🔫🛡';
                  creep.rangedAttack(rampartsLook);
                }
                else
                {
                  creep.memory.target = this.core.id;
                  strSay += '🔫⚙';
                  creep.rangedAttack(this.core);
                }
              }
            }
            else if(this.metaData.coreLevel === 4)
            {
              // Find closest tower
              if(creep.memory.atPlace)
              {
                if(this.metaData.stage === 1)
                {
                  strSay += '1';
                  let rampart = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {filter: s=> s.structureType === STRUCTURE_RAMPART});
                  if(rampart)
                  {
                    creep.memory.target = rampart.id;
                    creep.rangedAttack(rampart);
                  }
                  else
                    this.metaData.stage = 2;
                }
                else if(this.metaData.stage === 2)
                {
                  strSay += '2';
                  const towers = creep.room.find(FIND_HOSTILE_STRUCTURES, {filter: s=> s.structureType === STRUCTURE_TOWER});
                  if(towers.length === 4)
                  {
                    const tower = creep.pos.findClosestByRange(towers);
                    creep.memory.target = tower.id;
                    if(tower?.pos.inRangeTo(creep, 3))
                    {
                      strSay += '🔫🗼';
                      creep.rangedAttack(tower);
                    }
                  }
                  else if(towers.length === 3)
                  {
                    const rampart = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {filter: s=> s.structureType === STRUCTURE_RAMPART});
                    if(rampart)
                    {
                      creep.memory.target = rampart.id;
                      if(creep.pos.inRangeTo(rampart, 3))
                      {
                        strSay += '🔫🛡';
                        creep.rangedAttack(rampart);
                      }
                    }
                    else
                    {
                      this.metaData.stage = 3;
                    }
                  }
                }
                else if(this.metaData.stage === 3)
                {
                  strSay += '3';
                  let rampart = this.core.pos.lookForStructures(STRUCTURE_RAMPART);
                  if(rampart)
                  {
                    creep.memory.target = rampart.id;
                    if(!creep.pos.inRangeTo(rampart, 3))
                      creep.travelTo(rampart, {range: 3});
                    else
                    {
                      creep.memory.standPos = creep.pos;
                      strSay += '🔫🛡';
                      creep.rangedAttack(rampart);
                    }
                  }
                  else
                  {
                    if(!creep.pos.inRangeTo(this.core,3))
                      creep.travelTo(this.core, {range: 3});
                    else
                    {
                      creep.memory.target = this.core.id;
                      strSay += '🔫⚙';
                      creep.rangedAttack(this.core);
                    }
                  }
                }
              }
            }

            strSay += '⛑S';
            creep.heal(creep);
            creep.say(strSay);
            return;
          }
          else
          {
            const friendlies = creep.pos.findInRange(FIND_MY_CREEPS, 3, {filter: c => c.fatigue === 0});
              console.log(this.name, 'LAA', 7, target, 'friends length', friendlies.length)
            if(!creep.pos.isEqualTo(target) && follower.fatigue === 0)
            {
              const ret = creep.travelTo(target);
              console.log(this.name, 'LAA', 8, ret)
            }

            console.log(this.name, 'LAA', 9)

            if(follower.hits < follower.hitsMax)
            {
              creep.say('⛑F');
              creep.heal(follower);
            }
            else if(creep.hits < creep.hitsMax)
            {
              creep.say('⛑S');
              creep.heal(creep);
            }

            return;
          }
        }
      }
    }
    catch(error)
    {
      console.log(this.name, 'creepAttackerActions', error);
    }
  }

  FollowerAttackerActions(creep: Creep)
  {
    try
    {
      let strSay = '';
      let target: string;
      console.log(this.name, 'Follow', 1)
      if(!creep.memory.boost)
      {
        creep.boostRequest([RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE,
          RESOURCE_CATALYZED_KEANIUM_ALKALIDE, RESOURCE_CATALYZED_GHODIUM_ALKALIDE,
          RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE], false);
        creep.say('B');
        return;
      }

      // Gather at location.
      if(this.metaData.coreLevel  === 4 && !this.metaData.moving)
      {
        const remoteFlag = Game.flags['RemoteFlee-' + this.metaData.spawnRoomName];
        if(!creep.pos.isNearTo(remoteFlag))
          creep.travelTo(remoteFlag);
        else
          creep.memory.atPlace = true;

        return;
      }

      let index = this.metaData.attackers.indexOf(creep.name);
      if(index !== -1)
      {
        strSay += index;
        index -= 1;
      }


      const attacker = Game.creeps[this.metaData.attackers[0]];
      const leader = Game.creeps[this.metaData.attackers[index]];

      console.log(this.name, 'FAA', !this.core);                                                        // this.flag.memory.coreInfo.skLairPresent === false)
      if(!this.core)
      {
        const skLairs = creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, 8, {filter: s => s.structureType === STRUCTURE_KEEPER_LAIR});
        if(skLairs.length === 0)  // No core present clean up
        {
          let ramparts = creep.room.find(FIND_HOSTILE_STRUCTURES, {filter: s => s.structureType === STRUCTURE_RAMPART});
          if(ramparts.length)
          {
            let target = creep.pos.findClosestByPath(ramparts);
            if(!creep.pos.isNearTo(target))
              creep.travelTo(target);
            else
              creep.rangedMassAttack();
            return;
          }

          let target = this.kernel.data.roomData[this.metaData.roomName].generalContainers[0];
          if(!creep.pos.inRangeTo(target, 0))
            creep.travelTo(target);
          else
            //creep.suicide();

          return;
        }
        else
        {
          console.log(this.name, 'FAA', 1)
          const rampart = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {filter: s=> s.structureType === STRUCTURE_RAMPART});
          if(rampart)
          {
            console.log(this.name, 'FAA', 2)
            if(!creep.pos.isNearTo(rampart))
            {
              console.log(this.name, 'FAA', 3)
              creep.travelTo(rampart);
            }
            else
            {
              console.log(this.name, 'FAA', 4)
              creep.rangedMassAttack();
            }

            return;
          }

          const spawn = this.roomInfo(this.metaData.spawnRoomName).spawns[0];
            if(!creep.pos.isNearTo(spawn))
              creep.travelTo(spawn);
            else if(!spawn.spawning)
              spawn.recycleCreep(creep);
            else
              creep.suicide();
            return;
        }

        const spawn = this.roomInfo(this.metaData.spawnRoomName).spawns[0];
            if(!creep.pos.isNearTo(spawn))
              creep.travelTo(spawn);
            else if(!spawn.spawning)
              spawn.recycleCreep(creep);
            else
              creep.suicide();
            return;
      }



      console.log(this.name, 'FAA', 1)
      // Healing code
      let tower = attacker.pos.findInRange(FIND_HOSTILE_STRUCTURES, 6, {filter: s => s.structureType === STRUCTURE_TOWER});
      if(creep.pos.roomName === leader.pos.roomName &&
        creep.pos.inRangeTo(leader, 3))
      {
        if(creep.hits < creep.hitsMax)
        {
          strSay += '⛑S';
          creep.heal(creep);
        }
        else
        {
          if(tower)
          {
            if(creep.pos.inRangeTo(attacker, 3) && !creep.pos.isNearTo(attacker))
            {
              strSay += 'R⛑A';
              creep.rangedHeal(attacker);
            }
            else if(creep.pos.isNearTo(attacker))
            {
              strSay += '⛑A';
              creep.heal(attacker);
            }
          }
          else
          {
            if(creep.pos.isNearTo(leader))
            {
              strSay += '⛑L';
              creep.heal(leader);
            }
            else if(creep.pos.inRangeTo(leader, 3))
            {
              strSay += 'R⛑L';
              creep.rangedHeal(leader);
            }
          }
        }
      }
      else
      {
        strSay += '⛑S';
        creep.heal(creep);
      }

      if(attacker.memory.standPos)
      {
        const sPos = attacker.memory.standPos;
        const standPos = new RoomPosition(sPos.x, sPos.y, sPos.roomName);
        console.log(this.name, 'FAA WTF', 1, standPos)
        // Placing follower creeps around Attacker to stay out of range of meleee
        if(this.core?.level === 4 && attacker.pos.inRangeTo(this.core, 10)) // Lvl 4
        {
          const tPos = attacker.memory.standPos;
          const targetPos = new RoomPosition(tPos.x, tPos.y, tPos.roomName);
          let standPos: RoomPosition;
          const trav = attacker.memory._trav as TravelData;
          const dir = +trav.path[0];
          let nextPos = attacker.pos.getPositionAtDirection(dir);
          switch(index + 1)
          {
            case 1:
              standPos = new RoomPosition(nextPos.x+1, nextPos.y, attacker.pos.roomName);
              break;
            case 2:
              standPos = new RoomPosition(nextPos.x+1, nextPos.y - 1, attacker.pos.roomName);
              break;
            case 3:
              standPos = new RoomPosition(nextPos.x, nextPos.y-1, attacker.pos.roomName);
              break;
          }

          const friendlies = creep.pos.findInRange(FIND_MY_CREEPS, 3, {filter: c => c.fatigue === 0});
          if(!creep.pos.isEqualTo(standPos) && friendlies.length === 4)
          {
            strSay += creep.moveDir(creep.pos.getDirectionTo(standPos));
            creep.travelTo(standPos);
          }
        }
        else if(this.core?.level === 3 && attacker.pos.inRangeTo(this.core, 3)) // Lvl 3
        {
          const standPos = new RoomPosition(attacker.pos.x, attacker.pos.y - 1, attacker.pos.roomName);
          if(!creep.pos.isEqualTo(standPos))
            creep.travelTo(standPos);
        }
        else if(this.core?.level === 2 && attacker.pos.isEqualTo(standPos))
        {
          let standPos = new RoomPosition(attacker.pos.x, attacker.pos.y - 1, attacker.pos.roomName);
          const look = standPos.lookFor(LOOK_TERRAIN);
          if(look.length)
          {
            const terrain = look[0];
            if(terrain === "wall")
              standPos = new RoomPosition(attacker.pos.x, attacker.pos.y + 1, attacker.pos.roomName);
          }
          console.log(this.name, 'FAA WTF', 1.5, standPos);

          if(!creep.pos.isEqualTo(standPos))
            creep.travelTo(standPos);
        }
        else // Moving through room before in range.
        {
          console.log(this.name, 'FAA WTF', 2)
          if(leader.pos.inRangeTo(creep, 1))
          {
            console.log(this.name, 'FAA WTF', 3)
            const dir = creep.pos.getDirectionTo(leader);
            creep.move(dir);
          }
          else
          {
            console.log(this.name, 'FAA WTF', 4)
            creep.travelTo(leader, {movingTarget: true});
          }
        }
      }
      else
      {
        creep.travelTo(attacker);
        return;
      }

      console.log(this.name, 'FAA WTF', 5)
      const attackTarget = Game.getObjectById(attacker.memory.target) as Structure;
      if(attackTarget)
      {
        if(creep.pos.inRangeTo(attackTarget, 3))
        {
          strSay += '🔫🛡'
          creep.rangedAttack(attackTarget);
        }
        else
        {
          strSay += '💣';
          creep.rangedMassAttack();
        }
      }
      creep.say(strSay);
      return;
    }
    catch(error)
    {
      console.log(this.name, 'FollowerAttackerActions', error);
    }
  }

  HealerActions(creep: Creep)
  {
    try
    {
      if(!creep.memory.boost)
      {
        console.log(this.name, 'healer boost');
        creep.boostRequest([RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE,
          RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE], false);
        return;
      }

      const skLairs = creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, 8, {filter: s => s.structureType === STRUCTURE_KEEPER_LAIR});
      if(!this.core
        && skLairs.length === 0)
      {
        let target = this.kernel.data.roomData[this.metaData.roomName].generalContainers[0];
        if(!creep.pos.inRangeTo(target, 0))
          creep.travelTo(target);
        else
          creep.suicide();

        return;
      }

      let attacker = Game.creeps[this.metaData.attackers[0]];

      if(creep.pos.roomName === attacker.pos.roomName &&
        creep.pos.inRangeTo(attacker, 3))
      {
        if(creep.hits < creep.hitsMax)
            creep.heal(creep);
          else
            creep.heal(attacker);
      }
      else
        creep.heal(creep);

      // Normal movement
      //  - Need to improve for stopping the moves once at target and Circling
      if(attacker.pos.inRangeTo(creep, 1))
      {
        const dir = creep.pos.getDirectionTo(attacker);
        creep.move(dir);
      }
      else
        creep.travelTo(attacker);

      return;
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

      console.log(this.name, 'Dismantler', 1, creep.pos.roomName, this.metaData.roomName, !this.metaData.dismantleDone)
      // Move to the core room
      let corePos = new RoomPosition(this.metaData.corePos.x, this.metaData.corePos.y, this.metaData.corePos.roomName);

      if(creep.pos.roomName !== corePos.roomName && !this.metaData.dismantleDone)
      {
        console.log(this.name, 'Dismantler', 2)
        const cPos = this.metaData.corePos;
        const pos = new RoomPosition(cPos.x, cPos.y, cPos.roomName)
        creep.travelTo(pos);
        return;
      }

      //If we are done go and kill yourself
      if(this.metaData.dismantleDone)
      {
        console.log(this.name, 'Dismantler', 3)
        let container = this.roomInfo(this.metaData.roomName).generalContainers[0];
        if(container)
        {
          if(!creep.pos.inRangeTo(container, 0))
          {
            creep.travelTo(container);
            return;
          }
        }
        creep.suicide();
      }

      // Looking for ramparts with containers below them.
      let structures = creep.room.find(FIND_HOSTILE_STRUCTURES, {filter: s => s.structureType === STRUCTURE_RAMPART});
      if(structures.length)
      {
        console.log(this.name, 'Dismantler', 4)
        structures = _.filter(structures, (s)=> {
            const targetContainer = s.pos.lookForStructures(STRUCTURE_CONTAINER);
            if(targetContainer)
              return true;
        });

        // Travel to the rampart or container.
        if(structures.length)
        {
          console.log(this.name, 'Dismantler', 5)
          let target = creep.pos.findClosestByPath(structures);
          if(!creep.pos.isNearTo(target))
          {
            creep.travelTo(target);
            return;
          }

          // Check if the hauler is there and start dismantling.
          if(this.metaData.haulers.length)
          {
            console.log(this.name, 'Dismantler', 6)
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

            creep.dismantle(target);
            return;
          }
        }
        else
        {
          // No more ramparts to take apart.
          console.log(this.name, 'Dismantler', 7, 'Dimantler should be done now.')
          this.metaData.dismantleDone = true;
        }
      }
      else
      {
        this.metaData.dismantleDone = true;
      }
      console.log(this.name, 'Dismantler', 8)
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

      console.log(this.name, 'ha',0.1, creep.pos)
      if(!creep.memory.atPlace)
      {
        creep.memory.distance++;
      }

      if(!creep.memory.boost)
      {
        if(this.metaData.coreLevel  <= 2)
          creep.boostRequest([RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE], false);
        else if(this.metaData.coreLevel  === 3)
          creep.boostRequest([RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE, RESOURCE_CATALYZED_KEANIUM_ACID], false);
        return;
      }

      if(this.metaData.haulerAlmostDone)
      {
        const storage = this.spawnRoom.storage;
        if(!creep.pos.isNearTo(storage))
          creep.travelTo(storage, {allowSK: true});
        else
          creep.transferEverything(storage);

        if(creep.store.getUsedCapacity() === 0)
          this.metaData.haulerDone = true;
      }

      console.log(this.name, 'ha',0.2)
      // Travel back to dump in terminal
      if(creep.store.getFreeCapacity() === 0 || creep.memory.full)
      {
        console.log(this.name, 'ha',0.2, this.metaData.haulerAlmostDone)
        if(this.metaData.haulerAlmostDone)
        {
          let container = this.roomData().generalContainers[0];
          if(container)
          {
            if(!creep.pos.inRangeTo(container, 0))
            {
              const hostiles = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 4, {filter: c => c.owner.username !== 'Invader'});
              if(hostiles.length)
              {
                console.log(this.name, 'Found enemies');
                this.PathSearch(creep, container);
                return;
              }
              else
              {
                creep.travelTo(container, {allowSK: true});
              }
              return;
            }
          }
        }

        console.log(this.name, 'ha',0.3)
        creep.memory.full = true;
        let terminal = Game.rooms[this.metaData.spawnRoomName].terminal;

        console.log(this.name, 'ha',0.4)
        // Might need to look at this code to avoid sk
        if(!creep.pos.isNearTo(terminal))
        {
          console.log(this.name, 'ha',0.5)
          if(creep.room.name != this.spawnRoom.name)
          {
            console.log(this.name, 'ha',0.6)
            let ret = PathFinder.search(creep.pos, {pos: terminal.pos, range: 1},
            {
              // We need to set the defaults costs higher so that we
              // can set the road cost lower in `roomCallback`
              plainCost: 2,
              swampCost: 10,

              roomCallback: function(roomName) {
                let room = Game.rooms[roomName];
                if(!room) return;
                let costs = new PathFinder.CostMatrix;
                room.find(FIND_HOSTILE_CREEPS);
                for(let x = -3; x <= 3; x++)
                  for(let y = -3; y <= 3; y++)
                    costs.set(x, y, 0xff);

                return costs;
              },
            });

            console.log(this.name, 'ha',0.7)
            if(!ret.incomplete)
            {
              console.log(this.name, 'ha',0.8)
              let pos = ret.path[0];
              creep.move(creep.pos.getDirectionTo(pos));
            }
            else
            {
              console.log(this.name, 'ha',0.9)
              creep.travelTo(terminal, {allowSK: true});
            }
          }
          else
            creep.travelTo(terminal);
        }
        else
        {
          creep.transferEverything(terminal);
          if(creep.store.getUsedCapacity() === 0)
            creep.memory.full = false;
        }
        return;
      }

      console.log(this.name, 'ha',0.3)
      // Not in the core room go travel there only when NOT DONE
      if(creep.pos.roomName !== this.metaData.roomName /*&& !this.metaData.haulerDone*/)
      {
        const cPos = this.metaData.corePos;
        const pos = new RoomPosition(cPos.x, cPos.y, cPos.roomName)
        creep.travelTo(pos, {allowSK: true});
        return;
      }

      console.log(this.name, 'ha',0.4)
      // IN the core room
      if(creep.room.name === this.metaData.roomName)
      {
        console.log(this.name, 'haulers', 0.5)
        // Clean up the ruins first.
        let ruin = creep.pos.findClosestByPath(FIND_RUINS, {filter: r => r.structure.structureType === STRUCTURE_INVADER_CORE && r.store.getUsedCapacity() > 0});
        if(ruin)
        {
          if(!creep.pos.isNearTo(ruin))
          {
            if(creep.room.name != this.spawnRoom.name)
            {
              let ret = PathFinder.search(creep.pos, {pos: ruin.pos, range: 1},
              {
                // We need to set the defaults costs higher so that we
                // can set the road cost lower in `roomCallback`
                plainCost: 2,
                swampCost: 10,

                roomCallback: function(roomName) {
                  let room = Game.rooms[roomName];
                  if(!room) return;
                  let costs = new PathFinder.CostMatrix;
                  room.find(FIND_HOSTILE_CREEPS);
                  for(let x = -3; x <= 3; x++)
                    for(let y = -3; y <= 3; y++)
                      costs.set(x, y, 0xff);

                  return costs;
                },
              });

              if(!ret.incomplete)
              {
                let pos = ret.path[0];
                creep.move(creep.pos.getDirectionTo(pos));
              }
            }
            else
              creep.travelTo(ruin);
          }
          else
            creep.withdrawEverything(ruin);

          return;
        }

        const tPos = this.metaData.corePos;
        const pos = new RoomPosition(tPos.x, tPos.y, tPos.roomName);

        console.log(this.name, 'hauler',2)
        let containers = pos.findInRange<StructureContainer>(FIND_STRUCTURES, 4, {filter: s => s.structureType === STRUCTURE_CONTAINER});
        if(containers.length)
        {
          // Finding containers that don't have ramparts on them.
          let container = _.find(containers, (c) => {
            if(c.store.getUsedCapacity() > 0)
            {
              let ramp = c.pos.lookForStructures(STRUCTURE_RAMPART);
              if(ramp === undefined)
                return true;
            }
          });


          if(container)
          {
            if(!creep.pos.isNearTo(container))
            {
              const hostiles = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 4, {filter: c => c.owner.username !== 'Invader'});
              if(hostiles.length)
              {
                console.log(this.name, 'Found enemies');
                this.PathSearch(creep, container);
                return;
              }
              else
              {
                creep.travelTo(container, {allowSK: true});
              }
            }
            else
              creep.withdrawEverything(container);

              return;
          }
        }

        console.log(this.name, 'ha',1)
        const dropped = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 5, {filter: d => d.amount > 500});
        if(dropped.length)
        {
          console.log(this.name, 'ha',1.1)
          const tar = creep.pos.findClosestByPath(dropped);
          if(tar)
          {
            if(!creep.pos.isNearTo(tar))
            {
              const hostiles = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 4, {filter: c => c.owner.username !== 'Invader'});
              if(hostiles.length)
              {
                console.log(this.name, 'Found enemies');
                this.PathSearch(creep, tar);
                return;
              }
              else
              {
                creep.travelTo(tar, {allowSK: true});
              }
            }
            else
              creep.pickup(tar);

            return;
          }
        }

        console.log(this.name, 'hauler',3)
        // Stand nex to the dismantler
        let dismantler = Game.creeps[this.metaData.dismantlers[0]];
        if(dismantler && dismantler.room.name === this.metaData.roomName)
        {
          if(!creep.pos.isNearTo(dismantler))
          {
            console.log(this.name, 'hauler',3.5)
            const hostiles = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 4, {filter: c => c.owner.username !== 'Invader'});
            if(hostiles.length)
            {
              console.log(this.name, 'Found enemies');
              this.PathSearch(creep, dismantler);
              return;
            }
            else
            {
              creep.travelTo(dismantler);
            }
            return;
          }
          else
          {
            creep.memory.atPlace = true;
            let resources = dismantler.pos.findInRange(FIND_DROPPED_RESOURCES, 1);
            if(resources.length)
            {
              if(!creep.pos.inRangeTo(resources[0], 1))
                creep.travelTo(resources[0])
              else
                creep.pickup(resources[0]);
            }
            else
            {
              let tombStones = dismantler.pos.findInRange(FIND_TOMBSTONES, 1);
              if(tombStones.length)
              {
                if(!creep.pos.inRangeTo(tombStones[0], 1))
                  creep.travelTo(tombStones[0]);
                else
                  creep.withdrawEverything(tombStones[0]);
              }
            }
          }
        }

        const lastRuins = creep.room.find(FIND_RUINS, {filter: f => f.store.getUsedCapacity() > 0})
        if(lastRuins.length)
        {
          if(!creep.pos.isNearTo(lastRuins[0]))
            creep.travelTo(lastRuins[0], {allowSK: true})
          else
            creep.withdrawEverything(lastRuins[0]);

          return;
        }


        console.log(this.name, 'hauler',4.5)
        let conatinerEmpty = true;
        if(containers.length)
        {
          _.forEach(containers, (c) => {
            if(c instanceof StructureContainer)
              if(c.store.getUsedCapacity() > 0)
                conatinerEmpty = false;
          });
        }

        console.log(this.name, 'hauler',5, 'container empty status', conatinerEmpty)
        if(conatinerEmpty)
        {
          console.log(this.name, 'hauler picked up last load and should be done after it gets back')
          creep.memory.full = true;
          this.metaData.haulerAlmostDone = true;
        }
      }
    }
    catch(error)
    {
      console.log(this.name, 'hauleractions', error);
    }
  }

  PathSearch(creep: Creep, target: AnyStructure | Creep | Flag | Resource | Ruin)
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

    if(!ret.incomplete)
      creep.memory.atPlace = true;
    else
      creep.memory.atPlace = undefined;

    let pos = ret.path[0];
    creep.move(creep.pos.getDirectionTo(pos));
  }

  FindTarget (creep: Creep)
  {
    try
    {
      let cores = creep.room.find(FIND_HOSTILE_STRUCTURES, {filter: s => s.structureType === STRUCTURE_INVADER_CORE});
      console.log(this.name, 'FindTarget', 1, cores.length)
      if(cores?.length === 0)
      {
        console.log(this.name, 'FindTarget', 2)
        console.log(this.name, 'FindTarget', 3, this.core)
        return;
      }

      let core = creep.pos.findClosestByPath(cores);
      if(!core)
      {
        if(this.metaData.coreLevel <= 2)
        {
          let ramparts = creep.room.find(FIND_HOSTILE_STRUCTURES, {filter: s => s.structureType === STRUCTURE_RAMPART});
          if(ramparts.length)
          {
            ramparts = _.filter(ramparts, (r) => {
              const rLooks = r.pos.lookForStructures(STRUCTURE_TOWER);
              if(rLooks)
                return false;

              return true;
            });

            if(ramparts.length)
            {
              const tRampart = creep.pos.findClosestByPath(ramparts);
              if(tRampart)
                return tRampart;
            }
          }
        }

        let towers = creep.room.find(FIND_HOSTILE_STRUCTURES, {filter: s => s.structureType === STRUCTURE_TOWER});

        console.log(this.name, 'Find Target tower', towers.length);

        let tower: AnyOwnedStructure;
        if(this.metaData.coreLevel  >= 3)
        {
          tower = creep.pos.findClosestByRange(towers);
        }
        else
        {
          tower = creep.pos.findClosestByPath(towers);
        }
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
          return false;
      }
      else
      {
        console.log(this.name, 'Returning rampart');
        let rampart = core.pos.lookForStructures(STRUCTURE_RAMPART);
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
