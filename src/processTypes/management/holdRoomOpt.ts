import {Process} from '../../os/process'
import {Utils} from '../../lib/utils'
//import { HarvesterLifetimeProcess } from 'processTypes/lifetimes/harvester';
import { HolderLifetimeProcess } from 'processTypes/empireActions/lifetimes/holder';
import { HoldBuilderLifetimeProcess } from 'processTypes/empireActions/lifetimes/holderBuilder';
import { HoldHarvesterLifetimeProcess } from 'processTypes/empireActions/lifetimes/holderHarvester';
import { HoldDistroLifetimeProcess } from 'processTypes/empireActions/lifetimes/holderDistro';
import { HoldHarvesterOptLifetimeProcess } from '../empireActions/lifetimes/holderHarvesterOpt';
import { HolderDefenderLifetimeProcess } from 'processTypes/empireActions/lifetimes/holderDefender';
import { BusterLifetimeProcess } from 'processTypes/empireActions/lifetimes/buster';



export class HoldRoomOptManagementProcess extends Process
{
  metaData: HoldRoomOptManagementProcessMetaData;
  type = 'hrmOpt'
  spawnRoom: Room;

  ensureMetaData()
  {
    if(!this.metaData.builderCreeps)
    {
      this.metaData.builderCreeps = [];
    }

    if(!this.metaData.dismantlerCreeps)
      this.metaData.dismantlerCreeps = [];

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

    if(!this.metaData.holdCreeps)
    {
      this.metaData.holdCreeps = [];
    }

    if(!this.metaData.defenderCreeps)
    {
      this.metaData.defenderCreeps = [];
    }

    if(!this.metaData.coreBuster)
    {
      this.metaData.coreBuster = [];
    }
  }

