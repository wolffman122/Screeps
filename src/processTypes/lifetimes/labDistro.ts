import { MINERALS_RAW, PRODUCT_LIST, REAGENT_LIST, PRODUCTION_AMOUNT } from "processTypes/buildingProcesses/mineralTerminal"
import { LifetimeProcess } from "os/process";


export class LabDistroLifetimeProcess extends LifetimeProcess
{
  type = 'labdlf';
  metaData: LabDistroLifetimeProcessMetaData;


  creep: Creep;
  reagentLabs: StructureLab[];
  productLabs: StructureLab[];
  terminal: StructureTerminal;
  storage: StructureStorage;
  labProcess: LabProcess;
  room: Room;

  run()
  {
    this.creep = this.getCreep();

    if(!this.creep)
    {
      return;
    }

    if(!this.metaData.roomName)
    {
      this.metaData.roomName = this.creep.room.name;
    }

    this.room = this.creep.room;
    this.terminal = this.room.terminal;
    this.storage = this.room.storage;

    this.reagentLabs = this.findReagentLabs();
    this.log('Product labs');
    this.productLabs = this.findProductLabs();

    this.log('Lab Management');
    console.log("Reagent Labs", this.reagentLabs.length);
    console.log("Product Labs", this.productLabs.length);

    this.labProcess = this.findLabProcess();

    if(this.labProcess)
    {
      console.log("Lab Process Current Shortage", this.labProcess.currentShortage.mineralType, this.labProcess.currentShortage.amount,
                  "load progress", this.labProcess.loadProgress,
                  "reagentLoads", this.labProcess.reagentLoads,
                  "target shortage", this.labProcess.targetShortage.mineralType, this.labProcess.targetShortage.amount);
    }
    this.actions();

    if(this.labProcess)
    {
      this.doSynthesis();
    }

    this.checkBoostRequests();
  }

