import {Process} from '../os/process'
import {RemoteMiningManagementProcess} from './management/remoteMining'
import {DismantleManagementProcess} from './management/dismantle'
import {ClaimProcess} from '../processTypes/empireActions/claim'
//import {HoldProcess} from '../processTypes/empireActions/hold'
import {TransferProcess} from '../processTypes/empireActions/transfer'
import { HoldRoomManagementProcess } from 'processTypes/management/holdRoom';
import { RemoteDefenseManagementProcess } from 'processTypes/management/remoteDefense';
import { AttackControllerManagementProcess } from 'processTypes/management/attackController';
import { BounceAttackProcess } from 'processTypes/management/bounceAttack';
import { HealAttackProcess } from 'processTypes/management/healAttack';

export class FlagWatcherProcess extends Process
{
  type='flagWatcher';

  remoteMiningFlag(flag: Flag)
  {
    if(flag.memory.enemies)
    {
      this.kernel.addProcessIfNotExist(RemoteDefenseManagementProcess, 'rdmp-' + flag.name, 45,  { flag: flag.name })
    }
    this.kernel.addProcessIfNotExist(RemoteMiningManagementProcess, 'rnmp-' + flag.name, 40, { flag: flag.name })
  }

  remoteDismantleFlag(flag: Flag)
  {
    this.kernel.addProcessIfNotExist(DismantleManagementProcess, 'dmp' + flag.name, 40, {flag: flag.name});
  }

  AttackController(flag: Flag)
  {
    this.kernel.addProcessIfNotExist(AttackControllerManagementProcess, 'acmp-' + flag.name, 30, {flagName: flag.name});
  }


  claimFlag(flag: Flag)
  {
    this.kernel.addProcessIfNotExist(ClaimProcess, 'claim-' + flag.name, 20, { targetRoom: flag.pos.roomName, flagName: flag.name});
  }

  /*holdFlag(flag: Flag)
  {
    this.log("Hold Function")
    this.kernel.addProcessIfNotExist(HoldProcess, 'hold-' + flag.name, 20, {targetRoom: flag.pos.roomName, flagName: flag.name});
  }*/

  remoteHoldFlag(flag: Flag)
  {
    if(flag.memory.enemies)
    {
      this.kernel.addProcessIfNotExist(RemoteDefenseManagementProcess, 'rdmp-' + flag.name, 45,  { flag: flag.name })
    }
    else
    {
      //console.log('Hold Management Process ' + flag.name);
      this.kernel.addProcessIfNotExist(HoldRoomManagementProcess, 'hrm-' + flag.pos.roomName, 30, {flagName: flag.name});
    }
  }

  transferFlag(flag: Flag)
  {
    this.kernel.addProcessIfNotExist(TransferProcess, 'transfer-' + flag.name, 25, {flagName: flag.name});
  }

  BounceAttack(flag: Flag)
  {
    this.kernel.addProcessIfNotExist(BounceAttackProcess, 'bounce-' + flag.name, 31, {flagName: flag.name});
  }

  HealAttack(flag: Flag)
  {
    this.kernel.addProcessIfNotExist(HealAttackProcess, 'healAttack-' + flag.name, 29, {flagName: flag.name});
  }
  run()
  {
    this.completed = true;
    let proc = this;

    _.forEach(Game.flags, (flag) => {
      switch(flag.color)
      {
        case COLOR_BLUE:
          proc.claimFlag(flag);
          break;
        case COLOR_YELLOW:
          proc.remoteMiningFlag(flag);
          break;
        case COLOR_RED:
          proc.remoteHoldFlag(flag);
          break;
        case COLOR_PURPLE:
          proc.remoteDismantleFlag(flag);
          break;
        /*case COLOR_BROWN:
          proc.holdFlag(flag)
          break;*/
        case COLOR_ORANGE:
          proc.transferFlag(flag);
          break;
        case COLOR_GREEN:
          proc.AttackController(flag);
          break;
        case COLOR_BROWN:
          switch(flag.secondaryColor)
          {
            case COLOR_BROWN:
              proc.BounceAttack(flag);
              break;
            case COLOR_GREY:
              proc.HealAttack(flag);
              break;
          }
          break;
      }
    })
  }
}
