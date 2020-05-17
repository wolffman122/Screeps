import { Process } from "os/process";
import { Utils } from "lib/utils";
import { HolderDefenderLifetimeProcess } from "processTypes/empireActions/lifetimes/holderDefender";
import { HolderLifetimeProcess } from "processTypes/empireActions/lifetimes/holder";
import { HoldBuilderLifetimeProcess } from "processTypes/empireActions/lifetimes/holderBuilder";
import { HoldHarvesterOptLifetimeProcess } from "processTypes/empireActions/lifetimes/holderHarvesterOpt";
import { HoldDistroLifetimeProcess } from "processTypes/empireActions/lifetimes/holderDistro";

export class AutomaticHoldManagementProcess extends Process
{
  type = 'ahmp';
  metaData: AutomaticHoldManagementProcessMetaData;

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
    console.log(this.name, this.type, '***************************************');
    console.log(this.name, this.type,2, '***************************************');


    let defenderCount = 0;
    if(Game.cpu.bucket < 2000)
      return;

    this.ensureMetaData();
    let spawnRoomName = this.metaData.roomName;
    let centerFlag = Game.flags['Center-'+spawnRoomName];
    let remoteRoom = Game.rooms[this.metaData.remoteName];

    console.log(this.name, spawnRoomName, centerFlag);

    this.completed = true;
    return;
    /*
    let enemiesPresent = false;
    if(remoteRoom?.memory?.enemies)
      enemiesPresent = remoteRoom.memory.enemies;

    console.log(this.name, 1)
    let enemies: Creep[]
    if(Game.time % 10 === 7 && remoteRoom)
    {
      enemies = remoteRoom.find(FIND_HOSTILE_CREEPS);
      enemies = _.filter(enemies, (e: Creep)=> {
        return (e.getActiveBodyparts(ATTACK) > 0 || e.getActiveBodyparts(RANGED_ATTACK) > 0);
      });
      enemiesPresent = enemies.length ? true : false;

      remoteRoom.memory.enemies = enemiesPresent;
      if(enemiesPresent)
      {
        //console.log("Hold room enemies present" + this.metaData.remoteName);
      }
    }

    console.log(this.name, 2)

    if(enemiesPresent && remoteRoom)
    {
      enemies = remoteRoom.find(FIND_HOSTILE_CREEPS);
      enemies = _.filter(enemies, (e: Creep)=> {
        return (e.getActiveBodyparts(ATTACK) > 0 || e.getActiveBodyparts(RANGED_ATTACK) > 0);
      });

      defenderCount = enemies.length;
      let bodyMakeup: BodyPartConstant[] = [];
      _.forEach(enemies, (e)=>{
        bodyMakeup = e.getBodyParts();
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
      if(this.metaData.defenderCreeps.length < defenderCount)
      {
        let creepName = 'hrm-defender-' + this.metaData.remoteName + '-' + Game.time;
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
            remoteName: this.metaData.remoteName,
            spawnRoomName: spawnRoomName
          })
        }
      }
    }

    console.log(this.name, 3)


    if(centerFlag)
    {
      let room = Game.rooms[this.metaData.remoteName];

      this.metaData.holdCreeps = Utils.clearDeadCreeps(this.metaData.holdCreeps);

      if(!room)
      {
        // No vision in room.
        if(this.metaData.holdCreeps.length < 1)
        {
          let creepName = 'hrm-hold-' + this.metaData.remoteName + '-' + Game.time;
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
              remoteName: this.metaData.remoteName,
              spawnRoomName: spawnRoomName
            })
          }
        }
      }
      else
      {
        let sRoom = Game.rooms[spawnRoomName];

        if(sRoom.controller?.level >= 8
          &&
          (room.controller?.reservation?.ticksToEnd < 1000
            || room.controller.reservation?.username !== 'wolffman122'))
        {
          if(this.metaData.holdCreeps.length < 1 && !enemiesPresent)
          {
            let max = 16;
            if(sRoom.energyAvailable < sRoom.energyCapacityAvailable * 0.50)
            {
              max = 4;
            }

            let creepName = 'hrm-hold-' + this.metaData.remoteName + '-' + Game.time;
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
                remoteName: this.metaData.remoteName
              })
            }
          }
        }
        else if(sRoom.controller!.level < 8)
        {
          if(this.metaData.holdCreeps.length < 1)
          {
            let creepName = 'hrm-hold-' + this.metaData.remoteName + '-' + Game.time;
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

        if(this.roomInfo(this.metaData.remoteName))
        {
          // Construction Code
          if(this.roomInfo(this.metaData.remoteName).sourceContainers?.length < this.roomInfo(this.metaData.remoteName).sources.length)
          {
            if(Game.time % 10000 === 100)
              Game.notify("Problem in room " + this.metaData.roomName + " lost some contianers");

            if(this.metaData.builderCreeps.length < this.roomInfo(this.metaData.remoteName).sources.length)
            {
              let creepName = 'hrm-build-' + this.metaData.remoteName + '-' + Game.time;
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
                  remoteName: this.metaData.remoteName
                })
              }
            }
          }
          else if(this.roomInfo(this.metaData.remoteName).constructionSites.length > 0)
          {
            if(this.metaData.builderCreeps.length < this.roomInfo(this.metaData.remoteName).sources.length)
            {
              let creepName = 'hrm-build-' + this.metaData.remoteName + '-' + Game.time;
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

          if(this.roomInfo(this.metaData.remoteName).sourceContainers.length > 0)
          {
            // Havester code
            let containers = this.roomInfo(this.metaData.remoteName).sourceContainers;
            let sources = this.roomInfo(this.metaData.remoteName).sources;

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
                let ticksNeeded = c.body.length * 3 + distance;
                if(!c.ticksToLive || c.ticksToLive > ticksNeeded)
                {
                  count++;
                }
              })

              if(count < 1)
              {
                //console.log("Need to make some harvesting creeps " + s.id);
                let creepName = 'hrm-harvest-' + this.metaData.remoteName + '-' + Game.time;
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
                  remoteName: this.metaData.remoteName,
                  spawnRoomName: this.metaData.roomName
                });
              });
            });

            // Hauling code
            _.forEach(this.roomInfo(this.metaData.remoteName).sourceContainers, (sc) => {
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
              if(this.metaData.distroDistance[sc.id] < 70)
              {
                numberDistro = 1;
              }

              if(count < numberDistro)
              {
                let creepName = 'hrm-m-' + this.metaData.remoteName + '-' + Game.time;
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
                  remoteName: this.metaData.remoteName
                });
              });
            });
          }
        }
      }
    }*/
  }
}
