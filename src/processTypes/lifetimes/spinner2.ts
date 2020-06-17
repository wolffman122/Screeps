import { LifetimeProcess } from "os/process";
import { KEEP_AMOUNT, MINERALS_RAW, MINERAL_KEEP_AMOUNT, PRODUCT_LIST_WITH_AMOUNTS, PRODUCTION_TERMINAL_AMOUNT, FACTORY_KEEP_AMOUNT, ENERGY_KEEP_AMOUNT, COMMODITY_TERMINAL_AMOUNT } from "processTypes/buildingProcesses/mineralTerminal";
import { PowerCreepLifetimeProcess } from "./powerCreep";

export class Spinner2LifeTimeProcess extends LifetimeProcess
{
  type = 'slf2'
  metaData: Spinner2LifeTimeProcessMetaData;
  creep: Creep
  djFlag: Flag
  link: StructureLink
  storage: StructureStorage
  terminal: StructureTerminal
  factory: StructureFactory;
  powerSpawn: StructurePowerSpawn;
  mineral: Mineral<MineralConstant>
  skMinerals: MineralConstant[] = [];
  renewSpawn: StructureSpawn;
  powerCreep: PowerCreep;
  factoryProcess: LabProcess;
  room: Room;

  run()
  {
    this.creep = this.getCreep();
    this.logName = '';
    this.logging = false;

    if(!this.creep)
    {
      return;
    }



    if(this.creep.room.memory.shutdown)
    {
      this.completed = true;
      return;
    }

    this.room = Game.rooms[this.creep.pos.roomName];
    this.djFlag = Game.flags['DJ-' + this.creep.pos.roomName];
    this.link = this.roomData().storageLink;
    this.storage = this.room.storage;
    this.terminal = this.room.terminal;
    this.factory = this.roomData().factory;
    this.mineral = this.roomData().mineral;
    this.powerSpawn = this.roomData().powerSpawn;
    this.powerCreep = Game.powerCreeps[this.creep.room.name + '-Operator'];


    if((this.powerSpawn?.store[RESOURCE_ENERGY] ?? 0) > 0
      && (this.powerSpawn?.store[RESOURCE_POWER] ?? 0) > 0)
      this.powerSpawn.processPower();

    if(!this.room.memory.barType)
      this.FindBarType(this.room);

    const yellowFlags = this.creep.room.find(FIND_FLAGS, {filter: f => f.color === COLOR_YELLOW && f.secondaryColor === COLOR_YELLOW });
    // Need to find a better way to reset the stale data
    if(yellowFlags.length)
    {
      this.CheckForSKMining(yellowFlags);
    }


    if(!this.metaData.renewSpawnId && this.creep.pos.isEqualTo(this.djFlag))
    {
      this.SetupRenewSpawn();
      this.renewSpawn = Game.getObjectById(this.metaData.renewSpawnId);
    }
    else
      this.renewSpawn = Game.getObjectById(this.metaData.renewSpawnId);


    if(!this.creep.pos.isEqualTo(this.djFlag))
    {
      this.creep.travelTo(this.djFlag)
      this.creep.say('T');
      return;
    }

    if(this.metaData.roomName === 'E35S41' || this.metaData.roomName === 'E35S51' || this.metaData.roomName === 'E56S43'
      || this.metaData.roomName === 'E58S52')
    {
      //consol.log(this.name, 'Factory Start', this.room.memory.commandIndex, this.room.memory.commands?.length, )
      // this.FactoryEmpty(RESOURCE_CONDENSATE);
      // this.room.memory.commands = undefined;
      // this.room.memory.commandIndex = 0;
      // this.room.memory.startedCommands = undefined;
      // this.room.memory.commoditiesIndex = 0;
      // this.room.memory.commoditiesToMake = undefined;

      if(!this.room.memory.commands?.length)
      {
        //consol.log(this.name, 'Time to start checking for commands');
        this.room.memory.commandIndex = 0;
        this.room.memory.commoditiesIndex = 0;
        this.room.memory.commands = this.FactoryWork();
        //consol.log(this.name, 'Time to start checking for commands', 1, this.room.memory.commands?.length)
      }
      else if(this.room.memory.commandIndex === this.room.memory.commands?.length)
      {
        for(let c of this.room.memory.commoditiesToMake)
          //consol.log(this.name, c);

        //consol.log(this.name, 'Factory Empty/Reset', 1, this.room.memory.commoditiesIndex, this.room.memory.commoditiesToMake.length, this.room.memory.commoditiesToMake[this.room.memory.commoditiesIndex])
        if(!this.factory.cooldown)
        {
          const comToMake = this.room.memory.commoditiesToMake[this.room.memory.commoditiesIndex];
          if(COMMODITIES[comToMake]?.level && this.factory.effects.filter(e => e.effect = PWR_OPERATE_FACTORY)?.length === 0)
          {
            const powerProcess = this.kernel.getProcessByName('pclf-' + this.metaData.roomName + '-Operator')
            if(powerProcess instanceof PowerCreepLifetimeProcess)
            {
              powerProcess.metaData.turnOnFactory = true;
            }

            return;
          }

          if(this.room.memory.commoditiesToMake?.length === this.room.memory.commoditiesIndex)
          {
            this.FactoryEmpty(this.room.memory.commoditiesToMake[this.room.memory.commoditiesIndex-1]);
            if(this.factory.store.getUsedCapacity() === 0)
            {
              this.room.memory.commands = undefined;
              this.room.memory.commandIndex = 0;
              this.room.memory.startedCommands = undefined;
              this.room.memory.commoditiesIndex = 0;
              this.room.memory.commoditiesToMake = undefined;
            }
            return;
          }
          else if(this.factory.produce(comToMake) === ERR_NOT_ENOUGH_RESOURCES)
          {
            //consol.log(this.name, 'Factory empty/reset', 1.2, this.room.memory.commoditiesIndex)
            if(this.room.memory.commoditiesIndex < comToMake.length)
              this.room.memory.commoditiesIndex++;
          }
        }
      }
      else if(this.room.memory.startedCommands || (!this.room.memory.startedCommands && this.creep.store.getUsedCapacity() === 0))
      {
        //consol.log(this.name, 'Factory start commands', this.room.memory.commandIndex)
        this.room.memory.startedCommands = true;
        let commandIndex = this.room.memory.commandIndex;
        let command = this.room.memory.commands[commandIndex];

        //consol.log(this.name, 'Factory start commandIndex', commandIndex, this.room.memory.commands.length, command, command.resourceType)
        //consol.log(this.name, 'Empty creep', this.creep.store.getUsedCapacity(), this.creep.store.getUsedCapacity(command.resourceType))
        // Empty creep.
        if(this.creep.store.getUsedCapacity() !== this.creep.store.getUsedCapacity(command.resourceType))
        {
          //consol.log(this.name, 'Empty creep', 1)
          this.creep.transferEverything(this.storage);
          return;
        }

        //consol.log(this.name, 'Factory', 1)
        if(this.creep.store.getUsedCapacity() === 0)
        {
          const origin = <Structure>Game.getObjectById(command.origin);
          const amount = (this.creep.store.getCapacity() > command.amount) ? command.amount : this.creep.store.getCapacity();
          this.creep.withdraw(origin, command.resourceType, amount);
          return;
        }
        else if(this.creep.store.getUsedCapacity() > 0)
        {
          const destination = <Structure>Game.getObjectById(command.destination);
          const amount = this.creep.store.getUsedCapacity();
          if(this.creep.transfer(destination, command.resourceType) === OK)
          {
            command.amount -= amount;
            if(command.amount === 0)
            {
              this.room.memory.commandIndex++;
            }
            else
              this.room.memory.commands[commandIndex] = command;
          }

          return;
        }
      }
    }

    if(this.room.memory.spinnerDump)
    {
      if(this.creep.store.getUsedCapacity() > 0)
      {
        this.creep.transferEverything(this.room.terminal);
        return;
      }

      if(this.room.terminal.store.getFreeCapacity() > this.creep.store.getCapacity())
      {
        for(let res in this.room.storage.store)
        {
          const resc = res as ResourceConstant
          if(this.creep.withdraw(this.room.storage, resc) === OK)
            break;
        }
      }

      return;
    }

    // Responsibilities
    //
    // 1. Keep Center link empty
    // 2. Maintain 75K engergy in terminal
    // 3. Maintain room mineral KEEP_AMOUNT(10k) in terminal
    // 4. Maintain SK mineral amount KEEP_AMOUNT in terminal
    // 5. Maintain 5000 minerals in terminal
    // 6. Maintain 6000 Production in terminal
    // 7. Deposit stuff, (Need to clarify more)
    // 8. Renew self

    // this.room.memory.commands = undefined;
    // this.room.memory.commandIndex = undefined;
    // this.room.memory.componentsReady = undefined;
    // this.room.memory.factoryEmpty = false;
    // // this.room.memory.commodityToMake = undefined;

    // if(this.room.memory.commandIndex === this.room.memory.commands?.length)
    //   this.room.memory.commandIndex = 0;

    let commoditiesForLevel: CommodityConstant[] = [];
    if(this.factory?.level)
    {
      if(!this.room.memory.commoditiesForLevel)
      {
        for(const c of Object.keys(COMMODITIES))
        {
            const record = COMMODITIES[c];
            if(record.level === this.factory.level)
              commoditiesForLevel.push(<CommodityConstant>c);
        }
        this.room.memory.commoditiesForLevel = commoditiesForLevel;
      }
      else
        commoditiesForLevel = this.room.memory.commoditiesForLevel;
    }

    if(this.link?.store[RESOURCE_ENERGY] > 0)
    {
      if(this.creep.store.getFreeCapacity() === 0)
      {
        if(this.storage.store.getFreeCapacity() > this.creep.store.getUsedCapacity())
          this.creep.transferEverything(this.storage);
        else
          this.creep.transferEverything(this.terminal);
      }
      else
        this.creep.withdrawEverything(this.link);

      return;
    }

    if(this.terminal?.store[RESOURCE_ENERGY] < 75000)
    {
      if(this.TransferEnergyToTerminal())
        return;
    }

    if(this.terminal?.store[RESOURCE_ENERGY] !== 75000 && this.storage.store.getFreeCapacity() > 3000)
    {
      if(this.TransferEnergyToStorage())
        return;
    }

    if(this.terminal?.store[this.mineral.mineralType] < KEEP_AMOUNT
      && (this.storage?.store[this.mineral.mineralType] ?? 0) > 10000)
    {
      if(this.TransferToTerminal(this.mineral.mineralType))
        return;
    }

    let amount = this.terminal.store[this.mineral.mineralType] - KEEP_AMOUNT
    if(amount > 0 && this.storage.store.getFreeCapacity() > 3000)
    {
      this.TransferToStorage(this.mineral.mineralType, KEEP_AMOUNT);
      return;
    }

    const bar = this.room.memory.barType
    const onecomp = Object.keys(COMMODITIES[bar].components)[0];
    const twocomp = Object.keys(COMMODITIES[bar].components)[1];
    if(this.metaData.roomName === 'E37S46')
      console.log(this.name, onecomp, twocomp, this.storage.store.getUsedCapacity(<ResourceConstant>onecomp), this.storage.store.getUsedCapacity(<ResourceConstant>twocomp));
    if((this.terminal.store[bar] ?? 0) < FACTORY_KEEP_AMOUNT
      && this.storage.store.getUsedCapacity(<ResourceConstant>onecomp) >= 10600
      && this.storage.store.getUsedCapacity(<ResourceConstant>twocomp) >= 10600)
    {
      // if(this.CheckAndTransferBars(bar))
      //   return;
    }

    if(this.room.name === 'E35S51')
    {
      if(this.skMinerals === undefined)
        this.skMinerals = [];

      this.skMinerals.push(RESOURCE_KEANIUM);
    }

    // SK Mineral transfer code.
    for(let i = 0; i < this.skMinerals.length; i++)
    {
      const skMineral = this.skMinerals[i] as MineralConstant;
      if(this.terminal?.store[skMineral] < KEEP_AMOUNT)
      {
        if(this.TransferToTerminal(skMineral))
          return;
      }

      if(this.terminal?.store[skMineral] !== KEEP_AMOUNT && this.storage?.store.getUsedCapacity(skMineral) >= this.creep.store.getCapacity())
      {
        this.TransferToStorage(skMineral, KEEP_AMOUNT);
        return;
      }
    }

    // Minerals
    for(let i = 0; i < MINERALS_RAW.length; i++)
    {
      const mineral = MINERALS_RAW[i];
      if(mineral === this.mineral.mineralType || (this.skMinerals.length && mineral === this.skMinerals[0]))
        continue;

      if(this.terminal?.store[mineral] < MINERAL_KEEP_AMOUNT)
      {
        if(this.TransferToTerminal(mineral))
          return;
        else
          continue;
      }

      if(this.terminal?.store[mineral] !== MINERAL_KEEP_AMOUNT)
      {
        this.TransferToStorage(mineral, MINERAL_KEEP_AMOUNT)
        return;
      }
    }

    // Production list
    for(let i = 0; i < PRODUCT_LIST_WITH_AMOUNTS.length; i++)
    {
      const prod = PRODUCT_LIST_WITH_AMOUNTS[i].res;
      if((this.terminal?.store[prod] ?? 0) < PRODUCTION_TERMINAL_AMOUNT)
      {
        if(this.TransferToTerminal(prod))
          return;
        else
          continue;
      }

      if(this.terminal?.store[prod] !== PRODUCTION_TERMINAL_AMOUNT)
      {
        this.TransferToStorage(prod, PRODUCTION_TERMINAL_AMOUNT);
        return;
      }
    }

    // if((this.storage.store[RESOURCE_ENERGY] ?? 0) < ENERGY_KEEP_AMOUNT && (this.factory.store[RESOURCE_ENERGY] ?? 0) > 0)
    // {
    //   if(this.creep.store.getUsedCapacity() === 0)
    //     this.creep.withdraw(this.factory, RESOURCE_ENERGY);
    //   else
    //     this.creep.transfer(this.storage, RESOURCE_ENERGY);

    //   return;
    // }

    // if((this.storage.store[RESOURCE_ENERGY] ?? 0) < ENERGY_KEEP_AMOUNT && (this.terminal.store[RESOURCE_BATTERY] ?? 0) > 0)
    // {
    //   console.log(this.name, 'MOVE BATTERIES', this.creep.store.getUsedCapacity());
    //   if(this.creep.store.getUsedCapacity() === 0)
    //     this.creep.withdraw(this.terminal, RESOURCE_BATTERY);
    //   else
    //     {
    //     const ret = this.creep.transfer(this.factory, RESOURCE_BATTERY);
    //     console.log(this.name, 'MOVE BATTERIES result', ret);
    //     }

    //     if((this.factory.store[RESOURCE_BATTERY] ?? 0) > 0 && this.factory.cooldown === 0)
    //       this.factory.produce(RESOURCE_ENERGY);
    //     return;
    // }

    // commodities
    // if(this.metaData.roomName === 'E55S47')
    // {
    //   console.log(this.name, 'commodities', 1, this.room.memory.commands)
    // }

    if(this.room.memory.commands === undefined)
    {
      const commodities = Object.keys(COMMODITIES).filter(n => n !== RESOURCE_ENERGY && !REACTIONS[n]) as CommodityConstant[]
      for(let i = 0; i < commodities.length; i++)
      {
        const commodity = commodities[i];
        let amount = COMMODITY_TERMINAL_AMOUNT;
        if(Object.keys(COMMODITIES[commodity].components).filter(c => c === this.mineral.mineralType).length)
        {
          amount *= 2;
          //console.log(this.name, commodity, this.mineral.mineralType);
        }
        // if(this.metaData.roomName === 'E55S47')
        //   console.log(this.name, 'commodities', commodity, amount);

        if(this.terminal?.store.getUsedCapacity(commodity) < amount)
        {
          if(this.TransferToTerminal(commodity))
            return;
        }

        if(this.terminal?.store.getUsedCapacity(commodity) !== amount)
        {
          this.TransferToStorage(commodity, amount);
        }

        if(this.factory?.store.getUsedCapacity(commodity) >= 600)
        {
          this.creep.withdraw(this.factory, commodities[i]);
          return;
        }
      }
    }

    for(let i = 0; i < global.depositTypes.length; i++)
    {
      const deposit = global.depositTypes[i];
      if(this.terminal?.store.getUsedCapacity(deposit) < MINERAL_KEEP_AMOUNT)
      {
        if(this.TransferToTerminal(deposit))
          return;
        else
          continue;
      }

      if(this.terminal?.store.getUsedCapacity(deposit) !== MINERAL_KEEP_AMOUNT)
      {
        this.TransferToStorage(deposit, MINERAL_KEEP_AMOUNT);
        return;
      }
    }

    if(this.factory.store.getUsedCapacity() > 0
    && this.creep.store.getUsedCapacity() === 0
    && !this.room.memory.commands)
    {
      this.creep.withdrawEverything(this.factory);
      return;
    }

    // if((this.storage.store[this.mineral.mineralType] ?? 0) > 10000 &&
    //   this.factory.store.getFreeCapacity() > this.creep.store.getCapacity() * 2)
    // {
    //   this.creep.withdraw(this.storage.store[this.mineral.mineralType])
    // }

    if(this.creep.ticksToLive < 1500)
      this.RenewCreep();

    this.creep.transferEverything(this.storage);
  }

