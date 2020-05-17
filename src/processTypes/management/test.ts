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



    const spawn = <StructureSpawn>Game.getObjectById('5e0d941dc1f3bdb34a810743')
    const observer = this.roomData().observer;
    if(observer)
    {
      const ret = observer.observeRoom('E40S36');
      console.log(this.name, 'observe', ret);
    }

    this.metaData.leaders = Utils.clearDeadCreeps(this.metaData.leaders);
    if(this.metaData.leaders.length < 1)
    {
      if(spawn.spawnCreep([MOVE], 'test' + Game.time) === OK)
        this.metaData.leaders.push('test' + Game.time);
    }

    console.log(this.name, 'test', 1)
    if(this.metaData.leaders.length === 1)
    {
      console.log(this.name, 'test', 2)
      const creep = Game.creeps[this.metaData.leaders[0]];
      if(creep)
      {
        console.log(this.name, 'test', 3)
        const room = Game.rooms['E40S36'];
        if(room)
        {
          const deposits = room.find(FIND_DEPOSITS);
          if(deposits.length)
          {
            const deposit = deposits[0];
            if(!creep.pos.isNearTo(deposit))
            {
              if(Game.time % 5 === 0)
              {
              const ret = creep.travelTo(deposit, {allowHostile: false});
              console.log(this.name, 'test', 4, deposit, ret);
              }
            }
          }

        }
      }
    }
  }
}
