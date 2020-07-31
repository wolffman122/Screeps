import { LifetimeProcess } from "os/process";

export class UpgradeDistroLifetimeProcess extends LifetimeProcess {
  metaData: UpgradeDistroLifetimeProcessMetaData;
  type = 'udlf';

  run() {
    this.logName = 'em-ud-E45S53-20766714';
    this.logging = true;
    let creep = this.getCreep();

    if (!creep) {
      return
    }

    if (creep.room.memory.shutdown) {
      this.completed = true;
      return;
    }

    if(creep.room.controller?.level === 8 && creep.room.memory.pauseUpgrading)
    {
      const container = this.roomData().generalContainers[0];
      if(!creep.pos.isEqualTo(container))
        creep.moveTo(container);
      else
        creep.suicide();

      return;
    }

    if (creep.ticksToLive < 50) {
      if(creep.store.getUsedCapacity() > 0) {
        let storage = creep.room.storage;
        if (storage) {
          if (creep.pos.inRangeTo(storage, 1))
            creep.transferEverything(storage);
          else
            creep.travelTo(storage);
        }
      }
      else
      {
        creep.suicide();
        this.completed = true;
        return;
      }
    }

    const target = this.kernel.data.roomData[creep.room.name].controllerContainer;

    if (creep.store.getUsedCapacity() === 0 && creep.ticksToLive! > 100) {
      if (!creep.room.storage?.my && creep.room.storage?.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
        if (!creep.pos.isNearTo(creep.room.storage))
          creep.travelTo(creep.room.storage);
        else
          if (creep.withdraw(creep.room.storage, RESOURCE_ENERGY) === OK)
            this.metaData.numberOfDropPickups++;
        return;
      }
      else if (creep.room.storage?.my) {
        let storage = creep.room.storage;

        if (storage.store.energy > 0) {
          if (!creep.pos.isNearTo(storage))
            creep.travelTo(storage);
          else
            if (creep.withdraw(storage, RESOURCE_ENERGY) === OK)
              this.metaData.numberOfDropPickups++;

          return;
        }
      }
      else if (creep.room.terminal?.my) {
        let terminal = creep.room.terminal;

        if (terminal.store.energy > 0) {
          if (!creep.pos.isNearTo(terminal))
            creep.travelTo(terminal);
          else
            if (creep.withdraw(terminal, RESOURCE_ENERGY) === OK)
              this.metaData.numberOfDropPickups++;
        }
      }
      else if (this.kernel.data.roomData[creep.pos.roomName].generalContainers?.length > 0) {
        console.log(this.name, 'upgrade distro', 1);
        let containers = _.filter(this.kernel.data.roomData[creep.pos.roomName].generalContainers, (gc) => {
          return (gc.store.energy > 0);
        });

        if (containers.length > 0) {
          let container = creep.pos.findClosestByPath(containers);

          if (!creep.pos.isNearTo(container))
            creep.travelTo(container);
          else
            if (creep.withdraw(container, RESOURCE_ENERGY) === OK)
              this.metaData.numberOfDropPickups++;

          return;
        }
      }
    }


    if (this.kernel.data.roomData[creep.room.name]) {
      let target = this.kernel.data.roomData[creep.room.name].controllerContainer;

      if (target && target.store.getUsedCapacity() < target.storeCapacity) {
        if (!creep.pos.inRangeTo(target, 1)) {
          if (!creep.fixMyRoad()) {
            creep.travelTo(target);
          }
        }
        else {
          if (creep.transfer(target, RESOURCE_ENERGY) === OK) {
            if (creep.store.getUsedCapacity() === 0 && target.store[RESOURCE_ENERGY] < target.store.getUsedCapacity()) {
              creep.withdrawEverythingBut(target, RESOURCE_ENERGY);
            }
          }

        }
      }
      else {
        this.suspend = 5;
      }
    }
  }
}
