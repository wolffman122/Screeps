import { LifetimeProcess } from "os/process";

export class BounceAttackerLifetimeProcess extends LifetimeProcess
{
    type = 'balf';
    metaData: BounceAttackerLifetimeProcessMetaData;

    run()
    {
        console.log(this.name, 'testing ', 1)
        let creep = this.getCreep();

        let roomName = this.metaData.flagName.split('-')[0];
        let healName = roomName + '-Heal';
        let flag = Game.flags[this.metaData.flagName];
        let healFlag = Game.flags[healName];

        if(!creep || !healFlag || !flag)
        {
            console.log(this.name, 'Stopping')
            this.completed = true;
            return;
        }
        console.log(this.name, 'running')

        if(creep.hits < creep.hitsMax * .50)
        {
            creep.travelTo(healFlag.pos, {range: 1});
            return;
        }

        if(!creep.pos.inRangeTo(flag,1) && creep.hits === creep.hitsMax)
        {
            creep.travelTo(flag.pos, {range: 1});
            return;
        }


    }
}
