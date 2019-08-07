import { LifetimeProcess } from "os/process";

export class HealerLifetimeProcess extends LifetimeProcess
{
    type = 'heallf';
    metaData: HealerLifetimeProcessMetaData

    run()
    {
        let creep = this.getCreep();
        let flag = Game.flags[this.metaData.flagName];

        if(!creep || !flag)
        {
            this.completed = true;
            flag.memory.healer = undefined;
            return;
        }
    }

}
