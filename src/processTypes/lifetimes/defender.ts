import {LifetimeProcess} from '../../os/process'
import {MoveProcess} from '../creepActions/move'
import {DefendProcess} from '../creepActions/defend'

export class DefenderLifetimeProcess extends LifetimeProcess
{
  metaData: DefenderLifetimeProcessMetaData;
  type = 'deflf'

  run()
  {
    console.log(this.name, -1)
    let creep = this.getCreep();

    if(!creep)
    {
      return;
    }
    if(creep.room.memory.shutdown)
    {
      this.completed = true;
      return;
    }
    
    console.log(this.name, 0)
    if(creep.name === 'dm-E41S49-21090530')
        console.log(this.name, 'Problems', this.metaData.boosts, creep.memory.boost);
    if(this.metaData.boosts && !creep.memory.boost)
    {
        creep.boostRequest(this.metaData.boosts, false);
        return;
    }

    let room = Game.rooms[this.metaData.roomName];
    let centerFlag = Game.flags["Center-" + room.name];
    let flag = Game.flags[this.metaData.flagName];

    console.log(this.name, 1)
    if(centerFlag)
    {
      let enemies  = <Creep[]>centerFlag.pos.findInRange(FIND_HOSTILE_CREEPS, 14);

      if(enemies.length === 0 && creep.ticksToLive < 1000)
      {
        let container = this.kernel.data.roomData[creep.pos.roomName].generalContainers[0];
        if(creep.pos.inRangeTo(container.pos, 0))
        {
          creep.suicide();
          return;
        }

        creep.travelTo(container);
        return;
      }

      console.log(this.name, 2)
      if(enemies.length > 0)
      {
        let targets = _.filter(enemies, (e)=> {
          return (e.getActiveBodyparts(HEAL) > 0);
        });

        let target: Creep;
        if(targets.length > 0)
        {
          target = centerFlag.pos.findClosestByPath(targets);
        }
        else
        {
          target = centerFlag.pos.findClosestByPath(enemies);
        }
        console.log(this.name, 'targeting', 1);
        console.log(this.name, 'targeting', target);
        console.log(this.name, 'targeting', 2);
        if(creep.pos.inRangeTo(target,1))
        {
          creep.attack(target);
          return;
        }

        console.log(this.name, 'targeting', target);
        let ret = PathFinder.search(creep.pos, {pos:target.pos, range:1}, {roomCallback: roomName => this.GetCostMatrix(room.name)});
        if(ret && ret.path)
        {
            let retv = creep.moveByPath(ret.path);
            console.log(this.name, retv, ret.path);
            return;
        }
        else
          console.log(this.name, 'Problem with moving defense');

      }
      else
      {
        let farEnemies = centerFlag.room.find(FIND_HOSTILE_CREEPS);
        if(farEnemies.length > 0)
        {
            let target = creep.pos.findClosestByPath(farEnemies);
            if(creep.pos.isNearTo(target))
            {
                creep.attack(target);
            }
            creep.moveTo(target);
            return;
        }
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
      if(flag)
      {
        /// Non Bunker rooms --- TODO need to find better way to do this.
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

  GetCostMatrix(roomName: string): boolean | CostMatrix
  {
      const room = Game.rooms[roomName];
      return PathFinder.CostMatrix.deserialize(room.memory.rampartCostMatrix);
  }
}
