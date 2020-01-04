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
  haulerAlmostDone: boolean;
  coreRoomName: string;

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
      // if(this.name === 'shdpE54S46' || this.name === 'shdpE46S44')
      // {
      //   this.completed = true;
      //   return;
      // }

      console.log(this.name, 'running');
      this.ensureMetaData();
      console.log(this.name, this.metaData.flagName)
      this.flag = Game.flags[this.metaData.flagName];
      if(!this.flag)
      {
        this.completed = true;
        return;
      }

      console.log(this.name, 2);
      if(this.metaData.roomName === undefined)
      {
        this.metaData.roomName = Utils.nearestRoom(this.flag.memory.coreInfo.coreLocation.roomName);
      }

      console.log(this.name, 'Spawn room', this.metaData.roomName);


      let spawnRoom = this.metaData.roomName;
      let observer = this.roomData().observer;

      this.coreRoomName = this.flag.name.split('-')[0];

      this.core = Game.getObjectById(this.flag.memory.coreInfo.coreId) as StructureInvaderCore;

      if(!this.metaData.vision && this.flag.memory.coreInfo.coreLevel < 4)
        observer.observeRoom(this.coreRoomName);

      console.log(this.name, 2.1, this.flag.memory.coreInfo.invaderCorePresent)
      if(this.flag.memory.coreInfo.invaderCorePresent)
      {
        //console.log(this.name, 'Ticks to deploy', this.core.ticksToDeploy, (this.core.ticksToDeploy === undefined || this.core.ticksToDeploy < 150));
        if(this.core?.ticksToDeploy === undefined || this.core?.ticksToDeploy < 150)
        {
          console.log(this.name, 4);
          let numberOfAttackers = 0;
          let numberofHealers = 0;
          let typeOfAttacker = 'testattacker';
          let typeOfHealer = 'testhealer';

          // MOve to spawning function later
          if(this.flag.memory.coreInfo.coreLevel === 1)
          {
            typeOfAttacker = 'mage';
            numberOfAttackers = 1;
          }
          else if(this.flag.memory.coreInfo.coreLevel === 2 || this.flag.memory.coreInfo.coreLevel === 3)
          {
            typeOfAttacker = 'mage';
            numberOfAttackers = 2;
          }
          else if(this.flag.memory.coreInfo.coreLevel === 4)
          {
            typeOfAttacker = 'mage';
            numberOfAttackers = 4;
          }
          /*else if(this.core.level == 4)
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
            let creepName = 'atk-' + this.metaData.roomName + '-' + Game.time;
            let spawned = Utils.spawn(this.kernel, this.metaData.roomName, typeOfAttacker, creepName,
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
            let creepName = 'heal-' + this.metaData.roomName + '-' + Game.time;
            let spawned = Utils.spawn(this.kernel, this.metaData.roomName, typeOfHealer, creepName,
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
        console.log(this.name, 'Time to do clean up', this.metaData.dismantleDone, this.metaData.haulerDone, this.haulerAlmostDone);

        this.flag.memory.coreInfo.cleaning = true;
        // Dismantle and clean up
        let numberOfDistmantlers = 0;
        let numberOfHaulers = 0;

        if(this.flag.memory.coreInfo.coreLevel === 1)
        {
          numberOfHaulers = 1;
        }
        else if(this.flag.memory.coreInfo.coreLevel === 2 || this.flag.memory.coreInfo.coreLevel === 3)
        {
          numberOfHaulers = 1;
          numberOfDistmantlers = 1;
        }


        this.metaData.dismantlers = Utils.clearDeadCreeps(this.metaData.dismantlers);
        this.metaData.haulers = Utils.clearDeadCreeps(this.metaData.haulers);

        if(this.metaData.haulers.length < numberOfHaulers && !this.metaData.haulerDone)
        {
          const creepName = 'haulers-' + this.metaData.roomName + '-' + Game.time;
          const spawned = Utils.spawn(this.kernel, this.metaData.roomName, 'shHauler', creepName, {});

          if(spawned)
            this.metaData.haulers.push(creepName);
        }

        if(this.metaData.dismantlers.length < numberOfDistmantlers && !this.metaData.dismantleDone)
        {
          let creepName = 'dismantler-' + this.metaData.roomName + '-' + Game.time;
          let spawned = Utils.spawn(this.kernel, this.metaData.roomName, 'dismantleCarry', creepName, {});

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
        this.metaData.vision = false;
      }

      if(this.flag.memory.coreInfo.coreLevel > 1)
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
      else if(this.flag.memory.coreInfo.coreLevel === 1)
      {
        for(let i = 0; i < this.metaData.attackers.length; i++)
        {
          let attakcer = Game.creeps[this.metaData.attackers[i]];
          if(attakcer)
          {
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
        this.flag.memory.coreInfo.done = true;
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

      console.log(this.name, creep.room.name, this.flag.memory.coreInfo.invaderCorePresent)
      console.log(this.name, creep.name, creep.memory.boost);
      if(!creep.memory.boost)
      {
        if(this.flag.memory.coreInfo.coreLevel <= 2)
        {
          creep.boostRequest([RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE,
          RESOURCE_CATALYZED_UTRIUM_ACID], false);
          return;
        }
        else if(this.flag.memory.coreInfo.coreLevel === 4)
        {
          creep.boostRequest([RESOURCE_CATALYZED_GHODIUM_ALKALIDE, RESOURCE_KEANIUM_ALKALIDE,RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE],false);
          return;
        }
      }

      if(this.flag.memory.coreInfo.invaderCorePresent || this.flag.memory.coreInfo.skLairPresent)
      {
        if(creep.room.name === this.coreRoomName)
        {
          // Might need to add some defense code in here for SK's
          if(!this.flag.memory.coreInfo.invaderCorePresent)
          {
            const hostiles = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 5);
            if(hostiles.length)
            {
              const hostile = creep.pos.findClosestByRange(hostiles);
              if(!creep.pos.inRangeTo(hostile, 3))
              {
                creep.travelTo(hostile, {movingTarget: true});
              }
              else
                creep.rangedAttack(hostile);

              creep.heal(creep);
              return;
            }
          }

          this.metaData.vision = true;
          const target = this.FindTarget(creep);

          if(target)
          {
            if(!creep.pos.isNearTo(target))
              creep.travelTo(target);
            else
              creep.rangedMassAttack();
          }

          creep.heal(creep);
          return;
        }
        else
        {

          if(!creep.pos.isNearTo(this.core))
            creep.travelTo(this.core);

          creep.heal(creep);
        }
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
      if(!creep.memory.boost)
      {
        creep.boostRequest([RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE,
          RESOURCE_CATALYZED_KEANIUM_ALKALIDE, RESOURCE_CATALYZED_GHODIUM_ALKALIDE,
          RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE], false);
        return;
      }

      if(this.flag.memory.coreInfo.coreLevel === 4 && this.metaData.moving === undefined) // Gather creeps before leaving.
      {
        const remoteFlag = Game.flags['RemoteFlee-' + this.metaData.roomName];
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

      console.log(this.name, 'LAA', 1)
      if(!this.flag.memory.coreInfo.invaderCorePresent)
      {
        // Will need to put new code in for level 4 also
        if(this.flag.memory.coreInfo.coreLevel === 3)
        {
          console.log(this.name, 'Attack cleanup')
          const tPos = this.flag.memory.coreInfo.coreLocation;
          const pos = new RoomPosition(tPos.x+2, tPos.y, tPos.roomName);
          const rampartPos = new RoomPosition(tPos.x+1, tPos.y, tPos.roomName);
          const corePos = new RoomPosition(tPos.x, tPos.y, tPos.roomName);

          let path = creep.pos.findPathTo(corePos);
          console.log(this.name, 'Path length', path.length);   //  Testing to see when ramparts are up what the length is to core

          let lRamparts = creep.room.find(FIND_HOSTILE_STRUCTURES, {filter: s => s.structureType === STRUCTURE_RAMPART});
          if(lRamparts.length)
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
            if(!creep.pos.inRangeTo(corePos, 0))
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
        else if(this.flag.memory.coreInfo.coreLevel === 2)
        {
          const tPos = this.flag.memory.coreInfo.coreLocation;
          const corePos = new RoomPosition(tPos.x, tPos.y, tPos.roomName);
          let ramparts = creep.room.find(FIND_HOSTILE_STRUCTURES, {filter: s => s.structureType === STRUCTURE_RAMPART});
          if(ramparts.length === 8)
          {
            let rampart = creep.pos.findClosestByRange(ramparts);
            if(!creep.pos.isNearTo(rampart))
              creep.travelTo(rampart);
            else
            {
              creep.say('💣');
              creep.rangedMassAttack();
            }
          }
          else
          {
            console.log(this.name, 'LAA core pos', corePos)
            if(!creep.pos.isEqualTo(corePos))
              creep.travelTo(corePos);
            else
            {
              creep.say('💣');
              creep.rangedMassAttack();
            }
          }

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
        if(this.flag.memory.coreInfo.invaderCorePresent)
        {
          console.log(this.name, 'LAA', 3)
          if(this.metaData.standPos === undefined)
          {
            console.log(this.name, 'LAA', 4)
            if(this.flag.memory.coreInfo.coreLevel === 4)
            {
              console.log(this.name, 'LAA', 5)
              const tPos = this.flag.memory.coreInfo.coreLocation;
              const standPos = new RoomPosition(tPos.x + 4, tPos.y - 4, tPos.roomName);
              this.metaData.standPos = standPos;
              target = standPos;
              console.log(this.name, 'LAA', 5.1, target);
            }
            else if(this.core?.level === 3)
            {
              const tPos = this.flag.memory.coreInfo.coreLocation;
              const standPos = new RoomPosition(tPos.x+3, tPos.y, tPos.roomName)
              this.metaData.standPos = standPos;
              target = standPos;
            }
            else if(this.core?.level === 2)
            {
              const tPos = this.flag.memory.coreInfo.coreLocation;
              const standPos = new RoomPosition(tPos.x -3, tPos.y, tPos.roomName);
              this.metaData.standPos = standPos;
              target = standPos;
            }
            // const top = (this.core.pos.y - 2 > 0) ? this.core.pos.y - 2 : 0;
            // const right = (this.core.pos.x + 2 < 49) ? this.core.pos.x + 2 : 49;
            // const bottom = (this.core.pos.y + 2 < 49) ? this.core.pos.y + 2 : 49;
            // const left = (this.core.pos.x - 2 > 0) ? this.core.pos.x - 2 : 0;
            // const lookResults = this.core.room.lookAtArea(top, left, bottom, right, true) as LookAtResultWithPos[];
            // console.log(this.name, 'Leader Look Time', lookResults.length)
            // for(let i = 0; i < lookResults.length; i++)
            // {
            //   const look = lookResults[i];
            //   if (look.structure?.structureType !== STRUCTURE_CONTAINER)
            //     continue;

            //   if (!lookResults.some(l => l.x === look.x && l.y === look.y && l.creep?.owner.username === "Invader"))
            //   {
            //     this.metaData.target = look.structure.id;
            //   }
            // }
          }
          else
          {
            const tPos = this.metaData.standPos
            target = new RoomPosition(tPos.x, tPos.y, tPos.roomName);
          }

          console.log(this.name, 'LAA', 6)
          if(creep.room.name === this.coreRoomName)
          {
            if(!this.metaData.stage)
              this.metaData.stage = 1;

            let strSay = '';
            this.metaData.vision = true;
            console.log(this.name, 'distance to core', creep.pos.inRangeTo(target, 10))

            if(this.core.level === 4 && creep.pos.inRangeTo(target, 10))
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
                  strSay += '🔫🛡';
                  creep.rangedAttack(rampartsLook);
                }
                else
                {
                  strSay += '🔫⚙';
                  creep.rangedAttack(this.core);
                }
              }
            }
            else if(this.core.level === 4)
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
                      this.metaData.standPos = creep.pos;
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
              creep.say('⛑S');
              creep.heal(follower);
            }
            else if(creep.hits < creep.hitsMax)
            {
              creep.say('⛑F');
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
      if(!creep.memory.boost)
      {
        creep.boostRequest([RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE,
          RESOURCE_CATALYZED_KEANIUM_ALKALIDE, RESOURCE_CATALYZED_GHODIUM_ALKALIDE,
          RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE], false);
        creep.say('B');
        return;
      }

      // Gather at location.
      console.log(this.name, )
      if(this.flag.memory.coreInfo.coreLevel === 4 && !this.metaData.moving)
      {
        const remoteFlag = Game.flags['RemoteFlee-' + this.metaData.roomName];
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

      console.log(this.name, 'FAA', this.flag.memory.coreInfo.invaderCorePresent === false, this.flag.memory.coreInfo.skLairPresent === false)
      if(this.flag.memory.coreInfo.invaderCorePresent === false)
      {
        if(this.flag.memory.coreInfo.skLairPresent === false)  // No core present clean up
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
            creep.suicide();

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
          }
        }

        return;
      }



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

      console.log(this.name, 'FAA WTF', 1)
      // Placing follower creeps around Attacker to stay out of range of meleee
      if(this.core?.level === 4 && attacker.pos.inRangeTo(this.core, 10))
      {
        const tPos = this.metaData.standPos;
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
          creep.travelTo(standPos);
        }
      }
      else if(this.core?.level === 2 && attacker.pos.inRangeTo(this.core, 3))
      {
        const standPos = new RoomPosition(attacker.pos.x, attacker.pos.y - 1, attacker.pos.roomName);
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

      /*if(leader.pos.inRangeTo(this.core, 3))
      {
        if(!creep.pos.inRangeTo(this.core, 3))
        {
          const lX = leader.pos.x;
          const lY = leader.pos.y;
          const dir = leader.pos.getDirectionTo(this.core);
          if(dir === 1 || dir === 2)
          {
            const leftPos = new RoomPosition(lX-1, lY, leader.room.name);
            const rightPos = new RoomPosition(lX+1, lY, leader.room.name);
            if(leftPos.inRangeTo(this.core, 3))
              creep.moveTo(leftPos);

            if(rightPos.inRangeTo(this.core, 3))
              creep.moveTo(rightPos);
          }
          else if(dir === 3 || dir === 4)
          {
            const upPos = new RoomPosition(lX, lY-1, leader.room.name);
            const downPos = new RoomPosition(lX, lY + 1, leader.room.name);
            if(upPos.inRangeTo(this.core, 3))
              creep.moveTo(upPos);
            else if(downPos.inRangeTo(this.core, 3))
              creep.moveTo(downPos);
          }
          else if(dir === 5 || dir === 6)
          {
            const leftPos = new RoomPosition(lX-1, lY, leader.room.name);
            const rightPos = new RoomPosition(lX+1, lY, leader.room.name);
            if(leftPos.inRangeTo(this.core, 3))
              creep.moveTo(leftPos);

            if(rightPos.inRangeTo(this.core, 3))
              creep.moveTo(rightPos);
          }
          else if(dir === 7 || dir === 8)
          {
            const upPos = new RoomPosition(lX, lY-1, leader.room.name);
            const downPos = new RoomPosition(lX, lY + 1, leader.room.name);
            if(upPos.inRangeTo(this.core, 3))
              creep.moveTo(upPos);
            else if(downPos.inRangeTo(this.core, 3))
              creep.moveTo(downPos);
          }
        }
        const rampartsLook = this.core.pos.lookForStructures(STRUCTURE_RAMPART);
        if(rampartsLook)
          creep.rangedAttack(rampartsLook);
        else
          creep.rangedAttack(this.core);

      }*/
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

      if(this.flag.memory.coreInfo.invaderCorePresent === false
        && this.flag.memory.coreInfo.skLairPresent === false)
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


      console.log(this.name, 'Dismantler', 1, creep.pos.roomName, this.coreRoomName, !this.metaData.dismantleDone)
      // Move to the core room
      if(creep.pos.roomName !== this.coreRoomName && !this.metaData.dismantleDone)
      {
        console.log(this.name, 'Dismantler', 2)
        const cPos = this.flag.memory.coreInfo.coreLocation;
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

      console.log(this.name, 'ha',0.1)
      if(!creep.memory.atPlace)
      {
        creep.memory.distance++;
      }

      if(!creep.memory.boost)
      {
        creep.boostRequest([RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE], false);
        return;
      }

      console.log(this.name, 'ha',0.2)
      // Travel back to dump in terminal
      if(creep.store.getFreeCapacity() === 0 || creep.memory.full)
      {
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
                creep.travelTo(container);
              }
              return;
            }
            else
            {
              this.metaData.haulerDone = true;
              creep.suicide();
              return;
            }
          }
        }

        creep.memory.full = true;
        let terminal = Game.rooms[this.metaData.roomName].terminal;

        // Might need to look at this code to avoid sk
        if(!creep.pos.isNearTo(terminal))
        {
          const hostiles = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 4, {filter: c => c.owner.username !== 'Invader'});
          if(hostiles.length)
          {
            console.log(this.name, 'Found enemies');
            this.PathSearch(creep, terminal);
            return;
          }
          else
          {
            creep.travelTo(terminal);
          }
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
      if(creep.pos.roomName !== this.coreRoomName && !this.metaData.haulerDone)
      {
        const cPos = this.flag.memory.coreInfo.coreLocation;
        const pos = new RoomPosition(cPos.x, cPos.y, cPos.roomName)
        creep.travelTo(pos);
        return;
      }

      console.log(this.name, 'ha',0.4)
      // IN the core room
      if(creep.room.name === this.coreRoomName)
      {
        console.log(this.name, 'ha',1)
        const dropped = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 5);
        if(dropped.length)
        {
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
                creep.travelTo(tar);
              }
            }
            else
              creep.pickup(tar);

            return;
          }
        }

        console.log(this.name, 'haulers', 0.5)
        // Clean up the ruins first.
        let ruin = creep.pos.findClosestByPath(FIND_RUINS, {filter: r => r.store.getUsedCapacity() > 0});
        if(ruin)
        {
          if(!creep.pos.isNearTo(ruin))
          {
            const hostiles = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 4, {filter: c => c.owner.username !== 'Invader'});
            if(hostiles.length)
            {
              console.log(this.name, 'Found enemies');
              this.PathSearch(creep, ruin);
              return;
            }
            else
            {
              creep.travelTo(ruin);
            }
          }
          else
            creep.withdrawEverything(ruin);

          return;
        }

        const tPos = this.flag.memory.coreInfo.coreLocation;
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
                creep.travelTo(container);
              }
            }
            else
              creep.withdrawEverything(container);

              return;
          }
        }

        console.log(this.name, 'hauler',3)
        // Stand nex to the dismantler
        let dismantler = Game.creeps[this.metaData.dismantlers[0]];
        if(dismantler && dismantler.room.name === this.coreRoomName)
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
        this.flag.memory.coreInfo.invaderCorePresent = false;
        console.log(this.name, 'FindTarget', 3, this.flag.memory.coreInfo.invaderCorePresent)
        return;
      }

      let core = creep.pos.findClosestByPath(cores);
      if(!core)
      {
        if(this.core.level <= 2)
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
        if(this.flag.memory.coreInfo.coreLevel >= 3)
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
