import {Process} from '../../os/process'

export class TowerDefenseProcess extends Process{
  type = 'td'

  run(){
    this.log('Tower Defense');
    let room = Game.rooms[this.metaData.roomName]
    let enemies = <Creep[]>room.find(FIND_HOSTILE_CREEPS)
    let damagedCreeps = <Creep[]>room.find(FIND_CREEPS, {filter: cp => cp.hits < cp.hitsMax});

    if(enemies.length > 0)
    {
      _.forEach(this.kernel.data.roomData[this.metaData.roomName].towers, function(tower)
      {
        let rangedEnemies = tower.pos.findInRange(enemies,20)
        if(rangedEnemies.length > 0)
        {
          let targets = _.filter(rangedEnemies, e => {
            return (e.getActiveBodyparts(HEAL) > 0);
          });

          if(targets.length > 0)
          {
            tower.attack(targets[0]);
          }
          else
          {
            tower.attack(rangedEnemies[0]);
          }

        }
      })
    }
    else if (damagedCreeps.length > 0)
    {
      _.forEach(this.kernel.data.roomData[this.metaData.roomName].towers, function(tower)
      {
        let rangeDamage = tower.pos.findInRange(damagedCreeps, 30);
        if(rangeDamage.length > 0)
        {
          let target = tower.pos.findClosestByPath(rangeDamage);

          if(target)
          {
            tower.heal(target);
          }
        }
      });
    }
    else
    {
      this.completed = true
    }
  }
}
