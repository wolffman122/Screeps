import {LifetimeProcess} from '../../os/process'
import { ENERGY_KEEP_AMOUNT } from 'processTypes/buildingProcesses/mineralTerminal';

export class DistroLifetimeOptProcess extends LifetimeProcess{
  type = 'dlfOpt';
  metaData: DistroLifetimeOptProcessMetaData
  terminal: StructureTerminal;
  storage: StructureStorage;
  powerSpawn: StructurePowerSpawn;

  run(){
    const creep = this.getCreep()

    if(creep.room.memory.shutdown)
    {
      creep.suicide();
      this.completed = true;
      return;
    }

    this.terminal = creep.room.terminal;
    this.storage = creep.room.storage;
    this.powerSpawn = this.roomData().powerSpawn;

    let sourceContainer = Game.getObjectById<StructureContainer>(this.metaData.sourceContainer) as StructureContainer;
    // if(sourceContainer)
    //   console.log(this.name, 'Source Containers need to go');

    // Room energy full parts
    if(_.sum(creep.carry) === 0 && creep.room.energyAvailable === creep.room.energyCapacityAvailable)
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

      if(this.terminal?.store.getUsedCapacity(RESOURCE_POWER) >= 100
        && this.powerSpawn?.store.getUsedCapacity(RESOURCE_POWER) === 0)
      {
        if(!creep.pos.isNearTo(this.terminal))
          creep.travelTo(this.terminal);
        else
          creep.withdraw(this.terminal, RESOURCE_POWER, 100);

        return;
      }
    }

