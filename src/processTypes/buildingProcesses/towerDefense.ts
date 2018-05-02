import {Process} from '../../os/process'

export class TowerDefenseProcess extends Process{
  type = 'td'

  run(){
    this.log('Tower Defense');
    let room = Game.rooms[this.metaData.roomName]
    let enemies = <Creep[]>room.find(FIND_HOSTILE_CREEPS)
    let damagedCreeps = <Creep[]>room.find(FIND_CREEPS, {filter: cp => cp.hits < cp.hitsMax});
    let flag = Game.flags['Center-'+this.metaData.roomName];

    if(flag)
    {
      if(enemies.length > 0)
      {
        _.forEach(this.roomData().towers, (t) => {
          let rangedEnemies = flag.pos.findInRange(enemies, 10);
          if(rangedEnemies.length > 0)
          {
            let targets = _.filter(rangedEnemies, e => {
              return (e.getActiveBodyparts(HEAL) > 0);
            });

            if(targets.length > 0)
            {
              t.attack(targets[0]);
            }
            else
            {
              t.attack(rangedEnemies[0]);
            }
          }
        });
      }
      else if(damagedCreeps.length > 0)
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
        this.suspend = 5;
      }

    }
    else
    {
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
        this.suspend = 5;
      }
    }
  }
}
