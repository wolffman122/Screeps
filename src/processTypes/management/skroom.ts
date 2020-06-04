import { Process } from "os/process";
import { Utils } from "lib/utils";
import { HoldBuilderLifetimeProcess } from "../empireActions/lifetimes/holderBuilder";
import { MoveProcess } from "../creepActions/move";
import { WorldMap } from "lib/WorldMap";
import { Traveler } from "lib/Traveler";
import { AttackControllerManagementProcess } from "./attackController";
import { StrongHoldDestructionProcess } from "./strongHoldDestruction";

export class skRoomManagementProcess extends Process
{
  type = 'skrmp';
  metaData: SKRoomManagementProcessMetaData;

  mineralMining: boolean;
  skFlag: Flag;
  skRoomName: string;
  skRoom: Room;
  locations: {
      [type: string]: string[]
  };
  lairs: StructureKeeperLair[];
  sources: Source[];
  invaders: boolean;
  mineral: Mineral;
  coreInSk: boolean;
  centerFlag: Flag;


  ensureMetaData()
  {
    this.mineralMining = this.metaData.mineralMining;
    this.invaders = this.metaData.invaders;
    this.skRoomName = this.metaData.skRoomName
    this.skRoom = Game.rooms[this.skRoomName];

    if(this.skRoom)
    {
      this.lairs = this.roomInfo(this.skRoomName).lairs;
      this.sources = this.roomInfo(this.skRoomName).sources;
      this.mineral = this.roomInfo(this.skRoomName).mineral;
    }

    if(!this.metaData.devils)
    {
        this.metaData.devils = [];
    }

    if(!this.metaData.builderCreeps)
    {
        this.metaData.builderCreeps = [];
    }

    if(!this.metaData.distroCreeps)
    {
        this.metaData.distroCreeps = {};
    }

    if(!this.metaData.distroDistance)
    {
      this.metaData.distroDistance = {};
    }

    if(!this.metaData.harvestCreeps)
    {
        this.metaData.harvestCreeps = {};
    }

    if(!this.metaData.roadsDone)
    {
      this.metaData.roadsDone = {};
    }

    if(!this.metaData.miner)
    {
      this.metaData.miner = [];
    }

    if(!this.metaData.minerHauler)
    {
      this.metaData.minerHauler = [];
    }
  }

  run()
  {
    if(this.name === 'skrmp-E45S54')
      console.log(this.name, 'Problem', 1, this.metaData.coreInSK)

    if(Game.cpu.bucket < 7000)
      return;
    this.centerFlag = Game.flags['Center-'+this.metaData.roomName];

    this.skFlag = Game.flags[this.metaData.flagName];
    if(!this.skFlag)
    {
        this.completed = true;
        Memory.flags[this.metaData.flagName] = undefined;
        Memory.rooms[this.metaData.roomName].skSourceRoom = undefined;
        return;
    }

    if(this.skFlag.room.memory.skSourceRoom === undefined)
    {
      this.skFlag.room.memory.skSourceRoom = true;
    }

    this.ensureMetaData();


    if(this.name === 'skrmp-E45S56')
    {
        console.log(this.name, 'Run', 1, this.skFlag.memory.attackingCore);
    }

    if(!this.skFlag.memory.attackingCore)
      this.coreSearching();

      if(this.name === 'skrmp-E36S34')
      console.log(this.name, 'Problem', 2)
    if(this.skRoom)
    {
      let flag =  this.skRoom.find(FIND_FLAGS)[0];
      if(flag)
      {
        if(!this.mineralMining)
        {
          let name = flag.name.split('-')[0];
          if(name === 'Mining')
          {
            this.metaData.miningFlag = flag.name;
            this.metaData.mineralMining = true;
            this.mineralMining = true;
          }
        }
      }
      else
      {
        this.metaData.miningFlag = undefined;
        this.metaData.mineralMining = false;
        this.mineralMining = false;
      }
    }


    ////////////////////////////////////////////////////////////
    ///
    ///          Check For Invaders
    ///
    ////////////////////////////////////////////////////////////
    if(Game.time % 25 === 5)
    {
      if(this.skRoom)
      {
        let hostiles = this.skRoom.find(FIND_HOSTILE_CREEPS);
        let invader = _.find(hostiles, (h) => {
          return (h.owner.username === 'Invader')
        })

        if(invader)
        {
          this.metaData.invaders = true;
          this.invaders = true;
        }
        else
        {
          this.metaData.invaders = false;
          this.metaData.invaderFailCount = 0;
          this.invaders = false;
        }
      }
    }


    if(!this.metaData.coreInSK)
    {
      this.DevilSpawn();

      if(!this.invaders && this.metaData.devils.length) // ADD to check for enemies here if they are present and no devil then flee.
      {
        this.BuilderSpawn();
        this.HarvesterSpawn();
        this.HaulerSpawn();
      }

      if(!this.invaders && this.metaData.mineralMining)
      {
        if(this.name === 'skrmp-E36S34')
      console.log(this.name, 'Problem', 5)
        this.MiningSpawn()
      }
    }

    if(this.metaData.devils.length == 1 || !this.metaData.invaders)
    {
      for(let i = 0; i < this.metaData.devils.length; i++)
      {
        let devil = Game.creeps[this.metaData.devils[i]];
        if(devil)
        {
          // Time to do some stuff
          this.DevilActions(devil);
        }
      }
    }
    else if(this.metaData.devils.length >= 2)
    {
      const leader = Game.creeps[this.metaData.devils[0]];
      if(leader)
        this.LeaderAttackActions(leader);

      for(let i = 1; i < this.metaData.devils.length; i++)
      {
        const follower = Game.creeps[this.metaData.devils[i]];
        if(follower)
          this.FollowerAttackActions(follower);
      }
    }

    for(let i = 0; i < this.metaData.builderCreeps.length; i++)
    {
      let builder = Game.creeps[this.metaData.builderCreeps[i]];
      if(builder)
      {
          this.BuilderActions(builder);
      }
    }

    if(this.roomInfo(this.skRoomName))
    {
      const sources = this.roomInfo(this.metaData.skRoomName).sources;
      sources.forEach( s => {
        if(this.metaData.harvestCreeps[s.id])
        {
          for(let i = 0; i < this.metaData.harvestCreeps[s.id].length; i++)
          {
            let harvester = Game.creeps[this.metaData.harvestCreeps[s.id][i]];
            if(harvester)
            {
              this.HarvesterActions(harvester, s);
            }
          }
        }

        for(let i = 0; i < this.metaData.distroCreeps[s.id]?.length; i++)
        {
          const creep = Game.creeps[this.metaData.distroCreeps[s.id][i]];
          if(creep)
            this.HaulerActions(creep, s);
        }
      });

      for(let i = 0; i < this.metaData.miner.length; i++)
      {
        const creep = Game.creeps[this.metaData.miner[i]];
        if(creep)
          this.MinerActions(creep);
      }

      for(let i = 0; i < this.metaData.minerHauler.length; i++)
      {
        const creep = Game.creeps[this.metaData.minerHauler[i]];
        if(creep)
          this.MinerHaulerActions(creep, this.roomInfo(this.skRoomName).mineral);
      }
    }
  }

  DevilSpawn()
  {
    let distance = 0;
    if(this.skRoom?.memory.SKInfo)
    {
      distance = this.skRoom.memory.SKInfo.devilDistance;
    }
    const originalCount = this.metaData.devils.length;
    this.metaData.devils = Utils.clearDeadCreeps(this.metaData.devils);
    if(originalCount != this.metaData.devils.length && this.metaData.invaders)
      this.metaData.logginCount = 0;
    const count = Utils.creepPreSpawnCount(this.metaData.devils, distance);           // TODO: Want to pass in extra prespawn time

    let numberOfDevils = 1;
    if(count === 0 && this.invaders)
      numberOfDevils = 2;

    if(count < numberOfDevils)
    {
      let creepName = this.metaData.skRoomName + '-devil-' + Game.time;
      let spawned = Utils.spawn(
        this.kernel,
        this.metaData.roomName,
        'guard',
        creepName,
        {
          max: 34
        }
      );

      if(spawned)
      {
        this.metaData.devils.push(creepName);
      }
    }
  }

  BuilderSpawn()
  {

    this.metaData.builderCreeps = Utils.clearDeadCreeps(this.metaData.builderCreeps);
    const count = Utils.creepPreSpawnCount(this.metaData.builderCreeps, 10);
    if(this.roomInfo(this.skRoomName))
    {
      if(this.roomInfo(this.skRoomName).sourceContainers.length < this.roomInfo(this.skRoomName).sources.length)
      {
        if(count < 2)
        {
          let creepName = 'sk-build-' + this.skRoomName + '-' + Game.time;
          let spawned = Utils.spawn(
            this.kernel,
            this.metaData.roomName,
            'worker',
            creepName,
            {}
          );
          if(spawned)
          {
            // TODO Need to improve hold builder code to make construction sites automatic as it moves to source
            this.metaData.builderCreeps.push(creepName);
          }
        }
      }
      else if(this.roomInfo(this.skRoomName).constructionSites.length > 0)
      {
        if(this.metaData.builderCreeps.length < 1)
        {
          let creepName = 'hrm-build-' + this.skRoomName + '-' + Game.time;
          let spawned = Utils.spawn(
            this.kernel,
            this.metaData.roomName,
            'worker',
            creepName,
            {}
          );

          if(spawned)
          {
            // TODO Need to improve hold builder code to make construction sites automatic as it moves to source
            this.metaData.builderCreeps.push(creepName);
          }
        }
      }
    }
  }

