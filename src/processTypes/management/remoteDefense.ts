import {Process} from '../../os/process'
import {Utils} from '../../lib/utils'
import {RemoteDefenderLifetimeProcess} from '../lifetimes/remoteDefender'

export class RemoteDefenseManagementProcess extends Process
{
  type = 'rdmp';
  metaData: RemoteDefenseManagementProcessMetaData;

  run()
  {
    let flag = Game.flags[this.metaData.flagName];

    if(!flag)
    {
      this.completed = true;
      return;
    }

    if(flag.memory.enemies)
    {
      this.metaData.defendingCreep = Utils.clearDeadCreeps(this.metaData.defendingCreep);
      let deliverRoom = flag.name.split('-')[0];

      if(this.metaData.defendingCreep.length < 1)
      {
        let creepName = 'rd-' + flag.pos.roomName + '-' + Game.time;
        let spawned = Utils.spawn(
          this.kernel,
          deliverRoom,
          'defender',
          creepName,
          {}
        );

        if(spawned)
        {
          this.metaData.defendingCreep.push(creepName);
          this.kernel.addProcessIfNotExist(RemoteDefenderLifetimeProcess, creepName, this.priority, {
            creep: creepName,
            flag: flag.name,
            deliverRoom: deliverRoom
          });
        }
      }
    }
  }
}
