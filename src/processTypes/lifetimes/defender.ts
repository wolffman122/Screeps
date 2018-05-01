import {LifetimeProcess} from '../../os/process'
import {MoveProcess} from '../creepActions/move'
import {DefendProcess} from '../creepActions/defend'

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
    let enemies  = <Creep[]>flag.pos.findInRange(FIND_HOSTILE_CREEPS, 14);

    if(enemies.length > 0)
    {
      let targets = _.filter(enemies, e => {
        return (e.getActiveBodyparts(HEAL) > 0);
      });

      let target;
      if(targets.length > 0)
      {
        target = creep.pos.findClosestByRange(targets);
      }
      else
      {
        target  = creep.pos.findClosestByRange(enemies);
      }

      this.fork(DefendProcess, 'defend-' + creep.name, this.priority - 1, {
        creep: creep.name,
        target: target.id,
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
