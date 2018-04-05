import {LifetimeProcess} from '../../os/process'
import {DismantleProcess} from '../creepActions/dismantle'
import {MoveProcess} from '../creepActions/move'

export class DismantleLifetimeProcess extends LifetimeProcess
{
  type = 'dislf'

  run()
  {
    let creep = this.getCreep();

    if(!creep)
    {
      return;
    }

    let flag = Game.flags[this.metaData.flag];

    if(!flag)
    {
      this.completed = true;
      return;
    }

    if(creep.pos.roomName == flag.pos.roomName)
    {
      this.fork(DismantleProcess, 'dismantle-' + creep.name, this.priority - 1, {
        creep: creep.name,
        flagName: flag.name
      });

      return
    }
    else
    {
      this.fork(MoveProcess, 'move-' + creep.name, this.priority - 1, {
        creep: creep.name,
        pos: {
          x: flag.pos.x,
          y: flag.pos.y,
          roomName: flag.pos.roomName
        },
        range: 1
      });

      return;
    }
  }
}
