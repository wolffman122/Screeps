import { LifetimeProcess } from "os/process";
import { Utils } from "lib/utils";

export class AttackerLifetimeProcess extends LifetimeProcess
{
    type = 'attacklf';
    metaData: AttackerLifetimeProcessMetaData

    run()
    {
        console.log(this.name, 1);
        let creep = this.getCreep();

        if(!creep)
        {
            this.completed = true;
            return;
        }

        let flag = Game.flags[this.metaData.flagName];

        if(!flag)
        {
            this.completed = true;
            return;
        }


        if(creep.pos.roomName != flag.pos.roomName)
        {
            creep.travelTo(flag, {range: 6});
            return;
        }

        let hostileSpawns = creep.room.find(FIND_HOSTILE_SPAWNS);
        let hostileCreeps = creep.room.find(FIND_HOSTILE_CREEPS, {filter: cr => cr.getActiveBodyparts(ATTACK) > 0});

        console.log(this.name, 0)
        if(hostileCreeps.length > 0)
        {
            console.log(this.name, 1)
            let target = creep.pos.findClosestByPath(hostileCreeps);
            if(!creep.pos.inRangeTo(target, 1))
            {
                creep.travelTo(target);
                return;
            }
            creep.attack(target);
            return;
        }
        else
        {
            console.log(this.name, 2)
            let creeps = creep.room.find(FIND_HOSTILE_CREEPS);
            if(creeps.length)
            {
                let target = creep.pos.findClosestByPath(creeps);
                if(!creep.pos.inRangeTo(target, 1))
                {
                    creep.travelTo(target);
                    return;
                }
                creep.attack(target);
                return;
            }
        }

        console.log(this.name, 3)
        let spawnTarget;
        let spawnRange;

        if(hostileSpawns.length > 0)
        {
            spawnTarget = creep.pos.findClosestByRange(hostileSpawns);
            spawnRange = creep.pos.getRangeTo(spawnTarget);
        }

        if(spawnTarget)
        {
            if(!creep.pos.inRangeTo(spawnTarget.pos, 1))
            {
                creep.travelTo(spawnTarget, {range: 1});
                return;
            }

            creep.attack(spawnTarget);
        }
    }
}
