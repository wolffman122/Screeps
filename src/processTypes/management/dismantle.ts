import {Process} from '../../os/process'

import {Utils} from '../../lib/utils'

import {DismantleLifetimeProcess} from '../lifetimes/dismantler'

export class DismantleManagementProcess extends Process
{
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

    let dismantleCreep = Game.creeps[this.metaData.dismantleCreep];
    let deliverRoom = flag.name.split('-')[0];

    if(!dismantleCreep)
    {
      let spawned = Utils.spawn(
        this.kernel,
        deliverRoom,
        'dismantler',
        'dm-' + flag.pos.roomName + '-' + Game.time,
        {}
      )

      if(spawned)
      {
        this.metaData.dismantleCreep = 'dm-' + flag.pos.roomName + '-' + Game.time;
      }
    }
    else
    {
      this.kernel.addProcessIfNotExist(DismantleLifetimeProcess, 'dislf-' + dismantleCreep.name, this.priority, {
        creep: dismantleCreep.name,
        flag: flag.name,
        deliverRoom: deliverRoom
      })
    }
  }
}
