import { LifetimeProcess } from "os/process";

export class StripperLifetimeProcess extends LifetimeProcess
{
    metaData: StripperLifetimeProcessMetaData;
    type = 'stripper';

    run()
    {
        let creep = this.getCreep();
        let flag = Game.flags[this.metaData.flagName];

        if(!creep){ return }

        if(flag)
        {
            if(creep.pos.roomName !== flag.pos.roomName && creep.store.getUsedCapacity() === 0)
            {
                creep.travelTo(flag);
                return;
            }

            if(creep.store.getFreeCapacity() !== 0)
            {
                let storage = flag.pos.lookFor(LOOK_STRUCTURES)[0] as StructureStorage;
                if(storage?.store.getUsedCapacity() > 0)
                {
                    if(!creep.pos.isNearTo(storage))
                        creep.travelTo(storage);
                    else
                        creep.withdrawEverything(storage)

                    return;
                }
                else
                {
                    flag.remove();
                    return;
                }
            }

            if(creep.store.getFreeCapacity() === 0 || creep.pos.roomName === this.metaData.roomName)
            {
                let room = Game.rooms[this.metaData.roomName];
                const storage = room.storage;
                if(!creep.pos.isNearTo(storage))
                    creep.travelTo(storage);
                else
                    creep.transferEverything(storage);

                return;
            }
        }
    }
}
