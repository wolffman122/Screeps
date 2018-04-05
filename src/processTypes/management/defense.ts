import {Process} from '../../os/process'
import {Utils} from '../../lib/utils'

import {DefenderLifetimeProcess} from '../lifetimes/defender'


interface DefenseManagementProcessMetaData
{
  roomName: string
  defenderCreeps: string[]
}

export class DefenseManagementProcess extends Process
{
  metaData: DefenseManagementProcessMetaData;
  type = 'dm'

  ensureMetaData()
  {
    if(!this.metaData.defenderCreeps)
    {
      this.metaData.defenderCreeps = [];
    }
  }
  run()
  {
    this.ensureMetaData();

    if(!this.kernel.data.roomData[this.metaData.roomName]){
      this.completed = true
      return
    }

    this.metaData.defenderCreeps = Utils.clearDeadCreeps(this.metaData.defenderCreeps);

    let room = Game.rooms[this.metaData.roomName]
    let enemies = <Creep[]>room.find(FIND_HOSTILE_CREEPS)

    if(this.metaData.defenderCreeps.length < enemies.length)
    {
      let creepName = 'dm-' + this.metaData.roomName + '-' + Game.time;
      let spawned = Utils.spawn(this.kernel, this.metaData.roomName, 'defender', creepName, {});

      let flagName = 'Defense-' + this.metaData.roomName;
      if(spawned)
      {
        this.metaData.defenderCreeps.push(creepName);
        this.kernel.addProcess(DefenderLifetimeProcess, 'deflf-' + creepName, 60, {
          creep: creepName,
          flagName: flagName
        });
      }
    }
  }
}
