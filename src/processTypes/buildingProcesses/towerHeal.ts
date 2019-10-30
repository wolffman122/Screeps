import { Process } from "os/process";

export class TowerHealProcess extends Process
{
    type = 'th';

    run()
    {
        if(this.name === 'th-E41S32')
            console.log(this.name, 1);
        let room = Game.rooms[this.metaData.roomName];

        if(room.controller && !room.controller.my)
        {
            this.completed = true;
            return;
        }

        let damagedCreeps = <Creep[]>room.find(FIND_MY_CREEPS, {filter: cp => cp.my && cp.hits < cp.hitsMax});

        if(damagedCreeps.length > 0)
        {
            _.forEach(this.kernel.data.roomData[this.metaData.roomName].towers, function(tower)
            {
                let rangeDamage = tower.pos.findInRange(damagedCreeps, 30);
                if(rangeDamage.length > 0)
                {
                    let target = tower.pos.findClosestByPath(rangeDamage);
                    const enemiesPresent = <Creep[]>room.find(FIND_HOSTILE_CREEPS);
                    if(enemiesPresent.length > 0)
                    {
                        if(target && target.hits < (target.hits * .5))
                        {
                            tower.heal(target);
                        }
                    }
                    else
                    {
                        tower.heal(target);
                    }
                }
            });
        }
        else
        {
            flag.memory.timeEnemies = 0;
            this.completed = true;
            return;
        }
    }
}
