import { Utils } from "lib/utils";
import { LabDistroLifetimeProcess } from "../lifetimes/labDistro";
import { InitalizationProcess } from "os/process";
import { REAGENT_LIST } from "processTypes/buildingProcesses/mineralTerminal";

export class LabManagementProcess extends InitalizationProcess
{
  metaData: LabManagementProcessMetaData
  type = 'labm';
  creep: Creep;
  //igors: Agent[];
  labs: StructureLab[];
  reagentLabs?: StructureLab[];
  productLabs?: StructureLab[];
  labProcess?: LabProcess;
  terminal?: StructureTerminal;
  storage?: StructureStorage;
  powerSpawn?: StructurePowerSpawn;
  room: Room;
  nuker?: StructureNuker;
  memory: {
      idlePosition: RoomPosition;
      command?: Command;
      labCount: number;
      reagentLabIds?: string[];
      productLabIds?: string[];
      lastCommandTick: number;
      checkProcessTick: number;
      labProcess?: LabProcess;
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

    if(this.metaData.labDistros.length === 0)
    {
      this.memory.command = undefined;
    }

    if(this.metaData.labDistros.length < 1)
    {
      let creepName = 'lab-d-' + this.metaData.roomName + '-' + Game.time;
      let spawned = Utils.spawn(this.kernel, this.metaData.roomName, 'labDistro', creepName, {});
      if(spawned)
      {
        this.metaData.labDistros.push(creepName);
      }
    }
    else if(this.metaData.labDistros.length === 1)
    {
      this.creep = Game.creeps[this.metaData.labDistros[0]];

      if(this.creep)
      {
        missionActions();
      }
    }

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

      this.reagentLabs = this.findReagentLabs();
      this.productLabs = this.findProductLabs();

      this.labProcess = this.findLabProcess();
      if(this.labProcess)
      {
        let target = this.labProcess.targetShortage.mineralType;
        if(Memory.labProcesses[target])
        {
          Memory.labProcesses[target] = 0;
        }
        Memory.labProcesses[target]++;
      }
    }
  }


  private missionActions()
  {
    let command = this.accessCommand(this.creep);
    if(!command)
    {
      if(_.sum(this.creep.carry) > 0)
      {
        console.log(this.name, "is holding resources without a command, putting them in terminal");
        if(this.creep.pos.isNearTo(this.terminal))
        {
          this.creep.transferEvertying(this.terminal);
        }
      }
    }
  }

  private findReagentLabs(): StructureLab[] | undefined
  {
    if(this.memory.reagentLabIds)
    {
      let labs = _.map(this.memory.reagentLabIds, (id: string) => {
        let lab = Game.getObjectById(id);
        if(lab)
        {
          return lab;
        }
        else
        {
          this.memory.reagentLabIds = undefined;
        }
      }) as StructureLab[];

      if(labs.length === 2)
      {
        return labs;
      }
      else
      {
        this.memory.reagentLabIds = undefined;
      }
    }

    if(Game.time % 1000 !== 2)
    {
      return; // early
    }

    let structures = this.room.find(FIND_STRUCTURES);
    let labs = _.filter(structures, (s) => {
      return (s.structureType === STRUCTURE_LAB);
    }) as StructureLab[];


    if(labs.length < 3)
    {
      return; //early
    }

    let reagentLabs = [];
    for(let lab of labs)
    {
      if(reagentLabs.length === 2)
      {
        break;
      }

      let outOfRange = false;
      for(let otherLab of labs)
      {
        if(lab.pos.inRangeTo(otherLab, 2))
        {
          continue;
        }
        outOfRange = true;
        break;
      }

      if(!outOfRange)
      {
        reagentLabs.push(lab);
      }
    }

    if(reagentLabs.length === 2)
    {
      this.memory.reagentLabIds = _.map(reagentLabs, (lab: StructureLab) => lab.id);
      this.memory.productLabIds = undefined;
      return reagentLabs;
    }
  }

  private findProductLabs(): StructureLab[] | undefined
  {
    if(this.memory.productLabIds)
    {
      let labs = _.map(this.memory.productLabIds, (id: string) => {
        let lab = Game.getObjectById(id);
        if(lab)
        {
          return lab;
        }
        else
        {
          this.memory.productLabIds = undefined;
        }
      }) as StructureLab[];

      if(labs.length > 0)
      {
        return labs;
      }
      else
      {
        return this.memory.productLabIds = undefined;
      }
    }

    let structures = this.room.find(FIND_STRUCTURES);
    let labs = _.filter(structures, (s) => {
      return (s.structureType === STRUCTURE_LAB);
    }) as StructureLab[];

    if(labs.length === 0)
    {
      return; // early
    }

    if(this.reagentLabs)
    {
      for(let reagentLab of this.reagentLabs)
      {
        labs = _.pull(labs, reagentLab);
      }
    }

    this.memory.productLabIds = _.map(labs, (lab: StructureLab) => lab.id);
    return labs;
  }

  private findLabProcess(): LabProcess | undefined
  {
    if(!this.reagentLabs)
    {
      return;
    }

    if(this.memory.labProcess)
    {
      let process = this.memory.labProcess;
      let processFinished = this.checkProcessFinished(process);
      if(processFinished)
      {
        console.log(this.name, "has finished with", process.currentShortage.mineralType);
        this.memory.labProcess = undefined;
        return this.findLabProcess();
      }

      let progress = this.checkProgress(process);
      if(!progress)
      {
        console.log(this.name, "made no progress with", process.currentShortage.mineralType);
        this.memory.labProcess = undefined;
        return this.findLabProcess();
      }

      return process;
    }
  }

  private checkProcessFinished(process: LabProcess)
  {
    for(let i = 0; i < 2; i++)
    {
      let amountInLab = this.reagentLabs![i].mineralAmount;
      let load = process.reagentLoads[Object.keys(process.reagentLoads)[i]];
      if(amountInLab === 0 && load === 0)
      {
        return true;
      }
    }

    return false;
  }

  private checkProgress(process: LabProcess)
  {
    if(Game.time % 1000 !== 2)
    {
      return true;
    }

    let loadStatus = 0;
    for(let resourcetype in process.reagentLoads)
    {
      loadStatus += process.reagentLoads[resourcetype];
    }

    if(loadStatus !== process.loadProgress)
    {
      process.loadProgress = loadStatus;
      return true;
    }
    else
    {
      return false;
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
