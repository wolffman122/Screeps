import { Process } from "os/process";

export class PowerManagementProcess extends Process
{
    metaData: PowerManagementProcessMetaData;

    memory: {
        currentBank: BankData;
        scanIndex: number;
        scanData: {[roomName: string]: number}
    };

    ensureMetaData()
    {
        if(!this.metaData.bonnies)
        {
            this.metaData.bonnies = [];
        }

        if(!this.metaData.clydes)
        {
            this.metaData.clydes = [];
        }

        if(!this.metaData.carts)
        {
            this.metaData.carts = [];
        }
    }

    init()
    {
        let observer = this.roomData().observer;
        if(!observer)
            return;

        if(Memory.powerObservers[this.metaData.roomName])
        {
            Memory.powerObservers[this.metaData.roomName] = this.generateScanData();
            return;
        }
    }

    private findAlleysInRange(range: number)
    {
        let roomNames = [];

        let room = Game.rooms[this.metaData.roomName];

        if(room)
        {
            for(let i = room.c)
        }
    }

    private generateScanData(): {[roomName: string]: number} | undefined
    {
        if(Game.cpu.bucket < 10000)
            return;

        let scanData: {[roomName: string]: number} = {};
        let spawn = 0;
        let possibleRoomNames = this.findAlleysInRange(5);

    }
}