  private CheckForSKMining(yellowFlags: Flag[])
  {
      this.metaData.numberOfFlags = yellowFlags.length;
      if(yellowFlags.length)
      {
        for(let i = 0; i < yellowFlags.length; i++)
        {
          const yFlag = yellowFlags[i];
          const skRoomName = yFlag.name.split('-')[0];
          const skRoom = Game.rooms[skRoomName];
          if(skRoom)
          {
            let miningFlags = skRoom.find(FIND_FLAGS, {filter: f => f.name === 'Mining-' + skRoomName});
            if(miningFlags.length)
            {
              const mineral = this.roomInfo(skRoomName).mineral;
              if(!this.metaData.skMinerals)
                  this.metaData.skMinerals = [];

              this.metaData.skMinerals.push(mineral.id);
              this.skMinerals.push(mineral.mineralType);
            }
          }
        }
      }
      else
      {
        this.metaData.skMinerals = undefined;
      }
  }

  private SetupRenewSpawn()
  {
    const spawn = this.creep.pos.findInRange(FIND_MY_STRUCTURES, 1, {filter: s => s.structureType === STRUCTURE_SPAWN});
    if(spawn instanceof StructureSpawn)
    {
      this.metaData.renewSpawnId = spawn.id;
    }
  }

  private RenewCreep()
  {
    if(!this.renewSpawn?.spawning && (this.renewSpawn?.store[RESOURCE_ENERGY] ?? 0) > 0)
      this.renewSpawn.renewCreep(this.creep);
  }

