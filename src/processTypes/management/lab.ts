import { Utils } from "lib/utils";
import { LabDistroLifetimeProcess } from "../lifetimes/labDistro";
import { Process } from "os/process";
import { REAGENT_LIST, PRODUCT_LIST, PRODUCTION_AMOUNT, MINERALS_RAW, PRODUCTION_STORAGE_AMOUNT } from "processTypes/buildingProcesses/mineralTerminal";
import { LoDashImplicitNumberArrayWrapper } from "lodash";

export class LabManagementProcess extends Process
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
  processFlag?: Flag;
  logName: string;
  logOn: boolean;

  ensureMetaData()
  {
    if(!this.metaData.labDistros)
    {
      this.metaData.labDistros = [];
    }

    if(this.metaData.processFlag)
    {
      this.processFlag = Game.flags[this.metaData.processFlag];
    }
  }

  run()
  {
  if(this.metaData.shutdownLabs)
    return;

  if(Game.cpu.bucket < 7000)
      return;
    this.logOn = false;
    this.logName = "labm-E37S46";

    this.room = Game.rooms[this.metaData.roomName];
    if(this.room.memory.shutdown)
    {
      this.completed = true;
      return;
    }

    if(this.name === this.logName && this.logOn)
    console.log(this.name, 'Running')
    this.ensureMetaData();

    if(this.room)
    {
      this.labs = this.roomData().labs;
      this.terminal = this.room.terminal;
      this.storage = this.room.storage;
      this.nuker = this.roomData().nuker;
      this.powerSpawn = this.roomData().powerSpawn;

      if(this.name === this.logName && this.logOn)
        console.log(this.name, 'Running', 1)

      if(Game.time % 1000 === 2)
      {
        let totalLabs = this.metaData.productLabIds.length + this.metaData.reagentLabIds.length;
        if(totalLabs !== this.roomData().labs.length)
        {
          this.reagentLabs = undefined;
          this.productLabs = undefined;
          this.metaData.reagentLabIds = undefined;
          this.metaData.productLabIds = undefined;
        }
      }

      if(!this.productLabs || !this.reagentLabs)
      {
        this.reagentLabs = this.findReagentLabs();
        this.productLabs = this.findProductLabs();
      }

      this.labProcess = this.findLabProcess();
      if(this.labProcess)
      {
        let target = this.labProcess.targetShortage.mineralType;
        if(!this.kernel.data.labProcesses[target])
          this.kernel.data.labProcesses[target] = 0;

        this.kernel.data.labProcesses[target]++;
      }

      this.metaData.labDistros = Utils.clearDeadCreeps(this.metaData.labDistros);
      if(this.metaData.labDistros.length === 0)
      {
        if(this.metaData)
        {
          this.metaData.command == undefined;
        }
      }

      if(this.metaData.labDistros.length < 1 && (this.labProcess || Object.keys(this.room.memory.boostRequests).length))
      {
        this.metaData.command = undefined;
        let creepName = 'lab-d-' + this.metaData.roomName + '-' + Game.time;
        let spawned = Utils.spawn(this.kernel, this.metaData.roomName, 'labDistro', creepName, {});
        if(spawned)
        {
          this.metaData.labDistros.push(creepName);
        }
      }
      else if(this.metaData.labDistros.length > 0)
      {
        this.creep = Game.creeps[this.metaData.labDistros[0]];

        if(this.creep)
        {
          if(this.creep.room.name !== this.metaData.roomName)
          {
            this.creep.travelTo(new RoomPosition(25, 25, this.metaData.roomName));
            return;
          }

          this.missionActions();
        }
      }

      if(this.labProcess)
      {
        this.doSynthesis();
      }

      this.checkBoostRequests();
    }
  }

  private missionActions()
  {
    let command = this.accessCommand();


    //////////// Could not find a command do some other stuff. ///////////////////////
    if(!command)
    {

      //////////// Empty creep ///////////////////////
      if(this.creep.store.getUsedCapacity() > 0)
      {
        this.creep.say('😴🤖');
        //console.log(this.name, "is holding resources without a command, putting them in terminal");
        if(this.creep.pos.isNearTo(this.terminal!))
        {
          this.creep.transferEverything(this.terminal!);
        }
        else
        {
          this.creep.say('🏦1');
          this.creep.travelTo(this.terminal!);
        }
        return;
      }

      const generalContainer = this.roomData().generalContainers[0];
      if(generalContainer && _.sum(generalContainer.store) > 0)
      {
        if(this.creep.pos.isNearTo(generalContainer) && _.sum(this.creep.carry) < this.creep.carryCapacity)
          this.creep.withdrawEverything(generalContainer);
        else
          this.creep.travelTo(generalContainer);

        return;
      }

      this.creep.say('😴');
      this.creep.idleOffRoad(this.reagentLabs![0], true);
      return;
    }

    // if(this.name === this.logName && this.logOn)
    //   console.log(this.name, 1, command.origin, command.resourceType, command.destination, command.amount);

    if(this.name === this.logName && this.logOn)
      console.log(this.name, 2)
    ////////////// Do the command actions ///////////////////////
    let strSay: string;
    if(_.sum(this.creep.carry) === 0)
    {
      if(this.name === this.logName && this.logOn)
      console.log(this.name, 3)
      if(!command.origin)
      {
        if(this.name === this.logName && this.logOn)
      console.log(this.name, 4, 'command undefined');
        command = undefined;
      }

      if(this.name === this.logName && this.logOn)
      console.log(this.name, 5)
      let origin = Game.getObjectById<Structure>(command.origin);
      if(this.creep.pos.isNearTo(origin!))
      {
        if(origin instanceof StructureTerminal)
        {
          strSay = '🤖';
          if(!origin.store[command.resourceType])
          {
            this.metaData.command = undefined;
          }
        }
        else if(origin instanceof StructureLab)
          strSay = '🧺';

        if(this.creep.name === 'lab-d-E35S51-25976505')
          console.log(this.name, 'Annoying problem', command.amount, command.destination, command.origin, command.reduceLoad, command.resourceType)
        //console.log(this.name, 1, this.creep.name, command.resourceType);
        let retValue = this.creep.withdraw(origin!, command.resourceType, command.amount);

        if(retValue === ERR_NOT_ENOUGH_RESOURCES || retValue === ERR_INVALID_ARGS)
        {
          this.metaData.command = undefined;
        }
        let destination = Game.getObjectById<Structure>(command.destination);
        if(!this.creep.pos.isNearTo(destination!))
        {
          strSay = '🏦*';
          this.creep.say(strSay);
          this.creep.travelTo(destination!);
        }
      }
      else
      {
        this.creep.say('3');
        this.creep.travelTo(origin!);
      }
      return; // early
    }

    let destination = Game.getObjectById<Structure>(command.destination);
    if(this.creep.pos.isNearTo(destination!))
    {
      this.creep.say(strSay);
      let outcome = this.creep.transfer(destination!, command.resourceType!, command.amount);
      if(outcome === OK && command.reduceLoad && this.labProcess)
      {
        this.labProcess.reagentLoads[command.resourceType] -= command.amount!;
      }

      this.metaData.command = undefined;
    }
    else
    {
      strSay += '4';
      this.creep.say(strSay);
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

    if(this.name === this.logName && this.logOn)
      console.log(this.name, 'FindCommand', 1, this.labProcess)

    let command = this.checkPullFlags();

    if(command)
      return command;

    if(this.name === this.logName && this.logOn)
      console.log(this.name, 'FindCommand', 2)

    command = this.checkReagentLabs();
    if(command)
      return command;

    if(this.name === this.logName && this.logOn)
      console.log(this.name, 'FindCommand', 3)

    command = this.checkProductLabs();
    if(this.name === this.logName && this.logOn)
      console.log(this.name, 'FindCommand', 3, command)

    if(command) return command;
    if(this.name === this.logName && this.logOn)
      console.log(this.name, 'FindCommand', 4)


    // Load the towers
    const towers = this.roomData().towers;
    if(towers.length)
    {
      const tower = _.min(towers, t => (t.store[RESOURCE_ENERGY] ?? 0));
      if((tower.store[RESOURCE_ENERGY] ?? 0) < tower.energyCapacity * .5)
      {
        if((this.terminal.store[RESOURCE_ENERGY] ?? 0) >= this.creep.store.getCapacity())
        {
          let command: Command = {origin: this.terminal.id, destination: tower.id, resourceType: RESOURCE_ENERGY};
          return command;
        }
        else if((this.storage.store[RESOURCE_ENERGY] ?? 0) >= this.creep.store.getCapacity())
        {
          let command: Command = {origin: this.storage.id, destination: tower.id, resourceType: RESOURCE_ENERGY};
          return command;
        }
      }
    }

    if(this.name === this.logName && this.logOn)
      console.log(this.name, 'FindCommand', 5)

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

    if(this.name === this.logName && this.logOn)
      console.log(this.name, 'FindCommand', 6)

    if((this.powerSpawn?.store[RESOURCE_POWER] ?? 0)  < 20)
    {
      if((this.terminal?.store[RESOURCE_POWER] ?? 0) >= 100)
      {
        const amount = this.powerSpawn.store.getFreeCapacity(RESOURCE_POWER);
        let command: Command = {origin: this.terminal.id, destination: this.powerSpawn.id, resourceType: RESOURCE_POWER, amount: amount};
        return command;
      }
      else if((this.storage?.store[RESOURCE_POWER] ?? 0) >= 100)
      {
        const amount = this.powerSpawn.store.getFreeCapacity(RESOURCE_POWER);
        let command: Command = {origin: this.storage.id, destination: this.powerSpawn.id, resourceType: RESOURCE_POWER, amount: amount};
        return command;
      }
    }

    if(this.name === this.logName && this.logOn)
      console.log(this.name, 'FindCommand', 7)

    if((this.powerSpawn?.store[RESOURCE_ENERGY] ?? 0)  < 4000)
    {
      if((this.terminal?.store[RESOURCE_ENERGY] ?? 0) >= 100)
      {
        let command: Command = {origin: this.terminal.id, destination: this.powerSpawn.id, resourceType: RESOURCE_ENERGY};
        return command;
      }
      else if((this.storage?.store[RESOURCE_POWER] ?? 0) >= 100)
      {
        let command: Command = {origin: this.storage.id, destination: this.powerSpawn.id, resourceType: RESOURCE_ENERGY};
        return command;
      }
    }

    if(this.name === this.logName && this.logOn)
      console.log(this.name, 'FindCommand', 8)

    // Load the spawns
    const spawns = this.roomData().spawns;
    if(spawns.length)
    {
      const spawn = _.min(spawns, s => (s.store[RESOURCE_ENERGY] ?? 0));
      if((spawn.store[RESOURCE_ENERGY] ?? 0) === 0)
      {
        const command: Command = {origin: this.terminal.id, destination: spawn.id, resourceType: RESOURCE_ENERGY};
        return command;
      }
    }

    if(this.name === this.logName && this.logOn)
      console.log(this.name, 'FindCommand', 8)

    const enemies = this.creep.room.find(FIND_HOSTILE_CREEPS);
    if(!enemies.length)
    {
      const flag = Game.flags['Center-'+this.metaData.roomName];
      const tombstones = flag.pos.findInRange(FIND_TOMBSTONES, 5, {filter: t => t.store.getUsedCapacity() > 0});
      if(tombstones.length)
      {
        const tombstone = tombstones[0];
        const res = Object.keys(tombstone.store)[0] as ResourceConstant;
        let command: Command = {origin: tombstone.id, destination: this.storage.id, resourceType: res};
        return command;
      }

    }

    if(this.name === this.logName && this.logOn)
      console.log(this.name, 'FindCommand', 5)
    return;
  }

  private accessCommand(): Command|undefined
  {
    if(this.name === this.logName && this.logOn)
    {
      console.log(this.name, 'AccessCommand', 1)
      //if(this.metaData.command && this.metaData.command.origin === undefined)
        //this.metaData.command.origin = '5d96be2db5fc2a000165d044';

    }

    // Suicide
    if(!this.metaData.command && this.creep.ticksToLive! < 40)
    {
      this.creep.say('☠');
      this.creep.suicide();
      return;
    }

    // Delay
    if(!this.metaData.lastCommandTick)
    {
      this.metaData.lastCommandTick = Game.time - 10;
    }

    if(this.name === this.logName && this.logOn)
    {
        console.log(this.name, 'AccessCommand', 1.1, Game.time, this.metaData.lastCommandTick + 10)

    }

    if(!this.metaData.command && Game.time > this.metaData.lastCommandTick + 10)
    {

      if(_.sum(this.creep.carry) === 0)
      {
        if(this.name === this.logName && this.logOn)
          console.log(this.name, 'AccessCommand', 2)
        this.metaData.command = this.findCommand();
      }
      else
      {
        console.log("Creep: can't take new command in:", this.name, "because I'm holding something");
      }

      if(!this.metaData.command)
      {
        this.metaData.lastCommandTick = Game.time;
      }
    }
    else
    {
      if(this.name === this.logName && this.logOn)
        console.log(this.name, 'AccessCommand', 3)

      if(this.metaData.command)
      {
        if(this.name === this.logName && this.logOn)
        {
          console.log(this.name, 'AccessCommand', 4, this.metaData.command.destination)
        }
        let lab = Game.getObjectById(this.metaData.command.destination) as StructureLab;
        if(lab && !lab.isActive())
          this.metaData.command = undefined;
      }

      if(this.name === this.logName && this.logOn)
        console.log(this.name, 'AccessCommand', 5)
    }

    if(this.name === this.logName && this.logOn)
        console.log(this.name, 'AccessCommand', 6, this.metaData.command)

    return this.metaData.command;
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
      if(this.name === this.logName && this.logOn)
        console.log(this.name, 'checkReagentLabs', 1, mineralType, lab.mineralType, lab.mineralAmount)
      if(!mineralType && lab.mineralAmount > 0)
      {
        if(this.name === this.logName && this.logOn)
        console.log(this.name, 'checkReagentLabs', 2)
        // clear labs when there is no current process
        let command: Command = {origin: lab.id, destination: this.terminal!.id, resourceType: lab.mineralType!};
        return command;
      }
      else if(mineralType && lab.mineralType && lab.mineralType !== mineralType)
      {
        if(this.name === this.logName && this.logOn)
        console.log(this.name, 'checkReagentLabs', 3)
        let command: Command = {origin: lab.id, destination: this.terminal!.id, resourceType: lab.mineralType};
        return command;
      }
      else if(mineralType)
      {

        let amountNeeded = Math.min(this.labProcess!.reagentLoads[mineralType], LABDISTROCAPACITY);

        if(this.name === this.logName && this.logOn)
        console.log(this.name, 'checkReagentLabs', 4, amountNeeded)


        if(amountNeeded > 0 && this.terminal!.store[mineralType]! >= amountNeeded
          && lab.mineralAmount <= lab.mineralCapacity - LABDISTROCAPACITY)
        {
          amountNeeded = Math.max(amountNeeded, 5);
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

    const labNeeds: ResourceConstant[] = []
    if(this.labProcess)
    {
      for(let i = 0; i < 2; i++)
      {
        const mineralType = (this.labProcess ? Object.keys(this.labProcess.reagentLoads)[i] : undefined) as ResourceConstant;
        labNeeds.push(mineralType);
      }
    }

    for (let lab of this.productLabs) {

        if (this.terminal!.store.energy >= LABDISTROCAPACITY && lab.energy < LABDISTROCAPACITY)
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
        else if (this.labProcess && lab.mineralAmount >= LABDISTROCAPACITY) {
            // store product in terminal
            return { origin: lab.id, destination: this.terminal!.id, resourceType: lab.mineralType! };
        }
        else
        {
          if(_.includes(labNeeds, lab.mineralType) && this.name === 'labm-E37S46')
          {
            const index = labNeeds.indexOf(lab.mineralType);
            const pLab = this.productLabs[index];
            if(pLab.mineralType === lab.mineralType
              && pLab.store.getFreeCapacity() > lab.mineralAmount)
              return {origin: lab.id, destination: pLab.id, resourceType: lab.mineralType };
          }
        }
    }
    return;
  }

  private findReagentLabs(): StructureLab[] | undefined
  {
    if(this.name === this.logName && this.logOn)
      console.log(this.name, 'findReagentLabs', 1, this.metaData.reagentLabIds);

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
          return;
        }
      }) as StructureLab[];

      if(labs.length === 2)
      {
        return labs;
      }
      else
      {
        this.metaData.reagentLabIds = undefined;
      }
    }

    if(Game.time % 1000 !== 3)
    {
      return; // early
    }

    if(this.name === this.logName && this.logOn)
      console.log(this.name, 'findReagentLabs', 2)

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
      this.metaData.reagentLabIds = _.map(reagentLabs, (lab: StructureLab) => lab.id);
      this.metaData.productLabIds = undefined;
      return reagentLabs;
    }
    return;
  }

  private findProductLabs(): StructureLab[] | undefined
  {
    if(this.name === this.logName && this.logOn)
      console.log(this.name, 'findProductLabs', 1, this.metaData.productLabIds);

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
          return;
        }

      }) as StructureLab[];

      if(labs.length > 0)
      {
        return labs;
      }
      else
      {
        return this.metaData.productLabIds = undefined;
      }
    }

    if(this.name === this.logName && this.logOn)
      console.log(this.name, 'findProductLabs', 2)

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

    this.metaData.productLabIds = _.map(labs, (lab: StructureLab) => lab.id);
    return labs;
  }

  private doSynthesis()
  {
    for(let i = 0; i < this.productLabs!.length; i++)
    {
      // So that they don't all activate on the same tick and make bucket sad
      if(Game.time % 10 !== i)
      {
        continue;
      }
      let lab = this.productLabs![i];

      if(lab.pos.lookFor(LOOK_FLAGS).length > 0)
      {
        continue;
      }

      if(!lab.mineralType || lab.mineralType === this.labProcess!.currentShortage.mineralType)
      {
        let outcome = lab.runReaction(this.reagentLabs![0], this.reagentLabs![1]);
        if(outcome === OK)
        {
          this.kernel.data.activeLabCount++;
        }
      }
    }
  }

  private findLabProcess(): LabProcess | undefined
  {
    if(!this.reagentLabs)
      return;

    if(this.metaData.labProcess)
    {
      let process = this.metaData.labProcess;

      let processFinished = this.checkProcessFinished(process);
      if(processFinished)
      {
        //Game.notify(this.name + " has finished with " + process.currentShortage.mineralType);
        //console.log(this.name, "has finished with", process.currentShortage.mineralType);
        this.metaData.labProcess = undefined;
        return this.findLabProcess();
      }


      let progress = this.checkProgress(process);
      if(!progress)
      {
          //Game.notify(this.name + " made no progress with " + process.currentShortage.mineralType);
        console.log(this.name, "made no progress with", process.currentShortage.mineralType, 1111);
 //       this.metaData.labProcess = undefined;
 //       return this.findLabProcess();
      }

      if(process)
      {
        // process labm-E37S46 failed with error TypeError: this.room.visual.resource is not a function
        const lab1 = this.reagentLabs[0];
        const lab2 = this.reagentLabs[1];
        this.room.visual.resource(process.currentShortage.mineralType, lab1.pos.x, lab1.pos.y, 0.25);
        this.room.visual.resource(process.targetShortage.mineralType, lab2.pos.x, lab2.pos.y, 0.25);
      }

      return process;
    }

    // avoid checking for a new process every tick
    if(!this.metaData.checkProcessTick)
      this.metaData.checkProcessTick = Game.time - 100;

    if(Game.time < this.metaData.checkProcessTick+100)
      return; // early

    this.metaData.labProcess = this.findNewProcess();
    //console.log(this.name, 'Found process', this.metaData.labProcess.currentShortage.mineralType, this.metaData.labProcess.currentShortage.amount, this.metaData.labProcess.targetShortage.mineralType, this.metaData.labProcess.currentShortage.amount)
    return;
  }

  private checkProcessFinished(process: LabProcess)
  {
    for(let i = 0; i < 2; i++)
    {
      let amountInLab = this.reagentLabs![i].mineralAmount;
      let load = process.reagentLoads[Object.keys(process.reagentLoads)[i]];
      if(amountInLab < 5 && load <= 0)
      {
        return true;
      }
    }

    return false;
  }

  private checkProgress(process: LabProcess)
  {
    if(Game.time % 1000 !== 3)
    {
      return true;
    }

    //console.log(this.name, Object.keys(process.reagentLoads).length, 22222);
    let loadStatus = 0;
    for(let resourcetype in process.reagentLoads)
    {
      //console.log(this.name, resourcetype, 111111)
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


  private findNewProcess(): LabProcess|undefined
  {
    let  store = this.gatherTerminalInventory();

    for (let compound of PRODUCT_LIST)
    {
      if(this.storage.store[compound] >= PRODUCTION_STORAGE_AMOUNT)
        continue;

      if(store[compound] >= PRODUCTION_AMOUNT)
      {
        continue;
      }



      return this.generateProcess({mineralType: compound,
        amount: PRODUCTION_AMOUNT + LABDISTROCAPACITY - (store[compound] || 0) });
    }

    store = this.gatherStorageInventory();

    for (let compound of PRODUCT_LIST)
    {
      if(store[compound] >= PRODUCTION_STORAGE_AMOUNT)
        continue;

      return this.generateProcess({mineralType: compound,
        amount: PRODUCTION_STORAGE_AMOUNT + LABDISTROCAPACITY - (store[compound] || 0) });
    }

    return;
  }

  private recursiveShortageCheck(shortage: Shortage, fullAmount = false, terminalSource = true): Shortage|undefined
  {
    // gather amounts of compounds in terminal and labs
    let store = this.gatherTerminalInventory();
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
      // remove raw minerals from list, no need to make those
      let reagents = _.filter(REAGENT_LIST[shortage.mineralType], (mineralType: ResourceConstant) => !_.include(MINERALS_RAW, mineralType));
      let shortageFound;
      for(let reagent of reagents)
      {
        shortageFound = this.recursiveShortageCheck({mineralType: reagent, amount: amountNeeded});
        if(shortageFound)
          break;
      }

      if(shortageFound)
        return shortageFound;
      else
        return { mineralType: shortage.mineralType, amount: amountNeeded };
    }
    return;
  }

  private gatherTerminalInventory(): {[key: string]: number}
  {
    let inventory: {[key: string]: number} = {};
    for(let mineralType in this.terminal!.store)
    {
      if(!this.terminal!.store.hasOwnProperty(mineralType)) continue;
      if(inventory[mineralType] === undefined)
      {
        inventory[mineralType] = 0;
      }

      inventory[mineralType] += this.terminal!.store[mineralType];
    }

    for(let lab of this.productLabs!)
    {
      if(lab.mineralAmount > 0)
      {
        if(inventory[lab.mineralType!] === undefined)
        {
          inventory[lab.mineralType!] = 0;
        }

        inventory[lab.mineralType!] += lab.mineralAmount;
      }
    }

    return inventory;
  }

  private gatherStorageInventory(): {[key: string]: number}
  {
    let inventory: {[key: string]: number} = {};
    for(let mineralType in this.storage?.store)
    {
      if(!this.storage?.store.hasOwnProperty(mineralType)) continue;
      if(inventory[mineralType] === undefined)
      {
        inventory[mineralType] = 0;
      }

      inventory[mineralType] += this.storage?.store[mineralType];
    }

    for(let lab of this.productLabs!)
    {
      if(lab.mineralAmount > 0)
      {
        if(inventory[lab.mineralType!] === undefined)
        {
          inventory[lab.mineralType!] = 0;
        }

        inventory[lab.mineralType!] += lab.mineralAmount;
      }
    }

    return inventory;
  }

  private generateProcess(targetShortage: Shortage, terminalSource = true): LabProcess|undefined
  {
    let currentShortage = this.recursiveShortageCheck(targetShortage, true, terminalSource);

    if(currentShortage === undefined)
    {
      console.log(this.name, "Lab Distro: error finding current shortage");
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

  private checkBoostRequests()
  {
    if(this.name === this.logName && this.logOn)
        console.log(this.name, 'BoostRequests', 1)
    if(!this.room.memory.boostRequests)
    {
      if(this.name === this.logName && this.logOn)
        console.log(this.name, 'BoostRequests', 2)
      this.room.memory.boostRequests = {};
    }

    let requests = this.room.memory.boostRequests as BoostRequests;
    if(this.name === this.logName && this.logOn)
        console.log(this.name, 'BoostRequests', 3)
    for(let resourceType in requests)
    {
      let request = requests[resourceType];

      if(request)
      {
        for(let id of request.requesterIds)
        {
          if(this.name === this.logName && this.logOn)
            console.log(this.name, 'BoostRequests', 4, id)
          let creep = Game.getObjectById(id);
          if(!creep)
          {
            //console.log(this.name, 'Pulling id', id);
            request.requesterIds = _.pull(request.requesterIds, id);
          }
        }

        if(this.name === this.logName && this.logOn)
            console.log(this.name, 'BoostRequests', 5)

        let flag = Game.flags[request.flagName!];

        if(request.requesterIds.length === 0 && flag)
        {
          console.log("IGOR: removing boost flag:", flag.name);
          flag.remove();
          requests[resourceType] = {flagName: undefined, requesterIds: []};
        }

        /*if(this.name == 'labm-E55S48')
          {
            console.log(this.name, 'requesters', request.requesterIds.length, flag);

          }*/
        if(request.requesterIds.length > 0 && !flag)
        {
          //console.log(this.name, 'Placing pull flag');
          request.flagName = this.placePullFlag(resourceType);
        }

        if(this.name === this.logName && this.logOn)
            console.log(this.name, 'BoostRequests', 6)
      }
    }
  }

  private placePullFlag(resourceType: string): any
  {
    let existingFlag = Game.flags[this.name + "_" + resourceType];
    if(existingFlag)
      return existingFlag;

    let labs = _.filter(this.productLabs!, (l: StructureLab) => l.pos.lookFor(LOOK_FLAGS).length === 0);
    if(this.room.controller?.level < 8)
      labs = _.filter(this.productLabs, (l: StructureLab) => l.isActive());
    if(labs.length === 0)
      return;

    let closestToSpawn = this.roomData().spawns[0].pos.findClosestByRange(labs);
    if(this.productLabs!.length > 1)
    {
      this.productLabs = _.pull(this.productLabs!, closestToSpawn);
    }

    let outcome = closestToSpawn.pos.createFlag(this.name + "_" + resourceType);
    if(_.isString(outcome))
    {
      console.log("IGOR: placing boost flag:", outcome);
      return outcome;
    }
  }

  private checkPullFlags(): any
  {
    if(!this.productLabs)
      return;

    for(let lab of this.productLabs)
    {
      if(this.terminal!.store.energy >= CARRY_CAPACITY && lab.energy < CARRY_CAPACITY)
      {
        //restore boosting energy to lab
        return { Origin: this.terminal!.id, destination: lab.id, resourceType: RESOURCE_ENERGY };
      }

      let flag = lab.pos.lookFor(LOOK_FLAGS)[0];
      if(!flag)
        continue;

      let mineralType = flag.name.substring(flag.name.indexOf("_") + 1);
      if(!_.include(PRODUCT_LIST, mineralType))
      {
        console.log("ERROR: invalid lab request:", flag.name);
        return; // early
      }

      if(lab.mineralType && lab.mineralType !== mineralType)
      {
        // empty wrong mineral type
        return {origin: lab.id, destination: this.terminal!.id, resourceType: lab.mineralType };
      }
      else if(lab.mineralCapacity - lab.mineralAmount >= CARRY_CAPACITY && this.terminal!.store[mineralType] >= CARRY_CAPACITY)
      {
        // bring mineral to lab when amount is below carry capacity
        return { origin: this.terminal!.id, destination: lab.id, resourceType: mineralType};
      }
    }
  }
}

export const LABDISTROCAPACITY = 1000;
