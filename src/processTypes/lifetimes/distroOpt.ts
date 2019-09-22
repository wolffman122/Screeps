import {LifetimeProcess} from '../../os/process'

export class DistroLifetimeOptProcess extends LifetimeProcess{
  type = 'dlfOpt';
  metaData: DistroLifetimeOptProcessMetaData

  run(){
    let creep = this.getCreep()

    let sourceContainer = Game.getObjectById<StructureContainer>(this.metaData.sourceContainer);
    if(!creep){ return }

    if(creep.room.energyAvailable === creep.room.energyCapacityAvailable)
    {
      if(creep.pos.roomName === 'E38S39')
      {
        console.log(this.name, 'Testing IPC', creep.pos.roomName);
        this.kernel.sendIpc(this.name, "labm-" + creep.pos.roomName, "Testing");
      }
    }

    // Room energy full parts
    if(_.sum(creep.carry) === 0 && creep.room.energyAvailable === creep.room.energyCapacityAvailable &&
      sourceContainer && _.sum(sourceContainer.store) <= creep.carryCapacity * .85)
    {
      let minContainer = this.kernel.data.roomData[creep.room.name].mineralContainer;
      if(minContainer && _.sum(minContainer.store) > 0)
      {
        if(creep.pos.isNearTo(minContainer))
        {
          creep.withdrawEverything(minContainer);
          return;
        }

        creep.travelTo(minContainer, {range: 1});
        return;
      }
    }

    // Empty Creep
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
        if(!sourceContainer)
          return;

        let storage = creep.room.storage;

        if(storage && storage.store.energy > 0 && sourceContainer && sourceContainer.store.energy <= sourceContainer.storeCapacity * .9)
        {
            if(creep.pos.isNearTo(storage))
            {
                creep.withdraw(storage, RESOURCE_ENERGY);
                return;
            }

            creep.travelTo(storage, {range: 1});
            return;
        }

        if(sourceContainer && sourceContainer.store.energy > creep.carryCapacity)
        {
            if(creep.pos.isNearTo(sourceContainer))
            {
                creep.withdraw(sourceContainer, RESOURCE_ENERGY);
                return;
            }

            creep.travelTo(sourceContainer, {range: 1});
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

            if(!creep.pos.inRangeTo(target, 5))
            {
              creep.travelTo(target);
              return;
            }
            creep.pickup(target);
            return;
          }

        }

        // Clean out Enemy Structures
        let enemyStructures = creep.room.find(FIND_HOSTILE_STRUCTURES);

        let energyStructures = _.filter(enemyStructures, (es)=>{
          return (es.structureType === STRUCTURE_LAB || es.structureType === STRUCTURE_LINK ||
            es.structureType === STRUCTURE_NUKER || es.structureType === STRUCTURE_TOWER);
        })

        if(energyStructures.length > 0)
        {
          let target = creep.pos.findClosestByPath(energyStructures)

          if(target)
          {
            console.log(this.name, "Going to get enemy supplies")
            if(creep.pos.isNearTo(target))
            {
              creep.withdraw(target, RESOURCE_ENERGY);
              return;
            }

            creep.travelTo(target, {range: 1});
            return;
          }
        }

        if(creep.room.storage && creep.room.storage.my && creep.room.terminal && !creep.room.terminal.my)
        {
          if(_.sum(creep.room.terminal.store) > 0)
          {
            if(creep.pos.isNearTo(creep.room.terminal))
            {
              creep.withdrawEverything(creep.room.terminal);
              return;
            }

            creep.travelTo(creep.room.terminal, {range: 1});
            return;
          }
        }
      }
      else
      {
        // Non source link rooms
        let sourceContainer = Game.getObjectById<StructureContainer>(this.metaData.sourceContainer);

        if(sourceContainer && sourceContainer.store.energy >= creep.carryCapacity)
        {
            if(creep.pos.isNearTo(sourceContainer))
            {
                creep.withdraw(sourceContainer, RESOURCE_ENERGY);
                return;
            }

            creep.travelTo(sourceContainer, {range: 1});
            return;
        }
        else if(creep.room.storage && creep.room.storage.my && creep.room.terminal && !creep.room.terminal.my)
        {
          if(_.sum(creep.room.terminal.store) > 0)
          {
            if(creep.pos.isNearTo(creep.room.terminal))
            {
              creep.withdrawEverything(creep.room.terminal);
              return;
            }

            creep.travelTo(creep.room.terminal, {range: 1});
            return;
          }
        }
        else if(creep.room.storage && creep.room.storage.my)
        {
          let container = this.kernel.data.roomData[creep.pos.roomName].generalContainers[0];
          if(container && _.sum(container.store) > 0)
          {
            if(!creep.pos.inRangeTo(container, 1))
            {
              creep.travelTo(container);
              return;
            }
            else
            {
              creep.withdrawEverything(container);
              return;
            }
          }
          else
          {
            let storage = creep.room.storage;

            if(storage && storage.store.energy > creep.carryCapacity)
            {
              if(creep.pos.isNearTo(storage))
              {
                  creep.withdraw(storage, RESOURCE_ENERGY);
                  return;
              }

              creep.travelTo(storage, {range: 1});
              return;
            }
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
    if(creep.room.terminal && creep.room.terminal.my && _.sum(creep.carry) != creep.carry.energy)
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

    let storage = creep.room.storage;
    if(storage && _.sum(creep.carry) != creep.carry.energy)
    {
      if(creep.pos.isNearTo(storage))
      {
        creep.transferEverything(storage);
        return;
      }

      creep.travelTo(storage);
      return;

    }

    if(deliverTargets.length === 0){
      if(storage && storage.my)
      {
        targets = [].concat(
          <never[]>this.kernel.data.roomData[creep.room.name].labs
        )
      }
      else
      {
        targets = [].concat(
          <never[]>this.kernel.data.roomData[creep.room.name].labs,
          <never[]>this.kernel.data.roomData[creep.room.name].generalContainers,
        )
      }

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
        creep.travelTo(target);
        return;
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
    }
    else
    {
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
            creep.travelTo(target);
            return;
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
    else if(creep.ticksToLive! < 60 && _.sum(creep.carry) === 0)
    {
      creep.suicide();
      this.completed = true;
      return;
    }
  }
}
