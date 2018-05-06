import { Process } from "os/process";
import { Utils } from "lib/utils";
import { HelperLifetimeProcess } from "../lifetimes/Helper";

export class HelpManagementProcess extends Process
{
    type = 'hmp';
    metaData: HelpManagementProcessMetaData;

    ensureMetaData()
    {
        if(!this.metaData.creeps)
        {
            this.metaData.creeps = [];
        }
    }

    run()
    {
        this.log("Helping Process")
        this.ensureMetaData();

        let flag = Game.flags[this.metaData.flagName];

        if(!flag)
        {
            this.completed = true;
            return;
        }

        let spawnRoom = this.metaData.flagName.split('-')[0];
        let numberOfHelpers = +this.metaData.flagName.split('-')[1];

        if(this.metaData.creeps.length < numberOfHelpers)
        {
            let creepName = 'hmp-helper-' + spawnRoom + '-' + Game.time;
            let spawned = Utils.spawn(
                this.kernel,
                spawnRoom,
                'remoteWorker',
                creepName,
                {}
            );

            if(spawned)
            {
                this.metaData.creeps.push(creepName);
                this.kernel.addProcess(HelperLifetimeProcess, 'hlplf-' + creepName, 20, {
                    creep: creepName,
                    flagName: this.metaData.flagName
                });
            }
        }
    }
}
