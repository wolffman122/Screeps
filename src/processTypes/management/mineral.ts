import { Process } from "os/process";
import { Utils } from "lib/utils";
import { MineralHarvesterLifetimeProcess } from "processTypes/lifetimes/mineralHarvester";
import { MineralDistroLifetimeProcess } from "processTypes/lifetimes/mineralDistro";

export class MineralManagementProcess extends Process
{
  type = 'minerals';

  run()
  {
    if(!this.kernel.data.roomData[this.metaData.roomName])
    {
      this.completed = true;
      return;
    }

    let proc = this;

    let mineral = this.kernel.data.roomData[this.metaData.roomName].mineral;
    let container = this.kernel.data.roomData[this.metaData.roomName].mineralContainer;

    if(!mineral || !container)
    {
      this.completed = true;
      return;
    }


    if(mineral.mineralAmount > 0)
    {

      this.metaData.mineralHarvesters = Utils.clearDeadCreeps(this.metaData.mineralHarvesters);
      this.metaData.mineralHaulers = Utils.clearDeadCreeps(this.metaData.mineralHaulers);

      let harvesters = 0;

      switch(proc.metaData.roomName)
      {
        case 'E44S51':
          harvesters = 1;
          break;
        case 'E43S52':
          harvesters = 2;
          break;
        case 'E43S53':
          harvesters = 3;
          break;
        case 'E46S51':
          harvesters = 3;
          break;
        case 'E46S52':
          harvesters = 1;
          break;
        case 'E45S57':
          harvesters = 3;
          break;
        case 'E48S57':
          harvesters = 1;
          break;
        case 'E45S48':
          harvesters = 3;
          break;
        case 'E48S49':
          harvesters = 3;
          break;
        case 'E41S49':
          harvesters = 2;
          break;
        default:
          harvesters = 0;
          break;
      }

      if(this.metaData.mineralHarvesters.length < harvesters) // Need to find a way of how many creeps can mine a mineral
      {
        let creepName = 'min-h-' + proc.metaData.roomName + '-' + Game.time;
        let spawned = Utils.spawn(
          proc.kernel,
          proc.metaData.roomName,
          'mineralHarvester',
          creepName,
          {}
        );

        if(spawned)
        {
          this.metaData.mineralHarvesters.push(creepName)
          this.kernel.addProcess(MineralHarvesterLifetimeProcess, 'mhlf-' + creepName, 25, {
            creep: creepName
          });
        }
      }

      if(this.metaData.mineralHarvesters.length > 0 && this.metaData.mineralHaulers.length < 1)
      {
        let creepName = 'min-m-' + proc.metaData.roomName + '-' + Game.time;
        let spawned = Utils.spawn(
          proc.kernel,
          proc.metaData.roomName,
          'mover',
          creepName,
          {}
        );

        if(spawned)
        {
          this.metaData.mineralHaulers.push(creepName);
          this.kernel.addProcess(MineralDistroLifetimeProcess, 'mdlf-' + creepName, 22, {
            creep: creepName,
            container: container.id,
            mineralType: mineral.mineralType
          })
        }
      }
    }
    else
    {
      this.completed = true;
      return;
    }
  }
}