  private TransferEnergyToTerminal(): boolean
  {
    if(this.creep.store.getUsedCapacity() === 0)
    {
      if(this.storage.store[RESOURCE_ENERGY] > this.creep.store.getCapacity())
      {
        this.creep.say('WE🏟');
        let amount = 75000 - this.terminal.store.getUsedCapacity(RESOURCE_ENERGY);
        if(amount > 600)
          amount = 600;
        this.creep.withdraw(this.storage, RESOURCE_ENERGY, amount);
        return true;
      }
      else
        return false;
    }

    if(this.terminal.store.getFreeCapacity() > this.creep.store.getUsedCapacity())
    {
      this.creep.say('TA🏦');
      this.creep.transferEverything(this.terminal);
    }

    return true;
  }

  private TransferEnergyToStorage() : boolean
  {
    if(this.creep.store.getUsedCapacity() === 0)
    {

      let amount = 0;
      amount = this.terminal.store[RESOURCE_ENERGY] - 75000;
      amount = (amount > this.creep.store.getCapacity()) ? this.creep.store.getCapacity() : amount;
      this.creep.say('WE🏦');
      const ret = this.creep.withdraw(this.terminal, RESOURCE_ENERGY, amount);
      return true;
    }

    if(this.storage.store.getFreeCapacity() > this.creep.store.getUsedCapacity())
    {
      this.creep.say('TA🏟');
      this.creep.transferEverything(this.storage);
      return true;
    }
    else
      return false;
  }

