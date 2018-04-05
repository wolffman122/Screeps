import {LifetimeProcess} from '../../os/process'
//import {MoveProcess} from '../creepActions/move'
import {DefendProcess} from '../creepActions/defend'

export class RemoteDefenderLifetimeProcess extends LifetimeProcess
{
  type = 'rdlf';

  run()
  {
    let creep  = this.getCreep();
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

    if(flag.memory.enemies == true)
    {
      let enemies = <Creep[]>flag.room.find(FIND_HOSTILE_CREEPS);

      if(creep.pos.roomName == flag.pos.roomName)
      {
        if(enemies.length > 0)
        {
          let enemy = creep.pos.findClosestByRange(enemies);

          this.fork(DefendProcess, 'defend-' + creep.name, this.priority -1,{
            creep: creep.name,
            target: enemy.id
          });

          return;
        }

      }
      else
      {
        let roomEnemies = <Creep[]>creep.room.find(FIND_HOSTILE_CREEPS);
        if(roomEnemies.length > 0)
        {
          let enemy = creep.pos.findClosestByRange(roomEnemies);

          this.fork(DefendProcess, 'defend-' + creep.name, this.priority -1,{
            creep: creep.name,
            target: enemy.id
          });

          return;
        }
        else
        {

          let retValue = creep.travelTo(flag.pos)
          this.log('RD retvalue ' + retValue);
        }

        return;
      }
    }
  }
}
