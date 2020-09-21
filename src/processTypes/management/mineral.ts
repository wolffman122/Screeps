import { Process } from "os/process";
import { Utils } from "lib/utils";
import { MineralHarvesterLifetimeProcess } from "processTypes/lifetimes/mineralHarvester";
import { MineralDistroLifetimeProcess } from "processTypes/lifetimes/mineralDistro";
import { SPREAD_AMOUNT, KEEP_AMOUNT } from "../buildingProcesses/mineralTerminal";

export class  MineralManagementProcess extends Process
{
  type = 'minerals';
  metaData: MineralManagementProcessMetaData;
  harvesters: number;

  run()
  {
    if(this.name === 'minerals-E58S52')
      console.log(this.name, '!!!!!!!!!!!!!!!!!!!!!')
    if(Game.cpu.bucket < 4000)
      return;
    if(!this.kernel.data.roomData[this.metaData.roomName])
    {
      this.completed = true;
      return;
    }

    let proc = this;

    let room = Game.rooms[this.metaData.roomName];
    let extractor = this.roomData().extractor;
    let terminal = room.terminal;
    let mineral = this.roomData().mineral;
    let container = this.roomData().mineralContainer;
    let storage = room.storage;
    let factory = this.roomData().factory;

    if(this.name === 'minerals-E58S52')
      console.log(this.name, 1)
    if(!mineral || !container || !extractor)
    {
      this.completed = true;
      return;
    }

    if(mineral.mineralAmount === 0 && this.metaData.mineralHarvesters.length === 0 && this.metaData.mineralHaulers.length === 0)
    {
      this.completed = true;
      return;
    }

    if(this.name === 'minerals-E58S52')
      console.log(this.name, 2)

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

    if(this.name === 'minerals-E58S52')
      console.log(this.name, 3)
    if(mineral.mineralAmount === 0)
    {
      this.metaData.mining = false;
    }
    if(this.name === 'minerals-E58S52')
      console.log(this.name, 4)

    if(this.metaData.roomName === 'E58S52')
      console.log('Mining ', storage.store[mineral.mineralType], room.memory.specialMining)

    //if(this.metaData.mining && mineral.mineralAmount > 0)

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
          case 'E38S54':
            this.harvesters = 1;
            break;
          case 'E43S52':
          case 'E41S49':
          case 'E38S46':
          case 'E58S52':
          case 'E55S48':
          case 'E41S38':
          case 'E32S44':
          case 'E41S38':
          case 'E37S46':
            this.harvesters = 2;
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
          case 'E58S44':
          case 'E31S26':
            this.harvesters = 3;
            break;
          case 'E36S38':
          case 'E36S43':
          case 'E39S35':
          case 'E38S59':
          case 'E27S38':
          case 'E41S32':
          case 'E48S56':
          case 'E22S52':
          case 'E29S26':
            this.harvesters = 4;
            break;
          default:
            this.harvesters = 1;
            break;
        }

        if(this.name === 'minerals-E58S52')
          console.log(this.name,'test', (mineral.mineralType === RESOURCE_CATALYST && mineral.mineralAmount > 0
            && factory.store.getFreeCapacity() > 0
            && terminal.store.getUsedCapacity(RESOURCE_PURIFIER) < KEEP_AMOUNT
            && storage.store.getUsedCapacity(RESOURCE_CATALYST) >= 90000),
            (storage?.store.getUsedCapacity(mineral.mineralType) < 100000 && !room.memory.specialMining))

    if(this.metaData.mining || (storage?.store.getUsedCapacity(mineral.mineralType) < 100000 && !room.memory.specialMining))
    {
      if( (mineral.mineralAmount > 0))
      {
        if(this.name === 'minerals-E58S52')
      console.log(this.name, 'should be spawing')
        this.spawnCreeps(container, mineral)
        return;
      }
    }
    else if((mineral.mineralType === RESOURCE_CATALYST && mineral.mineralAmount > 0
      && factory?.store.getFreeCapacity() > 0
      && terminal.store.getUsedCapacity(RESOURCE_PURIFIER) < KEEP_AMOUNT
      && storage.store.getUsedCapacity(RESOURCE_CATALYST) > 90000)
      ||
      (room.memory.specialMining && mineral.mineralAmount > 0))
    {
      if(this.name === 'minerals-E58S52')
        console.log(this.name, 3)
      room.memory.specialMining = true;
      // Making Purifier, also might need to make sure there is room in terminal before doing this.
      this.spawnCreeps(container, mineral);
      return;

    }
    else
    {
      room.memory.specialMining = false;
      if(this.name === 'minerals-E58S52')
        console.log(this.name, 'Suspend')
      this.suspend = 5;
    }
  }

  private spawnCreeps(container: StructureContainer, mineral: Mineral)
  {
    this.metaData.mineralHarvesters = Utils.clearDeadCreeps(this.metaData.mineralHarvesters);
        this.metaData.mineralHaulers = Utils.clearDeadCreeps(this.metaData.mineralHaulers);



        if(this.metaData.mineralHarvesters.length < this.harvesters) // Need to find a way of how many creeps can mine a mineral
        {
          let creepName = 'min-h-' + this.metaData.roomName + '-' + Game.time;
          let spawned = Utils.spawn(
            this.kernel,
            this.metaData.roomName,
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
          let creepName = 'min-m-' + this.metaData.roomName + '-' + Game.time;
          let spawned = Utils.spawn(
            this.kernel,
            this.metaData.roomName,
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

