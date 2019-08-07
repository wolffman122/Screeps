import {Process} from '../../os/process'
import { HealAttackProcess } from '../management/healAttack';
import { WHITE_LIST } from './mineralTerminal';

export class TowerDefenseProcess extends Process{
  type = 'td'

  run(){
    //this.log('Tower Defense');
    let room = Game.rooms[this.metaData.roomName]

    if(room.controller && !room.controller.my)
    {
      this.completed = true;
      return;
    }

    let enemies = <Creep[]>room.find(FIND_HOSTILE_CREEPS);

    enemies = _.filter(enemies, (e)=> {
      return !_.includes(WHITE_LIST, e.owner.username);
    })


    let flag = Game.flags['Center-'+this.metaData.roomName];

    if(flag)
    {
      if(enemies.length > 0)
      {
        if(flag.memory.timeEnemies === undefined || flag.memory.timeEnemies === 0)
        {
          flag.memory.timeEnemies = Game.time;
        }

        _.forEach(this.roomData().towers, (t) => {
          let invaders = _.filter(enemies, (e) => {
            return (e.owner.username === 'invader' || e.owner.username === 'Invader');
          });


          let target;
          if(invaders.length === 0)
          {
            // Players attack
            let rangedEnemies;
            rangedEnemies = flag.pos.findInRange(enemies, 10);
            if(rangedEnemies.length > 0)
            {
              let targets = _.filter(rangedEnemies, (e: Creep) => {
                return (e.getActiveBodyparts(HEAL) > 0);
              });

              if(targets.length > 0)
              {
                target = targets[0];
              }
              else
              {
                target = rangedEnemies[0];
              }
            }
          }
          else
          {
            if(flag.memory.timeEnemies! <= Game.time - 400)
            {
              this.log('Invaders around for a long time stop attacking them');
            }
            else
            {
              this.log('Attacking invaders for ' + (flag.memory.timeEnemies! - Game.time + 400));
              // Invaders attack
              let healTargets = _.filter(invaders, e => {
                return (e.getActiveBodyparts(HEAL) > 0);
              });

              let regularTargets = _.filter(invaders, e => {
                return (e.getActiveBodyparts(HEAL) === 0);
              })

              let healRange = 50;
              let regRange = 50;

              console.log(this.name, 'Parts', healTargets.length, regularTargets.length);

              _.forEach(healTargets, (ht) => {
                let range = ht.pos.getRangeTo(flag);
                console.log(this.name, 'HRange', range);
                if(range < healRange)
                  healRange = range;
              })

              _.forEach(regularTargets, (rt) => {
                let range = rt.pos.getRangeTo(flag);
                console.log(this.name, 'Range', range);
                if(range < regRange)
                  regRange = range;
              })

              let dif = healRange - regRange;
              console.log(this.name, healRange, regRange, dif);
              if(dif > 15)
              {
                if(dif > 0)
                {
                  target = flag.pos.findClosestByRange(regularTargets);
                }
                else
                {
                  target = flag.pos.findClosestByRange(healTargets);
                }
              }
              else
              {
                if(healTargets.length > 0)
                {
                  target = flag.pos.findClosestByRange(healTargets);
                }
                else
                {
                  target = flag.pos.findClosestByRange(invaders);
                }
              }
            }
          }

          if(target)
          {
            t.attack(target);
          }
        });
      }
      else
      {
        flag.memory.timeEnemies = 0;
        this.completed = true;
        return;
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
      else
      {
        flag.memory.timeEnemies = 0;
        this.completed = true;
        return;
      }
    }
  }
}
