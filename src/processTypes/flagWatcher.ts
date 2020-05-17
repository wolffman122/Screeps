import {Process} from '../os/process'
import {DismantleManagementProcess} from './management/dismantle'
import {ClaimProcess} from '../processTypes/empireActions/claim'
//import {HoldProcess} from '../processTypes/empireActions/hold'
import {TransferProcess} from '../processTypes/empireActions/transfer'
import { HoldRoomManagementProcess } from 'processTypes/management/holdRoom';
import { AttackControllerManagementProcess } from 'processTypes/management/attackController';
import { BounceAttackManagementProcess } from 'processTypes/management/bounceAttack';
import { HealAttackProcess } from 'processTypes/management/healAttack';
import { SignControllerProcess } from './management/sign';
import { GeneralAttackManagementProcess } from './management/generalAttack';
import { RemoteBuilderLifetimeProcess } from './lifetimes/remoteBuilder';
import { HelpManagementProcess } from './management/help';
import { HoldRoomOptManagementProcess } from './management/holdRoomOpt';
import { RangeAttackManagementProcess } from './management/rangeAttack';
import { SquadManagementProcess } from './management/squad';
import { StrongHoldDestructionProcess } from './management/strongHoldDestruction';
import { StripManagementProcess } from './management/strip';
import { Utils } from 'lib/utils';
import { TestProcessManagement } from './management/test';
import { TempleProcess } from './management/temple';

export class FlagWatcherProcess extends Process
{
  type='flagWatcher';
  metaData: FlagWatcherProcessMetaData
  //  Purple & Purpel

  ensureMetaData()
  {
    if(this.metaData.skFlagCount === undefined)
    {
      this.metaData.skFlagCount = {};
    }
  }

  remoteDismantleFlag(flag: Flag)
  {
    this.kernel.addProcessIfNotExist(DismantleManagementProcess, 'dmp' + flag.name, 40, {flagName: flag.name});
  }

  //  Purple &  Yellow
  strongHoldDestruction(flag: Flag)
  {
    const roomName = flag.name.split('-')[0];
    //if(flag.memory.coreInfo?.coreLevel <= 3)
    {
     // this.kernel.addProcessIfNotExist(StrongHoldDestructionProcess, 'shdp' + roomName, 35, {flagName: flag.name});
    }
  }

  AttackController(flag: Flag)
  {
    this.kernel.addProcessIfNotExist(AttackControllerManagementProcess, 'acmp-' + flag.name, 30, {flagName: flag.name});
  }


  // blue blue
  claimFlag(flag: Flag)
  {
    console.log('Blue 2', flag.pos.roomName, flag.name);
    this.kernel.addProcessIfNotExist(ClaimProcess, 'claim-' + flag.name, 20, { targetRoom: flag.pos.roomName, flagName: flag.name});
  }

  // blue yellow
  TempleRoom(flag: Flag)
  {
    console.log('Flagwatcher Temple');
    this.kernel.addProcessIfNotExist(TempleProcess, 'temple-' + flag.pos.roomName, 60, { roomName: flag.pos.roomName, flagName: flag.name});
  }

  /*holdFlag(flag: Flag)
  {
    this.log("Hold Function")
    this.kernel.addProcessIfNotExist(HoldProcess, 'hold-' + flag.name, 20, {targetRoom: flag.pos.roomName, flagName: flag.name});
  }*/

  remoteHoldFlag(flag: Flag)
  {
    this.kernel.addProcessIfNotExist(HoldRoomManagementProcess, 'hrm-' + flag.pos.roomName, 30, {flagName: flag.name, roomName: flag.pos.roomName});
  }

  // Red green flag
  remoteHoldOptFlag(flag: Flag)
  {
    this.kernel.addProcessIfNotExist(HoldRoomOptManagementProcess, 'hrmOpt-' + flag.pos.roomName, 30, {flagName: flag.name, roomName: flag.pos.roomName});
  }

