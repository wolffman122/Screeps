import { LifetimeProcess } from "os/process";

interface ControllerrAttackMetaData
{
  creep: string,
  flagName: string,
  numberAttack: number
  rollCall: number
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
      creep.travelTo(flag);
      return;
    }

    if(creep.pos.inRangeTo(flag, 1) && !creep.memory.atPlace)
    {
      this.log('Increase');
      creep.memory.atPlace = true;
      this.metaData.rollCall++
    }

    if(this.metaData.rollCall === this.metaData.numberAttack && !creep.room.controller!.upgradeBlocked)
    {
      this.log('Attacking the controller');
      creep.attackController(creep.room.controller!);
    }

    /*if(creep.room.controller!.progress === 0)
    {
      creep.room.createFlag(creep.room.controller!.pos, 'Claim', COLOR_BLUE);
    }*/

    if(creep.ticksToLive === 1)
    {
      this.metaData.rollCall--;
    }
  }
}
