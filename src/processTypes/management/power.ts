import { Process } from "os/process";
import { WorldMap } from "lib/WorldMap";
import { helper } from "lib/helper";
import { Traveler } from "lib/Traveler";

export class PowerManagementProcess extends Process
{
    room: Room;
    clydes: Creep[];
    bonnies: Creep[];
    carts: Creep[];
    memory: PowerManagementProcessMetaData

    run()
    {
        this.room = Game.rooms[this.memory.roomName];
        if(this.room)
        {
            let observer = this.room.findStructures(STRUCTURE_OBSERVER)[0] as StructureObserver;
            if(!observer)
                this.return;

            if(!Memory.powerObserver[this.room.name])
            {
                Memory.powerObservers[this.room.name] = this.generateScanData();
                return;
            }

            if(this.memory.currentBank)
            {
                this.monitorBank(this.memory.currentBank);
            }
            else
            {
                this.scanForBanks(observer);
            }
        }
    }

    private generateScanData(): {[roomName: string]: number}
    {
        if(Game.cpu.bucket < 10000)
            return;

        let scanData: {[roomName: string]: number} = {};
        let spawn: StructureSpawn;
        let possibleRoomNames = this.findAlleysInRange(5);
        for(let roomName of possibleRoomNames)
        {
            let position = helper.pathablePosition(roomName);
            let ret = Traveler.pathablePosition(roomName);
            
        }
    }
}
