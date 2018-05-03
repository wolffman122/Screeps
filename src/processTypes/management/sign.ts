import { Process } from "os/process";
import { Utils } from "lib/utils";

export class SignControllerProcess extends Process
{
    type = 'sign';

    run()
    {
        let flag = Game.flags[this.metaData.flagName];
        let creep = Game.creeps[this.metaData.creep];

        if(!flag)
        {
            this.completed = true;
            return;
        }

        if(!creep)
        {
            let creepName = 'sign-' + flag.pos.roomName + '-' + Game.time;
            let spawned = Utils.spawn(
                this.kernel,
                flag.pos.roomName,
                'special',
                creepName,
                {}
            );

            if(spawned)
            {
                this.metaData.creep = creepName;
            }
        }

        if(!creep.pos.inRangeTo(creep.room.controller!,1))
        {
            creep.travelTo(creep.room.controller!, {range: 1});
            return;
        }

        creep.signController(creep.room.controller!, "[YP] Territory");
    }
}

