import { Process } from "os/process";
import { Utils } from "lib/utils";
import { MoveProcess } from "processTypes/creepActions/move";

interface HealAttackMetaData
{
  creep: string,
  flagName: string
}

export class HealAttackProcess extends Process
{
  metaData: HealAttackMetaData;
  type = 'healAttack';

  run()
  {
    let flag = Game.flags[this.metaData.flagName];
    let creep = Game.creeps[this.metaData.creep];



    if(!flag)
    {
      this.completed = true;
      return;
    }

    let spawnRoom = flag.name.split('-')[0];

    if(!creep)
    {
      let creepName = 'healA-' + flag.pos.roomName + '-' + Game.time;
      let spawned = Utils.spawn(
        this.kernel,
        spawnRoom,
        'healer',
        creepName,
        {}
      );

      if(spawned)
      {
        this.metaData.creep = creepName;
      }
    }

    if(creep.pos.roomName != flag.pos.roomName)
    {
      this.kernel.addProcessIfNotExist(MoveProcess, 'move-' + creep.name, this.priority-1, {
        creep: creep.name,
        pos: flag.pos,
        range: 1
      });

      return;
    }

    let roomCreeps = <Creep[]>creep.room.find(FIND_CREEPS);

    let hurtCreeps = _.filter(roomCreeps, (c) => {
      return (c.hits < c.hitsMax);
    })

    if(hurtCreeps.length > 0)
    {
      let heal = creep.pos.findClosestByRange(hurtCreeps);

      if(heal)
      {
        if(creep.heal(heal) == ERR_NOT_IN_RANGE)
        {
          creep.travelTo(heal);
        }
      }
    }
  }
}
