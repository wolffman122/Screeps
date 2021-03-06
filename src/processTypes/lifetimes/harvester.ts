import { LifetimeProcess } from '../../os/process'
import { UpgradeProcess } from '../creepActions/upgrade'

export class HarvesterLifetimeProcess extends LifetimeProcess {
  type = 'hlf'

  run() {

    let creep = this.getCreep()

    console.log(this.name, creep.name);
    if (!creep) {
      this.completed = true;
      return;
    }

    if (creep.room.memory.shutdown) {
      //this.completed = true;
      return;
    }

    if (creep.name === 'em-E27S38-27341448' || creep.name === 'em-E27S38-27341548')
      console.log(this.name, '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!exists')

    if (creep.store.getUsedCapacity() === 0 || creep.memory.filling) {
      creep.memory.filling = true;
      let source = <Source>Game.getObjectById(this.metaData.source)
      if (source)
      {
        let targetPos = source.pos
        let targetRange = 1

        if (this.kernel.data.roomData[source.room.name].sourceContainerMaps[source.id])
        {
          if (creep.getActiveBodyparts(WORK) >= 6)
          {
            targetPos = this.kernel.data.roomData[source.room.name].sourceContainerMaps[source.id].pos
            if (!creep.pos.isEqualTo(targetPos)) {
              creep.travelTo(targetPos);
              return;
            }
          }
        }

        if (creep.name === 'em-E43S55-26175039')
          console.log(this.name, 'Source container map issue move to the container')

        if (!creep.pos.inRangeTo(targetPos, targetRange)) {
          creep.travelTo(targetPos);
        }
        else
        {
          let container = this.kernel.data.roomData[source.room.name].sourceContainerMaps[source.id];
          if (container) {
            if (container.store.getUsedCapacity() == container.storeCapacity) {
              this.suspend = 5;
            }
          }

          if (creep.harvest(source) === ERR_NOT_ENOUGH_RESOURCES)
            this.suspend = source.ticksToRegeneration
          else if (creep.store.getUsedCapacity() === creep.carryCapacity)
            creep.memory.filling = false;
        }
      }
      return
    }

    if (creep.name === 'em-E43S55-26175039')
      console.log(this.name, 1)
    // Creep has been harvesting and has energy put it in source links
    if (this.kernel.data.roomData[creep.room.name].sourceLinkMaps[this.metaData.source]) {
      if (creep.room.name === 'E32S44')
        console.log(this.name, 2)
      let link = this.kernel.data.roomData[creep.room.name].sourceLinkMaps[this.metaData.source];

      if (link.energy < link.energyCapacity) {
        if (creep.name === 'em-E32S44-21171336')
          console.log(this.name, 2);

        if (!creep.pos.inRangeTo(link, 1)) {
          if (!creep.fixMyRoad()) {
            creep.travelTo(link);
          }
        }

        if (creep.name === 'em-E32S44-21171336')
          console.log(this.name, 3);

        creep.transfer(link, RESOURCE_ENERGY);
        return;
      }
    }

    if (creep.room.name === 'E32S44')
      console.log(this.name, 3)
    // Creep has been harvesting and has energy in it
    if (this.kernel.data.roomData[creep.room.name].sourceContainerMaps[this.metaData.source]) {
      if (creep.room.name === 'E32S44')
        console.log(this.name, 4)
      let container = this.kernel.data.roomData[creep.room.name].sourceContainerMaps[this.metaData.source]
      if (container.store.getUsedCapacity() < container.storeCapacity) {
        if (!creep.pos.inRangeTo(container, 1)) {
          if (!creep.fixMyRoad()) {
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

    deliverTargets = _.filter(targets, function (target: DeliveryTarget) {
      return (target.energy < target.energyCapacity)
    })

    if (creep.room.storage && deliverTargets.length === 0) {
      let targets = [].concat(
        <never[]>[creep.room.storage]
      )

      deliverTargets = _.filter(targets, function (target: DeliveryTarget) {
        return (target.store.getUsedCapacity(RESOURCE_ENERGY) < target.storeCapacity)
      })
    }

    if (deliverTargets.length === 0) {
      // If there is no where to deliver to
      this.kernel.addProcess(UpgradeProcess, creep.name + '-upgrade', this.priority, {
        creep: creep.name
      })

      this.suspend = creep.name + '-upgrade'
      return
    }

    // Find the nearest target
    let target = <Structure>creep.pos.findClosestByPath(deliverTargets)

    if (creep.pos.isNearTo(target)) {
      creep.transfer(target, RESOURCE_ENERGY);
      return;
    }

    creep.travelTo(target);
    return;
  }
}
