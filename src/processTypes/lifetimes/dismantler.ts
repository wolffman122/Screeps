import {LifetimeProcess} from '../../os/process'
import {DismantleProcess} from '../creepActions/dismantle'
import {MoveProcess} from '../creepActions/move'

export class DismantleLifetimeProcess extends LifetimeProcess
{
  type = 'dislf'

  run()
  {
    let creep = this.getCreep();

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

    let boost = this.metaData.flag.split('-')[2];
    if(boost === 'boost' && !creep.memory.boost)
    {
      creep.boostRequest([RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE, RESOURCE_CATALYZED_ZYNTHIUM_ACID], false);
      return;
    }

    if(creep.pos.roomName == flag.pos.roomName)
    {
      this.fork(DismantleProcess, 'dismantle-' + creep.name, this.priority - 1, {
        creep: creep.name,
        flagName: flag.name
      });

      return
    }
    else
    {
      creep.travelTo(flag, {allowHostile: false});
      return;
    }
  }
}
