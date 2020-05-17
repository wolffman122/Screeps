import { LifetimeProcess } from "os/process";
import { KEEP_AMOUNT, MINERALS_RAW, MINERAL_KEEP_AMOUNT, PRODUCT_LIST, PRODUCTION_TERMINAL_AMOUNT, FACTORY_KEEP_AMOUNT, ENERGY_KEEP_AMOUNT } from "processTypes/buildingProcesses/mineralTerminal";
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

    if(this.creep.room.name === 'E56S43')
    {
      console.log(this.name, '################# Problem ####################', this.creep.pos)
      console.log(this.name, 'Commodity level test');

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
    // this.room.memory.commodityToMake = undefined;

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

    // if(commoditiesForLevel?.length)
    // {
    //   for(let i = 0; i < commoditiesForLevel.length; i++)
    //     console.log(this.name, 'Level', this.factory.level, 'commodity:', commoditiesForLevel[i]);
    // }


    if(this.room.memory.commands?.length && this.room.memory.commandIndex !== this.room.memory.commands.length)
    {

      console.log(this.name, 'Time to start processing commands', this.room.memory.factoryEmpty, this.room.memory.commands.length, this.room.memory.commandIndex);

      if(this.room.memory.commandIndex === undefined)
        this.room.memory.commandIndex = 0;

      const index = this.room.memory.commandIndex;
      const command = this.room.memory.commands[index];

      if(command)
      {
        if(this.creep.store.getUsedCapacity() === 0)
        {
          const amountNeeded = command.amount - this.factory.store.getUsedCapacity(command.resourceType);
          const amount = (amountNeeded > this.creep.store.getCapacity()) ? this.creep.store.getCapacity() : amountNeeded;
          const origin = <Structure>Game.getObjectById(command.origin);
          const ret = this.creep.withdraw(origin, command.resourceType, amount);
          return;
        }

        if(this.creep.store.getUsedCapacity(command.resourceType) > 0)
        {
          if(this.factory.store.getUsedCapacity(command.resourceType) + this.creep.store.getUsedCapacity(command.resourceType) >= command.amount)
            this.room.memory.commandIndex++;
          this.creep.transfer(this.factory, command.resourceType);
          return;
        }
      }

    }
    else if(this.room.memory.commands?.length && !this.room.memory.componentsReady
      && !this.factory.cooldown)
    {
      const cooldown = COMMODITIES[this.room.memory.commodityToMake].cooldown;
      const totalMakes = Math.floor(POWER_INFO[PWR_OPERATE_FACTORY].duration / cooldown);
      let componentsReady = true;
      for(let com in COMMODITIES[this.room.memory.commodityToMake].components)
      {
        if(com !== RESOURCE_ENERGY)
        {
          const resource = <CommodityConstant>com;
          if(this.factory.store.getUsedCapacity(resource) < COMMODITIES[this.room.memory.commodityToMake].components[com] * totalMakes)
          {
            componentsReady = false;
            if(this.factory.produce(resource) === OK)
              break;
          }
        }
      }
      if(componentsReady)
        this.room.memory.componentsReady = true;
    }

    if(this.room.memory.componentsReady)
    {
      if(this.factory.store.getUsedCapacity() - this.factory.store.getUsedCapacity(this.room.memory.commodityToMake) > 0
        && !this.factory.effects.filter(e => e.effect === PWR_OPERATE_FACTORY).length)
      {
        const powerProcess = this.kernel.getProcessByName('pclf-' + this.metaData.roomName + '-Operator');
        if(powerProcess instanceof PowerCreepLifetimeProcess)
        {
          powerProcess.metaData.turnOnFactory = true;
        }
      }
      else if(this.factory.effects.filter(e => e.ticksRemaining > 0)
        && !this.factory.cooldown)
      {
        if(this.factory.produce(this.room.memory.commodityToMake) === ERR_NOT_ENOUGH_RESOURCES)
        {
          this.room.memory.commands = undefined;
          this.room.memory.commandIndex = undefined;
          this.room.memory.componentsReady = undefined;
          this.room.memory.factoryEmpty = false;
          this.room.memory.commodityToMake = undefined;
        }
      }
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
    if((this.terminal.store[bar] ?? 0) < FACTORY_KEEP_AMOUNT
      && this.storage.store.getUsedCapacity(<ResourceConstant>onecomp) >= 10600
      && this.storage.store.getUsedCapacity(<ResourceConstant>twocomp) >= 10600)
    {
      if(this.CheckAndTransferBars(bar))
        return;
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
    for(let i = 0; i < PRODUCT_LIST.length; i++)
    {
      const prod = PRODUCT_LIST[i];
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

    if(this.factory?.level && !this.room.memory.commodityToMake)
    {
      console.log(this.name, 'Factory Testing', this.room.memory.commands, this.room.memory.commandIndex, this.room.memory.factoryEmpty);
      for(let i = 0; i < commoditiesForLevel.length; i++)
      {
        const commodity = commoditiesForLevel[i];
        if(this.terminal?.store.getUsedCapacity(commodity) < 1000)
        {
          if(!this.room.memory.factoryEmpty)
          {
            if(this.factory.store.getUsedCapacity() === 0)
              this.room.memory.factoryEmpty = true;

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

          const cooldown = COMMODITIES[commodity].cooldown;
          const amount = COMMODITIES[commodity].amount;
          const totalMakes = Math.floor(POWER_INFO[PWR_OPERATE_FACTORY].duration / cooldown);
          if(this.room.memory.commands === undefined)
          {
            let rawCommands= this.CommodityChecking(commodity, totalMakes*amount)
            if(rawCommands?.length)
            {
              rawCommands = rawCommands.reverse();
              let index = _.findIndex(rawCommands, rc => rc.resourceType === RESOURCE_ENERGY);
              let command: Command = {resourceType: RESOURCE_ENERGY, amount: 0, origin: this.storage.id, destination: this.factory.id};
              while(index !== -1)
              {
                const tempCommand = rawCommands.splice(index, 1);
                command.amount += tempCommand[0].amount;
                index = _.findIndex(rawCommands, rc => rc.resourceType === RESOURCE_ENERGY)
              }
              rawCommands.push(command);
              this.room.memory.commands = rawCommands;
              this.room.memory.commodityToMake = commodity;
            }
          }
        }
      }
    }

    // commodities
    if(this.room.memory.commands === undefined)
    {
      const commodities = Object.keys(COMMODITIES).filter(n => n !== RESOURCE_ENERGY && !REACTIONS[n]) as CommodityConstant[]
      for(let i = 0; i < commodities.length; i++)
      {
        if((this.terminal?.store[commodities[i]] ?? 0) < PRODUCTION_TERMINAL_AMOUNT)
        {
          if(this.TransferToTerminal(commodities[i]))
            return;
        }

        if(this.terminal?.store[commodities[i]] !== PRODUCTION_TERMINAL_AMOUNT)
        {
          this.TransferToStorage(commodities[i], PRODUCTION_TERMINAL_AMOUNT);
        }

        if((this.factory?.store[commodities[i]] ?? 0) >= 600)
        {
          this.creep.withdraw(this.factory, commodities[i]);
          return;
        }
      }
    }

    for(let i = 0; i < global.despositTypes.length; i++)
    {
      const deposit = global.despositTypes[i];
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
        this.creep.transferEverything(this.storage);
        return false;
    }

    if(this.creep.store.getUsedCapacity() === 0)
    {
      if(this.storage.store[res] > this.creep.store.getCapacity())
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
    let ret = false;
    const commodity = COMMODITIES[bar];
    const barAmountNeeded = FACTORY_KEEP_AMOUNT - (this.terminal.store[bar] ?? 0);
    const energyNeeded = Math.ceil(barAmountNeeded / 100) * 200;
    const componentNeeded = Math.ceil(barAmountNeeded / 100) * 500;
    let bothComponents = 0;

    if(this.mineral.mineralType === RESOURCE_CATALYST || this.mineral.mineralType === RESOURCE_KEANIUM || this.mineral.mineralType === RESOURCE_ZYNTHIUM)
    {
      for(let comp in commodity.components)
      {
        if((comp === RESOURCE_ENERGY && this.factory.store[comp] >= 200) || this.factory.store[comp] >= 500)
          bothComponents++;

        if(comp === RESOURCE_ENERGY &&
          (this.factory.store[comp] ?? 0) < energyNeeded)
        {
          if(this.TransferToFactory(comp))
          {
            ret = true;
            break;
          }
        }
        else if(comp !== RESOURCE_ENERGY
          && ((this.factory?.store[comp] ?? 0) < componentNeeded)
          && ((this.storage.store[this.mineral.mineralType] ?? 0) + this.creep.store.getUsedCapacity() >= 100600))
        {
          if(this.TransferToFactory(comp))
          {
            ret = true;
            break;
          }
        }
      }

      if(bothComponents == 2)
        this.factory.produce(bar);
    }
    return ret;
  }

  private CommodityChecking(commodity: ResourceConstant, amountToMake = 0) : Command[]|undefined
  {
    let missingComponent = false;
    let commands: Command[] = [];

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
        }

        if(!missingComponent
          && commands.length)
        {
          return commands;
        }
      }
  }
}
