import { LifetimeProcess } from "os/process";

export class HolderDefenderLifetimeProcess extends LifetimeProcess
{
    type = 'holderDefenderlf';
    metaData: HolderDefenderLifetimeProcessMetaData

    run()
    {

        let flag = Game.flags[this.metaData.flagName];
        let creep = this.getCreep();
        let enemies: Creep[] = [];
        if(flag?.room)
        {
            if(flag.room.memory.hostileCreepIds?.length)
            {
                for(let i = 0; i < flag.room.memory.hostileCreepIds.length; i++)
                {
                    const eCreep = Game.getObjectById(flag.room.memory.hostileCreepIds[i]) as Creep;
                    if(eCreep)
                        enemies.push(eCreep);
                }

                enemies = _.filter(enemies, (e) => {
                    return ((e.getActiveBodyparts(ATTACK) > 0) || (e.getActiveBodyparts(RANGED_ATTACK) > 0));
                });
            }
        }

        if(!creep)
        {
            this.completed = true;
            return;
        }

        if(this.metaData.boosted && !creep.memory.boost)
        {
            creep.boostRequest([RESOURCE_CATALYZED_UTRIUM_ACID], false);
            return;
        }

        if(flag.pos.roomName != creep.pos.roomName && !creep.memory.atPlace)
        {
            if(enemies?.length)
            {
                let target = enemies[0];
                if(!creep.pos.inRangeTo(target, 5))
                    creep.travelTo(target, {range: 5});
            }
            else
            {
                creep.travelTo(new RoomPosition(25, 25, flag.pos.roomName));
            }
            return;
        }

        const heal = creep.getActiveBodyparts(HEAL) ? true : false;
        const rangeAttack = creep.getActiveBodyparts(RANGED_ATTACK) ? true : false;
        const attack = creep.getActiveBodyparts(ATTACK) ? true : false;
        const range = rangeAttack ? 1 : 3;

        if(!rangeAttack && !attack)
            creep.suicide();

        if(heal)
            creep.heal(creep);

        if(enemies && enemies.length)
        {
            const healers = _.filter(enemies, (e) => {
                return (e.getActiveBodyparts(HEAL) !== 0);
            });

            if(attack)
            {
                if(healers.length)
                {
                    let target = creep.pos.findClosestByRange(healers);
                    // Healer attack
                    if(target)
                    {
                        let distance = creep.pos.getRangeTo(target);
                        if(range && distance <= 3)
                        {
                            let multiples = creep.pos.findInRange(enemies, 3);
                            if(multiples.length > 1)
                                creep.rangedMassAttack();
                            else
                                creep.rangedAttack(target);
                        }

                        if(distance === 1)
                        {
                            creep.attack(target);
                            if(!creep.memory.atPlace)
                                creep.memory.atPlace = true;
                        }

                        creep.travelTo(target, {movingTarget: true});
                        return;
                    }
                }
                else
                {
                    let target = creep.pos.findClosestByPath(enemies);
                    if(target)
                    {
                        let distance = creep.pos.getRangeTo(target);
                        if(range && distance <= 3)
                        {
                            let multiples = creep.pos.findInRange(enemies, 3);
                            if(multiples.length > 1)
                                creep.rangedMassAttack();
                            else
                                creep.rangedAttack(target);
                        }

                        if(distance === 1)
                        {
                            creep.attack(target);
                            if(!creep.memory.atPlace)
                                creep.memory.atPlace = true;
                        }

                        creep.travelTo(target, {movingTarget: true, range: 1});
                        return;
                    }
                }
            }
            else if(range)
            {
                if(healers.length)
                {
                    let target = creep.pos.findClosestByRange(healers);
                    // Healer attack
                    if(target)
                    {
                        if(creep.pos.inRangeTo(target, 3))
                        {
                            if(!creep.memory.atPlace)
                                creep.memory.atPlace = true;
                            let multiples = creep.pos.findInRange(enemies, 3);
                            if(multiples.length > 1)
                                creep.rangedMassAttack();
                            else
                                creep.rangedAttack(target);
                        }

                        creep.travelTo(target, {movingTarget: true, range: 3});
                        return;
                    }
                }
                else
                {
                    let target = creep.pos.findClosestByPath(enemies);
                    if(target)
                    {
                        if(creep.pos.inRangeTo(target, 3))
                        {
                            if(!creep.memory.atPlace)
                                creep.memory.atPlace = true;
                            let multiples = creep.pos.findInRange(enemies, 3);
                            if(multiples.length > 1)
                                creep.rangedMassAttack();
                            else
                                creep.rangedAttack(target);
                        }

                        creep.travelTo(target, {movingTarget: true, range: 3});
                        return;
                    }
                }
            }
        }
        else
        {
            flag.memory.enemies = false;
            //console.log(this.name, this.metaData.spawnRoomName);
            let container = this.kernel.data.roomData[this.metaData.spawnRoomName].generalContainers[0];
            if(creep.pos.inRangeTo(container, 0))
                creep.suicide();
            else
                creep.travelTo(container);

            return;
        }
    }
}
