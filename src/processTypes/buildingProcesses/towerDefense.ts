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

    enemies = enemies.filter( e=> {
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

        let invaders = enemies.filter(e => {
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
              let healTargets = invaders.filter(e => {
                return (e.getActiveBodyparts(HEAL) > 0);
              });

              let regularTargets = invaders.filter(e => {
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
            let targets = rangedEnemies.filter(e => {
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
}
