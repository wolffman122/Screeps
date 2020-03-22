import {LifetimeProcess} from '../../os/process'

export class DistroLifetimeOptProcess extends LifetimeProcess{
  type = 'dlfOpt';
  metaData: DistroLifetimeOptProcessMetaData

  run(){
    const creep = this.getCreep()

    if(creep.room.memory.shutdown)
    {
      creep.suicide();
      this.completed = true;
      return;
    }

    let sourceContainer = Game.getObjectById<StructureContainer>(this.metaData.sourceContainer);

    // Room energy full parts
    if(_.sum(creep.carry) === 0 && creep.room.energyAvailable === creep.room.energyCapacityAvailable &&
      sourceContainer && _.sum(sourceContainer.store) <= creep.carryCapacity * .85)
    {

      const minContainer = this.kernel.data.roomData[creep.room.name].mineralContainer;
      if(minContainer && minContainer.store.getUsedCapacity() > 0)
      {
        if(creep.pos.isNearTo(minContainer))
          creep.withdrawEverything(minContainer);
        else
          creep.travelTo(minContainer, {range: 1});

        return;
      }

      const terminal = creep.room.terminal;
      const powerSpawn = this.kernel.data.roomData[creep.room.name].powerSpawn;

      if(terminal?.store.getUsedCapacity(RESOURCE_POWER) >= 100
        && powerSpawn?.store.getUsedCapacity(RESOURCE_POWER) === 0)
      {
        if(!creep.pos.isNearTo(terminal))
          creep.travelTo(terminal);
        else
          creep.withdraw(terminal, RESOURCE_POWER, 100);

        return;
      }
    }

    // Empty Creep
    if(creep.store.getUsedCapacity() === 0 && creep.ticksToLive! > 50)
    {
      if(creep.memory.storageDelivery == true)
      {
        creep.memory.storageDelivery = false;
        creep.say('😴1');
        return;
      }

      // Source Link routine
      if(this.kernel.data.roomData[creep.pos.roomName].sourceLinks.length == 2)
      {
        if(!sourceContainer)
          return;

        const storage = creep.room.storage;

        // With draw form storage because source containers are not full yet
        if(storage?.store.getUsedCapacity(RESOURCE_ENERGY) > 0
          && sourceContainer?.store.getUsedCapacity(RESOURCE_ENERGY) <= sourceContainer?.store.getCapacity() * .9)
        {
            creep.say('🏟');
            if(creep.pos.isNearTo(storage))
              creep.withdraw(storage, RESOURCE_ENERGY);
            else
              creep.pushyTravelTo(storage, {range: 1});

            return;
        }

        // Withdraw from source container if not in a siege (CHECK might not need this anymore)
        if(sourceContainer?.store.getUsedCapacity(RESOURCE_ENERGY) > creep.store.getCapacity()
          && !creep.room.memory.seigeDetected)
        {
          creep.say('🕋');
          if(creep.pos.isNearTo(sourceContainer))
            creep.withdraw(sourceContainer, RESOURCE_ENERGY);
          else
            creep.travelTo(sourceContainer, {range: 1});

          return;
        }

        // With draw from dropped resources
        const dropped = creep.room.find(FIND_DROPPED_RESOURCES, {filter: d => d.amount >= creep.store.getCapacity()});
        if(dropped.length > 0)
        {
          creep.say('🌎');
          let target = creep.pos.findClosestByPath(dropped);

          if(!creep.pos.inRangeTo(target, 5))
            creep.pushyTravelTo(target);
          else
            creep.pickup(target);

          return;
        }

        // Clean out Enemy Structures
        const enemyStructures = creep.room.find(FIND_HOSTILE_STRUCTURES, {filter: es => (es.structureType === STRUCTURE_LAB || es.structureType === STRUCTURE_LINK ||
          es.structureType === STRUCTURE_NUKER || es.structureType === STRUCTURE_TOWER) });

        if(enemyStructures.length > 0)
        {
          const target = creep.pos.findClosestByPath(enemyStructures)

          creep.say('👹');
          if(creep.pos.isNearTo(target))
            creep.withdraw(target, RESOURCE_ENERGY);
          else
            creep.travelTo(target, {range: 1});

          return;
        }

        const terminal = creep.room.terminal;
        // Enemy terminal
        if(creep.room.storage?.my && terminal?.my)
        {
          if(terminal.store.getUsedCapacity() > 0)
          {
            creep.say('👹🏦');
            if(creep.pos.isNearTo(terminal))
              creep.withdrawEverything(terminal);
            else
              creep.pushyTravelTo(terminal, {range: 1});

            return;
          }
        }

        // My Terminal withdraw (CHECK might not need anymore)
        if(terminal?.my)
        {
          if(terminal.store.getUsedCapacity() > 0)
          {
            creep.say('🏦1');
            if(creep.pos.isNearTo(terminal))
              creep.withdrawEverything(terminal);
            else
              creep.pushyTravelTo(terminal, {range: 1});

            return;
          }
        }
      }
      else
      {
        // Non source link rooms
        const sourceContainer = Game.getObjectById<StructureContainer>(this.metaData.sourceContainer);
        if(sourceContainer?.store.getUsedCapacity(RESOURCE_ENERGY) >= creep.store.getCapacity())
        {
          creep.say('🕋');
          if(creep.pos.isNearTo(sourceContainer))
            creep.withdraw(sourceContainer, RESOURCE_ENERGY);
          else
            creep.travelTo(sourceContainer, {range: 1});

          return;
        }
        else if(creep.room.storage?.my && !(creep.room.terminal?.my ?? true))
        {
          const terminal = creep.room.terminal;
          if(terminal.store.getUsedCapacity() > 0)
          {
            creep.say('👹🏦');
            if(creep.pos.isNearTo(terminal))
            {
              creep.withdrawEverything(terminal);
              return;
            }

            creep.pushyTravelTo(terminal, {range: 1});
            return;
          }
        }
        else if(creep.room.storage?.my)
        {
          if(creep.name === 'em-m-E37S46-23897868')
            console.log(this.name, 'Distro problem', 1, '&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&')
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

              creep.pushyTravelTo(storage, {range: 1});
              return;
            }
          }
        }
      }
    }

    if(creep.store.getUsedCapacity(RESOURCE_POWER) > 0)
    {
      const powerSpawn = this.kernel.data.roomData[creep.room.name].powerSpawn;
      if(!creep.pos.isNearTo(powerSpawn))
        creep.travelTo(powerSpawn);
      else
        creep.transfer(powerSpawn, RESOURCE_POWER);

      return;
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
        <never[]>this.kernel.data.roomData[creep.room.name].towers,
        <never[]>this.kernel.data.roomData[creep.room.name].labs,
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
        creep.pushyTravelTo(creep.room.terminal);
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

      creep.pushyTravelTo(storage);
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
        if(target && target.store){
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

    if(deliverTargets.length === 0 && this.kernel.data.roomData[creep.room.name].powerSpawn)
    {
      const powerSpawn = this.kernel.data.roomData[creep.room.name].powerSpawn;
      if(powerSpawn?.store.getFreeCapacity(RESOURCE_ENERGY) > creep.store.getCapacity())
      {
        deliverTargets = <never[]>[powerSpawn];
      }
    }

    if(deliverTargets.length === 0 && creep.room.storage && creep.room.storage.my)
    {
      deliverTargets = <never[]>[creep.room.storage];
    }

    let controllerContainer = this.kernel.data.roomData[creep.room.name].controllerContainer;
    if(creep.carry.energy == creep.carryCapacity && deliverTargets.length === 0 && controllerContainer && controllerContainer.store.energy < controllerContainer.storeCapacity)
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
        creep.pushyTravelTo(target);
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
            creep.pushyTravelTo(target);
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
