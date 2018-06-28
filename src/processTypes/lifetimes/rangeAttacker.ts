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
        
        let hostileStructures = creep.room.find(FIND_HOSTILE_STRUCTURES);

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