  HarvesterSpawn()
  {
    if(this.roomInfo(this.skRoomName) && this.roomInfo(this.skRoomName).sourceContainers.length > 0)
    {
      let sources = this.roomInfo(this.skRoomName).sources;

      _.forEach(sources, (s)=> {
        if(this.roomInfo(this.skRoomName) && !this.roomInfo(this.skRoomName).skSourceContainerMaps[s.id])
        {
          return;
        }

        if(!this.metaData.harvestCreeps[s.id])
        {
          this.metaData.harvestCreeps[s.id] = [];
        }

        let creepNames = Utils.clearDeadCreeps(this.metaData.harvestCreeps[s.id])
        this.metaData.harvestCreeps[s.id] = creepNames

        const prespawnCount = this.skRoom.memory.SKInfo?.sourceDistances[s.id] ?? 70
        const count = Utils.creepPreSpawnCount(this.metaData.harvestCreeps[s.id], prespawnCount + 10);           // TODO: Want to pass in extra prespawn time

        if(count < 1)
        {
          let creepName = 'sk-harvest-'+this.skRoomName+'-'+Game.time;
          let spawned = Utils.spawn(
            this.kernel,
            this.metaData.roomName,
            'skHarvester',
            creepName,
            {}
          );

          if(spawned)
          {
            this.metaData.harvestCreeps[s.id].push(creepName);
          }
        }
      });
    }
  }

  HaulerSpawn()
  {
    if(this.roomInfo(this.skRoomName))
    {
      _.forEach(Object.keys(this.roomInfo(this.skRoomName).skSourceContainerMaps), (key) => {
        let source = Game.getObjectById(key) as Source;
        if(source)
        {
          if(!this.metaData.distroCreeps[source.id])
            this.metaData.distroCreeps[source.id] = [];

          if(!this.metaData.distroDistance[source.id])
          {
            let ret = PathFinder.search(this.centerFlag.pos, source.pos);
            this.metaData.distroDistance[source.id] = ret.path.length;
          }

          let creepNames = Utils.clearDeadCreeps(this.metaData.distroCreeps[source.id]);
          this.metaData.distroCreeps[source.id] = creepNames;
          let creeps = Utils.inflateCreeps(creepNames);

          let count = 0;
          _.forEach(creeps, (c) => {
            let ticksNeeded = c.body.length * 3 + (this.skRoom.memory.SKInfo?.sourceDistances[source.id] ?? 56);
            if(!c.ticksToLive || c.ticksToLive > ticksNeeded) { count++; }
          });

          let numberDistro = 2;
          const distance = (this.skRoom.memory.SKInfo?.sourceDistances[source.id] ?? 56);
          if(distance > 100)
          {
            numberDistro = 3;
          }

          if(count < numberDistro)
          {
            let creepName = 'sk-m-' + this.skRoomName + '-' + Game.time;
            let spawned = Utils.spawn(
              this.kernel,
              this.metaData.roomName,
              'holdmover',
              creepName,
              {}
            );

            if(spawned)
            {
              this.metaData.distroCreeps[source.id].push(creepName);
            }
          }

          //Hauler Action Code
          _.forEach(creeps, (creep) => {
            this.HaulerActions(creep, source);
          });
        }
      });
    }
  }

  MiningSpawn()
  {
    if(this.name === 'skrmp-E36S34')
        console.log(this.name, 'MiningSapwn', 1)
    if(this.roomInfo(this.skRoomName))
    {
      this.mineral = this.roomInfo(this.skRoomName).mineral;
      let storage = Game.rooms[this.metaData.roomName].storage;
      if(this.name === 'skrmp-E36S34')
          console.log(this.name, 'MiningSapwn', 2)
      if(this.mineral?.mineralAmount <= (storage?.store.getCapacity() - storage?.store.getUsedCapacity()))
      {
        if(this.name === 'skrmp-E36S34')
          console.log(this.name, 'MiningSapwn', 3)
        if(this.metaData.miningDistance === undefined)
        {
          if(this.name === 'skrmp-E36S34')
          console.log(this.name, 'MiningSapwn', 4)
          const ret = PathFinder.search(this.centerFlag.pos, this.mineral.pos, {});
          if(!ret.incomplete)
            this.metaData.miningDistance = ret.path.length;
        }

        if(this.name === 'skrmp-E36S34')
          console.log(this.name, 'MiningSapwn', 5)
        this.metaData.miner = Utils.clearDeadCreeps(this.metaData.miner);
        const count = Utils.creepPreSpawnCount(this.metaData.miner, 20);
        //console.log(this.name, 'Mineral', this.metaData.miner.length, this.mineral.mineralAmount, this.metaData.miner[0])
        if(count < 1 && this.mineral.mineralAmount > 0)
        {
          if(this.name === 'skrmp-E36S34')
          console.log(this.name, 'MiningSapwn', 6)
          let creepName = 'sk-miner-' + this.skRoomName + '-' + Game.time;
          let spawned = Utils.spawn(
            this.kernel,
            this.metaData.roomName,
            'skMiner',
            creepName,
            {}
          );

          if(spawned)
          {
            this.metaData.miner.push(creepName);
          }
        }

        if(this.name === 'skrmp-E36S34')
          console.log(this.name, 'MiningSapwn', 7)
        this.metaData.minerHauler = Utils.clearDeadCreeps(this.metaData.minerHauler);
        const haulerCount = Utils.creepPreSpawnCount(this.metaData.minerHauler, 20);
        if(haulerCount < 1)
        {
          let creepName = 'sk-mineHauler-' + this.skRoomName + '-' + Game.time;
          let spawned = Utils.spawn(
            this.kernel,
            this.metaData.roomName,
            'skMinerHauler',
            creepName,
            {}
          );

          if(spawned)
          {
            this.metaData.minerHauler.push(creepName);
          }
        }
      }
    }
  }

