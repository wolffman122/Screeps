import {Process} from '../../os/process'
import {Utils} from '../../lib/utils'

import {DefenderLifetimeProcess} from '../lifetimes/defender'

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
    let flagName = 'Center-' + this.metaData.roomName;
    let flag = Game.flags[flagName];

    let enemies = <Creep[]>room.find(FIND_HOSTILE_CREEPS)
    let dangerEnemies = _.filter(enemies, (e) => {
      return (e.getActiveBodyparts(ATTACK) > 0 || e.getActiveBodyparts(RANGED_ATTACK) > 0) &&
        flag.pos.inRangeTo(e, 15);
    });


    if(this.metaData.defenderCreeps.length < dangerEnemies.length)
    {
      let creepName = 'dm-' + this.metaData.roomName + '-' + Game.time;
      let spawned = Utils.spawn(this.kernel, this.metaData.roomName, 'defender', creepName, {});


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
