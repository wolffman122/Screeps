import { LifetimeProcess } from "os/process";
import { TransferProcess } from "../transfer";


export class HoldDistroLifetimeProcess extends LifetimeProcess {
  type = 'holdDistrolf';
  metaData: HoldDistroLifetimeProcessMetaData;

  run() {
    const creep = this.getCreep();

    if (creep.name === 'hrm-m-E23S52-26692640')
      console.log(this.name, 1)
    const flag = Game.flags[this.metaData.flagName];
    if (!flag) {
      this.completed = true;
      return;
    }

    const spawnName = flag.name.split('-')[0];
    const spawnRoom = Game.rooms[spawnName];
    const mineRoom = flag.room;

    if (!creep) {
      return;
    }

    if (creep.name === 'hrm-m-E38S36-27410948')
      console.log(this.name, 'Ruin trouble', 3.0, this.metaData.ruinCheck)

    const fleeFlag = Game.flags['RemoteFlee-' + this.metaData.spawnRoom];

    // Setup for road complete
    if (flag.memory.enemies) {
      if (creep.store.getUsedCapacity() > 0) {
        const storage = spawnRoom.storage;
        if (storage) {
          if (!creep.pos.inRangeTo(storage, 1))

            creep.travelTo(storage);
          else
            creep.transfer(storage, RESOURCE_ENERGY);

          return;
        }
      }
      else {
        if (fleeFlag) {
          if (!creep.pos.inRangeTo(fleeFlag, 5))
            creep.travelTo(fleeFlag.pos);

          return;
        }
        else {
          console.log(this.name, 'Need remote flee flag')
          return;
        }
      }
    }

    const sourceContainer = Game.getObjectById<StructureContainer>(this.metaData.sourceContainer);
    if (sourceContainer) {
      if ((creep.store.getUsedCapacity() === 0 || !creep.memory.full) && creep.ticksToLive! > 100) {
        if (creep.name === 'hrm-m-E38S36-27410948')
          console.log(this.name, 'Ruin trouble', 3, this.metaData.ruinCheck)
        if (creep.store.getFreeCapacity() === 0)
          creep.memory.full = true;

        if (!this.metaData.ruinCheck && creep.room.name !== this.metaData.spawnRoom
          && sourceContainer.store.getUsedCapacity(RESOURCE_ENERGY) >= creep.store.getCapacity() * .9) {
          const ruins = creep.room.find(FIND_RUINS, { filter: r => r.store.getUsedCapacity() > 0 });
          if (ruins.length) {
            const ruin = creep.pos.findClosestByRange(ruins);
            if (!creep.pos.isNearTo(ruin))
              creep.travelTo(ruin);
            else
              creep.withdrawEverything(ruin);
          }
          else
            this.metaData.ruinCheck = true;

          return;
        }

        if (!creep.pos.inRangeTo(sourceContainer, 1)) {
          // Test code
          if (mineRoom.name === 'E44S49' || mineRoom.name === 'E49S49' || mineRoom.name === 'E36S41'
            || mineRoom.name === 'E41S33' || mineRoom.name === 'E23S52' || mineRoom.name === 'E22S53'
            || mineRoom.name === 'E34S51' || mineRoom.name === 'E37S47' || mineRoom.name === 'E38S36'
            || spawnRoom.name === 'E28S33' || spawnRoom.name === 'E42S53' || spawnRoom.name === 'E45S53'
            || spawnRoom.name === 'E51S49' || spawnRoom.name === 'E55S48' || spawnRoom.name === 'E38S39'
            || spawnRoom.name === 'E37S43' || spawnRoom.name === 'E48S56' || spawnRoom.name === 'E26S29'
            || spawnRoom.name === 'E16S51' || spawnRoom.name === 'E29S26' || spawnRoom.name === 'E56S43'
            || spawnRoom.name === 'E31S25' || spawnRoom.name === 'E27S38')
          {
            let holdData: HoldRoomData;
            if (!flag.memory.holdData)
              flag.memory.holdData = { roads: {}, cores: false, enemies: false, roadComplete: false };
            else
              holdData = flag.memory.holdData;

            if (creep.room.name === mineRoom.name && !creep.pos.isNearTo(sourceContainer)) {
              //console.log(this.name, creep.name, 'Hold Data', !holdData.roads[sourceContainer.id]);
              let roomPositions: RoomPosition[] = [];
              if (!holdData.roads[sourceContainer.id]) {
                console.log(this.name, 'Should not be running this code');
                const ret = PathFinder.search(creep.pos, sourceContainer.pos);
                if (!ret.incomplete) {
                  if (Object.keys(Game.constructionSites).length + ret.path.length < 100) {
                    let allCreated = true;
                    for (let i = 0; i < ret.path.length; i++)
                      allCreated = allCreated && (mineRoom.createConstructionSite(ret.path[i], STRUCTURE_ROAD) === OK);

                    if (allCreated)
                      holdData.roads[sourceContainer.id] = true;
                  }
                }
              }
            }
            flag.memory.holdData = holdData;
          }

          creep.travelTo(sourceContainer);
          return;

        }

        const resource = <Resource[]>sourceContainer.pos.findInRange(FIND_DROPPED_RESOURCES, 3)
        const tombstones = creep.pos.findInRange(FIND_TOMBSTONES, 5, { filter: t => t.store.getUsedCapacity() > 0 });
        if (tombstones.length) {
          const tombstone = creep.pos.findClosestByPath(tombstones);
          if (!creep.pos.isNearTo(tombstone))
            creep.travelTo(tombstone);
          else
            creep.withdrawEverything(tombstone);

          return;
        }

        if (resource.length > 0) {
          let withdrawAmount = creep.store.getCapacity() - creep.store.getUsedCapacity() - resource[0].amount;

          if (withdrawAmount >= 0)
            creep.withdraw(sourceContainer, RESOURCE_ENERGY, withdrawAmount);

          creep.pickup(resource[0]);
          return;
        }
        else if (sourceContainer.store[RESOURCE_ENERGY] > creep.store.getCapacity()) {
          creep.withdraw(sourceContainer, RESOURCE_ENERGY);
          return;
        }
        else if (flag.room.storage && flag.room.storage.store.getUsedCapacity() > 0) {
          const storage = flag.room.storage;
          if (!creep.pos.isNearTo(storage))
            creep.travelTo(storage);
          else
            creep.withdrawEverything(storage);

          return;
        }
        else {
          if (creep.room.name === this.metaData.spawnRoom) {
            if (fleeFlag && !creep.pos.inRangeTo(fleeFlag, 4)) {
              creep.travelTo(fleeFlag);
              return;
            }
          }
          //this.suspend = 20;
          return;
        }
      }
      else if (creep.store.getUsedCapacity() === 0 && creep.room.name !== this.metaData.spawnRoom) {
        if (creep.name === 'hrm-m-E38S36-27410302')
          console.log(this.name, 'Ruin trouble', 4)
        if (creep.pos.isNearTo(sourceContainer))
          creep.withdraw(sourceContainer, RESOURCE_ENERGY);
      }
    }

    if (creep.name === 'hrm-m-E38S36-27410302')
      console.log(this.name, 'Ruin trouble', 5)
    if (creep.store.getFreeCapacity() === 0 || creep.memory.full) {
      creep.memory.full = true;
      if (this.kernel.data.roomData[this.metaData.spawnRoom]?.links.length > 0) {
        let links = this.kernel.data.roomData[this.metaData.spawnRoom].links

        links = creep.pos.findInRange(links, 8, { filter: l => (l.store[RESOURCE_ENERGY] ?? 0) != 800 });

        if (links.length > 0) {
          creep.say('L', true);
          const link = creep.pos.findClosestByPath(links);

          if (creep.room.name === 'E43S53')
            console.log(this.name, 'Link Distance', creep.room.memory.linkDistances[link.id]);

          if (!creep.pos.inRangeTo(link, 1)) {
            if (!creep.fixMyRoad()) {
              creep.travelTo(link);
            }
          }

          const linkDistance = creep.room.memory.linkDistances[link.id];
          if (link.cooldown < (linkDistance * 1.8)) { }

          if (creep.transfer(link, RESOURCE_ENERGY) == ERR_FULL)
            this.suspend = 2;

          if (creep.store.getUsedCapacity() === 0)
            creep.memory.full = false;
          return;
        }
      }

      const storage = spawnRoom.storage;
      if (storage) {
        creep.say('S', true);
        if (!creep.pos.inRangeTo(storage, 1)) {
          if (!creep.fixMyRoad()) {
            creep.travelTo(storage);
          }
        }
        else {
          creep.transfer(storage, RESOURCE_ENERGY);
          creep.memory.full = false;
        }

        return;
      }

      const target = this.kernel.data.roomData[this.metaData.spawnRoom].generalContainers[0];
      if (target) {
        creep.say('C', true);
        if (!creep.pos.isNearTo(target)) {
          if (!creep.fixMyRoad())
            creep.travelTo(target, { range: 1 });
        }
        else {
          creep.transfer(target, RESOURCE_ENERGY);
          creep.memory.full = false;
        }

        return;
      }

      //this.suspend = 2;
    }



    if (creep.store.getUsedCapacity() === 0 && creep.ticksToLive <= 100) {
      let container = this.kernel.data.roomData[this.metaData.spawnRoom].generalContainers[0];
      if (container) {
        if (creep.pos.inRangeTo(container, 0))
          creep.suicide();

        creep.travelTo(container);
        return;
      }
    }
  }
}

