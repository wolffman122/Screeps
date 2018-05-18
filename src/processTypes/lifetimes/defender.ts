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
    let centerFlag = Game.flags["Center-"+creep.room.name];
    let flag = Game.flags[this.metaData.flagName];


    if(centerFlag)
    {
      let enemies  = <Creep[]>centerFlag.pos.findInRange(FIND_HOSTILE_CREEPS, 14);

      if(enemies.length > 0)
      {
        let targets = _.filter(enemies, (e)=> {
          return (e.getActiveBodyparts(HEAL) > 0);
        });

        let target;
        if(targets.length > 0)
        {
          target = centerFlag.pos.findClosestByRange(targets);
        }
        else
        {
          target = centerFlag.pos.findClosestByRange(enemies);
        }

        if(creep.pos.inRangeTo(target,1))
        {
          creep.attack(target);
        }

        creep.travelTo(target, {range: 1});
      }
      else
      {
        if(flag)
        {
          if(!creep.pos.inRangeTo(flag.pos, 2))
          {
            creep.travelTo(flag, {range: 2});
          }
        }
        else
        {
          this.suspend = 10;
        }
      }
    }
    else
    {
      /// Non Bunker rooms --- TODO need to find better way to do this.
      let enemies  = <Creep[]>flag.pos.findInRange(FIND_HOSTILE_CREEPS, 20);
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
          flagName: flag.name
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
}
