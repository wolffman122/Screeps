import { Process } from "os/process";
import { Utils } from "lib/utils";
import { AttackerLifetimeProcess } from "../lifetimes/attacker";
import { HealerLifetimeProcess } from "../lifetimes/healer";
import { SquadAttackerLifetimeProcess } from "../lifetimes/squadAttacker";

export class SquadManagementProcess extends Process
{
    type = 'sqm';
    metaData: SquadManagementProcessMetaData

    public ensureMetaData()
    {
        if(!this.metaData.attackers)
            this.metaData.attackers = [];

        if(!this.metaData.healers)
            this.metaData.healers = [];
    }

    public getFlags(identifier: string, max: number)
    {
        let flags = [];
        for(let i = 0; i < max; i++)
        {
            let flag = Game.flags[identifier + '-' + i];
            if(flag)
            {
                flags.push(flag);
            }
        }

        return flags;
    }

    public run()
    {
        this.ensureMetaData();

        let flag = Game.flags[this.metaData.flagName];

        if(!flag)
        {
            this.completed = true;
            return;
        }

        let keys = flag.name.split('-');

        let spawnRoom = keys[0];
        let identifier = keys[1];
        let max = +keys[2];

        let pathway = this.getFlags(identifier, max)

        if(pathway.length !== max)
        {
            this.completed = true;
            return;
        }

        this.metaData.attackers = Utils.clearDeadCreeps(this.metaData.attackers)
        this.metaData.healers = Utils.clearDeadCreeps(this.metaData.healers)

        if(this.metaData.attackers.length < 1)
        {
            let creepName = 'leadAttack-' + flag.pos.roomName + '-' + Game.time;
            let spawned = Utils.spawn(
                this.kernel,
                spawnRoom,
                '',
                creepName,
                {}
            );

            if(spawned)
            {
                this.metaData.attackers.push(creepName);
                this.kernel.addProcessIfNotExist(SquadAttackerLifetimeProcess, 'salf-' + creepName, this.priority - 1,
                {
                    creep: creepName,
                    flagName: flag.name,
                    leader: true
                });
            }
        }

        if(this.metaData.attackers.length > 0 && this.metaData.healers.length < 1)
        {
            let creepName = 'followHeal' + flag.pos.roomName + '-' + Game.time;
            let spawned = Utils.spawn(
                this.kernel,
                spawnRoom,
                '',
                creepName,
                {}
            );

            if(spawned)
            {
                this.metaData.attackers.push(creepName);
                this.kernel.addProcessIfNotExist(HealerLifetimeProcess, 'heallf-' + creepName, this.priority - 1, {
                    creep: creepName,
                    flagName: flag.name,
                    follower: true
                });
            }
        }
    }
}
