import {Process} from '../../os/process'
import {MoveProcess} from '../creepActions/move'
import {Utils} from '../../lib/utils'

export class ClaimProcess extends Process{
  metaData: ClaimProcessMetaData
  type = 'claim'

  run(){
    let creep = Game.creeps[this.metaData.creep]

    let flag = Game.flags[this.metaData.flagName]
    let baseFlagName;
    let numberOfFlags;

    if(this.metaData.flagName.split('-').length > 1)
    {
      baseFlagName = this.metaData.flagName.split('-')[0];
      numberOfFlags = +this.metaData.flagName.split('-')[1];
    }

    this.log('Claim Process')
    if(!flag){
      this.completed = true

      return
    }

    if(!creep)
    {
      let creepName = 'claim-' + this.metaData.targetRoom + '-' + Game.time
      let spawned = false;

      spawned = Utils.spawn(
        this.kernel,
        Utils.nearestRoom(this.metaData.targetRoom, 550),
        'claimer',
        creepName,
        {}
      );


      if(spawned)
      {
        this.metaData.creep = creepName
      }

      return;
    }


    let room = Game.rooms[this.metaData.targetRoom]

    if(!room)
    {
      if(numberOfFlags !== undefined && baseFlagName !== undefined)
      {
        this.log('Here now');
        if(creep.memory.flagIndex === undefined)
        {
          creep.memory.flagIndex = 1;
        }

        if(creep.memory.flagIndex <= numberOfFlags)
        {
          let tFlag = Game.flags[baseFlagName + '-' + creep.memory.flagIndex];
          if(tFlag)
          {
            this.log('Here now 2 ' + tFlag.name);
            if(creep.pos.isNearTo(tFlag))
            {
              creep.memory.flagIndex++;
            }

            creep.travelTo(tFlag);
            return;
          }
        }
      }
      else
      {
        this.kernel.addProcess(MoveProcess, 'move-' + creep.name, this.priority - 1, {
          creep: creep.name,
          pos: flag.pos,
          range: 1
        })

        this.suspend = 'move-' + creep.name
      }
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
