import { Process } from "os/process";
import { Utils } from "lib/utils";
import { HelperLifetimeProcess } from "../lifetimes/Helper";

export class HelpManagementProcess extends Process
{
    type = 'hmp';
    metaData: HelpManagementProcessMetaData;

    ensureMetaData()
    {
        if(!this.metaData.creeps)
        {
            this.metaData.creeps = {};
        }
    }

    run()
    {
        this.log("Helping Process")
        this.ensureMetaData();

        let flag = Game.flags[this.metaData.flagName];

        if(!flag)
        {
            this.completed = true;
            return;
        }

        let spawnRoom = this.metaData.flagName.split('-')[0];
        //let numberOfHelpers = +this.metaData.flagName.split('-')[1];
        let boosted = false;

        if(this.metaData.flagName.split('-')[2] === 'boosted')
        {
            boosted = true;
            flag.room!.memory.assisted = true;
        }

        if(boosted)
        {
            let boostMinerals = [RESOURCE_CATALYZED_GHODIUM_ACID,RESOURCE_CATALYZED_KEANIUM_ACID,RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE];
            let room = Game.rooms[spawnRoom];
            if(room && room.terminal)
            {
                let terminal = room.terminal;
                for(let mineral in boostMinerals)
                {
                    if(terminal.store.hasOwnProperty(mineral))
                    {
                        if(terminal.store[mineral] < 1000)
                        {
                            flag.room!.memory.assisted = false;
                        }
                    }
                    else
                    {
                        flag.room!.memory.assisted = false;
                    }
                }
            }
        }

        let sources = this.kernel.data.roomData[flag.pos.roomName].sources;
        let proc = this;

        if(flag.room!.memory.assisted)
        {
            console.log(proc.name, 'Need to length', sources.length);
            _.forEach(sources, function(source)
            {
                console.log(proc.name, 'Need to find the second', source.id);
                if(!proc.metaData.creeps[source.id])
                {
                    proc.metaData.creeps[source.id] = [];
                }

                console.log(proc.name, 'Need to find the second', proc.metaData.creeps[source.id].length);

                let creepNames = Utils.clearDeadCreeps(proc.metaData.creeps[source.id]);
                proc.metaData.creeps[source.id] = creepNames;
                let creeps = Utils.inflateCreeps(creepNames);

                if(creeps.length < 1)
                {
                    console.log(proc.name, '1');
                    let creepName = 'hmp-helper-' + spawnRoom + '-' + Game.time;
                    console.log(proc.name, '11');
                    let spawned = Utils.spawn(
                        proc.kernel,
                        spawnRoom,
                        'remoteWorker',
                        creepName,
                        {}
                    );

                    if(spawned)
                    {
                        console.log(proc.name, '2');
                        proc.metaData.creeps[source.id].push(creepName);

                        if(boosted)
                        {
                            let boosts = [];
                            boosts.push(RESOURCE_CATALYZED_GHODIUM_ACID);
                            boosts.push(RESOURCE_CATALYZED_KEANIUM_ACID);
                            boosts.push(RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE);
                            proc.kernel.addProcess(HelperLifetimeProcess, 'hlplf-' + creepName, 20, {
                                creep: creepName,
                                flagName: proc.metaData.flagName,
                                boosts: boosts,
                                allowUnboosted: false,
                                source: source.id

                            });
                        }
                        else
                        {
                            proc.kernel.addProcess(HelperLifetimeProcess, 'hlplf-' + creepName, 20, {
                                creep: creepName,
                                flagName: proc.metaData.flagName
                            });
                        }
                    }
                }
            })
        }
        else
        {
            if(Game.time % 3000 === 0 && flag)
            {
                Game.notify("Out of boost minerals for room" + flag.room!.name);
            }
        }
    }
}
