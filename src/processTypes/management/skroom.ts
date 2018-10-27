import { Process } from "os/process";
import { Utils } from "lib/utils";
import { HoldBuilderLifetimeProcess } from "../empireActions/lifetimes/holderBuilder";
import { MoveProcess } from "../creepActions/move";
import { BuildProcess } from "../creepActions/build";
import { HarvestProcess } from "../creepActions/harvest";

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
            this.metaData.harvestCreeps = [];
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
                console.log(this.name, 'Got Data', this.sources.length);
                // Setup DAta
                // In the SK Room

                // Spawn Attacker and Healer

                this.metaData.devils = Utils.clearDeadCreeps(this.metaData.devils);
                //let creeps = Utils.inflateCreeps(this.metaData.devils);

                let count = Utils.creepPreSpawnCount(this.metaData.devils);

                if(count < 1)
                {
                    let creepName = this.metaData.skRoomName + '-devil-' + Game.time;
                    let spawned = Utils.spawn(
                        this.kernel,
                        this.metaData.roomName,
                        'attack',
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

                console.log(this.name, 'Devil and Angel Code');
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
                    /*else if(this.roomInfo(this.skRoomName).constructionSites.length > 0)
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
                    }*/
                }

                for(let i = 0; i < this.metaData.builderCreeps.length; i++)
                {
                    let builder = Game.creeps[this.metaData.builderCreeps[i]];
                    if(builder)
                    {
                        this.BuilderActions(builder);
                    }
                }

                // Harvester Code
                if(this.roomInfo(this.skRoomName).sourceContainers.length > 1)
                {
                    let containers = this.roomInfo(this.skRoomName).sourceContainers;
                    let sources = this.roomInfo(this.skRoomName).sources;

                    _.forEach(sources, (s)=> {
                        if(!this.metaData.harvestCreeps[s.id])
                        {
                            this.metaData.harvestCreeps[s.id] = [];
                        }

                        let creepNames = Utils.clearDeadCreeps(this.metaData.harvestCreeps[s.id])
                        this.metaData.harvestCreeps[s.id] = creepNames;
                        let creeps = Utils.inflateCreeps(creepNames);

                        let count = 0;
                        _.forEach(creeps, (c) => {
                            let ticksNeeded = c.body.length * 3 + 10;
                            if(!c.ticksToLive || c.ticksToLive > ticksNeeded)
                            {
                                count ++;
                            }
                        });

                        if(count < 1)
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
                });
            }
        }
    }

    DevilActions(devil: Creep)
    {
        try
        {
            let targetName: string|undefined;
            console.log(this.name, 'Devil Actions')

            // Just spawned moving to SK Room.
            if(devil.pos.roomName !== this.skRoomName && !devil.memory.target)
            {
                console.log(this.name, 'Travel to SK Room Code')
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


                if(invaders)
                {
                  devil.room.memory.invadersPresent = true;
                }
              }

              console.log(this.name, 'SK Room Code')
              if(!devil.memory.target && !devil.room.memory.invadersPresent)    // Find a target name
              {
                  console.log(this.name, 1)
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
                      console.log(this.name, 'min',1)
                      let lair = _.min(this.lairs, "ticksToSpawn");
                      if(lair.ticksToSpawn)
                      {
                          targetName = lair.id;
                      }
                  }
              }

              if(targetName)
              {
                  console.log(this.name, 2)
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
                  console.log(this.name, 3)
                  let SkScreep = Game.getObjectById(devil.memory.target) as Creep;
                  if(SkScreep)
                  {
                      console.log(this.name, 31, SkScreep.pos)
                      if(devil.pos.inRangeTo(SkScreep,3))
                      {
                          if(SkScreep instanceof StructureKeeperLair)
                          {
                              devil.memory.target = undefined;
                          }
                          devil.attack(SkScreep);
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
                              /*if(myAngel.room.name === this.skRoomName)
                              {
                                  if(devil.pos.inRangeTo(myAngel,2))
                                  {
                                      devil.travelTo(SkScreep, {maxRooms: 1, roomCallback:(roomName, matrix)=>{
                                          let room = Game.rooms[roomName];
                                          if(room)
                                          {
                                              room.find(FIND_EXIT).forEach(exit=>matrix.set(exit.x, exit.y, 0xff))
                                          }

                                          return matrix;
                                      }
                                      });
                                      if(SkScreep instanceof StructureKeeperLair)
                                      {
                                          let skLair = SkScreep as StructureKeeperLair;
                                          if(!skLair.ticksToSpawn)
                                          {
                                              devil.memory.target = undefined;
                                          }
                                      }
                                  }
                              }
                              else
                              {
                                  devil.travelTo(SkScreep);
                              }*/

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
                console.log(this.name, 'Builder Actions', 1)
                let enemies = builder.room.find(FIND_HOSTILE_CREEPS);
                if(enemies.length === 0)
                {
                    console.log(this.name, 'Builder Actions', 2)
                    if(_.sum(builder.carry) === 0)
                    {
                        console.log(this.name, 'Builder Actions', 3)
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
                            if(this.kernel.data.roomData[builder.pos.roomName].sources)
                            {
                                let source = builder.pos.findClosestByRange( this.kernel.data.roomData[builder.pos.roomName].sources);

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

                                            if(builder.pos.isNearTo(source))
                                            {
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

                    if(_.sum(builder.carry) != 0)
                    {
                        console.log(this.name, 'build', 1)
                        let sites = _.filter(this.kernel.data.roomData[builder.pos.roomName].constructionSites, (cs) => {
                            return (cs.my);
                        })
                        console.log(this.name, 'build', 1, sites.length);
                        let target = builder.pos.findClosestByRange(sites);

                        if(target)
                        {
                            console.log(this.name, 'build', 2)
                            this.fork(BuildProcess, 'build-' + builder.name, this.priority - 1, {
                                creep: builder.name,
                                site: target.id
                            });

                            return;
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
                                    let openSpaces = missingConatiners[0].pos.openAdjacentSpots(true);
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
                else
                {
                    // Need to do something when enemies are around
                    let enemy = builder.pos.findClosestByRange(enemies);
                    if(enemy)
                    {
                        builder.travelTo(enemy, {range: 5})
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
        if(source && this.roomInfo(this.skRoomName).sourceContainerMaps[source.id])
        {
            let container = this.roomInfo(this.skRoomName).sourceContainerMaps[source.id];

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
