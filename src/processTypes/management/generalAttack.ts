import { Process } from "os/process";
import { Utils } from "lib/utils";
import { AttackerLifetimeProcess } from "../lifetimes/attacker";
import { HealerLifetimeProcess } from "processTypes/lifetimes/healer";

export class GeneralAttackManagementProcess extends Process
{
    type = 'gamp';
    metaData: GeneralAttackManagementProcessMetaData;

    ensureMetaData()
    {
        if(!this.metaData.attackers)
        {
            this.metaData.attackers = [];
        }

        if(!this.metaData.healers)
        {
            this.metaData.healers = [];
        }
    }

    run()
    {
        this.ensureMetaData();

        let flag = Game.flags[this.metaData.flagName];
        let spawnRoom = this.metaData.flagName.split('-')[0];
        let numberOfAttackers = +this.metaData.flagName.split('-')[1];
        let numberOfHealers = +this.metaData.flagName.split('-')[2];

        if(!flag)
        {
            this.completed = true;
            return;
        }

        this.metaData.attackers = Utils.clearDeadCreeps(this.metaData.attackers);
        this.metaData.healers = Utils.clearDeadCreeps(this.metaData.healers);
        console.log("Number Of Attackers", numberOfAttackers, "Number of healers", numberOfHealers, spawnRoom);


        if(this.metaData.attackers.length < numberOfAttackers)
        {
            let creepName = 'gamp-attack-'+flag.pos.roomName + '-' + Game.time;
            let spawned = Utils.spawn(
                this.kernel,
                spawnRoom,
                'attack',
                creepName,
                {}
            )

            if(spawned)
            {
                flag.memory.attacker = creepName;
                this.metaData.attackers.push(creepName);
                this.kernel.addProcessIfNotExist(AttackerLifetimeProcess, 'attacklf-' + creepName, this.priority-1, {
                    creep: creepName,
                    flagName: this.metaData.flagName
                })
            }
        }

        if(this.metaData.healers.length < numberOfHealers)
        {
            let creepName = 'gamp-healer-' + flag.pos.roomName + '-' + Game.time;
            let spawned = Utils.spawn(
                this.kernel,
                spawnRoom,
                'healer',
                creepName,
                {}
            );

            if(spawned)
            {
                flag.memory.healer = creepName;
                this.metaData.healers.push(creepName);
                this.kernel.addProcessIfNotExist(HealerLifetimeProcess, 'healerlf-' + creepName, this.priority-1, {
                    creep: creepName,
                    flagName: this.metaData.flagName
                })
            }
        }
    }

}
