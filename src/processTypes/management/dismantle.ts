import {Process} from '../../os/process'
import {Utils} from '../../lib/utils'
import {DismantleLifetimeProcess} from '../lifetimes/dismantler'

export class DismantleManagementProcess extends Process
{
  metaData: DismantleManagementProcessMetaData
  type = 'dmp';

  ensureMetaData()
  {
    if(!this.metaData.dismantleCreeps)
    {
      this.metaData.dismantleCreeps = [];
    }
  }

  run()
  {
    this.ensureMetaData();
    let flag = Game.flags[this.metaData.flagName];

    if(!flag)
    {
      this.completed = true;
      return;
    }
    let room = flag.room;


    if(room)
    {
      let look = flag.pos.look();
      console.log(this.name, 1)
      if(look.length === 1)
      {
          flag.remove();
          this.completed = true;
          return;
      }
    }

    this.metaData.dismantleCreeps = Utils.clearDeadCreeps(this.metaData.dismantleCreeps);

    let deliverRoom = flag.name.split('-')[0];
    let numberOfDismantlers = +flag.name.split('-')[1];
    let boostLevel = +flag.name.split('-')[2];


    numberOfDismantlers = Math.min(numberOfDismantlers, 3);

    console.log(this.name, 2)
    if(this.metaData.dismantleCreeps.length < numberOfDismantlers)
    {
      console.log(this.name, 3)
      let creepName = 'dm-' + flag.pos.roomName + '-' + Game.time;
      let spawned = false;
      this.log('Metadata ' + flag + 2 + flag.pos.roomName)

      if(flag.pos.roomName === deliverRoom)
      {
        this.log('Before Spawn');
        spawned = Utils.spawn(
          this.kernel,
          deliverRoom,
          'allWork',
          creepName,
          {}
        )
      }
      else
      {
        console.log(this.name, 4);
        spawned = Utils.spawn(
          this.kernel,
          deliverRoom,
          'allWork',
          creepName,
          {}
        )
        console.log(this.name, 5);
      }

      if(spawned)
      {
        this.metaData.dismantleCreeps.push(creepName);
        this.kernel.addProcessIfNotExist(DismantleLifetimeProcess, 'dislf-' + creepName , this.priority, {
          creep: creepName,
          flag: flag.name,
          deliverRoom: deliverRoom
        });
      }
    }
  }
}
