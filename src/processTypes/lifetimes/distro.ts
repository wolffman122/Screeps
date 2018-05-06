import {LifetimeProcess} from '../../os/process'

import {CollectProcess} from '../creepActions/collect'

export class DistroLifetimeProcess extends LifetimeProcess{
  type = 'dlf'

  run(){
    let creep = this.getCreep()

    if(!creep){ return }

    if(_.sum(creep.carry) === 0 && creep.ticksToLive! > 50)
    {
      if(creep.memory.storageDelivery == true)
      {
        creep.memory.storageDelivery = false;
        this.suspend = 5;
        return;
      }

      if(this.kernel.data.roomData[creep.pos.roomName].sourceLinks.length == 2)
      {
        let sourceContainer = Game.getObjectById<StructureContainer>(this.metaData.sourceContainer);

        if(sourceContainer && sourceContainer.store.energy > creep.carryCapacity)
        {
          this.fork(CollectProcess, 'collect-' + creep.name, this.priority - 1, {
            target: this.metaData.sourceContainer,
            creep: creep.name,
            resource: RESOURCE_ENERGY
          });

          return;
        }

        let storage = creep.room.storage;

        if(storage && storage.store.energy > 0)
        {
          this.fork(CollectProcess, 'collect-' + creep.name, this.priority -1, {
            target: storage.id,
            creep: creep.name,
            resource: RESOURCE_ENERGY
          })

          return;
        }

        let dropped = creep.room.find(FIND_DROPPED_RESOURCES);
        if(dropped.length > 0)
        {
          dropped = _.filter(dropped, (d) =>{
            if(d.resourceType === RESOURCE_ENERGY && d.amount >= creep!.carryCapacity)
            {
              return d;
            }
            return;
          });

          if(dropped.length > 0)
          {
            let target = creep.pos.findClosestByPath(dropped);

            if(!creep.pos.inRangeTo(target, 1))
            {
              creep.travelTo(target);
              return;
            }
            creep.pickup(target);
          }

        }

        // Pickup up extra from mineral container only if the room is full on energy.
        if(creep.room.energyAvailable === creep.room.energyCapacityAvailable && this.roomData().mineralContainer)
        {
          let container = this.roomData().mineralContainer;
          if(container && _.sum(container.store) > 0)
          {
            if(creep.pos.isNearTo(container))
            {
              creep.withdrawEverything(container);
            }
            else
            {
              creep.travelTo(container);
            }

            return;
          }
        }
      }
      else
      {
        let sourceContainer = Game.getObjectById<StructureContainer>(this.metaData.sourceContainer);

        if(sourceContainer && sourceContainer.store.energy >= creep.carryCapacity)
        {

          this.fork(CollectProcess, 'collect-' + creep.name, this.priority - 1, {
            target: this.metaData.sourceContainer,
            creep: creep.name,
            resource: RESOURCE_ENERGY
          })

          return;
        }
        else
        {
          let storage = creep.room.storage;

          if(storage && storage.store.energy > creep.carryCapacity)
          {
            this.fork(CollectProcess, 'collect-' + creep.name, this.priority -1, {
              target: storage.id,
              creep: creep.name,
              resource: RESOURCE_ENERGY
            })

            return;
          }
        }

      }
    }

    // If the creep has been refilled
    let targets = [].concat(
      <never[]>this.kernel.data.roomData[creep.room.name].spawns,
      <never[]>this.kernel.data.roomData[creep.room.name].extensions
    )

    if(creep.room.energyAvailable > creep.room.energyCapacityAvailable * .95)
    {
      targets = [].concat(
        <never[]>this.kernel.data.roomData[creep.room.name].spawns,
        <never[]>this.kernel.data.roomData[creep.room.name].extensions,
        <never[]>this.kernel.data.roomData[creep.room.name].towers
      )
    }

    let deliverTargets = _.filter(targets, function(target: DeliveryTarget){
      if(target.structureType == STRUCTURE_TOWER)
      {
        return (target.energy < target.energyCapacity * .80)
      }
      else
      {
        return (target.energy < target.energyCapacity)
      }
    })

    // Drop off at terminal if creep is carrying anything but energy.
    if(creep.room.terminal && _.sum(creep.carry) != creep.carry.energy)
    {
      if(creep.pos.isNearTo(creep.room.terminal!))
      {
        creep.transferEverything(creep.room.terminal);
      }
      else
      {
        creep.travelTo(creep.room.terminal);
      }
      return;
    }

    if(deliverTargets.length === 0){
      targets = [].concat(
        <never[]>this.kernel.data.roomData[creep.room.name].labs,
        <never[]>this.kernel.data.roomData[creep.room.name].generalContainers,
      )

      deliverTargets = _.filter(targets, function(target: DeliveryTarget){
        if(target.store){
          return (_.sum(target.store) < target.storeCapacity)
        }else{
          return (target.energy < target.energyCapacity)
        }
      })
    }

    if(deliverTargets.length === 0 && this.kernel.data.roomData[creep.room.name].nuker)
    {
      let nuker = this.kernel.data.roomData[creep.room.name].nuker;
      if(nuker && nuker.energy < nuker.energyCapacity)
      {
        deliverTargets = <never[]>[nuker];
      }
    }

    if(deliverTargets.length === 0 && creep.room.storage && creep.room.storage.my)
    {
      deliverTargets = <never[]>[creep.room.storage];
    }

    if(creep.carry.energy == creep.carryCapacity && deliverTargets.length === 0 && this.kernel.data.roomData[creep.room.name].controllerContainer!.store.energy < this.kernel.data.roomData[creep.room.name].controllerContainer!.storeCapacity)
    {
      let targets = [].concat(
        <never[]>[this.kernel.data.roomData[creep.room.name].controllerContainer]
      )

      deliverTargets = targets;
    }

    let target = creep.pos.findClosestByPath(deliverTargets)

    if(target){
      if(!creep.pos.inRangeTo(target, 1))
      {
        if(!creep.fixMyRoad())
        {
          creep.travelTo(target);
        }
      }

      if(target.structureType == STRUCTURE_STORAGE)
      {
        creep.memory.storageDelivery = true;
      }
      else
      {
        creep.memory.storageDelivery = false;
      }

      if(creep.transfer(target, (this.metaData.resource || RESOURCE_ENERGY)) == ERR_FULL)
      {
        return;
      }
    }else{
      //this.suspend = 15
      this.suspend = 5
    }

    if(creep.ticksToLive! < 60 && _.sum(creep.carry) > 0)
    {
      if(creep.room.storage)
      {
        let target = creep.room.storage;

        if(!creep.pos.inRangeTo(target, 1))
        {
          if(!creep.fixMyRoad())
          {
            creep.travelTo(target);
          }
        }

        if(creep.transfer(target, (this.metaData.resource || RESOURCE_ENERGY)) == ERR_FULL)
        {
          if(creep.ticksToLive)
          {
            this.suspend = creep.ticksToLive;
          }
          else
          {
            this.suspend = 5;
          }
        }
      }
    }
  }
}
