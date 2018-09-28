import { LifetimeProcess } from "os/process";
import { MoveProcess } from "../creepActions/move";

export class BounceAttackerLifetimeProcess extends LifetimeProcess
{
    type = 'balf';
    metaData: BounceAttackerLifetimeProcessMetaData;

    run()
    {
        console.log('WTF !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
        let creep = this.getCreep();

        console.log('BAttack');
        let roomName = this.metaData.flagName.split('-')[0];
        let healName = roomName + '-Heal';
        let flag = Game.flags[this.metaData.flagName];
        let healFlag = Game.flags[healName];

        console.log('BAttack',creep, healFlag, flag);
        if(!creep || !healFlag || !flag)
        {
            this.completed = true;
            return;
        }

        if(!creep.pos.inRangeTo(flag,1) && creep.hits === creep.hitsMax)
        {
            this.log('2)')
            creep.travelTo(flag, {range: 1});

            return;
        }

        if(creep.hits < creep.hitsMax * .50)
        {
            creep.travelTo(healFlag.pos, {range: 1});
            return;
        }

        /*if(creep.room.name == flag.room!.name)
        {

            let target = flag.pos.lookFor(LOOK_STRUCTURES)

            if(target.length)
            {
                if(creep.pos.isNearTo(target[0]))
                {
                    creep.attack(target[0]);
                    return;
                }

                creep.travelTo(target[0]);
                return;
            }
            else
            {
                let targets = flag.pos.findInRange(FIND_HOSTILE_CREEPS, 10);
                let target = creep.pos.findClosestByPath(targets);

                if(target)
                {
                    if(creep.attack(target) === OK)
                    {
                        var direction = creep.pos.getDirectionTo(target);
                        creep.move(direction);
                    }
                    else
                    {
                        creep.travelTo(target, {range: 1});
                    }
                }
            }
        }*/
    }
}