  private TransferToTerminal(res: ResourceConstant)
  {
    if(this.creep.store[res] !== this.creep.store.getUsedCapacity())
    {
      if(this.metaData.roomName === 'E56S43' && res === RESOURCE_COMPOSITE)
          console.log(this.name, 'TransferToTerminal', 1);
        this.creep.transferEverything(this.storage);
        return false;
    }

    if(this.creep.store.getUsedCapacity() === 0)
    {
      //if(this.storage.store[res] > this.creep.store.getCapacity())
        return (this.creep.withdraw(this.storage, res) === OK);
    }

    if(this.terminal.store.getFreeCapacity() > this.creep.store.getUsedCapacity())
    {
      return (this.creep.transfer(this.terminal, res) === OK);
    }

    return false;
  }

  private TransferToStorage(res: ResourceConstant, keepAmount: number)
  {

    if(this.creep.store.getUsedCapacity() === 0 && this.terminal.store[res] > keepAmount)
    {
      let amount = 0;
      //if(res === RESOURCE_ENERGY)
      {
          amount = this.terminal.store[res] - keepAmount;
          if(amount > this.creep.store.getCapacity())
            amount = this.creep.store.getCapacity();
          const ret = this.creep.withdraw(this.terminal, res, amount);
          return;
      }
    }

    //if(this.storage.store.getUsedCapacity() > this.creep.store.getUsedCapacity())
    this.creep.transferEverything(this.storage);
  }

