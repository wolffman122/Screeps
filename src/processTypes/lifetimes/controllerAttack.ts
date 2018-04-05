import { LifetimeProcess } from "os/process";
import { MoveProcess } from "processTypes/creepActions/move";

interface ControllerrAttackMetaData
{
  creep: string,
  flagName: string,
  numberAttack: number
};

export class ControllerAttackLifetimeProcess extends LifetimeProcess
{
  type = 'calf';
  metaData: ControllerrAttackMetaData;

  run()
  {
    this.log('Begin Begin')
    let creep = this.getCreep();
    let flag = Game.flags[this.metaData.flagName];

    if(!creep || !flag)
    {
      return;
    }



    if(creep.pos.roomName != flag.pos.roomName && creep.hits === creep.hitsMax)
    {
      this.kernel.addProcess(MoveProcess, 'move-' + creep.name, this.priority - 1, {
        creep: creep.name,
        pos: flag.pos,
        range: 1
      });

      return;
    }

    this.log('Testing Testing');
    if(creep.pos.inRangeTo(flag, 1) && !creep.memory.atPlace)
    {
      this.log('Increase');
      creep.memory.atPlace = true;
      flag.memory.rollCall++;
    }

    if(flag.memory.rollCall === this.metaData.numberAttack && !creep.room.controller.upgradeBlocked)
    {
      this.log('Attacking the controller');
      creep.attackController(creep.room.controller);
    }
/*
    if(creep.room.controller.upgradeBlocked > 0)
    {
      this.suspend = creep.room.controller.upgradeBlocked;
      return;
    }*/

    if(creep.ticksToLive === 1)
    {
      flag.memory.rollCall--;
    }
  }
}
