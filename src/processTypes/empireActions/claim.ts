import {Process} from '../../os/process'
import {MoveProcess} from '../creepActions/move'
import {Utils} from '../../lib/utils'

export class ClaimProcess extends Process{
  metaData: ClaimProcessMetaData
  type = 'claim'

  run(){
    let flag = Game.flags[this.metaData.flagName]
    let baseFlagName;
    let numberOfFlags;
    let spawnRoom;
    let throughPortal = false;

    if(this.metaData.flagName.split('-').length === 4)
    {
      baseFlagName = this.metaData.flagName.split('-')[0];
      numberOfFlags = +this.metaData.flagName.split('-')[1];
      spawnRoom = this.metaData.flagName.split('-')[2];
      throughPortal = true;
    }
    if(this.metaData.flagName.split('-').length === 3)
    {
      baseFlagName = this.metaData.flagName.split('-')[0];
      numberOfFlags = +this.metaData.flagName.split('-')[1];
      spawnRoom = this.metaData.flagName.split('-')[2];
    }
    else if(this.metaData.flagName.split('-').length > 1)
    {
      baseFlagName = this.metaData.flagName.split('-')[0];
      numberOfFlags = +this.metaData.flagName.split('-')[1];
    }

    this.log('Claim Process')
    if(!flag){
      this.completed = true

      return
    }

    console.log('Claim Process', 1)
    let creep = Game.creeps[this.metaData.creep]


    if(!creep)
    {
      let creepName = 'claim-' + this.metaData.targetRoom + '-' + Game.time
      let spawned = false;
      if(spawnRoom === undefined)
      {
        console.log('Claim Process', 2)
        spawnRoom = Utils.nearestRoom(this.metaData.targetRoom, 600);
      }

      spawned = Utils.spawn(
        this.kernel,
        spawnRoom,
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


    let room = flag.room;
    if(!room)
    {
      if(throughPortal)
      {
        if(numberOfFlags && baseFlagName)
        {
          if(!creep.memory.flagIndex)
            creep.memory.flagIndex = 1;

          if(creep.memory.flagIndex <= numberOfFlags)
          {
            let tFlag = Game.flags[baseFlagName + '-' + creep.memory.flagIndex];
            if(tFlag)
            {
              if(creep.pos.isNearTo)
                creep.memory.flagIndex++;

              creep.travelTo(tFlag);
              return;
            }
          }
          else
          {
            creep.travelTo(flag);
            return;
          }
        }
      }
      else
      {
        console.log(this.name, 2)
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
                //tFlag.remove();
                creep.memory.flagIndex++;
              }

              creep.travelTo(tFlag);
              return;
            }
          }
          else
          {
            creep.travelTo(flag, {preferHighway: true, allowHostile: false});
            return;
          }
        }
        else
        {
          creep.travelTo(flag, {preferHighway: true});
          return;
        }
      }
    }
    else
    {
      console.log(this.name, 3)
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
