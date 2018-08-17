import { Process } from "os/process";
import { Utils } from "lib/utils";

export class StripManagementProcess extends Process
{
    metaData: StripManagementProcessMetaData;
    type = 'strip';

    ensureMetaData()
    {
        if(!this.metaData.stripperCreeps)
        {
            this.metaData.stripperCreeps[];
        }
    }

    run()
    {
        this.ensureMetaData();

        let flag = Game.flags[this.metaData.flagName];
        let spawnRoom = this.metaData.flagName.split('-')[0];
        let centerFlag = Game.flags['Center-'+spawnRoom];
        let numberOfStrippers = this.metaData.flagName.split('-')[2];

        if(!flag)
        {
            this.completed = true;
            return;
        }

        this.metaData.stripperCreeps = Utils.clearDeadCreeps(this.metaData.stripperCreeps);

        if(this.metaData.stripperCreeps.length < numberOfStrippers)
        {
            let creepName = 'stripper-' + flag.pos.roomName + '-' + Game.time;
            let spawned = Utils.spawn(
                this.kernel,
                spawnRoom,
                'mover',
                creepName,
                {}
            );

            if(spawned)
            {
                if(this.metaData.flagName.split('-')[3] === 'Boost')
                {
                }
                else
                {
                    this.kernel.addProcessIfNotExist(StripperLifetimeProcess, 'stripper-' + creepName, this.priority-1, {flagName: this.metaData.flagName});
                }

            }
        }


    }

}
