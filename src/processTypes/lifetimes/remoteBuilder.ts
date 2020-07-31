import { LifetimeProcess } from '../../os/process'
import { HarvestProcess } from '../creepActions/harvest'

export class RemoteBuilderLifetimeProcess extends LifetimeProcess {
  type = 'rblf'
  metaData: RemoteBuilderLifetimeProcessMetaData

  run() {
    console.log(this.name, 'Life time remote22222222222222222222222222222222222222222222222222222222222222222222222')
    const cpu = Game.cpu.getUsed();
    let creep = this.getCreep()
    let site = <ConstructionSite>Game.getObjectById(this.metaData.site)

    if (!creep) {
      this.completed = true;
      return
    }

    console.log(this.name, creep.pos);
    if (!creep.memory.boost) {
      creep.boostRequest([RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE, RESOURCE_LEMERGIUM_ACID], false);
      return;
    }

    let baseFlagName;
    let numberOfFlags;
    let spawnRoom;


    if (numberOfFlags !== undefined) {
      this.log('Here now');
      if (creep.memory.flagIndex === undefined) {
        creep.memory.flagIndex = 1;
      }

      if (creep.memory.flagIndex <= numberOfFlags) {
        let tFlag = Game.flags[baseFlagName + '-' + creep.memory.flagIndex];
        if (tFlag) {
          this.log('Here now 2 ' + tFlag.name);
          if (creep.pos.isNearTo(tFlag)) {
            //tFlag.remove();
            creep.memory.flagIndex++;
          }

          creep.travelTo(tFlag);
          return;
        }
      }
      else {
        creep.travelTo(flag);
        return;
      }
    }

    /*if(creep.store.getUsedCapacity() === 0 && creep.room.storage && creep.room.storage.my && creep.room.storage.store.energy >= creep.carryCapacity)
    {
      if(creep.pos.isNearTo(creep.room.storage))
      {
        creep.withdraw(creep.room.storage, RESOURCE_ENERGY);
        return;
      }

      creep.travelTo(creep.room.storage);
      return;
    }*/

    const flags = creep.room.find(FIND_FLAGS, { filter: f => f.color === COLOR_BLUE && f.secondaryColor === COLOR_BLUE });

    console.log(this.name, creep.memory.filling)
    if (creep.store.getUsedCapacity() === 0 || creep.memory.filling) {
      creep.memory.filling = true;

      if (creep.pos.roomName == site?.pos?.roomName || flags.length) {
        let structures = site.room!.find(FIND_HOSTILE_STRUCTURES);
        if (structures) {
          let targets = _.filter(structures, (s) => {
            return ((s.structureType === STRUCTURE_LINK || s.structureType == STRUCTURE_TOWER || s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_LAB) && s.energy > 0);
          });

          if (targets.length > 0) {
            let target = <Structure>creep.pos.findClosestByPath(targets);

            if (target) {
              if (!creep.pos.isNearTo(target))
                creep.travelTo(target);
              else
                creep.withdraw(target, RESOURCE_ENERGY);

              if (creep.store.getUsedCapacity() === creep.carryCapacity)
                creep.memory.filling = false;

              console.log(this.name, 'CPU usage', Game.cpu.getUsed() - cpu);
              return;
            }
          }
          else {
            let targets = _.filter(structures, (s) => {
              return ((s.structureType === STRUCTURE_STORAGE || s.structureType === STRUCTURE_TERMINAL) && s.store.energy > 0);
            })

            if (targets.length > 0) {
              let target = creep.pos.findClosestByPath(targets);

              if (target) {
                if (!creep.pos.isNearTo(target))
                  creep.travelTo(target);
                else
                  creep.withdraw(target, RESOURCE_ENERGY);

                if (creep.store.getUsedCapacity() === creep.carryCapacity)
                  creep.memory.filling = false;

                console.log(this.name, 'CPU usage', Game.cpu.getUsed() - cpu);
                return;
              }
            }
            else {
              let source: Source;

              if (!this.metaData.target) {
                source = site.pos.findClosestByRange(this.kernel.data.roomData[site.pos.roomName].sources.filter(s => s.energy >= creep.store.getCapacity()))
                this.metaData.target = source.id;
              }
              else
                source = Game.getObjectById(this.metaData.target);

              if (!creep.pos.isNearTo(source))
                creep.travelTo(source);
              else
                creep.harvest(source);

              if (creep.store.getUsedCapacity() === creep.carryCapacity) {
                this.metaData.target = undefined;
                creep.memory.filling = false;
              }

              console.log(this.name, 'CPU usage', Game.cpu.getUsed() - cpu);
              return
            }
          }
        }
      }
      else
      {
        if(site)
        {
          const pos = new RoomPosition(25, 25, site.pos.roomName);
          if (!creep.pos.isNearTo(pos))
            creep.travelTo(pos, { preferHighway: true, allowHostile: false });
          return
        }
        else
        {
          const sources = this.roomInfo(creep.room.name).sources.filter(s => s.energy > 0);
          if(sources.length)
          {
            const source = creep.pos.findClosestByPath(sources);
            if(!creep.pos.isNearTo(source))
              creep.travelTo(source);
            else
              creep.harvest(source);

            if(creep.store.getFreeCapacity() === 0)
              creep.memory.filling = false;

            return;
          }
        }
      }
    }

    console.log(this.name, 1)
    const spawn = this.roomInfo(creep.room.name).spawns[0];
    if (spawn?.store.getUsedCapacity(RESOURCE_ENERGY) < spawn?.store.getCapacity(RESOURCE_ENERGY)) {
      if (!creep.pos.isNearTo(spawn))
        creep.travelTo(spawn);
      else
        creep.transfer(spawn, RESOURCE_ENERGY);

      return;
    }

    console.log(this.name, 2)
    if (site)
    {
      if (!creep.pos.inRangeTo(site, 3))
        creep.travelTo(site, { range: 3 });
      else
        creep.build(site);

      return;
    }
    else {
      let target = this.roomInfo(creep.room.name).constructionSites[0];
      if (target) {
        if (!creep.pos.inRangeTo(target, 3))
          creep.travelTo(target, { range: 3 })
        else
          creep.build(target);

          return;
      }
      else {
        const spawn = this.roomInfo(creep.room.name).spawns[0];
        if ((spawn?.store[RESOURCE_ENERGY ?? 0] === 0) && !creep.pos.isNearTo(spawn))
          creep.travelTo(spawn);
        else
          creep.transfer(spawn, RESOURCE_ENERGY);
      }
    }

    console.log(this.name, 3)
    const controller = creep.room.controller;
    if(!creep.pos.inRangeTo(controller, 3))
      creep.travelTo(controller, {range: 3});
    else
      creep.upgradeController(controller);

    console.log(this.name, 'CPU usage', Game.cpu.getUsed() - cpu);
    return;
  }
}
