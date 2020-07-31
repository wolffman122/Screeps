import { LifetimeProcess } from "os/process";

export class PowerCreepLifetimeProcess extends LifetimeProcess
{
  type = 'pclf';
  metaData: PowerCreepLifetimeProcessMetaData;
  powerSpawn: StructurePowerSpawn;
  opGenRoom: Room;

  ensureMetaData()
  {

  }

  run()
  {
    const powerCreep = Game.powerCreeps[this.metaData.powerCreep];
    const room = Game.rooms[this.metaData.roomName];
    const factory = this.roomData().factory;

    if(powerCreep === undefined)
    {
      this.completed = true;
      return;
    }

    // Setup renew location
    if(powerCreep.memory.renewTarget === undefined)
      powerCreep.memory.renewTarget = this.roomData().powerSpawn.id

    this.powerSpawn = Game.getObjectById<StructurePowerSpawn>(powerCreep.memory.renewTarget);
    const storage = Game.rooms[this.metaData.roomName].storage;

    // Look if we have sk mining going on
    let flag = Game.flags['PC-' + this.metaData.roomName];
    if(!flag)
      flag = Game.flags['RemoteFlee-' + this.metaData.roomName];

    // Renew power creep.
    if(powerCreep.ticksToLive < 200)
    {
      if(!powerCreep.pos.isNearTo(this.powerSpawn))
        powerCreep.moveTo(this.powerSpawn);
      else
        powerCreep.renew(this.powerSpawn);

      powerCreep.say('💫');
      return;
    }

    const level = powerCreep.powers[PWR_OPERATE_STORAGE]?.level
    const increaseAmount = POWER_INFO[PWR_OPERATE_STORAGE].effect[level - 1];
    const regularStorageAmount = storage.store.getCapacity() - increaseAmount;
    const storageEffect = storage.effects?.filter(e => e.effect === PWR_OPERATE_STORAGE && e.ticksRemaining < 10);
    console.log(this.name, 'Storage workED', storage.store.getCapacity(), level, increaseAmount, storage.store.getUsedCapacity() > regularStorageAmount - 50000);
    if(((storage.store.getFreeCapacity() < 50000 && !storage.effects?.length) || (storageEffect?.length && storage.store.getUsedCapacity() > regularStorageAmount - 50000))
      &&  !powerCreep.powers[PWR_OPERATE_STORAGE].cooldown && powerCreep.powers[PWR_GENERATE_OPS]?.level >= 3)
    {
      if(powerCreep.store.getUsedCapacity(RESOURCE_OPS) < 100
        && storage.store.getUsedCapacity(RESOURCE_OPS) >= 100)
      {
        console.log(this.name, 1)
        if(!powerCreep.pos.isNearTo(storage))
          powerCreep.moveTo(storage);
        else
          powerCreep.withdraw(storage, RESOURCE_OPS);

        return;
      }
      else if(powerCreep.store.getUsedCapacity(RESOURCE_OPS) >= 100 && !this.metaData.templeStoragePower)
      {
        console.log(this.name, 2)
        if(!powerCreep.pos.inRangeTo(storage, 3))
        {
          console.log(this.name, 3)
          powerCreep.moveTo(storage, {range: 3});
        }
        else
        {
          const ret = powerCreep.usePower(PWR_OPERATE_STORAGE, storage);
          console.log(this.name, 'Storage ret', ret);
        }

        return;
      }
    }

    // Turn power on in the room
    if(!room.controller.isPowerEnabled)
    {
      if(!powerCreep.pos.isNearTo(room.controller))
        powerCreep.moveTo(room.controller)
      else
        powerCreep.enableRoom(room.controller);

      powerCreep.say('🏛');
      return;
    }

    // Factory initial
    if(!factory?.level && powerCreep.powers[PWR_OPERATE_FACTORY]
      && (powerCreep.store[RESOURCE_OPS] ?? 0) >= 300)
    {
      if(!powerCreep.pos.inRangeTo(factory, 3))
        powerCreep.moveTo(factory, {range: 3});
      else
        powerCreep.usePower(PWR_OPERATE_FACTORY, factory);

      return;
    }

    if(this.metaData.templeStoragePower && powerCreep.ticksToLive > 100 && powerCreep.powers[PWR_OPERATE_STORAGE]?.cooldown < 100)
    {
      if(this.metaData.roomName === 'E37S46')
      console.log(this.name, 4.1)
      const templeStorage = <StructureTerminal>Game.getObjectById(this.metaData.templeStorageId);
      if(!templeStorage?.effects?.filter(e => e.effect === PWR_OPERATE_STORAGE).length)
      {
        if(this.metaData.roomName === 'E37S46')
      console.log(this.name, 4.2)
        const controller = templeStorage.room.controller;
        if(!controller?.isPowerEnabled)
        {
          if(this.metaData.roomName === 'E37S46')
      console.log(this.name, 4.3)
          if(!powerCreep.pos.isNearTo(controller))
            powerCreep.moveTo(controller);
          else
            powerCreep.enableRoom(controller);

          return;
        }

        if(this.metaData.roomName === 'E37S46')
      console.log(this.name, 4.4)
        if(powerCreep.store.getUsedCapacity(RESOURCE_OPS) >= POWER_INFO[PWR_OPERATE_STORAGE].ops)
        {
          console.log(this.name, 'Temple storage', 1)
          if(!powerCreep.pos.inRangeTo(templeStorage, 3))
            powerCreep.moveTo(templeStorage, {range: 3});
          else
          {

            const ret = powerCreep.usePower(PWR_OPERATE_STORAGE, templeStorage)
            console.log(this.name, 'Temple storage', 2, ret)
            if(ret === OK)
            {
              this.metaData.templeStorageId = undefined;
              this.metaData.templeStoragePower = undefined;
            }
          }

          return;
        }
        else if(storage.store.getUsedCapacity(RESOURCE_OPS) >= POWER_INFO[PWR_OPERATE_STORAGE].ops)
        {
          if(!powerCreep.pos.isNearTo(storage))
            powerCreep.moveTo(storage);
          else
            powerCreep.withdraw(storage, RESOURCE_OPS, POWER_INFO[PWR_OPERATE_STORAGE].ops);

          return;
        }
      }
    }

    // Maintain factory
    if(this.metaData.turnOnFactory && !powerCreep.powers[PWR_OPERATE_FACTORY].cooldown)
    {
      if(powerCreep.store.getUsedCapacity(RESOURCE_OPS) < 100 && storage.store.getUsedCapacity(RESOURCE_OPS) >= 100)
      {
        if(!powerCreep.pos.isNearTo(storage))
          powerCreep.moveTo(storage);
        else
          powerCreep.withdraw(storage, RESOURCE_OPS, 100);
        return;
      }

      if(!powerCreep.pos.inRangeTo(factory, 3))
        powerCreep.moveTo(factory, {range: 3});
      else
      {
        powerCreep.usePower(PWR_OPERATE_FACTORY, factory);
        this.metaData.turnOnFactory = false;
      }

      return;
    }

    // Operate Extensions
    if(powerCreep.powers[PWR_OPERATE_EXTENSION]?.cooldown < 10
      && powerCreep.store[RESOURCE_OPS] >= 2)
    {
      if(!room.memory.powerHarvesting)
          room.memory.powerHarvesting = true;

      let fillExt = false;
      if(powerCreep.room.energyAvailable < (powerCreep.room.energyCapacityAvailable - 900))
        fillExt = true;

      if(fillExt)
      {
        if(!powerCreep.pos.inRangeTo(storage, 3))
          powerCreep.moveTo(storage, {range: 3});
        else
          {
            if(powerCreep.powers[PWR_OPERATE_EXTENSION]?.cooldown === 0)
            {
              powerCreep.usePower(PWR_OPERATE_EXTENSION, storage);
              powerCreep.say('filRoom', true);

            }
          }
        return;
      }
    }

    // Regen sources
    if(powerCreep.powers[PWR_REGEN_SOURCE]?.cooldown < 15)
    {
      const sources = this.roomData().sources.filter(s =>
        {
          if(s.effects === undefined)
            return true;
          else
          {
            const effect = s.effects?.filter(e => e.effect === PWR_REGEN_SOURCE && e.ticksRemaining < 15);
            if(effect?.length)
              return true;
          }
        });

      if(sources.length)
      {
        let target = powerCreep.pos.findClosestByPath(sources);

        powerCreep.say('RS');
        if(!powerCreep.pos.inRangeTo(target, 3))
          powerCreep.moveTo(target, {range: 3});
        else
          powerCreep.usePower(PWR_REGEN_SOURCE, target);

        return;
      }
    }

    // Go Generate ops in sk room
    if(powerCreep.store.getUsedCapacity() !== 0)
    {
      if(!powerCreep.pos.isEqualTo(flag))
      {
        powerCreep.moveTo(flag);
        powerCreep.say('💨');
      }
    }

    // Generate ops
    if(powerCreep.powers[PWR_GENERATE_OPS].cooldown === 0
      && powerCreep.store.getFreeCapacity() > 0)
    {
      const ret = powerCreep.usePower(PWR_GENERATE_OPS);
      powerCreep.say('📀' + ret);
      return;
    }

    // Empty ops
    if(powerCreep.store.getFreeCapacity() === 0)
    {
      powerCreep.say('📉');
      if(!powerCreep.pos.isNearTo(storage))
        powerCreep.moveTo(storage);
      else
        powerCreep.transfer(storage, RESOURCE_OPS);
    }
  }
}
