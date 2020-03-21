import { LifetimeProcess } from "os/process";
import { KEEP_AMOUNT, MINERALS_RAW, MINERAL_KEEP_AMOUNT, PRODUCT_LIST, PRODUCTION_AMOUNT } from "processTypes/buildingProcesses/mineralTerminal";

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
    this.mineral = this.roomData().mineral

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

    if(this.terminal?.store[this.mineral.mineralType] < KEEP_AMOUNT)
    {
      this.TransferToTerminal(this.mineral.mineralType);
      return;
    }

    let amount = this.terminal.store[this.mineral.mineralType] - KEEP_AMOUNT
    if(amount > 0 && this.storage.store.getFreeCapacity() > 3000)
    {
      this.TransferToStorage(this.mineral.mineralType, KEEP_AMOUNT);
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

    const commodities = Object.keys(COMMODITIES).filter(n => n !== RESOURCE_ENERGY && !REACTIONS[n]) as CommodityConstant[]
    for(let i = 0; i < commodities.length; i++)
    {
      if((this.terminal?.store[commodities[i]] ?? 0) < PRODUCTION_AMOUNT)
      {
        if(this.TransferToTerminal(commodities[i]))
          return;
        else
          continue;
      }

      if(this.terminal?.store[commodities[i]] !== PRODUCTION_AMOUNT)
      {
        this.TransferToStorage(commodities[i], PRODUCTION_AMOUNT);
      }

      if((this.factory.store[commodities[i]] ?? 0) > 0)
      {
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
      return (this.creep.transferEverything(this.terminal) === OK);

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
}
