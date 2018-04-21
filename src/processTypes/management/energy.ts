import {Process} from '../../os/process'
import {Utils} from '../../lib/utils'

import {HarvesterLifetimeProcess} from '../lifetimes/harvester'
import {DistroLifetimeProcess} from '../lifetimes/distro'
import {UpgraderLifetimeProcess} from '../lifetimes/upgrader'
import { SpinnerLifetimeProcess } from 'processTypes/lifetimes/spinner';
import { LinkHarvesterLifetimeProcess } from 'processTypes/lifetimes/linkHarvester';
import { UpgradeDistroLifetimeProcess } from 'processTypes/lifetimes/upgradeDistro';

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
  }

  run(){
    this.ensureMetaData()

    if(!this.kernel.data.roomData[this.metaData.roomName])
    {
      this.completed = true
      return
    }

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
      let workRate = Utils.workRate(creeps, 2)

      let dividend = 300
      if(Game.rooms[proc.metaData.roomName].controller!.level < 3)
      {
        dividend = 150;
      }


      if(workRate < source.energyCapacity / dividend) //300
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
      if(proc.metaData.distroCreeps[container.id])
      {
        let creep = Game.creeps[proc.metaData.distroCreeps[container.id]]
        if(!creep){
          delete proc.metaData.distroCreeps[container.id]
          return
        }
      }
      else
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
          proc.kernel.addProcess(DistroLifetimeProcess, 'dlf-' + creepName, 48, {
            sourceContainer: container.id,
            creep: creepName
          })
        }
      }
    })

    this.metaData.upgradeCreeps = Utils.clearDeadCreeps(this.metaData.upgradeCreeps)

    let upgraders = 0;
    switch(this.metaData.roomName)
    {
      case 'E42S48':
        upgraders = 5;
        break;
      default:
        upgraders = 1;
        break;
    }

    let room = Game.rooms[this.metaData.roomName];

    if(room && room.controller!.level == 8)
    {
      upgraders = 1;
    }

    if(this.metaData.upgradeCreeps.length < upgraders && this.kernel.data.roomData[this.metaData.roomName].generalContainers.length > 0)
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

      if(spawned){
        this.metaData.upgradeCreeps.push(creepName)
        this.kernel.addProcess(UpgraderLifetimeProcess, 'ulf-' + creepName, 30, {
          creep: creepName
        })
      }
    }

    if(this.kernel.data.roomData[this.metaData.roomName].storageLink
        &&
       this.metaData.upgradeCreeps.length > 0
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

    if(this.kernel.data.roomData[this.metaData.roomName].controllerContainer)
    {
      this.metaData.upgradeDistroCreeps = Utils.clearDeadCreeps(this.metaData.upgradeDistroCreeps);

      let upgradeDistroAmount = 1;

      switch(this.metaData.roomName)
      {
        case 'E42S48':
          upgradeDistroAmount = 2;
          break;
        default:
          upgradeDistroAmount = 1;
          break;
      }

      if(Game.rooms[this.metaData.roomName].controller!.level >= 8)
      {
        upgradeDistroAmount = 1;
      }

      if(this.metaData.upgradeDistroCreeps.length < upgradeDistroAmount)
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
          if(upgraders == 4)
          {
            spawned = Utils.spawn(
              proc.kernel,
              proc.metaData.roomName,
              'bigMover',
              creepName,
              {max: 48}
            )
          }
          else
          {
            spawned = Utils.spawn(
              proc.kernel,
              proc.metaData.roomName,
              'bigMover',
              creepName,
              {}
            )
          }
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