  private findReagentLabs(): StructureLab[]
  {
    if(this.metaData.reagentLabIds)
    {
      let labs = _.map(this.metaData.reagentLabIds, (id: string) => {
        let lab = Game.getObjectById(id);

        if(lab)
        {
          return lab;
        }
        else
        {
          this.metaData.reagentLabIds = undefined;
        }
      }) as StructureLab[];

      if(labs.length == 2)
      {
        return labs;
      }
      else
      {
        this.metaData.reagentLabIds = undefined;
      }
    }

    if(this.roomData().labs.length < 3)
    {
      this.log('Not enough labs failed');
      return; // early
    }

    let reagentLabs = [];
    for(let lab of this.roomData().labs)
    {
      if(reagentLabs.length === 2)
      {
        break;
      }
      let outOfRange = false;
      for(let otherLab of this.roomData().labs)
      {
        if(lab.pos.inRangeTo(otherLab, 2))
          continue;

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
      this.metaData.reagentLabIds = _.map(reagentLabs, (lab: StructureLab) => lab.id);
      this.metaData.productLabIds = undefined;
      return reagentLabs;
    }
  }

  private findProductLabs(): StructureLab[]
  {
    if(this.metaData.productLabIds)
    {
      let labs = _.map(this.metaData.productLabIds, (id: string) => {
        let lab = Game.getObjectById(id);
        if(lab)
        {
          return lab;
        }
        else
        {
          this.metaData.productLabIds = undefined;
        }
      }) as StructureLab[];

      if(labs.length > 0)
      {
        return labs;
      }
      else
      {
        this.metaData.productLabIds = undefined;
      }
    }

    let labs = this.roomData().labs;

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

    this.metaData.productLabIds = _.map(labs, (lab: StructureLab) => lab.id);
    return labs;
  }

  private findLabProcess(): LabProcess
  {
    if(!this.reagentLabs)
      return;

    if(this.metaData.labProcess)
    {
      let process = this.metaData.labProcess;
      let processFinished = this.checkProcessFinished(process);
      if(processFinished)
      {
        console.log("Reaction process has finished with", process.currentShortage.mineralType);
        this.metaData.labProcess = undefined;
        return this.findLabProcess();
      }
      let progress = this.checkProgress(process);
      if(!progress)
      {
        console.log(this.name, "made no progress with", process.currentShortage.mineralType);
        this.metaData.labProcess = undefined;
        return this.findLabProcess();
      }
      return process;
    }

    // avoid checking for new process every tick
    if(!this.metaData.checkProcessTick)
    {
      this.metaData.checkProcessTick = Game.time - 100;
    }

    if(Game.time < this.metaData.checkProcessTick + 100)
    {
      return; // early
    }

    this.metaData.labProcess = this.findNewProcess();
  }

  private checkProcessFinished(process: LabProcess)
  {
    for(let i = 0; i < 2; i++)
    {
      let amountInLab = this.reagentLabs[i].mineralAmount;
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

    for(let resourceType in process.reagentLoads)
    {
      loadStatus += process.reagentLoads[resourceType];
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

  private findNewProcess(): LabProcess
  {
    let store = this.gatherInventory()

    for(let compound of PRODUCT_LIST)
    {
      if(store[compound] >= PRODUCTION_AMOUNT)
        continue;

      return this.generateProcess( {mineralType: compound, amount: PRODUCTION_AMOUNT + this.creep.carryCapacity - (this.terminal.store[compound] || 0) });
    }
  }

  private gatherInventory(): {[key: string]: number}
  {
    let inventory: {[key: string]: number} = {};
    for(let mineralType in this.terminal.store)
    {
      if(!this.terminal.store.hasOwnProperty(mineralType))
        continue;

      if(inventory[mineralType] === undefined)
        inventory[mineralType] = 0;

      inventory[mineralType] += this.terminal.store[mineralType];
    }

    for(let lab of this.productLabs)
    {
      if(lab.mineralAmount > 0)
      {
        if(inventory[lab.mineralType] === undefined)
          inventory[lab.mineralType] = 0;

        inventory[lab.mineralType] += lab.mineralAmount;
      }
    }

    return inventory;
  }

  private generateProcess(targetShortage: Shortage): LabProcess
  {
    let currentShortage = this.recursiveShortageCheck(targetShortage, true);
    if(currentShortage === undefined)
    {
      console.log("Reaction lab error finding current shortage in", this.name);
      return;
    }

    let reagentLoads = {};
    for(let mineralType of REAGENT_LIST[currentShortage.mineralType])
    {
      reagentLoads[mineralType] = currentShortage.amount;
    }

    let loadProgress = currentShortage.amount * 2;

    return {
      targetShortage: targetShortage,
      currentShortage: currentShortage,
      reagentLoads: reagentLoads,
      loadProgress: loadProgress
    };
  }

  private recursiveShortageCheck(shortage: Shortage, fullAmount = false): Shortage
  {
    // gather amounts of compounds in terminal and labs
    let store = this.gatherInventory();

    if(store[shortage.mineralType] === undefined)
    {
      store[shortage.mineralType] = 0;
    }

    let amountNeeded = shortage.amount - Math.floor(store[shortage.mineralType] / 10) * 10;
    if(fullAmount)
    {
      amountNeeded = shortage.amount;
    }
    if(amountNeeded > 0)
    {
      // remove raw minerals form list, no need to make those
      let reagents = _.filter(REAGENT_LIST[shortage.mineralType], (mineralType: string) => !_.include(MINERALS_RAW, mineralType));
      let shortageFound;
      for(let reagent of reagents)
      {
        shortageFound = this.recursiveShortageCheck({mineralType: reagent, amount: amountNeeded});
        if(shortageFound)
        {
          break;
        }
      }

      if(shortageFound)
      {
        return shortageFound;
      }
      else
      {
        return {mineralType: shortage.mineralType, amount: amountNeeded };
      }
    }
  }

  private actions()
  {
    let command = this.accessCommand();
    if(!command)
    {
      let flag = Game.flags['pattern-'+this.creep.room.name];
      if(flag)
      {
        if (!this.creep.pos.inRangeTo(flag, 1)) {
            this.creep.travelTo(flag);
        }
      }
    }
    else
    {

      this.log('Action 1')
      if(_.sum(this.creep.carry) === 0)
      {
        let origin = <Structure>Game.getObjectById(command.origin);
        this.log('Action 2')
        if(this.creep.pos.isNearTo(origin))
        {
          if(origin instanceof StructureTerminal)
          {
            this.log('Action 3')
            if(!origin.store[command.resourceType])
            {
              console.log("Lab Creep can't find that resource in terminal", this.name);
              this.metaData.command = undefined;
            }
          }
          this.creep.withdraw(origin, command.resourceType, command.amount);
          let destination = <Structure>Game.getObjectById(command.destination);

          if(!this.creep.pos.isNearTo(destination))
          {
            this.log('Action 4')
            this.creep.travelTo(destination);
          }
        }
        else
        {
          this.log('Action 5')
          this.creep.travelTo(origin);
        }
        return; // early
      }

      this.log('Action 6')
      let destination = <Structure>Game.getObjectById(command.destination);
      if(this.creep.pos.isNearTo(destination))
      {
        let outcome = this.creep.transfer(destination, command.resourceType, command.amount);
        if(outcome === OK && command.reduceLoad && this.labProcess)
        {
          this.labProcess.reagentLoads[command.resourceType] -= command.amount;
        }
        this.metaData.command = undefined;
      }
      else
      {
        this.creep.travelTo(destination);
      }
    }
  }

  private accessCommand() : Command
  {
    if(!this.metaData.command && this.creep.ticksToLive < 40)
    {
      this.creep.suicide();
      this.completed = true;
      return;
    }

    if(!this.metaData.lastCommandTick)
    {
      this.metaData.lastCommandTick = Game.time - 10;
    }

    if(!this.metaData.command && Game.time > this.metaData.lastCommandTick + 10)
    {
      if(_.sum(this.creep.carry) === 0)
      {
        this.metaData.command = this.findCommand();
      }
      else
      {
        console.log("Lab Distro can't take a new command in:", this.name, "because it is holding something");
      }
      if(!this.metaData.command)
      {
        this.metaData.lastCommandTick = Game.time;
      }
    }
    return this.metaData.command;
  }

  private findCommand(): Command
  {
    let command = this.checkPullFlags()
    if(command)
    {
      return command;
    }

    command = this.checkReagentLabs();
    if(command)
    {
      return command;
    }

    command = this.checkProductLabs();
    if(command)
    {
      return command;
    }

    if(this.roomData().nuker.ghodium < this.roomData().nuker.ghodiumCapacity)
    {
      if(this.terminal.store[RESOURCE_GHODIUM] > 0)
      {
        let amount = Math.min(this.roomData().nuker.ghodiumCapacity - this.roomData().nuker.ghodium, this.creep.carryCapacity);
        if(amount > 0)
        {
          return { origin: this.terminal.id, destination: this.roomData().nuker.id, resourceType: RESOURCE_GHODIUM, amount: amount };
        }
      }
    }
  }

  private checkReagentLabs(): Command
  {
    if(!this.reagentLabs || this.reagentLabs.length < 2)
    {
      return; // early
    }

    for(let i = 0; i < 2; i++)
    {
      let lab = this.reagentLabs[i];
      let mineralType = this.labProcess ? Object.keys(this.labProcess.reagentLoads)[i] : undefined;
      if(!mineralType && lab.mineralAmount > 0)
      {
        // clear labs when there is no current process
        return {origin: lab.id, destination: this.terminal.id, resourceType: lab.mineralType};
      }
      else if(mineralType && lab.mineralType && lab.mineralType !== mineralType)
      {
        return {origin: lab.id, destination: this.terminal.id, resourceType: lab.mineralType};
      }
      else if(mineralType)
      {
        let amountNeeded = Math.min(this.labProcess.reagentLoads[mineralType], this.creep.carryCapacity);
        if(amountNeeded > 0 && this.terminal.store[mineralType] >= amountNeeded && lab.mineralAmount <= LAB_MINERAL_CAPACITY - this.creep.carryCapacity)
        {
          return {origin: this.terminal.id, destination: lab.id, resourceType: mineralType, amount: amountNeeded, reduceLoad: true};
        }
      }
    }
  }

  private checkProductLabs(): Command
  {
    if(!this.productLabs)
    {
      return; //early
    }

    for(let lab of this.productLabs)
    {
      if(this.terminal.store.energy >= this.creep.carryCapacity && lab.energy < this.creep.carryCapacity)
      {
        // restore boosting energy to lab
        return { origin: this.terminal.id, destination: lab.id, resourceType: RESOURCE_ENERGY};
      }

      let flag = <Flag>lab.pos.lookFor(LOOK_FLAGS)[0];

      if(flag)
      {
        continue;
      }

      if(lab.mineralAmount > 0 && (!this.labProcess || lab.mineralType !== this.labProcess.currentShortage.mineralType))
      {
        // empty wrong mineral type or clea lab when no process
        return {origin: lab.id, destination: this.terminal.id, resourceType: lab.mineralType };
      }
      else if(this.labProcess && lab.mineralAmount >= this.creep.carryCapacity)
      {
        // store the product in terminal
        return {origin: lab.id, destination: this.terminal.id, resourceType: lab.mineralType };
      }
    }
  }

  private doSynthesis()
  {
    for(let i = 0; i < this.productLabs.length; i++)
    {
      if(Game.time % 10 !== i)
      {
        continue;
      }
      let lab = this.productLabs[i];
      if(lab.pos.lookFor(LOOK_FLAGS).length > 0)
      {
        continue;
      }
      if(!lab.mineralType || lab.mineralType === this.labProcess.currentShortage.mineralType)
      {
        lab.runReaction(this.reagentLabs[0], this.reagentLabs[1]);
      }
    }
  }

  private checkBoostRequests()
  {
    if(!this.room.memory.boostRequests)
    {
      this.room.memory.boostRequests = {};
    }

    let requests = this.room.memory.boostRequests as BoostRequests;

    for(let resourceType in requests)
    {
      let request = requests[resourceType];

      for(let id of request.requesterIds)
      {
        let creep = Game.getObjectById(id);
        if(!creep)
        {
          request.requesterIds = _.pull(request.requesterIds, id);
        }
      }

      let flag = Game.flags[request.flagName];

      if(request.requesterIds.length === 0 && flag)
      {
        console.log("Removing boost flag:", flag.name);
        flag.remove();
        requests[resourceType] = undefined;
      }

      if(request.requesterIds.length > 0 && !flag)
      {
        request.flagName = this.placePullFlag(resourceType);
      }
    }
  }

  private placePullFlag(resourceType: string)
  {
    let existingFlag = Game.flags[this.name + "-" + resourceType];
    if(existingFlag)
    {
      return existingFlag.name;
    }

    let labs = _.filter(this.productLabs, (l: StructureLab) => l.pos.lookFor(LOOK_FLAGS).length === 0);
    if(labs.length === 0)
    {
      return; // early
    }

    let closestToSpawn = this.roomData().spawns[0].pos.findClosestByRange(labs);
    if(this.productLabs.length > 1)
    {
      this.productLabs = _.pull(this.productLabs, closestToSpawn);
    }

    let outcome = closestToSpawn.pos.createFlag(this.name + "-" + resourceType);
    if(_.isString(outcome))
    {
      console.log("Placing boost flag:", outcome);
      return outcome;
    }
  }

  private checkPullFlags(): Command
  {
    if(!this.productLabs)
    {
      return;
    }

    for(let lab of this.productLabs)
    {
      if(this.terminal.store.energy >= this.creep.carryCapacity && lab.energy < this.creep.carryCapacity)
      {
        // restore boosting energy to lab
        return { origin: this.terminal.id, destination: lab.id, resourceType: RESOURCE_ENERGY };
      }

      let flag = <Flag>lab.pos.lookFor(LOOK_FLAGS)[0];
      if(!flag)
      {
        return;
      }

      let mineralType = flag.name.substring(flag.name.indexOf("-") + 1);
      if(!_.includes(PRODUCT_LIST, mineralType))
      {
        console.log("Error: invalide lab request:", flag.name);
        return; //early
      }
      if(lab.mineralType && lab.mineralType !== mineralType)
      {
        return { origin: lab.id, destination: this.terminal.id, resourceType: lab.mineralType };
      }
      else if(LAB_MINERAL_CAPACITY - lab.mineralAmount >= this.creep.carryCapacity && this.terminal.store[mineralType] >= this.creep.carryCapacity)
      {
        return { origin: this.terminal.id, destination: lab.id, resourceType: mineralType };
      }
    }
  }
}