  run()
  {
    if(Game.cpu.bucket < 2000)
      return;

      if(this.name === 'hrmOpt-E45S49')
        console.log(this.name, '(((((((((((((((((Problem))))))))))))))))))))))))))))')

    this.ensureMetaData();
    let flag = Game.flags[this.metaData.flagName];

    if(!flag)
    {
      this.completed = true;
      return;
    }

    if(flag.name === 'E28S33-Hold-E28S32')
      console.log(this.name, 'Holding room WTF WTF WTF');
    let spawnRoomName = this.metaData.flagName.split('-')[0];
    this.spawnRoom = Game.rooms[spawnRoomName];
    let centerFlag = Game.flags['Center-'+spawnRoomName];

    if(this.metaData.roomName === undefined)
      this.metaData.roomName= spawnRoomName;


    const terminal = this.spawnRoom.terminal;
    const storage = this.spawnRoom.storage;
    if(this.spawnRoom.controller?.level < 8 || (terminal?.store.getUsedCapacity(RESOURCE_ENERGY) > 5000 && storage?.store.getUsedCapacity(RESOURCE_ENERGY) > 5000))
    {
      if(flag.name === 'E28S33-Hold-E28S32')
        console.log(this.name, 1);
      
      let enemiesPresent = false;
      if(flag?.memory.enemies || this.metaData.enemiesPresent)
      {
        if(!flag?.room)
        {
          flag.memory.enemies = false;
          this.metaData.enemiesPresent = false;
        }
        else
        {
        console.log(this.name, 'Enemies Present');
        this.metaData.enemiesPresent = true;
        enemiesPresent = true;
        }
      }



      let enemies: Creep[]
      if(Game.time % 10 === 7 && flag.room)
      {
        enemies = flag.room.find(FIND_HOSTILE_CREEPS);
        enemies = _.filter(enemies, (e) => {
          return ((e.getActiveBodyparts(ATTACK) > 0) || (e.getActiveBodyparts(RANGED_ATTACK) > 0))
        })
        enemiesPresent = enemies.length ? true : false;

        flag.memory.enemies = enemiesPresent;
        this.metaData.enemiesPresent = enemiesPresent;
      }

      let coreId: string;
      if(Game.time % 100 === 8 && flag.room)
      {
        let cores = flag.room.find(FIND_HOSTILE_STRUCTURES, {filter: s => s.structureType === STRUCTURE_INVADER_CORE });
        flag.memory.cores = cores.length ? true : false;

        if(flag.memory.cores)
        {
          //console.log("Hold room cores present" + flag.pos.roomName);
          coreId = cores[0].id;
        }
      }

      let defenderCount = 0;
      if(enemiesPresent && flag.room)
      {
        const enemieIds = flag.room.memory.hostileCreepIds;
        let enemies: Creep[] = [];
        for(let i = 0; i < enemieIds.length; i++)
        {
          const eCreep = Game.getObjectById(enemieIds[i]) as Creep;
          enemies.push(eCreep);
        }

        enemies = _.filter(enemies, (e: Creep)=> {
          return (e.getActiveBodyparts(ATTACK) > 0 || e.getActiveBodyparts(RANGED_ATTACK) > 0);
        });

        defenderCount = enemies.length;
        let bodyMakeup: BodyPartConstant[] = [];
        let  boosted = false;
        _.forEach(enemies, (e)=>{
          bodyMakeup = e.getBodyParts();
          boosted = (e.body.filter(e => e.boost !== undefined).length) ? true : false;
        });

        let moveCount = 0;
        for(var i = bodyMakeup.length - 1; i >= 0; i--)
        {
          switch(bodyMakeup[i])
          {
            case MOVE:
              moveCount++;
              break;
            case WORK:
            case RANGED_ATTACK:
              bodyMakeup[i] = ATTACK;
              break;
          }
        }

        if(moveCount <= bodyMakeup.length / 2)
        {
          let add = bodyMakeup.length / 2 - moveCount;
          add = Math.floor(add);
          if(add > 0)
          {
            for(var j = 0; j < add; j++)
              bodyMakeup.push(MOVE);
          }
        }

        this.metaData.defenderCreeps = Utils.clearDeadCreeps(this.metaData.defenderCreeps);
        console.log(this.name, 'Defender counts', this.metaData.defenderCreeps.length, defenderCount);
        if(this.metaData.defenderCreeps.length < defenderCount)
        {
          let creepName = 'hrm-defender-' + flag.pos.roomName + '-' + Game.time;
          let spawned = Utils.spawn(
            this.kernel,
            spawnRoomName,
            'custom',
            creepName,
            {body: bodyMakeup.reverse()}
          );

          if(spawned)
          {

            this.metaData.defenderCreeps.push(creepName);
            this.kernel.addProcessIfNotExist(HolderDefenderLifetimeProcess, 'holderDefenderlf-' + creepName, 20, {
              creep: creepName,
              flagName: this.metaData.flagName,
              spawnRoomName: spawnRoomName,
              boosted: boosted
            })
          }
        }
      }

      if(flag.memory.cores && flag.room && !enemiesPresent)
      {
        this.metaData.coreBuster = Utils.clearDeadCreeps(this.metaData.coreBuster);
        if(this.metaData.coreBuster.length < 1)
        {
          let creepName = 'hrm-buster-' + flag.pos.roomName + '-' + Game.time;
          let spawned = Utils.spawn(
            this.kernel,
            spawnRoomName,
            'buster',
            creepName,
            {}
          );
          if(spawned)
          {
            let boost = [];
            boost.push(RESOURCE_CATALYZED_UTRIUM_ACID);
            this.metaData.coreBuster.push(creepName);
            this.kernel.addProcessIfNotExist(BusterLifetimeProcess, 'busterlf-' + creepName, 30, {
              creep: creepName,
              flagName: this.metaData.flagName,
              spawnRoom: spawnRoomName,
              coreId: coreId,
              boosts: boost
            })
          }
        }
      }

      if(!enemiesPresent && (this.kernel.data.roomData[spawnRoomName].containers.length >= 3 || this.roomInfo(spawnRoomName).sourceLinks.length == 2))
      {
        if(this.name === 'hrmOpt-E45S49')
          console.log(this.name, 1)
        if(centerFlag)
        {
          let room = flag.room;

          this.metaData.holdCreeps = Utils.clearDeadCreeps(this.metaData.holdCreeps);

          if(!room)
          {
            // No vision in room.
            if(this.metaData.holdCreeps.length < 1)
            {
              let creepName = 'hrm-hold-' + flag.pos.roomName + '-' + Game.time;
              let spawned = Utils.spawn(
                this.kernel,
                spawnRoomName,
                'hold',
                creepName,
                {}
              );

              if(spawned)
              {
                this.metaData.holdCreeps.push(creepName);
                this.kernel.addProcess(HolderLifetimeProcess, 'holdlf-' + creepName, 20, {
                  creep: creepName,
                  flagName: this.metaData.flagName
                })
              }
            }
          }
          else
          {
            let sRoom = Game.rooms[spawnRoomName];

            //Spawn big holder
            if(room.controller && sRoom.controller!.level >= 8 &&
              (room.controller.reservation === undefined ||
              (room.controller.reservation && (room.controller.reservation.ticksToEnd < 1000 || room.controller.reservation.username !== 'wolffman122'))))
            {
              if(this.metaData.holdCreeps.length < 1 && !enemiesPresent)
              {
                let max = 16;
                if(sRoom.energyAvailable < sRoom.energyCapacityAvailable * 0.50)
                {
                  max = 4;
                }

                let creepName = 'hrm-hold-' + flag.pos.roomName + '-' + Game.time;
                let spawned = Utils.spawn(
                  this.kernel,
                  spawnRoomName,
                  'hold',
                  creepName,
                  {
                    max: max
                  }
                );

                if(spawned)
                {
                  this.metaData.holdCreeps.push(creepName);
                  this.kernel.addProcess(HolderLifetimeProcess, 'holdlf-' + creepName, 20, {
                    creep: creepName,
                    flagName: this.metaData.flagName
                  })
                }
              }
            }
            else if(sRoom.controller!.level < 8)
            {
              if(this.metaData.holdCreeps.length < 1 && (room.controller.reservation?.ticksToEnd < 1000 ?? false) || room.controller.reservation?.username !== 'wolffman122')
              {
                let creepName = 'hrm-hold-' + flag.pos.roomName + '-' + Game.time;
                let spawned = Utils.spawn(
                  this.kernel,
                  spawnRoomName,
                  'hold',
                  creepName,
                  {}
                );

                if(spawned)
                {
                  this.metaData.holdCreeps.push(creepName);
                  this.kernel.addProcess(HolderLifetimeProcess, 'holdlf-' + creepName, 20, {
                    creep: creepName,
                    flagName: this.metaData.flagName
                  })
                }
              }
            }

            this.metaData.builderCreeps = Utils.clearDeadCreeps(this.metaData.builderCreeps);

            if(this.roomData())
            {
              // Construction Code
              if(!this.roomData().sourceContainers || (this.roomData().sourceContainers.length < this.roomData().sources.length))
              {
                if(this.roomData().sourceContainers.length < this.roomData().sources.length && Game.time % 10000 === 100)
                {
                  Game.notify("Problem in room " + this.metaData.roomName + " lost some contianers");
                }
                if(this.metaData.builderCreeps.length < this.roomData().sources.length)
                {
                  let creepName = 'hrm-build-' + flag.pos.roomName + '-' + Game.time;
                  let spawned = Utils.spawn(
                    this.kernel,
                    spawnRoomName,
                    'worker',
                    creepName,
                    {}
                  );

                  if(spawned)
                  {
                    // TODO Need to improve hold builder code to make construction sites automatic as it moves to source
                    this.metaData.builderCreeps.push(creepName);
                    this.kernel.addProcess(HoldBuilderLifetimeProcess, 'holdBuilderlf-' + creepName, 25, {
                      creep: creepName,
                      flagName: this.metaData.flagName
                    })
                  }
                }
              }
              else if(this.roomData().constructionSites.length > 0)
              {
                if(this.metaData.builderCreeps.length < this.roomData().sources.length)
                {
                  let creepName = 'hrm-build-' + flag.pos.roomName + '-' + Game.time;
                  let spawned = Utils.spawn(
                    this.kernel,
                    spawnRoomName,
                    'worker',
                    creepName,
                    {}
                  );

                  if(spawned)
                  {
                    // TODO Need to improve hold builder code to make construction sites automatic as it moves to source
                    this.metaData.builderCreeps.push(creepName);
                    this.kernel.addProcess(HoldBuilderLifetimeProcess, 'holdBuilderlf-' + creepName, 25, {
                      creep: creepName,
                      flagName: this.metaData.flagName
                    })
                  }
                }
              }


              if(this.roomData().sourceContainers.length > 0)
              {
                // Havester code
                let containers = this.roomData().sourceContainers;
                let sources = this.roomData().sources;

                _.forEach(sources, (s) => {
                  if(!this.metaData.harvestCreeps[s.id])
                  {
                    this.metaData.harvestCreeps[s.id] = [];
                  }

                  let creepNames = Utils.clearDeadCreeps(this.metaData.harvestCreeps[s.id]);
                  this.metaData.harvestCreeps[s.id] = creepNames;
                  let creeps = Utils.inflateCreeps(creepNames);

                  let sc = this.roomInfo(s.room.name).sourceContainerMaps[s.id];
                  let distance = 10;
                  if(sc)
                  {
                    if(!this.metaData.distroDistance[sc.id])
                    {
                      let ret = PathFinder.search(centerFlag.pos, sc.pos, {
                        plainCost: 2,
                        swampCost: 10,
                      });

                      this.metaData.distroDistance[sc.id] = ret.path.length;
                    }
                    else
                    {
                      distance += this.metaData.distroDistance[sc.id];
                    }
                  }

                  let count = 0;
                  _.forEach(creeps, (c) => {
                    let ticksNeeded = c.body.length * 3 + distance + 10;
                    if(!c.ticksToLive || c.ticksToLive > ticksNeeded)
                    {
                      count++;
                    }
                  })

                  if(count < 1)
                  {
                    //console.log("Need to make some harvesting creeps " + s.id);
                    let creepName = 'hrm-harvest-' + flag.pos.roomName + '-' + Game.time;
                    let spawned = Utils.spawn(
                      this.kernel,
                      spawnRoomName,
                      'harvester',
                      creepName,
                      {}
                    )

                    if(spawned)
                    {
                      this.metaData.harvestCreeps[s.id].push(creepName);
                    }
                  }

                  _.forEach(creeps, (c) => {
                    this.kernel.addProcessIfNotExist(HoldHarvesterOptLifetimeProcess, 'holdHarvesterlfOpt-' + c.name, 27, {
                      creep: c.name,
                      source: s.id,
                      flagName: flag.name
                    });
                  });
                });

                // Hauling code
                _.forEach(this.roomData().sourceContainers, (sc) => {
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
                      let  ticksNeeded = c.body.length * 3 +  this.metaData.distroDistance[sc.id];
                      if(!c.ticksToLive || c.ticksToLive > ticksNeeded) { count++; }
                    });

                    let numberDistro = 2;
                    if(this.metaData.distroDistance[sc.id] < 60)
                    {
                      numberDistro = 1;
                    }

                    if(count < numberDistro)
                    {
                      let creepName = 'hrm-m-' + flag.pos.roomName + '-' + Game.time;
                      let spawned = Utils.spawn(
                          this.kernel,
                          spawnRoomName,
                          'holdmover',
                          creepName,
                          {}
                      );

                      if(spawned)
                      {
                          this.metaData.distroCreeps[sc.id].push(creepName);
                      }
                    }

                    _.forEach(creeps, (creep) => {
                      this.kernel.addProcessIfNotExist(HoldDistroLifetimeProcess, 'holdDistrolf-' + creep.name, 26, {
                        sourceContainer: sc.id,
                        spawnRoom: spawnRoomName,
                        creep: creep.name,
                        flagName: flag.name,
                        roomData: flag.pos.roomName,
                      });
                    });
                });

                if(flag.room.name === 'E38S36')
                {
                  // Big Distro code
                  if(!this.metaData.ruinCheck)
                  {
                    const ruins = room.find(FIND_RUINS, {filter: r => r.store.getUsedCapacity() >= 8000});
                    if(ruins.length)
                    {
                      if(!this.metaData.haulerCreeps)
                        this.metaData.haulerCreeps = [];

                      this.metaData.haulerCreeps = Utils.clearDeadCreeps(this.metaData.haulerCreeps);
                      if(this.metaData.haulerCreeps.length < 1)
                      {
                        const creepName = 'hrm-haul-' + flag.pos.roomName + '-' + Game.time;
                        const spawned = Utils.spawn(
                          this.kernel,
                          spawnRoomName,
                          'shHauler',
                          creepName,
                          {}
                        );

                        if(spawned)
                          this.metaData.haulerCreeps.push(creepName);
                      }

                      for(let i = 0; i < this.metaData.haulerCreeps.length; i++)
                      {
                        const creep = Game.creeps[this.metaData.haulerCreeps[i]];
                        if(creep)
                          this.HaulerActions(creep);
                      }
                    }
                    else
                    {
                      delete this.metaData.haulerCreeps;
                      this.metaData.ruinCheck = true;
                    }
                  }
                }
              }
            }
          }
        }
        else
        {
          this.log('Need to place a center flag in ' + spawnRoomName);
        }
      }
    }

  }

  DismantleNuker(flag: Flag)
  {
    const nuker = this.roomInfo(flag.room.name).nuker;
    if((nuker?.store[RESOURCE_ENERGY] > 0 ?? 0) || (nuker?.store[RESOURCE_GHODIUM] ?? 0) === nuker.store.getCapacity(RESOURCE_GHODIUM))
    {
      this.metaData.dismantlerCreeps = Utils.clearDeadCreeps(this.metaData.dismantlerCreeps);
      if(this.metaData.dismantlerCreeps.length < 1)
      {
        let creepName = 'hrm-dismantle-' + flag.pos.roomName + '-' + Game.time;
        let spawned = Utils.spawn(
          this.kernel,
          this.spawnRoom.name,
          'worker',
          creepName,
          {}
        );

        if(spawned)
          this.metaData.dismantlerCreeps.push(creepName);
      }
    }
    else
    {
      const ruins = flag.room.find(FIND_RUINS, {filter: r => r.structure.structureType === STRUCTURE_NUKER});
      if(ruins.length)
      {
        const ruin = ruins[0];
        const amount = (ruin.store[RESOURCE_ENERGY] ?? 0) + (ruin.store[RESOURCE_GHODIUM] ?? 0);
        if(amount > 2000)
        {

        }
      }
    }



    for(let i = 0; i < this.metaData.dismantlerCreeps.length; i++)
    {
      const creep = Game.creeps[this.metaData.dismantlerCreeps[i]];
      if(creep)
        this.DismantlerActions(creep, nuker);
    }

  }

  DismantlerActions(creep: Creep, nuker: StructureNuker)
  {
    if(nuker)
    {
      if(!creep.pos.isNearTo(nuker))
        creep.travelTo(nuker);
      else
        creep.dismantle(nuker);

      creep.say('💥');
      return;
    }
    else
    {
      const spawn = this.roomData().spawns[0];
      if(!creep.pos.isNearTo(spawn))
        creep.travelTo(spawn);
      else if(!spawn.spawning)
        spawn.recycleCreep(creep);

      creep.say('☠');
      return;
    }
  }

  HaulerActions(creep: Creep)
  {
    console.log(this.name, 'HaulerActions', 1)
    if(!creep.memory.boost)
    {
      creep.boostRequest([RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE, RESOURCE_CATALYZED_KEANIUM_ACID], false);
      return;
    }

    console.log(this.name, 'HaulerActions', 1)
    const flag = Game.flags[this.metaData.flagName];
    const room = flag.room;

    console.log(this.name, 'HaulerActions', 2, creep.memory.target)
    let target: Ruin;
    if(!creep.memory.target)
    {
      const ruins = room.find(FIND_RUINS).filter(r => r.store.getUsedCapacity() > 0);
      if(ruins.length)
      {
        if(creep.room.name === this.spawnRoom.name)
        {
          creep.travelTo(flag);
          return;
        }

        const ruin = creep.pos.findClosestByRange(ruins);
        creep.memory.target = ruin.id;
        target = ruin;
      }
      else
      {
        // Suicide no more ruins
        const container = this.roomData().generalContainers[0];
        if(!creep.pos.isNearTo(container))
          creep.travelTo(container);
        else
        {
          const spawn = creep.pos.findInRange(this.roomData().spawns.filter(s => !s.spawning), 1)[0];
          if(spawn)
            spawn.recycleCreep(creep);
          else
            creep.suicide();
        }
      }
    }
    else
      target = <Ruin>Game.getObjectById(creep.memory.target);

    console.log(this.name, 'HaulerActions', 3, target)
    if(creep.store.getUsedCapacity() === 0 || !creep.memory.full)
    {
      console.log(this.name, 'HaulerActions', 4)
      if(creep.store.getFreeCapacity() === 0)
        creep.memory.full = true;
      else
      {
        creep.memory.full = false;
        if(!creep.pos.isNearTo(target))
          creep.travelTo(target);
        else
          creep.withdrawEverything(target);
      }
    }

    console.log(this.name, 'HaulerActions', 5)
    if(creep.memory.full)
    {
      if(!creep.pos.isNearTo(this.spawnRoom.storage))
      {
        const ret = creep.travelTo(this.spawnRoom.storage);
        console.log(this.name, 'HaulerActions', 7, ret)
      }
      else
      {
        creep.transferEverything(this.spawnRoom.storage);
        console.log(this.name, 'HaulerActions', 8)
      }
    }
  }
}

