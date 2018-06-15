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

    this.log('Dismantle ' + flag);
    if(this.name == 'dmpE42S48-Dismantle-2')

    if(!flag)
    {
      this.completed = true;
      return;
    }

    this.log('Metadata ' + flag);
    this.metaData.dismantleCreeps = Utils.clearDeadCreeps(this.metaData.dismantleCreeps);

    let deliverRoom = flag.name.split('-')[0];
    let numberOfDismantlers = +flag.name.split('-')[1];

    this.log('Metadata ' + flag + 1)
    numberOfDismantlers = Math.min(numberOfDismantlers, 3);

    if(this.metaData.dismantleCreeps.length < numberOfDismantlers)
    {
      let creepName = 'dm-' + flag.pos.roomName + '-' + Game.time;
      let spawned = false;
      this.log('Metadata ' + flag + 2 + flag.pos.roomName)

      if(flag.pos.roomName === deliverRoom)
      {
        this.log('Before Spawn');
        spawned = Utils.spawn(
          this.kernel,
          deliverRoom,
          'dismantler',
          creepName,
          {
            addition: 'dismantleCarry',
            max: 45
          }
        )
      }
      else
      {
        spawned = Utils.spawn(
          this.kernel,
          deliverRoom,
          'dismantler',
          creepName,
          {}
        )
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
