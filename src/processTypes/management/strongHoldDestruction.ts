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
      console.log(this.name, 'running');
      this.ensureMetaData();
      this.flag = Game.flags[this.metaData.flagName];
      if(!this.flag)
      {
        this.completed = true;
        return;
      }

      console.log(this.name, 2);
      if(this.metaData.roomName === undefined)
        this.metaData.roomName = this.flag.room.name;

      let spawnRoom = Game.rooms[this.flag.room.name];
      let observer = this.roomData().observer;


      this.coreRoomName = this.flag.name.split('-')[0];

      this.core = Game.getObjectById(this.flag.memory.coreInfo.coreId) as StructureInvaderCore;

      if(!this.metaData.vision)
        observer.observeRoom(this.coreRoomName);


        console.log(this.name, 2.1, this.flag.memory.coreInfo.invaderCorePresent)
      if(this.flag.memory.coreInfo.invaderCorePresent)
      {
        console.log(this.name, 3);
        if(this.core || (
          this.core?.ticksToDeploy === undefined || this.core?.ticksToDeploy < 200))
        {
          console.log(this.name, 4);
          let numberOfAttackers = 0;
          let numberofHealers = 0;
          let typeOfAttacker = 'testattacker';
          let typeOfHealer = 'testhealer';

          // MOve to spawning function later
          if(this.flag.memory.coreInfo.coreLevel <= 2)
          {
            numberOfAttackers = 1;
            numberofHealers = 1;
          }

          if(this.flag.memory.coreInfo.coreLevel === 3)
          {
            typeOfAttacker = 'maxRange';
            typeOfHealer = 'maxHealer';
            numberOfAttackers = 1;
            numberofHealers = 1;
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
          console.log(this.name, 5, this.metaData.attackers.length, numberOfAttackers);
          if(this.metaData.attackers.length < numberOfAttackers)
          {
            console.log(this.name, 6);
            let creepName = 'atk-' + this.metaData.roomName + '-' + Game.time;
            let spawned = Utils.spawn(this.kernel, this.metaData.roomName, typeOfAttacker, creepName,
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
        const numberOfDistmantlers = 1;
        const numberOfHaulers = 1;

        this.metaData.dismantlers = Utils.clearDeadCreeps(this.metaData.dismantlers);
        this.metaData.haulers = Utils.clearDeadCreeps(this.metaData.haulers);

        if(this.metaData.dismantlers.length < numberOfDistmantlers && !this.metaData.dismantleDone)
        {
          let creepName = 'dismantler-' + this.metaData.roomName + '-' + Game.time;
          let spawned = Utils.spawn(this.kernel, this.metaData.roomName, 'dismantleCarry', creepName, {});

          if(spawned)
            this.metaData.dismantlers.push(creepName);
        }

        if(this.metaData.haulers.length < numberOfHaulers && !this.metaData.haulerDone)
        {
          const creepName = 'haulers-' + this.metaData.roomName + '-' + Game.time;
          const spawned = Utils.spawn(this.kernel, this.metaData.roomName, 'shHauler', creepName, {});

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

      console.log(this.name, creep.room.name, this.flag.memory.coreInfo.invaderCorePresent)

      if(!creep.memory.boost)
      {
        if(this.flag.memory.coreInfo.coreLevel <= 2)
        {
          creep.boostRequest([RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE,
            RESOURCE_CATALYZED_UTRIUM_ACID], false);
          return;
        }
        else if(this.flag.memory.coreInfo.coreLevel === 3)
        {
          creep.boostRequest([RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE,
            RESOURCE_CATALYZED_KEANIUM_ALKALIDE], false);
          return;
        }
        else if(this.flag.memory.coreInfo.coreLevel === 4)
        {
          creep.boostRequest([RESOURCE_CATALYZED_GHODIUM_ALKALIDE, RESOURCE_KEANIUM_ALKALIDE,RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE],false);
          return;
        }
      }

      if(this.flag.memory.coreInfo.coreLevel <= 3)
      {
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
          if(this.flag.memory.coreInfo.invaderCorePresent)
          {
            if(creep.room.name === this.coreRoomName)
            {
              this.metaData.vision = true;
              const target = this.FindTarget(creep);

              if(target)
              {
                creep.memory.target = target.id;
                console.log(this.name, 'Target', target.id, target.pos)
                if(creep.pos.inRangeTo(target,5))
                {
                  console.log(this.name, 'attacker', 1)
                  let reverse: number
                  let dir = creep.pos.getDirectionTo(target);
                  dir += 4;
                  if(dir > 8)
                    reverse = dir % 8;
                  else
                    reverse = dir;

                  if(this.flag.memory.coreInfo.coreLevel <= 2)
                  {
                    const healerNeedPos = creep.pos.getPositionAtDirection(reverse);
                    let look = healerNeedPos.lookFor(LOOK_CREEPS);
                    if(look.length && healer.fatigue === 0)
                      creep.travelTo(target);

                    if(creep.pos.isNearTo(target))
                      creep.attack(target);
                  }
                  else if(this.flag.memory.coreInfo.coreLevel === 3)
                  {
                    const top = (this.core.pos.y - 2 > 0) ? this.core.pos.y - 2 : 0;
                    const right = (this.core.pos.x + 2 < 49) ? this.core.pos.x + 2 : 49;
                    const bottom = (this.core.pos.y + 2 < 49) ? this.core.pos.y + 2 : 49;
                    const left = (this.core.pos.x - 2 > 0) ? this.core.pos.x - 2 : 0;
                    const results = this.core.room.lookForAtArea(LOOK_STRUCTURES, top,left, bottom, right);
                    let xCord, yCord;
                    _.forEach(Object.keys(results), (y) => {
                      _.forEach(Object.keys(results[y]), (x) => {
                          if(results[y][x].length === 0)
                            {
                              xCord = x;
                              yCord = y;
                              return false;
                            }
                      })

                      if(yCord === y)
                        return false;

                    })
                    console.log(this.name, 'range', results)

                    if(creep.pos.inRangeTo(target, 5))
                    {
                      console.log(this.name, 'range', 2)
                      const healerNeedPos = creep.pos.getPositionAtDirection(reverse);
                      let look = healerNeedPos.lookFor(LOOK_CREEPS);
                      console.log(this.name,'Range', healerNeedPos, look.length);
                      console.log(this.name, 'stand pos')
                      const standPos = new RoomPosition(xCord, yCord, this.coreRoomName);
                      if(look.length && !creep.pos.inRangeTo(standPos, 3) && healer.fatigue === 0)
                          creep.travelTo(standPos, {range: 3});

                       creep.rangedAttack(target);

                      return;
                    }
                    else
                    {
                      console.log(this.name, 'range', 3)
                      creep.travelTo(target, {range: 3});
                      return;
                    }
                  }
                }
                else
                {
                  if(healer.fatigue === 0)
                    creep.travelTo(target);
                }
                return;
              }
            }
            else
            {
              const cPos = new RoomPosition(this.flag.memory.coreInfo.coreLocation.x,
                this.flag.memory.coreInfo.coreLocation.y,
                this.coreRoomName);

              if(!creep.pos.isNearTo(cPos))
              {
                creep.travelTo(cPos);
                return;
              }
            }
          }
          else
          {
            //this.flag.memory.coreInfo.invaderCorePresent = false;
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
      else if(this.flag.memory.coreInfo.coreLevel === 4)
      {
        if(this.metaData.attackers.length != 2 || this.metaData.healers.length != 2)
        {
          let rFlag = Game.flags['RemoteFlee-' + creep.pos.roomName]
          if(!creep.pos.isNearTo(rFlag))
          {
            creep.travelTo(rFlag);
            return;
          }
        }

        let healer: Creep;
        let follower: Creep;
        let ultimateLeader = false;
        let hIndex = 0;
        let cIndex = this.metaData.attackers.indexOf(creep.name, 0);
        if(cIndex !== -1)
        {
          healer = Game.creeps[this.metaData.healers[cIndex]];
          if(cIndex == 0)
          {
            ultimateLeader = true;
            if(this.metaData.attackers.length === 2)
              follower = Game.creeps[this.metaData.attackers[cIndex + 1]];
          }
        }

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
        console.log(this.name, 'healer boost');
        creep.boostRequest([RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE,
          RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE], false);
        return;
      }

      let attacker = Game.creeps[this.metaData.attackers[0]];

      console.log(this.name, 'healer', 1)
      if(attacker.pos.inRangeTo(creep, 1))
      {
        console.log(this.name, 'healer', 2)
        let target = Game.getObjectById(attacker.memory.target) as Structure;
        if(target && attacker.pos.inRangeTo(target, 5))
        {
          console.log(this.name, 'healer', 3)
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
          console.log(this.name, 'healer', 4)
          let sk = Game.getObjectById(attacker.memory.target) as Creep
          if(sk)
          {
            console.log(this.name, 'healer', 5)
            creep.heal(attacker);
            let dir = creep.pos.getDirectionTo(attacker);
            creep.move(dir);
          }
          else
          {
            console.log(this.name, 'healer', 6)
            let dir = creep.pos.getDirectionTo(attacker);
            creep.move(dir);
          }
        }
      }
      else
      {
        console.log(this.name, 'healer', 7)
        if(creep.hits < creep.hitsMax)
          creep.heal(creep);

        creep.travelTo(attacker);
      }

      if(creep.pos.roomName !== this.coreRoomName)
      {
        if(creep.hits < creep.hitsMax)
          creep.heal(creep);
        else if(attacker.hits < attacker.hitsMax)
          creep.heal(attacker);

        return;
      }

      if(attacker.pos.roomName === this.coreRoomName)
      {
        console.log(this.name, 'healer', 8)
        if(attacker.hits === attacker.hitsMax &&
          creep.hits < creep.hitsMax)
          creep.heal(creep);
        else
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


      if(creep.pos.roomName !== this.coreRoomName && !this.metaData.dismantleDone)
      {
        const cPos = this.flag.memory.coreInfo.coreLocation;
        const pos = new RoomPosition(cPos.x, cPos.y, cPos.roomName)
        creep.travelTo(pos);
        return;
      }

      if(this.metaData.dismantleDone)
      {
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
          this.metaData.dismantleDone = true;
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
      if(creep.name ==='haulers-E55S47-22674572')
        this.metaData.haulerDone=true;
      if(!creep.memory.atPlace)
      {
        creep.memory.distance++;
      }

      if(!creep.memory.boost)
      {
        creep.boostRequest([RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE], false);
        return;
      }

      // Back in main room code
      if(creep.store.getFreeCapacity() === 0 || creep.memory.full)
      {
        creep.memory.full = true;
        let storage = Game.rooms[this.metaData.roomName].storage;
        if(!creep.pos.isNearTo(storage))
        {
          const hostiles = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 4, {filter: c => c.owner.username !== 'Invader'});
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
          if(this.metaData.haulerDone)
          {
            let container = this.roomData().generalContainers[0];
            if(container)
            {
              if(!creep.pos.inRangeTo(container, 0))
              {
                creep.travelTo(container);
                return;
              }
              else
              {
                creep.suicide();
                return;
              }
            }
          }
          creep.memory.full = false;
        }
        return;
      }

      if(creep.pos.roomName !== this.coreRoomName && !this.metaData.haulerDone)
      {
        // const hostiles = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 4);
        // if(hostiles.length)
        // {
        //   this.PathSearch(creep, this.flag);
        //   return;
        // }

        const cPos = this.flag.memory.coreInfo.coreLocation;
        const pos = new RoomPosition(cPos.x, cPos.y, cPos.roomName)
        creep.travelTo(pos);
        return;
      }


      if(creep.room.name === this.coreRoomName)
      {
        console.log(this.name, 'haulers', 0.5)
        let ruins = creep.room.find(FIND_RUINS);
        if(ruins)
        {
          console.log(this.name, 'hauler',1)
          let ruin = _.find(ruins, (r) => {
            if(r.store.getUsedCapacity() > 0)
              return true;
          })

          console.log(this.name, 'hauler',1, ruin)
          if(ruin)
          {
              if(!creep.pos.isNearTo(ruin))
                creep.travelTo(ruin);
              else
                creep.withdrawEverything(ruin);

              return;
          }
        }

        console.log(this.name, 'hauler',2)
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

        console.log(this.name, 'hauler',3)
        let dismantler = Game.creeps[this.metaData.dismantlers[0]];
        if(dismantler && !creep.pos.isNearTo(dismantler))
        {
          console.log(this.name, 'hauler',3.5)
          creep.travelTo(dismantler);
          return;
        }
        else
          creep.memory.atPlace = true;


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

        console.log(this.name, 'hauler',5)
        if(conatinerEmpty)
        {
          creep.memory.full = true;
          this.metaData.haulerDone = true;
        }
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
