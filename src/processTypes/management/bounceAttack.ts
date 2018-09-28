import { Process } from "os/process";
import { MoveProcess } from "processTypes/creepActions/move";
import { Utils } from "lib/utils";
import { BounceAttackerLifetimeProcess } from "../lifetimes/bounceAttacker";

export class BounceAttackManagementProcess extends Process
{
  metaData: BounceAttackManagementMetaData
  type = 'bamp';

  ensureMetaData()
  {
    if(!this.metaData.bounceAttackCreeps)
      this.metaData.bounceAttackCreeps = [];
  }

  run()
  {
    this.log('Bounce Attack');
    this.ensureMetaData();

    let flag = Game.flags[this.metaData.flagName];

    let spawnRoom = this.metaData.flagName.split('-')[0];
    let numberOfAttackers = +this.metaData.flagName.split('-')[1];
    if(!flag)
    {
      this.completed = true;
      return;
    }

    this.metaData.bounceAttackCreeps = Utils.clearDeadCreeps(this.metaData.bounceAttackCreeps);

    if(this.metaData.bounceAttackCreeps.length < numberOfAttackers)
    {
      let creepName = 'attackB-' + flag.pos.roomName + '-' + Game.time;
      let spawned = Utils.spawn(
        this.kernel,
        spawnRoom,
        'bounce',
        creepName,
        {}
      );

      if(spawned)
      {
        this.metaData.bounceAttackCreeps.push(creepName);
        this.kernel.addProcessIfNotExist(BounceAttackerLifetimeProcess, 'balf-' + creepName, this.priority -1, {
          creep: creepName,
          flagName: flag.name
        })
      }
    }
  }
}
