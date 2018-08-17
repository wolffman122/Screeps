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
            if(_.sum(creep.carry) === 0 && creep.pos.roomName === flag.pos.roomName)
            {
                creep.travelTo(flag, {range: 10});
            }

            if(_.sum(creep.carry) === 0)
            {
                // Find sources to withdraw form.
            }
        }
    }
}
