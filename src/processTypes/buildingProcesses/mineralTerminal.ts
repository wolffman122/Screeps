import { Process } from "os/process";

export class MinetalTerminalManagementProcess extends Process
{
  type = 'mineralTerminal';

  run()
  {
    if(Game.time % 10 === 0)
    {
      this.log('Minteral Terminal');

      let roomsExtraMinerals: {rName: string, mType: ResourceConstant} [] = [];
      let recievableRooms: {rName: string, mType: string, amount: number|undefined } [] = [];
      let needUpgrade: string[] = [];
      let extraUpgrade: string[] = [];
      let needCarry: string[] = [];
      let extraCarry: string[] = [];
      let needMove: string[] = [];
      let extraMove: string[] = [];

      _.forEach(Game.rooms, (r) => {
        if(r.controller && r.controller.my && r.terminal && r.controller.level >= 6  && r.terminal.cooldown === 0)
        {
          let mineral = <Mineral>r.find(FIND_MINERALS)[0]
          if(mineral)
          {
            if(mineral.room!.storage && mineral.room!.terminal!.store[mineral.mineralType]! >= KEEP_AMOUNT)
            {
              //console.log('Room ' + mineral.room.name + ' storage ' + mineral.room.storage.store[mineral.mineralType])
              roomsExtraMinerals.push( {
                rName: mineral.room!.name,
                mType: mineral.mineralType
              })
            }

            let terminal = r.terminal;

            // Upgrade
            if(terminal.store[RESOURCE_CATALYZED_GHODIUM_ACID]! > PRODUCTION_AMOUNT && r.controller.level >= 8)
            {
              //console.log(this.name, 'extra upgrade', r.name);
              extraUpgrade.push(r.name);
            }

            if((terminal.store[RESOURCE_CATALYZED_GHODIUM_ACID] === undefined || terminal.store[RESOURCE_CATALYZED_GHODIUM_ACID]! < PRODUCTION_AMOUNT))
            {
              //console.log(this.name, 'need upgrade', r.name);
              needUpgrade.push(r.name);
            }

            // Carry
            if(terminal.store[RESOURCE_CATALYZED_KEANIUM_ACID]! > PRODUCTION_AMOUNT && r.controller.level >= 8)
            {
              //console.log(this.name, 'extra upgrade', r.name);
              extraCarry.push(r.name);
            }

            if((terminal.store[RESOURCE_CATALYZED_KEANIUM_ACID] === undefined || terminal.store[RESOURCE_CATALYZED_KEANIUM_ACID]! < PRODUCTION_AMOUNT))
            {
              //console.log(r.name);
              needCarry.push(r.name);
            }

            // Move
            if(terminal.store[RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE]! > PRODUCTION_AMOUNT && r.controller.level >= 8)
            {
              //console.log(this.name, 'extra move', r.name);
              extraMove.push(r.name);
            }

            if((terminal.store[RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE] === undefined || terminal.store[RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE]! < PRODUCTION_AMOUNT))
            {
              //console.log(this.name, 'need move', r.name);
              needMove.push(r.name);
            }

            let roomName = "";
            let type = "";

            for(let mineralType of MINERALS_RAW)
            {
              let sendAmount: number = 0;

              if(terminal)
              {
                if(terminal.store[mineralType])
                {
                  if(terminal.store[mineralType]! < SPREAD_AMOUNT  && mineral.mineralType !== mineralType)
                  {
                    sendAmount = SPREAD_AMOUNT - terminal.store[mineralType]!;
                  }
                }
                else
                {
                  sendAmount = SPREAD_AMOUNT;
                }

                //console.log('1', r.name, mineralType, sendAmount)

                if(sendAmount > 100)
                {
                  //console.log(r.name, "Sending", mineralType, sendAmount)
                  recievableRooms.push({
                    rName: r.name,
                    mType: mineralType,
                    amount: sendAmount
                  });
                }
              }
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
          return false;
        });

        if(receiveRoom)
        {
          console.log('Found receive room ', receiveRoom.rName, receiveRoom.mType, receiveRoom.amount)
          let terminal = Game.rooms[ex.rName].terminal;
          if(terminal && terminal.cooldown == 0 && receiveRoom.amount)
          {
            if(terminal.send(ex.mType, receiveRoom.amount, receiveRoom.rName) === OK)
            {
              recievableRooms = _.filter(recievableRooms, (r2) => {
                return r2 !== receiveRoom;
              });

              return;
            }
          }
        }
      });

      // Upgrade
      for(let i = 0; i < extraUpgrade.length; i++)
      {
        let name = extraUpgrade[i];

        let terminal = Game.rooms[name].terminal;

        if(terminal && terminal.cooldown === 0)
        {
          if(needUpgrade.length)
          {
            let amount = terminal.store[RESOURCE_CATALYZED_GHODIUM_ACID]! - PRODUCTION_AMOUNT;
            if(amount > 0 && amount < 100)
            {
              amount = 100;
            }

            if(terminal.send(RESOURCE_CATALYZED_GHODIUM_ACID, amount, needUpgrade[0]) === OK)
            {
              return
              //extraCarry = _.pull(extraCarry, name);
              //extraMove = _.pull(extraMove, name);
            }
          }
        }
      }

      console.log(this.name, 'Carry', needCarry.length);
      //Carry
      for(let i = 0; i < extraCarry.length; i++)
      {
        let name = extraCarry[i];

        let terminal = Game.rooms[name].terminal;

        if(terminal && terminal.cooldown === 0)
        {
          if(needCarry.length)
          {
            let amount = terminal.store[RESOURCE_CATALYZED_KEANIUM_ACID]! - PRODUCTION_AMOUNT;
            if(amount > 0 && amount < 100)
            {
              amount = 100;
            }

            if(terminal.send(RESOURCE_CATALYZED_KEANIUM_ACID, 1000, needCarry[0]) === OK)
            {
              return;
              //extraMove = _.pull(extraMove, name);
            }
          }
        }
      }

      //Move
      for(let i = 0; i < extraMove.length; i++)
      {
        let name = extraMove[i];

        let terminal = Game.rooms[name].terminal;

        if(terminal && terminal.cooldown === 0)
        {
          if(needMove.length)
          {
            let amount = terminal.store[RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE]! - PRODUCTION_AMOUNT;
            if(amount > 0 && amount < 100)
            {
              amount = 100;
            }

            terminal.send(RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE, 1000, needMove[0]);
            return;
          }
        }
      }
    }
  }
}

export const KEEP_AMOUNT = 35000;
export const SPREAD_AMOUNT = 2000;
export const MINERALS_RAW = [RESOURCE_HYDROGEN, RESOURCE_OXYGEN, RESOURCE_ZYNTHIUM, RESOURCE_UTRIUM, RESOURCE_KEANIUM, RESOURCE_LEMERGIUM, RESOURCE_CATALYST];
export const PRODUCT_LIST = [RESOURCE_CATALYZED_GHODIUM_ACID,
                             RESOURCE_GHODIUM_ACID, RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE,
                             RESOURCE_CATALYZED_KEANIUM_ACID, RESOURCE_CATALYZED_LEMERGIUM_ACID, RESOURCE_GHODIUM,
                             RESOURCE_LEMERGIUM_ALKALIDE];
export const PRODUCTION_AMOUNT = 5000;

export const REAGENT_LIST = {
  KO: ["K", "O"],
  KH: ["K", "H"],
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
  KH2O: ["KH", "OH"],
  XUH2O: ["X", "UH2O"],
  XUHO2: ["X", "UHO2"],
  XGH2O: ["X", "GH2O"],
  XGHO2: ["X", "GHO2"],
  XLHO2: ["X", "LHO2"],
  XLH2O: ["X", "LH2O"],
  XZHO2: ["ZHO2", "X"],
  XZH2O: ["ZH2O", "X"],
  XKHO2: ["KHO2", "X"],
  XKH2O: ["KH2O", "X"],
};


export const WHITE_LIST = ['admon',
  'Baj', 'cazantyl', 'DoctorPC', 'Geir1983', 'InvisioBlack', 'Issacar', 'Komir',
  'likeafox', 'Lolzor', 'ncsupheo', 'NobodysNightmare', 'omnomwombat', 'Parthon',
  'Plemenit', 'poppahorse', 'Rengare', 'Subodai', 'Tantalas', 'Tijnoz', 'Totalschaden',
  'Vlahn', 'W4rl0ck', 'weaves', 'Xaq', 'Yilmas', 'Zeekner', 'Zyzyzyryxy',
  // Temporary ones
  'smitt33'];
