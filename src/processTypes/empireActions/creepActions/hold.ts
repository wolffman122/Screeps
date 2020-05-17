import { Process } from "os/process";

interface HoldProcessMetaData
{
  creep: string
  flagName: string
}

export class HoldProcess extends Process
{
  metaData: HoldProcessMetaData;
  type = 'hold';

  run()
  {
    let creep = Game.creeps[this.metaData.creep];
    let flag = Game.flags[this.metaData.flagName];

    if(!creep || !flag)
    {
      this.completed = true;
      this.resumeParent();
      return;
    }

    if(!creep.pos.inRangeTo(creep.room.controller!, 1))
    {
      creep.travelTo(creep.room.controller!)
    }
    else
    {
      let controller = creep.room.controller;
      if(controller)
      {
        if(controller.reservation && controller.reservation.ticksToEnd > 0 && controller.reservation.username !== 'wolffman122')
          creep.attackController(controller);
        else
          creep.reserveController(controller);
      }
    }
  }
}
