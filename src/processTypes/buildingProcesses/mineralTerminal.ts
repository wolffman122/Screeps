import { Process } from "os/process";
import { TerminalManagementProcess } from "./terminal";

export class MinetalTerminalManagementProcess extends Process
{
  type = 'mineralTerminal';

  run()
  {
    this.completed = true;
    return;
      }
}
export const ENERGY_KEEP_AMOUNT = 295000;
export const KEEP_AMOUNT = 10000;
export const SPREAD_AMOUNT = 2000;
export const MINERALS_RAW = [RESOURCE_HYDROGEN, RESOURCE_OXYGEN, RESOURCE_ZYNTHIUM, RESOURCE_UTRIUM, RESOURCE_KEANIUM, RESOURCE_LEMERGIUM, RESOURCE_CATALYST];
export const PRODUCT_LIST = [RESOURCE_ZYNTHIUM_HYDRIDE, RESOURCE_LEMERGIUM_OXIDE, RESOURCE_KEANIUM_OXIDE, RESOURCE_GHODIUM_ACID, RESOURCE_CATALYZED_GHODIUM_ACID,
                             RESOURCE_GHODIUM_ACID,
                             RESOURCE_GHODIUM,
                             RESOURCE_LEMERGIUM_HYDRIDE,
                             RESOURCE_CATALYZED_GHODIUM_ALKALIDE, RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE,
                             RESOURCE_CATALYZED_UTRIUM_ACID,
                             RESOURCE_CATALYZED_ZYNTHIUM_ACID,
                             RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE];
export const PRODUCTION_AMOUNT = 6000;

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
  'Lolzor', 'ncsupheo', 'NobodysNightmare', 'omnomwombat', 'Parthon',
  'Plemenit', 'poppahorse', 'Rengare', 'Subodai', 'Tantalas', 'Tijnoz', 'Totalschaden',
  'Vlahn', 'W4rl0ck', 'weaves', 'Xaq', 'Yilmas', 'Zeekner', 'Zyzyzyryxy',
  // Temporary ones
  'smitt33'];

  //_.forEach(Game.rooms['E55S47'].find(FIND_STRUCTURES, {filter: f=> f.structureType === STRUCTURE_EXTENSION}), f => f.destroy())