  ////////////////////////////////////////////////////////////
  ///
  ///          Devil Actions
  ///
  ////////////////////////////////////////////////////////////
  DevilActions(devil: Creep)
  {
    let strSay = '';
    if(!devil.memory.boost)
    {
      if(this.name === 'skrmp-E36S34')
        console.log(this.name, 'DA', 1)
      devil.boostRequest([RESOURCE_LEMERGIUM_OXIDE, RESOURCE_KEANIUM_OXIDE], false);
      return;
    }

    if(this.name === 'skrmp-E36S34')
        console.log(this.name, 'DA', 2)
    if(!devil.memory.distance)
      devil.memory.distance = 0;

    if(devil.pos.roomName !== this.skRoomName)
      devil.memory.distance++;

    const skRoom = Game.rooms[this.skRoomName];
    if(skRoom?.memory.SKInfo === undefined && devil.pos.roomName === this.skRoomName)
      skRoom.memory.SKInfo = {devilDistance: (devil.memory.distance + 10), sourceDistances: {}};

    if(this.metaData.coreInSK)
    {
      const spawn = this.roomData().spawns[0];
      if(!devil.pos.isNearTo(spawn))
        devil.travelTo(spawn);
      else
      {
        if(!spawn.spawning)
          spawn.recycleCreep(devil);
      }

      return;
    }

    let targetName: string|undefined;
    // Just spawned moving to SK Room.
    if((devil.pos.roomName == this.metaData.roomName && !devil.memory.target) || devil.pos.roomName !== this.skRoomName)
    {
      devil.travelTo(new RoomPosition(25, 25, this.skRoomName));
    }
    else
    {
      //////////// Invader Code ///////////////////////
      if(this.invaders)
      {
        // Attack Invaders
        let invaders = devil.room.find(FIND_HOSTILE_CREEPS, {
          filter: c => c.owner.username === 'Invader'
        });

        if(invaders.length)
        {
          let target: Creep;

          if(devil.memory.target)
          {
            target = Game.getObjectById(devil.memory.target) as Creep;
            if(!target)
              devil.memory.target = undefined;
          }

          //Find healers
          const healers = _.filter(invaders, (i) =>{
            return i.getActiveBodyparts(HEAL) > 0;
          });

          const boostedHealers = _.filter(invaders, (i) =>{
            return i.getBodyPartBoosted(HEAL);
          });

          if(!devil.memory.target)
          {
            console.log(this.name, 'Invaders boosted healers', boostedHealers.length);

            let attackers = _.filter(invaders, (i) => {
              return i.getActiveBodyparts(ATTACK) > 0 || i.getActiveBodyparts(RANGED_ATTACK) > 0;
            })

            if(boostedHealers.length)
            {
              target = devil.pos.findClosestByRange(attackers);
              devil.memory.target = target.id;
            }
            else if(healers.length >= 3 && attackers.length)
            {
              target = devil.pos.findClosestByRange(attackers);
              devil.memory.target = target.id;
            }
            else if(healers.length)
            {
              target = devil.pos.findClosestByRange(healers);
              devil.memory.target = target.id;
            }
            else
            {
              let rangers = _.filter(invaders, (i) => {
                return i.getActiveBodyparts(RANGED_ATTACK) > 0;
              });

              if(rangers.length)
              {
                target = devil.pos.findClosestByRange(rangers);
                devil.memory.target = target.id;
              }
              else
              {
                target = devil.pos.findClosestByRange(invaders);
                devil.memory.target = target.id;
              }
            }
          }

          if(target)
          {
            let strSay = '';
            let numberInRange = devil.pos.findInRange(invaders, 3);
            //if(boostedHealers.length)
            {
              if(!devil.pos.isNearTo(target))
              {
                if(numberInRange.length > 1)
                {
                  strSay += 'MA';
                  devil.rangedMassAttack();
                }
                else
                {
                  strSay += 'RA';
                  devil.rangedAttack(target);
                }

                  strSay += 'H';
                  devil.heal(devil);
              }
              else
              {
                strSay += 'ARA';
                devil.attack(target);
                devil.rangedAttack(target);
              }

              devil.say(strSay, true);
              devil.travelTo(target, {movingTarget: true});
              return;
            }
          }
          return;
        }
      }
      else
      {
        if(!devil.memory.target)    // Find a target name
        {
          let sourceKeepers: StructureKeeperLair[] = [];
          if(this.metaData.mineralMining && !this.mineral?.ticksToRegeneration)
          {
            sourceKeepers = _.filter(this.lairs, (l) => {
              return (l.pos.findInRange(FIND_HOSTILE_CREEPS, 5).length);
            });
          }
          else if(!this.roomInfo(this.skRoomName)?.containers?.length)
          {
            sourceKeepers = this.lairs.filter(l => l.pos.findInRange(FIND_MY_CREEPS, 7).length);
          }
          else
          {
            sourceKeepers = _.filter(this.lairs, (l) => {
              return (l.pos.findInRange(FIND_SOURCES, 6).length && l.pos.findInRange(FIND_HOSTILE_CREEPS, 5).length);
            });
          }

          if(sourceKeepers.length)  // Found screep around source.
          {
            let sl = devil.pos.findClosestByPath(sourceKeepers);
            if(sl)
            {
              targetName = sl.pos.findClosestByRange(FIND_HOSTILE_CREEPS).id;
            }
          }
          else
          {
            // No Souce Keepers move to Lair with shortest spawn time.
            if(!this.mineralMining)
            {
              // Filter out the mineral lair
              let lairs = _.filter(this.lairs, (l) => {
                return (l.pos.findInRange(FIND_SOURCES, 6).length);
              });

              let lair = _.min(lairs, "ticksToSpawn");
              if(lair.ticksToSpawn)
              {
                targetName = lair.id;
              }
            }
            else
            {
              let lair = _.min(this.lairs, "ticksToSpawn");
              if(lair.ticksToSpawn)
              {
                targetName = lair.id;
              }
            }
          }
        }

        if(targetName)
        {
          devil.memory.target = targetName;
          targetName = undefined;
        }


        if(devil.memory.target && !targetName)
        {
          let SkScreep = Game.getObjectById(devil.memory.target) as Creep;
          if(SkScreep)
          {
            if(devil.pos.isNearTo(SkScreep))
            {
              if(SkScreep instanceof StructureKeeperLair)
              {
                devil.memory.target = undefined;
                let damaged = devil.pos.findInRange(FIND_MY_CREEPS, 10, {
                  filter: c => c.hits < c.hitsMax
                });
                if(damaged.length)
                {
                  let target = devil.pos.findClosestByRange(damaged);

                  if(devil.pos.inRangeTo(target, 3))
                  {
                    devil.rangedHeal(target);
                  }
                  else
                  {
                    devil.travelTo(target, {maxRooms: 1, roomCallback:(roomName, matrix)=>
                      {
                        let room = Game.rooms[roomName];
                        if(room)
                        {
                            room.find(FIND_EXIT).forEach(exit=>matrix.set(exit.x, exit.y, 0xff))
                        }

                        return matrix;
                      }
                    });
                  }

                  devil.say('heal 1');
                  return;
                }
              }

              devil.say('RA+A', true);
              devil.rangedAttack(SkScreep);
              devil.attack(SkScreep);
            }
            else if(devil.pos.inRangeTo(SkScreep,3))
            {
              if(SkScreep instanceof StructureKeeperLair)
              {
                  devil.memory.target = undefined;
              }
              devil.rangedAttack(SkScreep);
              devil.heal(devil);
              devil.travelTo(SkScreep, {maxRooms: 1, roomCallback:(roomName, matrix)=>{
                let room = Game.rooms[roomName];
                if(room)
                {
                    room.find(FIND_EXIT).forEach(exit=>matrix.set(exit.x, exit.y, 0xff))
                }

                return matrix;
                }
              });
            }
            else
            {
              if(devil.room.name !== this.skRoomName)
              {
                devil.travelTo(new RoomPosition(25,25,this.skRoomName));
                return;
              }
              else
              {
                if(devil.hits < devil.hitsMax)
                {
                  devil.heal(devil);
                }
                else
                {
                  let damCreeps = devil.room.find(FIND_CREEPS, {filter: c => c.hits < c.hitsMax});
                  if(damCreeps.length)
                  {
                    let healTarget = devil.pos.findInRange(damCreeps, 4)[0];
                    if(healTarget)
                    {
                      if(!devil.pos.inRangeTo(healTarget, 3))
                        devil.travelTo(healTarget);
                      if(devil.pos.isNearTo(healTarget))
                        devil.heal(healTarget);
                      else
                        devil.rangedHeal(healTarget);
                    }
                  }
                }


                devil.travelTo(SkScreep, {maxRooms: 1, roomCallback:(roomName, matrix)=>
                    {
                      let room = Game.rooms[roomName];
                      if(room)
                      {
                        room.find(FIND_EXIT).forEach(exit=>matrix.set(exit.x, exit.y, 0xff))
                      }

                      return matrix;
                    }
                  });
                devil.say('Heal 2')
              }
            }
          }
          else
          {
            devil.memory.target = undefined;
          }
        }
      }
    }
  }

