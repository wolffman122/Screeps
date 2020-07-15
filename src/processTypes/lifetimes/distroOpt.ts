import { LifetimeProcess } from '../../os/process'
import { ENERGY_KEEP_AMOUNT } from 'processTypes/buildingProcesses/mineralTerminal';

export class DistroLifetimeOptProcess extends LifetimeProcess {
  type = 'dlfOpt';
  metaData: DistroLifetimeOptProcessMetaData
  terminal: StructureTerminal;
  storage: StructureStorage;
  powerSpawn: StructurePowerSpawn;

  run() {
    const creep = this.getCreep()

    if (creep.room.memory.shutdown) {
      creep.suicide();
      this.completed = true;
      return;
    }

    if (creep.name === 'em-m-E28S33-27504732')
      console.log(this.name, 'Distro Prob', 1)

    this.terminal = creep.room.terminal;
    this.storage = creep.room.storage;
    this.powerSpawn = this.roomData().powerSpawn;


    // if(sourceContainer)
    //   console.log(this.name, 'Source Containers need to go');

    // Room energy full parts
    if (creep.store.getUsedCapacity() === 0 && creep.room.energyAvailable === creep.room.energyCapacityAvailable) {
      if (creep.name === 'em-m-E28S33-27504732')
        console.log(this.name, 'Distro Prob', 2)
      const minContainer = this.kernel.data.roomData[creep.room.name].mineralContainer;
      if (minContainer && minContainer.store.getUsedCapacity() > 0) {
        if (creep.pos.isNearTo(minContainer))
          creep.withdrawEverything(minContainer);
        else
          creep.moveTo(minContainer, { range: 1 });

        return;
      }

      if (this.terminal?.store.getUsedCapacity(RESOURCE_POWER) >= 100
        && this.powerSpawn?.store.getUsedCapacity(RESOURCE_POWER) === 0) {
        if (!creep.pos.isNearTo(this.terminal))
          creep.moveTo(this.terminal);
        else
          creep.withdraw(this.terminal, RESOURCE_POWER, 100);

        return;
      }
    }

    const sourceContainer = Game.getObjectById<StructureContainer>(this.metaData.sourceContainer);
    // Empty Creep
    if (creep.store.getUsedCapacity() === 0 && creep.ticksToLive! > 50)
    {
      if (creep.memory.storageDelivery)
      {
        const towers = this.roomData().towers.filter(t => (t.store[RESOURCE_ENERGY] ?? 0) < TOWER_CAPACITY * .8);
        const labs = this.roomData().labs.filter(l => (l.store[RESOURCE_ENERGY] ?? 0) < LAB_ENERGY_CAPACITY);
        if (creep.room.energyAvailable < creep.room.energyCapacityAvailable
          || towers.length || labs.length || sourceContainer?.store.getUsedCapacity() >= creep.store.getCapacity())
          creep.memory.storageDelivery = false;

        if (this.storage && creep.memory.storageDelivery) {
          let standPos: RoomPosition;
          let range = 4;
          if (creep.room.name === 'E45S57' || creep.room.name === 'E48S56' || creep.room.name === 'E51S49')
            range = 5;

          if (!creep.memory.standPos)
          {
            const rPos = creep.pos.getOpenPositions(this.storage.pos, range, {
              avoidCreeps: true, avoidFlags: true,
              avoidStructures: [STRUCTURE_EXTENSION, STRUCTURE_TERMINAL, STRUCTURE_STORAGE, STRUCTURE_FACTORY, STRUCTURE_TOWER, STRUCTURE_SPAWN, STRUCTURE_LINK, STRUCTURE_ROAD]
            });
            standPos = creep.memory.standPos = creep.pos.findClosestByRange(rPos);
            creep.memory.standPos = standPos;
          }
          else
          {
            standPos = new RoomPosition(creep.memory.standPos.x, creep.memory.standPos.y, creep.memory.standPos.roomName);

            const lCreeps = standPos.lookFor(LOOK_CREEPS);
            if (lCreeps.length) {
              if (lCreeps[0].name !== creep.name) {
                const rPos = creep.pos.getOpenPositions(this.storage.pos, range, {
                  avoidCreeps: true, avoidFlags: true,
                  avoidStructures: [STRUCTURE_EXTENSION, STRUCTURE_TERMINAL, STRUCTURE_STORAGE, STRUCTURE_FACTORY, STRUCTURE_TOWER, STRUCTURE_SPAWN, STRUCTURE_LINK, STRUCTURE_ROAD]
                });
                standPos = creep.memory.standPos = creep.pos.findClosestByRange(rPos);
                creep.memory.standPos = standPos;
              }
            }
          }

          creep.say('😴');
          if (!creep.pos.isEqualTo(standPos)) {
            creep.moveTo(standPos);
            return;
          }

          this.suspend = 5;
          return;
        }
      }

      // Source Link routine
      if (this.kernel.data.roomData[creep.pos.roomName].sourceLinks.length == 2)
      {
        if (this.storage?.store.getUsedCapacity(RESOURCE_ENERGY) > 0
          && sourceContainer?.store.getUsedCapacity(RESOURCE_ENERGY) <= sourceContainer?.store.getCapacity() * .9) {
          creep.say('🏟');
          if (creep.pos.isNearTo(this.storage))
            creep.withdraw(this.storage, RESOURCE_ENERGY);
          else
            creep.moveTo(this.storage, { range: 1 });

          return;
        }

        // Withdraw from source container if not in a siege (CHECK might not need this anymore)
        if (sourceContainer?.store.getUsedCapacity(RESOURCE_ENERGY) > creep.store.getCapacity()
          && !creep.room.memory.seigeDetected) {
          creep.say('🕋2');
          if (creep.pos.isNearTo(sourceContainer))
            creep.withdraw(sourceContainer, RESOURCE_ENERGY);
          else
            creep.moveTo(sourceContainer, { range: 1 });

          return;
        }

        const ruins = creep.room.find(FIND_RUINS, { filter: d => (d?.store.getUsedCapacity() ?? 0) > 0 });
        if (ruins.length) {
          let target = creep.pos.findClosestByPath(ruins);
          if (!creep.pos.isNearTo(target))
            creep.moveTo(target);
          else
            creep.withdrawEverything(target);

          return;
        }

        // With draw from dropped resources
        const dropped = creep.room.find(FIND_DROPPED_RESOURCES, { filter: d => d.amount >= creep.store.getCapacity() });
        if (dropped.length > 0) {
          creep.say('🌎');
          let target = creep.pos.findClosestByPath(dropped);

          if (creep.name === 'em-m-E36S33-25790836')
            console.log(this.name, 'Dropped problem', target.id);
          if (!creep.pos.isNearTo(target))
            creep.moveTo(target);
          else
            creep.pickup(target);

          return;
        }

        // Clean out Enemy Structures
        const enemyStructures = creep.room.find(FIND_HOSTILE_STRUCTURES, {
          filter: es => (es.structureType === STRUCTURE_LAB || es.structureType === STRUCTURE_LINK ||
            es.structureType === STRUCTURE_NUKER || es.structureType === STRUCTURE_TOWER)
        });

        if (enemyStructures.length > 0) {
          const target = creep.pos.findClosestByPath(enemyStructures)

          creep.say('👹');
          if (creep.pos.isNearTo(target))
            creep.withdraw(target, RESOURCE_ENERGY);
          else
            creep.moveTo(target, { range: 1 });

          return;
        }

        if (this.storage?.my && this.terminal?.my)
        {
          if ((this.storage.store[RESOURCE_ENERGY] ?? 0) > creep.store.getCapacity()) {
            creep.say('🏟');
            if (!creep.pos.isNearTo(this.storage))
              creep.moveTo(this.storage);
            else
              creep.withdraw(this.storage, RESOURCE_ENERGY);

            return;
          }

          if (this.terminal.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
            creep.say('🏦');
            if (creep.pos.isNearTo(this.terminal))
              creep.withdrawEverything(this.terminal);
            else
              creep.moveTo(this.terminal, { range: 1 });

            return;
          }
        }

        // My this.termina withdraw (CHECK might not need anymore)
        if (this.terminal?.my) {
          if (this.terminal.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
            creep.say('🏦1');
            if (creep.pos.isNearTo(this.terminal))
              creep.withdrawEverything(this.terminal);
            else
              creep.moveTo(this.terminal, { range: 1 });

            return;
          }
        }
      }
      else {
        if (this.metaData.roomName === 'E22S52')
          console.log(this.name, 'Empty', 2)
        // Non source link rooms
        if (sourceContainer?.store.getUsedCapacity(RESOURCE_ENERGY) >= creep.store.getCapacity()) {
          creep.say('🕋1');
          if (creep.pos.isNearTo(sourceContainer))
            creep.withdraw(sourceContainer, RESOURCE_ENERGY);
          else
            creep.moveTo(sourceContainer, { range: 1 });

          return;
        }
        else if (this.storage?.my) {
          if (this.storage.store.getUsedCapacity(RESOURCE_ENERGY) >= creep.store.getCapacity()) {
            creep.say('🏟');
            if (!creep.pos.isNearTo(this.storage))
              creep.moveTo(this.storage);
            else
              creep.withdraw(this.storage, RESOURCE_ENERGY);

            return;
          }
          else if (this.terminal?.my) {
            if (this.terminal.store.getUsedCapacity(RESOURCE_ENERGY) >= creep.store.getCapacity()) {
              creep.say('🏦');
              if (!creep.pos.isNearTo(this.terminal))
                creep.moveTo(this.terminal);
              else
                creep.withdraw(this.terminal, RESOURCE_ENERGY);
              return;
            }
          }
        }
      }
    }

    if (creep.store.getUsedCapacity(RESOURCE_POWER) > 0 && (this.powerSpawn?.store.getFreeCapacity(RESOURCE_POWER) ?? 0) > creep.store.getUsedCapacity(RESOURCE_POWER)) {
      if (!creep.pos.isNearTo(this.powerSpawn))
        creep.moveTo(this.powerSpawn);
      else
        creep.transfer(this.powerSpawn, RESOURCE_POWER);

      return;
    }
    // If the creep has been refilled
    let targets = [].concat(
      <never[]>this.kernel.data.roomData[creep.room.name].spawns,
      <never[]>this.kernel.data.roomData[creep.room.name].extensions
    )

    if (creep.name === 'em-m-E28S33-27504732')
      console.log(this.name, 'Distro Prob', 3)
    if (creep.room.energyAvailable > creep.room.energyCapacityAvailable * .95) {
      targets = [].concat(
        <never[]>this.kernel.data.roomData[creep.room.name].spawns,
        <never[]>this.kernel.data.roomData[creep.room.name].extensions,
        <never[]>this.kernel.data.roomData[creep.room.name].towers,
        <never[]>this.kernel.data.roomData[creep.room.name].labs,
      )
    }

    let deliverTargets = _.filter(targets, function (target: DeliveryTarget) {
      if (target.structureType == STRUCTURE_TOWER) {
        return (target.energy < target.energyCapacity * .80)
      }
      else {
        return (target.energy < target.energyCapacity)
      }
    })

    if (creep.name === 'em-m-E28S33-27504732')
      console.log(this.name, 'Distro Prob', 4)
    // Drop off at terminal if creep is carrying anything but energy.
    if (this.terminal?.my && creep.store.getUsedCapacity() != creep.carry.energy) {
      if (creep.pos.isNearTo(this.terminal)) {
        creep.transferEverything(this.terminal);
      }
      else {
        creep.moveTo(this.terminal);
      }
      return;
    }


    if (creep.name === 'em-m-E28S33-27504732')
      console.log(this.name, 'Distro Prob', 5)
    if (this.storage && creep.store.getUsedCapacity() != creep.carry.energy) {
      creep.say('T🏟')
      if (creep.pos.isNearTo(this.storage)) {
        creep.transferEverything(this.storage);
        return;
      }

      creep.moveTo(this.storage);
      return;

    }

    if (creep.name === 'em-m-E28S33-27504732')
      console.log(this.name, 'Distro Prob', 6)
    if (deliverTargets.length === 0) {
      if (this.storage?.my) {
        targets = [].concat(
          <never[]>this.kernel.data.roomData[creep.room.name].labs,
          //<never[]>[this.kernel.data.roomData[creep.room.name].controllerContainer]
        )
      }
      else {
        targets = [].concat(
          <never[]>this.kernel.data.roomData[creep.room.name].labs,
          <never[]>this.kernel.data.roomData[creep.room.name].generalContainers,
        )
      }

      deliverTargets = _.filter(targets, function (target: DeliveryTarget) {
        if (target?.store) {
          return (target.store.getUsedCapacity(RESOURCE_ENERGY) < target.storeCapacity)
        }
        // else
        // {
        //   return (target.energy < target.energyCapacity)
        // }
      })
    }

    if (creep.name === 'em-m-E28S33-27504732')
      console.log(this.name, 'Distro Prob', 7)
    if (deliverTargets.length === 0 && this.kernel.data.roomData[creep.room.name].nuker) {
      let nuker = this.kernel.data.roomData[creep.room.name].nuker;
      if (nuker && nuker.energy < nuker.energyCapacity) {
        deliverTargets = <never[]>[nuker];
      }
    }

    if (creep.name === 'em-m-E28S33-27504732')
      console.log(this.name, 'Distro Prob', 8)
    if (deliverTargets.length === 0 && this.powerSpawn) {

      if (this.powerSpawn?.store.getFreeCapacity(RESOURCE_ENERGY) > creep.store.getCapacity()) {
        deliverTargets = <never[]>[this.powerSpawn];
      }
    }

    if (creep.name === 'em-m-E28S33-27504732')
      console.log(this.name, 'Distro Prob', 9)
    if (deliverTargets.length === 0 && this.storage?.my) {
      deliverTargets = <never[]>[this.storage];
    }

    // let controllerContainer = this.kernel.data.roomData[creep.room.name].controllerContainer;
    // if(creep.carry.energy == creep.carryCapacity && deliverTargets.length === 0 && controllerContainer && controllerContainer.store.energy < controllerContainer.storeCapacity)
    // {
    //   let targets = [].concat(
    //     <never[]>[this.kernel.data.roomData[creep.room.name].controllerContainer]
    //   )

    //   deliverTargets = targets;
    // }

    let target = creep.pos.findClosestByPath(deliverTargets)

    if (creep.name === 'em-m-E28S33-27504732')
      console.log(this.name, 'Distro Prob', 10, target)
    if (target) {
      creep.say('T', true);
      if (!creep.pos.inRangeTo(target, 1)) {
        if (creep.name === 'em-m-E28S33-27504732')
          console.log(this.name, 'Distro Prob', 10.1, target)
        creep.moveTo(target);
        return;
      }

      if (target.structureType == STRUCTURE_STORAGE) {
        creep.memory.storageDelivery = true;
        creep.transferEverything(target);
        return;
      }

      if (creep.transfer(target, (this.metaData.resource || RESOURCE_ENERGY)) == ERR_FULL) {
        return;
      }
    }
    else {
      //this.suspend = 15
      this.suspend = 5
    }

    if (creep.name === 'em-m-E28S33-27504732')
      console.log(this.name, 'Distro Prob', 11)
    if (creep.ticksToLive! < 60 && creep.store.getUsedCapacity() > 0) {
      if (this.storage) {
        if (!creep.pos.inRangeTo(this.storage, 1)) {
          creep.moveTo(this.storage);
          return;
        }

        if (creep.transfer(this.storage, (this.metaData.resource || RESOURCE_ENERGY)) == ERR_FULL) {
          if (creep.ticksToLive) {
            this.suspend = creep.ticksToLive;
          }
          else {
            this.suspend = 5;
          }
        }
      }
    }
    else if (creep.ticksToLive! < 20 && creep.store.getUsedCapacity() === 0) {
      creep.suicide();
      this.completed = true;
      return;
    }

    if (creep.name === 'em-m-E28S33-27504732')
      console.log(this.name, 'Distro Prob', 12)
  }
}
