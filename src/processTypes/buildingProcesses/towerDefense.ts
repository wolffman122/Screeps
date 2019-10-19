import {Process} from '../../os/process'
import { HealAttackProcess } from '../management/healAttack';
import { WHITE_LIST } from './mineralTerminal';

enum pattern {
  WAIT,
  RANDOMFIRE,
  LOWEST2HP,
  LOWESTHP,
  LOWEST23HP,
  REPAIR
}

export class TowerDefenseProcess extends Process{
  type = 'td'
  metaData: TowerDefenseProcessMetaData
  towers: StructureTower[];
  room: Room;


  run(){

    this.metaData.counter++;
    this.towers = this.roomData().towers;

    if(this.metaData.counter === 50)
    {
      this.metaData.counter = 0;
      this.metaData.offOn != this.metaData.offOn
    }
    //this.log('Tower Defense');
    this.room = Game.rooms[this.metaData.roomName]

    if(this.room.controller && !this.room.controller.my)
    {
      this.completed = true;
      return;
    }

    let enemies = <Creep[]>this.room.find(FIND_HOSTILE_CREEPS);

    enemies = _.filter(enemies, (e)=> {
      return !_.includes(WHITE_LIST, e.owner.username);
    })


    let flag = Game.flags['Center-'+this.metaData.roomName];

    if(flag) // Bunker
    {
      if(enemies.length > 0)
      {
        if(flag.memory.timeEnemies === undefined || flag.memory.timeEnemies === 0)
        {
          flag.memory.timeEnemies = Game.time;
        }

        let invaders = _.filter(enemies, (e) => {
          return (e.owner.username === 'invader' || e.owner.username === 'Invader');
        });

        if(this.metaData.roomName === 'E41S49')
          console.log(this.name, 'Problem', 2)
        if(invaders.length === 0) // Player attack code
        {
          if(this.metaData.roomName === 'E41S49')
            console.log(this.name, 'Problem', 3)
          this.towerDefense(enemies);
        }
        // Before likeafox code
        /*_.forEach(this.roomData().towers, (t) => {
          let invaders = _.filter(enemies, (e) => {
            return (e.owner.username === 'invader' || e.owner.username === 'Invader');
          });


          /*let target = Game.getObjectById(room.memory.enemyId) as Creep;
          if(invaders.length === 0) // Enemy player code
          {
            if(target === undefined)
            {
              room.memory.enemyId = undefined;
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
                  room.memory.enemyId = target.id;
                }
                else
                {
                  target = rangedEnemies[0];
                  room.memory.enemyId = target.id;
                }
              }
            }
          }*/
        else // Kill invaders
        {
          _.forEach(this.towers, (t) => {
            let target;
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

            if(target)
            {
              t.attack(target);
            }
          });
        }

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

  private towerDefense(hostiles: Creep[]) {
    /*var weakTarget = analyzedBads(hostiles);
    if (weakTarget) {
        console.log(weakTarget, 'Is a weak target');
        e = towers.length;
        while (e--) {
            if (towers[e].energy > 0) {
                towers[e].attack(weakTarget);
            }
        }
        return;
    }*/
    // Then lets see if any hostiles can be taken down below tough.
    /*for (let e in hostiles) {
        if (estimateDamageAndAttack(hostiles[e], hostiles[e].room.find(FIND_MY_CREEPS), towers)) {
            console.log("KILLING", roomLink(hostiles[e].room.name), hostiles[e].owner.username);
            return;
        }
    }*/
    // Now we do tower patterns.
    if (this.room.memory.currentPatternCount === undefined)
      this.room.memory.currentPatternCount = 0; // This tracks which pattern the array is in currently

    if (this.room.memory.currentPatternTimer === undefined)
      this.room.memory.currentPatternTimer = 0; //This keeps track of how long it's be going on for. if it equsl timer of pattern then next.

    var currentPattern = [
      { pattern: pattern.WAIT, timer: 75 },
      { pattern: pattern.RANDOMFIRE, timer: 7 },
      { pattern: pattern.LOWEST2HP, timer: 1 },
      { pattern: pattern.LOWESTHP, timer: 1 },
      { pattern: pattern.WAIT, timer: 5 },
      { pattern: pattern.RANDOMFIRE, timer: 3 },
      { pattern: pattern.LOWEST23HP, timer: 1 },
      { pattern: pattern.LOWEST2HP, timer: 1 },
      { pattern: pattern.LOWESTHP, timer: 1 },
      { pattern: pattern.WAIT, timer: 5 },
      { pattern: pattern.RANDOMFIRE, timer: 3 },
      { pattern: pattern.LOWESTHP, timer: 1 },
      // { pattern: REPAIR, timer: 3 },
    ];

    this.room.memory.currentPatternTimer++;
    if (this.room.memory.currentPatternTimer >= currentPattern[this.room.memory.currentPatternCount].timer)
    {
      this.room.memory.currentPatternTimer = 0;
      this.room.memory.currentPatternCount++;
      if (this.room.memory.currentPatternCount >= currentPattern.length)
        this.room.memory.currentPatternCount = 0;
    }

    console.log('Current tower pattern in ', this.room.name, currentPattern[this.room.memory.currentPatternCount].pattern, this.room.memory.currentPatternTimer,"/", currentPattern[this.room.memory.currentPatternCount].timer);
    switch (currentPattern[this.room.memory.currentPatternCount].pattern)
    {
      case pattern.WAIT:
        //            console.log('waiting');
        break;
      case pattern.RANDOMFIRE:
        if (hostiles.length > 0) {
          let e = this.towers.length;
          while (e--) {
            if (this.towers[e].energy > 0)
              this.towers[e].attack(hostiles[Math.floor(Math.random() * hostiles.length)]);
          }
        }
        break;
      case pattern.LOWESTHP:
        let lowest = _.min(hostiles, a => a.hits);
        if (lowest) {
          let e = this.towers.length;
          while (e--) {
            if (this.towers[e].energy > 0) {
              this.towers[e].attack(lowest);
            }
          }
        }
        break;
      case pattern.LOWEST2HP:
        // sort by smallest to largest hp.
        hostiles = _.sortBy(hostiles, function(o) {
          return o.hits;
        });
        if (hostiles.length > 1) {
          let e = this.towers.length;
          while (e--) {
            if (this.towers[e].energy > 0) {
              this.towers[e].attack(hostiles[1]);
            }
          }
        } else if (hostiles.length > 0) {
          let e = this.towers.length;
          while (e--) {
            if (this.towers[e].energy > 0) {
              this.towers[e].attack(hostiles[0]);
            }
          }
        }
        break;
      case pattern.LOWEST23HP:
        hostiles = _.sortBy(hostiles, function(o) {
          return o.hits;
        });
        if (hostiles.length >= 3) {
          let e = this.towers.length;
          while (e--) {
            if (this.towers[e].energy > 0) {
              if (e > 3) {
                this.towers[e].attack(hostiles[2]);
              }
              else
              {
                this.towers[e].attack(hostiles[1]);
              }
            }
          }
        }
        else if (hostiles.length > 0)
        {
          let e = this.towers.length;
          while (e--) {
            if (this.towers[e].energy > 0) {
              this.towers[e].attack(hostiles[0]);
            }
          }
        }
        break;
      case pattern.REPAIR:
        console.log('doing REPAIR fire');
        break;
    }
  }

  /*function getCreepDamage(target, allies) {
    var total = 0;
    var damage;
    var e;
    _.forEach(allies, function(o) {
        if (o.pos.isNearTo(target)) {
            for (e in o.body) {
                if (o.body[e].type === ATTACK) {
                    damage = 30;
                    if (o.body[e].boost !== undefined) {
                        damage *= BOOSTS.attack[o.body[e].boost].attack;
                    }
                    total += damage;
                }
                if (o.body[e].type === RANGED_ATTACK) {
                    damage = 10;
                    if (o.body[e].boost !== undefined) {
                        damage *= BOOSTS.ranged_attack[o.body[e].boost].rangedAttack;
                    }
                    total += damage;
                }
            }
        } else if (o.pos.getRangeTo(target) <= 3) {
            for (e in o.body) {
                if (o.body[e].type === RANGED_ATTACK) {
                    damage = 10;
                    if (o.body[e].boost !== undefined) {
                        damage *= BOOSTS.ranged_attack[o.body[e].boost].rangedAttack;
                    }
                    total += damage;
                }
            }
        }
    });
    return total;
}
function getTowerDamage(target, towers) {
    var totalDamage = 0;
    for (var e in towers) {
        var towerDamage = 0;
        if (towers[e].energy > 10) {
            var range = target.pos.getRangeTo(towers[e]);
            if (range <= 5) {
                towerDamage += 600;
            } else if (range >= 20) {
                towerDamage += 150;
            } else {
                towerDamage += 600 - (30 * (range-5));
            }
        }
        let multipler = 1.00;
        if (towers[e].effects) {
            for (let i in towers[e].effects) {
                console.log(towers[e].effects[i].power, towers[e].effects[i].level, "twer effects in effect");
                if (towers[e].effects[i].power === PWR_DISRUPT_TOWER) {
                    multipler -= 0.10 * towers[e].effects[i].level;
                }
                if (towers[e].effects[i].power === PWR_OPERATE_TOWER) {
                    multipler += 0.10 * towers[e].effects[i].level;
                }
            }
            towerDamage = towerDamage * multipler;
            //            console.log(towerDamage, towerDamage * multipler, multipler);
        }
        totalDamage += towerDamage;
    }
    return totalDamage;
}
function calcuateDamage(body, amount) {
    var toughType;
    for (var a in body) {
        if (body[a].boost !== undefined && body[a].type == TOUGH) {
            return amount * BOOSTS.tough[body[a].boost].damage;
        }
    }
    return amount;
}
function estimateDamageAndAttack(target, allies, towers) {
    var totalDamage = 0;
    totalDamage += getTowerDamage(target, towers);
    totalDamage += getCreepDamage(target, allies);
    var toughParts = getBoostTough(target.body);
    var totalToughHp = toughParts * 100;
    var damageTotal = calcuateDamage(target.body, totalDamage);
    var currentLossHp = target.hitsMax - target.hits;
    target.room.visual.text(damageTotal, target.pos, { color: 'green', font: 0.8 });
    if (damageTotal + currentLossHp < totalToughHp && toughParts > 0) {
        return false;
    }
    //    if (Game.shard.name == 'shard2')
    //        console.log('est damage', toughParts, target, totalToughHp, damageTotal, damageTotal > totalToughHp);
    target.room.visual.text(damageTotal, target.pos, { color: 'red', font: 0.8 });
    //    console.log(damageTotal, target.pos);
    var e;
    for (e in towers) {
        towers[e].attack(target);
    }
    for (e in allies) {
        if (allies[e].getActiveBodyparts(ATTACK) > 0) {
            allies[e].attack(target);
        }
        if (allies[e].getActiveBodyparts(RANGED_ATTACK) > 0) {
            allies[e].rangedAttack(target);
        }
    }
    return true;
  }

  function scanIfNoHealer(target) {
    let zzz = _.filter(target.pos.findInRange(target.room.enemies, 3), function(o) {
        return o.getActiveBodyparts(HEAL) > 0;
    });
    if (zzz > 0) {
        return true;
    }
    return false;
  }*/
}
