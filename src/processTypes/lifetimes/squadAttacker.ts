import { LifetimeProcess } from "os/process";

export class SquadAttackerLifetimeProcess extends LifetimeProcess
{
    type = 'salf';
    metaData: SquadAttackerLifetimeProcessMetaData
    creep?: Creep;
    follower: Creep;
    path: Flag[];

    public run()
    {
        this.creep = this.getCreep();
        this.follower = Game.creeps[this.metaData.follower];

        if(!this.creep)
        {
            this.completed = true;
            return;
        }

        this.path = this.creep.getFlags(this.metaData.identifier, this.metaData.number);

        if(this.path.length === this.metaData.number)
        {
            let flagIndex = 0;

            if(this.creep.pos.isNearTo(this.path[flagIndex]))
            {
                if(flagIndex < this.path.length - 1)
                {
                    flagIndex++;
                }
                else
                {
                    //Attack
                    this.AttackRoom();
                }
            }
            else
            {
                // Travel
                if(this.follower && this.creep.pos.isNearTo(this.follower))
                {
                    this.creep.travelTo(this.path[flagIndex]);
                }
            }
        }
    }

    private AttackRoom()
    {
        if(this.creep)
        {
            let enemyStructures = this.creep.room.find(FIND_HOSTILE_STRUCTURES);
            let enemyTowers = _.filter(enemyStructures, (es) => {
                return (es.structureType === STRUCTURE_TOWER && es.energy > 0);
            });

            if(enemyTowers.length)
            {
                let target;
                _.forEach(enemyTowers, (et) => {
                    let rampart = et.pos.lookForStructures(STRUCTURE_RAMPART) as StructureRampart;
                    if(rampart)
                    {
                        target = rampart;
                    }
                    else
                    {
                        target = et;
                    }

                });
            }
        }
    }

}
