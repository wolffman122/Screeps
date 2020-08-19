import { Process } from "os/process";
import { Utils } from "lib/utils";
import { StripperLifetimeProcess } from "processTypes/lifetimes/stripper";

export class StripManagementProcess extends Process
{
    metaData: StripManagementProcessMetaData;
    type = 'strip';

    ensureMetaData()
    {
        if(!this.metaData.stripperCreeps)
        {
            this.metaData.stripperCreeps = [];
        }
    }

    run()
    {
        console.log(this.name, 10)
        this.ensureMetaData();

        let flag = Game.flags[this.metaData.flagName];
        let spawnRoom = this.metaData.flagName.split('-')[0];
        let centerFlag = Game.flags['Center-'+spawnRoom];
        let numberOfStrippers = +this.metaData.flagName.split('-')[2];

        console.log(this.name, 11)
        if(!flag)
        {
            this.completed = true;
            return;
        }
        console.log(this.name, 12)

        this.metaData.stripperCreeps = Utils.clearDeadCreeps(this.metaData.stripperCreeps);
        console.log(this.name, this.metaData.stripperCreeps.length, numberOfStrippers, '????????????????????????????????????????????????????')
        if(this.metaData.stripperCreeps.length < numberOfStrippers)
        {
            console.log(this.name, 1);
            let creepName = 'stripper-' + flag.pos.roomName + '-' + Game.time;
            let spawned = Utils.spawn(
                this.kernel,
                spawnRoom,
                'shHauler',
                creepName,
                {}
            );
            console.log(this.name, 2);

            if(spawned)
            {
                this.metaData.stripperCreeps.push(creepName);
                this.kernel.addProcessIfNotExist(StripperLifetimeProcess, 'stripper-' + creepName, this.priority-1, {
                    creep: creepName,
                    roomName: spawnRoom,
                    flagName: this.metaData.flagName,
                });
            }
        }
    }
}
