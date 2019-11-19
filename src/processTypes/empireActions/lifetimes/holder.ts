import { LifetimeProcess } from 'os/process';
import {MoveProcess} from '../../creepActions/move';
import { HoldProcess } from 'processTypes/empireActions/creepActions/hold';

interface HolderLifetimeProcessMetaData
{
  creep: string
  remoteName: string
  spawnRoomName: string
}

export class HolderLifetimeProcess extends LifetimeProcess
{
  type = 'holdlf';
  metaData: HolderLifetimeProcessMetaData;

  run()
  {
    let creep = this.getCreep();
    let room = Game.rooms[this.metaData.remoteName];
    if(!creep)
    {
      return;
    }

    if(creep.pos.roomName != room?.name)
    {
        const pos = new RoomPosition(25,25, room.name);
        this.fork(MoveProcess, 'move-' + creep.name, this.priority - 1, {
          creep: creep.name,
          pos: pos,
          range: 1
        });

      return;
    }

    this.fork(HoldProcess, 'hold-' + creep.name, this.priority - 1, {
      creep: creep.name,
      remoteName: room.name
    });
  }
}
