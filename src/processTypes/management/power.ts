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
                return;

            if(!Memory.powerObservers[this.room.name])
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

            this.roleCall()
            this.missitonActions();
        }
    }

    roleCall()
    {
        let max = 0;
        let distance;
        if(this.memory.currentBank && !this.memory.currentBank.finishing && !this.memory.currentBank.assisting)
        {
            max = 1;
            distance = this.memory.currentBank.distance;
        }

        this.bonnies = this.headCount("bonnie", () => this.configBody({ move: 25, heal; 25}), () => max, {
            prespawn: distance,
            reservation: { spawns: 2, currentEnergy 8000 }
        });

        this.clydes = this.headCount("clyde", () => this.configBody({ move: 20, attack: 20}), () => this.bonnies.length);

        let unitsPerCart = 1;
        let maxCarts = 0;
        if(this.memory.currentBank && this.memory.currentBank.finishing && !this.memory.currentBank.assisting)
        {
            let unitsNeeded = Math.ceil(this.memory.currentBank.power / 100);
            maxCarts = Math.ceil(unitsNeeded / 16);
            unitsPerCart = Math.ceil(unitsNeeded / maxCarts);
        }

        this.carts = this.headCount("powerCart", () => this.workerBody(0, unitsPerCart * 2, unitsPerCart), () => maxCarts);
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
            let ret = Traveler.findTravelPath(spawn, {pos: position});
            if(ret.incomplete)
            {
                console.log(this.name, "POWER: incomplete path generating scadata");
                continue;
            }

            let currentObserver = _.find(Memory.powerObservers, (value) => value[roomName]);
            let distance = ret.path.length;
            if(distance > 250) continue;

            if(currentObserver)
            {
                if(currentObserver[roomName] > distance)
                {
                    console.log('POWER: found better distance for power bank');
                    delete currentObserver[roomName];
                }
                else
                {
                    continue;
                }
            }

            scanData[roomName] = distance;
        }

        return scanData;
    }

    private monitorBank(currentBank: BankData)
    {
        let room = Game.rooms[currentBank.pos.roomName];
        if(room)
        {
            let bank = room.findStructures<StructurePowerBank>(STRUCTURE_POWER_BANK)[0];
            if(bank)
            {
                currentBank.hits = bank.hits;
                if(!currentBank.finishing && bank.hits < 500000)
                {
                    let clyde = bank.pos.findInRange<Creep>(
                        _.filter(room.find(FIND_MY_CREEPS), (c: Creep) => c. partCount(ATTACK) === 20), 1)[0];
                    if(clyde && bank.hits < clyde.ticksToLive * 600)
                    {
                        console.log(`POWER: last wave needed for bank has arrived, ${this.name}`);
                        currentBank.finishing = true;
                    }
                }
            }
            else
            {
                this.metaData.currentBank = undefined;
            }
        }
        if(Game.time > currentBank.timeout)
        {
            console.log(`POWER: bank timed out ${JSON.stringify(currentBank)}, removing room from powerObservers`);
            delete Memory.powerObservers[this.room.name];
            this.metaData.currentBank = undefined;
        }
    }

    private scanForBanks(observer: StructureObserver)
    {
        if(observer.observation && observer.observation.purpose === this.name)
        {
            let room = observer.observation.room;
            let bank = observer.observation.room.findStructures<StructurePowerBank>(STRUCTURE_POWER_BANK)[0];
            if(bank && bank.ticksToDecay > 4500 && room.findStructures(STRUCTURE_WALL).length === 0
                && bank.power >= Memory.playerConfig.powerMinimum)
            {
                console.log("\\o/ \\o/ \\o/", bank.power, "power found at", room, "\\o/ \\o/ \\o/");
                this.metaData.currentBank = {
                    pos: bank.pos,
                    hits: bank.hits,
                    power: bank.power,
                    distance: Memory.powerObservers[this.room.name][room.name],
                    timeout: Game.time + bank.ticksToDecay,
                };
                return;
            }
        }

        let scanData = Memory.powerObservers[this.room.name];
        if(this.metaData.scanIndex >= Object.keys(scanData).length)
            this.metaData.scanIndex = 0;

        let roomName = Object.keys(scanData)[this.metaData.scanIndex++];
        observer.observeRoom(roomName, this.name);
    }

    findAlleysInRange(range: number)
    {
        let roomNames = [];

        for(let i = this.room.coords.x - range; i <= this.room.coords.x + range; i++)
        {
            for(let j = this.room.coords.y - range; j <= this.room.coords.y + range; j++)
            {
                let x = i;
                let xDir = this.room.coords.xDir;
                let y = j;
                let yDir = this.room.coords.yDir;
                if(x < 0)
                {
                    x = Math.abs(x) - 1;
                    xDir = WorldMap.negaDirection(xDir);
                }

                if(y < 0)
                {
                    y = Math.abs(y) - 1;
                    yDir = WorldMap.negaDirection(yDir);
                }

                let roomName = xDir + x + yDir + y;
                if((x % 10 === 0) || (y % 10 === 0) && Game.map.isRoomAvailable(roomName))
                {
                    roomNames.push(roomName);
                }
            }
        }
        return roomNames;
    }
}
