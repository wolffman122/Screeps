import {Process} from '../../os/process'
import {Utils} from '../../lib/utils'
import {DismantleLifetimeProcess} from '../lifetimes/dismantler'

export class DismantleManagementProcess extends Process
{
  metaData: DismantleManagementProcessMetaData
  type = 'dmp';

  run()
  {
    let flag = Game.flags[this.metaData.flag];

    this.log('Dismantle ' + flag);
    if(!flag)
    {
      this.completed = true;
      return;
    }

    this.metaData.dismantleCreeps = Utils.clearDeadCreeps(this.metaData.dismantleCreeps);

    let deliverRoom = flag.name.split('-')[0];
    let numberOfDismantlers = +flag.name.split('-')[2];

    if(this.metaData.dismantleCreeps.length < numberOfDismantlers)
    {
      let creepName = 'dm-' + flag.pos.roomName + '-' + Game.time;
      let spawned = Utils.spawn(
        this.kernel,
        deliverRoom,
        'dismantler',
        creepName,
        {}
      )

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
