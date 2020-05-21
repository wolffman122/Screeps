import {Process} from '../../os/process'
import {Utils} from '../../lib/utils'
import { DefenderLifetimeProcess } from 'processTypes/lifetimes/defender';
import { WHITE_LIST } from 'processTypes/buildingProcesses/mineralTerminal';

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
    if(room.memory.shutdown)
    {
      this.completed = true;
      return;
    }

    let flagName = 'Center-' + this.metaData.roomName;
    let flag = Game.flags[flagName];

    let enemies = <Creep[]>room.find(FIND_HOSTILE_CREEPS);
    if(enemies.length === 0)
      return;

    let invaders = _.filter(enemies, (e) => {
      return (e.owner.username === 'invader' || e.owner.username === 'Invader');
    });

    if(this.name === 'dm-E58S44')
      console.log(this.name, enemies.length, '?????????????????????????')
    enemies = _.filter(enemies, (e)=> {
      return !_.includes(WHITE_LIST, e.owner.username);
    });

    if(this.name === 'dm-E58S44')
      console.log(this.name, enemies.length, '...........................')

    if(enemies.length === 0)
      return;

    if(invaders.length > 0)
    {
      return;
    }

    if(room.controller && room.controller.my)
    {
      if(this.name === 'dm-E58S44')
      console.log(this.name, enemies.length, '...........................')
      let dangerEnemies = _.filter(enemies, (e) => {
        return (e.getActiveBodyparts(ATTACK) > 0 || e.getActiveBodyparts(RANGED_ATTACK) > 0) &&
          flag.pos.inRangeTo(e, 15);
      });


      let numberDefenders = 0;
      if(dangerEnemies.length)
        numberDefenders = 1;
      else if(dangerEnemies.length >= 4)
        numberDefenders = 2;
      

      if(this.metaData.defenderCreeps.length < numberDefenders)
      {
        let creepName = 'dm-' + this.metaData.roomName + '-' + Game.time;
        let spawned = Utils.spawn(this.kernel, this.metaData.roomName, 'defender', creepName, {});


        if(spawned)
        {
          this.metaData.defenderCreeps.push(creepName);
          let boosts = [];
          boosts.push(RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE,
            RESOURCE_CATALYZED_UTRIUM_ACID);
          this.kernel.addProcess(DefenderLifetimeProcess, 'deflf-' + creepName, 60, {
            creep: creepName,
            roomName: this.metaData.roomName,
            flagName: flagName,
            boosts: boosts
          });
        }
      }
    }
    else
    {
      this.completed = true;
      return;
    }
  }
}
