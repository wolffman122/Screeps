import {LifetimeProcess} from '../../os/process'
import {UpgradeProcess} from '../creepActions/upgrade'

export class HarvesterLifetimeProcess extends LifetimeProcess{
  type = 'hlf'

  run(){
    let creep = this.getCreep()

    if(!creep){ return }

    if(_.sum(creep.carry) === 0)
    {
      let source = <Source>Game.getObjectById(this.metaData.source)
      if(source)
      {
        let targetPos = source.pos
        let targetRange = 1

        if(this.kernel.data.roomData[source.room.name].sourceContainerMaps[source.id])
        {
          if(creep.getActiveBodyparts(WORK) >= 6)
          {
            targetPos = this.kernel.data.roomData[source.room.name].sourceContainerMaps[source.id].pos
            targetRange = 0
          }
        }


        if(!creep.pos.inRangeTo(targetPos, targetRange)){
          creep.travelTo(targetPos);
        }
        else
        {
          let container = this.kernel.data.roomData[source.room.name].sourceContainerMaps[source.id];
          if(container)
          {
            if(_.sum(container.store) == container.storeCapacity)
            {
              this.suspend = 5;
            }
          }

          if(creep.harvest(source) === ERR_NOT_ENOUGH_RESOURCES){
            this.suspend = source.ticksToRegeneration
          }
        }
      }
      return
    }

    // Creep has been harvesting and has energy put it in source links
    if(this.kernel.data.roomData[creep.room.name].sourceLinkMaps[this.metaData.source])
    {
      if(creep.name === 'em-E35S41-20892253')
        console.log(this.name, 1);
      let link = this.kernel.data.roomData[creep.room.name].sourceLinkMaps[this.metaData.source];

      if(link.energy < link.energyCapacity)
      {
        if(creep.name === 'em-E35S41-20892253')
        console.log(this.name, 2);

        if(!creep.pos.inRangeTo(link, 1))
        {
          if(!creep.fixMyRoad())
          {
            creep.travelTo(link);
          }
        }

        if(creep.name === 'em-E35S41-20892253')
        console.log(this.name, 3);

        creep.transfer(link, RESOURCE_ENERGY);
        return;
      }
    }

    // Creep has been harvesting and has energy in it
    if(this.kernel.data.roomData[creep.room.name].sourceContainerMaps[this.metaData.source]){
      let container = this.kernel.data.roomData[creep.room.name].sourceContainerMaps[this.metaData.source]
      if(_.sum(container.store) < container.storeCapacity){
        if(!creep.pos.inRangeTo(container, 1))
        {
          if(!creep.fixMyRoad())
          {
            creep.travelTo(container);
          }
        }

        creep.transfer(container, RESOURCE_ENERGY);
        return
      }
    }

    // Source Container does not exist OR source container is full
    let deliverTargets

    let targets = [].concat(
      <never[]>this.kernel.data.roomData[creep.room.name].spawns,
      <never[]>this.kernel.data.roomData[creep.room.name].extensions
    )

    deliverTargets = _.filter(targets, function(target: DeliveryTarget){
      return (target.energy < target.energyCapacity)
    })

    if(creep.room.storage && deliverTargets.length === 0){
      let targets = [].concat(
        <never[]>[creep.room.storage]
      )

      deliverTargets = _.filter(targets, function(target: DeliveryTarget){
        return (_.sum(target.store) < target.storeCapacity)
      })
    }

    if(deliverTargets.length === 0){
      // If there is no where to deliver to
      this.kernel.addProcess(UpgradeProcess, creep.name + '-upgrade', this.priority, {
        creep: creep.name
      })

      this.suspend = creep.name + '-upgrade'
      return
    }

    // Find the nearest target
    let target = <Structure>creep.pos.findClosestByPath(deliverTargets)

    if(creep.pos.isNearTo(target))
    {
      creep.transfer(target, RESOURCE_ENERGY);
      return;
    }

    creep.travelTo(target);
    return;
  }
}
