import { Process } from "os/process";
import { Utils } from "lib/utils";
import { ControllerAttackLifetimeProcess } from "processTypes/lifetimes/controllerAttack";

interface AttackControllerManagementMetaData
{
  creeps: string[],
  flagName: string
}
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
    this.log('Attack Management');

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
    if(flag.room)
    {
      this.log('Attack 1 ' + this.metaData.creeps.length + ' ' + !flag.room.controller.upgradeBlocked);

      if(this.metaData.creeps.length == 0 && !flag.memory.rollCall)
      {
        flag.memory.rollCall = 0;
      }

      if(this.metaData.creeps.length < numberAttack && !flag.room.controller.upgradeBlocked)
      {
        this.log('Attack 2');
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
          flag.memory.rollCall == this.metaData.creeps.length;
          this.kernel.addProcessIfNotExist(ControllerAttackLifetimeProcess, 'calf-' + creepName, 29, {
            creep: creepName,
            flagName: flag.name,
            numberAttack: numberAttack
          });
        }
      }
    }
  }
}
