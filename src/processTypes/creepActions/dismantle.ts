import {Process} from '../../os/process'

export class DismantleProcess extends Process
{
  metaData: DismantleMetaData;
  type = 'dismantle'

  run()
  {
    let creep = Game.creeps[this.metaData.creep];
    let flag = Game.flags[this.metaData.flagName];
    if(!creep)
    {
      this.completed = true;
      this.resumeParent();
      return;
    }

    let targets = <Structure[]>flag.pos.lookFor(LOOK_STRUCTURES);

    this.log('Targets ' + targets.length);
    if(targets.length == 0)
    {
      let spawn = this.kernel.data.roomData[creep.pos.roomName].enemySpawns[0];
      let targetPos = spawn.pos;

      if(!creep.pos.inRangeTo(targetPos, 1))
      {
        creep.travelTo(targetPos);
      }
      else
      {
        creep.dismantle(spawn);
      }
    }
    else
    {
      let target = targets[0];
      let targetPos = targets[0].pos;

      if(_.sum(creep.carry) < creep.carryCapacity)
      {
        if(!creep.pos.inRangeTo(targetPos, 1))
        {
          creep.travelTo(targetPos);
        }
        else
        {
          creep.dismantle(target);
        }
        return;
      }
      else
      {
        let storage = creep.room.storage;
        if(storage && storage.my)
        {
          if(creep.pos.isNearTo(storage))
          {
            creep.transferEverything(storage);
          }
          else
          {
            if(!creep.fixMyRoad())
            {
              creep.travelTo(storage);
            }
          }
          return;
        }
      }
    }
  }
}
