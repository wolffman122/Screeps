import { Process } from "os/process";
import { Utils } from "lib/utils";
import { HoldBuilderLifetimeProcess } from "../empireActions/lifetimes/holderBuilder";
import { MoveProcess } from "../creepActions/move";

export class skRoomManagementProcess extends Process
{
    type = 'skrmp';
    metaData: SKRoomManagementProcessMetaData;

    skFlag: Flag;
    scout?: Creep;
    skRoomName: string;
    locations: {
        [type: string]: string[]
    };
    lairs: StructureKeeperLair[];
    sources: Source[];
    invaders: boolean;


    ensureMetaData()
    {
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

        if(!this.metaData.harvestCreeps)
        {
            this.metaData.harvestCreeps = {};
        }
    }

    run()
    {
      console.log(this.name);

      let centerFlag = Game.flags['Center-'+this.metaData.roomName];

      this.skFlag = Game.flags[this.metaData.flagName];
      if(!this.skFlag)
      {
          this.completed = true;
          Memory.flags[this.metaData.flagName] = undefined;
          return;
      }

      this.ensureMetaData();


      if(!this.metaData.vision)
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
          // Setup DAta
          // In the SK Room

          // Spawn Attacker and Healer

          this.metaData.devils = Utils.clearDeadCreeps(this.metaData.devils);

          let count = Utils.creepPreSpawnCount(this.metaData.devils);

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


          if(this.metaData.devils.length) // ADD to check for enemies here if they are present and no devil then flee.
          {
            console.log(this.name, 'Construction', 1)
            this.metaData.builderCreeps = Utils.clearDeadCreeps(this.metaData.builderCreeps);
            // Construction Code
            if(!this.roomInfo(this.skRoomName).sourceContainers || (this.roomInfo(this.skRoomName).sourceContainers.length < this.roomInfo(this.skRoomName).sources.length))
            {
              console.log(this.name, 'Construction', 2)
              if(this.metaData.builderCreeps.length < 2)
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
            else if(this.roomInfo(this.skRoomName).constructionSites.length > 0)
            {
              console.log(this.name, 'Construction', 3)
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


            for(let i = 0; i < this.metaData.builderCreeps.length; i++)
            {
              let builder = Game.creeps[this.metaData.builderCreeps[i]];
              console.log(this.name, 'Builder', builder.name);
              if(builder)
              {
                this.BuilderActions(builder);
              }
            }

            // Harvester Code
            console.log(this.name, 'harvester', 1)
            if(this.roomInfo(this.skRoomName).sourceContainers.length > 0)
            {
              console.log(this.name, 'harvester', 2)
              let sources = this.roomInfo(this.skRoomName).sources;

              _.forEach(sources, (s)=> {

                console.log(this.name, 'harvester', 3, this.roomInfo(this.skRoomName).skSourceContainerMaps[s.id], this.roomInfo(this.skRoomName).sourceContainerMaps[s.id])
                if(!this.roomInfo(this.skRoomName).skSourceContainerMaps[s.id])
                {
                  return;
                }

                console.log(this.name, 'harvester', 4)
                if(!this.metaData.harvestCreeps[s.id])
                {
                  this.metaData.harvestCreeps[s.id] = [];
                }

                let creepNames = Utils.clearDeadCreeps(this.metaData.harvestCreeps[s.id])
                this.metaData.harvestCreeps[s.id] = creepNames
                let creeps = Utils.inflateCreeps(creepNames)

                console.log(this.name, 'harvester', 5, this.metaData.harvestCreeps[s.id].length);
                let count = 0;
                _.forEach(creeps, (c) => {
                  let  ticksNeeded = c.body.length * 3;
                  if(!c.ticksToLive || c.ticksToLive > ticksNeeded) { count++; }
                });


                console.log(this.name, 'Harvest start');
                if(this.metaData.harvestCreeps[s.id].length < 1)
                {
                  let creepName = 'sk-harvest-'+this.skRoomName+'-'+Game.time;
                  let spawned = Utils.spawn(
                    this.kernel,
                    this.metaData.roomName,
                    'harvester',
                    creepName,
                    {}
                  );

                  if(spawned)
                  {
                    this.metaData.harvestCreeps[s.id].push(creepName);
                  }
                }

                console.log('harvest loop', this.metaData.harvestCreeps[s.id].length)
                for(let i = 0; i < this.metaData.harvestCreeps[s.id].length; i++)
                {
                  let harvester = Game.creeps[this.metaData.harvestCreeps[s.id][i]];
                  if(harvester)
                  {
                    console.log('harvest loop call actions')
                    //this.HarvesterActions(harvester, s);
                  }
                }
              });
            }

/*
            // Hauling Code
            _.forEach(this.roomInfo(this.skRoomName).sourceContainers, (sc) => {
                if(!this.metaData.distroCreeps[sc.id])
                    this.metaData.distroCreeps[sc.id] = [];

                if(!this.metaData.distroDistance[sc.id])
                {
                    let ret = PathFinder.search(centerFlag.pos, sc.pos, {
                        plainCost: 2,
                        swampCost: 10,
                    });

                    this.metaData.distroDistance[sc.id] = ret.path.length;
                }

                let creepNames = Utils.clearDeadCreeps(this.metaData.distroCreeps[sc.id]);
                this.metaData.distroCreeps[sc.id] = creepNames;
                let creeps = Utils.inflateCreeps(creepNames);

                let count = 0;
                _.forEach(creeps, (c) => {
                    let ticksNeeded = c.body.length * 3 + this.metaData.distroDistance[sc.id];
                    if(!c.ticksToLive || c.ticksToLive > ticksNeeded) { count++; }
                });

                let numberDistro = 2;
                if(this.metaData.distroDistance[sc.id] < 70)
                {
                    numberDistro = 1;
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
                        this.metaData.distroCreeps[sc.id].push(creepName);
                    }
                }

                //Hauler Action Code
                for(let i = 0; i < this.metaData.distroCreeps[sc.id].length; i++)
                {
                    let hauler = Game.creeps[this.metaData.distroCreeps[sc.id][i]]
                    if(hauler)
                    {
                        this.HaulerActions(hauler, sc);
                    }
                }
            });*/
          }
        }
      }
    }

