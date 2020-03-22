import { Process } from "os/process";
import { WorldMap } from "lib/WorldMap";
import { DepositMiningManagementProcess } from "./depositMining";
import { TerminalManagementProcess } from "processTypes/buildingProcesses/terminal";
import { KEEP_AMOUNT } from "processTypes/buildingProcesses/mineralTerminal";

enum ReturnEnum {Deposits = 1, Power = 2}

export class AlleyObservationManagementProcess extends Process
{
  type = 'aomp'
  metaData: AlleyObservationManagementProcessMetaData

  run()
  {
    try
    {
      console.log(this.name, 'Running');
      const room = Game.rooms[this.metaData.roomName];
      const termnial = room.terminal;
      const storage = room.storage;
      const checkRoom = Game.rooms[this.metaData.checkRoom];
      if(termnial?.store.getFreeCapacity() > 50000 && (storage?.store[RESOURCE_ENERGY] > (KEEP_AMOUNT * 1.2) ?? false))
      {
        console.log(this.name, 'Checking room', this.metaData.checkRoom, checkRoom)
        const results = this.checkTheRoom(checkRoom);

        if((results & ReturnEnum.Deposits) === ReturnEnum.Deposits)
        {
          console.log('Spawn Deposit retrieval');
          this.fork(DepositMiningManagementProcess, 'dmmp-' + checkRoom.name, this.priority - 1, {
            roomName: this.metaData.roomName,
            targetRoomName: checkRoom.name
          });

          return;
        }
        else if((results & ReturnEnum.Power) === ReturnEnum.Power)
        {
          console.log('Spawn power retrieval');
        }
        else if(results === (ReturnEnum.Deposits & ReturnEnum.Power))
        {
          console.log('Spawn both');
        }

        const observer = this.roomData().observer;
        const coord = WorldMap.getRoomCoordinates(this.metaData.roomName);
        let horizontalScan = false;
        let verticalScan = false;
        if(coord.x % 10 === 1 || coord.x % 10 === 9)
          verticalScan = true;

        if(coord.y % 10 === 1 || coord.y % 10 === 9)
          horizontalScan = true;

        console.log(this.name, 'vert', verticalScan, 'hor', horizontalScan)

        this.metaData.scanRooms === undefined;
        if(this.metaData.scanRooms === undefined)
          this.metaData.scanRooms = this.generateRoomList(coord, horizontalScan, verticalScan);

        console.log(this.name, 'ScanRooms', this.metaData.scanRooms.length)

        this.metaData.lastCanTick = Game.time;
        const scanRoom = this.metaData.scanRooms[this.metaData.scanIndex++];
        if(this.metaData.scanIndex >= this.metaData.scanRooms.length)
          this.metaData.scanIndex = 0;

        console.log(this.name, 'Should be scanning room', scanRoom, 'index', this.metaData.scanIndex);
        if(observer.observeRoom(scanRoom) === OK)
          this.metaData.checkRoom = scanRoom;
      }
    }
    catch(error)
    {
      console.log(this.name, 'run', error);

    }
  }

  checkTheRoom(room: Room)
  {
    try
    {
      let retValue: ReturnEnum;

      const deposits = room.find(FIND_DEPOSITS);
      if(deposits.length)
      {
        if(deposits[0].lastCooldown < 20)
          retValue = ReturnEnum.Deposits;
      }

      let powerBanks = room.find(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_POWER_BANK});
      if(powerBanks.length)
        retValue |= ReturnEnum.Power;

      return retValue;
    }
    catch(error)
    {
      console.log(this.name, 'checkTheRoom', error);
    }
  }

  generateRoomList(coord: RoomCoord, horizontal: boolean, vertical: boolean) : string[]
  {
    let roomNames:string[] = [];
    if(horizontal)
    {
      const xCord = coord.x;
      let yCord = coord.y;
      if(coord.y % 10 === 1)
        yCord -= 1;
      else if(coord.y % 10 === 9)
        yCord += 1;

        for(let i = (xCord - 2); i < (xCord + 3); i++)
        {
          const name = coord.xDir + i + coord.yDir + yCord;
          roomNames.push(name);
        }

        return roomNames;
    }

    if(vertical)
    {
      let xCord = coord.x;
      const yCord = coord.y;

      if(coord.x % 10 === 1)
        xCord -= 1;
      else if(coord.x % 10 === 9)
        xCord += 1;

      for(let i = (yCord - 2); i < (yCord + 3); i++)
      {
        const name = coord.xDir + xCord + coord.yDir + i;
        roomNames.push(name);
      }

      return roomNames;
    }

    // let xStart: number;
    // if(horizontal < 0)
    //   xStart = Math.floor(coord.x / 10) * 10;
    // else if(horizontal > 0)
    //   xStart = Math.ceil(coord.x / 10) * 10;
    // else
    //   {
    //     // Middle case
    //   }

    // let yStart: number
    // if(vertical < 0)
    //   yStart = Math.floor(coord.y / 10) * 10;
    // else if(vertical > 0)
    //   yStart = Math.ceil(coord.y / 10) * 10;
    // else
    // {
    //   // Middle case
    // }



    // for(let i = (yStart - 2); i < (yStart + 3); i++)
    // {
    //   const name = coord.xDir + xStart + coord.yDir + i;
    //   roomNames.push(name);
    // }

    // // Eliminate Duplicates
    // roomNames.filter((item, index) => roomNames.indexOf(item) === index);

    // return roomNames

  }
}
