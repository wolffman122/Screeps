import { Process } from "os/process";
import { Utils } from "lib/utils";
import { AttackerLifetimeProcess } from "../lifetimes/attacker";
import { HealerLifetimeProcess } from "../lifetimes/healer";
import { SquadAttackerLifetimeProcess } from "../lifetimes/squadAttacker";

export class SquadManagementProcess extends Process
{
    type = 'sqm';
    metaData: SquadManagementProcessMetaData
    attackRoomName: string;

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

        this.attackRoomName = flag.pos.roomName;

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
        let count = Utils.creepPreSpawnCount(this.metaData.attackers);

        if(count < 1)
        {
            let creepName = this.metaData.roomName + '-attacker-' + Game.time;
            let spawned = Utils.spawn(
                this.kernel,
                this.metaData.roomName,
                'attacker',
                creepName,
                {
                max: 34
                }
            );

            if(spawned)
            {
                this.metaData.attackers.push(creepName);
            }
        }

        for(let i = 0; i < this.metaData.attackers.length; i++)
        {
            let attacker = Game.creeps[this.metaData.attackers[i]];
            if(attacker)
            {
                this.AttackerActions(attacker);
            }
        }

        this.metaData.attackers = Utils.clearDeadCreeps(this.metaData.healers)
        count = Utils.creepPreSpawnCount(this.metaData.healers);

        if(count < 1)
        {
            let creepName = this.metaData.roomName + '-healer-' + Game.time;
            let spawned = Utils.spawn(
                this.kernel,
                this.metaData.roomName,
                'healer',
                creepName,
                {
                max: 34
                }
            );

            if(spawned)
            {
                this.metaData.healers.push(creepName);
            }
        }

        for(let i = 0; i < this.metaData.healers.length; i++)
        {
            let healer = Game.creeps[this.metaData.healers[i]];
            if(healer)
            {
                //this.HealerActions(healer);
            }
        }
    }

    AttackerActions(attacker: Creep)
    {
        try
        {
            /*let blockerFlag: Flag|undefined; // Need to later code in to put on wall or rampart to attack

            if(!attacker.memory.boost)
            {
                attacker.boostRequest([RESOURCE_CATALYZED_UTRIUM_ACID, RESOURCE_CATALYZED_GHODIUM_ALKALIDE], false);
                return;
            }

            let targetName: string|undefined;

            if(attacker.pos.roomName != this.metaData.attackRoomName && !attacker.memory.target)
            {
                attacker.travelTo(new RoomPosition(25,25, this.metaData.attackRoomName));
            }
            else
            {
                let prioritySpawns = false;

                // Build Priorities
                let spawns = this.roomInfo(this.attackRoomName).spawns;
                let towers = this.roomInfo(this.attackRoomName).towers;
                if(towers && towers.length < 3)
                {
                    prioritySpawns = true;
                }

                if(blockerFlag)
                {
                    let structures = blockerFlag.pos.lookFor(LOOK_STRUCTURES);
                    let blocker = _.find(structures, (s) => {
                        return (s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART);
                    });

                    if(blocker)
                    {
                        targetName = blocker.id;
                    }
                }
                else if(prioritySpawns)
                {
                    targetName = attacker.pos.findClosestByRange(spawns).id;
                }
                else
                {
                    targetName = attacker.pos.findClosestByRange(towers).id;
                }

                if(targetName)
                {
                    attacker.memory.target = targetName;
                    targetName = undefined;
                }

                if(attacker.memory.target && !targetName)
                {
                    let target = Game.getObjectById(attacker.memory.target);
                    if(target)
                    {
                        if(target instanceof StructureWall || target instanceof StructureRampart)
                        {
                            if(attacker.pos.inRangeTo(target, 1))
                            {
                                attacker.rangedMassAttack();
                                attacker.heal(attacker);
                            }
                            else if (attacker.pos.inRangeTo(target, 3))
                            {
                                attacker.rangedAttack(target);
                                attacker.heal(attacker);
                                attacker.travelTo(target);
                            }
                            else
                            {
                                attacker.travelTo(target);
                            }
                        }
                        else if(target instanceof Structure)
                        {
                            if(attacker.pos.inRangeTo(target, 3))
                            {
                                attacker.rangedAttack(target);
                                attacker.heal(attacker);
                            }
                            else
                            {
                                attacker.heal(attacker);
                                attacker.travelTo(target);
                            }
                        }
                    }
            }*/
        }
        catch (error)
        {
            console.log(this.name, error);
        }
    }
}
