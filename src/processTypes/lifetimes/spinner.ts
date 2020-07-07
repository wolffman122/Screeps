import { LifetimeProcess } from "os/process";
import { KEEP_AMOUNT, ENERGY_KEEP_AMOUNT, MINERALS_RAW, REAGENT_LIST, PRODUCT_LIST_WITH_AMOUNTS, MINERAL_KEEP_AMOUNT } from "../buildingProcesses/mineralTerminal";

export class SpinnerLifetimeProcess extends LifetimeProcess {
  type = 'slf';

  run() {
    let creep = this.getCreep()
    this.logName = 'em-s-E38S46-23861232';
    this.logging = true;

    if (!creep) {
      return;
    }
    if (creep.room.memory.shutdown) {
      this.completed = true;
      return;
    }

    if (this.logging && creep.name === this.logName)
      console.log(this.name, 0.1);

    let flag = Game.flags['DJ-' + creep.pos.roomName];
    let mineral = <Mineral>creep.room.find(FIND_MINERALS)[0];
    const room = flag.room;
    let skMinerals: Mineral[] = [];

    if (creep.name === 'em-s-E35S51-23283791')
      console.log(this.name, 'Start!!!!!!!!!!!!!!!!!');

    if (flag) {

      let flags = room.find(FIND_FLAGS);
      // Look for SK minerals
      if (flags) {
        _.forEach(flags, (f) => {
          if (f.color === COLOR_YELLOW && f.secondaryColor === COLOR_YELLOW) {
            const rName = f.name.split('-')[0];
            const skRoom = Game.rooms[rName];
            if (skRoom) {
              let skMineral = <Mineral>skRoom.find(FIND_MINERALS)[0];
              if (skMineral)
                skMinerals.push(skMineral);
            }
          }
        })
      }

      if (!creep.pos.inRangeTo(flag, 0)) {
        creep.travelTo(flag);
        return;
      }
    }

    const data = this.kernel.data.roomData[creep.room.name];

    const regList: string[] = []
    _.forEach(Object.keys(REAGENT_LIST), (r) => {
      regList.push(r);
    });
    let resources = _.union(MINERALS_RAW, regList);
    const terminal = creep.room.terminal;
    const storage = creep.room.storage;
    const factory = data.factory

    if (!storage) {
      console.log(this.name, 'spinner problem')
      return;
    }

    // Empty Creep
    if (creep.store.getUsedCapacity() === 0) {
      if (this.logging && creep.name === this.logName)
        console.log(this.name, storage, storage.id);

      if (creep.name === 'em-s-E35S51-23291496') {
        console.log(this.name, 'Should be special mining', room.memory.specialMining)
        room.memory.depositMining = true;
      }

      // Special mining to make bars
      if (mineral.mineralType === RESOURCE_CATALYST && storage.store.getUsedCapacity(RESOURCE_CATALYST) > 100000
        && factory?.store.getFreeCapacity() >= 600) {
        if (creep.name === 'em-s-E35S51-23283791')
          console.log(this.name, '??????????????');
        let numberOfBars = factory.store.getUsedCapacity(RESOURCE_CATALYST) / 500;
        if (factory.store.getUsedCapacity(RESOURCE_ENERGY) < (numberOfBars * 200)) {
          if (creep.name === 'em-s-E35S51-23283791')
            console.log(this.name, 'Getting energy for bars');
          creep.withdraw(storage, RESOURCE_ENERGY)
          creep.memory.target = factory.id;
          return;
        }

        let amount = (storage.store.getUsedCapacity(RESOURCE_CATALYST) - 100000 > creep.store.getCapacity()) ? creep.store.getCapacity() : (storage.store.getUsedCapacity(RESOURCE_CATALYST) - 100000);
        if (creep.name === 'em-s-E35S51-23283791')
          console.log(this.name, 'Moving X for bars !!!!!!!!!!!!!!', amount);
        creep.withdraw(storage, RESOURCE_CATALYST, amount)
        creep.memory.target = factory.id;
        return;
      }

      // if(room.memory.depositMining)
      // {
      //   if(factory?.store[room.memory.depositType] > 100)
      //   {
      //     if(room.memory.instruct === undefined)
      //     {
      //       room.memory.instruct = {};
      //     }

      //     if(factory.level === undefined)
      //     {
      //       room.memory.instruct[RESOURCE_CONDENSATE] = 100;
      //     }

      //     console.log(this.name, 'Problem')

      //     let recipe: Recipe;
      //     if(room.memory.componentInstruct && Object.keys(room.memory.componentInstruct).length > 0)
      //     {
      //       console.log(this.name, 'Component Lookup', room.memory.resourceToProduce);
      //       recipe = this.factoryRecipe(room);
      //     }
      //     else if(Object.keys(room.memory.instruct).length > 0)
      //     {
      //       console.log(this.name, 'Main Lookup')
      //       recipe = this.factoryRecipe(room);
      //     }

      //     let numberOfComponents = Object.keys(recipe).length;

      //     for(let i in recipe)
      //     {
      //       const resource = i as CommodityConstant | MineralConstant | RESOURCE_GHODIUM;
      //       if(factory?.store[i] < recipe[i])
      //       {
      //         if(terminal?.store[i] < recipe[i])
      //         {
      //           if(storage?.store[i] < recipe[i])
      //           {
      //             console.log('Nothing in storage');
      //             // Don't have the resource need to construct it
      //             if(room.memory.componentInstruct === undefined)
      //               room.memory.componentInstruct = {};

      //             room.memory.resourceToProduce = resource;
      //             room.memory.amoutToProduce = recipe[i];
      //             room.memory.componentInstruct[i] = recipe[i];
      //           }
      //           else
      //           {
      //             const ret = creep.withdraw(storage, resource, recipe[i]);
      //             console.log(this.name, 'Taking out of storage', i, ret)
      //             creep.memory.target = factory.id;
      //           }
      //         }
      //         else
      //         {
      //           const ret = creep.withdraw(terminal, resource, recipe[i])
      //           console.log(this.name, 'Taking out of terminal', i, ret)
      //           creep.memory.target = factory.id;
      //         }
      //       }
      //       else
      //       {
      //         numberOfComponents--;
      //         console.log(this.name, 'Number of components', numberOfComponents);
      //         if(factory.store[room.memory.resourceToProduce] >= room.memory.amoutToProduce)
      //         {
      //           console.log(this.name, 'Resetting up one level');
      //           room.memory.resourceToProduce = undefined;
      //           room.memory.amoutToProduce = undefined;
      //           room.memory.componentInstruct = undefined;
      //         }

      //         if(numberOfComponents == 0)
      //         {
      //           if(factory.cooldown === 0)
      //           {
      //             if(room.memory.componentInstruct !== undefined)
      //             {
      //               const ret = factory.produce(room.memory.resourceToProduce);
      //               console.log(this.name, 'Factory produce', ret, room.memory.resourceToProduce)
      //             }
      //             else
      //             {
      //               let resource = Object.keys(room.memory.instruct)[0] as CommodityConstant | MineralConstant | RESOURCE_GHODIUM;
      //               factory.produce(resource)
      //             }
      //           }
      //         }
      //       }
      //     }
      //   }
      //   else
      //   {
      //     room.memory.depositMining = false;
      //   }
      // }

      // Full storage
      if (storage.store.getUsedCapacity() >= storage.store.getCapacity() * .99) {
        if (creep.room.name === 'E45S53' && terminal.store.getUsedCapacity(RESOURCE_ENERGY) > 100000
          && factory?.store.getFreeCapacity() > 600) {
          creep.withdraw(terminal, RESOURCE_ENERGY)
          creep.memory.target = factory.id;
          return;
        }

        let target = (storage.store[RESOURCE_ENERGY] < storage.store[mineral.mineralType]) ? mineral.mineralType : RESOURCE_ENERGY;
        if (target) {
          creep.withdraw(storage, target);
          creep.memory.target = storage.id;
          return;
        }
      }

      let link = data.storageLink;
      if (this.logging && creep.name === this.logName)
        console.log(this.name, 1, link.id, link.energy > 0)

      if (link && link.energy > 0) {
        if (!creep.pos.isNearTo(link)) {
          creep.travelTo(flag);
          return;
        }
        creep.memory.target = link.id;
        creep.withdraw(link, RESOURCE_ENERGY);
        return;
      }

      if (factory?.store.getUsedCapacity(RESOURCE_PURIFIER) >= creep.store.getCapacity()
        && factory?.store.getUsedCapacity(RESOURCE_PURIFIER) < terminal?.store.getFreeCapacity()) {
        creep.withdraw(factory, RESOURCE_PURIFIER);
        creep.memory.target = storage.id;
        return;
      }

      if (this.logging && creep.name === this.logName)
        console.log(this.name, 2)

      let target: string;
      let max = KEEP_AMOUNT;
      let retValue: string;

      if (terminal) {
        target = _.find(Object.keys(terminal.store), (r) => {
          if (r === RESOURCE_ENERGY && terminal.store[r] < 75000)
            return true;
        });
      }

      if (this.logging && creep.name === this.logName)
        console.log(this.name, 3)

      if (target === RESOURCE_ENERGY) {
        target = "";
      }
      else {
        if (terminal) {
          target = _.find(Object.keys(terminal.store), (r) => {
            if (r === RESOURCE_ENERGY && terminal.store[r] > 75000)
              return r;

            if (r !== RESOURCE_ENERGY && terminal.store[r] > max) {
              max = terminal.store[r];
              retValue = r;
            }
            else if (_.find(PRODUCT_LIST_WITH_AMOUNTS, (x) => x.res === r)) {
              let amount = storage.store[r] ? storage.store[r] : 0;
              if (amount < 1000) {
                max = terminal.store[r];
                retValue = r;
              }
            }

            if (max > 0 && retValue) {
              return retValue;
            }
          });
        }
      }

      if (this.logging && creep.name === this.logName)
        console.log(this.name, 4)
      if (target && target.length > 0) {
        if (this.logging && creep.name === this.logName)
          console.log(this.name, 5, target)
        if (target === RESOURCE_ENERGY) {
          let amount = terminal?.store[target] - 75000 < creep.carryCapacity ? terminal.store[target] - 75000 : creep.carryCapacity;
          creep.withdraw(terminal, target, amount);
          creep.memory.target = terminal.id;
          return;
        }
        else {
          // Mineral and production decision
          if (_.find(PRODUCT_LIST_WITH_AMOUNTS, (r) => r.res === target)) {
            let amount = terminal.store[target] - 1000 < creep.carryCapacity ? terminal.store[target] - 1000 : creep.carryCapacity;
            const ret = creep.withdraw(terminal, <ResourceConstant>target, amount);
            if (this.logging && creep.name === this.logName)
              console.log(this.name, 5.5, target, ret, target, amount)
            creep.memory.target = terminal.id;
            return;
          }
          else {
            if (this.logging && creep.name === this.logName)
              console.log(this.name, 5.6)
            if (factory?.store.getUsedCapacity(RESOURCE_BATTERY) >= creep.store.getCapacity()) {
              if (this.logging && creep.name === this.logName)
                console.log(this.name, 5.7)
              creep.withdraw(factory, RESOURCE_BATTERY);
              creep.memory.target = storage.id;
              return;
            }

            let amount = terminal.store[target] - KEEP_AMOUNT < creep.carryCapacity ? terminal.store[target] - KEEP_AMOUNT : creep.carryCapacity;
            const ret = creep.withdraw(terminal, <ResourceConstant>target, amount);

            if (this.logging && creep.name === this.logName)
              console.log(this.name, 5.8, ret, target, amount)
            creep.memory.target = terminal.id;
            return;
          }
        }
      }
      else {
        if (this.logging && creep.name === this.logName)
          console.log(this.name, 6)
        target = _.find(Object.keys(storage.store), (r) => {
          if ((r === RESOURCE_ENERGY && terminal.store[r] < 75000 && storage.store[r] >= ENERGY_KEEP_AMOUNT)
            || (r === RESOURCE_ENERGY && terminal.store[r] < 10000 && storage.store[r] >= 10000))
            return r;
          //else if(r === RESOURCE_BATTERY && (terminal.store[r] < 10000 && storage.store[r] > 0)
          //return r;
        });

        if (creep.name === 'em-s-E38S46-23859733')
          console.log(this.name, 'Resource return from storage ', target);

        if (target && target.length > 0) {
          if (target === RESOURCE_ENERGY) {
            let amount = 75000 - terminal.store[target] <= creep.carryCapacity ? 75000 - terminal.store[target] : creep.carryCapacity;
            let ret = creep.withdraw(storage, target, amount);
            creep.memory.target = storage.id;
            return;
          }
          else if (target === RESOURCE_BATTERY) {
            let amount = 10000 - terminal.store[target] <= creep.store.getUsedCapacity() ? 10000 - terminal.store[target] : creep.store.getUsedCapacity();
            creep.withdraw(storage, target as ResourceConstant, amount);
            creep.memory.target = storage.id;
            return;
          }
        }
        else if (storage.store[mineral.mineralType] > KEEP_AMOUNT && terminal.store[mineral.mineralType] < KEEP_AMOUNT) {
          creep.withdraw(storage, mineral.mineralType)
          creep.memory.target = storage.id;
          return;
        }
        else {
          if (this.logging && creep.name === this.logName)
            console.log(this.name, 6.5)

          let ret = -1;
          for (let productInfo of PRODUCT_LIST_WITH_AMOUNTS) {
            let res = productInfo.res;
            if (terminal.store[res] < MINERAL_KEEP_AMOUNT
              && storage.store[res] > 0) {
              ret = creep.withdraw(storage, res);
              if (this.logging && creep.name === this.logName)
                console.log(this.name, 6.6, ret)
              creep.memory.target = storage.id;
              break;
            }
          }

          if (ret === OK) {
            return;
          }
          else {
            _.forEach(skMinerals, (m) => {
              if (storage.store[m.mineralType] > KEEP_AMOUNT && terminal.store[m.mineralType] < KEEP_AMOUNT) {
                creep.withdraw(storage, m.mineralType)
                creep.memory.target = storage.id;
                return;
              }
            })
          }
        }
      }
      if (this.logging && creep.name === this.logName)
        console.log(this.name, 5)

      // Put deposit from terminal or storage into factory
      if (room.memory.depositType) {
        if (storage.store[room.memory.depositType] > 0) {
          creep.say('🟪');
          creep.withdraw(storage, room.memory.depositType);
          creep.memory.target = factory.id;
          return;
        }

        if (terminal.store[room.memory.depositType] > 0) {
          creep.say('🟪');
          creep.withdraw(terminal, room.memory.depositType);
          creep.memory.target = factory.id;
          return;
        }
      }

      if (storage?.store[RESOURCE_CONDENSATE] > 0) {
        creep.withdraw(storage, RESOURCE_CONDENSATE);
        creep.memory.target = storage.id
      }

      // Need a way to move over everything but bars to Terminal.
      if (factory?.store[RESOURCE_CONDENSATE] > 0) {
        creep.withdraw(factory, RESOURCE_CONDENSATE);
        creep.memory.target = storage.id
      }
    }
    else {

      // Full Creep
      let target = Game.getObjectById(creep.memory.target) as Structure;

      if (creep.name === 'em-s-E39S35-17841311')
        console.log('Spinner problem', 8, target.id)


      if (target instanceof StructureTerminal) {
        creep.transferEverything(storage);
      }
      else if (target instanceof StructureStorage) {
        if (creep.name === 'em-s-E32S44-21110523')
          console.log(this.name, 'store', 8)
        creep.transferEverything(terminal);
      }
      else if (target instanceof StructureLink) {
        if (terminal && terminal.store[RESOURCE_ENERGY] < 75000)
          creep.transfer(terminal, RESOURCE_ENERGY);
        else
          creep.transfer(storage, RESOURCE_ENERGY);
      }
      else if (target instanceof StructureFactory) {
        creep.transferEverything(target);
      }
    }

    if (factory?.store.getUsedCapacity(RESOURCE_ENERGY) > 600 && factory.cooldown === 0) {
      factory.produce(RESOURCE_BATTERY);
    }

    if (factory?.store.getUsedCapacity(RESOURCE_CATALYST) >= 500
      && factory?.store.getUsedCapacity(RESOURCE_ENERGY) >= 200
      && factory.cooldown === 0) {
      factory.produce(RESOURCE_PURIFIER);
    }
  }

  private factoryRecipe(room: Room): Recipe {
    let instruct: Instruction;
    if (room.memory.componentInstruct) {
      instruct = room.memory.componentInstruct;
    }
    else {
      instruct = room.memory.instruct
    }

    let recipe: Recipe = {};

    // if(creep.name === 'em-s-E35S51-23260676')
    //   console.log(this.name, 'Start recipe list', recipe);

    for (let i in instruct) {
      console.log(this.name, i, instruct[i], COMMODITIES[i]);
      if (instruct[i] && COMMODITIES[i]) {
        console.log(this.name, i, 'Time to look up components');
        for (let ed in COMMODITIES[i].components) {
          if (recipe[ed] === undefined) {
            recipe[ed] = COMMODITIES[i].components[ed];
          }
          else {
            recipe[ed] += COMMODITIES[i].components[ed];
          }
        }
      }
    }

    return recipe;
  }
}
