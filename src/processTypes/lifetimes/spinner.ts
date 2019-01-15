import { LifetimeProcess } from "os/process";
import { CollectProcess } from "processTypes/creepActions/collect";
import { DeliverProcess } from "processTypes/creepActions/deliver";
import { KEEP_AMOUNT, ENERGY_KEEP_AMOUNT } from "../buildingProcesses/mineralTerminal";

export class  SpinnerLifetimeProcess extends LifetimeProcess
{
  type = 'slf';

  run()
  {
    let creep = this.getCreep()

    if(!creep)
    {
      return;
    }

    let flag = Game.flags['DJ-' + creep.pos.roomName];
    let mineral = <Mineral>creep.room.find(FIND_MINERALS)[0];

    if(flag)
    {
      if(!creep.pos.inRangeTo(flag, 0))
      {
        creep.travelTo(flag);
        return;
      }
    }

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
  }
}
