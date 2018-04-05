import { Process } from "os/process";
import { MoveProcess } from "processTypes/creepActions/move";
import { Utils } from "lib/utils";

interface BounceAttackMetaData
{
  creep: string,
  flagName: string
}

export class BounceAttackProcess extends Process
{
  metaData: BounceAttackMetaData
  type = 'bounce';

  run()
  {
    this.log('Bounce Attack');

    let flag = Game.flags[this.metaData.flagName];
    let creep = Game.creeps[this.metaData.creep];

    let spawnRoom = this.metaData.flagName.split('-')[0];

    if(!flag)
    {
      this.completed = true;
      return;
    }

    if(!creep)
    {
      let creepName = 'attackB-' + flag.pos.roomName + '-' + Game.time;
      let spawned = Utils.spawn(
        this.kernel,
        spawnRoom,
        'toughDefender',
        creepName,
        {}
      );

      if(spawned)
      {
        this.metaData.creep = creepName;
      }
    }

    if(creep.pos.roomName != flag.pos.roomName && creep.hits === creep.hitsMax)
    {
      this.kernel.addProcessIfNotExist(MoveProcess, 'move-' + creep.name, this.priority-1, {
        creep: creep.name,
        pos: flag.pos,
        range: 1
      });

      return;
    }
    else
    {
      let healName = flag.name + '-Heal';
      let healFlag = Game.flags[healName];

      if(!creep.pos.inRangeTo(flag,1) && creep.hits === creep.hitsMax)
      {
        this.log('2)')
        this.kernel.addProcessIfNotExist(MoveProcess, 'move-' + creep.name, this.priority-1, {
          creep: creep.name,
          pos: flag.pos,
          range: 1
        });

        return;
      }

      if(creep.hits < creep.hitsMax * .50)
      {
        this.kernel.addProcessIfNotExist(MoveProcess, 'move-' + creep.name, this.priority-1, {
          creep: creep.name,
          pos: healFlag.pos,
          range: 1
        });
        return;
      }
    }
  }
}
