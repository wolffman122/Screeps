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
    console.log(this.name, '??????????? Running ????????????')
    const powerCreep = Game.powerCreeps[this.metaData.powerCreep];
    const room = Game.rooms[this.metaData.roomName];
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
    const flag = Game.flags['RemoteFlee-' + this.metaData.roomName];

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

    // console.log(this.name, 'Storage issue',
    // storage.effects === undefined, storage.effects[PWR_OPERATE_STORAGE], storage.effects[PWR_OPERATE_STORAGE]?.ticksRemaining < 50)
    // if(storage?.store.getUsedCapacity(RESOURCE_OPS) > 1000
    //   && (storage.effects === undefined || storage.effects[PWR_OPERATE_STORAGE]?.ticksRemaining < 50))
    //   {
    //     if(powerCreep.store.getUsedCapacity(RESOURCE_OPS) < 100)
    //     {
    //       if(!powerCreep.pos.isNearTo(storage))
    //         powerCreep.moveTo(storage);
    //       else
    //         powerCreep.withdraw(storage, RESOURCE_OPS, 100);

    //       return;
    //     }

    //     if(!powerCreep.pos.inRangeTo(storage, 3))
    //       powerCreep.moveTo(storage, {range: 3});
    //     else
    //       powerCreep.usePower(PWR_OPERATE_STORAGE, storage);

    //     return;
    //   }

    // Go Generate ops in sk room
    if(powerCreep.store.getUsedCapacity() !== 0)
    {
      if(!powerCreep.pos.isNearTo(flag))
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
