import {Process} from '../../os/process'
import {Utils} from '../../lib/utils'

import {HarvesterLifetimeProcess} from '../lifetimes/harvester'
import {DistroLifetimeProcess} from '../lifetimes/distro'
import {UpgraderLifetimeProcess} from '../lifetimes/upgrader'
import { SpinnerLifetimeProcess } from 'processTypes/lifetimes/spinner';
import { LinkHarvesterLifetimeProcess } from 'processTypes/lifetimes/linkHarvester';
import { UpgradeDistroLifetimeProcess } from 'processTypes/lifetimes/upgradeDistro';
import { DistroLifetimeOptProcess } from '../lifetimes/distroOpt';
import { AutomaticHoldManagementProcess } from './automaticHold'
import { ENERGY_KEEP_AMOUNT } from 'processTypes/buildingProcesses/mineralTerminal'

export class EnergyManagementProcess extends Process{
  metaData: EnergyManagementMetaData

  type = 'em'

  ensureMetaData(){
    if(!this.metaData.harvestCreeps)
      this.metaData.harvestCreeps = {}

    if(!this.metaData.distroCreeps)
      this.metaData.distroCreeps = {}

    if(!this.metaData.upgradeCreeps)
      this.metaData.upgradeCreeps = []

    if(!this.metaData.spinCreeps)
      this.metaData.spinCreeps = []

    if(!this.metaData.upgradeDistroCreeps)
      this.metaData.upgradeDistroCreeps = []

    if(!this.metaData.visionCreeps)
      this.metaData.visionCreeps = []
  }

  runRoomVisuals(room: Room)
  {
    room.visual.text('RCL ' + (room.controller.progress / room.controller.progressTotal) * 100, 5,3, {color: 'white', align: 'left'});

    /*if(room.name === 'E41S49')
    {
      console.log(this.name, 'Problem', 1)
      let costs = PathFinder.CostMatrix.deserialize(room.memory.rampartCostMatrix);
      for(let x = 1; x < 49; x++)
      {
        for(let y = 1; y < 49; y++)
        {

          room.visual.text(costs.get(x, y).toString(), x, y, { color: 'yellow', font: 0.6 });
        }
      }
    }*/
  }