  private TransferToFactory(res: ResourceConstant|String)
  {
    const resource = res as ResourceConstant;
    if(this.creep.store[resource] !== this.creep.store.getUsedCapacity())
    {
      this.creep.transferEverything(this.storage);
      return false;
    }

    if(this.creep.store.getUsedCapacity() === 0)
    {
      if(this.storage.store[resource] > this.creep.store.getCapacity())
        return (this.creep.withdraw(this.storage, resource) === OK);
    }

    if(this.factory.store.getFreeCapacity() > this.creep.store.getUsedCapacity())
    {
      const ret = this.creep.transfer(this.factory, resource);
      return (ret === OK);
    }

    return false;
  }

  private FindBarType(room: Room)
  {
    for(let c in COMMODITIES)
    {
      for(let comp in COMMODITIES[c].components)
      {
        if(comp === this.mineral.mineralType)
          room.memory.barType = c as CommodityConstant;
      }
    }
  }

  private CheckAndTransferBars(bar: CommodityConstant) : boolean
  {
    if(this.metaData.roomName === 'E37S46')
      console.log(this.name, 'CheckAndTransferBars', 1, bar);
    let ret = false;
    const commodity = COMMODITIES[bar];
    const barAmountNeeded = FACTORY_KEEP_AMOUNT - (this.terminal.store[bar] ?? 0);
    const energyNeeded = Math.ceil(barAmountNeeded / 100) * 200;
    const componentNeeded = Math.ceil(barAmountNeeded / 100) * 500;
    let bothComponents = 0;

    //if(this.mineral.mineralType === RESOURCE_CATALYST || this.mineral.mineralType === RESOURCE_KEANIUM || this.mineral.mineralType === RESOURCE_ZYNTHIUM)
    {
      for(let comp in commodity.components)
      {
        if(this.metaData.roomName === 'E37S46')
          console.log(this.name, 'CheckAndTransferBars', 2, comp, componentNeeded, energyNeeded,
          this.storage.store.getUsedCapacity(this.mineral.mineralType) + this.creep.store.getUsedCapacity(this.mineral.mineralType) >= 104100,
          ((this.storage.store[this.mineral.mineralType] ?? 0) + this.creep.store.getUsedCapacity(this.mineral.mineralType) >= 104100))

        if((comp === RESOURCE_ENERGY && this.factory.store[comp] >= 200) || this.factory.store[comp] >= 500)
          bothComponents++;

        if(comp === RESOURCE_ENERGY &&
          (this.factory.store.getUsedCapacity(comp) < energyNeeded
          && this.storage.store.getUsedCapacity(this.mineral.mineralType) + this.creep.store.getUsedCapacity(this.mineral.mineralType) >= 104100))
        {
          if(this.metaData.roomName === 'E37S46')
          console.log(this.name, 'CheckAndTransferBars', 3)
          if(this.TransferToFactory(comp))
          {
            ret = true;
            break;
          }
        }
        else if(comp !== RESOURCE_ENERGY
          && ((this.factory?.store[comp] ?? 0) < componentNeeded)
          && ((this.storage.store[this.mineral.mineralType] ?? 0) + this.creep.store.getUsedCapacity(this.mineral.mineralType) >= 104100))
        {
          if(this.metaData.roomName === 'E37S46')
          console.log(this.name, 'CheckAndTransferBars', 4)
          if(this.TransferToFactory(comp))
          {
            ret = true;
            break;
          }
        }
      }
      if(this.metaData.roomName === 'E37S46')
          console.log(this.name, 'CheckAndTransferBars', 5, bothComponents)
      if(bothComponents == 2)
        this.factory.produce(bar);
    }
    return ret;
  }