    // Empty Creep
    if(creep.store.getUsedCapacity() === 0 && creep.ticksToLive! > 50)
    {
      if(this.metaData.roomName === 'E22S52')
        console.log(this.name, 'Empty', 1)
      if(creep.memory.storageDelivery == true)
      {
        creep.memory.storageDelivery = false;
        creep.say('😴1');
        return;
      }

      // Source Link routine
      if(this.kernel.data.roomData[creep.pos.roomName].sourceLinks.length == 2)
      {
        if(this.storage?.store.getUsedCapacity(RESOURCE_ENERGY) > 0
          && sourceContainer?.store.getUsedCapacity(RESOURCE_ENERGY) <= sourceContainer?.store.getCapacity() * .9)
        {
            creep.say('🏟');
            if(creep.pos.isNearTo(this.storage))
              creep.withdraw(this.storage, RESOURCE_ENERGY);
            else
              creep.pushyTravelTo(this.storage, {range: 1});

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

        const ruins = creep.room.find(FIND_RUINS, {filter: d => (d?.store.getUsedCapacity() ?? 0) > 0});
        if(ruins.length)
        {
          let target = creep.pos.findClosestByPath(ruins);
          if(!creep.pos.isNearTo(target))
            creep.travelTo(target);
          else
            creep.withdrawEverything(target);

          return;
        }

        // With draw from dropped resources
        const dropped = creep.room.find(FIND_DROPPED_RESOURCES, {filter: d => d.amount >= creep.store.getCapacity()});
        if(dropped.length > 0)
        {
          creep.say('🌎');
          let target = creep.pos.findClosestByPath(dropped);

          if(creep.name === 'em-m-E36S33-25790836')
            console.log(this.name, 'Dropped problem', target.id);
          if(!creep.pos.isNearTo(target))
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

        if(this.storage?.my && this.terminal?.my)
        {
          if((this.storage.store[RESOURCE_ENERGY] ?? 0) > ENERGY_KEEP_AMOUNT)
          {
            creep.say('🏟');
            if(!creep.pos.isNearTo(this.storage))
              creep.travelTo(this.storage);
            else
              creep.withdraw(this.storage, RESOURCE_ENERGY);

            return;
          }

          if(this.terminal.store.getUsedCapacity(RESOURCE_ENERGY) > 0)
          {
            creep.say('🏦');
            if(creep.pos.isNearTo(this.terminal))
              creep.withdrawEverything(this.terminal);
            else
              creep.pushyTravelTo(this.terminal, {range: 1});

            return;
          }
        }

        // My this.termina withdraw (CHECK might not need anymore)
        if(this.terminal?.my)
        {
          if(this.terminal.store.getUsedCapacity(RESOURCE_ENERGY) > 0)
          {
            creep.say('🏦1');
            if(creep.pos.isNearTo(this.terminal))
              creep.withdrawEverything(this.terminal);
            else
              creep.pushyTravelTo(this.terminal, {range: 1});

            return;
          }
        }
      }
      else
      {
        if(this.metaData.roomName === 'E22S52')
        console.log(this.name, 'Empty', 2)
        // Non source link rooms
        const sourceContainer = Game.getObjectById<StructureContainer>(this.metaData.sourceContainer);
        if(sourceContainer?.store.getUsedCapacity(RESOURCE_ENERGY) >= creep.store.getCapacity())
        {
          if(this.metaData.roomName === 'E22S52')
        console.log(this.name, 'Empty', 3)
          creep.say('🕋');
          if(creep.pos.isNearTo(sourceContainer))
            creep.withdraw(sourceContainer, RESOURCE_ENERGY);
          else
            creep.travelTo(sourceContainer, {range: 1});

          return;
        }
        else if(this.storage?.my && this.terminal && !this.terminal?.my)
        {
          if(this.metaData.roomName === 'E22S52')
        console.log(this.name, 'Empty', 4)
          if(this.terminal.store.getUsedCapacity() > 0)
          {
            creep.say('👹🏦');
            if(creep.pos.isNearTo(this.terminal))
            {
              creep.withdrawEverything(this.terminal);
              return;
            }

            creep.pushyTravelTo(this.terminal, {range: 1});
            return;
          }
        }
        else if(this.storage?.my)
        {
          if(this.metaData.roomName === 'E22S52')
        console.log(this.name, 'Empty', 5)
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
            if(this.storage?.store.energy > creep.carryCapacity)
            {
              if(creep.pos.isNearTo(this.storage))
              {
                  creep.withdraw(this.storage, RESOURCE_ENERGY);
                  return;
              }

              creep.pushyTravelTo(this.storage, {range: 1});
              return;
            }
          }
        }
        if(this.metaData.roomName === 'E22S52')
        console.log(this.name, 'Empty', 6)
      }
    }

    if(creep.store.getUsedCapacity(RESOURCE_POWER) > 0 && (this.powerSpawn?.store.getFreeCapacity(RESOURCE_POWER) ?? 0) > creep.store.getUsedCapacity(RESOURCE_POWER))
    {
      if(!creep.pos.isNearTo(this.powerSpawn))
        creep.travelTo(this.powerSpawn);
      else
        creep.transfer(this.powerSpawn, RESOURCE_POWER);

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
    if(this.terminal?.my && _.sum(creep.carry) != creep.carry.energy)
    {
      if(creep.pos.isNearTo(this.terminal))
      {
        creep.transferEverything(this.terminal);
      }
      else
      {
        creep.pushyTravelTo(this.terminal);
      }
      return;
    }


    if(this.storage && _.sum(creep.carry) != creep.carry.energy)
    {
      creep.say('T🏟')
      if(creep.pos.isNearTo(this.storage))
      {
        creep.transferEverything(this.storage);
        return;
      }

      creep.pushyTravelTo(this.storage);
      return;

    }

    if(deliverTargets.length === 0){
      if(this.storage?.my)
      {
        targets = [].concat(
          <never[]>this.kernel.data.roomData[creep.room.name].labs,
          <never[]>[this.kernel.data.roomData[creep.room.name].controllerContainer]
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
        if(target?.store)
        {
          return (_.sum(target.store) < target.storeCapacity)
        }
        // else
        // {
        //   return (target.energy < target.energyCapacity)
        // }
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

    if(deliverTargets.length === 0 && this.powerSpawn)
    {

      if(this.powerSpawn?.store.getFreeCapacity(RESOURCE_ENERGY) > creep.store.getCapacity())
      {
        deliverTargets = <never[]>[this.powerSpawn];
      }
    }

    if(deliverTargets.length === 0 && this.storage?.my)
    {
      deliverTargets = <never[]>[this.storage];
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
        this.suspend = 5;
        return;
      }
      else
      {
        creep.memory.storageDelivery = false;
      }

      creep.say('T🏟2');
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
      if(this.storage)
      {
        if(!creep.pos.inRangeTo(this.storage, 1))
        {
            creep.pushyTravelTo(this.storage);
            return;
        }

        if(creep.transfer(this.storage, (this.metaData.resource || RESOURCE_ENERGY)) == ERR_FULL)
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
