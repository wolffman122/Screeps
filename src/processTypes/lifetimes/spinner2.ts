import { LifetimeProcess } from "os/process";
import { KEEP_AMOUNT, MINERALS_RAW, MINERAL_KEEP_AMOUNT, PRODUCT_LIST, PRODUCTION_AMOUNT, FACTORY_KEEP_AMOUNT, ENERGY_KEEP_AMOUNT } from "processTypes/buildingProcesses/mineralTerminal";

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
  skMinerals: Mineral<MineralConstant>[] = [];
  renewSpawn: StructureSpawn

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

    const room = Game.rooms[this.creep.pos.roomName];
    this.djFlag = Game.flags['DJ-' + this.creep.pos.roomName];
    this.link = this.roomData().storageLink;
    this.storage = room.storage;
    this.terminal = room.terminal;
    this.factory = this.roomData().factory;
    this.mineral = this.roomData().mineral;
    this.powerSpawn = this.roomData().powerSpawn;

    if((this.powerSpawn?.store[RESOURCE_ENERGY] ?? 0) > 0
      && (this.powerSpawn?.store[RESOURCE_POWER] ?? 0) > 0)
      this.powerSpawn.processPower();

    if(!room.memory.barType)
      this.FindBarType(room);

    const yellowFlags = this.creep.room.find(FIND_FLAGS, {filter: f => f.color === COLOR_YELLOW && f.secondaryColor === COLOR_YELLOW });
    // Need to find a better way to reset the stale data
    if(this.metaData.numberOfFlags !== yellowFlags.length)
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

    if(room.memory.spinnerDump)
    {
      if(this.creep.store.getUsedCapacity() > 0)
      {
        this.creep.transferEverything(room.terminal);
        return;
      }

      if(room.terminal.store.getFreeCapacity() > this.creep.store.getCapacity())
      {
        for(let res in room.storage.store)
        {
          const resc = res as ResourceConstant
          if(this.creep.withdraw(room.storage, resc) === OK)
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

    if(this.creep.name === 'em-s-E56S43-25377903')
      console.log(this.name, 'Problem', 1)
    if(this.terminal?.store[this.mineral.mineralType] < KEEP_AMOUNT)
    {
      this.TransferToTerminal(this.mineral.mineralType);
      return;
    }

    if(this.creep.name === 'em-s-E56S43-25377903')
      console.log(this.name, 'Problem', 2)
    let amount = this.terminal.store[this.mineral.mineralType] - KEEP_AMOUNT
    if(amount > 0 && this.storage.store.getFreeCapacity() > 3000)
    {
      this.TransferToStorage(this.mineral.mineralType, KEEP_AMOUNT);
      return;
    }

    if(this.creep.name === 'em-s-E56S43-25377903')
      console.log(this.name, 'Problem', 3)
    const bar = room.memory.barType
    if((this.terminal.store[bar] ?? 0) < FACTORY_KEEP_AMOUNT &&
      (this.storage.store[this.mineral.mineralType] ?? 0) > 100000)
    {
      if(this.creep.room.name === 'E36S33')
        console.log(this.name, 'Check Bars', 1)
      if(this.CheckAndTransferBars(bar))
        return;
    }

    // SK Mineral transfer code.
    for(let i = 0; i < this.skMinerals.length; i++)
    {
      const skMineral = this.skMinerals[i];
      if(this.terminal?.store[skMineral.mineralType] < KEEP_AMOUNT)
      {
        this.TransferToTerminal(skMineral.mineralType);
        return;
      }

      if(this.terminal?.store[skMineral.mineralType] > KEEP_AMOUNT)
      {
        this.TransferToStorage(skMineral.mineralType, KEEP_AMOUNT);
        return;
      }
    }

    // Minerals
    for(let i = 0; i < MINERALS_RAW.length; i++)
    {
      const mineral = MINERALS_RAW[i];
      if(mineral === this.mineral.mineralType)
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
      if((this.terminal?.store[prod] ?? 0) < PRODUCTION_AMOUNT)
      {
        if(this.TransferToTerminal(prod))
          return;
        else
          continue;
      }

      if(this.terminal?.store[prod] !== PRODUCTION_AMOUNT)
      {
        this.TransferToStorage(prod, PRODUCTION_AMOUNT);
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

    if(this.creep.name === 'em-s-E56S43-25377903')
      console.log(this.name, 'Problem', 4)
    // commodities
    const commodities = Object.keys(COMMODITIES).filter(n => n !== RESOURCE_ENERGY && !REACTIONS[n]) as CommodityConstant[]
    for(let i = 0; i < commodities.length; i++)
    {
      if((this.terminal?.store[commodities[i]] ?? 0) < PRODUCTION_AMOUNT)
      {
        if(this.TransferToTerminal(commodities[i]))
          return;
      }

      if(this.terminal?.store[commodities[i]] !== PRODUCTION_AMOUNT)
      {
        this.TransferToStorage(commodities[i], PRODUCTION_AMOUNT);
      }

      if((this.factory?.store[commodities[i]] ?? 0) >= 600)
      {
        if(this.creep.room.name === 'E36S33')
          console.log(this.name, 'Should be pulling from factory', commodities[i]);
        this.creep.withdraw(this.factory, commodities[i]);
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
              const minerals = skRoom.find(FIND_MINERALS);
              if(minerals.length === 1)
              {
                if(!this.metaData.skMinerals)
                  this.metaData.skMinerals = [];

                this.metaData.skMinerals.push(minerals[0].id);
                this.skMinerals.push(minerals[0]);
              }
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
        this.creep.withdraw(this.storage, RESOURCE_ENERGY);
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
      if(this.creep.room.name === 'E36S33')
        console.log(this.name, 'Check Bars', 3);
      this.creep.transferEverything(this.storage);
      return false;
    }

    if(this.creep.store.getUsedCapacity() === 0)
    {
      if(this.creep.room.name === 'E36S33')
        console.log(this.name, 'Check Bars', 4);
      if(this.storage.store[resource] > this.creep.store.getCapacity())
        return (this.creep.withdraw(this.storage, resource) === OK);
    }

    if(this.factory.store.getFreeCapacity() > this.creep.store.getUsedCapacity())
    {
      const ret = this.creep.transfer(this.factory, resource);
      if(this.creep.room.name === 'E36S33')
        console.log(this.name, 'Check Bars', 5, ret, resource);

      return (ret === OK);
    }

    if(this.creep.room.name === 'E36S33')
        console.log(this.name, 'Check Bars', 6);
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

    if(this.creep.room.name === 'E36S33')
        console.log(this.name, 'Check Bars', 2, commodity);
    // if(this.creep.room.name === 'E36S33' || this.creep.room.name === 'E48S56'
    // || this.creep.room.name === 'E45S48'
    // || this.creep.room.name === 'E44S42'
    // || this.creep.room.name === 'E38S35')
    if(this.mineral.mineralType === RESOURCE_CATALYST || this.mineral.mineralType === RESOURCE_KEANIUM)
    {
      for(let comp in commodity.components)
      {
        if((comp === RESOURCE_ENERGY && this.factory.store[comp] >= 200) || this.factory.store[comp] >= 500)
          bothComponents++;

        if(this.creep.room.name === 'E44S42')
          console.log(this.name, comp, (this.factory.store[comp] ?? 0),  energyNeeded)
        if(comp === RESOURCE_ENERGY &&
          (this.factory.store[comp] ?? 0) < energyNeeded)
        {
          if(this.TransferToFactory(comp))
          {
            ret = true;
            break;
          }
        }
        else if(comp !== RESOURCE_ENERGY &&
          (this.factory?.store[comp] ?? 0) < componentNeeded)
        {
          console.log(this.name, 'Transfer to factory')
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
}