  run(){
    this.ensureMetaData()
    if(!this.kernel.data.roomData[this.metaData.roomName])
    {
      this.completed = true
      return
    }


    let room = Game.rooms[this.metaData.roomName];
    const seige = room.memory.seigeDetected;

    if(room.controller && room.controller.my)
    {
      this.runRoomVisuals(room)
      if(room && room.memory.assisted)
      {
        this.metaData.visionCreeps = Utils.clearDeadCreeps(this.metaData.visionCreeps);

        if(this.metaData.visionCreeps.length < 1)
        {
          let creepName = 'vis-' + this.metaData.roomName + '-' + Game.time;
          let spawned = Utils.spawn(
            this.kernel,
            this.metaData.roomName,
            'harvester',
            creepName,
            {
              max: 3
            }
          )
        }
      }
      else
      {
        let proc = this
        let sources = this.kernel.data.roomData[this.metaData.roomName].sources;
        let sourceContainers = this.kernel.data.roomData[this.metaData.roomName].sourceContainers;
        let sourceLinks = this.kernel.data.roomData[this.metaData.roomName].sourceLinks;

        _.forEach(sources, function(source)
        {
          if(!proc.metaData.harvestCreeps[source.id])
            proc.metaData.harvestCreeps[source.id] = []

          let creepNames = Utils.clearDeadCreeps(proc.metaData.harvestCreeps[source.id])
          proc.metaData.harvestCreeps[source.id] = creepNames
          let creeps = Utils.inflateCreeps(creepNames)

          let count = 0;
          _.forEach(creeps, (c) => {
            let  ticksNeeded = c.body.length * 3;
            if(!c.ticksToLive || c.ticksToLive > ticksNeeded) { count++; }
          });

          let controller = source.room.controller;
          let numberOfHarvesters = 0;
          if(controller && controller.my)
          {
            switch(controller.level)
            {
              case 1:
                numberOfHarvesters = 4;
                break;
              case 2:
                numberOfHarvesters = 4;
                break;
              case 3:
                numberOfHarvesters = 3;
                break;
              case 4:
              case 5:
              case 6:
              case 7:
              case 8:
                numberOfHarvesters = 1;
                break;
              default:
                numberOfHarvesters = 1;
                break;
            }
          }



          let openSpots = source.pos.openAdjacentSpots(true);
          if(openSpots.length === 1)
          {
            let container = openSpots[0].lookForStructures(STRUCTURE_CONTAINER);
            if(container)
              numberOfHarvesters = 1;
          }


          if(count < numberOfHarvesters && !seige) //300
          {
            let creepName = 'em-' + proc.metaData.roomName + '-' + Game.time
            let spawned = false;
            let room = source.room;
            if(room)
            {
              let controller = room.controller;
              if(controller && controller.level >= 8)
              {
                spawned = Utils.spawn(
                  proc.kernel,
                  proc.metaData.roomName,
                  'harvester',
                  creepName,
                  {
                    addition: 'bigHarvester',
                    max: 16
                  }
                )
              }
              else
              {
                spawned = Utils.spawn(
                  proc.kernel,
                  proc.metaData.roomName,
                  'harvester',
                  creepName,
                  {}
                )
              }
            }

            if(spawned){
              proc.metaData.harvestCreeps[source.id].push(creepName)
            }
          }

          _.forEach(creeps, function(creep){
            if(sourceLinks.length === 2  && sourceContainers.length === 2)
            {
              if(!proc.kernel.hasProcess('lhlf-' + creep.name))
              {
                proc.kernel.addProcess(LinkHarvesterLifetimeProcess, 'lhlf-' + creep.name, 49, {
                  creep: creep.name,
                  source: source.id
                })
              }
            }
            else
            {
              if(!proc.kernel.hasProcess('hlf-' + creep.name)){
                proc.kernel.addProcess(HarvesterLifetimeProcess, 'hlf-' + creep.name, 49, {
                  creep: creep.name,
                  source: source.id
                })
              }
            }
          })
        })

        _.forEach(this.kernel.data.roomData[this.metaData.roomName].sourceContainers, function(container){
          let count = 0;
          if(proc.metaData.distroCreeps[container.id])
          {
            let creep = Game.creeps[proc.metaData.distroCreeps[container.id]]
            if(!creep){
              delete proc.metaData.distroCreeps[container.id]
              return
            }
            else
            {
              let ticksNeeded = creep.body.length * 3;
              if(!creep.ticksToLive || creep.ticksToLive > ticksNeeded)
              {
                count++;
              }
            }
          }

          if(count < 1)
          {
            let creepName = 'em-m-' + proc.metaData.roomName + '-' + Game.time
            let spawned = Utils.spawn(
              proc.kernel,
              proc.metaData.roomName,
              'mover',
              creepName,
              {}
            )

            if(spawned){
              proc.metaData.distroCreeps[container.id] = creepName
              proc.kernel.addProcess(DistroLifetimeOptProcess, 'dlfOpt-' + creepName, 48, {
                sourceContainer: container.id,
                creep: creepName
              })
            }
          }
        })

        this.metaData.upgradeCreeps = Utils.clearDeadCreeps(this.metaData.upgradeCreeps)

        if(room?.controller?.my && room.controller.level === 8)
        {
          if(room.controller.ticksToDowngrade === 200000)
            room.memory.pauseUpgrading = true;
          else if(room.controller.ticksToDowngrade < 154000)
            room.memory.pauseUpgrading = false;
        }

        room.memory.pauseUpgrading = false;

        if(!room.memory.pauseUpgrading || room.controller.level < 8)
        {
          let creeps = Utils.inflateCreeps(this.metaData.upgradeCreeps);

          let count = 0;
          _.forEach(creeps, (c) => {
            let ticksNeeded = c.body.length * 3;
            if(!c.ticksToLive || c.ticksToLive > ticksNeeded) { count++; }
          })

          let upgraders = 0;
          switch(this.metaData.roomName)
          {
            case 'E38S35':
              upgraders = 1;
              break;
            case 'E36S33':
              upgraders = 1;
              break;
            default:
              upgraders = 1;
              break;
          }

          if(room && room.controller!.level == 8)
          {
            upgraders = 1;
          }

          if(count < upgraders && this.kernel.data.roomData[this.metaData.roomName].generalContainers.length > 0 && !seige)
          {
            let creepName = 'em-u-' + proc.metaData.roomName + '-' + Game.time
            let spawned = false;
            if(this.kernel.data.roomData[this.metaData.roomName].controllerContainer)
            {
              if(Game.rooms[proc.metaData.roomName].controller!.level === 8)
              {
                spawned = Utils.spawn(
                  proc.kernel,
                  proc.metaData.roomName,
                  'upgrader1',
                  creepName,
                  {}
                );
              }
              else
              {
                spawned = Utils.spawn(
                  proc.kernel,
                  proc.metaData.roomName,
                  'upgrader',
                  creepName,
                  {}
                );
              }
            }
            else
            {
              spawned = Utils.spawn(
                proc.kernel,
                proc.metaData.roomName,
                'worker',
                creepName,
                {}
              );
            }

            if(spawned)
            {
              this.metaData.upgradeCreeps.push(creepName)

              if(Game.rooms[proc.metaData.roomName].controller!.level >= 8 && proc.kernel.hasProcess('labm-' + proc.metaData.roomName))
              {
                let noUpgradeRooms = ['E52S46', 'E48S49', 'E39S35', 'E41S41', 'E41S38', 'E36S43', 'E38S46',
  /* temp no upgrades*/               'E43S52', 'E43S53', 'E43S55', 'E45S57', 'E48S57', 'E48S56', 'E58S52',
                                      'E41S49', 'E38S59', 'E39S35', 'E41S41', 'E42S48', 'E58S44']
                // if(_.indexOf(noUpgradeRooms, proc.metaData.roomName) === -1)
                // {
                //   let boosts = [];
                //   boosts.push(RESOURCE_GHODIUM_ACID)
                //   this.kernel.addProcessIfNotExist(UpgraderLifetimeProcess, 'ulf-' + creepName, 30, {
                //     creep: creepName,
                //     roomName: proc.metaData.roomName,
                //     boosts: boosts,
                //     allowUnboosted: true
                //   })
                // }
                // else
                // {
                  this.kernel.addProcess(UpgraderLifetimeProcess, 'ulf-' + creepName, 30, {
                    creep: creepName,
                    roomName: proc.metaData.roomName
                  });
                //}
              }
              else if(room.controller.level < 8 && room.find(FIND_MY_STRUCTURES, {filter: s => s.structureType === STRUCTURE_LAB}).length >= 3)
              {
                let boosts = [];
                boosts.push(RESOURCE_CATALYZED_GHODIUM_ACID)
                this.kernel.addProcessIfNotExist(UpgraderLifetimeProcess, 'ulf-' + creepName, 30, {
                  creep: creepName,
                  roomName: proc.metaData.roomName,
                  boosts: boosts,
                  allowUnboosted: false
                })
              }
              else
              {
                this.kernel.addProcess(UpgraderLifetimeProcess, 'ulf-' + creepName, 30, {
                  creep: creepName,
                  roomName: proc.metaData.roomName
                });
              }
            }
          }
        }

        if(this.kernel.data.roomData[this.metaData.roomName].storageLink
            &&
          (this.metaData.upgradeCreeps.length > 0 || room.memory.pauseUpgrading)
            &&
          Object.keys(this.metaData.distroCreeps).length >= 2)
        {
          let storageLink = this.kernel.data.roomData[this.metaData.roomName].storageLink

          this.metaData.spinCreeps = Utils.clearDeadCreeps(this.metaData.spinCreeps)

          if(this.metaData.spinCreeps.length < 1 && storageLink ) //&& (this.kernel.data.roomData[this.metaData.roomName].sourceLinks.length > 0))
          {
            let creepName = 'em-s-' + proc.metaData.roomName + '-' + Game.time;
            let spawned = Utils.spawn(
              proc.kernel,
              proc.metaData.roomName,
              'spinner',
              creepName,
              {}
            );

            if(spawned)
            {
              this.metaData.spinCreeps.push(creepName);
              this.kernel.addProcess(SpinnerLifetimeProcess, 'slf-' + creepName, 45, {
                creep: creepName,
                storageLink: storageLink.id
              })
            }
          }
        }

        if(!room.memory.pauseUpgrading || room.controller.level < 8)
        {
          if(this.kernel.data.roomData[this.metaData.roomName].controllerContainer)
          {
            this.metaData.upgradeDistroCreeps = Utils.clearDeadCreeps(this.metaData.upgradeDistroCreeps);
            let creeps = Utils.inflateCreeps(this.metaData.upgradeDistroCreeps)

            let count = 0;
            _.forEach(creeps, (c) => {
              let ticksNeeded = c.body.length * 3 + 25;
              if(!c.ticksToLive || c.ticksToLive > ticksNeeded) { count++; }
            })
            let upgradeDistroAmount = 1;

            switch(this.metaData.roomName)
            {
              case 'E44S42':
                upgradeDistroAmount = 1;
                break;
              default:
                upgradeDistroAmount = 1;
                break;
            }

            if(Game.rooms[this.metaData.roomName].controller!.level >= 8)
            {
              upgradeDistroAmount = 1;
            }

            if(count < upgradeDistroAmount && !seige)
            {
              let creepName = 'em-ud-' + proc.metaData.roomName + '-' + Game.time;
              let spawned = false;

              if(!this.kernel.data.roomData[this.metaData.roomName].controllerContainer)
              {
                spawned = Utils.spawn(
                  proc.kernel,
                  proc.metaData.roomName,
                  'mover',
                  creepName,
                  {}
                )
              }
              else
              {
                spawned = Utils.spawn(
                  proc.kernel,
                  proc.metaData.roomName,
                  'bigMover',
                  creepName,
                  {max: 48}
                );
              }

              if(spawned)
              {
                this.metaData.upgradeDistroCreeps.push(creepName);
                this.kernel.addProcess(UpgradeDistroLifetimeProcess, 'udlf-' + creepName, 25, {
                  creep: creepName
                })
              }
            }

          }
        }
      }

      //this.remoteChecking(room)
      if(room.controller?.level >= 8 && room.storage.store[RESOURCE_ENERGY] > (ENERGY_KEEP_AMOUNT * 2))
        this.processPower(room)
    }
    else
    {
      this.completed = true;
      return;
    }
  }