  private CommodityChecking(commodity: ResourceConstant, amountToMake = 0) : Command[]|undefined
  {
    let missingComponent = false;
    let commands: Command[] = [];

    if(this.metaData.roomName === 'E37S46')
      console.log(this.name, 'Commodity Checking start', commodity, amountToMake);
    if(COMMODITIES[commodity]?.components && this.powerCreep)
      {
        let keepSearching = true;
        if(COMMODITIES[commodity].amount === 100)
          keepSearching = false;

        const cooldown = COMMODITIES[commodity].cooldown;
        amountToMake = Math.ceil(amountToMake / COMMODITIES[commodity].amount);
        for(let c in COMMODITIES[commodity].components)
        {
          let comp = c as ResourceConstant;
          if(this.metaData.roomName === 'E37S46')
            console.log(this.name, 'Commodity Checking components', comp);
          const amount = COMMODITIES[commodity].components[comp] * amountToMake;
          if((this.factory?.store[comp] ?? 0) >= amount)
            console.log(this.name, 'Factory has', comp, amount );
          else if((this.terminal?.store[comp] ?? 0) >= amount)
          {
            //console.log(this.name, 'Terminal has', comp, amount * amountToMake);
            commands.push({destination: this.factory.id, origin: this.terminal.id, resourceType: comp, amount: amount});
          }
          else if((this.storage?.store[comp] ?? 0) >= amount)
          {
            //console.log(this.name, 'Storage has', comp, amount * amountToMake);
            commands.push({destination: this.factory.id, origin: this.storage.id, resourceType: comp, amount: amount});
          }
          else
          {
            const deposit = <DepositConstant>comp;
            if(this.metaData.roomName === 'E56S43')
            {
              console.log(this.name, 'Commodity checking before skip', deposit, global.depositTypes.indexOf(deposit));

              if(global.depositTypes.indexOf(deposit) === -1 && COMMODITIES[comp]?.level === undefined || COMMODITIES[comp]?.level === this.factory.level)
              {
                //console.log(this.name, 'nothing has', comp, amount * amountToMake, Object.keys(COMMODITIES[comp].components).length, keepSearching);
                if(keepSearching)
                {
                  const recCommands = this.CommodityChecking(comp, amount);
                  if(recCommands?.length)
                  {
                    for(let i = 0; i < recCommands.length; i++)
                      commands.push(recCommands[i]);
                  }
                  else
                    return undefined;

                }
                else
                {
                  return undefined;
                }
              }
              else
                return undefined;
            }
          }
        }

        if(!missingComponent
          && commands.length)
        {
          return commands;
        }
      }
  }

  private FactoryEmpty(commodity: ResourceConstant)
  {
    if(this.factory.store.getUsedCapacity() === 0)
    {
      this.room.memory.factoryEmpty = true;
    }

    if(this.factory.store.getUsedCapacity() > 0 && this.creep.store.getUsedCapacity() === 0)
    {
      this.creep.withdrawEverything(this.factory);
      return;
    }

    if(this.creep.store.getUsedCapacity(commodity) > 0)
    {
      this.creep.transfer(this.terminal, commodity);
      return;
    }

    if(this.creep.store.getUsedCapacity() > 0)
    {
      this.creep.transferEverything(this.storage);
      return;
    }
  }

