import { LifetimeProcess } from "os/process";
import { KEEP_AMOUNT, ENERGY_KEEP_AMOUNT, MINERALS_RAW, REAGENT_LIST, PRODUCT_LIST } from "../buildingProcesses/mineralTerminal";

export class  SpinnerLifetimeProcess extends LifetimeProcess
{
  type = 'slf';

  run()
  {
    let creep = this.getCreep()
    this.logName = 'em-s-E35S51-21553193';
    this.logging = false;

    if(!creep)
    {
      return;
    }

    let flag = Game.flags['DJ-' + creep.pos.roomName];
    let mineral = <Mineral>creep.room.find(FIND_MINERALS)[0];

    let skMinerals: Mineral[] = [];

    if(flag)
    {
      let room = flag.room;
      let flags = room.find(FIND_FLAGS);
      // Look for SK minerals
      if(flags)
      {
        _.forEach(flags, (f)=> {
          if(f.color === COLOR_YELLOW && f.secondaryColor === COLOR_YELLOW)
          {
            const rName = f.name.split('-')[0];
            const skRoom = Game.rooms[rName];
            if(skRoom)
            {
            let skMineral = <Mineral>skRoom.find(FIND_MINERALS)[0];
            if(skMineral)
              skMinerals.push(skMineral);
            }
          }
        })
      }

      if(!creep.pos.inRangeTo(flag, 0))
      {
        creep.travelTo(flag);
        return;
      }
    }

    let data = this.kernel.data.roomData[creep.room.name];

    let regList: string[] = []
    _.forEach(Object.keys(REAGENT_LIST), (r) => {
        regList.push(r);
    });
    let resources = _.union(MINERALS_RAW, regList);
    let terminal = creep.room.terminal;
    let storage = creep.room.storage;
    let factory = data.factory

    if(!storage)
    {
      console.log(this.name,'spinner problem')
      return;
    }

    // Empty Creep
    if(_.sum(creep.carry) === 0)
    {
      if(this.logging && creep.name === this.logName)
        console.log(this.name, storage, storage.id);

      // Full storage
      if(storage.store.getUsedCapacity() >= storage.store.getCapacity() * .99)
      {
        if(creep.room.name === 'E45S53' && terminal.store.getUsedCapacity(RESOURCE_ENERGY) > 100000
        && factory?.store.getFreeCapacity() > 600)
        {
          creep.withdraw(terminal, RESOURCE_ENERGY)
          creep.memory.target = factory.id;
          return;
        }

        let target = (storage.store[RESOURCE_ENERGY] < storage.store[mineral.mineralType]) ? mineral.mineralType : RESOURCE_ENERGY;
        if(target)
        {
          creep.withdraw(storage, target);
          creep.memory.target = storage.id;
          return;
        }
      }

      let link = data.storageLink;
      if(this.logging && creep.name === this.logName)
        console.log(this.name, 1, link.id, link.energy > 0)

      if(link && link.energy > 0)
      {
        if(!creep.pos.isNearTo(link))
        {
          creep.travelTo(flag);
          return;
        }
        creep.memory.target = link.id;
        creep.withdraw(link, RESOURCE_ENERGY);
        return;
      }

      if(this.logging && creep.name === this.logName)
        console.log(this.name, 2)

      let target: string;
      let max = KEEP_AMOUNT;
      let retValue: string;

      target = _.find(Object.keys(terminal.store), (r) => {
        if(r === RESOURCE_ENERGY && terminal.store[r] < 75000)
          return true;
      });

      if(this.logging && creep.name === this.logName)
        console.log(this.name, 3)

      if(target === RESOURCE_ENERGY)
      {
        target = "";
      }
      else
      {
        if(this.logging && creep.name === this.logName)
        console.log(this.name, 3.5)
        target = _.find(Object.keys(terminal.store), (r) => {
          if(r === RESOURCE_ENERGY && terminal.store[r] > 75000)
            return r;

          if(r !== RESOURCE_ENERGY && terminal.store[r] > max)
          {
            max = terminal.store[r];
            retValue = r;
          }
          else if(_.includes(PRODUCT_LIST, r))
          {
            let amount = storage.store[r] ? storage.store[r] : 0;
            if(amount < 1000)
            {
              max = terminal.store[r];
              retValue = r;
            }
          }
          else if(!_.include(MINERALS_RAW, r) && r !== RESOURCE_ENERGY)
          {
            if(terminal.room.name === 'E35S51')
            {
              //console.log(this.name, 'Transfer issue', r)
              //return r;
            }
          }

          if(max > 0 && retValue)
          {
            return retValue;
          }
        });
      }

      if(this.logging && creep.name === this.logName)
        console.log(this.name, 4)
      if(target && target.length > 0)
      {
        if(target === RESOURCE_ENERGY)
        {
          let amount = terminal.store[target] - 75000 < creep.carryCapacity ? terminal.store[target] - 75000 : creep.carryCapacity;
          creep.withdraw(terminal, target, amount);
          creep.memory.target = terminal.id;
          return;
        }
        else
        {
          // Mineral and production decision
          if(_.includes(PRODUCT_LIST, target))
          {
            let amount = terminal.store[target] - 1000 < creep.carryCapacity ? terminal.store[target] - 1000 : creep.carryCapacity;
            creep.withdraw(terminal, <ResourceConstant>target, amount);
            creep.memory.target = terminal.id;
            return;
          }
          else
          {
            if(factory?.store.getUsedCapacity(RESOURCE_BATTERY) >= creep.store.getCapacity())
            {
              creep.withdraw(factory, RESOURCE_BATTERY);
              creep.memory.target = storage.id;
              return;
            }

            let amount = terminal.store[target] - KEEP_AMOUNT < creep.carryCapacity ? terminal.store[target] - KEEP_AMOUNT : creep.carryCapacity;
            creep.withdraw(terminal, <ResourceConstant>target, amount);
            creep.memory.target = terminal.id;
            return;
          }
        }
      }
      else
      {
        target = _.find(Object.keys(storage.store), (r) => {
          if((r === RESOURCE_ENERGY && terminal.store[r] < 75000 && storage.store[r] >= ENERGY_KEEP_AMOUNT)
            || (r === RESOURCE_ENERGY && terminal.store[r] < 10000 && storage.store[r] >= 10000))
            return r;
        });

        if(target && target.length > 0)
        {
          if(target === RESOURCE_ENERGY)
          {
            let amount = 75000 - terminal.store[target] <= creep.carryCapacity ? 75000 - terminal.store[target] : creep.carryCapacity;
            let ret = creep.withdraw(storage, target, amount);
            creep.memory.target = storage.id;
            return;
          }
        }
        else if (storage.store[mineral.mineralType] > KEEP_AMOUNT && terminal.store[mineral.mineralType] < KEEP_AMOUNT)
        {
          creep.withdraw(storage, mineral.mineralType)
          creep.memory.target = storage.id;
          return;
        }
        else
        {
          _.forEach(skMinerals, (m)=>{
            if(storage.store[m.mineralType] > KEEP_AMOUNT && terminal.store[m.mineralType] < KEEP_AMOUNT)
            {
              creep.withdraw(storage, m.mineralType)
              creep.memory.target = storage.id;
              return;
            }
          })
        }
      }
      if(this.logging && creep.name === this.logName)
        console.log(this.name, 5)
    }
    else
    {

      // Full Creep
      let target = Game.getObjectById(creep.memory.target) as Structure;

      if(creep.name === 'em-s-E39S35-17841311')
        console.log('Spinner problem', 8, target.id)


      if(target instanceof StructureTerminal)
      {
        creep.transferEverything(storage);
      }
      else if(target instanceof StructureStorage)
      {
        if(creep.name === 'em-s-E32S44-21110523')
        console.log(this.name, 'store', 8)
        creep.transferEverything(terminal);
      }
      else if(target instanceof StructureLink)
      {
        if(terminal && terminal.store[RESOURCE_ENERGY] < 75000)
          creep.transfer(terminal, RESOURCE_ENERGY);
        else
          creep.transfer(storage, RESOURCE_ENERGY);
      }
      else if(creep.room.name === 'E45S53' && target instanceof StructureFactory)
      {
        creep.transferEverything(target);
      }
    }

    if(factory?.store.getUsedCapacity(RESOURCE_ENERGY) > 600 && factory.cooldown === 0)
    {
      factory.produce(RESOURCE_BATTERY);
    }
  }
}
