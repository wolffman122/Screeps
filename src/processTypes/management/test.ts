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

      const flag = Game.flags[this.metaData.flagName];
      if(!flag)
      {
        this.completed = true;
        return;
      }

      console.log(this.name, '*********************************** Test *******************************************');

      const mineral = this.roomInfo(flag.room.name).mineral;

      for(let c in COMMODITIES)
      {
        const com = COMMODITIES[c];
        for(let comp in com.components)
        {
          if(comp === mineral.mineralType)
          {
            const test = c as CommodityConstant
            console.log(this.name, 'Found component constant', test);
          }
        }
      }
      // const top = (flag.pos.y - 2 > 0) ? flag.pos.y - 2: 0;
      // const right = (flag.pos.x + 2 < 49) ? flag.pos.x + 2 : 49;
      // const bottom = (flag.pos.y + 2 < 49) ? flag.pos.y + 2 : 49;
      // const left = (flag.pos.x - 2 > 0) ? flag.pos.x - 2: 0;
      // const lCreeps = flag.room.lookAtArea(top, left, bottom, right, true) as LookAtResultWithPos[];
      // for(let i = 0; i < lCreeps.length; i++)
      // {
      //   const look = lCreeps[i];
      //   if (look.structure?.structureType !== STRUCTURE_CONTAINER)
      //     continue;

      //   if (lCreeps.some(l => l.x === look.x && l.y === look.y /*&& l.creep?.owner.username === "Invader"*/))
      //   {
      //     console.log(1, look.x, look.y, flag.pos.roomName);
      //     console.log(2, look.structure);
      //   }
      // }

      //  console.log(this.name, 'Look For Results', top, left, bottom, right);
      // if(lCreeps.length)
      // {
      //   console.log(this.name, 'Found creeps', lCreeps.length)
      // }
      // //let xCord, yCord;
      // // console.log(this.name, 'Look For Results');
      // // _.forEach(Object.keys(results), (y) => {
      // //   console.log(this.name, y)
      // //   _.forEach(Object.keys(results[y]), (x) => {
      // //     console.log(this.name, y, x);
      // //     _.forEach(Object.keys(results[y][x]), (type) => {
      // //         console.log(this.name, y, x, type, results[y][x][type]);
      // //     });
      // //   });
      // // });

    }
    catch(error)
    {
      console.log(this.name, 'followActions', error)
    }
  }


}
