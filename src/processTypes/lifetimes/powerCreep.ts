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

    if(powerCreep.ticksToLive < 200)
    {
      if(!powerCreep.pos.isNearTo(this.powerSpawn))
        powerCreep.moveTo(this.powerSpawn);
      else
        powerCreep.renew(this.powerSpawn);

      powerCreep.say('💫');
      return;
    }

    if(!room.controller.isPowerEnabled)
    {
      if(!powerCreep.pos.isNearTo(room.controller))
        powerCreep.moveTo(room.controller)
      else
        powerCreep.enableRoom(room.controller);

      powerCreep.say('🏛');
      return;
    }

    if(!factory.level && powerCreep.powers[PWR_OPERATE_FACTORY]
      && (powerCreep.store[RESOURCE_OPS] ?? 0) >= 300)
    {
      if(!powerCreep.pos.inRangeTo(factory, 3))
        powerCreep.moveTo(factory, {range: 3});
      else
        powerCreep.usePower(PWR_OPERATE_FACTORY, factory);

      return;
    }

    if(powerCreep.memory.factoryRequest)
    {
      const factoryEffects = factory.effects?.filter( e => e.effect === PWR_OPERATE_FACTORY && e.ticksRemaining > 0);
      if(factoryEffects?.length)
      {
        const effect = factoryEffects[0];
        if(effect.ticksRemaining < 20 && powerCreep.powers[PWR_OPERATE_FACTORY].cooldown === 0)
        {
          if(powerCreep.store.getUsedCapacity(RESOURCE_OPS) < 300)
          {
            if(!powerCreep.pos.isNearTo(storage))
              powerCreep.moveTo(storage);
            else
              powerCreep.withdraw(storage, RESOURCE_OPS, 300);

            return;
          }

          if(!powerCreep.pos.inRangeTo(factory, 3))
            powerCreep.moveTo(factory, {range: 3});
          else
            powerCreep.usePower(PWR_OPERATE_FACTORY, factory);

          return;
        }
      }
    }

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

    if(powerCreep.powers[PWR_REGEN_SOURCE]?.cooldown < 15)
    {
      const sources = this.roomData().sources.filter(s =>
        {
          if(s.effects?.length === 0)
            return true;
          else
          {
            const effect = s.effects.filter(e => e.effect === PWR_REGEN_SOURCE && e.ticksRemaining < 15);
            if(effect.length)
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

    if(powerCreep.powers[PWR_GENERATE_OPS].cooldown === 0
      && powerCreep.store.getFreeCapacity() > 0)
    {
      powerCreep.usePower(PWR_GENERATE_OPS);
      powerCreep.say('📀');
      return;
    }

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
