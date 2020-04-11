import { Process } from "os/process";

export class TowerHealProcess extends Process
{
    type = 'th';

    run()
    {
        // if(this.name === 'th-E35S41')
        // {
        //     this.completed = true;
        //     return;
        // }

        let room = Game.rooms[this.metaData.roomName];

        if(room.controller && !room.controller.my)
        {
            this.completed = true;
            return;
        }

        let damagedCreeps = <Creep[]>room.find(FIND_MY_CREEPS, {filter: cp => cp.my && cp.hits < cp.hitsMax});
        let damagedPowerCreeps = <PowerCreep[]>room.find(FIND_MY_POWER_CREEPS, {filter: pc => pc.my && pc.hits < pc.hitsMax});
        if(damagedCreeps.length > 0)
        {
            _.forEach(this.kernel.data.roomData[this.metaData.roomName].towers, function(tower)
            {
                let rangeDamage = tower.pos.findInRange(damagedCreeps, 30);
                if(rangeDamage.length > 0)
                {
                    let target = tower.pos.findClosestByRange(rangeDamage);
                    if(room.memory.hostileCreepIds?.length > 0)
                    {
                        if(target?.hits < (target?.hitsMax * .5))
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
        else if(damagedPowerCreeps.length)
        {
            for(let i = 0; i < this.kernel.data.roomData[this.metaData.roomName].towers.length; i++)
            {
                const tower = this.kernel.data.roomData[this.metaData.roomName].towers[i];
                let damage = tower.pos.findInRange(damagedPowerCreeps, 15);
                if(damage.length)
                {
                    let target = tower.pos.findClosestByRange(damage);

                    if(room.memory.hostileCreepIds?.length)
                    {
                        if(target?.hits < target?.hitsMax)
                            tower.heal(target);
                    }
                    else
                        tower.heal(target);
                }
            }
        }
        else
            this.suspend = 50;

    return;
    }
}
