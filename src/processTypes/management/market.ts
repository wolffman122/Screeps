import { Process } from "os/process";


export class MarketManagementProcess extends Process
{
  metaData: MarketManagementProcessMetaData;
  type = 'market';

  ensureMetaData()
  {
    if(!this.metaData.mining)
    {
      this.log('Meta Data Reset');
      this.metaData.mining = {}
    }
  }

  run()
  {
    this.ensureMetaData();

    this.log('Mining ' + Object.keys(this.metaData.mining).length);

    let miningRooms = _.filter(Game.rooms, (r)=> {
      return (r.controller && r.controller.my && r.controller.level >= 8
        && r.terminal && r.terminal.my);
    });

    if(miningRooms.length > 0)
    {
      this.log('Mining Rooms ' + miningRooms.length);
    }

    _.forEach(miningRooms, (mr) =>{
      let mineral = mr.find(FIND_MINERALS)[0];

      if(mineral)
      {
        this.log('Mining length ' + Object.keys(this.metaData.mining).length);
        this.log('Mining Mr ' + this.metaData.mining[mr.name]);
        if(!this.metaData.mining[mr.name])
        {
          this.metaData.mining[mr.name] = true;
        }
        this.log('Mining After Mr ' + this.metaData.mining[mr.name]);
        this.log('Mining length ' + Object.keys(this.metaData.mining).length);

      }
    })
  }
}

const MINERAL_KEEP_AMOUNT = 51000;
const SELL_AMOUNT = 20000;
