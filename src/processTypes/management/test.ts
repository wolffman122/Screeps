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
    this.ensureMetaData();
    console.log(this.name,  '!!!!!!!!!!!!!!!!!!!!!!Test!!!!!!!!!!!!!!!!!!!!');
    console.log(this.name, this.metaData.flagName);
    const flag = Game.flags[this.metaData.flagName];
    console.log(this.name, flag, flag?.pos);
    if(!flag)
    {
      this.completed = true;
      return;
    }

    this.target = flag;
    const spawn = this.roomData().spawns.filter(s => !s.spawning)[0];

    this.metaData.leaders = Utils.clearDeadCreeps(this.metaData.leaders);
    this.metaData.followers = Utils.clearDeadCreeps(this.metaData.followers);

    if(spawn)
    {
      if(this.metaData.leaders.length < 1)
      {
        if(spawn.spawnCreep([MOVE], 'test-' + Game.time) === OK)
        {
          this.metaData.leaders.push('test-' + Game.time);
          return;
        }
      }

      // if(this.metaData.followers.length < 1)
      // {
      //   if(spawn.spawnCreep([MOVE], 'test2-' + Game.time) === OK)
      //   {
      //     this.metaData.followers.push('test2-' + Game.time);
      //     return;
      //   }
      // }
    }

    for(let i = 0; i < this.metaData.leaders.length; i++)
    {
      const creep = Game.creeps[this.metaData.leaders[i]];
      if(creep)
        this.LeaderActions(creep);
    }

    // for(let i = 0; i < this.metaData.followers.length; i++)
    // {
    //   const creep = Game.creeps[this.metaData.followers[i]];
    //   if(creep)
    //     this.FollowerActions(creep);
    // }

  }

  private LeaderActions(creep: Creep)
  {
    // const target = new RoomPosition(25,25, 'E56S42')
    // if(!global.creepTravel)
    //   global.creepTravel = {};

    // if(global.creepTravel[creep.name] == "")
  }

  private FollowerActions(creep: Creep)
  {
    if(!creep.pos.isEqualTo(this.target))
      creep.pushyTravelTo(this.target);
  }
}
