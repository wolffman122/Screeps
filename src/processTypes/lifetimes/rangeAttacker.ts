import { LifetimeProcess } from "os/process";

export class RangeAttackerLifetimeProcess extends LifetimeProcess
{
    type = 'ralf';
    metaData: RangeAttackerLifetimeProcessMetaData

    run()
    {
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
            creep.travelTo(flag);
            return;
        }

        creep.heal(creep);
        let hostileCreeps = creep.room.find(FIND_HOSTILE_CREEPS);
        let hostileStructures = creep.room.find(FIND_HOSTILE_STRUCTURES);

        if(hostileCreeps.length)
        {
            let rangeTargets = _.filter(hostileCreeps, (hc) => {
                return (hc.getActiveBodyparts(RANGED_ATTACK) || hc.getActiveBodyparts(ATTACK));
            });

            if(rangeTargets)
            {
                let target = creep.pos.findClosestByPath(rangeTargets);
                if(creep.pos.inRangeTo(target.pos, 3))
                {
                    creep.rangedAttack(target);
                    creep.moveTo(target.pos);
                }
                else
                {
                    creep.travelTo(target, {range: 3});
                }

                return;
            }
        }
        
        if(hostileStructures.length)
        {
            let target = creep.pos.findClosestByPath(hostileStructures);
            if(creep.pos.inRangeTo(target, 3))
            {
                creep.rangedAttack(target);
            }

            creep.travelTo(target);
            return;
        }
    }

}
