import { Process } from "os/process";
import { Utils } from "lib/utils";

export class skRoomManagementProcess extends Process
{
    type = 'skrmp';
    metaData: SKRoomManagementProcessMetaData;

    scout?: Creep;
    skRoomName: string;
    locations: {
        [type: string]: RoomPosition[]
    };

    ensureMetaData()
    {
        this.skRoomName = this.metaData.skRoomName
        this.scout = this.metaData.scoutName ? Game.creeps[this.metaData.scoutName] : undefined;

    }

    run()
    {
        if(!this.metaData.vision)
        {
            if(!this.metaData.locations)
            {
                //Make a scout
                /////////////////////////////////////////////////////////////////////////////////
                //
                // Need to figure out how to clear out the memory for this creep
                //
                /////////////////////////////////////////////////////////////////////////////////

                if(!this.scout)
                {
                    let creepName = this.metaData.skRoomName + '-scount-' + Game.time;
                    let spawned = Utils.spawn(
                        this.kernel,
                        this.metaData.roomName,
                        'scount',
                        creepName,
                        {}
                    )

                    if(spawned)
                    {
                     this.metaData.scoutName = creepName;
                    }
                }
                else
                {
                    if(this.scout.room.name !== this.metaData.skRoomName)
                    {
                        this.scout.travelTo(new RoomPosition(25,25, this.skRoomName), {range: 20});
                    }
                    else
                    {
                        /////////////////////////////////////////////////////////////////////////////////
                        //
                        // Need to add Flee code here to scout from a safe distance
                        //
                        /////////////////////////////////////////////////////////////////////////////////

                        // Get room data
                        if(!this.locations)
                        {
                            this.locations = {};
                        }

                        let sources = this.scout.room.find(FIND_SOURCES);
                        _.forEach(sources, (s) =>{
                            this.locations['sources'].push(s.pos);
                        })

                        let minerals = this.scout.room.find(FIND_MINERALS);
                        _.forEach(minerals, (m) => {
                            this.locations['minerals'].push(m.pos);
                        })
                    }
                }
            }
            else
            {
                let locations = this.metaData.locations;

                // Spawn Attacker and Healer

                let creepName = this.metaData.skRoomName + '-angle-' + Game.time;
                let spawned = Utils.spawn(
                    this.kernel,
                    this.metaData.roomName,
                    'angel',
                    creepName,
                    {}
                );

                if(spawned)
                {
                    this.kernel.addProcessIfNotExist( AngleLifetimeProcess, 'alp-' + creepName, this.priority -1,
                    {
                        creep: creepName,
                        skRoom: this.meta
                    })
                }
            }

    }
}
