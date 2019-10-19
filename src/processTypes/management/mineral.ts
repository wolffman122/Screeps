import { Process } from "os/process";
import { Utils } from "lib/utils";
import { MineralHarvesterLifetimeProcess } from "processTypes/lifetimes/mineralHarvester";
import { MineralDistroLifetimeProcess } from "processTypes/lifetimes/mineralDistro";
import { SPREAD_AMOUNT, KEEP_AMOUNT } from "../buildingProcesses/mineralTerminal";

export class  MineralManagementProcess extends Process
{
  type = 'minerals';
  metaData: MineralManagementProcessMetaData

  run()
  {
    if(Game.cpu.bucket < 8000)
      return;
    if(!this.kernel.data.roomData[this.metaData.roomName])
    {
      this.completed = true;
      return;
    }

    let proc = this;

    let extractor = this.kernel.data.roomData[this.metaData.roomName].extractor;
    let terminal = Game.rooms[this.metaData.roomName].terminal;
    let mineral = this.kernel.data.roomData[this.metaData.roomName].mineral;
    let container = this.kernel.data.roomData[this.metaData.roomName].mineralContainer;
    let storage = Game.rooms[this.metaData.roomName].storage;

    if(!mineral || !container || !extractor)
    {
      this.completed = true;
      return;
    }

    let ipcMsg: IPCMessage|undefined = this.kernel.getIpc(this.name);
    if(ipcMsg)
    {
      this.log('Got a message');

      let value: String = ipcMsg.message.value;
      let status = value.split('-')[0];
      let action = value.split('-')[1];

      this.log('Message status ' + status + ' action ' + action);

      if(status == 'Start' && action == 'Mining')
      {
        this.metaData.mining = true;
      }
      else if(status == 'Stop' && action == 'Mining')
      {
        this.metaData.mining = false;
      }

    }

    if(mineral.mineralAmount === 0)
    {
      this.metaData.mining = false;
    }

    if(this.metaData.roomName === 'E36S43')
      console.log('Mining ', storage.store[mineral.mineralType])

    //if(this.metaData.mining && mineral.mineralAmount > 0)

    if(storage && (storage.store[mineral.mineralType] < 100000 || storage.store[mineral.mineralType] === undefined))
    {
      if(this.metaData.mining || (mineral.mineralAmount > 0 && (terminal && (terminal.store[mineral.mineralType] === undefined || terminal.store[mineral.mineralType]! < KEEP_AMOUNT))))
      {
        this.metaData.mineralHarvesters = Utils.clearDeadCreeps(this.metaData.mineralHarvesters);
        this.metaData.mineralHaulers = Utils.clearDeadCreeps(this.metaData.mineralHaulers);

        let harvesters = 0;

        switch(proc.metaData.roomName)
        {
          //case 'E44S51':
          //case 'E46S52':
          case 'E48S57':
          case 'E43S55':
          case 'E42S48':
          case 'E41S41':
          case 'E43S43':
          case 'E55S47':
          case 'E56S43':
          case 'E47S46':
          case 'E45S53':
            harvesters = 1;
            break;
          case 'E43S52':
          case 'E41S49':
          case 'E38S46':
          case 'E48S56':
          case 'E55S48':
          case 'E36S38':
          case 'E41S38':
          case 'E32S44':
            harvesters = 2;
            break;
          case 'E43S53':
          case 'E46S51':
          case 'E45S57':
          case 'E45S48':
          case 'E48S49':
          case 'E51S49':
          case 'E52S46':
          case 'E35S41':
          case 'E58S52':
          case 'E38S39':
            harvesters = 3;
            break;
          case 'E36S43':
          case 'E39S35':
          case 'E38S59':
            harvesters = 4;
            break;
          default:
            harvesters = 1;
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

            if(!this.metaData.mining)
            {
              this.metaData.mining = true;
            }
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
    }
    else
    {
      this.suspend = 5;
    }
  }
}