  transferFlag(flag: Flag)
  {
    //this.kernel.addProcessIfNotExist(TransferProcess, 'transfer-' + flag.name, 25, {flagName: flag.name});
  }

  BounceAttack(flag: Flag)
  {
    this.kernel.addProcessIfNotExist(BounceAttackManagementProcess, 'bamp-' + flag.name, 31, {flagName: flag.name});
  }

  HealAttack(flag: Flag)
  {
    this.kernel.addProcessIfNotExist(HealAttackProcess, 'healAttack-' + flag.name, 29, {flagName: flag.name});
  }

  GeneralAttack(flag: Flag)
  {
    this.kernel.addProcessIfNotExist(GeneralAttackManagementProcess, 'gamp-' + flag.name, 40, {flagName: flag.name});
  }

  RangeAttack(flag: Flag)
  {
    this.kernel.addProcess(RangeAttackManagementProcess, 'ra-' + flag.name, 35, {flagName: flag.name});
  }

  // blue & red
  helpRoom(flag: Flag)
  {
    let spawnRoom = flag.name.split('-')[0];
    this.kernel.addProcessIfNotExist(HelpManagementProcess, 'hmp-' + spawnRoom, 35, {flagName: flag.name});
  }

  SquadAttack(flag: Flag)
  {
    this.kernel.addProcessIfNotExist(SquadManagementProcess, 'sqm-' + flag.name, 31, {flagName: flag.name});
  }

  // Red & Blue
  // SpawnRoom-Text-NumberOfStrippers-Boost
  stripRoom(flag: Flag)
  {
    this.kernel.addProcessIfNotExist(StripManagementProcess, 'strip-' + flag.name, 30, {flagName: flag.name});
  }

  // Green
  TestProcess(flag: Flag)
  {
    this.kernel.addProcessIfNotExist(TestProcessManagement, 'test-' + flag.name, 40, {roomName: flag.pos.roomName, flagName: flag.name});
  }

  run()
  {
    this.ensureMetaData();

    this.completed = true;
    let proc = this;

    _.forEach(Game.flags, (flag) => {
      switch(flag.color)
      {
        case COLOR_BLUE:
          switch(flag.secondaryColor)
          {
            case COLOR_BLUE:
              console.log('Claim blue');
              proc.claimFlag(flag);
              break;
            case COLOR_YELLOW:
              console.log('Temple Room');
              proc.TempleRoom(flag);
            case COLOR_RED:
              proc.helpRoom(flag);
              break;
          }
          break;
        case COLOR_RED:
          switch(flag.secondaryColor)
          {
            case COLOR_RED:
              proc.remoteHoldFlag(flag);
              break;
            case COLOR_GREEN:
              proc.remoteHoldOptFlag(flag);
              break;
            case COLOR_BLUE:
              proc.stripRoom(flag);
              break;
          }
          break;
        case COLOR_PURPLE:
          switch(flag.secondaryColor)
          {
            case COLOR_PURPLE:
              proc.remoteDismantleFlag(flag);
              break;
            case COLOR_YELLOW:
              proc.strongHoldDestruction(flag);
              break;
          }
          break;

        /*case COLOR_BROWN:
          proc.holdFlag(flag)
          break;*/
        case COLOR_ORANGE:
          switch(flag.secondaryColor)
          {
            case COLOR_ORANGE:
              proc.transferFlag(flag);
              break;
          }
          break;
        case COLOR_BROWN:
          switch(flag.secondaryColor)
          {
            case COLOR_RED:
              proc.GeneralAttack(flag);
              break;
            case COLOR_PURPLE:
              proc.SquadAttack(flag);
              break;
            case COLOR_BLUE:
              proc.RangeAttack(flag);
              break;
            case COLOR_BROWN:     // Place the heal flag first always.
              proc.BounceAttack(flag);
              break;
            case COLOR_GREY:
              proc.HealAttack(flag);
              break;
            case COLOR_GREEN:
              proc.AttackController(flag);
              break;
          }
          break;
        case COLOR_GREEN:
          proc.TestProcess(flag);
          break;
      }
    })
  }
}
