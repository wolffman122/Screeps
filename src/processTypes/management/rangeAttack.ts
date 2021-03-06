import { Process } from "os/process";
import { Utils } from "lib/utils";
import { AttackerLifetimeProcess } from "../lifetimes/attacker";
import { RangeAttackerLifetimeProcess } from "../lifetimes/rangeAttacker";

export class RangeAttackManagementProcess extends Process
{
    type = 'ra';
    metaData : RangeAttackManagementProcessMetaData;

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

        console.log(this.name, 1)
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

        console.log(this.name, 2, this.metaData.attackers.length, numberOfAttackers)
        if(this.metaData.attackers.length < numberOfAttackers)
        {
            console.log(this.name, 3)
            let creepName = 'ra-attack-' + flag.pos.roomName + '-' + Game.time;
            let spawned = Utils.spawn(
                this.kernel,
                spawnRoom,
                'rangeAttack',
                creepName,
                {}
            )
            console.log(this.name, 'spawned', spawned);

            if(spawned)
            {
                console.log(this.name, 4)
                this.metaData.attackers.push(creepName);
                this.kernel.addProcessIfNotExist(RangeAttackerLifetimeProcess, 'ralf-' + creepName, this.priority-1, {
                    creep: creepName,
                    flagName: this.metaData.flagName
                })
            }
        }
    }
}
