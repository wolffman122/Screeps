import {Process} from '../../os/process'
import {MoveProcess} from '../creepActions/move'
import {Utils} from '../../lib/utils'

export class ClaimProcess extends Process{
  metaData: ClaimProcessMetaData
  type = 'claim'

  run(){
    let creep = Game.creeps[this.metaData.creep]

    let flag = Game.flags[this.metaData.flagName]

    this.log('Claim Process')
    if(!flag){
      this.completed = true

      return
    }

    let startRoom = this.metaData.flagName.split('-')[1];

    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! Start Room", startRoom);
    if(!creep)
    {
      let creepName = 'claim-' + this.metaData.targetRoom + '-' + Game.time
      let spawned = false;

      if(startRoom)
      {
        spawned = Utils.spawn(
          this.kernel,
          startRoom,
          'claimer',
          creepName,
          {}
        )
      }
      else
      {
        spawned = Utils.spawn(
          this.kernel,
          Utils.nearestRoom(this.metaData.targetRoom, 550),
          'claimer',
          creepName,
          {}
        )
      }

      if(spawned)
      {
        this.metaData.creep = creepName
      }

      return;
    }

    if(startRoom)
    {
      if(creep.memory.roomPath === undefined)
      {
        creep.memory.roomPath = Utils.roomPath(creep.pos, flag.pos);
      }

      if(creep.memory.currentRoom === undefined)
      {
        creep.memory.currentRoom = creep.room.name;
      }

      console.log("Claim PathFinder Method");
      if(creep.memory.currentRoom !== creep.room.name)
      {
        creep.memory.currentRoom = creep.room.name;
        let exit: {exit: ExitConstant, room: string} | undefined;
        if(creep.memory.roomPath != -2)
        {
          exit = _.find(creep.memory.roomPath, (rp) => {
            if(rp.room === creep.room.name)
            {
              return rp;
            }
            return;
          });

          if(exit)
          {
            const location = creep.pos.findClosestByRange(exit.exit);
            let options: PathFinderOpts = {
              plainCost: 2,
              swampCost: 10,
              roomCallback: function(roomName: string)
              {
                let room = Game.rooms[roomName];
                if(!room)
                {
                  return false;
                }

                let costs = new PathFinder.CostMatrix;

                room.find(FIND_STRUCTURES).forEach((s) => {
                  if(s.structureType === STRUCTURE_ROAD)
                  {
                    costs.set(s.pos.x, s.pos.y, 1);
                  }
                  else if(s.structureType !== STRUCTURE_CONTAINER &&
                         (s.structureType !== STRUCTURE_RAMPART ||
                         !s.my))
                  {
                    costs.set(s.pos.x, s.pos.y, 0xff);
                  }
                });

                let range = 2;

                room.find(FIND_HOSTILE_CREEPS).forEach((c) =>{
                  for(let i = -range; i <= range; i++)
                  {
                    for(let j = -range; j <= range; j++)
                    {
                      let nX = i + c.pos.x;
                      let nY = j + c.pos.y;
                      if(nX < 0 || nY < 0)
                      {
                        continue;
                      }
                      costs.set(nX, nY, 0xff);
                    }
                  }
                });

                return costs;
              }
            }
            let ret = PathFinder.search(creep.pos, location, options);
          }
        }

      }


    }
    else
    {
      console.log("Claim Other Method");
      let room = Game.rooms[this.metaData.targetRoom]

      if(!room)
      {
        this.kernel.addProcess(MoveProcess, 'move-' + creep.name, this.priority - 1, {
          creep: creep.name,
          pos: flag.pos,
          range: 1
        })

        this.suspend = 'move-' + creep.name
      }
      else
      {
        if(!creep.pos.inRangeTo(room.controller!, 1))
        {
          creep.travelTo(room.controller!);
        }

        if(creep.claimController(room.controller!) === OK)
        {
          this.completed = true
          flag.remove();
        }
      }
    }
  }
}
