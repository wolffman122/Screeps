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

    for(var name in Memory.creeps){
      if(!Game.creeps[name]){
        delete Memory.creeps[name]
      }
    }

    _.forEach(Game.rooms, function(room){
      proc.kernel.addProcess(RoomDataProcess, 'roomData-' + room.name, 99, {
        roomName: room.name
      })

      if(room.controller && room.controller.my)
      {
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
             room.name === 'E41S49' || room.name === 'E42S48' || room.name === 'E43S52' || room.name === 'E43S55')
          {
            if(!proc.kernel.hasProcess('labm-' + room.name))
            {
              proc.kernel.addProcess(LabManagementProcess, 'labm-' + room.name, 30, {
                roomName: room.name
              });
            }
          }
        }
      }
    })

    this.kernel.addProcessIfNotExist(ReportProcess, 'report', 10, {});
    this.kernel.addProcessIfNotExist(SuspensionProcess, 'suspension-master', 99, {master: true})
    this.kernel.addProcessIfNotExist(FlagWatcherProcess, 'flag-watcher', 98, {})
    //this.kernel.addProcessIfNotExist(MarketManagementProcess, 'market', 20, {});
    this.kernel.addProcessIfNotExist(MinetalTerminalManagementProcess, 'mineralTerminal', 15,  {});
    this.kernel.addProcessIfNotExist(TerminalManagementProcess, 'terminal', 14, {});


    this.completed = true
  }
}
