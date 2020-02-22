import { Process } from "os/process";
import { TerminalManagementProcess } from "./terminal";
import { ENERGY_KEEP_AMOUNT, MINERALS_RAW, REAGENT_LIST, KEEP_AMOUNT } from "./mineralTerminal";

export class AllTerminalManagementProcess extends Process
{
    metaData: AllTerminalManagementProcessMetaData;
    type = 'atmp'
    run()
    {
        if(!this.metaData.receiveStr)
            this.metaData.receiveStr = {};

        if(!this.metaData.sendStrings)
            this.metaData.sendStrings = {};

        for(const str in this.metaData.receiveStr)
        {
            const room = Game.rooms[str];
            if(room)
                room.visual.text(this.metaData.receiveStr[str], 5, 4, {color: 'white', align: 'left'});
            else
                delete this.metaData.receiveStr[str];
        }

        for(const str in this.metaData.sendStrings)
        {
            const room = Game.rooms[str];
            if(room)
                room.visual.text(this.metaData.sendStrings[str], 5, 5, {color: 'white', align: 'left'});
            else
                delete this.metaData.sendStrings[str];
        }

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
                if(r.controller?.my && r.controller.level >= 6)
                {
                    if(this.metaData.shutDownTransfers[r.name] ?? false)
                        return;

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
                                let info = {roomName: r.name, amount: terminal.store[s], terminal: terminal.id};
                                this.metaData.resources[s].push(info);
                            }

                        })
                    }
                }
            });





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

                let minTerminal = <StructureTerminal>Game.getObjectById(min.terminal);

                if(RESOURCE_KEANIUM === r)
                    console.log(this.name, min.terminal);

                let minOk = false;
                do
                {
                    if(min.roomName === 'E36S43')
                        console.log(this.name, 'H Problems', 1, this.roomInfo(min.roomName).mineral.mineralType, r)
                    if(this.roomInfo(min.roomName).mineral.mineralType === r)
                    {
                        if(min.roomName === 'E36S43')
                        console.log(this.name, 'H Problems', 2)
                        const index = this.metaData.resources[r].indexOf(min, 0);
                        if(index > -1)
                        {
                            if(min.roomName === 'E36S43')
                                console.log(this.name, 'H Problems', 3)
                            this.metaData.resources[r].splice(index, 1);
                            min = _.min(this.metaData.resources[r], 'amount');
                            if(min.roomName === 'E36S43')
                                console.log(this.name, 'H Problems', 4, min.roomName)
                            minTerminal = <StructureTerminal>Game.getObjectById(min.terminal);
                        }
                    }
                    else
                        minOk = true;

                        if(min.roomName === 'E36S43')
                            console.log(this.name, 'H Problems', 5, minOk)

                }while(!minOk);

                let minStorageOk = false;
                do
                {
                    const storage = Game.rooms[min.roomName].storage;
                    if(storage?.store[r] > KEEP_AMOUNT)
                    {
                        const index = this.metaData.resources[r].indexOf(min, 0);
                        if(index > -1)
                        {
                            this.metaData.resources[r].splice(index, 1);
                            min = _.min(this.metaData.resources[r], 'amount')
                            minTerminal = <StructureTerminal>Game.getObjectById(min.terminal);
                        }
                    }
                    else
                    minStorageOk = true;
                    
                }while(!minStorageOk);

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

                let maxTerminal = <StructureTerminal>Game.getObjectById(max.terminal);
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
                        if(ret === OK)
                        {
                            const maxRoom = maxTerminal.room;
                            const minRoom = minTerminal.room;
                            this.metaData.sendStrings[maxRoom.name] = 'Send Information: To ' + minRoom.name + ' ' + r + ' ' + (5000 - min.amount) + ' : ' + Game.time;
                            this.metaData.receiveStr[minRoom.name] = 'Recieved Information: From ' + maxRoom.name + ' ' + r + ' ' + (5000 - min.amount) + ' : ' + Game.time;
                        }
                        console.log('Sending', r, maxTerminal.room.name, 'to', minTerminal.room.name, 5000 - min.amount, 'Return value', ret);
                    }
                }
            })
        }
    }
}