  ////////////////////////////////////////////////////////////
  ///
  ///          Builder Actions
  ///
  ////////////////////////////////////////////////////////////
  BuilderActions(builder: Creep)
  {
    if(this.metaData.coreInSK)
    {
      const spawn = this.roomData().spawns[0];
      if(!builder.pos.isNearTo(spawn))
        builder.travelTo(spawn);
      else
      {
        if(!spawn.spawning)
          spawn.recycleCreep(builder);
      }

      return;
    }

    if(builder.pos.roomName !== this.skRoomName && !builder.memory.atPlace)
    {
      builder.travelTo(new RoomPosition(25, 25, this.skRoomName));
      builder.memory.filling = true
    }
    else
    {
      builder.memory.atPlace = true;
      // Create constructions sites
      if(this.roomInfo(this.skRoomName).containers.length <= 3 && this.roomInfo(this.skRoomName).constructionSites.length < 3)
      {
        this.sources.forEach(s => {
          const containers = s.pos.findInRange(FIND_STRUCTURES, 1, {filter: s => s.structureType === STRUCTURE_CONTAINER});
          const sites = s.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 1, {filter: s => s.structureType === STRUCTURE_CONTAINER});
          if(containers.length === 0 && sites.length === 0)
          {
            const openspaces = s.pos.openAdjacentSpots(true);
            if(openspaces.length)
              openspaces[0].createConstructionSite(STRUCTURE_CONTAINER);
          }
        });
      }

      if(!this.invaders)
      {
        /////////// SK Lair Checking ///////////////////////
        let lair: StructureKeeperLair;
        if(builder.room.name === this.skRoomName)
          lair = builder.pos.findClosestByRange(this.lairs);

        if(lair?.ticksToSpawn < 7 && lair.pos.inRangeTo(builder, 5))
        {
          const ret = PathFinder.search(builder.pos, {pos: lair.pos, range: 5},
            {
              flee: true,

              roomCallback: function(roomName) {

                let room = Game.rooms[roomName];
                // In this example `room` will always exist, but since
                // PathFinder supports searches which span multiple rooms
                // you should be careful!
                if (!room) return;
                let costs = new PathFinder.CostMatrix;

                room.find(FIND_EXIT).forEach(exit=>costs.set(exit.x, exit.y, 0xff))

                // Avoid creeps in the room
                room.find(FIND_CREEPS).forEach(function(creep) {
                  costs.set(creep.pos.x, creep.pos.y, 0xff);
                });

                return costs;
              }
            });
          builder.say('👺L');
          builder.moveByPath(ret.path);
          return;
        }

        let distance = 7;
        if(builder.room.name !== this.skRoomName)
          distance = 4;

        let sks = builder.pos.findInRange(FIND_HOSTILE_CREEPS, distance);
        if(sks.length)
        {
          const sk = sks[0];
          if(sk.pos.getRangeTo(builder) < 7 && sk.pos.getRangeTo(this.mineral) > 3)
          {
            const ret = PathFinder.search(builder.pos, {pos: sk.pos, range: 5},
            {
              flee: true,

              roomCallback: function(roomName) {

                let room = Game.rooms[roomName];
                // In this example `room` will always exist, but since
                // PathFinder supports searches which span multiple rooms
                // you should be careful!
                if (!room) return;
                let costs = new PathFinder.CostMatrix;

                room.find(FIND_EXIT).forEach(exit=>costs.set(exit.x, exit.y, 0xff))

                // Avoid creeps in the room
                room.find(FIND_CREEPS).forEach(function(creep) {
                  costs.set(creep.pos.x, creep.pos.y, 0xff);
                });

                return costs;
              },
            });

            builder.moveByPath(ret.path);
            builder.say('👺', true);
            return;
          }
        }
        else
        {
          console.log(this.name, 'Builder actions', 10)
          const containers = this.roomInfo(builder.pos.roomName).containers?.filter(c => c.effects?.filter( e => e.effect === EFFECT_COLLAPSE_TIMER));
          console.log(this.name, 'Builder actions', 11, containers.length);
          if(containers.length > 2)
          {
            const container = builder.pos.findClosestByPath(containers);
            if(container)
            {
              if(!builder.pos.isNearTo(container))
                builder.travelTo(container);
              else if(container.store.getUsedCapacity() === 0)
                builder.dismantle(container);

              return;
            }
          }

          // if(this.roomInfo(builder.pos.roomName).containers.length > 3)
          // {
          //   let SHContainer = this.roomInfo(builder.pos.roomName).containers.filter(c => (c.effects?.length ?? false) && c.store.getUsedCapacity() === 0);
          //   if(SHContainer.length > 2)
          //   {
          //     if(!builder.pos.isNearTo(SHContainer[0]))
          //       builder.travelTo(SHContainer[0]);
          //     else
          //       builder.dismantle(SHContainer[0]);
          //     return;
          //   }
          // }
          // console.log(this.name, 'Builder actions', 11)
        }

        //////////// Fill up the builder ///////////////////////
        if(_.sum(builder.carry) != builder.carryCapacity && builder.memory.filling)
        {
          const containers = this.roomInfo(this.skRoomName).containers.filter(c => c.store[RESOURCE_ENERGY] > 0);
          if(containers.length)
          {
            let resources = builder.pos.findInRange(FIND_DROPPED_RESOURCES, 6)[0] as Resource;

            if(resources && resources.resourceType === RESOURCE_ENERGY && resources.amount)
            {
              if(!builder.pos.isNearTo(resources))
                builder.travelTo(resources);
              else if(builder.pickup(resources) === OK)
                builder.memory.filling = false;

              return;
            }

            let tombStone = builder.pos.findInRange(FIND_TOMBSTONES, 7)[0]

            if(tombStone && tombStone.store.energy > 0)
            {
              if(builder.pos.isNearTo(tombStone))
              {
                builder.withdraw(tombStone, RESOURCE_ENERGY);
                builder.memory.filling = false;
              }

              builder.travelTo(tombStone, {range: 1});
              return;
            }

            let target = builder.pos.findClosestByPath(containers);

            if(target)
            {
                if(!builder.pos.inRangeTo(target, 1))
                  builder.travelTo(target, {range: 1});
                else if(builder.withdraw(target, RESOURCE_ENERGY) == OK)
                  builder.memory.filling = false;

                return;
            }
          }
          else
          {
            let resources = builder.pos.findInRange(FIND_DROPPED_RESOURCES, 4, {filter: r => r.resourceType === RESOURCE_ENERGY})[0] as Resource;

            if(resources)
            {
              if(builder.pos.isNearTo(resources))
              {
                builder.pickup(resources);
                builder.memory.filling = false;
              }

              builder.travelTo(resources);
              return;
            }

            const tombstones = builder.pos.findInRange(FIND_TOMBSTONES, 4, {filter: t => t.store.getUsedCapacity(RESOURCE_ENERGY) > 0});
            if(tombstones.length)
            {
              const tombstone = builder.pos.findClosestByPath(tombstones);
              if(!builder.pos.isNearTo(tombstone))
                builder.travelTo(tombstone);
              else if(builder.withdraw(tombstone, RESOURCE_ENERGY) === OK)
                builder.memory.filling = false;

              return;
            }

            let source =  builder.pos.findClosestByRange(this.sources);
            const openspaces = source.pos.openAdjacentSpots(false);
            if(openspaces.length === 0 && !builder.pos.inRangeTo(source, 1))
            {
              let sources = this.sources;
              const index = sources.indexOf(source, 0);
              if(index > -1)
                sources.splice(index, 1);

              source = builder.pos.findClosestByPath(sources);
            }
            if(!builder.pos.isNearTo(source))
            {
                builder.travelTo(source);
            }
            else
            {
              builder.harvest(source);

              if(builder.almostFull())
                builder.memory.filling = false;
            }
            return;
          }
        }


        ///////////// Have the builder Build. ///////////////////////
        if(_.sum(builder.carry) === builder.carryCapacity || !builder.memory.filling)
        {
          let target: ConstructionSite;
          if(!builder.memory.target)
          {
            ///////////// Site Building ///////////////////////
            let sites = _.filter(this.roomInfo(this.skRoomName).constructionSites, (cs) => {
                return (cs.my);
            });
            target = builder.pos.findClosestByRange(sites);
            if(target)
              builder.memory.target = target.id;
          }
          else
            target = Game.getObjectById(builder.memory.target) as ConstructionSite;

          if(target)
          {
            if(builder.pos.inRangeTo(target, 3))
            {
              builder.build(target);
              if(_.sum(builder.carry) === 0 || !target)
              {
                builder.memory.target = undefined;
                builder.memory.filling = true;
              }
              return;
            }
            else
            {
              builder.travelTo(target, {range: 3})
            }
          }
          else
          builder.memory.target = undefined;
        }
      }
    }
  }

  ////////////////////////////////////////////////////////////
  ///
  ///          Harvester Action code.
  ///
  ////////////////////////////////////////////////////////////
  HarvesterActions(harvester: Creep, source: Source)
  {
    if(this.metaData.coreInSK)
    {
      const spawn = this.roomData().spawns[0];
      if(!harvester.pos.isNearTo(spawn))
        harvester.travelTo(spawn);
      else
      {
        if(!spawn.spawning)
          spawn.recycleCreep(harvester);
      }

      harvester.say('Suicide', true);
      return;
    }

    if(!this.invaders)
    {
      if(!this.skRoom.memory.SKInfo?.sourceDistances)
        this.skRoom.memory.SKInfo.sourceDistances = {};

      if(Object.keys(this.skRoom.memory.SKInfo?.sourceDistances).indexOf(source.id) === -1)
      {
        const ret = PathFinder.search(source.pos, this.centerFlag.pos );
        this.skRoom.memory.SKInfo.sourceDistances[source.id] = ret.path.length;
      }

      //////////// SK Lair Checking ///////////////////////
      if(this.roomInfo(this.skRoomName).skSourceContainerMaps[source.id])
      {
        let lair = this.roomInfo(this.skRoomName).skSourceContainerMaps[source.id].lair
        if(lair.ticksToSpawn < 7 && lair.pos.inRangeTo(harvester, 5))
        {
          const cpu = Game.cpu.getUsed();
          const ret = PathFinder.search(harvester.pos, {pos: lair.pos, range: 5},
            {
              flee: true,
              roomCallback: function(roomName) {

                let room = Game.rooms[roomName];
                // In this example `room` will always exist, but since
                // PathFinder supports searches which span multiple rooms
                // you should be careful!
                if (!room) return;
                let costs = new PathFinder.CostMatrix;

                room.find(FIND_EXIT).forEach(exit=>costs.set(exit.x, exit.y, 0xff))

                // Avoid creeps in the room
                room.find(FIND_CREEPS).forEach(function(creep) {
                  costs.set(creep.pos.x, creep.pos.y, 0xff);
                });

                return costs;
              }
            });

          harvester.say('👺L');
          harvester.moveByPath(ret.path);
          return;
        }

        let sks = harvester.pos.findInRange(FIND_HOSTILE_CREEPS, 5);
        if(sks.length)
        {
          const sk = sks[0];
          if(sk.pos.getRangeTo(source) < 7)
          {
            const cpu = Game.cpu.getUsed();
            const ret = PathFinder.search(harvester.pos, {pos: sk.pos, range: 5},
            {
              flee: true,
              roomCallback: function(roomName) {

                let room = Game.rooms[roomName];
                // In this example `room` will always exist, but since
                // PathFinder supports searches which span multiple rooms
                // you should be careful!
                if (!room) return;
                let costs = new PathFinder.CostMatrix;

                room.find(FIND_EXIT).forEach(exit=>costs.set(exit.x, exit.y, 0xff))

                // Avoid creeps in the room
                room.find(FIND_CREEPS).forEach(function(creep) {
                  costs.set(creep.pos.x, creep.pos.y, 0xff);
                });

                return costs;
              },
            });

            harvester.moveByPath(ret.path);
            harvester.say('👺', true);
            return;
          }
        }
      }

    if(source && this.roomInfo(this.skRoomName).skSourceContainerMaps[source.id].container)
    {
        let container = this.roomInfo(this.skRoomName).skSourceContainerMaps[source.id].container;

        if(!harvester.pos.inRangeTo(container, 0))
        {
          harvester.travelTo(container);
          return;
        }

        if(container.hits < container.hitsMax * .95 ||
          (source.energy > 0 && _.sum(container.store) === container.storeCapacity && container.hits < container.hitsMax))
        {
          if(_.sum(harvester.carry) == 0 || harvester.memory.filling)
          {
            if(_.sum(harvester.carry) === harvester.carryCapacity)
            {
              harvester.memory.filling = false;
            }

            harvester.harvest(source);
            return;
          }
          else if(_.sum(harvester.carry) != 0 || harvester.memory.filling === false)
          {
            if(_.sum(harvester.carry) === 0)
              harvester.memory.filling = true;

            harvester.repair(container);
            return;
          }

          return;
        }

        if((container.storeCapacity - _.sum(container.store)) >= (harvester.getActiveBodyparts(WORK) * 2))
        {
          if(_.sum(harvester.carry) === harvester.carryCapacity)
            harvester.memory.filling = false;

          harvester.harvest(source);
          return;
        }

        if(container.store.energy < container.storeCapacity && _.sum(harvester.carry) === harvester.carryCapacity)
        {
          harvester.transfer(container, RESOURCE_ENERGY);
          harvester.memory.filling = true;
          return;
        }
      }
    }
    else
    {
      let ret = harvester.travelTo(this.skFlag);
    }
  }

  HaulerActions(hauler: Creep, source: Source)
  {
    let strSay = '';
    if(this.metaData.coreInSK)
    {
      const spawn = this.roomData().spawns[0];
      if(!hauler.pos.isNearTo(spawn))
        hauler.travelTo(spawn);
      else
      {
        if(!spawn.spawning)
          spawn.recycleCreep(hauler);
      }

      hauler.say('☠', true);
      return;
    }

    if(!this.invaders)
    {
      if(this.metaData.roadsDone[source.id] === undefined)
      {
        this.metaData.roadsDone[source.id] = false;
      }

      if(hauler.name === 'sk-m-E45S54-26905280')
        console.log(this.name, 'ha', 0.1)

      if(hauler.pos.roomName !== this.skRoomName && _.sum(hauler.carry) === 0 &&
        hauler.ticksToLive > this.metaData.distroDistance[source.id] * 2)
      {
        if(hauler.name === 'sk-m-E45S54-26905280')
        console.log(this.name, 'ha', 0.2)
        hauler.travelTo(source);
        return;
      }
      else
      {
        if(hauler.name === 'sk-m-E45S54-26905280')
            console.log(hauler.name, 'ha', 1)
        if(this.roomInfo(this.skRoomName).skSourceContainerMaps[source.id] && hauler.room.name === this.skRoomName)
        {
          if(hauler.name === 'sk-m-E45S54-26905280')
            console.log(hauler.name, 'ha', 2)
          let lair = this.roomInfo(this.skRoomName).skSourceContainerMaps[source.id].lair
          let sks = hauler.pos.findInRange(FIND_HOSTILE_CREEPS, 5);
          if(sks.length)
          {
            const sk = hauler.pos.findClosestByRange(sks);
            if(sk.pos.getRangeTo(source) < 7)
            {
              let ret = PathFinder.search(hauler.pos, {pos: sk.pos, range: 6},
                {
                  flee: true,
                  roomCallback: function(roomName) {

                    let room = Game.rooms[roomName];
                    // In this example `room` will always exist, but since
                    // PathFinder supports searches which span multiple rooms
                    // you should be careful!
                    if (!room) return;
                    let costs = new PathFinder.CostMatrix;

                    room.find(FIND_EXIT).forEach(exit=>costs.set(exit.x, exit.y, 0xff))

                    // Avoid creeps in the room
                    room.find(FIND_CREEPS).forEach(function(creep) {
                      costs.set(creep.pos.x, creep.pos.y, 0xff);
                    });

                    return costs;
                  }
                });
              hauler.moveByPath(ret.path);
              hauler.say('👺');
              return;
            }
          }

          if(hauler.name === 'sk-m-E45S54-26905280')
            console.log(hauler.name, 'ha', 3)
          if(lair.ticksToSpawn < 10)
          {
            let ret = PathFinder.search(hauler.pos, {pos: lair.pos, range: 6},
              {
                flee: true,
                roomCallback: function(roomName) {

                  let room = Game.rooms[roomName];
                  // In this example `room` will always exist, but since
                  // PathFinder supports searches which span multiple rooms
                  // you should be careful!
                  if (!room) return;
                  let costs = new PathFinder.CostMatrix;

                  room.find(FIND_EXIT).forEach(exit=>costs.set(exit.x, exit.y, 0xff))

                  // Avoid creeps in the room
                  room.find(FIND_CREEPS).forEach(function(creep) {
                    costs.set(creep.pos.x, creep.pos.y, 0xff);
                  });

                  return costs;
                }
              });
            hauler.moveByPath(ret.path);
            hauler.say('👺L');
            return;
          }

          // Need to find way around what is happening in E56S44 where it is getting jammed on the mineral entry
          // if(hauler.pos.getRangeTo(lair) > 7)
          // {
          //   const sks = hauler.pos.findInRange(FIND_HOSTILE_CREEPS, 5);
          //   if(sks.length)
          //   {
          //     const sk = hauler.pos.findClosestByRange(sks);
          //     let ret = PathFinder.search(hauler.pos, {pos: sk.pos, range: 6}, {flee: true});
          //     hauler.moveByPath(ret.path);
          //     hauler.say('👺C');
          //     return;
          //   }
          // }
        }

        if(hauler.name === 'sk-m-E45S54-26905280')
            console.log(hauler.name, 'ha', 4)
        if(!hauler.memory.full && hauler.ticksToLive! > this.metaData.distroDistance[source.id])
        {
          if(hauler.name === 'sk-m-E45S54-26905280')
            console.log(hauler.name, 'ha', 5)
          if(_.sum(hauler.carry) === hauler.carryCapacity)
          {
            hauler.memory.full = true;
          }
          else
          {
            if(hauler.name === 'sk-m-E45S54-26905280')
            console.log(hauler.name, 'ha', 6)
            let tombstone = hauler.pos.findInRange(FIND_TOMBSTONES, 10)[0];
            if(tombstone && tombstone.store.energy > 600)
            {
              if(hauler.pos.isNearTo(tombstone))
              {
                hauler.withdraw(tombstone, RESOURCE_ENERGY);
              }

              hauler.travelTo(tombstone, {range: 1});
              return;
            }

            if(hauler.name === 'sk-m-E45S54-26905280')
            console.log(hauler.name, 'ha', 7)

            let SHContainer = this.roomInfo(hauler.pos.roomName).containers.filter(c => {
              (c.effects?.length ?? false)
                && c.store.getUsedCapacity() > 0
                && c.pos.lookForStructures(STRUCTURE_RAMPART) === undefined
            });

            if(hauler.name === 'sk-m-E45S54-26905280')
            console.log(hauler.name, 'ha', 8)
            if(SHContainer.length)
            {
              if(hauler.name === 'sk-m-E45S54-26905280')
            console.log(hauler.name, 'ha', 9)
              let container = hauler.pos.findClosestByPath(SHContainer);
              if(container)
              {
                if(!hauler.pos.isNearTo(container))
                  hauler.travelTo(container);
                else
                  hauler.withdrawEverything(container);
                return;
              }
            }

            if(hauler.name === 'sk-m-E45S54-26905280')
            console.log(hauler.name, 'ha', 10)
            let sourceContainer = this.roomInfo(this.skRoomName).skSourceContainerMaps[source.id].container;
            if(sourceContainer)
            {
              if(hauler.name === 'sk-m-E45S54-26905280')
            console.log(hauler.name, 'ha', 11)
              let resource = <Resource[]>source.pos.findInRange(FIND_DROPPED_RESOURCES, 3, {filter: r => r.amount > 200});
              if(resource.length > 0)
              {
                if(!hauler.pos.isNearTo(resource[0]))
                  hauler.travelTo(resource[0]);
                else
                  hauler.pickup(resource[0]);

                hauler.say('💊');
                return;
              }

              if(hauler.name === 'sk-m-E45S54-26905280')
            console.log(hauler.name, 'ha', 12)
              let roads: {
                [sourceId: string]: boolean
              };

              // if(hauler.name === 'sk-m-E45S54-26905280')
              // {
              //   for(const id in this.skRoom.memory.roads)
              //   {
              //     if(!Game.getObjectById(id))
              //     {
              //       console.log(this.name, 'Roads reset', id);
              //       this.skRoom.memory.roads = undefined;
              //       break;
              //     }
              //   }
              // }

              if(!this.skRoom.memory.roads)
              {
                this.skRoom.memory.roads = {};
                roads = this.skRoom.memory.roads;
              }
              else
              {
                roads = this.skRoom.memory.roads;
              }

                if(hauler.name === 'sk-m-E45S54-26905280')
            console.log(hauler.name, 'ha', 13)
              if(hauler.room.name === sourceContainer.room.name
                && !hauler.pos.isNearTo(sourceContainer))
              {
                if(hauler.name === 'sk-m-E45S54-26905280')
            console.log(hauler.name, 'ha', 14, sourceContainer.id, roads[sourceContainer.id])
                if(!roads[sourceContainer.id])
                {
                  if(hauler.name === 'sk-m-E45S54-26905280')
                  console.log(hauler.name, 'ha', 14.1)
                  const ret = PathFinder.search(hauler.pos, sourceContainer.pos);
                  if(!ret.incomplete)
                  {
                    if(hauler.name === 'sk-m-E45S54-26905280')
                  console.log(hauler.name, 'ha', 14.2)
                    if(Object.keys(Game.constructionSites).length + ret.path.length <= 100)
                    {
                      if(hauler.name === 'sk-m-E45S54-26905280')
                  console.log(hauler.name, 'ha', 14.3)
                      let allCreated = true;
                      for(let i = 0; i < ret.path.length; i++)
                        allCreated = allCreated && (this.skRoom.createConstructionSite(ret.path[i], STRUCTURE_ROAD) == OK);

                        if(hauler.name === 'sk-m-E45S54-26905280')
                  console.log(hauler.name, 'ha', 14.4)

                        roads[sourceContainer.id] = true;

                      
                    }
                  }
                }
                else if(!hauler.pos.inRangeTo(sourceContainer, 1))
                {
                  if(hauler.name === 'sk-m-E45S54-26905280')
                  console.log(hauler.name, 'ha', 14.2)
                  hauler.travelTo(sourceContainer);
                  return;
                }
              }
              else if(!hauler.pos.inRangeTo(sourceContainer, 1))
              {
                if(hauler.name === 'sk-m-E45S54-26905280')
            console.log(hauler.name, 'ha', 15)
                  hauler.travelTo(sourceContainer);
                  return;
              }
              else
              {
                if(sourceContainer.store.energy > hauler.store.getFreeCapacity())
                {
                    hauler.withdraw(sourceContainer, RESOURCE_ENERGY);
                    return;
                }
                else if(source.energy === 0 && sourceContainer.store.energy > 0)
                {
                  hauler.withdraw(sourceContainer, RESOURCE_ENERGY);
                  hauler.memory.full = true;
                  return;
                }


                this.metaData.roadsDone[source.id] = true;
                hauler.say('waiting');
                return;
              }

              this.skRoom.memory.roads = roads;
            }
          }
        }
        else if(hauler.ticksToLive! < this.metaData.distroDistance[source.id] && _.sum(hauler.carry) === 0)
        {
          let container = this.kernel.data.roomData[this.metaData.roomName].generalContainers[0];
          if(hauler.pos.inRangeTo(container, 0))
          {
            hauler.suicide();
            return;
          }

          hauler.travelTo(container);
          return;
        }
      }

      if(Game.rooms[this.metaData.roomName].storage)
      {
        if(hauler.store[RESOURCE_ENERGY] < hauler.store.getUsedCapacity())
        {
          let terminal = Game.rooms[this.metaData.roomName].terminal;
          if(!hauler.pos.isNearTo(terminal))
            hauler.travelTo(terminal);
          else
          {
            let ret = hauler.transferEverything(terminal);
            if(ret === ERR_FULL)
              return;
            else if(ret === OK)
              hauler.memory.full = false;
          }
        }

        let target = Game.rooms[this.metaData.roomName].storage;
        if(target)
        {
          if(!hauler.pos.isNearTo(target))
          {
            if(!hauler.fixMyRoad())
            {
              hauler.travelTo(target);
              return;
            }
          }
          else
          {
            let ret = hauler.transferEverything(target);
            if(ret === ERR_FULL)
            {
              return;
            }
            else if(ret === OK)
            {
              hauler.memory.full = false;
            }
          }
        }
      }
      else if (this.kernel.data.roomData[this.metaData.roomName].generalContainers.length)
      {
        let target = this.kernel.data.roomData[this.metaData.roomName].generalContainers[0];

        if(target)
        {
          if(!hauler.pos.inRangeTo(target, 1))
          {
            if(!hauler.fixMyRoad())
            {
              hauler.travelTo(target);
            }
          }

          if(hauler.transfer(target, RESOURCE_ENERGY) == ERR_FULL)
          {
            return;
          }
        }
      }
    }
    else
    {
      if(hauler.store.getUsedCapacity() > 0)
      {
        let terminal = Game.rooms[this.metaData.roomName].terminal;
        if(!hauler.pos.isNearTo(terminal))
          hauler.travelTo(terminal);
        else
          hauler.transferEverything(terminal);

        return;
      }

      if(!hauler.pos.inRangeTo(this.skFlag, 2))
        hauler.travelTo(this.skFlag, {range: 2});
    }
  }

  ////////////////////////////////////////////////////////////
  ///
  ///          Miner Action code.
  ///
  ////////////////////////////////////////////////////////////
  MinerActions(miner: Creep)
  {
    if(this.metaData.coreInSK)
    {
      const spawn = this.roomData().spawns[0];
      if(!miner.pos.isNearTo(spawn))
        miner.travelTo(spawn);
      else
      {
        if(!spawn.spawning)
          spawn.recycleCreep(miner);
      }

      miner.say('Suicide', true);
      return;
    }

    if(miner.name === 'sk-miner-E36S34-25852157')
      console.log(this.name, 'MinerActions', 1, this.metaData.minerHauler.length, this.metaData.minerHauler[0])
    const mineHauler = Game.creeps[this.metaData.minerHauler[0]];
    const mineral = this.roomInfo(this.skRoomName).mineral;
    if(!mineral)
    {
      //miner.suicide();
    }

    if(!miner.memory.fleePath)
    {
      let ret = PathFinder.search(miner.pos, {pos: mineral.pos, range: 7}, {flee: true});
      if(ret.path.length)
      {
        miner.memory.fleePath = ret.path;
      }
    }

    if(!this.invaders)
    {
      let lairs = mineral.room.find(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_KEEPER_LAIR});
      if(lairs.length)
      {
        let lair = mineral.pos.findClosestByRange(lairs) as StructureKeeperLair;
        let sk = lair.pos.findInRange(FIND_HOSTILE_CREEPS, 5);
        if(lair.ticksToSpawn < 20 || sk.length > 0)
        {
          let ret = PathFinder.search(miner.pos, {pos: mineral.pos, range: 6}, {flee: true});
          miner.moveByPath(ret.path);
          return;
        }
      }

      if(miner.name === 'sk-miner-E36S34-25852157')
      console.log(this.name, 'MinerActions', 2)
      console.log(this.name, 'Miner numbers', (miner.store.getUsedCapacity()), mineHauler?.store.getFreeCapacity(), miner.store.getUsedCapacity() > mineHauler?.store.getFreeCapacity())

      if(miner.name === 'sk-miner-E36S34-25852157')
      console.log(this.name, 'MinerActions', 3)

      if(_.sum(miner.carry) < miner.carryCapacity && mineral.mineralAmount > 0)
      {
        console.log(this.name, 'Miner numbers', 1);
        let extractor = <StructureExtractor[]>Game.rooms[this.skRoomName].find(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_EXTRACTOR});
        if(extractor[0] && miner.pos.inRangeTo(extractor[0], 1))
        {
          if(extractor[0].cooldown == 0)
          {
            miner.harvest(mineral);
          }

          if(miner.store.getUsedCapacity() > mineHauler?.store.getFreeCapacity())
          {
            console.log(this.name, 'Miner numbers', 4)
            if(mineHauler.pos.isNearTo(miner))
              miner.transferEverything(mineHauler);
          }
        }
        else
        {
          miner.travelTo(mineral);
        }
      }
      else if(_.sum(miner.carry) > 0 && miner.ticksToLive < this.metaData.miningDistance * 1.25)
      {
        console.log(this.name, 'Miner numbers', 2)
        let storage = Game.rooms[this.metaData.roomName].storage;
        if(storage)
        {
          if(!miner.pos.isNearTo(storage))
          {
            miner.travelTo(storage);
            return;
          }
          else
          {
            miner.transferEverything(storage);
            return;
          }
        }
      }
      else if(_.sum(miner.carry) >= miner.carryCapacity - miner.getActiveBodyparts(WORK))
      {
        console.log(this.name, 'Miner numbers', 3)
        if(mineHauler)
        {
          if(mineHauler.pos.isNearTo(miner))
          {
            miner.transferEverything(mineHauler);
          }
        }
      }
      else if(miner.store.getUsedCapacity() > mineHauler.store.getFreeCapacity())
      {
        console.log(this.name, 'Miner numbers', 4)
        if(mineHauler.pos.isNearTo(miner))
          miner.transferEverything(mineHauler);
      }
    }
    else
    {
      if(_.sum(miner.carry) > 0)
      {
        let storage = Game.rooms[this.metaData.roomName].storage;
        if(storage)
        {
          if(!miner.pos.isNearTo(storage))
          {
            miner.travelTo(storage);
            return;
          }
          else
          {
            miner.transferEverything(storage);
            return;
          }
        }
      }
      else
      {
        if(!miner.pos.isNearTo(this.skFlag))
        {
          miner.travelTo(this.skFlag);
        }
      }
    }
  }

  ////////////////////////////////////////////////////////////
  ///
  ///          Miner Hauler Action code.
  ///
  ////////////////////////////////////////////////////////////
  MinerHaulerActions(hauler: Creep, mineral: Mineral)
  {
    const miner = Game.creeps[this.metaData.miner[0]];

    if(this.metaData.coreInSK)
    {
      const spawn = this.roomData().spawns[0];
      if(!hauler.pos.isNearTo(spawn))
        hauler.travelTo(spawn);
      else
      {
        if(!spawn.spawning)
          spawn.recycleCreep(hauler);
      }

      hauler.say('Suicide', true);
      return;
    }

    if(!this.invaders)
    {
      let lairs = mineral.room.find(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_KEEPER_LAIR});
      if(lairs.length)
      {
        let lair = mineral.pos.findClosestByRange(lairs) as StructureKeeperLair;
        if(hauler.pos.inRangeTo(lair, 10))
        {
          let sk = lair.pos.findInRange(FIND_HOSTILE_CREEPS, 5);
          if(lair.ticksToSpawn < 20 || sk.length > 0)
          {
            let ret = PathFinder.search(hauler.pos, {pos: mineral.pos, range: 10}, {flee: true});
            hauler.moveByPath(ret.path);
            return;
          }
        }
      }

      if(_.sum(hauler.carry) === hauler.carryCapacity)
      {
        hauler.memory.filling = false;
      }


      let miner = Game.creeps[this.metaData.miner[0]];
      if(_.sum(hauler.carry) !== hauler.carryCapacity && mineral.mineralAmount >= 0 && hauler.memory.filling)
      {
        if(this.mineral.mineralAmount === 0)
        {
          let container = this.roomData().generalContainers[0];
          if(container)
          {
            if(!hauler.pos.inRangeTo(container, 0))
            {
              hauler.travelTo(container);
              return;
            }
            else
            {
              hauler.suicide();
              return;
            }
          }
        }

        if(miner && !hauler.pos.isNearTo(miner) && !hauler.memory.pickup)
        {
          hauler.travelTo(miner, {range: 1});
          return;
        }

        let tombStone = hauler.pos.findInRange(FIND_TOMBSTONES, 4, {filter: t => (t.store[this.mineral.mineralType] ?? 0) > 0 })[0]
        console.log(this.name, 'Min hauler tombstones', tombStone, this.mineral.mineralType, hauler.pos)
        if(tombStone)
        {
          if(hauler.pos.isNearTo(tombStone))
          {
            hauler.withdrawEverything(tombStone);
            return;
          }
          else
          {
            hauler.travelTo(tombStone);
            return;
          }
        }

        let dropped = hauler.pos.findInRange(FIND_DROPPED_RESOURCES, 6, {filter: t => (t.resourceType === this.mineral.mineralType) })[0];

        if(dropped)
        {
          hauler.memory.pickup = true;
          if(hauler.pos.isNearTo(dropped))
          {
            hauler.pickup(dropped);
            hauler.memory.pickup = false;
            return;
          }
          else
          {
            hauler.travelTo(dropped);
            return;
          }
        }

        if(_.sum(hauler.carry) === hauler.carryCapacity)
        {
          hauler.memory.filling = false;
        }
      }
      else if(_.sum(hauler.carry) > 0 && hauler.ticksToLive < this.metaData.miningDistance * 1.25)
      {
        let storage = Game.rooms[this.metaData.roomName].storage;
        if(storage)
        {
          if(!hauler.pos.isNearTo(storage))
          {
            hauler.travelTo(storage);
            return;
          }
          else
          {
            hauler.transferEverything(storage);
            return;
          }
        }
      }
      else if((_.sum(hauler.carry) === hauler.carryCapacity) || !hauler.memory.filling || (_.sum(hauler.carry) > 0 && mineral.mineralAmount === 0))
      {

        let storage = Game.rooms[this.metaData.roomName].storage;
        if(storage)
        {
          if(!hauler.pos.isNearTo(storage))
          {
            hauler.travelTo(storage);
            return;
          }
          else
          {
            hauler.transferEverything(storage);
            if(_.sum(hauler.carry) === 0)
            {
              hauler.memory.filling = true;
            }
            return;
          }
        }
      }
    }
    else
    {
      if(_.sum(hauler.carry) > 0)
      {
        let storage = Game.rooms[this.metaData.roomName].storage;
        if(storage)
        {
          if(!hauler.pos.isNearTo(storage))
          {
            hauler.travelTo(storage);
            return;
          }
          else
          {
            hauler.transferEverything(storage);
            return;
          }
        }
      }
      else
      {
        if(!hauler.pos.isNearTo(this.skFlag))
        {
          hauler.travelTo(this.skFlag);
        }
      }
    }
  }

  coreSearching()
  {
    try
    {
      if(this.name === 'skrmp-E45S56')
        console.log(this.name, 'coresearching', 1)
      if(this.skRoom)
      {
        if(this.name === 'skrmp-E45S56')
        console.log(this.name, 'coresearching', 2)
        const cores = this.skRoom.find(FIND_HOSTILE_STRUCTURES, {filter: s=> s.structureType === STRUCTURE_INVADER_CORE});
        if(cores.length)
        {

          const core = cores[0] as StructureInvaderCore;
          if(this.name === 'skrmp-E45S56')
          console.log(this.name, 'coresearching', 3, core.ticksToDeploy)
          if(core?.ticksToDeploy < 300)
          {
            console.log(this.name, 'Core WTF');
            this.metaData.coreInSK = true;
            Game.notify("Found Core in skroom " + this.skRoomName + " going active in " + 300 + " " + Game.time);
            if(core.level <= 3)
            {
              this.kernel.addProcessIfNotExist(StrongHoldDestructionProcess, 'shdp' + this.skRoomName, 35,
              {
                roomName: this.skRoomName,
                spawnRoomName: this.metaData.roomName,
                coreId: core.id,
              });
            }
          }

          if(core?.level <= 3 && !core?.ticksToDeploy)
          {
            console.log(this.name, 'Core WTF 1');
            this.metaData.coreInSK = true;
            this.kernel.addProcessIfNotExist(StrongHoldDestructionProcess, 'shdp' + this.skRoomName, 35,
              {
                roomName: this.skRoomName,
                spawnRoomName: this.metaData.roomName,
                coreId: core.id,
              });
            Game.notify("Found core in skroom" + this.skRoomName + " Time to kill it");
          }
          console.log(this.name, 'Found a core', core.id, core.ticksToDeploy, !core.ticksToDeploy, core.effects, (core.effects[EFFECT_COLLAPSE_TIMER]?.ticksRemaining ?? 0));
        }
        else
          this.metaData.coreInSK = false;

        //if(Game.time % 1000 > 0 && Game.time % 1000 < 9)
        if(this.skRoomName === 'E46S46')
        {
          const observer = this.roomInfo(this.metaData.roomName).observer;
          if(observer)
          {
            const roomNames = this.findSkRooms(this.metaData.skRoomName);
            if(this.metaData.scanIndex === roomNames.length)
              this.metaData.scanIndex = 0;
            observer.observeRoom(roomNames[this.metaData.scanIndex]);
            console.log(this.name, 'Observation', observer.room.name);

            let prevIndex = this.metaData.scanIndex - 1;
            if(prevIndex < 0)
              prevIndex = roomNames.length - 1;
            const obRoom = Game.rooms[roomNames[prevIndex]];

            console.log(this.name, roomNames[this.metaData.scanIndex], this.metaData.scanIndex, roomNames[prevIndex], prevIndex)
            if(obRoom)
            {
              console.log(this.name, obRoom.name);
              const cores = obRoom.find(FIND_HOSTILE_STRUCTURES, {filter: s => s.structureType === STRUCTURE_INVADER_CORE});
              if(cores.length)
              {
                const core = cores[0] as StructureInvaderCore;
                console.log(this.name, 'Cores', obRoom.name, 'Tickts', core.ticksToDeploy);
                if((core?.ticksToDeploy ?? 0) < 150 && core?.level < 3)
                {
                  this.skFlag.memory.attackingCore = true;
                  this.kernel.addProcessIfNotExist(StrongHoldDestructionProcess, 'shdp' + this.skRoomName, 35,
                  {
                    roomName: obRoom.name,
                    spawnRoomName: this.metaData.roomName,
                    coreId: core.id,
                  });
                  Game.notify("Found core in skroom" + this.skRoomName + " Time to kill it");
                }

            //     console.log(this.name, 'Found core but wont start', core.id)
              }
            //   console.log(this.name, 'Observing room', obRoom.name);
            }
            else
              console.log(this.name, 'Not observing', roomNames[prevIndex], prevIndex, this.metaData.scanIndex);

            this.metaData.scanIndex++;
          }
          else
          {
            console.log(this.name, 'No Observer problem here');
          }
        }
      }
    }
    catch(error)
    {
      console.log(this.name, "Core Searching: ", error);
    }
  }

  findSkRooms(roomName: string)
  {
    let roomNames = [];
    let roomCoord = WorldMap.getRoomCoordinates(roomName);
    let skX: number;

    let xDigit = Math.floor(roomCoord.x / 10) * 10 + 4;
    let yDigit = Math.floor(roomCoord.y / 10) * 10 + 4;

    for(let i = xDigit; i <= xDigit + 2; i++)
    {
      for(let j = yDigit; j <= yDigit + 2; j++)
      {
        let x = i;
        let xDir = roomCoord.xDir;
        let y = j;
        let yDir = roomCoord.yDir;

        let name = xDir + x + yDir + y;

        roomNames.push(name);
      }
    }

    return roomNames;
  }

  clearFlags(roomName: string)
  {
    const room = Game.rooms[roomName];
    let flags = room.find(FIND_FLAGS, {filter: f => f.color === COLOR_PURPLE && f.secondaryColor === COLOR_YELLOW});
    flags.forEach(f => f.remove());
  }

  LeaderAttackActions(creep: Creep)
  {
    let strSay = '';
    if(!creep.memory.boost)
    {
      creep.boostRequest([RESOURCE_LEMERGIUM_OXIDE, RESOURCE_KEANIUM_OXIDE], false);
      return;
    }

    const follower = Game.creeps[this.metaData.devils[1]];

    if(follower)
    {
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
        console.log(this.name, 'LA', 2, this.skRoomName)
        if(creep.pos.roomName === this.skRoomName)
        {
          // Attack Invaders
          const invaders = creep.room.find(FIND_HOSTILE_CREEPS, {
            filter: c => c.owner.username === 'Invader'
          });
          let target: Creep;
          //Find healers
          const healers = _.filter(invaders, (i) =>{
            return i.getActiveBodyparts(HEAL) > 0;
          });

          let rangers = _.filter(invaders, (i) => {
            return i.getActiveBodyparts(RANGED_ATTACK) > 0;
          });

          if(healers.length > 3 && rangers.length)
          {
            target = creep.pos.findClosestByRange(rangers);
          }
          else if(healers.length)
          {
            target = creep.pos.findClosestByRange(healers);
          }
          else
          {
            if(rangers.length)
            {
              target = creep.pos.findClosestByRange(rangers);
            }
            else
            {
              target = creep.pos.findClosestByRange(invaders);
            }
          }

          if(target)
          {
            creep.memory.target = target.id;
            let strSay = '';
            let numberInRange = creep.pos.findInRange(invaders, 3);
            //if(boostedHealers.length)
            {
              if(!creep.pos.isNearTo(target))
              {
                if(numberInRange.length > 1)
                {
                  strSay += 'BMA';
                  creep.rangedMassAttack();
                }
                else
                {
                  strSay += 'BRA';
                  creep.rangedAttack(target);
                }

                  strSay += 'BH';
                  creep.heal(creep);
              }
              else
              {
                strSay += 'BARA';
                creep.attack(target);
                creep.rangedAttack(target);
              }

              creep.say(strSay, true);
              creep.travelTo(target, {movingTarget: true});
              return;
            }
          }
//          return;
        }
        else
        {
          console.log(this.name, 'LA', 3)
          creep.travelTo(new RoomPosition(25, 25, this.skRoomName));
          return;
        }
      }
      else
      {

      creep.rangedMassAttack();
      creep.heal(creep);
      creep.travelTo(follower, {movingTarget: true});
      }

    }
  }

  private FollowerAttackActions(creep: Creep)
  {
    let strSay = '';
    if(!creep.memory.boost)
    {
      creep.boostRequest([RESOURCE_LEMERGIUM_OXIDE, RESOURCE_KEANIUM_OXIDE], false);
      return;
    }

    if(!this.invaders)
    {
      const centerFlag = Game.flags['Center-'+this.metaData.roomName];
      if(!creep.pos.inRangeTo(centerFlag, 5))
        creep.travelTo(centerFlag, {range: 5});
      else
      {
        const spawns = this.roomData().spawns.filter(s => !s.spawning)
        if(spawns.length)
        {
          const spawn = spawns[0];
          if(!creep.pos.isNearTo(spawn))
            creep.travelTo(spawn);
          else
            spawn.recycleCreep(creep);
        }
      }

      return;
    }

    const leader = Game.creeps[this.metaData.devils[0]];


    if(leader.pos.inRangeTo(creep, 1))
    {
      const dir = creep.pos.getDirectionTo(leader);
      creep.move(dir);
    }
    else
      creep.travelTo(leader, {movingTarget: true});



    console.log(this.name, 'FA', 1)
    if(creep.pos.roomName === leader.pos.roomName &&
      creep.pos.inRangeTo(leader, 3))
    {
      console.log(this.name, 'FA', 2)
      if(creep.hits < creep.hitsMax)
      {
        console.log(this.name, 'FA', 3)
        strSay += '⛑S';
        creep.heal(creep);
      }
      else
      {
        console.log(this.name, 'FA', 4)
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
    else
    {
      strSay += '⛑S';
      creep.heal(creep);
    }

    console.log(this.name, 'FA', 5, creep.memory.atPlace, this.metaData.logginCount, Game.time)
    if(this.metaData.logginCount === 0)
      this.metaData.logginCount = Game.time;

    if(leader.memory.target )
    {
      const target = Game.getObjectById(leader.memory.target) as Creep;

      if(this.metaData.logginCount < Game.time - 5)
      {
        if(target.hits > target.hitsMax * .75)
          creep.memory.atPlace = true;
      }
      console.log(this.name, 'FA', 6, target)
      if(creep.pos.inRangeTo(target, 3))
      {
        strSay += 'Ra';
        creep.rangedAttack(target);
      }
      else
      {
        strSay += 'Ma';
        creep.rangedMassAttack();
      }

      if(creep.pos.isNearTo(target))
      {
        strSay += 'A';
        creep.attack(target);
      }
    }
    else
    {
      console.log(this.name, 'FA', 7)
      let target: Creep;
      if(!creep.memory.target)
      {
        console.log(this.name, 'FA', 8)
        let invaders = creep.room.find(FIND_HOSTILE_CREEPS, {
          filter: c => c.owner.username === 'Invader'
        });

        if(invaders.length)
        {
          //Find healers
          let healers = _.filter(invaders, (i) =>{
            return i.getActiveBodyparts(HEAL) > 0;
          });

          if(healers.length)
          {
            target = creep.pos.findClosestByRange(healers);
            if(target.id === leader.memory.target)
            {
              const index = healers.indexOf(target, 0);
              if(index > -1)
                healers.splice(index, 1);

              target = creep.pos.findClosestByRange(healers);
            }

            creep.memory.target = target.id;
          }
        }
      }
      else
      {
        console.log(this.name, 'FA', 9)
        target = Game.getObjectById(creep.memory.target) as Creep;
        if(!creep.pos.isNearTo(target))
          creep.travelTo(target);
        else
        {
          creep.attack(target);
          creep.rangedMassAttack();
        }
      }
    }

    creep.say(strSay, true);
  }
}
///////////////////////////////////////////////////////////
/// E14S36
// Gaurd 25M, 17A, 5H1, 3RT1
// Harvester 12W, 6M, 1C
// Hauler 2W, 11M, 20C
// Home Defender 25M, 11A, 11RA, 1C, 2H
//_.forEach(Game.rooms, (r)=> console.log(r.name, r.find(FIND_CONSTRUCTION_SITES).length)
//_.forEach(Game.rooms, (r)=> r.find(FIND_CONSTRUCTION_SITES).length > 0 ? console.log(r.name, r.find(FIND_CONSTRUCTION_SITES).length) : 0)
