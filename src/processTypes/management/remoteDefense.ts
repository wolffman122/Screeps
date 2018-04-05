import {Process} from '../../os/process'

import {Utils} from '../../lib/utils'

import {RemoteDefenderLifetimeProcess} from '../lifetimes/remoteDefender'

export class RemoteDefenseManagementProcess extends Process
{
  type = 'rdmp';

  run()
  {
    let flag = Game.flags[this.metaData.flag];

    if(!flag)
    {
      this.completed = true;
      return;
    }

    if(flag.memory.enemies)
    {
      let defendingCreep  = Game.creeps[this.metaData.defendingCreep];
      let deliverRoom = flag.name.split('-')[0];

      if(!defendingCreep)
      {
        let spawned = Utils.spawn(
          this.kernel,
          deliverRoom,
          'defender',
          'rd-' + flag.pos.roomName + '-' + Game.time,
          {}
        );

        if(spawned)
        {
          this.metaData.defendingCreep = 'rd-' + flag.pos.roomName + '-' + Game.time;
        }
      }
      else
      {
        this.kernel.addProcessIfNotExist(RemoteDefenderLifetimeProcess, 'rdlf-' + defendingCreep.name, this.priority, {
          creep: defendingCreep.name,
          flag: flag.name,
          deliverRoom: deliverRoom
        });
      }
    }
  }
}
