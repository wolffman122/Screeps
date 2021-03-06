import { Process } from "os/process";
import { Utils } from "lib/utils";
import { ControllerAttackLifetimeProcess } from "processTypes/lifetimes/controllerAttack";

export class  AttackControllerManagementProcess extends Process
{
  metaData: AttackControllerManagementMetaData;
  type = 'acmp';

  ensureMetaData()
  {
    if(!this.metaData.creeps)
      this.metaData.creeps = [];
  }

  run()
  {
    this.log('Attack Management 1');

    this.ensureMetaData();

    let flag = Game.flags[this.metaData.flagName];

    if(!flag)
    {
      this.completed = true;
      return;
    }

    let spawnRoom = this.metaData.flagName.split('-')[0];
    let numberAttack = Number(this.metaData.flagName.split('-')[1]);

    this.metaData.creeps = Utils.clearDeadCreeps(this.metaData.creeps);

    //this.log('Attack 1 ' + this.metaData.creeps.length + ' ' + flag.room!.controller!.upgradeBlocked);

    if(flag.room)
    {
      if(this.metaData.creeps.length < numberAttack && flag.room!.controller && !flag.room!.controller!.upgradeBlocked)
      {
        let creepName = 'attackC-' + flag.pos.roomName + '-' + Game.time;
        let spawned = Utils.spawn(
          this.kernel,
          spawnRoom,
          'attackController',
          creepName,
          {}
        );

        if(spawned)
        {
          this.metaData.creeps.push(creepName);
          this.kernel.addProcessIfNotExist(ControllerAttackLifetimeProcess, 'calf-' + creepName, 29, {
            creep: creepName,
            flagName: flag.name,
            numberAttack: numberAttack,
            rollCall: this.metaData.creeps.length
          });
        }
      }
    }
    else
    {
      if(this.metaData.creeps.length < numberAttack)
      {
        let creepName = 'attackC-' + flag.pos.roomName + '-' + Game.time;
        let spawned = Utils.spawn(
          this.kernel,
          spawnRoom,
          'attackController',
          creepName,
          {}
        );

        if(spawned)
        {
          this.metaData.creeps.push(creepName);
          this.kernel.addProcessIfNotExist(ControllerAttackLifetimeProcess, 'calf-' + creepName, 29, {
            creep: creepName,
            flagName: flag.name,
            numberAttack: numberAttack,
            rollCall: this.metaData.creeps.length
          });
        }
      }
    }

  }
}
