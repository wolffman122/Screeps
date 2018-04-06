import {Utils} from '../../lib/utils'
import {Process} from '../../os/process'
import {BuilderLifetimeProcess} from '../lifetimes/builder'
import {RepairerLifetimeProcess} from '../lifetimes/repairer'
import { DismantleLifetimeProcess } from 'processTypes/lifetimes/dismantler';

export class StructureManagementProcess extends Process{
  metaData: StructureManagementProcessMetaData
  type = 'sm'

  ensureMetaData(){
    if(!this.metaData.spareCreeps)
      this.metaData.spareCreeps = []

    if(!this.metaData.buildCreeps)
      this.metaData.buildCreeps = []

    if(!this.metaData.repairCreeps)
      this.metaData.repairCreeps = []

    if(!this.metaData.dismantleCreeps)
      this.metaData.dismantleCreeps = []
  }

  run(){
    this.ensureMetaData()

    if(!this.kernel.data.roomData[this.metaData.roomName]){
      this.completed = true
      return
    }

    let constructionSites = _.filter(this.kernel.data.roomData[this.metaData.roomName].constructionSites, (cs) => {
      return (cs.structureType != STRUCTURE_RAMPART);
    })
    let numBuilders = _.min([Math.ceil(constructionSites.length / 10), 3, constructionSites.length])

    this.metaData.buildCreeps = Utils.clearDeadCreeps(this.metaData.buildCreeps)
    this.metaData.repairCreeps = Utils.clearDeadCreeps(this.metaData.repairCreeps)
    this.metaData.spareCreeps = Utils.clearDeadCreeps(this.metaData.spareCreeps)
    this.metaData.dismantleCreeps = Utils.clearDeadCreeps(this.metaData.dismantleCreeps);

    if(this.metaData.buildCreeps.length < numBuilders){
      if(this.metaData.spareCreeps.length === 0){
        let creepName = 'sm-' + this.metaData.roomName + '-' + Game.time
        let spawned = Utils.spawn(this.kernel, this.metaData.roomName, 'worker', creepName, {})
        if(spawned){
          this.metaData.buildCreeps.push(creepName)
          this.kernel.addProcess(BuilderLifetimeProcess, 'blf-' + creepName, 30, {
            creep: creepName
          })
        }
      }else{
        let creepName = <string>this.metaData.spareCreeps.pop()
        this.metaData.buildCreeps.push(creepName)
        this.kernel.addProcess(BuilderLifetimeProcess, 'blf-' + creepName, 30, {
          creep: creepName
        })
      }
    }

    let repairableObjects = <Structure[]>[].concat(
      <never[]>this.kernel.data.roomData[this.metaData.roomName].containers,
      <never[]>this.kernel.data.roomData[this.metaData.roomName].roads
    )

    let repairTargets = _.filter(repairableObjects, function(object){
      return (object.hits < object.hitsMax)
    })

    if(repairTargets.length > 0)
    {
      if(Game.rooms[this.metaData.roomName].controller!.level === 8)
      {
        if(this.metaData.repairCreeps.length < 2)
        {
          if(this.metaData.spareCreeps.length === 0)
          {
            let creepName = 'sm-' + this.metaData.roomName + '-' + Game.time
            let spawned = Utils.spawn(this.kernel, this.metaData.roomName, 'worker', creepName, {})
            if(spawned){
              this.metaData.repairCreeps.push(creepName)
              this.kernel.addProcess(RepairerLifetimeProcess, 'rlf-' + creepName, 29, {
                creep: creepName,
                roomName: this.metaData.roomName
              })
            }
          }
          else
          {
            let creepName = <string>this.metaData.spareCreeps.pop()
            this.metaData.repairCreeps.push(creepName)
            this.kernel.addProcess(RepairerLifetimeProcess, 'rlf-' + creepName, 29, {
              creep: creepName,
              roomName: this.metaData.roomName
            })
          }
        }
      }
      else
      {
        if(this.metaData.repairCreeps.length == 0)
        {
          if(this.metaData.spareCreeps.length === 0)
          {
            let creepName = 'sm-' + this.metaData.roomName + '-' + Game.time
            let spawned = Utils.spawn(this.kernel, this.metaData.roomName, 'worker', creepName, {})
            if(spawned){
              this.metaData.repairCreeps.push(creepName)
              this.kernel.addProcess(RepairerLifetimeProcess, 'rlf-' + creepName, 29, {
                creep: creepName,
                roomName: this.metaData.roomName
              })
            }
          }
          else
          {
            let creepName = <string>this.metaData.spareCreeps.pop()
            this.metaData.repairCreeps.push(creepName)
            this.kernel.addProcess(RepairerLifetimeProcess, 'rlf-' + creepName, 29, {
              creep: creepName,
              roomName: this.metaData.roomName
            })
          }
        }
      }
    }

    let enemyExtensions = <Structure[]>[].concat(
      <never[]>this.kernel.data.roomData[this.metaData.roomName].enemyExtensions,
    )

    let targets = _.filter(enemyExtensions, function(ee: StructureExtension){
      return (ee.energy === 0);
    });

    if(targets.length > 0)
    {
      if(this.metaData.dismantleCreeps.length === 0)
      {
        if(this.metaData.spareCreeps.length === 0)
        {
          let creepName = 'sm-' + this.metaData.roomName + '-' + Game.time;
          let spawned = Utils.spawn(this.kernel, this.metaData.roomName, 'worker', creepName, {})
          if(spawned)
          {
            this.metaData.dismantleCreeps.push(creepName);
            this.kernel.addProcess(DismantleLifetimeProcess, 'dislf-' + creepName, 28, {
              creep: creepName,
              roomName: this.metaData.roomName
            })
          }
        }
        else
        {
          let creepName = <string>this.metaData.spareCreeps.pop();
          this.metaData.dismantleCreeps.push(creepName);
          this.kernel.addProcess(DismantleLifetimeProcess, 'dislf-' + creepName, 28, {
            creep: creepName,
            roomName: this.metaData.roomName
          });
        }
      }
    }
  }
}
