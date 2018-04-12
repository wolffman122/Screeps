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
        this.missionActions();
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
    let command = this.accessCommand();
    if(!command)
    {
      if(_.sum(this.creep.carry) > 0)
      {
        console.log(this.name, "is holding resources without a command, putting them in terminal");
        if(this.creep.pos.isNearTo(this.terminal!))
        {
          this.creep.transferEverything(this.terminal!);
        }
        else
        {
          this.creep.travelTo(this.terminal!);
        }
        return;
      }

      let flag = Game.flags['pattern-' + this.creep.room];
      if(flag)
      {
        if (!this.creep.pos.inRangeTo(flag, 1))
        {
          this.creep.travelTo(flag);
        }
      }
      return;
    }

    if(_.sum(this.creep.carry) === 0)
    {
      let origin = Game.getObjectById<Structure>(command.origin);
      if(this.creep.pos.isNearTo(origin!))
      {
        if(origin instanceof StructureTerminal)
        {
          if(!origin.store[command.resourceType])
          {
            console.log("Creep: I can't find that resource in terminal, opName:", this.name);
            this.memory.command = undefined;
          }
        }

        this.creep.withdraw(origin!, command.resourceType, command.amount);
        let destination = Game.getObjectById<Structure>(command.destination);
        if(!this.creep.pos.isNearTo(destination!))
        {
          this.creep.travelTo(destination!);
        }
      }
      else
      {
        this.creep.travelTo(origin!);
      }
      return; // early
    }

    let destination = Game.getObjectById<Structure>(command.destination);
    if(this.creep.pos.isNearTo(destination!))
    {
      let outcome = this.creep.transfer(destination!, command.resourceType!, command.amount);
      if(outcome === OK && command.reduceLoad && this.labProcess)
      {
        this.labProcess.reagentLoads[command.resourceType] -= command.amount!;
      }

      this.memory.command = undefined;
    }
    else
    {
      this.creep.travelTo(destination!);
    }
  }

  private findCommand(): Command|undefined
  {
    let terminal = this.room.terminal;
    let storage = this.room.storage;
    let energyInTerminal = 0;
    let energyInStorage = 0;

    if(terminal && storage)
    {
      energyInTerminal = terminal.store.energy;
      energyInStorage = storage.store.energy;
    }


    let command = this.checkReagentLabs();
    if(command) return command;

    command = this.checkProductLabs();
    if(command) return command;

    // load nukers
    let nuker = this.roomData().nuker;
    if(nuker)
    {
      if(nuker.energy < nuker.energyCapacity && storage!.store.energy > 100000)
      {
        let command: Command = {origin: storage!.id, destination: nuker.id, resourceType: RESOURCE_ENERGY };
        return command;
      }
      else if(nuker.ghodium < nuker.ghodiumCapacity && terminal!.store[RESOURCE_GHODIUM])
      {
        let command: Command = {origin: terminal!.id, destination: nuker.id, resourceType: RESOURCE_GHODIUM};
        return command;
      }
    }
    return;
  }

  private accessCommand(): Command|undefined
  {
    if(!this.memory.command && this.creep.ticksToLive! < 40)
    {
      this.creep.suicide();
      return;
    }

    if(!this.memory.lastCommandTick)
    {
      this.memory.lastCommandTick = Game.time - 10;
    }

    if(!this.memory.command && Game.time > this.memory.lastCommandTick + 10)
    {
      if(_.sum(this.creep.carry) === 0)
      {
        this.memory.command = this.findCommand();
      }
      else
      {
        console.log("Creep: can't take new command in:", this.name, "because I'm holding something");
      }

      if(!this.memory.command)
      {
        this.memory.lastCommandTick = Game.time;
      }
    }

    return this.memory.command;
  }

  private checkReagentLabs(): Command|undefined
  {
    if(!this.reagentLabs || this.reagentLabs.length < 2)
    {
      return; //early
    }

    for(let i = 0; i < 2; i++)
    {
      let lab = this.reagentLabs[i];
      let mineralType = (this.labProcess ? Object.keys(this.labProcess.reagentLoads)[i] : undefined) as ResourceConstant;
      if(!mineralType && lab.mineralAmount > 0)
      {
        // clear labs when there is no current process
        let command: Command = {origin: lab.id, destination: this.terminal!.id, resourceType: lab.mineralType!};
        return command;
      }
      else if(mineralType && lab.mineralType && lab.mineralType !== mineralType)
      {
        let command: Command = {origin: lab.id, destination: this.terminal!.id, resourceType: lab.mineralType};
        return command;
      }
      else if(mineralType)
      {
        let amountNeeded = Math.min(this.labProcess!.reagentLoads[mineralType], this.creep.carryCapacity);
        if(amountNeeded > 0 && this.terminal!.store[mineralType]! >= amountNeeded
          && lab.mineralAmount <= lab.mineralCapacity - this.creep.carryCapacity)
        {
          // bring minerals to lab when amount drops below amount needed
          let command: Command = {origin: this.terminal!.id, destination: lab.id, resourceType: mineralType, amount: amountNeeded, reduceLoad: true};
          return command;
        }
      }
    }

    return;
  }

  private checkProductLabs(): Command|undefined
  {
    if (!this.productLabs)
    {
      return; // early
    }

    for (let lab of this.productLabs) {

        if (this.terminal!.store.energy >= this.creep.carryCapacity && lab.energy < this.creep.carryCapacity)
        {
            // restore boosting energy to lab
            return { origin: this.terminal!.id, destination: lab.id, resourceType: RESOURCE_ENERGY };
        }

        let flag = lab.pos.lookFor(LOOK_FLAGS)[0];
        if (flag) continue;

        if (lab.mineralAmount > 0 && (!this.labProcess || lab.mineralType !== this.labProcess.currentShortage.mineralType)) {
            // empty wrong mineral type or clear lab when no process
            return { origin: lab.id, destination: this.terminal!.id, resourceType: lab.mineralType! };
        }
        else if (this.labProcess && lab.mineralAmount >= this.creep.carryCapacity) {
            // store product in terminal
            return { origin: lab.id, destination: this.terminal!.id, resourceType: lab.mineralType! };
        }
    }
    return;
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
          return;
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
    return;
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
          return;
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
    return;
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
