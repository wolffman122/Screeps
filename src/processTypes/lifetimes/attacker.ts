import { LifetimeProcess } from "os/process";
import { Utils } from "lib/utils";

export class AttackerLifetimeProcess extends LifetimeProcess
{
    type = 'attacklf';
    metaData: AttackerLifetimeProcessMetaData

    run()
    {
        let creep = this.getCreep();

        if(!creep)
        {
            this.completed = true;
            return;
        }

        let flag = Game.flags[this.metaData.flagName];

        if(!flag)
        {
            this.completed = true;
            return;
        }


        if(creep.pos.roomName != flag.pos.roomName)
        {
            creep.travelTo(flag, {range: 12});
            return;
        }

        let hostileSpawns = creep.room.find(FIND_HOSTILE_SPAWNS);
        let hostileCreeps = creep.room.find(FIND_HOSTILE_CREEPS);

        let spawnTarget;
        let spawnRange;
        if(hostileSpawns.length > 0)
        {
            spawnTarget = creep.pos.findClosestByRange(hostileSpawns);
            spawnRange = creep.pos.getRangeTo(spawnTarget);
        }
        else
        {
            Game.notify('Room ' + flag.pos.roomName + ' has no more spawns.  Need next stage in attack');
        }

        if(spawnTarget)
        {
            if(!creep.pos.inRangeTo(spawnTarget.pos, 1))
            {
                creep.travelTo(spawnTarget, {range: 1});
                return;
            }

            creep.attack(spawnTarget);
        }
    }
}
