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
    console.log(this.name,  '!!!!!!!!!!!!!!!!!!!!!!Test!!!!!!!!!!!!!!!!!!!!');
    console.log(this.name, this.metaData.flagName);
    const flag = Game.flags[this.metaData.flagName];
    console.log(this.name, flag, flag?.pos);
    if(!flag)
    {
      this.completed = true;
      return;
    }

    const observer = this.roomData().observer;
    if(observer)
    {
      observer.observeRoom('E45S46');
      const oRoom = Game.rooms['E45S46'];
      if(oRoom)
      {
        console.log(this.name, 'observing');
        let costs = new PathFinder.CostMatrix;
        const startPos = new RoomPosition(49, 25, oRoom.name);
        const endPos = new RoomPosition(15, 15, oRoom.name);
        if(Game.time % 2 == 0)
          RawMemory.setActiveSegments([4,0,1]);
        else
          console.log(this.name, RawMemory.segments[4]);
        // let ret = PathFinder.search(startPos, {pos: endPos, range: 1},
        //   {
        //     roomCallback: function(roomName) {
        //       let room = Game.rooms[roomName];
        //       if(!room) return;
        //       let costs = new PathFinder.CostMatrix;
        //       room.find(FIND_HOSTILE_CREEPS);
        //       for(let x = -3; x <= 3; x++)
        //         for(let y = -3; y <= 3; y++)
        //           costs.set(x, y, 0xff);

        //       RawMemory.segments[4] = JSON.stringify(costs.serialize());
        //       return costs;
        //     },
        //   });
      }
    }


    //RawMemory.setActiveSegments([0,1]);
    console.log(this.name, RawMemory.segments[0]);
    console.log(this.name, RawMemory.segments[1]);
    console.log(this.name, RawMemory.segments[2]);
    RawMemory.segments[0] = "Testing";
    RawMemory.segments[2] = "Testing2";

    // try
    // {
    //   this.ensureMetaData;

    //   const flag = Game.flags[this.metaData.flagName];
    //   if(!flag)
    //   {
    //     this.completed = true;
    //     return;
    //   }

    //   console.log(this.name, '*********************************** Test *******************************************');

    //   const mineral = this.roomInfo(flag.room.name).mineral;

    //   for(let c in COMMODITIES)
    //   {
    //     const com = COMMODITIES[c];
    //     for(let comp in com.components)
    //     {
    //       if(comp === mineral.mineralType)
    //       {
    //         const test = c as CommodityConstant
    //         console.log(this.name, 'Found component constant', test);
    //       }
    //     }
    //   }
    //   // const top = (flag.pos.y - 2 > 0) ? flag.pos.y - 2: 0;
    //   // const right = (flag.pos.x + 2 < 49) ? flag.pos.x + 2 : 49;
    //   // const bottom = (flag.pos.y + 2 < 49) ? flag.pos.y + 2 : 49;
    //   // const left = (flag.pos.x - 2 > 0) ? flag.pos.x - 2: 0;
    //   // const lCreeps = flag.room.lookAtArea(top, left, bottom, right, true) as LookAtResultWithPos[];
    //   // for(let i = 0; i < lCreeps.length; i++)
    //   // {
    //   //   const look = lCreeps[i];
    //   //   if (look.structure?.structureType !== STRUCTURE_CONTAINER)
    //   //     continue;

    //   //   if (lCreeps.some(l => l.x === look.x && l.y === look.y /*&& l.creep?.owner.username === "Invader"*/))
    //   //   {
    //   //     console.log(1, look.x, look.y, flag.pos.roomName);
    //   //     console.log(2, look.structure);
    //   //   }
    //   // }

    //   //  console.log(this.name, 'Look For Results', top, left, bottom, right);
    //   // if(lCreeps.length)
    //   // {
    //   //   console.log(this.name, 'Found creeps', lCreeps.length)
    //   // }
    //   // //let xCord, yCord;
    //   // // console.log(this.name, 'Look For Results');
    //   // // _.forEach(Object.keys(results), (y) => {
    //   // //   console.log(this.name, y)
    //   // //   _.forEach(Object.keys(results[y]), (x) => {
    //   // //     console.log(this.name, y, x);
    //   // //     _.forEach(Object.keys(results[y][x]), (type) => {
    //   // //         console.log(this.name, y, x, type, results[y][x][type]);
    //   // //     });
    //   // //   });
    //   // // });

    // }
    // catch(error)
    // {
    //   console.log(this.name, 'followActions', error)
    // }
  }


}
