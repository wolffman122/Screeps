import { Process } from "os/process";
import { Utils } from "lib/utils";
import { HoldBuilderLifetimeProcess } from "../empireActions/lifetimes/holderBuilder";
import { MoveProcess } from "../creepActions/move";
import { WorldMap } from "lib/WorldMap";
import { Traveler } from "lib/Traveler";

export class skRoomManagementProcess extends Process
{
    type = 'skrmp';
    metaData: SKRoomManagementProcessMetaData;

    mineralMining: boolean;
    skFlag: Flag;
    scout?: Creep;
    skRoomName: string;
    locations: {
        [type: string]: string[]
    };
    lairs: StructureKeeperLair[];
    sources: Source[];
    invaders: boolean;
    mineral: Mineral;


    ensureMetaData()
    {
      this.mineralMining = this.metaData.mineralMining;
      this.invaders = this.metaData.invaders;
        this.skRoomName = this.metaData.skRoomName
        this.scout = this.metaData.scoutName ? Game.creeps[this.metaData.scoutName] : undefined;
        if(!this.scout && this.metaData.scoutName)
        {
            delete Memory.creeps[this.metaData.scoutName];
            this.metaData.scoutName = undefined;
        }


        if(this.metaData.locations)
        {
            this.locations = this.metaData.locations;

            if(!this.lairs)
            {
                this.lairs = [];
                _.forEach(this.locations['lairs'], (l: string)=>{
                    let lair = Game.getObjectById(l) as StructureKeeperLair;
                    if(lair)
                    {
                        this.lairs.push(lair);
                    }
                });
            }

            if(!this.sources)
            {
                this.sources = [];
                _.forEach(this.locations['sources'], (s) => {
                    let source = Game.getObjectById(s) as Source;
                    if(source)
                    {
                        this.sources.push(source);
                    }
                })
            }
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
      if(Game.cpu.bucket < 8000)
        return;
      let centerFlag = Game.flags['Center-'+this.metaData.roomName];

      this.skFlag = Game.flags[this.metaData.flagName];
      if(!this.skFlag)
      {
          this.completed = true;
          Memory.flags[this.metaData.flagName] = undefined;
          Memory.rooms[this.metaData.roomName].skSourceRoom = undefined;
          return;
      }

      this.coreSearching(centerFlag);

      let coreInSk = false;
      if(this.metaData.coreInfo?.invaderCorePresent)
      {

        let testRoomName = this.metaData.coreInfo.coreFlagName.split('-')[0];
        if(this.metaData.skRoomName === testRoomName)
          coreInSk = true;
      }

      if(this.skFlag.room.memory.skSourceRoom === undefined)
      {
        this.skFlag.room.memory.skSourceRoom = true;
      }

      this.ensureMetaData();

      console.log(this.name, coreInSk);
      if(!this.metaData.vision && !coreInSk)
      {
        if(!this.metaData.locations || Object.keys(this.metaData.locations).length === 0)
        {
          //Make a scout
          /////////////////////////////////////////////////////////////////////////////////
          //
          // Need to figure out how to clear out the memory for this creep
          //
          /////////////////////////////////////////////////////////////////////////////////

          if(!this.scout)
          {
            let creepName = this.metaData.skRoomName + '-scout-' + Game.time;
            let spawned = Utils.spawn(
              this.kernel,
              this.metaData.roomName,
              'vision',
              creepName,
              {}
            )

            if(spawned)
            {
              this.metaData.scoutName = creepName;
            }
          }
          else
          {
            if(this.scout.room.name !== this.metaData.skRoomName)
            {
              this.scout.travelTo(new RoomPosition(25,25, this.skRoomName), {range: 20});
              return;
            }
            else
            {
              this.scout.travelTo(new RoomPosition(25,25, this.scout.room.name), {range: 22});
              /////////////////////////////////////////////////////////////////////////////////
              //
              // Need to add Flee code here to scout from a safe distance
              //
              /////////////////////////////////////////////////////////////////////////////////

              // Get room data
              if(!this.locations)
              {
                this.locations = {};

                let sources = this.scout.room.find(FIND_SOURCES);
                if(!this.locations['sources'])
                {
                  this.locations['sources'] = [];
                }

                _.forEach(sources, (s) =>{
                  this.locations['sources'].push(s.id);
                })


                if(!this.locations['minerals'])
                {
                  this.locations['minerals'] = [];
                }

                let minerals = this.scout.room.find(FIND_MINERALS);
                _.forEach(minerals, (m) => {
                  this.locations['minerals'].push(m.id);
                })

                let skLair = this.scout.room.find(FIND_STRUCTURES);
                skLair = _.filter(skLair, (sk) => {
                  return (sk.structureType === STRUCTURE_KEEPER_LAIR);
                });

                if(!this.locations['lairs'])
                {
                  this.locations['lairs'] = [];
                }
                _.forEach(skLair, (sk)=> {
                  this.locations['lairs'].push(sk.id);
                });

                if(this.locations !== this.metaData.locations)
                {
                  this.metaData.locations = this.locations;
                }
              }
            }
          }
        }
        else
        {
          ////////////////////////////////////////////////////////////
          ///
          ///          Check For Invaders
          ///
          ////////////////////////////////////////////////////////////
          try
          {
            if(Game.time % 25 === 5)
            {
              let room = Game.rooms[this.metaData.skRoomName];
              if(room)
              {
                let hostiles = room.find(FIND_HOSTILE_CREEPS);
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
                  this.invaders = false;
                }
              }
            }
          }
          catch( error )
          {
            console.log(this.name, error);
          }


          console.log(this.name, 1);
          ////////////////////////////////////////////////////////////
          ///
          ///          Devil Spawn Code
          ///
          ////////////////////////////////////////////////////////////
          this.metaData.devils = Utils.clearDeadCreeps(this.metaData.devils);
          let count = Utils.creepPreSpawnCount(this.metaData.devils);           // TODO: Want to pass in extra prespawn time

          if(count < 1)
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

          for(let i = 0; i < this.metaData.devils.length; i++)
          {
            let devil = Game.creeps[this.metaData.devils[i]];
            if(devil)
            {
              // Time to do some stuff
              this.DevilActions(devil);
            }
          }


          if(!this.invaders) // ADD to check for enemies here if they are present and no devil then flee.
          {
            console.log(this.name, 2, this.skRoomName, this.roomInfo(this.skRoomName));
            /////////////////////////////////////////////////////////////
            ///
            ///          Builder Spawn Code
            ///
            ////////////////////////////////////////////////////////////

            this.metaData.builderCreeps = Utils.clearDeadCreeps(this.metaData.builderCreeps);
            if(this.roomInfo(this.skRoomName))
            {
              if(this.roomInfo(this.skRoomName).sourceContainers.length < this.roomInfo(this.skRoomName).sources.length)
              {
                console.log(this.name, 3);
                if(this.metaData.builderCreeps.length < 2)
                {
                  console.log(this.name, 4);
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
                console.log('Provlem 2', this.metaData.builderCreeps.length)
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

            for(let i = 0; i < this.metaData.builderCreeps.length; i++)
            {
              let builder = Game.creeps[this.metaData.builderCreeps[i]];
              if(builder)
              {
                this.BuilderActions(builder);
              }
            }

            ////////////////////////////////////////////////////////////
            ///
            ///          Harvester Spawn Code
            ///
            ////////////////////////////////////////////////////////////
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
                let creeps = Utils.inflateCreeps(creepNames)

                let count = 0;
                _.forEach(creeps, (c) => {
                  let  ticksNeeded = c.body.length * 3;
                  if(!c.ticksToLive || c.ticksToLive > ticksNeeded) { count++; }
                });


                if(this.metaData.harvestCreeps[s.id].length < 1)
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

                for(let i = 0; i < this.metaData.harvestCreeps[s.id].length; i++)
                {
                  let harvester = Game.creeps[this.metaData.harvestCreeps[s.id][i]];
                  if(harvester)
                  {
                    this.HarvesterActions(harvester, s);
                  }
                }
              });
            }


            ////////////////////////////////////////////////////////////
            ///
            ///          Hauling Spawn Code
            ///
            ////////////////////////////////////////////////////////////
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
                        let ret = PathFinder.search(centerFlag.pos, source.pos, {
                            plainCost: 2,
                            swampCost: 10,
                        });

                        this.metaData.distroDistance[source.id] = ret.path.length;
                    }

                    let creepNames = Utils.clearDeadCreeps(this.metaData.distroCreeps[source.id]);
                    this.metaData.distroCreeps[source.id] = creepNames;
                    let creeps = Utils.inflateCreeps(creepNames);

                    let count = 0;
                    _.forEach(creeps, (c) => {
                        let ticksNeeded = c.body.length * 3 + this.metaData.distroDistance[source.id];
                        if(!c.ticksToLive || c.ticksToLive > ticksNeeded) { count++; }
                    });

                    let numberDistro = 1;
                    if(this.metaData.distroDistance[source.id] > 55)
                    {
                        numberDistro = 2;
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

            let room = Game.rooms[this.skRoomName];
            if(room)
            {
              //console.log(this.name, 'SK mining find flag');
              let flag =  room.find(FIND_FLAGS)[0];
              if(flag)
              {
                //if(room.name === 'E44S54')
                  //console.log(this.name, 'Mining', 1, this.mineralMining)
                if(!this.mineralMining)
                {
                 // console.log(this.name, 'SK mining', this.mineralMining);

                  let name = flag.name.split('-')[0];
                  //console.log(this.name, 'Flag check', name, flag);
                  if(flag && name === 'Mining')
                  {
                    this.metaData.miningFlag = flag.name;
                    this.metaData.mineralMining = true;
                    this.mineralMining = true;
                  }
                }
                //if(room.name === 'E44S54')
                  //console.log(this.name, 'Mining', 2)
              }
              else
              {
                this.metaData.miningFlag = undefined;
                this.metaData.mineralMining = false;
                this.mineralMining = false;
              }
            }

            if(this.metaData.mineralMining)
            {
              ////////////////////////////////////////////////////////////
              ///
              ///          Mining Spawn Code
              ///
              ////////////////////////////////////////////////////////////
              if(this.roomInfo(this.skRoomName))
              {
                this.mineral = this.roomInfo(this.skRoomName).mineral;
                let terminal = Game.rooms[this.metaData.roomName].terminal;
                // Check if terminal has capacity
                //console.log(this.name, 'Mining prob', this.mineral.mineralAmount <= (terminal.storeCapacity -_.sum(terminal.store)))
                if(terminal && (this.mineral.mineralAmount <= (terminal.storeCapacity -_.sum(terminal.store))))
                {
                  if(this.skFlag.memory.skMineral === undefined)
                  {
                    this.skFlag.memory.skMineral = this.mineral.id;
                  }

                  if(this.metaData.miningDistance === undefined)
                  {
                    let ret = PathFinder.search(centerFlag.pos, this.mineral.pos, {
                      plainCost: 2,
                      swampCost: 10,
                    });

                    this.metaData.miningDistance = ret.path.length;
                  }

                  this.metaData.miner = Utils.clearDeadCreeps(this.metaData.miner);
                  //console.log(this.name, 'Mineral', this.metaData.miner.length, this.mineral.mineralAmount, this.metaData.miner[0])
                  if(this.metaData.miner.length < 1 && this.mineral.mineralAmount > 0)
                  {
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

                  ////////////////////////////////////////////////////////////
                  ///
                  ///          Mine Hauler Spawn Code
                  ///
                  ////////////////////////////////////////////////////////////
                  this.metaData.minerHauler = Utils.clearDeadCreeps(this.metaData.minerHauler);

                  if(this.metaData.minerHauler.length < 1 && this.metaData.miner.length === 1)
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

              for(let i = 0; i < this.metaData.miner.length; i++)
                {
                  let miner = Game.creeps[this.metaData.miner[i]];
                  if(miner)
                  {
                    this.MinerActions(miner);
                  }
                }

                for(let i = 0; i < this.metaData.minerHauler.length; i++)
                {
                  let hauler = Game.creeps[this.metaData.minerHauler[i]];
                  if(hauler)
                  {
                    this.MinerHaulerActions(hauler, this.mineral);
                  }
                }
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
      try
      {
        if(devil.name === 'E44S55-devil-19274309')
          console.log('Devil Problems', 1)
        if(!devil.memory.boost)
        {
          if(devil.name === 'E55S46-devil-21587178')
          console.log('Devil Problems', 2)
          devil.boostRequest([RESOURCE_LEMERGIUM_OXIDE, RESOURCE_KEANIUM_OXIDE], false);
          return;
        }
        if(devil.name === 'E44S55-devil-19274309')
          console.log('Devil Problems', 3)
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

            console.log(this.name, 'Invaders', invaders.length);

            if(invaders.length)
            {
              let target: Creep;
              //Find healers
              let healers = _.filter(invaders, (i) =>{
                return i.getActiveBodyparts(HEAL) > 0;
              });

              if(healers.length)
              {
                target = devil.pos.findClosestByRange(healers);
              }
              else
              {
                let rangers = _.filter(invaders, (i) => {
                  return i.getActiveBodyparts(RANGED_ATTACK) > 0;
                });

                if(rangers.length)
                {
                  target = devil.pos.findClosestByRange(rangers);
                }
                else
                {
                  target = devil.pos.findClosestByRange(invaders);
                }
              }

              if(target)
              {
                let numberInRange = devil.pos.findInRange(FIND_HOSTILE_CREEPS, 3);
                if(numberInRange.length > 1)
                {
                  if(devil.pos.inRangeTo(target, 3))
                  {
                    devil.rangedAttack(target);
                  }
                  else if(devil.pos.inRangeTo(target, 1))
                  {
                    devil.rangedMassAttack();
                    devil.attack(target);
                  }

                }
                else if(numberInRange.length == 1)
                {
                  devil.rangedAttack(target);
                }

                if(devil.pos.isNearTo(target))
                {
                  devil.attack(target);
                }
                else
                {
                  devil.heal(devil);
                }

                devil.travelTo(target);
                return;
              }
              return;
            }
          }
          else
          {
            if(this.name === 'skrmp-E45S54')
              console.log(this.name, 'mineralMining', this.metaData.mineralMining);
            if(!devil.memory.target)    // Find a target name
            {
              let sourceKeepers: StructureKeeperLair[] = [];
              if(this.metaData.mineralMining)
              {
                sourceKeepers = _.filter(this.lairs, (l) => {
                  return (l.pos.findInRange(FIND_HOSTILE_CREEPS, 5).length);
                });
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
                    let damaged = devil.pos.findInRange(FIND_CREEPS, 10, {
                      filter: c => c.my && c.hits < c.hitsMax && c.getActiveBodyparts(WORK) === 9
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
                        devil.travelTo(target, {maxRooms: 1, roomCallback:(roomName, matrix)=>{
                          let room = Game.rooms[roomName];
                          if(room)
                          {
                              room.find(FIND_EXIT).forEach(exit=>matrix.set(exit.x, exit.y, 0xff))
                          }

                          return matrix;
                      }
                      });
                      }
                      return;
                    }
                  }

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
                        let healTarget = devil.pos.findInRange(damCreeps, 3)[0];
                        if(healTarget)
                        {
                          if(devil.pos.isNearTo(healTarget))
                            devil.heal(healTarget);
                          else
                            devil.rangedHeal(healTarget);
                        }
                      }
                    }
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
      catch (error)
      {
        console.log(this.name, error)
      }
    }

    ////////////////////////////////////////////////////////////
    ///
    ///          Builder Actions
    ///
    ////////////////////////////////////////////////////////////
    BuilderActions(builder: Creep)
    {
      try
      {
        if(builder.pos.roomName !== this.skRoomName)
        {
          builder.travelTo(new RoomPosition(25, 25, this.skRoomName));
          builder.memory.filling = true
        }
        else
        {
          if(!this.invaders)
          {
            let enemies = builder.pos.findInRange(FIND_HOSTILE_CREEPS, 5);
            if(enemies.length === 0)
            {
              if(builder.name === 'sk-build-E46S46-21111334')
                console.log(this.name, 1)
              //////////// Fill up the builder ///////////////////////
              if(_.sum(builder.carry) != builder.carryCapacity && builder.memory.filling)
              {
                if(builder.name === 'sk-build-E46S46-21111334')
                console.log(this.name, 2)
                if(this.roomInfo(this.skRoomName).containers.length > 0)
                {
                  let tombStone = builder.pos.findInRange(FIND_TOMBSTONES, 4)[0]

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

                  let resources = builder.pos.findInRange(FIND_DROPPED_RESOURCES, 4)[0] as Resource;

                  if(resources && resources.resourceType === RESOURCE_ENERGY && resources.amount)
                  {
                    if(builder.pos.isNearTo(resources))
                    {
                      builder.pickup(resources);
                      builder.memory.filling = false;
                    }

                    builder.travelTo(resources);
                    return;
                  }

                  let targets = _.filter(this.kernel.data.roomData[builder.room.name].containers, (c: StructureContainer) => {
                    return (c.store.energy > 0);
                  })

                  if(targets.length)
                  {
                    let target = builder.pos.findClosestByPath(targets);

                    if(target)
                    {
                      if(!builder.pos.inRangeTo(target, 1))
                      {
                        builder.travelTo(target, {range: 1});
                        return;
                      }

                      if(builder.withdraw(target, RESOURCE_ENERGY) == OK)
                      {
                        builder.memory.filling = false;
                      }
                      return;
                    }
                  }
                  else
                  {
                    let source = builder.pos.findClosestByRange(this.kernel.data.roomData[builder.pos.roomName].sources);

                    if(source)
                    {
                      if(!builder.pos.inRangeTo(source, 1))
                      {
                        builder.travelTo(source, {range: 1});
                        return;
                      }

                      if(builder.pos.inRangeTo(source, 1))
                      {
                        let sites = builder.room.find(FIND_CONSTRUCTION_SITES);
                        if(sites.length > 0)
                        {
                            let site = _.filter(sites, (s) => {
                              if(s.structureType == STRUCTURE_CONTAINER && s.pos.inRangeTo(source, 1))
                              {
                                return s;
                              }
                              return;
                            });
                          return;
                        }
                      }
                    }
                  }
                }
                else
                {
                  if(builder.name === 'sk-build-E46S46-21111334')
                console.log(this.name, 3)
                  if(this.roomInfo(this.skRoomName).sources)
                  {
                      let source = builder.pos.findClosestByRange( this.kernel.data.roomData[builder.pos.roomName].sources);

                      if(source)
                      {
                        if(builder.name === 'sk-build-E46S46-21111334')
                console.log(this.name, 4)
                        if(this.roomInfo(this.skRoomName).containers.length > 0 && this.roomInfo(this.skRoomName).skSourceContainerMaps[source.id])
                        {
                          if(this.roomInfo(this.skRoomName).skSourceContainerMaps[source.id].lair.ticksToSpawn < 7)
                          {
                            if(builder.pos.getRangeTo(source) < 5)
                            {
                              let dir = builder.pos.getDirectionTo(source) as number;
                              dir = dir + 4;
                              if(dir > 7)
                              {
                                dir = dir % 7;
                              }

                              builder.move(dir as DirectionConstant);
                            }
                            else
                            {
                              builder.say('Fleeing');
                            }
                            return;
                          }
                        }

                        if(builder.name === 'sk-build-E46S46-21111334')
                console.log(this.name, 5)
                        if(!builder.pos.inRangeTo(source, 1))
                        {
                          let stones =  source.pos.findInRange(FIND_TOMBSTONES, 4);
                          if(stones.length > 0 && stones[0].store.energy > builder.carryCapacity)
                          {

                            if(builder.pos.isNearTo(stones[0]))
                            {
                              builder.withdraw(stones[0], RESOURCE_ENERGY);
                              builder.memory.filling = false;
                              return;
                            }
                            else
                            {
                              builder.travelTo(stones[0]);
                              return;
                            }
                          }

                          let dropped = source.pos.findInRange(FIND_DROPPED_RESOURCES, 4);
                          if(dropped.length > 0)
                          {
                            if(builder.pos.isNearTo(dropped[0]))
                            {
                              if(dropped[0].amount >= builder.carryCapacity)
                              {
                                builder.memory.filling = false;
                                builder.pickup(dropped[0])
                                return;
                              }
                              else if(_.sum(builder.carry) > 0)
                              {
                                builder.memory.filling = false;
                              }
                            }
                            else
                            {
                              builder.travelTo(dropped[0]);
                              return;
                            }
                          }

                          //console.log(this.name, 'open spots', source.pos.openAdjacentSpots(false).length);
                          if(source.pos.openAdjacentSpots(false).length == 0)
                          {
                            let sources = this.kernel.data.roomData[builder.pos.roomName].sources;
                            _.remove(sources, (s) => {
                              return s.id === source.id;
                            });
                            source = builder.pos.findClosestByRange(sources);
                          }


                          builder.travelTo(source);
                          return;
                        }

                        if(builder.pos.inRangeTo(source, 1))
                        {
                          let sites = builder.room.find(FIND_CONSTRUCTION_SITES);
                          if(sites.length > 0)
                          {
                              let site = _.filter(sites, (s) => {
                                  if(s.structureType == STRUCTURE_CONTAINER && s.pos.inRangeTo(source, 1))
                                  {
                                      return s;
                                  }
                                  return;
                              });

                              if(builder.pos.isNearTo(source))
                              {
                                  if(_.sum(builder.carry) >= (builder.carryCapacity - builder.getActiveBodyparts(WORK) * HARVEST_POWER))
                                  {
                                    builder.memory.filling = false;
                                  }
                                  builder.harvest(source);

                              }
                              else
                              {
                                  builder.travelTo(source);
                              }

                        }

                        if(builder.pos.isNearTo(source))
                        {
                          builder.harvest(source);
                        }
                        else
                        {
                            builder.travelTo(source);
                        }

                      }
                    }
                  }
                }
              }

              ///////////// Have the builder Build. ///////////////////////
              if(_.sum(builder.carry) === builder.carryCapacity || !builder.memory.filling)
              {
                //////////// SK Checking ///////////////////////
                let source = builder.pos.findClosestByRange( this.kernel.data.roomData[builder.pos.roomName].sources);
                if(source)
                {
                  if(this.roomInfo(this.skRoomName).skSourceContainerMaps[source.id])
                  {
                    if(this.roomInfo(this.skRoomName).containers.length > 0)
                    {
                      if(this.roomInfo(this.skRoomName).skSourceContainerMaps[source.id].lair.ticksToSpawn < 7)
                      {
                        if(builder.pos.getRangeTo(source) < 5)
                        {
                          let dir = builder.pos.getDirectionTo(source) as number;
                          dir = dir + 4;
                          if(dir > 7)
                          {
                            dir = dir % 7;
                          }

                          builder.move(dir as DirectionConstant);
                        }
                        else
                        {
                          builder.say('Fleeing');
                        }
                        return;
                      }
                    }
                  }
                }

                //////////// Check for Container Repair ///////////////////////
                let containers = this.roomInfo(this.skRoomName).containers;
                containers = _.filter(containers, (c) => {
                  return c.hits < (c.hitsMax / 2);
                });

                if(containers.length)
                {
                  let target = builder.pos.findClosestByPath(containers);
                  if(builder.pos.inRangeTo(target, 3))
                  {
                    builder.repair(target);
                  }

                  builder.travelTo(target, {range: 3});
                  return;
                }

                ///////////// Site Building ///////////////////////
                let sites = _.filter(this.kernel.data.roomData[builder.pos.roomName].constructionSites, (cs) => {
                    return (cs.my);
                })
                let target = builder.pos.findClosestByRange(sites);

                if(target)
                {
                  if(builder.pos.inRangeTo(target, 3))
                  {
                    let ret = builder.build(target);
                    //console.log('Builder issue', _.sum(builder.carry), builder.memory.filling)
                    if(_.sum(builder.carry) === 0)
                    {
                      //console.log('Builder should not be in here');
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
                {
                  //////////// Find places to put container construction sites ///////////////////////
                  let sources = this.roomInfo(this.skRoomName).sources;
                  let skSourceContainersMaps = this.roomInfo(this.skRoomName).skSourceContainerMaps;

                  if(sources.length)
                  {
                    let missingConatiners = _.filter(sources, (s) => {
                      return (!skSourceContainersMaps[s.id] || !skSourceContainersMaps[s.id].container)
                    });

                    if(missingConatiners.length)
                    {
                      let closestContainer = builder.pos.findClosestByPath(missingConatiners);
                      let openSpaces = closestContainer.pos.openAdjacentSpots(true);
                      if(openSpaces.length)
                      {
                        let openSpace = openSpaces[0];
                        missingConatiners[0].room.createConstructionSite(openSpace.x, openSpace.y, STRUCTURE_CONTAINER);
                      }
                    }
                  }
                }
              }
            }
          }
          else
          {
            builder.travelTo(this.skFlag);
          }
        }
      }
      catch (error)
      {
        console.log(this.name, error)
      }
    }

    ////////////////////////////////////////////////////////////
    ///
    ///          Harvester Action code.
    ///
    ////////////////////////////////////////////////////////////
    HarvesterActions(harvester: Creep, source: Source)
    {
      try
      {
        if(!harvester.memory.fleePath)
        {
          let sk = source.pos.findClosestByRange(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_KEEPER_LAIR });
          let ret = PathFinder.search(harvester.pos, {pos: sk.pos, range: 7}, {flee: true});
          if(ret.path.length)
          {
            harvester.memory.fleePath = ret.path
          }
        }

        if(!this.invaders)
        {
          //////////// SK Lair Checking ///////////////////////
          if(this.roomInfo(this.skRoomName).skSourceContainerMaps[source.id])
          {
            let lair = this.roomInfo(this.skRoomName).skSourceContainerMaps[source.id].lair
            let sk = lair.pos.findInRange(FIND_HOSTILE_CREEPS, 5);
            if(lair.ticksToSpawn < 16 || sk.length > 0)
            {
              let ret = PathFinder.search(harvester.pos, {pos: source.pos, range: 8}, {flee: true});
              harvester.moveByPath(ret.path);
              return;
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
      catch (error)
      {
        console.log(this.name, error)
      }
    }

    HaulerActions(hauler: Creep, source: Source)
    {
      try
      {
        if(!this.invaders)
        {
          if(this.metaData.roadsDone[source.id] === undefined)
          {
            this.metaData.roadsDone[source.id] = false;
          }

          if(hauler.pos.roomName !== this.skRoomName && _.sum(hauler.carry) === 0 &&
            hauler.ticksToLive > this.metaData.distroDistance[source.id] * 2)
          {
            let ret = hauler.travelTo(source);
            return;
          }
          else
          {
            if(this.roomInfo(this.skRoomName).skSourceContainerMaps[source.id] && hauler.room.name === this.skRoomName)
            {
              let lair = this.roomInfo(this.skRoomName).skSourceContainerMaps[source.id].lair
              let sk = lair.pos.findInRange(FIND_HOSTILE_CREEPS, 5);
              if(lair.ticksToSpawn < 10 || sk.length > 0)
              {
                let ret = PathFinder.search(hauler.pos, {pos: source.pos, range: 6}, {flee: true});
                hauler.moveByPath(ret.path);
                return;
              }
            }

            if(!hauler.memory.full && hauler.ticksToLive! > this.metaData.distroDistance[source.id])
            {
              if(_.sum(hauler.carry) === hauler.carryCapacity)
              {
                hauler.memory.full = true;
              }
              else
              {
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

                let sourceContainer = this.roomInfo(this.skRoomName).skSourceContainerMaps[source.id].container;
                if(sourceContainer)
                {
                  if(!hauler.pos.inRangeTo(sourceContainer, 1))
                  {
                      if(hauler.room.name === this.skRoomName && !this.metaData.roadsDone[source.id])
                      {
                          hauler.room.createConstructionSite(hauler.pos, STRUCTURE_ROAD);
                      }
                      hauler.travelTo(sourceContainer);
                      return;
                  }
                  else
                  {
                    this.metaData.roadsDone[source.id] = true;
                  }
                  let resource = <Resource[]>source.pos.findInRange(FIND_DROPPED_RESOURCES, 1);
                  if(resource.length > 0)
                  {
                      let withdrawAmount = hauler.carryCapacity - _.sum(hauler.carry) - resource[0].amount;

                      if(withdrawAmount >=0)
                      {
                          hauler.withdraw(sourceContainer, RESOURCE_ENERGY, withdrawAmount);
                      }

                      hauler.pickup(resource[0]);
                      return;
                  }
                  else if(sourceContainer.store.energy > hauler.carryCapacity)
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
                  else
                  {
                      hauler.say('waiting');
                      return;
                  }
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
                let ret = hauler.transfer(target, RESOURCE_ENERGY)
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
          hauler.travelTo(this.skFlag);
        }
      }
      catch (error)
      {
        console.log(this.name, error)
      }
    }

    ////////////////////////////////////////////////////////////
    ///
    ///          Miner Action code.
    ///
    ////////////////////////////////////////////////////////////
    MinerActions(miner: Creep)
    {
      try
      {
        let mineral = this.roomInfo(this.skRoomName).mineral;
        if(!mineral)
        {
          //console.log(this.name, 'Mineral Problem 1', mineral);
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

          if(_.sum(miner.carry) < miner.carryCapacity && mineral.mineralAmount > 0)
          {
            let extractor = <StructureExtractor[]>Game.rooms[this.skRoomName].find(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_EXTRACTOR});
            if(extractor[0] && miner.pos.inRangeTo(extractor[0], 1))
            {
              if(extractor[0].cooldown == 0)
              {
                miner.harvest(mineral);
              }
            }
            else
            {
              miner.travelTo(mineral);
            }
          }
          else if(_.sum(miner.carry) > 0 && miner.ticksToLive < this.metaData.miningDistance * 1.25)
          {
            let terminal = Game.rooms[this.metaData.roomName].terminal;
            if(terminal)
            {
              if(!miner.pos.isNearTo(terminal))
              {
                miner.travelTo(terminal);
                return;
              }
              else
              {
                miner.transferEverything(terminal);
                return;
              }
            }
          }
          else if(_.sum(miner.carry) >= miner.carryCapacity - miner.getActiveBodyparts(WORK))
          {
            let mineHauler = Game.creeps[this.metaData.minerHauler[0]];
            if(mineHauler)
            {
              if(mineHauler.pos.isNearTo(miner))
              {
                miner.transferEverything(mineHauler);
              }
            }
          }
        }
        else
        {
          if(_.sum(miner.carry) > 0)
          {
            let terminal = Game.rooms[this.metaData.roomName].terminal;
            if(terminal)
            {
              if(!miner.pos.isNearTo(terminal))
              {
                miner.travelTo(terminal);
                return;
              }
              else
              {
                miner.transferEverything(terminal);
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
      catch (error)
      {
        console.log(this.name, 'Miner Actions', error);
      }
    }

    ////////////////////////////////////////////////////////////
    ///
    ///          Miner Hauler Action code.
    ///
    ////////////////////////////////////////////////////////////
    MinerHaulerActions(hauler: Creep, mineral: Mineral)
    {
      try
      {
        if(!this.invaders)
        {
          let lairs = mineral.room.find(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_KEEPER_LAIR});
          if(lairs.length)
          {
            let lair = mineral.pos.findClosestByRange(lairs) as StructureKeeperLair;
            let sk = lair.pos.findInRange(FIND_HOSTILE_CREEPS, 5);
            if(lair.ticksToSpawn < 20 || sk.length > 0)
            {
              let ret = PathFinder.search(hauler.pos, {pos: mineral.pos, range: 10}, {flee: true});
              hauler.moveByPath(ret.path);
              return;
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

            let tombStone = hauler.pos.findInRange(FIND_TOMBSTONES, 4)[0]

            if(tombStone && tombStone.store.energy > 0)
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

            let dropped = hauler.pos.findInRange(FIND_DROPPED_RESOURCES, 6)[0];

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
            let terminal = Game.rooms[this.metaData.roomName].terminal;
            if(terminal)
            {
              if(!hauler.pos.isNearTo(terminal))
              {
                hauler.travelTo(terminal);
                return;
              }
              else
              {
                hauler.transferEverything(terminal);
                return;
              }
            }
          }
          else if((_.sum(hauler.carry) === hauler.carryCapacity) || !hauler.memory.filling || (_.sum(hauler.carry) > 0 && mineral.mineralAmount === 0))
          {

            let terminal = Game.rooms[this.metaData.roomName].terminal;
            if(terminal)
            {
              if(!hauler.pos.isNearTo(terminal))
              {
                hauler.travelTo(terminal);
                return;
              }
              else
              {
                hauler.transferEverything(terminal);
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
            let terminal = Game.rooms[this.metaData.roomName].terminal;
            if(terminal)
            {
              if(!hauler.pos.isNearTo(terminal))
              {
                hauler.travelTo(terminal);
                return;
              }
              else
              {
                hauler.transferEverything(terminal);
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
      catch(error)
      {
        console.log(this.name, 'Miner Hauler Actions', error);
      }
    }

    coreSearching(centerFlag: Flag)
    {
      try
      {
        if(this.roomData().observer)
        {
          let observer = this.roomData().observer;
          let roomNames = this.findSkRooms(this.metaData.roomName);

          let index = this.metaData.scanIndex++;

          console.log(this.name, 'Core Info present', this.metaData.coreInfo)
          if(this.metaData.coreInfo)
          {
            const flag = Game.flags[this.metaData.coreInfo?.coreFlagName];

            if(Game.time === 21587255)
              this.metaData.coreInfo.invaderCorePresent = false;

            console.log(this.name, this.metaData.coreInfo?.coreFlagName, this.metaData.coreInfo.invaderCorePresent);


            // Setup flag with data.
            if(flag)
            {
              let createTime = +flag.name.split('-')[2];
              let coreRoomName = flag.name.split('-')[0];
              if(this.name === 'skrmp-E36S44')
                  console.log(this.name, 1, flag.name)

              if(createTime + 1 === Game.time)
              {
                if(this.name === 'skrmp-E36S44')
                  console.log(this.name, 2)

                flag.memory.coreInfo = this.metaData.coreInfo;
                const ret = observer.observeRoom(coreRoomName);
                return;
              }

              // Destructions
              if(!flag.memory.coreInfo.invaderCorePresent)
              {
                this.metaData.coreInfo = undefined;
                flag.memory.coreInfo = undefined;
                flag.remove();
              }

              let core = Game.getObjectById(flag.memory.coreInfo.coreId);
              if(core === undefined)
              {
                flag.memory.coreInfo.invaderCorePresent = false;
                return;
              }

              if(this.name === 'skrmp-E36S44')
                console.log(this.name, 5)

              return;
            }
          }

          // Look for cores.
          if(this.metaData.coreInfo === undefined)
          {
            console.log(this.name, 'Looking for cores');
            observer.observeRoom(roomNames[index]);

            if(index >= roomNames.length - 1)
            {
              this.metaData.scanIndex = 0;
            }

            let scanRoom = Game.rooms[roomNames[index > 0 ? index - 1 : roomNames.length -1]];
            if(scanRoom)
            {
              let invaderCores = scanRoom.find(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_INVADER_CORE});
              if(invaderCores.length)
              {
                console.log(this.name, 'Found some cores');
                const invaderCore = invaderCores[0];
                if(invaderCore instanceof StructureInvaderCore)
                {
                  console.log(this.name, 'Setting up some core info');
                  let info: CoreInfo = {
                    invaderCorePresent: true,
                    coreFlagName: scanRoom.name + '-Core-' + Game.time,
                    coreId: invaderCore.id,
                    coreLevel: invaderCore.level,
                    coreLocation: invaderCore.pos,
                  };

                  if(info.coreFlagName === new RoomPosition(25,25, this.metaData.roomName).createFlag(info.coreFlagName, COLOR_PURPLE, COLOR_YELLOW))
                  {
                    console.log(this.name, 'Found Core', info.coreFlagName);
                    this.metaData.coreInfo = info;
                  }
                }
              }
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
}
///////////////////////////////////////////////////////////
/// E14S36
// Gaurd 25M, 17A, 5H1, 3RT1
// Harvester 12W, 6M, 1C
// Hauler 2W, 11M, 20C
// Home Defender 25M, 11A, 11RA, 1C, 2H
//_.forEach(Game.rooms, (r)=> console.log(r.name, r.find(FIND_CONSTRUCTION_SITES).length)
//_.forEach(Game.rooms, (r)=> r.find(FIND_CONSTRUCTION_SITES).length > 0 ? console.log(r.name, r.find(FIND_CONSTRUCTION_SITES).length) : 0)
