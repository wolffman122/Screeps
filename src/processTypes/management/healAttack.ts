import { Process } from "os/process";
import { Utils } from "lib/utils";
import { MoveProcess } from "processTypes/creepActions/move";

export class HealAttackProcess extends Process
{
  metaData: HealAttackMetaData;
  type = 'healAttack';

  run()
  {
    let flag = Game.flags[this.metaData.flagName];
    let creep = Game.creeps[this.metaData.creep];

    Utils.clearDeadCreep(this.metaData.creep)

    if(!flag)
    {
      this.completed = true;
      return;
    }

    let spawnRoom = flag.name.split('-')[0];



    console.log(this.name, 1)
    if(!creep)
    {
      console.log(this.name, 2)
      let creepName = 'healA-' + flag.pos.roomName + '-' + Game.time;
      let spawned = Utils.spawn(
        this.kernel,
        spawnRoom,
        'healer',
        creepName,
        {}
      );

      console.log(this.name, 3, spawned)
      if(spawned)
      {
        console.log(this.name, 4)
        this.metaData.creep = creepName;
      }
    }

    if(creep.pos.roomName != flag.pos.roomName)
    {
      if(!creep.pos.isNearTo(flag.pos))
      {
        creep.heal(creep);
        creep.travelTo(flag);
      }
      return;
    }

    console.log(this.name, 6)
    let roomCreeps = <Creep[]>creep.room.find(FIND_MY_CREEPS);

    let hurtCreeps = _.filter(roomCreeps, (c) => {
      return (c.hits < c.hitsMax && c.my);
    })

    console.log(this.name, 7)
    if(hurtCreeps.length > 0)
    {
      console.log(this.name, 8)
      let heal = creep.pos.findClosestByRange(hurtCreeps);

      if(heal)
      {
        if(creep.heal(heal) == ERR_NOT_IN_RANGE)
        {
          creep.travelTo(heal);
        }
      }
    }
    else
    {
      creep.travelTo(flag, {range: 2})
    }
  }
}
