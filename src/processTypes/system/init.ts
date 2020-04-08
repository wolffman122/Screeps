import {Process} from '../../os/process'
import {RoomDataProcess} from '../roomData'
import {EnergyManagementProcess} from '../management/energy'
import {SuspensionProcess} from './suspension'
import {StructureManagementProcess} from '../management/structure'
import {DefenseManagementProcess} from '../management/defense'
import {FlagWatcherProcess} from '../flagWatcher'
import { LinkManagementProcess } from 'processTypes/management/link';
import { MarketManagementProcess } from 'processTypes/management/market';
import { TerminalManagementProcess } from 'processTypes/buildingProcesses/terminal';
import { MinetalTerminalManagementProcess } from '../buildingProcesses/mineralTerminal';
import { LabManagementProcess } from 'processTypes/management/lab';
import { ReportProcess } from './reports';
import { AllTerminalManagementProcess } from 'processTypes/buildingProcesses/allTerminal';
import { PowerHarvestingManagement } from 'processTypes/management/powerHarvesting';
import { PowerManagement } from 'processTypes/management/power'
import { TransferManagementProcess } from 'processTypes/management/transfer'

/*


import {StructureManagementProcess} from '../management/structure'
import {SuspensionProcess} from './suspension'
*/
export class InitProcess extends Process{
  type = 'init'

  /** Run the init process */
  run(){
    let proc = this

    if(Game.cpu.bucket > 3000){
      this.kernel.limit = (Game.cpu.limit + 500) - 20
    }

    console.log(this.name, 1)

    for(var name in Memory.creeps){
      if(!Game.creeps[name]){
        delete Memory.creeps[name]
      }
    }

    console.log(this.name, 2)
    let gRooms = Object.keys(Game.rooms);
    let mRooms: string[] = []
    if(Memory.rooms)
      mRooms = Object.keys(Memory.rooms);

    let observedRooms = _.difference(mRooms, gRooms);
    if(observedRooms.length)
    {
      console.log(this.name, 2, observedRooms.length)
      _.forEach(observedRooms, (or) => {
        //console.log('Hoping observed rooms ', or );
        if(!Game.rooms[or])
          Memory.rooms[or] = undefined;
      })
    }
    console.log(this.name, 3)
    _
    //console.log('Observer', 0)
    _.forEach(Game.rooms, function(room){

      const flags = room.find(FIND_FLAGS, {filter: f=> f.name === room.name + '-kill'});
      if(flags.length)
      {
        room.memory.shutdown = true;
        return;
      }

      proc.kernel.addProcessIfNotExist(RoomDataProcess, 'roomData-' + room.name, 99, {
        roomName: room.name
      })

      if(room.controller && room.controller.my)
      {
        if(Game.time % 3000 === 0)
        {
          const flags = room.find(FIND_FLAGS, {filter: f => f.color === COLOR_ORANGE && f.secondaryColor === COLOR_RED});
          if(flags.length)
          {
            room.memory.transfering = true;
            room.memory.transferFlagName = flags[0].name;
          }
        }

        if(room.memory.transfering)
        {
          proc.kernel.addProcessIfNotExist(TransferManagementProcess, 'tmp-' + room.name, 20, {
            roomName: room.name,
            transferFlagName: room.memory.transferFlagName
          });
        }

        if(!proc.kernel.getProcessByName('em-' + room.name)){
          proc.kernel.addProcess(EnergyManagementProcess, 'em-' + room.name, 50, {
            roomName: room.name
          })
        }

        if(!proc.kernel.hasProcess('sm-' + room.name)){
          proc.kernel.addProcess(StructureManagementProcess, 'sm-' + room.name, 48, {
            roomName: room.name
          })
        }

        if(!proc.kernel.hasProcess('dm-' + room.name))
        {
          proc.kernel.addProcess(DefenseManagementProcess, 'dm-' + room.name, 70, {
            roomName: room.name
          })
        }
      }

      if(Game.rooms[room.name].controller)
      {
        if(Game.rooms[room.name].controller!.my)
        {
          if(!proc.kernel.hasProcess('lm-' + room.name))
          {
            proc.kernel.addProcess(LinkManagementProcess, 'lm-' + room.name, 60, {
              roomName: room.name
            });
          }


          if(room.name === 'E35S41' || room.name === 'E36S43' || room.name === 'E38S46' || room.name === 'E41S41' ||
             room.name === 'E55S48' || room.name === 'E45S48' || room.name === 'E48S49' || room.name === 'E43S53' ||
             room.name === 'E45S57' || room.name === 'E52S46' || room.name === 'E51S49' || room.name === 'E58S52' ||
             room.name === 'E41S49' || room.name === 'E42S48' || room.name === 'E43S52' || room.name === 'E43S55' ||
             room.name === 'E36S38' || room.name === 'E48S57' || room.name === 'E41S38' || room.name === 'E39S35' ||
             room.name === 'E39S35' || room.name === 'E38S59' || room.name === 'E55S47' || room.name === 'E48S56' ||
             room.name === 'E56S43' || room.name === 'E47S46' || room.name === 'E38S54' || room.name === 'E45S53' ||
             room.name === 'E27S38' || room.name === 'E58S44' || room.name === 'E32S44' || room.name === 'E41S32' ||
             room.name === 'E35S51' || room.name === 'E35S51' || room.name === 'E38S35' || room.name === 'E44S42' ||
             room.name === 'E46S51' || room.name === 'E36S33' || room.controller.level >= 6)
          {
            if(!proc.kernel.hasProcess('labm-' + room.name))
            {
              proc.kernel.addProcess(LabManagementProcess, 'labm-' + room.name, 33, {
                roomName: room.name
              });
            }
          }

          if(room.name === 'E38S39')
          {
            const labs = room.find(FIND_MY_STRUCTURES, {filter: s => s.structureType === STRUCTURE_LAB});
            if(room.controller && room.controller.my && room.controller.level >= 6 && labs.length > 0)
              proc.kernel.addProcessIfNotExist(LabManagementProcess, 'labm-' + room.name, 33, {
                roomName: room.name
              });
          }
        }
      }
    })


    this.kernel.addProcessIfNotExist(PowerManagement, 'powerm', 50, {});
    this.kernel.addProcessIfNotExist(ReportProcess, 'report', 10, {});
    this.kernel.addProcessIfNotExist(SuspensionProcess, 'suspension-master', 99, {master: true})
    this.kernel.addProcessIfNotExist(FlagWatcherProcess, 'flag-watcher', 98, {})
    this.kernel.addProcessIfNotExist(MarketManagementProcess, 'market', 20, {});
    this.kernel.addProcessIfNotExist(AllTerminalManagementProcess, 'atmp', 15, {});
    //this.kernel.addProcessIfNotExist(MinetalTerminalManagementProcess, 'mineralTerminal', 15, {});
    this.kernel.addProcessIfNotExist(TerminalManagementProcess, 'terminal', 14, {});


    this.completed = true

  }
}
