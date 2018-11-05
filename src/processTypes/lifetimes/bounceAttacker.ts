import { LifetimeProcess } from "os/process";
import { MoveProcess } from "../creepActions/move";

export class BounceAttackerLifetimeProcess extends LifetimeProcess
{
    type = 'balf';
    metaData: BounceAttackerLifetimeProcessMetaData;

    run()
    {
        let creep = this.getCreep();

        let roomName = this.metaData.flagName.split('-')[0];
        let healName = roomName + '-Heal';
        let flag = Game.flags[this.metaData.flagName];
        let healFlag = Game.flags[healName];

        if(!creep || !healFlag || !flag)
        {
            this.completed = true;
            return;
        }

        if(creep.hits < creep.hitsMax * .85)
        {
            creep.travelTo(healFlag.pos, {range: 1});
            return;
        }

        if(!creep.pos.inRangeTo(flag,1) && creep.hits === creep.hitsMax)
        {
            creep.travelTo(flag, {range: 1});
            return;
        }


    }
}
