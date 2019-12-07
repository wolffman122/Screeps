import { Process } from "os/process";
import { Utils } from "lib/utils";
import { HealerLifetimeProcess } from "processTypes/lifetimes/healer";

export class TestProcessManagement extends Process
{
  metaData: TestProcessManagementMetaData;
  type = 'test';
  target: Flag;

  ensureMetaData()
  {
    if(!this.metaData.leaders)
      this.metaData.leaders = [];

    if(!this.metaData.followers)
      this.metaData.followers = [];
  }

  run()
  {
    try
    {
      this.ensureMetaData;

      let flag = Game.flags[this.metaData.flagName];
      let room = Game.rooms[this.metaData.roomName];

      if(!flag)
      {
        this.metaData.followers = Utils.clearDeadCreeps(this.metaData.followers);
        this.metaData.leaders = Utils.clearDeadCreeps(this.metaData.leaders);

        if(this.metaData.followers.length === 0 && this.metaData.leaders.length === 0)
          this.completed = true;

        return;
      }

      this.target = flag;

      this.metaData.followers = Utils.clearDeadCreeps(this.metaData.followers);
      this.metaData.leaders = Utils.clearDeadCreeps(this.metaData.leaders);

      if(this.metaData.leaders.length < 1)
      {
        const creepName = 'leader-' + this.metaData.roomName + '-' + Game.time;
        const spawned = Utils.spawn(this.kernel, this.metaData.roomName, 'vision', creepName, {});

        if(spawned)
          this.metaData.leaders.push(creepName);
      }

      if(this.metaData.followers.length < 1)
      {
        const creepName = 'follower-' + this.metaData.roomName + '-' + Game.time;
        const spawned = Utils.spawn(this.kernel, this.metaData.roomName, 'vision', creepName, {});

        if(spawned)
          this.metaData.followers.push(creepName);
      }

      for(let i = 0; i < this.metaData.leaders.length; i++)
      {
        let leader = Game.creeps[this.metaData.leaders[i]];
        if(leader)
          this.leaderActions(leader);
      }

      for(let i = 0; i < this.metaData.followers.length; i++)
      {
        let follower = Game.creeps[this.metaData.followers[i]];
        if(follower)
          this.followerActions(follower);
      }
    }
    catch(error)
    {
      console.log(this.name, 'Run', error);
    }
  }

  leaderActions(creep: Creep)
  {
    try
    {
      //find leader index to match with healer index
      let follower: Creep
      const index = this.metaData.leaders.indexOf(creep.name);
      if(index !== -1)
      {
        follower = Game.creeps[this.metaData.followers[index]];
        if(follower)
        {
          // Case for exits
          if(creep.pos.roomName !== follower.pos.roomName)
          {
            let dir = creep.pos.getDirectionTo(follower)
            dir += 4;
            if(dir > 8)
            {
              const temp = dir % 8;
              dir = temp as DirectionConstant;
            }

            creep.move(dir);
          }
        }
        else if(creep.pos.inRangeTo(follower, 1))  // Normal following
        {
          if(!creep.pos.inRangeTo(this.target, 1))
          {
            creep.travelTo(this.target);
          }
        }
      }
    }
    catch(error)
    {
      console.log(this.name, 'leaderActions', error)
    }
  }

  followerActions(creep: Creep)
  {
    try
    {
      // Find index of matching attacker
      let leader: Creep
      const index = this.metaData.followers.indexOf(creep.name);
      if(index !== -1)
      {
        leader = Game.creeps[this.metaData.leaders.indexOf(creep.name)];

        if(leader.pos.inRangeTo(creep, 1))
        {
          let dir = creep.pos.getDirectionTo(leader);
          creep.move(dir);
        }
        else
        {
          creep.travelTo(leader);
        }
      }
    }
    catch(error)
    {
      console.log(this.name, 'followActions', error)
    }
  }


}
