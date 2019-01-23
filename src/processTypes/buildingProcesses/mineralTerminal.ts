import { Process } from "os/process";
import { TerminalManagementProcess } from "./terminal";

export class MinetalTerminalManagementProcess extends Process
{
  type = 'mineralTerminal';

  run()
  {
    if(Game.time % 20 === 2)
    {
      this.log('Minteral Terminal');

      let roomsExtraMinerals: {rName: string, mType: ResourceConstant} [] = [];
      let recievableRooms: {rName: string, mType: string, amount: number|undefined } [] = [];
      let extraProduct : { rName: string, mType: ResourceConstant, amount: number|undefined } [] = []
      let needProduct : { rName: string, mType: ResourceConstant, amount: number|undefined } [] = []
      let needSKProduct : { rName: string, mType: ResourceConstant, amount: number|undefined } [] = []
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
            let terminal = r.terminal;

            //////////// Find Rooms with Extra Minerals ///////////////////////
            if(mineral.room!.storage && terminal.store[mineral.mineralType]! >= KEEP_AMOUNT)
            {
              roomsExtraMinerals.push( {
                rName: mineral.room!.name,
                mType: mineral.mineralType
              })
            }

            //////////// Need Way to search production amounts that have extra. ///////////////////////
            _.forEach(PRODUCT_LIST, (p) => {
              if(p === RESOURCE_CATALYZED_GHODIUM_ACID && terminal.store[p] >= PRODUCTION_AMOUNT / 2 && r.controller.level >= 8)
                extraProduct.push({rName: r.name, mType: p, amount: 2500});
              else if(terminal.store[p] >= PRODUCTION_AMOUNT && r.controller && r.controller.level >= 8)
                extraProduct.push({rName: r.name, mType: p, amount: terminal.store[p] - PRODUCTION_AMOUNT + 500});

              if(r.memory.skSourceRoom && (p === RESOURCE_LEMERGIUM_OXIDE || p === RESOURCE_KEANIUM_OXIDE) &&
                (!terminal.store[p] || terminal.store[p] < PRODUCTION_AMOUNT) && r.controller.level >= 8)
              {
                let amount = terminal.store[p] ? PRODUCTION_AMOUNT - terminal.store[p] : 0;
                needSKProduct.push({rName: r.name, mType: p, amount: amount});
              }
              else
              {
                if(p === RESOURCE_CATALYZED_GHODIUM_ACID && (!terminal.store[p] ||terminal.store[p] < PRODUCTION_AMOUNT) && r.controller.level < 8)
                {
                  let amount = terminal.store[p] ? PRODUCTION_AMOUNT - terminal.store[p] : 0;
                  needProduct.push({rName: r.name, mType: p, amount: amount});
                }
                else if(p !== RESOURCE_CATALYZED_GHODIUM_ACID && (!terminal.store[p] || terminal.store[p] < PRODUCTION_AMOUNT) &&  r.controller.level >= 8)
                {
                  let amount = terminal.store[p] ? PRODUCTION_AMOUNT - terminal.store[p] : 0;
                  needProduct.push({rName: r.name, mType: p, amount: amount});
                }
              }
            });

            //console.log(this.name, 'Extra Product', extraProduct.length);
            //console.log(this.name, 'Need Product', needProduct.length);


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

          /*let flag = r.find(FIND_FLAGS, {filter: f => f.color === COLOR_YELLOW && f.secondaryColor === COLOR_YELLOW}) as Flag[];
          if(flag.length)
          {
            _.forEach(flag, (f) => {
              if(f.memory.skMineral)
              {
                let mineral = Game.getObjectById(f.memory.skMineral) as Mineral;
                if(r.terminal.store[mineral.mineralType] > 5000)
                {
                  roomsExtraMinerals.push( {
                    rName: r.name,
                    mType: mineral.mineralType
                  })
                }
              }
            })
          }*/
        }
      });

      ///////////// Sending Minerals between the rooms. ///////////////////////
      console.log(this.name, 'Extra Minerals')
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
            }
            else
            {
              console.log('Something wrong with mineral send');
            }
          }
        }
      });


      //////////// Sending Product between the rooms. ///////////////////////

      console.log(this.name, 'XGH20 Stuff');
      let xgh20 = _.find(needProduct, (np) => {
        return np.mType === RESOURCE_CATALYZED_GHODIUM_ACID;
      });

      if(xgh20)
      {
        let extraXgh20 = _.find(extraProduct, (ep) => {
          return ep.mType === RESOURCE_CATALYZED_GHODIUM_ACID && ep.amount >= 100;
        });

        if(extraXgh20.rName !== xgh20.rName)
        {
          if(extraXgh20)
          {
            let terminal = Game.rooms[extraXgh20.rName].terminal;
            if(terminal.send(extraXgh20.mType, extraXgh20.amount, xgh20.rName) === OK)
            {
              console.log(this.name, 'Sent upgrade stuff', terminal.room.name, xgh20.rName);
              return;
            }
            else
            {
              console.log(this.name, 'Not enough upgrade');
            }
          }
          else
          {
            console.log(this.name, 'No rooms have extra upgrade');
          }
        }
      }
      else
      {
        console.log(this.name, 'No rooms need upgrade');
      }

      console.log(this.name, 'Extra Product');
      _.forEach(extraProduct, (ep) =>{
        let receiveSKRoom = _.find(needSKProduct, (rr) => {
          if(rr.mType === ep.mType && rr.rName != ep.rName)
          {
            return rr.rName;
          }

          return false;
        });

        if(receiveSKRoom)
        {
          let terminal = Game.rooms[ep.rName].terminal;
          if(terminal && terminal.cooldown === 0 && receiveSKRoom.amount)
          {
            if(terminal.send(ep.mType, ep.amount, receiveSKRoom.rName) === OK)
            {
              return;
            }
          }
        }

        let receiveRoom = _.find(needProduct, (rr) => {
          if(rr.mType === ep.mType && rr.rName != ep.rName)
          {
            return rr.rName;
          }

          return false;
        });

        if(receiveRoom)
        {
          let terminal = Game.rooms[ep.rName].terminal;
          if(terminal && terminal.cooldown === 0 && receiveRoom.amount)
          {
            if(terminal.send(ep.mType, ep.amount, receiveRoom.rName) === OK)
            {
              if(ep.rName === 'E35S41')
              {
                console.log('Extra Product ', ep.rName, 'sending', ep.mType, 'to', receiveRoom.rName, receiveRoom.amount)
              }

              if(receiveRoom.rName === 'E35S41')
              {
                console.log('Need Product ', ep.rName, 'sending', ep.mType, 'to', receiveRoom.rName, receiveRoom.amount)
              }
              needProduct = _.filter(needProduct, (np) => {
                return np !== receiveRoom;
              });

              return false;
            }
          }
        }
      })


      /*
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

            if(terminal.send(RESOURCE_CATALYZED_KEANIUM_ACID, amount, needCarry[0]) === OK)
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

            terminal.send(RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE, amount, needMove[0]);
            return;
          }
        }
      }*/
    }
  }
}

export const ENERGY_KEEP_AMOUNT = 440000;
export const KEEP_AMOUNT = 35000;
export const SPREAD_AMOUNT = 2000;
export const MINERALS_RAW = [RESOURCE_HYDROGEN, RESOURCE_OXYGEN, RESOURCE_ZYNTHIUM, RESOURCE_UTRIUM, RESOURCE_KEANIUM, RESOURCE_LEMERGIUM, RESOURCE_CATALYST];
export const PRODUCT_LIST = [RESOURCE_LEMERGIUM_OXIDE, RESOURCE_KEANIUM_OXIDE, RESOURCE_GHODIUM_ACID, RESOURCE_CATALYZED_GHODIUM_ACID,
                             RESOURCE_GHODIUM_ACID,
                             RESOURCE_GHODIUM,
                             RESOURCE_LEMERGIUM_HYDRIDE,
                             RESOURCE_CATALYZED_GHODIUM_ALKALIDE];
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

  //_.forEach(Game.rooms['E55S47'].find(FIND_STRUCTURES, {filter: f=> f.structureType === STRUCTURE_EXTENSION}), f => f.destroy())
