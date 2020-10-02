import { Process } from "os/process";
import { Utils } from "lib/utils";
import { AttackerLifetimeProcess } from "../lifetimes/attacker";
import { HealerLifetimeProcess } from "../lifetimes/healer";
import { SquadAttackerLifetimeProcess } from "../lifetimes/squadAttacker";

export class SquadManagementProcess extends Process
{
  type = 'sqm';
  metaData: SquadManagementProcessMetaData
  attackRoomName: string;
  rallyFlag: Flag;
  squadPoint: RoomPosition;


  public ensureMetaData()
  {
      if(!this.metaData.attackers)
          this.metaData.attackers = [];

      if(!this.metaData.healers)
          this.metaData.healers = [];
  }

  public getFlags(identifier: string, max: number)
  {
      let flags = [];
      for(let i = 0; i < max; i++)
      {
          let flag = Game.flags[identifier + '-' + i];
          if(flag)
          {
              flags.push(flag);
          }
      }

      return flags;
  }

  public run()
  {
    this.completed = true;
    return;
  }
  test()
  {
    console.log(this.name, '!!!!!!!!!!!!!!!!!!!!!!! SQUAD TESTING !!!!!!!!!!!!!!!!!!!!!!!!');
    this.ensureMetaData();

    console.log(this.name, 1, this.metaData.flagName);
    this.rallyFlag = Game.flags[this.metaData.flagName];
    if(!this.rallyFlag)
    {
      console.log(this.name, 2);
      this.completed = true;
      return;
    }
    else
    {
      this.metaData.roomName = this.rallyFlag.pos.roomName;
      console.log(this.name, 3);
    }

    this.metaData.attackers = Utils.clearDeadCreeps(this.metaData.attackers);
    if(this.metaData.attackers.length < 4)
    {
      const creepName = 'Squad-' + this.metaData.attackers.length + '-' + Game.time;
      const spawned = Utils.spawn(this.kernel, this.metaData.roomName, 'vision', creepName, {});
      if(spawned)
        this.metaData.attackers.push(creepName);
    }

    if (this.metaData.attackers.length && !this.metaData.rollCallGood)
    {
      let rollCallGood = true;
      for(let i = 0; i < this.metaData.attackers.length; i++)
      {
        console.log(this.name, 4, i);
        const creep = Game.creeps[this.metaData.attackers[i]];
        rollCallGood = this.RallyPoint(creep) && rollCallGood;
        console.log(this.name, 5, creep);
      }

      if(rollCallGood)
      {
      this.metaData.rollCallGood = rollCallGood;
      this.metaData.squadPoint = this.rallyFlag.pos.x + ',' + this.rallyFlag.pos.y;
      }
    }

    if(this.metaData.rollCallGood)
      this.MoveSquad();
  }

  private RallyPoint(creep: Creep) : boolean
  {
    let inPos = false;

    const fpos = this.rallyFlag.pos
    const pos1 = new RoomPosition(fpos.x, fpos.y-1, fpos.roomName);
    const pos2 = new RoomPosition(fpos.x+1, fpos.y-1, fpos.roomName);
    const pos3 = new RoomPosition(fpos.x+1, fpos.y, fpos.roomName);

    console.log(this.name, 'RP', 1, creep);
    if(this.rallyFlag.pos.lookFor(LOOK_CREEPS).length == 0)
    {
      if(!creep.pos.isEqualTo(this.rallyFlag))
        creep.travelTo(this.rallyFlag);
    }
    else if (pos1.lookFor(LOOK_CREEPS).length == 0)
    {
      if (!creep.pos.isEqualTo(pos1))
        creep.travelTo(pos1);
    }
    else if (pos2.lookFor(LOOK_CREEPS).length == 0)
    {
      if (!creep.pos.isEqualTo(pos2))
        creep.travelTo(pos2);
    }
    else if (pos3.lookFor(LOOK_CREEPS).length == 0)
    {
      if (!creep.pos.isEqualTo(pos3))
        creep.travelTo(pos3);
    }
    else
      inPos = true;

    return inPos;
  }

  private MoveSquad()
  {
    const startPos = new RoomPosition(+this.metaData.squadPoint.split(',')[0], +this.metaData.squadPoint.split(',')[1], this.metaData.roomName)

    const pathResult = PathFinder.search(startPos, new RoomPosition(13, 14, 'E29S26'),
    {
      plainCost: 1,
      swampCost: 5,
      roomCallback: function(roomName)
      {
        let room = Game.rooms[roomName];
        if(!room)
          return;

        let costs = new PathFinder.CostMatrix;
        const terrain = new Room.Terrain(roomName);
        for(let y = 0; y < 50; y++)
        {
          for(let x = 0; x < 50; x++)
          {
            const tile = terrain.get(x, y);
            if(tile === TERRAIN_MASK_WALL)
            {
              costs.set(x, y, 255);
              const top = Math.max(y-1, 0);
              const left = Math.max(x-1, 0);
              const bottom = Math.min(y+1, 49);
              const right = Math.min(x+1, 49);
              const area = room.lookAtArea(top, left, bottom, right, true);
              for(let i = 0; i < area.length; i++)
              {
                const spot = area[i];
                if(spot.terrain === 'plain')
                  costs.set(spot.x, spot.y, 255);
              }
            }
            else if(costs.get(x,y) === 0)
            {

            const weight = (tile === TERRAIN_MASK_SWAMP) ? 5 : 1;

            costs.set(x, y, weight);
            }
          }
        }

        // Just for checking cost matrix should be commented out most of the time.
        const visual = new RoomVisual(roomName);
        for (let y = 0; y < 50; y++)
        {
          for (let x = 0; x < 50; x++)
          {
            visual.text(costs.get(x,y).toString(), x, y);
          }
        }

        return costs
      },
    });

    if(!pathResult.incomplete)
    {
      const squadMoveDir = startPos.getDirectionTo(pathResult.path[0]);
      let allMoved = true;
      for(let i = 0; i < this.metaData.attackers.length; i++)
      {
        const creep = Game.creeps[this.metaData.attackers[i]];
        if(creep)
        {
          allMoved = ((creep.move(squadMoveDir) === OK) ? true : false) && allMoved;
          creep.say(creep.moveDir(squadMoveDir), true);
        }
      }

      if(allMoved)
      {
        this.metaData.squadPoint = pathResult.path[0].x + ',' + pathResult.path[0].y;
      }
    }
  }
}
