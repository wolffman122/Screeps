import { LifetimeProcess } from 'os/process';
import {MoveProcess} from '../../creepActions/move';
import { HoldProcess } from 'processTypes/empireActions/creepActions/hold';

interface HolderLifetimeProcessMetaData
{
  creep: string
  targetRoom: string
  flagName: string
}

export class HolderLifetimeProcess extends LifetimeProcess
{
  type = 'holdlf';
  metaData: HolderLifetimeProcessMetaData;

  run()
  {
    let creep = this.getCreep();

    if(!creep)
    {
      return;
    }

    let flag = Game.flags[this.metaData.flagName];

    if(!flag)
    {
      return;
    }

    if(creep.pos.roomName != flag.pos.roomName)
    {
        this.fork(MoveProcess, 'move-' + creep.name, this.priority - 1, {
          creep: creep.name,
          pos: flag.pos,
          range: 1
        });

      return;
    }

    this.fork(HoldProcess, 'hold-' + creep.name, this.priority - 1, {
      creep: creep.name,
      flagName: flag.name
    });
  }
}
