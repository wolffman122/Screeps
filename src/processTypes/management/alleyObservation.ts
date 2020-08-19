import { Process } from "os/process";
import { WorldMap } from "lib/WorldMap";
import { DepositMiningManagementProcess } from "./depositMining";
import { TerminalManagementProcess } from "processTypes/buildingProcesses/terminal";
import { KEEP_AMOUNT } from "processTypes/buildingProcesses/mineralTerminal";
import { Utils } from "lib/utils";
import { PowerHarvestingManagement } from "./powerHarvesting";

enum ReturnEnum {Deposits = 1, Power = 2}

export class AlleyObservationManagementProcess extends Process
{
  type = 'aomp'
  metaData: AlleyObservationManagementProcessMetaData

  run()
  {
    if (this.name === 'aompE39S35')
    {
      this.completed = true;
      return;
    }
    //console.log(this.name, 'Running');
    const room = Game.rooms[this.metaData.roomName];
    const termnial = room.terminal;
    const storage = room.storage;
    const checkRoom = Game.rooms[this.metaData.checkRoom];
    if(termnial?.store.getFreeCapacity() > 10000 && (storage?.store.getUsedCapacity(RESOURCE_ENERGY) > (KEEP_AMOUNT * 1.2) ?? false))
    {
      let results;
      if(checkRoom)
        results = this.checkTheRoom(checkRoom);

      if((results & ReturnEnum.Deposits) === ReturnEnum.Deposits)
      {
        if(!this.kernel.hasProcess('dmmp-' + checkRoom.name))
        {
          const spawnRoomName = Utils.nearestRoom(checkRoom.name)
          if(spawnRoomName !== '')
          {
            Game.notify('Deposit Mining starting in ' + checkRoom.name + ' Game time ' + Game.time);
            this.kernel.addProcessIfNotExist(DepositMiningManagementProcess, 'dmmp-' + checkRoom.name, this.priority - 1, {
              roomName: spawnRoomName,
              targetRoomName: checkRoom.name
            });
          }

          return;
        }
      }
      else if((results & ReturnEnum.Power) === ReturnEnum.Power)
      {
        const powerBank = <StructurePowerBank>checkRoom.find(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_POWER_BANK})[0];

        if(powerBank?.ticksToDecay > 4000 && powerBank?.power > 1500)
        {
          if(!this.kernel.hasProcess('powhm-' + checkRoom.name))
          {
            console.log('Spawn power retrieval', checkRoom.name, powerBank.ticksToDecay);
            //if(checkRoom.name === 'E47S50' || checkRoom.name === 'E40S36' checkRoom.name === 'E40S28')
            {
              const spawnRoomName = Utils.nearestRoom(checkRoom.name);
              const spawnRoom = Game.rooms[spawnRoomName];
              if(spawnRoom?.terminal.store.getUsedCapacity(RESOURCE_POWER) < 2000)
              {
                if(spawnRoomName !== '')
                {
                  Game.notify('PowerBank mission starting in ' + checkRoom.name + ' Gam.time ' + Game.time);
                  this.kernel.addProcessIfNotExist(PowerHarvestingManagement, 'powhm-' + checkRoom.name, this.priority - 1, {
                    roomName: checkRoom.name,
                    spawnRoomName: spawnRoomName,
                    powerBankId: powerBank.id
                  })
                }
              }
            }

            return;
          }
        }
      }
      else if(results === (ReturnEnum.Deposits & ReturnEnum.Power))
      {
        console.log('Spawn both');
      }

      const observer = this.roomData().observer;
      const coord = WorldMap.getRoomCoordinates(this.metaData.roomName);
      let horizontalScan = false;
      let verticalScan = false;
      // if(this.metaData.roomName === 'E41S32')
      // {
      //   if(coord.x % 10 <= 2 || coord.y % 10 >= 8)
      //     verticalScan = true;

      //   if(coord.x % 10 <= 2 || coord.y % 10 >= 8)
      //     horizontalScan = true;
      // }
      // else
      {
        if(coord.x % 10 === 1 || coord.x % 10 === 9)
          verticalScan = true;

        if(coord.y % 10 === 1 || coord.y % 10 === 9)
          horizontalScan = true;
      }

      if(this.metaData.scanRooms === undefined)
        this.metaData.scanRooms = this.generateRoomList(coord, horizontalScan, verticalScan);

      this.metaData.lastCanTick = Game.time;
      const scanRoom = this.metaData.scanRooms[this.metaData.scanIndex++];
      if(this.metaData.scanIndex >= this.metaData.scanRooms.length)
        this.metaData.scanIndex = 0;

      if(observer.observeRoom(scanRoom) === OK)
        this.metaData.checkRoom = scanRoom;
    }
  }

  checkTheRoom(room: Room)
  {
    let retValue: ReturnEnum;
    const deposits = room.find(FIND_DEPOSITS).filter(d => !d.lastCooldown);
    if(deposits.length)
    {
      if(deposits[0].lastCooldown < 20)
        retValue = ReturnEnum.Deposits;
    }

    const powerBanks = room.find(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_POWER_BANK});
    if(powerBanks.length)
    {
      const creeps = room.find(FIND_HOSTILE_CREEPS);
      if(creeps.length)
        console.log(this.name, 'Power', room.name, 'hostilecreeps', creeps.length);
      else
      {
        console.log(this.name, 'Power', room.name, 'time to harvest');
        retValue |= ReturnEnum.Power;
      }
    }

    return retValue;
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

        for(let i = (xCord - 4); i < (xCord + 5); i++)
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

      for(let i = (yCord - 4); i < (yCord + 5); i++)
      {
        const name = coord.xDir + xCord + coord.yDir + i;
        roomNames.push(name);
      }

      return roomNames;
    }
  }
}
