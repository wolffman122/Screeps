import { Process } from "os/process";
import { WorldMap } from "lib/WorldMap";
import { helper } from "lib/helper";
import { Traveler } from "lib/Traveler";

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

        if(this.metaData.currentBank)
        {
            this.monitorBank(this.metaData.currentBank);
        }
        else
        {
            this.scanForBanks(observer);
        }
    }

    private findAlleysInRange(range: number)
    {
        let roomNames = [];

        let room = Game.rooms[this.metaData.roomName];

        if(room)
        {
            for(let i = room.coords.x - range; i <= room.coords.x + range; i++)
            {
                for(let j = room.coords.y - range; j <= room.coords.y + range; j++)
                {
                    let x = i;
                    let xDir = room.coords.xDir;
                    let y = j;
                    let yDir = room.coords.yDir;
                    if(x < 0)
                    {
                        x = Math.abs(x) - 1;
                        xDir = WorldMap.negaDirection(xDir);
                    }
                    if (y < 0)
                    {
                        y = Math.abs(y) - 1;
                        yDir = WorldMap.negaDirection(yDir);
                    }

                    let roomName = xDir + x + yDir + y;
                    if((x % 10 === 0 || y % 10 === 0) && Game.map.isRoomAvailable(roomName))
                    {
                        roomNames.push(roomName);
                    }
                }
            }

            return roomNames;
        }

        return;
    }

    private generateScanData(): {[roomName: string]: number} | undefined
    {
        if(Game.cpu.bucket < 10000)
            return;

        let scanData: {[roomName: string]: number} = {};
        let spawn = 0;
        let possibleRoomNames = this.findAlleysInRange(5);
        if(possibleRoomNames)
        {
            for(let roomName of possibleRoomNames)
            {
                let position = helper.pathablePosition(roomName);
                let ret = Traveler.findTravelPath(spawn, {pos: position});
                if(ret.incomplete)
                {
                    console.log("POWER: incomplete path generating scandata (process:", this.name, "roomName", roomName)
                    continue;
                }

                let currentObserver = _.find(Memory.powerObservers, (value) => value[roomName]);
                let distance = ret.path.length;
                if(distance > 250)
                    continue;

                if(currentObserver)
                {
                    if(currentObserver[roomName] > distance)
                    {
                        console.log('POWER: found better distance for', roomName, 'at', this.name);
                        delete currentObserver[roomName];
                    }
                    else
                    {
                        continue;
                    }
                }

                scanData[roomName] = distance;
            }
        }

        console.log('POWER: found', Object.keys(scanData).length, 'rooms for power scan in', this.name);
        return scanData;
    }

    private monitorBank(currentBank: BankData)
    {
        let room = Game.rooms[currentBank.pos.roomName];
        if(room)
        {
            let bank = room.findStructures<StructurePowerBank>(STRUCTURE_POWER_BANK)[0];
        }
    }
}
