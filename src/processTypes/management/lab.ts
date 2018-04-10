import { Utils } from "lib/utils";
import { LabDistroLifetimeProcess } from "../lifetimes/labDistro";
import { InitalizationProcess } from "os/process";
import { REAGENT_LIST } from "processTypes/buildingProcesses/mineralTerminal";

export class LabManagementProcess extends InitalizationProcess
{
  metaData: LabManagementProcessMetaData
  type = 'labm';
  //igors: Agent[];
  labs: StructureLab[];
  reagentLabs: StructureLab[];
  productLabs: StructureLab[];
  labProcess: LabProcess;
  terminal?: StructureTerminal;
  storage?: StructureStorage;
  powerSpawn?: StructurePowerSpawn;
  room: Room;
  nuker?: StructureNuker;
  memory: {
      idlePosition: RoomPosition;
      //command: IgorCommand;
      labCount: number;
      reagentLabIds: string[];
      productLabIds: string[];
      lastCommandTick: number;
      checkProcessTick: number;
      labProcess: LabProcess;
  };

  ensureMetaData()
  {
    if(!this.metaData.labDistros)
    {
      this.metaData.labDistros = [];
    }
  }

  run()
  {
    this.ensureMetaData();

    this.metaData.labDistros = Utils.clearDeadCreeps(this.metaData.labDistros);

    this.log('Lab Testing ' + this.metaData.labDistros.length);



    /*Object.keys(COMPOUND_LIST).forEach(key => {
        console.log('found property', COMPOUND_LIST[key][0]);
    })*/

  }

  initialization()
  {
    this.room = Game.rooms[this.metaData.roomName];
    if(this.room)
    {
      this.labs = this.roomData().labs;
      this.terminal = this.room.terminal;
      this.storage = this.room.storage;
      this.nuker = this.roomData().nuker;

      /*this.reagentLabs = this.findReagentLabs();
      this.productLabs = this.findProductLabs();

      this.labProcess = this.findLabProcess();

      if(this.labProcess)
      {
        let target = this.labProcess.targetShortage.mineralType;
        if(!Game.memory)
      }*/
    }
  }
}

const COMPOUND_LIST: {[type: string]: ResourceConstant[]} =
{
  KO: ["K", "O"],
};
/*
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

*/
