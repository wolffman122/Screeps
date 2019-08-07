import { LifetimeProcess } from "os/process";
import { CollectProcess } from "processTypes/creepActions/collect";
import { DeliverProcess } from "processTypes/creepActions/deliver";
import { KEEP_AMOUNT, ENERGY_KEEP_AMOUNT, MINERALS_RAW, REAGENT_LIST } from "../buildingProcesses/mineralTerminal";

export class  SpinnerLifetimeProcess extends LifetimeProcess
{
  type = 'slf';

  run()
  {
    let creep = this.getCreep()
    this.logName = 'em-s-E45S53-18640980';
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
      if(flags)
      {
        _.forEach(flags, (f)=> {
          if(f.color === COLOR_YELLOW && f.secondaryColor === COLOR_YELLOW)
          {
            const rName = f.name.split('-')[0];
            console.log(this.name, rName);
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

   // if(creep.room.name === 'E43S55')
    {
      let data = this.kernel.data.roomData[creep.room.name];

      let regList: string[] = []
      _.forEach(Object.keys(REAGENT_LIST), (r) => {
          regList.push(r);
      });
      let resources = _.union(MINERALS_RAW, regList);
      let terminal = creep.room.find(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_TERMINAL})[0] as StructureTerminal;
      let storage = creep.room.storage;

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

        if(_.sum(storage.store) >= storage.storeCapacity * .99)
        {
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
          target = _.find(Object.keys(terminal.store), (r) => {
            if(r === RESOURCE_ENERGY && terminal.store[r] > 75000)
              return r;

            if(r !== RESOURCE_ENERGY && terminal.store[r] > max)
            {
              max = terminal.store[r];
              retValue = r;
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
            if(creep.name === 'em-s-E39S35-17841311')
        console.log('Spinner problem', 4)
            let amount = terminal.store[target] - KEEP_AMOUNT < creep.carryCapacity ? terminal.store[target] - KEEP_AMOUNT : creep.carryCapacity;
            creep.withdraw(terminal, <ResourceConstant>target, amount);
            creep.memory.target = terminal.id;
            return;
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
            if(creep.name === 'em-s-E39S35-17841311')
        console.log('Spinner problem', 6)
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
            if(creep.name === 'em-s-E39S35-17841311')
        console.log('Spinner problem', 7)
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
        if(creep.name === 'em-s-E39S35-17841311')
        console.log('Spinner problem', 8)
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
          if(creep.name === 'em-s-E39S35-17841311')
        console.log('Spinner problem', 9)
          creep.transferEverything(terminal);
        }
        else if(target instanceof StructureLink)
        {
          if(terminal.store[RESOURCE_ENERGY] < 75000)
            creep.transfer(terminal, RESOURCE_ENERGY);
          else
            creep.transfer(storage, RESOURCE_ENERGY);
        }
      }
    }
    /*else
    {
      if(_.sum(creep.carry) === 0)
      {
        if(creep.room.terminal && creep.room.terminal.store.energy < 75000 &&
          creep.room.storage && creep.room.storage.store.energy > ENERGY_KEEP_AMOUNT)
        {
          creep.withdraw(creep.room.storage, RESOURCE_ENERGY);
        }
        // LInks
        else if(this.kernel.data.roomData[creep.room.name].sourceLinks.length > 0)
        {
          let link = <StructureLink>Game.getObjectById(this.metaData.storageLink);
          if(link && link.energy > 0)
          {
            this.fork(CollectProcess, 'collect-' + creep.name, this.priority - 1, {
              target: this.metaData.storageLink,
              creep: creep.name,
              resource: RESOURCE_ENERGY
            });
          }
          else if (creep.room.terminal && creep.room.terminal.my && creep.room.terminal.store.energy > 75000)
          {
            let collectAmount = creep.room.terminal.store.energy - 75000;
            if(collectAmount < creep.carryCapacity)
            {
              creep.withdraw(creep.room.terminal, RESOURCE_ENERGY, collectAmount);
            }
            else
            {
              creep.withdraw(creep.room.terminal, RESOURCE_ENERGY);
            }
          }
          else if(mineral.mineralAmount === 0 && mineral.ticksToRegeneration > 0)
          {
            // New part to take from storage
            if(creep.room.storage && creep.room.storage.store[mineral.mineralType]! > 20000 &&
              creep.room.terminal && creep.room.terminal.store[mineral.mineralType]! < KEEP_AMOUNT)
              {
                let amount = KEEP_AMOUNT - creep.room.terminal.store[mineral.mineralType]!;
                this.fork(CollectProcess, 'collect-' + creep.name, this.priority - 1, {
                  target: creep.room.storage.id,
                  creep: creep.name,
                  resource: mineral.mineralType
                })
              }
          }
          else if(mineral && creep.room.storage && creep.room.storage.store[mineral.mineralType]! > 20000)
          {
            this.fork(CollectProcess, 'collect-' + creep.name, this.priority - 1, {
              target: creep.room.storage.id,
              creep: creep.name,
              resource: mineral.mineralType
            })
          }
          else
          {
            if(creep.room.storage)
            {
              this.fork(CollectProcess, 'collect-' + creep.name, this.priority - 1, {
                target: creep.room.storage.id,
                creep: creep.name,
                resource: RESOURCE_ENERGY
              });
            }
            else
            {
              this.log('Problem no storage found');
            }
          }
        }
        else
        {
          let link = <StructureLink>Game.getObjectById(this.metaData.storageLink);
          if(link && link.energy > 0)
          {
            this.fork(CollectProcess, 'collect-' + creep.name, this.priority - 1, {
              target: this.metaData.storageLink,
              creep: creep.name,
              resource: RESOURCE_ENERGY
            });
          }
          else if (creep.room.terminal && creep.room.terminal.my && creep.room.terminal.store.energy > 75000)
          {
            let collectAmount = creep.room.terminal.store.energy - 75000;
            if(collectAmount < creep.carryCapacity)
            {
              this.fork(CollectProcess, 'collect-' + creep.name, this.priority - 1, {
                target: creep.room.terminal.id,
                creep: creep.name,
                resource: RESOURCE_ENERGY,
                collectAmount: collectAmount
              });
            }
            else
            {
              this.fork(CollectProcess, 'collect-' + creep.name, this.priority - 1, {
                target: creep.room.terminal.id,
                creep: creep.name,
                resource: RESOURCE_ENERGY,
              });
            }
          }
          else if(mineral && creep.room.storage && creep.room.storage.store[mineral.mineralType]! > 20000)
          {
            this.fork(CollectProcess, 'collect-' + creep.name, this.priority - 1, {
              target: creep.room.storage.id,
              creep: creep.name,
              resource: mineral.mineralType
            })
          }
          else
          {
            if(creep.room.storage)
            {
              this.fork(CollectProcess, 'collect-' + creep.name, this.priority - 1, {
                target: creep.room.storage.id,
                creep: creep.name,
                resource: RESOURCE_ENERGY,
              });
            }
            else
            {
              this.log('Problem no storage found');
            }
          }
        }

        return;
      }

      if(creep.room.storage && creep.room.terminal)
      {
        if(this.kernel.data.roomData[creep.room.name].sourceLinks.length > 0)
        {
          if(creep.carry[mineral.mineralType]! > 0)
          {
            this.fork(DeliverProcess, 'deliver-' + creep.name, this.priority - 1, {
              creep: creep.name,
              target: creep.room.terminal.id,
              resource: mineral.mineralType
            });
          }
          else if(creep.room.terminal.my && creep.room.terminal.store.energy < 75000)
          {
            this.fork(DeliverProcess, 'deliver-' + creep.name, this.priority - 1, {
              creep: creep.name,
              target: creep.room.terminal.id,
              resource: RESOURCE_ENERGY
            })
          }
          else
          {
            this.fork(DeliverProcess, 'deliver-' + creep.name, this.priority - 1, {
              creep: creep.name,
              target: creep.room.storage.id,
              resource: RESOURCE_ENERGY
            })
          }
        }
        else
        {
          if(creep.carry[mineral.mineralType]! > 0)
          {
            this.fork(DeliverProcess, 'deliver-' + creep.name, this.priority - 1, {
              creep: creep.name,
              target: creep.room.terminal.id,
              resource: mineral.mineralType
            });
          }
          else if(creep.room.terminal.my && creep.room.terminal.store.energy < 75000)
          {
            this.fork(DeliverProcess, 'deliver-' + creep.name, this.priority - 1, {
              creep: creep.name,
              target: creep.room.terminal.id,
              resource: RESOURCE_ENERGY
            })
          }
          else
          {
            this.fork(DeliverProcess, 'deliver-' + creep.name, this.priority - 1, {
              creep: creep.name,
              target: creep.room.storage.id,
              resource: RESOURCE_ENERGY
            })
          }
        }
        return;
      }
      else if(creep.room.storage)
      {
        this.fork(DeliverProcess, 'deliver-' + creep.name, this.priority - 1, {
          creep: creep.name,
          target: creep.room.storage.id,
          resource: RESOURCE_ENERGY
        });
        return;
      }
      else
      {
        this.suspend = 15;
      }
    }*/
  }
}
