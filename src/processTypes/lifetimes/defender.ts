import {LifetimeProcess} from '../../os/process'
import {MoveProcess} from '../creepActions/move'
import {DefendProcess} from '../creepActions/defend'

interface DefenderLifetimeProcessMetaData
{
  flagName: string
}

export class DefenderLifetimeProcess extends LifetimeProcess
{
  metaData: DefenderLifetimeProcessMetaData;
  type = 'deflf'

  run()
  {
    let creep = this.getCreep();

    if(!creep)
    {
      return;
    }

    //let room = Game.rooms[creep.room.name];

    let flag = Game.flags[this.metaData.flagName];
    let enemies  = <Creep[]>flag.pos.findInRange(FIND_HOSTILE_CREEPS, 25);

    if(enemies.length > 0)
    {
      let enemy = creep.pos.findClosestByRange(enemies);

      this.fork(DefendProcess, 'defend-' + creep.name, this.priority - 1, {
        creep: creep.name,
        target: enemy.id,
      });
    }
    else
    {
      let flag = Game.flags[this.metaData.flagName];

      if(flag)
      {
        if(!creep.pos.inRangeTo(flag.pos, 2))
        {
          this.fork(MoveProcess, 'move-' + creep.name,this.priority - 1, {
            creep: creep.name,
            pos: {
              x: flag.pos.x,
              y: flag.pos.y,
              roomName: flag.room!.name
            },
            range: 2
          });
          this.suspend = 'move-' + creep.name;
        }
      }
      else
      {
        this.suspend = 10;
      }
    }
  }
}
