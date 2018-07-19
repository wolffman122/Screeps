import { Process } from "os/process";

export class ReportProcess extends Process
{
    type = "report";

    run()
    {
        let report: {
            [roomName: string]: {
                mineralType: string;
                numberOfSources: number;
            }
        } = {};

        // Room report
        if(Game.time % 100 === 0)
        {
            _.forEach(Object.keys(Memory.rooms), (k) => {
                let r = Memory.rooms[k];

                if(r.cache.spawns.length === 0 || r.cache.enemySpawns.length > 0)
                {
                    let mineral = <Mineral>Game.getObjectById(r.cache.mineral);
                    let numberOfSources = r.cache.sources.length;
                    if(mineral && numberOfSources == 2)
                    {
                        report[k] = { mineralType: mineral.mineralType, numberOfSources: numberOfSources };
                    }
                }
            })

            let holder: string = "";
            _.forEach(Object.keys(report), (k) => {
                let r = report[k];
                holder += k + ' ' + r.mineralType + ' ' + r.numberOfSources;
            });

            Game.notify(holder);
        }
    }
}
