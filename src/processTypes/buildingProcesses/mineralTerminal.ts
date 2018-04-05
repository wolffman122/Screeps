import { Process } from "os/process";

export class MinetalTerminalManagementProcess extends Process
{
  type = 'mineralTerminal';

  run()
  {
    let keepAmount = 35000;
    let spreadAmount = 2000;

    this.log('Minteral Terminal');

    let roomsExtraMinerals: {rName: string, mType: string} [] = [];
    let recievableRooms: {rName: string, mType: string, amount: number } [] = [];

    _.forEach(Game.rooms, (r) => {
      if(r.controller.my && r.terminal && r.controller.level >= 8 && r.terminal.cooldown === 0)
      {
        let mineral = <Mineral>r.find(FIND_MINERALS)[0]
        if(mineral)
        {
          if(mineral.room.storage && mineral.room.terminal.store[mineral.mineralType] >= keepAmount)
          {
            //console.log('Room ' + mineral.room.name + ' storage ' + mineral.room.storage.store[mineral.mineralType])
            roomsExtraMinerals.push( {
              rName: mineral.room.name,
              mType: mineral.mineralType
            })
          }

          let lowest = spreadAmount;
          let roomName = "";
          let type = "";

          for(let mineralType of MINERALS_RAW)
          {
            if(r.terminal.store[mineralType] == undefined || r.terminal.store[mineralType] < lowest && mineralType !== mineral.mineralType)
            {
              if(r.terminal.store[mineralType] == undefined)
              {
                lowest = 0;
              }
              else
              {
                lowest = r.terminal.store[mineralType];
              }
              roomName = r.name;
              type = mineralType;
            }
          }

          if(roomName !== "" && type !== "")
          {
            recievableRooms.push ({
              rName: roomName,
              mType: type,
              amount: lowest
            })
          }
        }
      }
    });


    _.forEach(roomsExtraMinerals, (ex) => {
      let receiveRoom = _.find(recievableRooms, (rr) => {
        if(rr.mType == ex.mType && rr.rName != ex.rName)
        {
          return rr.rName;
        }
      });

      if(receiveRoom)
      {
        let terminal = Game.rooms[ex.rName].terminal;
        if(terminal && terminal.cooldown == 0)
        {
          terminal.send(ex.mType, (spreadAmount - receiveRoom.amount), receiveRoom.rName);
        }
      }
    });
  }
}

export const MINERALS_RAW = ["H", "O", "Z", "U", "K", "L", "X"];
export const PRODUCT_LIST = ["XGH2O", "UH", "LO", "GO", "G"];
export const PRODUCTION_AMOUNT = 5000;

export const REAGENT_LIST = {
  KO: ["K", "O"],
  UH: ["U", "H"],
  UO: ["U", "O"],
  OH: ["O", "H"],
  LO: ["L", "O"],
  LH: ["L", "H"],
  ZO: ["Z", "O"],
  ZH: ["Z", "H"],
  ZK: ["Z", "K"],
  UL: ["U", "L"],
  G: ["ZK", "UL"],
  GH: ["G", "H"],
  GO: ["G", "O"],
  UH2O: ["UH", "OH"],
  UHO2: ["UO", "OH"],
  GH2O: ["GH", "OH"],
  GHO2: ["GO", "OH"],
  LHO2: ["LO", "OH"],
  LH2O: ["LH", "OH"],
  ZHO2: ["ZO", "OH"],
  ZH2O: ["ZH", "OH"],
  KHO2: ["KO", "OH"],
  XUH2O: ["X", "UH2O"],
  XUHO2: ["X", "UHO2"],
  XGH2O: ["X", "GH2O"],
  XGHO2: ["X", "GHO2"],
  XLHO2: ["X", "LHO2"],
  XLH2O: ["X", "LH2O"],
  XZHO2: ["ZHO2", "X"],
  XZH2O: ["ZH2O", "X"],
  XKHO2: ["KHO2", "X"]
};
