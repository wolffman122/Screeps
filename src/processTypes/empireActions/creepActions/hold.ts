import { Process } from "os/process";

interface HoldProcessMetaData
{
  creep: string
  remoteName: string
}

export class HoldProcess extends Process
{
  metaData: HoldProcessMetaData;
  type = 'hold';

  run()
  {
    let creep = Game.creeps[this.metaData.creep];
    const room = Game.rooms[this.metaData.remoteName]
    if(!creep)
    {
      this.completed = true;
      this.resumeParent();
      return;
    }

    if(!creep.pos.inRangeTo(room.controller, 1))
    {
      creep.travelTo(room.controller)
    }
    else
    {
      let controller = room.controller;

      if(controller?.reservation?.ticksToEnd > 0 && controller.reservation.username !== 'wolffman122')
        creep.attackController(controller);
      else
        creep.reserveController(controller);
    }
  }
}