  remoteChecking(room: Room)
  {
    try
    {
        let storage = room.storage;
        if(storage?.store.getUsedCapacity() > 750000)
          room.memory.remoteHarvesting = false;

        if(room.memory.surroundingRooms !== undefined
          && (storage?.store.getUsedCapacity(RESOURCE_ENERGY) < 500000 || room.memory.remoteHarvesting))
        {
          if(room.memory.remoteHarvesting === false)
          {
            let surroundingRooms = room.memory.surroundingRooms;

            const roomName = _.find(Object.keys(surroundingRooms), (sr) => {
              if(!surroundingRooms[sr].harvesting && surroundingRooms[sr].sourceNumbers == 2)
              {
                if(Game.map.findExit(room.name, sr) !== ERR_NO_PATH)
                {
                  return true;
                }
              }
            });

            if(roomName !== undefined)
            {
              console.log(this.name, 'Found a room', roomName);
              surroundingRooms[roomName].harvesting = true;
              room.memory.surroundingRooms = surroundingRooms;
              room.memory.remoteHarvesting = true;
            }
          }

          if(room.memory.remoteHarvesting)
          {
            let count = 0;
            _.forEach(Object.keys(room.memory.surroundingRooms), (sr) => {
              if(room.memory.surroundingRooms[sr].harvesting)
                this.kernel.addProcessIfNotExist(AutomaticHoldManagementProcess, 'ahmp-' + sr, 35, {
                  roomName: room.name,
                  remoteName: sr,
                  controllerPos: room.memory.surroundingRooms[sr].controllerPos});
            });
          }


          console.log(this.name, 'Flag should be coming');
        }

    }
    catch (error)
    {
      console.log(this.name, 'remoteChecking', error);
    }
  }

  processPower(room: Room)
  {
    try
    {
      const powerSpawn = this.kernel.data.roomData[this.metaData.roomName].powerSpawn;
      if(powerSpawn?.store.getUsedCapacity(RESOURCE_POWER) !== 0)
      {
        powerSpawn.processPower();
        return;
      }
    }
    catch (error)
    {
      console.log(this.name, 'processPower', error)
    }
  }
}
