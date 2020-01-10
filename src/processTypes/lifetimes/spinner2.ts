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

    const room = Game.rooms[this.creep.pos.roomName];
    this.djFlag = Game.flags['DJ-' + this.creep.pos.roomName];
    this.link = this.roomData().storageLink;
    this.storage = room.storage;
    this.terminal = room.terminal;
    const factory = this.roomData().factory;
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


    if(this.creep.pos.isNearTo(this.djFlag))
    {
      this.creep.travelTo(this.djFlag)
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
      this.creep.withdrawEverything(this.link);
      return;
    }

    if(this.terminal?.store[RESOURCE_ENERGY] < 75000)
    {
      this.TransferToTerminal(RESOURCE_ENERGY);
      return;
    }

    if(this.terminal?.store[RESOURCE_ENERGY] > 75000)
    {
      this.TransferToStorage(RESOURCE_ENERGY, 75000);
      return;
    }

    if(this.terminal?.store[this.mineral.mineralType] < KEEP_AMOUNT)
    {
      this.TransferToTerminal(this.mineral.mineralType);
      return;
    }

    if(this.terminal?.store[this.mineral.mineralType] > KEEP_AMOUNT)
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
      if(this.terminal?.store[mineral] < MINERAL_KEEP_AMOUNT)
      {
        this.TransferToTerminal(mineral);
        return;
      }

      if(this.terminal?.store[mineral] > MINERAL_KEEP_AMOUNT)
      {
        this.TransferToStorage(mineral, MINERAL_KEEP_AMOUNT)
        return;
      }
    }

    // Production list
    for(let i = 0; i < PRODUCT_LIST.length; i++)
    {
      const prod = PRODUCT_LIST[i];
      if(this.terminal?.store[prod] < PRODUCTION_AMOUNT)
      {
        this.TransferToTerminal(prod);
        return;
      }

      if(this.terminal?.store[prod] > PRODUCTION_AMOUNT)
      {
        this.TransferToStorage(prod, PRODUCTION_AMOUNT);
        return;
      }
    }

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
    if(!this.renewSpawn?.spawning && this.renewSpawn.store[RESOURCE_ENERGY] > 0)
      this.renewSpawn.renewCreep(this.creep);
  }

  private TransferToTerminal(res: ResourceConstant)
  {
    if(this.creep.store.getUsedCapacity() === 0)
    {
      if(this.storage.store[res] > this.creep.store.getCapacity())
        this.creep.withdraw(this.storage, res);
    }

    if(this.terminal.store.getFreeCapacity() > this.creep.store.getUsedCapacity())
      this.creep.transferEverything(this.terminal);
  }

  private TransferToStorage(res: ResourceConstant, keepAmount: number)
  {
    if(this.creep.store.getUsedCapacity() === 0)
    {
      let amount = 0;
      if(res === RESOURCE_ENERGY)
      {
          amount = this.terminal[res] - keepAmount;
          this.creep.withdraw(this.terminal, res, amount);
      }
    }

    if(this.storage.store.getUsedCapacity() > this.creep.store.getUsedCapacity())
      this.creep.transferEverything(this.storage);
  }
}
