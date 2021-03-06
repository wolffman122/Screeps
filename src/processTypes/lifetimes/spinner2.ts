import { LifetimeProcess } from "os/process";
import { KEEP_AMOUNT, MINERALS_RAW, MINERAL_KEEP_AMOUNT, PRODUCT_LIST_WITH_AMOUNTS, PRODUCTION_TERMINAL_AMOUNT, FACTORY_KEEP_AMOUNT, ENERGY_KEEP_AMOUNT, COMMODITY_TERMINAL_AMOUNT } from "processTypes/buildingProcesses/mineralTerminal";
import { PowerCreepLifetimeProcess } from "./powerCreep";
import { object } from "lodash";

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
      {
        if(this.powerSpawn.processPower() === OK)
          global.powerProcessed++;
      }

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
      this.creep.moveTo(this.djFlag)
      this.creep.say('T');
      return;
    }

    // if (this.metaData.roomName === 'E26S29') {
    //   console.log(this.name, 'Reset');
      this.room.memory.commands = undefined;
      this.room.memory.commandIndex = undefined;
      this.room.memory.componentsReady = undefined;
      this.room.memory.factoryEmpty = false;
      this.FactoryEmpty(RESOURCE_EMANATION);
    //   return;
    // }

    // if (this.metaData.roomName === 'E26S29')
    //   console.log(this.name, 'should not run');

    if (this.metaData.roomName === 'E26S29')
      console.log(this.name, 'prob', 0.1)
    if (this.metaData.roomName === 'E41S49')
      console.log(this.name, 'Run 0 LVL', 1)
    // Temp if statement
    // if (this.factory)
    // {
    //   if (this.metaData.roomName === 'E26S29')
    //     console.log(this.name, 'Run', 2)
    //   //console.log(this.name, 'Factory Production');
    //   if (this.mineral.mineralType === RESOURCE_CATALYST || this.mineral.mineralType === RESOURCE_LEMERGIUM
    //     || this.mineral.mineralType === RESOURCE_KEANIUM || this.mineral.mineralType === RESOURCE_UTRIUM
    //     || this.mineral.mineralType === RESOURCE_ZYNTHIUM || this.mineral.mineralType === RESOURCE_OXYGEN
    //     || this.mineral.mineralType === RESOURCE_HYDROGEN || this.factory?.level)
    //   {
    //     if (this.metaData.roomName === 'E41S49')
    //       console.log(this.name, 'Run 0 LVL', 3)

    //     if (this.metaData.roomName === 'E26S29')
    //       console.log(this.name, 'Run', 3)
    //     //console.log(this.name, 'Factory Production', 2);
    //     if(this.FactoryProduction())
    //       return;
    //   }
    // }

    if (this.metaData.roomName === 'E41S49')
      console.log(this.name, 'Run 0 LVL', 4)

    if (this.metaData.roomName === 'E26S29')
      console.log(this.name, 'Run', 4)

    if(this.room.memory.spinnerDump)
    {
      if(this.creep?.store.getUsedCapacity() > 0)
      {
        this.creep.transferEverything(this.room.terminal);
        return;
      }

      if(this.room.terminal?.store.getFreeCapacity() > this.creep.store.getCapacity())
      {
        for(let res in this.room.storage?.store)
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
            if(record?.level === this.factory?.level)
              commoditiesForLevel.push(<CommodityConstant>c);
        }
        this.room.memory.commoditiesForLevel = commoditiesForLevel;
      }
      else
        commoditiesForLevel = this.room.memory.commoditiesForLevel;
    }

    if(this.metaData.roomName === 'E26S29')
      console.log(this.name, 'prob', 1)
    if(this.link?.store[RESOURCE_ENERGY] > 0)
    {
      if (this.metaData.roomName === 'E26S29')
        console.log(this.name, 'prob', 2)
      if(this.creep.store.getUsedCapacity() > 0)
      {
        if (this.metaData.roomName === 'E26S29')
          console.log(this.name, 'prob', 3)
        if(this.storage?.store.getFreeCapacity() > this.creep.store.getUsedCapacity())
          this.creep.transferEverything(this.storage);
        else
          this.creep.transferEverything(this.terminal);
      }
      else
        this.creep.withdrawEverything(this.link);

      if (this.metaData.roomName === 'E26S29')
        console.log(this.name, 'prob', 4)
      return;
    }

    if (this.metaData.roomName === 'E26S29')
      console.log(this.name, 'prob', 5)

    if(this.terminal?.store[RESOURCE_ENERGY] < 75000)
    {
      if(this.TransferEnergyToTerminal())
        return;
    }

    if(this.terminal?.store[RESOURCE_ENERGY] !== 75000 && this.storage?.store.getFreeCapacity() > 3000)
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

    let amount = this.terminal?.store[this.mineral.mineralType] - KEEP_AMOUNT
    if(amount > 0 && this.storage?.store.getFreeCapacity() > 3000)
    {
      this.TransferToStorage(this.mineral.mineralType, KEEP_AMOUNT);
      return;
    }

    if (this.terminal?.store[RESOURCE_POWER] < 1000
      && (this.storage?.store[RESOURCE_POWER] ?? 0) > 1000) {
      if (this.TransferToTerminal(RESOURCE_POWER))
        return;
    }

    let powerAmount = this.terminal?.store[RESOURCE_POWER] - 1000
    if (powerAmount > 0 && this.storage?.store.getFreeCapacity() > 3000) {
      this.TransferToStorage(RESOURCE_POWER, 1000);
      return;
    }

    if (this.terminal?.store[RESOURCE_OPS] < 3000
      && (this.storage?.store[RESOURCE_OPS] ?? 0) > 3000) {
      if (this.TransferToTerminal(RESOURCE_OPS))
        return;
    }

    let opsAmount = this.terminal?.store[RESOURCE_OPS] - 3000
    if (opsAmount > 0 && this.storage?.store.getFreeCapacity() > 5000) {
      this.TransferToStorage(RESOURCE_OPS, 3000);
      return;
    }

    if (this.terminal?.store[RESOURCE_BATTERY] < 4000
      && (this.storage?.store[RESOURCE_BATTERY] ?? 0) > 6000) {
      if (this.TransferToTerminal(RESOURCE_BATTERY))
        return;
    }

    let batteryAmount = this.terminal?.store[RESOURCE_BATTERY] - 4000
    if (batteryAmount > 0 && this.storage?.store.getFreeCapacity() > 6000) {
      this.TransferToStorage(RESOURCE_BATTERY, 4000);
      return;
    }

    for(const baseCom of global.basicCommodities)
    {
        if(this.terminal?.store.getUsedCapacity(baseCom) < 1000
          && this.storage?.store.getUsedCapacity(baseCom) > 2000)
        {
          if (this.TransferToTerminal(baseCom))
            return;
        }

      let comAmount = this.terminal.store.getUsedCapacity(baseCom) - 1000;
      if(comAmount > 0 && this.storage?.store.getFreeCapacity() > 2000)
      {
        this.TransferToStorage(baseCom, 1000);
        return;
      }
    }

    const bar = this.room.memory.barType
    const onecomp = Object.keys(COMMODITIES[bar].components)[0];
    const twocomp = Object.keys(COMMODITIES[bar].components)[1];
    if((this.terminal?.store[bar] ?? 0) < FACTORY_KEEP_AMOUNT
      && this.storage?.store.getUsedCapacity(<ResourceConstant>onecomp) >= 11000
      && this.storage?.store.getUsedCapacity(<ResourceConstant>twocomp) >= 11000)
    {
      // if(this.CheckAndTransferBars(bar))
      //   return;
    }

    if(this.room.name === 'E26S29')
    {
      if(this.skMinerals === undefined)
        this.skMinerals = [];

      this.skMinerals.push(RESOURCE_HYDROGEN);
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


    if(this.room.memory.commands === undefined)
    {
      if(this.room.name === 'E48S56')
        console.log(this.name, 'Factory stuff', 1)

      const commodities = Object.keys(COMMODITIES).filter(n => n !== RESOURCE_ENERGY && !REACTIONS[n]) as CommodityConstant[]
      for(let i = 0; i < commodities.length; i++)
      {
        const commodity = commodities[i];
        let amount = COMMODITY_TERMINAL_AMOUNT;
        if(Object.keys(COMMODITIES[commodity].components).filter(c => c === this.mineral.mineralType).length)
        {
          amount *= 2;
          ////consolee.log(this.name, commodity, this.mineral.mineralType);
        }
        // if(this.metaData.roomName === 'E55S47')
        //   //consolee.log(this.name, 'commodities', commodity, amount);

        if(this.terminal?.store.getUsedCapacity(commodity) < amount)
        {
          this.creep.say('CT');
          if(this.TransferToTerminal(commodity))
            return;
        }

        if(this.terminal?.store.getUsedCapacity(commodity) !== amount)
        {
          this.TransferToStorage(commodity, amount);
        }

        if(this.factory?.store.getUsedCapacity(commodity) >= 1000)
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

    if(this.room.memory.barType)
    {
      const barType = this.room.memory.barType
      if(this.terminal?.store.getUsedCapacity(barType) < FACTORY_KEEP_AMOUNT)
      {
        if(this.TransferToTerminal(barType))
          return;
      }
    }

    if(this.factory?.store.getUsedCapacity() > 0
    && this.creep.store.getUsedCapacity() === 0
    && !this.room.memory.commands)
    {
      this.creep.withdrawEverything(this.factory);
      return;
    }

    // if((this.storage?.store[this.mineral.mineralType] ?? 0) > 10000 &&
    //   this.factory.store.getFreeCapacity() > this.creep.store.getCapacity() * 2)
    // {
    //   this.creep.withdraw(this.storage?.store[this.mineral.mineralType])
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
      if(this.storage?.store[RESOURCE_ENERGY] > this.creep.store.getCapacity())
      {
        this.creep.say('WE🏟');
        let amount = 75000 - this.terminal?.store.getUsedCapacity(RESOURCE_ENERGY);
        if(amount > this.creep.store.getCapacity())
          amount = this.creep.store.getCapacity();
        this.creep.withdraw(this.storage, RESOURCE_ENERGY, amount);
        return true;
      }
      else
        return false;
    }

    if(this.terminal?.store.getFreeCapacity() > this.creep.store.getUsedCapacity())
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
      amount = this.terminal?.store[RESOURCE_ENERGY] - 75000;
      amount = (amount > this.creep.store.getCapacity()) ? this.creep.store.getCapacity() : amount;
      this.creep.say('WE🏦');
      const ret = this.creep.withdraw(this.terminal, RESOURCE_ENERGY, amount);
      return true;
    }

    if(this.storage?.store.getFreeCapacity() > this.creep.store.getUsedCapacity())
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
      const ret = this.creep.withdraw(this.storage, res);
      if(this.creep.name === 'em-s-E48S56-27737159')
        console.log(this.name, 'Commodity problem', res, ret, ret === OK);

      return (ret === OK);
    }

    if(this.terminal?.store.getFreeCapacity() > this.creep.store.getUsedCapacity())
    {
      return (this.creep.transfer(this.terminal, res) === OK);
    }

    return false;
  }

  private TransferToStorage(res: ResourceConstant, keepAmount: number)
  {

    if(this.creep.store.getUsedCapacity() === 0 && this.terminal?.store[res] > keepAmount)
    {
      let amount = 0;
      //if(res === RESOURCE_ENERGY)
      {
          amount = this.terminal?.store[res] - keepAmount;
          if(amount > this.creep.store.getCapacity())
            amount = this.creep.store.getCapacity();
          const ret = this.creep.withdraw(this.terminal, res, amount);
          return;
      }
    }

    //if(this.storage?.store.getUsedCapacity() > this.creep.store.getUsedCapacity())
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
      if(this.storage?.store[resource] > this.creep.store.getCapacity())
        return (this.creep.withdraw(this.storage, resource) === OK);
    }

    if(this.factory?.store.getFreeCapacity() > this.creep.store.getUsedCapacity())
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

  private FactoryEmpty(commodity: ResourceConstant)
  {
    if(this.factory?.store.getUsedCapacity() === 0)
    {
      this.room.memory.factoryEmpty = true;
    }

    if(this.factory?.store.getUsedCapacity() > 0 && this.creep.store.getUsedCapacity() === 0)
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


    let commidtyAmount = 0;

    if(this.factory?.level)
    {
      if (this.metaData.roomName === 'E26S29') {
        console.log(this.name, 'FW', 1)
      }
      const checkCommodities: {res: ResourceConstant, amount:number}[] = [];
      let numberOfMakes = 0;
      for(const com in COMMODITIES)
      {
        const commodity = com as CommodityConstant;
        const data = COMMODITIES[(commodity as CommodityConstant)];
        if(data?.level === this.factory?.level)
        {
          if (this.metaData.roomName === 'E26S29')
            console.log(this.name, 'FW', 2, commodity);

          const goalAmount = this.factory.goalAmount();

          if(this.terminal?.store.getUsedCapacity(commodity) + this.storage?.store.getUsedCapacity(commodity) < goalAmount)
          {
            let haveAllComponents = true;
            //////console.log(this.name, 'FW lvl', commodity)
            numberOfMakes = Math.floor(POWER_INFO[PWR_OPERATE_FACTORY].duration / data.cooldown);
            for(const c in data.components)
            {
              const component = c as ResourceConstant;
              const totalInStore = this.storage?.store.getUsedCapacity(component) + this.terminal?.store.getUsedCapacity(component);
              const componentAmountNeeded = numberOfMakes * data.components[c];
              if (this.metaData.roomName === 'E26S29')
                console.log(this.name, 'FW', 2.1, component, totalInStore, componentAmountNeeded)
              if(totalInStore < componentAmountNeeded)
              {
                if(haveAllComponents && !COMMODITIES[component].level)
                {
                  const subData = COMMODITIES[(component as CommodityConstant)];
                  const subNumberOfMakes = Math.ceil(componentAmountNeeded / subData.amount);
                  let haveAllSubComponents = true;
                  for(const subC in subData.components)
                  {
                    const subComponent = subC as ResourceConstant;
                    if(this.terminal.store.getCapacity(subComponent) >= 5000)
                    {
                      const subTotalInStore = this.storage?.store.getUsedCapacity(subComponent) + this.terminal?.store.getUsedCapacity(subComponent);
                      const subComponentAmountNeeded = subNumberOfMakes * subData.components[subC];
                      if(subTotalInStore < subComponentAmountNeeded)
                      {
                        haveAllComponents = false;
                        haveAllSubComponents = false;
                      }
                    }
                  }

                  if(haveAllSubComponents && checkCommodities.indexOf({res: component, amount: subNumberOfMakes}) === -1)
                  {
                    if (this.metaData.roomName === 'E26S29')
                      console.log(this.name, 'FW', 2.2, component, subNumberOfMakes)

                    checkCommodities.push({res: component, amount: subNumberOfMakes});
                  }
                }
                else
                {
                  if (this.metaData.roomName === 'E26S29')
                    console.log(this.name, 'FW', 2.3, component)
                  haveAllComponents = false;
                }
              }
            }

            if (this.metaData.roomName === 'E26S29')
              console.log(this.name, 'FW', 2.4, haveAllComponents);
            //if(this.metaData.roomName === 'E26S29')
              //console.log(this.name, 'FW Test', commodity, haveAllComponents);

            if(haveAllComponents)
            {
              if (this.metaData.roomName === 'E26S29')
                console.log(this.name, 'FW', 2.5, commodity, numberOfMakes);
              checkCommodities.push({res: commodity, amount: numberOfMakes})
            }
          }
        }
      }

      let commands: Command[] = [];
      if (this.metaData.roomName === 'E26S29') {
        console.log(this.name, 'FW', 3, checkCommodities.length)
      }

      for(let checkCom of checkCommodities)
      {
        if(this.metaData.roomName === 'E26S29')
          console.log(this.name, 'FW',  4, checkCom.res, checkCom.amount);
        const data = COMMODITIES[(checkCom.res as CommodityConstant)];
        for(const c in data.components)
        {
          const component = c as ResourceConstant;
          const terminalAmount = this.terminal?.store.getUsedCapacity(component);
          const storageAmount = this.storage?.store.getUsedCapacity(component);
          const amountNeeded = checkCom.amount * data.components[c];
          if (this.metaData.roomName === 'E26S29')
            console.log(this.name, 'FW', 4.1, component, terminalAmount, storageAmount, amountNeeded);
          if(terminalAmount + storageAmount >= amountNeeded)
          {
            const foundIndex = commands.findIndex(c => c.resourceType === component);
            if(foundIndex === -1)
              commands = commands.concat(this.GenerateCommands(terminalAmount, storageAmount, amountNeeded, component));
            else
            {
              const command = this.GenerateCommands(terminalAmount, storageAmount, amountNeeded, component);
              if(command.length  === 1)
              {
                if(commands[foundIndex].origin === command[0].origin
                  && commands[foundIndex].destination === command[0].destination)
                  commands[foundIndex].amount += command[0].amount;
              }
            }
          }
        }
      }

      if(commands.length)
      {
       if(this.metaData.roomName === 'E26S29')
       {
         console.log(this.name, 'FW Check Commodities', this.room.memory.commoditiesToMake?.length);
         for(const command of commands)
         {
           console.log(this.name, 'command', command.resourceType, command.amount, command.origin)
         }
       }

      if(!this.room.memory.commoditiesToMake)
        this.room.memory.commoditiesToMake = [];

        if (this.metaData.roomName === 'E26S29')
        {
          for (let checkCom of checkCommodities)
          {
            console.log(this.name, 'Check Com', checkCom.res, checkCom.amount);
          }
        }

        if(haveEverything)
        {
          for(let checkCom of checkCommodities)
          {
            if(this.room.memory.commoditiesToMake.indexOf(checkCom.res as CommodityConstant) === -1)
              this.room.memory.commoditiesToMake.push(checkCom.res as CommodityConstant);
          }
          return commands;
        }
      }
      else
      {
        return this.BarWork();
      }
    }
    else
    {
      if(this.metaData.roomName === 'E26S29')
        console.log(this.name, 'Should not reach here for Factory level room bar work');
      return this.BarWork();
    }
  }

  private BarWork(): Command[]
  {
    let haveEverything = true;
    let commodityToMake: CommodityConstant;
    let commidtyAmount = 0;
    let commoditiesToMake: CommodityConstant[] = [];
    let commands: Command[] = [];

    if (this.metaData.roomName === 'E26S29')
      console.log(this.name, 'FW 0 LVL', 1)
    let depositAmount = 0;
    let deposit: ResourceConstant;
    let foundDeposit = false;
    for (const d of global.depositTypes) {
      //////console.log(this.name, 'FactoryWork', d);
      // Find commodity to make by one of its components
      for (const c in COMMODITIES)
      {
        const commodity = c as CommodityConstant;
        const data = COMMODITIES[(commodity)];
        if(!data.level)
        {
          const key = (Object.keys(data.components) as Array<ResourceConstant>).find(key => data.components[key] === '')
          if(data.components)
          if (_.contains(Object.keys(data.components), d))
          {
            if (this.terminal?.store.getUsedCapacity(d) > 500  && this.terminal.store.getUsedCapacity(commodity) < 10000)
            {
              commodityToMake = commodity as CommodityConstant;
              commidtyAmount = data.amount;
              depositAmount = data.components[d];
              deposit = d;
              foundDeposit = true;
              break;
            }
          }
      }
    }

    if (foundDeposit)
    {
      const numberOfMakes = Math.ceil(100 / commidtyAmount)
      const totalDepositAmount = numberOfMakes * depositAmount;
      //////console.log(this.name, 'FW', 0, commodityToMake, commidtyAmount, numberOfMakes, totalDepositAmount);

      const totalDepositInStore = this.terminal?.store.getUsedCapacity(deposit) + this.storage?.store.getUsedCapacity(deposit);
      if (totalDepositInStore >= totalDepositAmount) {
        const data = COMMODITIES[commodityToMake];
        for (const c in data.components) {
          const component = c as ResourceConstant;
          let totalAmount = data.components[component] * numberOfMakes;
          ////consolee.log(this.name, 'FW', 1, totalAmount, component);
          const terminalAmount = this.terminal?.store.getUsedCapacity(component);
          const storageAmount = this.storage?.store.getUsedCapacity(component);
          //////console.log(this.name, 'FW', 2, component, 'terminal', terminalAmount, 'storage', storageAmount)
          if (terminalAmount + storageAmount < totalAmount) {
            // Need to make some more of this component or we are sunk
            const needToMakeAmount = totalAmount - terminalAmount + storageAmount;
            const subTimesToProcess = Math.ceil(needToMakeAmount / COMMODITIES[component].amount)
            ////consolee.log(this.name, 'FW', 3, component, needToMakeAmount, COMMODITIES[component].amount, subTimesToProcess);
            const subData = COMMODITIES[component];
            for (const subC in subData.components) {
              const subComponent = subC as ResourceConstant;
              ////consolee.log(this.name, 'FW', 4, subC, subComponent);
              //let subTotalAmount = subData.amount * subTimesToProcess; // Think it should be this
              let subTotalAmount = subData.components[subComponent] * subTimesToProcess;
              ////consolee.log(this.name, 'FW', 5, subTotalAmount, subComponent);
              const subTerminalAmount = this.terminal?.store.getUsedCapacity(subComponent);
              const subStorageAmount = this.storage?.store.getUsedCapacity(subComponent);
              //////console.log(this.name, 'FW', 6, subComponent, 'terminal', subTerminalAmount, 'storage', subStorageAmount);
              if (subTerminalAmount + subStorageAmount < subTotalAmount)
                haveEverything = false;
              else {
                if (haveEverything) {
                  if (commoditiesToMake.indexOf(component as CommodityConstant) === -1)
                    commoditiesToMake.push(component as CommodityConstant);
                  const retCommands = this.GenerateCommands(subTerminalAmount, subStorageAmount, subTotalAmount, subComponent)
                  //////console.log(this.name, 'FW', 6.1, retCommands.length)
                  commands = commands.concat(retCommands);
                  //////console.log(this.name, 'FW', 6.2, commands.length);
                }
              }
            }
          }
          else {
            if (haveEverything) {
              if (commoditiesToMake.indexOf(commodityToMake as CommodityConstant) === -1)
                commoditiesToMake.push(commodityToMake as CommodityConstant);
              ////consolee.log(this.name, 'FW', 2.1)
              commands = commands.concat(this.GenerateCommands(terminalAmount, storageAmount, totalAmount, component));
              //////console.log(this.name, 'FW', 2.2, commands.length)
            }
          }
        }


        if (commands.length) {
          for (let command of commands) {
            //////console.log(this.name, 'command', command.resourceType, command.amount, command.origin);
          }

          let rawCommands = commands.reverse();
          let index = _.findIndex(rawCommands, rc => rc.resourceType === RESOURCE_ENERGY);
          let command: Command = { resourceType: RESOURCE_ENERGY, amount: 0, origin: this.storage.id, destination: this.factory.id };
          while (index !== -1) {
            const tempCommand = rawCommands.splice(index, 1);
            command.amount += tempCommand[0].amount;
            index = _.findIndex(rawCommands, rc => rc.resourceType === RESOURCE_ENERGY)
          }
          rawCommands.push(command);

          commands = rawCommands;

          //////console.log(this.name, 'Second commands');
          for (let command of commands) {
            //////console.log(this.name, 'command', command.resourceType, command.amount, command.origin);
          }
        }
      }
    }
    else {
      // Compressing commodities
      const data = COMMODITIES[this.room.memory.barType];
      for (const c in data.components) {
        const component = c as ResourceConstant;
        if (component !== RESOURCE_ENERGY) {
          if (this.terminal?.store.getUsedCapacity(component) >= 10000
            && this.storage?.store.getUsedCapacity(component) - 100000 >= data.components[component]) {
            const storeAmount = Math.floor(this.storage.store.getUsedCapacity(component) - 90000);
            let numberOfMakes = Math.floor(storeAmount / data.components[component]);
            const maxMakes = Math.floor(this.factory.store.getCapacity() / 700);
            if (numberOfMakes > maxMakes)
              numberOfMakes = maxMakes;
            const mineralNeeded = data.components[component] * numberOfMakes
            const energyNeeded = data.components.energy * numberOfMakes;
            console.log(this.name, 'Build Bars', component, numberOfMakes, mineralNeeded, energyNeeded, 'Max number of makes', maxMakes, this.storage.store.getUsedCapacity(RESOURCE_ENERGY))
            if (this.storage.store.getUsedCapacity(RESOURCE_ENERGY) >= energyNeeded) {
              if (commoditiesToMake.indexOf(this.room.memory.barType) === -1)
                commoditiesToMake.push(this.room.memory.barType);

              commands = commands.concat(this.GenerateCommands(0, mineralNeeded, mineralNeeded, component));
              commands = commands.concat(this.GenerateCommands(0, energyNeeded, energyNeeded, RESOURCE_ENERGY));
              haveEverything = true;
            }
          }
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
      if(totalAmount > 0)
      {
        commands.push({destination: this.factory.id, resourceType: component, origin: this.terminal.id, amount: totalAmount});
        totalAmount = 0;
      }
    }
    else
    {
      if(terminalAmount > 0)
      {
        commands.push({destination: this.factory.id, resourceType: component, origin: this.terminal.id, amount: terminalAmount});
        totalAmount -= terminalAmount;
      }
    }

    if(totalAmount > 0 && storageAmount >= totalAmount)
    {
      if(totalAmount > 0)
      {
        commands.push({destination: this.factory.id, resourceType: component, origin: this.storage.id, amount: totalAmount});
        totalAmount = 0;
      }
    }

    return commands
  }

  private FactoryProduction() : boolean
  {

    // this.FactoryEmpty(RESOURCE_CONDENSATE);

    // this.room.memory.commands = undefined;
    // this.room.memory.commandIndex = 0;
    // this.room.memory.startedCommands = undefined;
    // this.room.memory.commoditiesIndex = 0;
    // this.room.memory.commoditiesToMake = undefined;

    if (this.metaData.roomName === 'E26S29')
    {
      console.log(this.name, 'FP', 1, this.room.memory.commoditiesToMake, this.room.memory.commoditiesIndex);
    }

    if(!this.room.memory.commands?.length)
    {
      if (this.metaData.roomName === 'E26S29')
      {
        console.log(this.name, 'FP', 2)
      }
      //////console.log(this.name, 'Time to start checking for commands');
      this.room.memory.commandIndex = 0;
      this.room.memory.commoditiesIndex = 0;
      this.room.memory.commands = this.FactoryWork();

      if (this.metaData.roomName === 'E26S29')
      {
        console.log(this.name, 'FP', 2.1, this.room.memory.commands?.length);
      }

      if(this.room.memory.commands?.length)
        return true;
      else
        return false;
      //////console.log(this.name, 'Time to start checking for commands', 1, this.room.memory.commands?.length)
    }
    else if(this.room.memory.commandIndex === this.room.memory.commands?.length)
    {
      if (this.metaData.roomName === 'E26S29')
      {
        console.log(this.name, 'FP', 3)
      }

      if(!this.factory.cooldown)
      {
        const comToMake = this.room.memory.commoditiesToMake[this.room.memory.commoditiesIndex];
        if (this.metaData.roomName === 'E26S29')
          console.log(this.name, 'FP', 3.1, comToMake, this.room.memory.commoditiesToMake?.length, this.room.memory.commoditiesIndex)

        if(COMMODITIES[comToMake]?.level && this.factory.effects.filter(e => e.effect = PWR_OPERATE_FACTORY)?.length === 0
        && Object.keys(COMMODITIES[comToMake].components).length <= Object.keys(this.factory?.store).length)
        {
          const powerCreep = Game.powerCreeps[this.metaData.roomName + '-Operator'];
          if(powerCreep?.store.getUsedCapacity(RESOURCE_OPS) >= 100 || this.storage.store.getUsedCapacity(RESOURCE_OPS) >= 100)
          {
            if (this.metaData.roomName === 'E26S29')
              console.log(this.name, 'FP', 3.2)
            const powerProcess = this.kernel.getProcessByName('pclf-' + this.metaData.roomName + '-Operator')
            if(powerProcess instanceof PowerCreepLifetimeProcess)
            {
              if (this.metaData.roomName === 'E26S29')
                console.log(this.name, 'FP', 3.3)
              powerProcess.metaData.turnOnFactory = true;
            }

            return true;
          }
          else
            return false;
        }

        if(this.room.memory.commoditiesToMake?.length === this.room.memory.commoditiesIndex)
        {
          if (this.metaData.roomName === 'E26S29')
            console.log(this.name, 'FP', 3.4, this.room.memory.commoditiesToMake[this.room.memory.commoditiesIndex - 1])
          this.FactoryEmpty(this.room.memory.commoditiesToMake[this.room.memory.commoditiesIndex-1]);
          if(this.factory.store.getUsedCapacity() === 0)
          {
            this.room.memory.commands = undefined;
            this.room.memory.commandIndex = 0;
            this.room.memory.startedCommands = undefined;
            this.room.memory.commoditiesIndex = 0;
            this.room.memory.commoditiesToMake = undefined;
          }
          return true;;
        }
        else
        {
          const ret = this.factory.produce(comToMake);

          if (this.metaData.roomName === 'E26S29')
            console.log(this.name, 'FP', 3.5, ret)

          if (ret === ERR_NOT_ENOUGH_RESOURCES)
          {
            //////console.log(this.name, 'Factory empty/reset', 1.2, this.room.memory.commoditiesIndex)
            if(this.room.memory.commoditiesIndex < comToMake.length)
              this.room.memory.commoditiesIndex++;

            return true;
          }
          else if(ret === ERR_BUSY)
          {
            const amount = COMMODITIES[this.room.memory.commoditiesToMake[this.room.memory.commoditiesToMake?.length - 1]].amount;
            if(this.factory.store.getUsedCapacity(this.room.memory.commoditiesToMake[this.room.memory.commoditiesToMake?.length - 1]) % amount === 0)
            {
              if (this.room.memory.commoditiesIndex < comToMake.length)
                this.room.memory.commoditiesIndex++;
            }
          }
        }
      }
    }
    else if(this.room.memory.startedCommands || (!this.room.memory.startedCommands && this.creep.store.getUsedCapacity() === 0))
    {
      if (this.metaData.roomName === 'E26S29')
      {
        console.log(this.name, 'FP', 4)
        const commands = this.room.memory.commands;

        for(let command of commands)
        {
          console.log(this.name, 'FP', 4.1, command.resourceType, command.amount, command.origin);
        }
      }

      //console.log(this.name, 'Factory start commands', this.room.memory.commandIndex)
      this.room.memory.startedCommands = true;
      let commandIndex = this.room.memory.commandIndex;
      let command = this.room.memory.commands[commandIndex];

      if(this.creep.store.getUsedCapacity() !== this.creep.store.getUsedCapacity(command.resourceType))
      {
        if (this.metaData.roomName === 'E26S29')
          console.log(this.name, 'FP', 4.1)
        //console.log(this.name, 'Empty creep', 1)
        this.creep.transferEverything(this.storage);
        return true;
      }

      if(this.creep.store.getUsedCapacity() === 0)
      {
        const origin = <Structure>Game.getObjectById(command.origin);
        const amount = (this.creep.store.getCapacity() > command.amount) ? command.amount : this.creep.store.getCapacity();
        if(origin instanceof StructureTerminal || origin instanceof StructureStorage)
        {
          if(origin.store.getUsedCapacity(command.resourceType) >=  amount)
          {
            if (this.metaData.roomName === 'E26S29')
              console.log(this.name, 'FP', 4.2, origin, command.resourceType, amount)
            this.creep.withdraw(origin, command.resourceType, amount);
            return true;
          }
        }
      }
      else if(this.creep.store.getUsedCapacity() > 0)
      {
        if (this.metaData.roomName === 'E26S29')
          console.log(this.name, 'FP', 4.3)
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

          return true;
        }

        return false;
      }
      if (this.metaData.roomName === 'E26S29')
        console.log(this.name, 'FP', 4.4)
    }

    if (this.metaData.roomName === 'E26S29')
      console.log(this.name, 'FP', 5)
    return false;
  }
}
