import { Process } from "os/process";
import { TerminalManagementProcess } from "./terminal";
import { ENERGY_KEEP_AMOUNT, MINERALS_RAW, REAGENT_LIST } from "./mineralTerminal";

export class AllTerminalManagementProcess extends Process
{
    metaData: AllTerminalManagementProcessMetaData;
    type = 'atmp'
    run()
    {
        // Gathering Process
        if(Game.time % 20 === 5)
        {
            if(this.metaData.resources === undefined)
            {
                this.metaData.resources = {};
            }

            let regList: string[] = []
            _.forEach(Object.keys(REAGENT_LIST), (r) => {
                regList.push(r);
            });

            let resources = _.union(MINERALS_RAW, regList);
            _.forEach(Game.rooms, (r) => {
                let terminal = r.terminal;
                if(terminal?.my)
                {
                    _.forEach(resources, (s) => {
                        //console.log(this.name, s);
                        let amount = terminal.store[s] === undefined ? 0 : terminal.store[s];

                        if(this.metaData.resources[s] === undefined)
                        {
                            this.metaData.resources[s] = [];
                        }


                        let index =_.findIndex(this.metaData.resources[s], (ra) =>{
                                        return (ra.roomName === r.name);
                                });

                        if(index !== -1)
                        {
                            let data = this.metaData.resources[s][index];
                            if(data.amount !== amount)
                            {
                                this.metaData.resources[s][index].amount = amount;
                            }
                        }
                        else
                        {
                            //console.log(this.name, 'Push', s, r.name, terminal.store[s]);
                            let info = {roomName: r.name, amount: terminal.store[s], terminal: terminal.id};
                            this.metaData.resources[s].push(info);
                        }

                    })
                }
            })



            //console.log(this.name, Object.keys(this.metaData.resources).length)
            //_.forEach(Object.keys(this.metaData.resources), (s) => {
            //    console.log(this.name, s);
            //})

        }

        // Analyze Data

        let max: roomAmounts;
        let min: roomAmounts
        if(Game.time % 20 === 15)
        {
            console.log(this.name, 'Sending portinon');
            _.forEach(Object.keys(this.metaData.resources), (r:ResourceConstant) => {
                let max = _.max(this.metaData.resources[r], 'amount')
                let min = _.min(this.metaData.resources[r], 'amount')


                let maxTerminal = <StructureTerminal>Game.getObjectById(max.terminal);
                let minTerminal = <StructureTerminal>Game.getObjectById(min.terminal);

                if(RESOURCE_KEANIUM === r)
                    console.log(this.name, min.terminal);
                // Hopefully remove any terminals that don't have room.
                if(minTerminal?.store.getFreeCapacity() < 5000)
                {
                    do
                    {
                        const index = this.metaData.resources[r].indexOf(min, 0);
                        if(index > -1)
                        {
                            this.metaData.resources[r].splice(index, 1);
                            min = _.min(this.metaData.resources[r], 'amount');
                            minTerminal = <StructureTerminal>Game.getObjectById(min.terminal);
                        }
                    } while (minTerminal?.store.getFreeCapacity() < 5000)
                }

                console.log(this.name, r, max.roomName, max.amount);
                console.log(this.name, r, min.roomName, min.amount);

                if(r === RESOURCE_ENERGY)
                {

                }
                else if(max.amount >= 6000 && min.amount < 5000 && minTerminal?.store.getFreeCapacity() > 0)
                {
                    if(maxTerminal && maxTerminal.cooldown === 0)
                    {
                        let ret = maxTerminal.send(r, 5000 - min.amount, min.roomName);
                        console.log('Sending', r, maxTerminal.room.name, 'to', minTerminal.room.name, 5000 - min.amount, 'Return value', ret);
                    }
                }
            })
        }
    }
}
