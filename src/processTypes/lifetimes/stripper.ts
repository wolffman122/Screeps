import { LifetimeProcess } from "os/process";

export class StripperLifetimeProcess extends LifetimeProcess
{
    metaData: StripperLifetimeProcessMetaData;
    type = 'stripper';

    run()
    {
        let creep = this.getCreep();
        let flag = Game.flags[this.metaData.flagName];
        let deliveryRoom: Room;
        if(this.metaData.deliveryRoom !== "")
          deliveryRoom = Game.rooms[this.metaData.deliveryRoom];

        if(!creep){ return }

      if (!creep.memory.boost)
      {
        creep.boostRequest([RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE, RESOURCE_CATALYZED_KEANIUM_ACID], false);
        return;
      }

      console.log(this.name, creep.pos);

    if(flag)
    {
      if(creep.room.name === this.metaData.roomName)
      {
        if (creep.store.getUsedCapacity() === 0 && creep.ticksToLive < 500)
        {
          const container = this.roomData().generalContainers[0];
          if(container)
          {
            if(!creep.pos.isEqualTo(container))
              creep.moveTo(container);
            else
              creep.suicide();

            return;
          }
        }
      }

      if(creep.pos.roomName !== flag.pos.roomName && creep.store.getUsedCapacity() === 0)
      {
          creep.travelTo(flag, {allowHostile: false});
          return;
      }

      if(creep.store.getFreeCapacity() !== 0)
      {
          let storage = flag.pos.lookFor(LOOK_STRUCTURES)[0] as StructureStorage;
          if(storage?.store.getUsedCapacity() > 0)
          {
              if(!creep.pos.isNearTo(storage))
                  creep.travelTo(storage);
              else if(creep.ticksToLive >= 350)
              {
                if(storage.store.getUsedCapacity(RESOURCE_CATALYZED_GHODIUM_ACID) > 0)
                  creep.withdraw(storage, RESOURCE_CATALYZED_GHODIUM_ACID);
                else
                  creep.withdrawEverything(storage)
              }

              return;
          }
          else
          {
              const terminal = flag.room.terminal;
              if(terminal?.store.getUsedCapacity() > 0)
              {
                if(!creep.pos.isNearTo(terminal))
                  creep.travelTo(terminal);
                else
                  creep.withdrawEverything(terminal);

                return;
              }
              else
              {
                flag.remove();
                return;
              }
          }
      }

      if(creep.store.getFreeCapacity() === 0)
      {
        const storage = Game.rooms[this.metaData.roomName].storage;
        if(storage)
        {
          if(!creep.pos.isNearTo(storage))
              creep.travelTo(storage);
          else
              creep.transferEverything(storage);

          return;
        }
      }
    }
  }
}
