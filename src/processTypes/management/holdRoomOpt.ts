import {Process} from '../../os/process'
import {Utils} from '../../lib/utils'
//import { HarvesterLifetimeProcess } from 'processTypes/lifetimes/harvester';
import { HolderLifetimeProcess } from 'processTypes/empireActions/lifetimes/holder';
import { HoldBuilderLifetimeProcess } from 'processTypes/empireActions/lifetimes/holderBuilder';
import { HoldHarvesterLifetimeProcess } from 'processTypes/empireActions/lifetimes/holderHarvester';
import { HoldDistroLifetimeProcess } from 'processTypes/empireActions/lifetimes/holderDistro';



export class HoldRoomOptManagementProcess extends Process
{
  metaData: HoldRoomOptManagementProcessMetaData;
  type = 'hrmOpt'

  ensureMetaData()
  {
    if(!this.metaData.builderCreeps)
    {
      this.metaData.builderCreeps = [];
    }

    if(!this.metaData.workerCreeps)
    {
      this.metaData.workerCreeps = [];
    }

    if(!this.metaData.distroCreeps)
    {
      this.metaData.distroCreeps = {};
    }

    if(!this.metaData.harvestCreeps)
    {
      this.metaData.harvestCreeps = {};
    }

    if(!this.metaData.holdCreeps)
    {
      this.metaData.holdCreeps = [];
    }
  }

  run()
  {
    this.ensureMetaData();
    let flag = Game.flags[this.metaData.flagName];
    let spawnRoomName = this.metaData.flagName.split('-')[0];
    let centerFlag = Game.flags['Center-'+spawnRoomName];

    if(!flag)
    {
      this.completed = true;
      return;
    }

    if(flag.memory.enemies === undefined)
    {
      flag.memory.enemies = false;
      flag.memory.timeEnemies = 0;
    }

    if(flag.memory.enemies)
    {
      this.log('Remote room enemy present ticks left ' + (flag.memory.timeEnemies! + 1500 - Game.time));
      if(flag.memory.timeEnemies! + 1500 <= Game.time)
      {
        flag.memory.enemies = false;
        flag.memory.timeEnemies = 0;
      }
    }
    else
    {
      if(centerFlag && !centerFlag.memory.timeEnemies)
      {
        let room = flag.room;

        this.metaData.holdCreeps = Utils.clearDeadCreeps(this.metaData.holdCreeps);

        if(!room)
        {
          // No vision in room.
          if(this.metaData.holdCreeps.length < 1 && !flag.memory.enemies)
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
            (room.controller.reservation === undefined || (room.controller.reservation && room.controller.reservation.ticksToEnd < 1000)))
          {
            if(this.metaData.holdCreeps.length < 1)
            {
              let max = 12;
              if(sRoom.energyAvailable < sRoom.energyCapacityAvailable * 0.50)
              {
                max = 3;
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
            if(this.metaData.holdCreeps.length < 1 && !flag.memory.enemies)
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

          // Construction Code
          if(!this.roomData().sourceContainers || (this.roomData().sourceContainers.length < this.roomData().sources.length))
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

              let dieingCreeps = _.filter(creeps, (cr) => {
                return (cr.ticksToLive && cr.ticksToLive > (cr.body.length * 3));
              })

              if(this.metaData.harvestCreeps[s.id].length < 1 || (dieingCreeps.length !== this.metaData.harvestCreeps[s.id].length))
              {
                console.log("Need to make some harvesting creeps " + s.id);
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
                this.kernel.addProcessIfNotExist(HoldHarvesterLifetimeProcess, 'holdHarvesterlf-' + c.name, 27, {
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

                let creepNames = Utils.clearDeadCreeps(this.metaData.distroCreeps[sc.id]);
                this.metaData.distroCreeps[sc.id] = creepNames;
                let creeps = Utils.inflateCreeps(creepNames);

                if(this.metaData.distroCreeps[sc.id].length < 2)
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
                        flagName: flag.name
                        });
                });
            });
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