import {Process} from '../os/process'
import {DismantleManagementProcess} from './management/dismantle'
import {ClaimProcess} from '../processTypes/empireActions/claim'
//import {HoldProcess} from '../processTypes/empireActions/hold'
import {TransferProcess} from '../processTypes/empireActions/transfer'
import { HoldRoomManagementProcess } from 'processTypes/management/holdRoom';
import { RemoteDefenseManagementProcess } from 'processTypes/management/remoteDefense';
import { AttackControllerManagementProcess } from 'processTypes/management/attackController';
import { BounceAttackProcess } from 'processTypes/management/bounceAttack';
import { HealAttackProcess } from 'processTypes/management/healAttack';
import { SignControllerProcess } from './management/sign';
import { GeneralAttackManagementProcess } from './management/generalAttack';
import { RemoteBuilderLifetimeProcess } from './lifetimes/remoteBuilder';
import { HelpManagementProcess } from './management/help';

export class FlagWatcherProcess extends Process
{
  type='flagWatcher';

  remoteDismantleFlag(flag: Flag)
  {
    this.kernel.addProcessIfNotExist(DismantleManagementProcess, 'dmp' + flag.name, 40, {flagName: flag.name});
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
      if(flag.memory.timeEnemies! + 1500 === Game.time)
      {
        flag.memory.enemies = false;
        flag.memory.timeEnemies = undefined;
      }
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

  SignController(flag: Flag)
  {
    this.kernel.addProcessIfNotExist(SignControllerProcess, 'sign-' + flag.name, 35, {flagName: flag.name});
  }

  GeneralAttack(flag: Flag)
  {
    this.kernel.addProcessIfNotExist(GeneralAttackManagementProcess, 'gamp-' + flag.name, 40, {flagName: flag.name});
  }

  helpRoom(flag: Flag)
  {
    this.kernel.addProcessIfNotExist(HelpManagementProcess, 'hmp-' + flag.name, 35, {flagName: flag.name});
  }

  run()
  {
    this.completed = true;
    let proc = this;

    _.forEach(Game.flags, (flag) => {
      switch(flag.color)
      {
        case COLOR_BLUE:
          switch(flag.secondaryColor)
          {
            case COLOR_BLUE:
              proc.claimFlag(flag);
              break;
            case COLOR_RED:
              proc.helpRoom(flag);
              break;
          }
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
            case COLOR_RED:
              proc.GeneralAttack(flag);
              break;
            case COLOR_BROWN:
              proc.BounceAttack(flag);
              break;
            case COLOR_GREY:
              proc.HealAttack(flag);
              break;
            case COLOR_BLUE:
              proc.AttackController(flag);
              break;
          }
          break;
        case COLOR_WHITE:
          proc.SignController(flag);
          break;
      }
    })
  }
}