  private FactoryWork() : Command[]
  {
    let haveEverything = true;
    let commands: Command[] = [];
    let commoditiesToMake: CommodityConstant[] = []

    let commodityToMake: CommodityConstant;
    let commidtyAmount = 0;

    if(this.factory?.level)
    {
      const checkCommodities: {res: ResourceConstant, amount:number}[] = [];
      let numberOfMakes = 0;
      for(const com in COMMODITIES)
      {
        const commodity = com as CommodityConstant;
        const data = COMMODITIES[(commodity as CommodityConstant)];
        if(data.level === this.factory.level)
        {
          if(this.terminal.store.getUsedCapacity(commodity) + this.storage.store.getUsedCapacity(commodity) < 1000)
          {
            let haveAllComponents = true;
            //consol.log(this.name, 'FW lvl', commodity)
            numberOfMakes = Math.floor(POWER_INFO[PWR_OPERATE_FACTORY].duration / data.cooldown);
            for(const c in data.components)
            {
              //consol.log(this.name, 'FW lvl 2', c, numberOfMakes, data.components[c])
              const component = c as ResourceConstant;
              const totalInStore = this.storage.store.getUsedCapacity(component) + this.terminal.store.getUsedCapacity(component);
              const componentAmountNeeded = numberOfMakes * data.components[c];
              if(totalInStore < componentAmountNeeded)
              {
                //consol.log(this.name, 'FW lvl 3 SubComponent check')
                if(haveAllComponents && !COMMODITIES[component].level)
                {
                  //consol.log(this.name, 'FW lvl 3.1', component, componentAmountNeeded);
                  const subData = COMMODITIES[(component as CommodityConstant)];
                  const subNumberOfMakes = Math.ceil(componentAmountNeeded / subData.amount);
                  let haveAllSubComponents = true;
                  for(const subC in subData.components)
                  {
                    const subComponent = subC as ResourceConstant;
                    const subTotalInStore = this.storage.store.getUsedCapacity(subComponent) + this.terminal.store.getUsedCapacity(subComponent);
                    const subComponentAmountNeeded = subNumberOfMakes * subData.components[subC];
                    //consol.log(this.name, 'FW lvel 3.1', subComponent, subTotalInStore, subComponentAmountNeeded);
                    if(subTotalInStore < subComponentAmountNeeded)
                    {
                      haveAllComponents = false;
                      haveAllSubComponents = false;
                    }
                  }

                  if(haveAllSubComponents && checkCommodities.indexOf({res: component, amount: subNumberOfMakes}) === -1)
                  {
                    //consol.log(this.name, 'FW lvl 3.2', component);
                    checkCommodities.push({res: component, amount: subNumberOfMakes});
                  }
                }
                else
                  haveAllComponents = false;
              }
            }

            if(haveAllComponents)
            {
              //consol.log(this.name, 'FW 4', commodity);
              checkCommodities.push({res: commodity, amount: numberOfMakes})
            }
          }
        }
      }

      let commands: Command[] = [];
      for(let checkCom of checkCommodities)
      {
        //consol.log(this.name, 'Factory lvl', 2, checkCom);
        const data = COMMODITIES[(checkCom.res as CommodityConstant)];
        for(const c in data.components)
        {
          const component = c as ResourceConstant;
          const terminalAmount = this.terminal.store.getUsedCapacity(component);
          const storageAmount = this.terminal.store.getUsedCapacity(component);
          const amountNeeded = checkCom.amount * data.components[c];
          if(terminalAmount + storageAmount > amountNeeded)
            commands = commands.concat(this.GenerateCommands(terminalAmount, storageAmount, amountNeeded, component));
        }
      }

      //consol.log(this.name, 'Factory lvl', 3, commands.length)
      for(let command of commands)
      {
        //consol.log(this.name, command.resourceType, command.amount, command.origin);
      }

      if(commands.length)
      {
        //consol.log(this.name, 'Factory lvl', 3, commands.length)

        if(!this.room.memory.commoditiesToMake)
          this.room.memory.commoditiesToMake = [];

        for(let checkCom of checkCommodities)
          this.room.memory.commoditiesToMake.push(checkCom.res as CommodityConstant);

        return commands;
      }

    }
    else
    {
      let depositAmount =  0;
      let deposit: ResourceConstant;
      for(const d of global.depositTypes)
      {
        //consol.log(this.name, 'FactoryWork', d);
        // Find commodity to make by one of its components
        for(const commodity in COMMODITIES)
        {
          const data = COMMODITIES[(commodity as CommodityConstant)];
          if(_.contains(Object.keys(data.components), d))
          {
            if(this.terminal.store.getUsedCapacity(d) > 500)
            {
              commodityToMake = commodity as CommodityConstant;
              commidtyAmount = data.amount;
              depositAmount = data.components[d];
              deposit = d;
              break;
            }
          }
        }
      }

      const numberOfMakes = Math.ceil(100 / commidtyAmount)
      const totalDepositAmount = numberOfMakes * depositAmount;
      //consol.log(this.name, 'FW', 0, commodityToMake, commidtyAmount, numberOfMakes, totalDepositAmount);

      const totalDepositInStore = this.terminal.store.getUsedCapacity(deposit) + this.storage.store.getUsedCapacity(deposit);
      if(totalDepositInStore >= totalDepositAmount)
      {
        const data = COMMODITIES[commodityToMake];
        for(const c in data.components)
        {
          const component = c as ResourceConstant;
          let totalAmount = data.components[component] * numberOfMakes;
          //console.log(this.name, 'FW', 1, totalAmount, component);
          const terminalAmount = this.terminal.store.getUsedCapacity(component);
          const storageAmount = this.storage.store.getUsedCapacity(component);
          //consol.log(this.name, 'FW', 2, component, 'terminal', terminalAmount, 'storage', storageAmount)
          if(terminalAmount + storageAmount < totalAmount)
          {
            // Need to make some more of this component or we are sunk
            const needToMakeAmount = totalAmount - terminalAmount + storageAmount;
            const subTimesToProcess = Math.ceil(needToMakeAmount / COMMODITIES[component].amount)
            //console.log(this.name, 'FW', 3, component, needToMakeAmount, COMMODITIES[component].amount, subTimesToProcess);
            const subData = COMMODITIES[component];
            for(const subC in subData.components)
            {
              const subComponent = subC as ResourceConstant;
              //console.log(this.name, 'FW', 4, subC, subComponent);
              //let subTotalAmount = subData.amount * subTimesToProcess; // Think it should be this
              let subTotalAmount = subData.components[subComponent] * subTimesToProcess;
              //console.log(this.name, 'FW', 5, subTotalAmount, subComponent);
              const subTerminalAmount = this.terminal.store.getUsedCapacity(subComponent);
              const subStorageAmount = this.storage.store.getUsedCapacity(subComponent);
              //consol.log(this.name, 'FW', 6, subComponent, 'terminal', subTerminalAmount, 'storage', subStorageAmount);
              if(subTerminalAmount + subStorageAmount < subTotalAmount)
                haveEverything = false;
              else
              {
                if(haveEverything)
                {
                  if(commoditiesToMake.indexOf(component as CommodityConstant) === -1)
                    commoditiesToMake.push(component as CommodityConstant);
                  const retCommands = this.GenerateCommands(subTerminalAmount, subStorageAmount, subTotalAmount, subComponent)
                  //consol.log(this.name, 'FW', 6.1, retCommands.length)
                  commands = commands.concat(retCommands);
                  //consol.log(this.name, 'FW', 6.2, commands.length);
                }
              }
            }
          }
          else
          {
            if(haveEverything)
            {
              if(commoditiesToMake.indexOf(commodityToMake as CommodityConstant) === -1)
                commoditiesToMake.push(commodityToMake as CommodityConstant);
              //console.log(this.name, 'FW', 2.1)
              commands = commands.concat(this.GenerateCommands(terminalAmount, storageAmount, totalAmount, component));
              //consol.log(this.name, 'FW', 2.2, commands.length)
            }
          }
        }


        if(commands.length)
        {
          for(let command of commands)
          {
            //consol.log(this.name, 'command', command.resourceType, command.amount, command.origin);
          }

          let rawCommands = commands.reverse();
          let index = _.findIndex(rawCommands, rc => rc.resourceType === RESOURCE_ENERGY);
          let command: Command = {resourceType: RESOURCE_ENERGY, amount: 0, origin: this.storage.id, destination: this.factory.id};
          while(index !== -1)
          {
            const tempCommand = rawCommands.splice(index, 1);
            command.amount += tempCommand[0].amount;
            index = _.findIndex(rawCommands, rc => rc.resourceType === RESOURCE_ENERGY)
          }
          rawCommands.push(command);

          commands = rawCommands;

          //consol.log(this.name, 'Second commands');
          for(let command of commands)
          {
            //consol.log(this.name, 'command', command.resourceType, command.amount, command.origin);
          }
        }
      }
    }


    if(haveEverything)
    {
      this.room.memory.commoditiesToMake = commoditiesToMake;
      return commands;
    }
  }

  private GenerateCommands(terminalAmount: number, storageAmount: number, totalAmount: number, component: ResourceConstant): Command[]
  {
    let commands: Command[] = [];
    if(terminalAmount > totalAmount)
    {
      commands.push({destination: this.factory.id, resourceType: component, origin: this.terminal.id, amount: totalAmount});
      totalAmount = 0;
    }
    else
    {
      commands.push({destination: this.factory.id, resourceType: component, origin: this.terminal.id, amount: terminalAmount});
      totalAmount -= terminalAmount;
    }

    if(totalAmount > 0 && storageAmount > totalAmount)
    {
      commands.push({destination: this.factory.id, resourceType: component, origin: this.storage.id, amount: totalAmount});
      totalAmount = 0;
    }

    return commands
  }
}