    DevilActions(devil: Creep)
    {
      try
      {
        if(!devil.memory.boost)
        {
          devil.boostRequest([RESOURCE_LEMERGIUM_OXIDE, RESOURCE_KEANIUM_OXIDE], false);
          return;
        }
        let targetName: string|undefined;

        // Just spawned moving to SK Room.
        if(devil.pos.roomName !== this.skRoomName && !devil.memory.target)
        {
          devil.travelTo(new RoomPosition(25, 25, this.skRoomName));
        }
        else
        {
          // SK Room Code
          if(!devil.room.memory.invadersPresent && Game.time % 5 === 3)
          {
            let invaders = devil.room.find(FIND_HOSTILE_CREEPS, {
              filter: c => c.owner.username === 'Invader'
            });

            if(invaders.length)
            {
              devil.room.memory.invadersPresent = true;
            }
            else
            {
              devil.room.memory.invadersPresent = false;
            }
          }

          if(!devil.memory.target && !devil.room.memory.invadersPresent)    // Find a target name
          {
            let sourceKeepers = _.filter(this.lairs, (l) => {
              return (l.pos.findInRange(FIND_HOSTILE_CREEPS, 5).length);
            });

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
              let lair = _.min(this.lairs, "ticksToSpawn");
              if(lair.ticksToSpawn)
              {
                targetName = lair.id;
              }
            }
          }

          if(targetName)
          {
            devil.memory.target = targetName;
            targetName = undefined;
          }

          if(devil.room.memory.invadersPresent)
          {
            // Attack Invaders
            let invaders = devil.room.find(FIND_HOSTILE_CREEPS, {
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
                let target = devil.pos.findClosestByRange(healers);
                if(target)
                {
                  let numberInRange = devil.pos.findInRange(FIND_HOSTILE_CREEPS, 3);
                  if(numberInRange.length > 1)
                  {
                    devil.rangedMassAttack();
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

                  devil.move(devil.pos.getDirectionTo(target));
                  return;
                }
              }

              let range = _.filter(invaders, (i) => {
                return i.getActiveBodyparts(RANGED_ATTACK) > 0;
              })

              if(range.length)
              {
                let target = devil.pos.findClosestByRange(healers);
                if(target)
                {
                  let numberInRange = devil.pos.findInRange(FIND_HOSTILE_CREEPS, 3);
                  if(numberInRange.length > 1)
                  {
                    devil.rangedMassAttack();
                  }
                  else if(numberInRange.length == 1)
                  {
                    devil.rangedAttack(target);
                  }

                  if(devil.pos.isNearTo(target))
                  {
                    devil.attack(target);
                  }

                  devil.move(devil.pos.getDirectionTo(target));
                  return;
                }
              }
            }
          }
          else if(devil.memory.target && !targetName)
          {
            console.log(this.name, 'Attack', 1)
            let SkScreep = Game.getObjectById(devil.memory.target) as Creep;
            if(SkScreep)
            {
              if(devil.pos.isNearTo(SkScreep))
              {
                if(SkScreep instanceof StructureKeeperLair)
                {
                  devil.memory.target = undefined;
                  let damaged = devil.pos.findInRange(FIND_CREEPS, 5, {
                    filter: c => c.my && c.hits < c.hitsMax
                  });
                  if(damaged.length)
                  {
                    if(devil.pos.inRangeTo(damaged[0], 3))
                    {
                      devil.heal(damaged[0]);
                    }
                    else
                    {
                      devil.travelTo(damaged[0]);
                    }
                  }
                }

                console.log(this.name , 'attack')
                devil.attack(SkScreep);
              }
              else if(devil.pos.inRangeTo(SkScreep,3))
              {
                if(SkScreep instanceof StructureKeeperLair)
                {
                    devil.memory.target = undefined;
                }

                devil.heal(devil);
                console.log(this.name , 'heal')
                devil.rangedAttack(SkScreep);
                console.log(this.name , 'rangedAttack')
                devil.travelTo(SkScreep);
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
                  devil.travelTo(SkScreep);
                }
              }
            }
            else
            {
              console.log(this.name, 'Screep does not exist');
              devil.memory.target = undefined;
            }
          }
        }
      }
      catch (error)
      {
        console.log(this.name, error)
      }
    }


    BuilderActions(builder: Creep)
    {
      if(Game.time % 25 === 5)
      {
        let hostiles = builder.room.find(FIND_HOSTILE_CREEPS);
        let invader = _.find(hostiles, (h) => {
          return (h.owner.username === 'Invader')
        })

        if(invader)
        {
          this.invaders = true;
        }
        else
        {
          this.invaders = false;
        }
      }

      if(builder.pos.roomName !== this.skRoomName)
      {
        builder.travelTo(new RoomPosition(25, 25, this.skRoomName));
      }
      else
      {
        if(!this.invaders)
        {
          let enemies = builder.pos.findInRange(FIND_HOSTILE_CREEPS, 5);
          if(enemies.length === 0)
          {
            if(_.sum(builder.carry) != builder.carryCapacity && builder.memory.filling)
          {
              if(this.roomInfo(this.skRoomName).containers.length > 0)
              {
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
                      builder.travelTo(target);
                      return;
                    }

                    builder.withdraw(target, RESOURCE_ENERGY);
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
                        return;
                      }
                    }
                  }
                }
              }
              else
              {
                console.log(this.name, 'Builder Actions', 4)
                if(this.roomInfo(this.skRoomName).sources)
                {
                    console.log(this.name, 'Builder Actions', 5)
                    let source = builder.pos.findClosestByRange( this.kernel.data.roomData[builder.pos.roomName].sources);

                    if(source)
                    {
                      console.log(this.name, 'Builder Actions', 51)
                      if(this.roomInfo(this.skRoomName).containers.length > 0)
                      {
                        if(this.roomInfo(this.skRoomName).skSourceContainerMaps[source.id].lair.ticksToSpawn < 7)
                        {
                          console.log(this.name, 'Builder Actions', 52)
                          if(builder.pos.getRangeTo(source) < 5)
                          {
                            console.log(this.name, 'Builder Actions', 53)
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

                      console.log(this.name, 'Builder Actions', 6)
                      if(!builder.pos.inRangeTo(source, 1))
                      {
                        let stones =  source.pos.findInRange(FIND_TOMBSTONES, 4);
                        if(stones.length > 0)
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

                        console.log(this.name, 'Builder Actions', 61)
                        let dropped = source.pos.findInRange(FIND_DROPPED_RESOURCES, 4);
                        if(dropped.length > 0)
                        {
                          console.log(this.name, 'Builder Actions', 62)
                          if(builder.pos.isNearTo(dropped[0]))
                          {
                            console.log(this.name, 'Builder Actions', 63)
                            if(dropped[0].amount >= builder.carryCapacity)
                            {
                              console.log(this.name, 'Builder Actions', 64)
                              builder.memory.filling = false;
                              builder.pickup(dropped[0])
                              return;
                            }
                            else if(_.sum(builder.carry) > 0)
                            {
                              console.log(this.name, 'Builder Actions', 65)
                              builder.memory.filling = false;
                            }
                          }
                          else
                          {
                            builder.travelTo(dropped[0]);
                            return;
                          }
                        }



                        builder.travelTo(source);
                        return;
                      }

                      if(builder.pos.inRangeTo(source, 1))
                      {
                        console.log(this.name, 'Builder Actions', 8)
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
                                if(_.sum(builder.carry) === builder.carryCapacity)
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
                        console.log(this.name, 'Builder Actions', 9)
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

            if(_.sum(builder.carry) === builder.carryCapacity || !builder.memory.filling)
            {
              let source = builder.pos.findClosestByRange( this.kernel.data.roomData[builder.pos.roomName].sources);
              if(source)
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

              console.log(this.name, 'build', 1)
              let sites = _.filter(this.kernel.data.roomData[builder.pos.roomName].constructionSites, (cs) => {
                  return (cs.my);
              })
              console.log(this.name, 'build', 1, sites.length);
              let target = builder.pos.findClosestByRange(sites);

              if(target)
              {
                console.log(this.name, 'build', 2)
                if(builder.pos.inRangeTo(target, 3))
                {
                  let ret = builder.build(target);
                  if(ret === ERR_NOT_ENOUGH_RESOURCES)
                  {
                    console.log(this.name, 'Build challeng', ret);
                    builder.memory.filling = true;
                  }
                }
                else
                {
                  builder.travelTo(target, {range: 3})
                }
              }
              else
              {
                  let sources = this.kernel.data.roomData[builder.pos.roomName].sources;
                  let sourceContainersMaps = this.kernel.data.roomData[builder.pos.roomName].sourceContainerMaps;

                  if(sources.length)
                  {
                      let missingConatiners = _.filter(sources, (s) => {
                          return (!sourceContainersMaps[s.id])
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
                      /*else
                      {
                      console.log(this.name, 'Not missing some contianers');
                      }*/
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

    HarvesterActions(harvester: Creep, source: Source)
    {
      /*if(Game.time % 25 === 5)
      {
          let hostiles = harvester.room.find(FIND_HOSTILE_CREEPS);
          let invader = _.find(hostiles, (h) => {
              return (h.owner.username === 'Invader')
          })

          if(invader)
          {
              this.invaders = true;
          }
          else
          {
              this.invaders = false;
          }
      }

      if(!this.invaders)
      {
        console.log('harvester actions', 1)
        let enemies = harvester.pos.findInRange(FIND_HOSTILE_CREEPS, 5);
        if(enemies.length === 0)
        {
          console.log('harvester actions', 1)
          if(source && this.roomInfo(this.skRoomName).skSourceContainerMaps[source.id].container)
          {
              let container = this.roomInfo(this.skRoomName).skSourceContainerMaps[source.id].container;

              if(!harvester.pos.inRangeTo(container,0))
              {
                  harvester.travelTo(container);
              }

              if((container.storeCapacity - _.sum(container.store)) >= (harvester.getActiveBodyparts(WORK) * 2))
              {
                  harvester.harvest(source);
              }

              if(container.hits < container.hitsMax * .95 && _.sum(harvester.carry) > 0)
              {
                  harvester.repair(container);
              }

              if(container.store.energy < container.storeCapacity && _.sum(harvester.carry) === harvester.carryCapacity)
              {
                  harvester.transfer(container, RESOURCE_ENERGY)
              }
          }
        }
        else
        {
          // Need to do something when enemies are around
          let enemy = harvester.pos.findClosestByRange(enemies);
          if(enemy)
          {
              let dir = harvester.pos.getDirectionTo(enemy) as number;
              dir = dir + 4;
              if(dir > 7)
              {
                dir = dir % 7;
              }

              harvester.move(dir as DirectionConstant);
          }
        }
      }
      else
      {
        harvester.travelTo(this.skFlag);
      }*/
    }

    HaulerActions(hauler: Creep, sourceContainer: StructureContainer)
    {
        if(hauler.pos.roomName !== this.skRoomName)
        {
            hauler.travelTo(new RoomPosition(25, 25, this.skRoomName));
        }
        else
        {
            if(_.sum(hauler.carry) === 0 && hauler.ticksToLive! > 100)
            {
                if(!hauler.pos.inRangeTo(sourceContainer, 1))
                {
                    if(hauler.room.name === this.skRoomName)
                    {
                        hauler.room.createConstructionSite(hauler.pos, STRUCTURE_ROAD);
                    }
                    hauler.travelTo(sourceContainer);
                    return;
                }

                let resource = <Resource[]>sourceContainer.pos.lookFor(RESOURCE_ENERGY);
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
                else
                {
                    this.suspend = 20;
                    return;
                }
            }
        }

        if(Game.rooms[this.metaData.roomName].storage)
        {
            let target = Game.rooms[this.metaData.roomName].storage;

            if(target)
            {
                if(!hauler.pos.inRangeTo(target,1))
                {
                    if(!hauler.fixMyRoad())
                    {
                        hauler.travelTo(target);
                    }
                }

                if(hauler.transfer(target, RESOURCE_ENERGY) === ERR_FULL)
                {
                    return;
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
}
///////////////////////////////////////////////////////////
/// E14S36
// Gaurd 25M, 17A, 5H1, 3RT1
// Harvester 12W, 6M, 1C
// Hauler 2W, 11M, 20C
// Home Defender 25M, 11A, 11RA, 1C, 2H
