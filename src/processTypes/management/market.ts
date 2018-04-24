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

    if(this.metaData.waitingToSell === undefined)
    {
      this.metaData.waitingToSell = false;
    }
  }

  run()
  {
    this.ensureMetaData();

    this.metaData.waitingToSell = !this.metaData.waitingToSell;
    this.log('Waiting to sell ' + this.metaData.waitingToSell);

    if(this.metaData.mining['E48S52'] === undefined)
    {
      this.metaData.mining['E48S52'] = false;
    }

    this.metaData.mining['E48S52'] = !this.metaData.mining['E48S52'];
    this.log('Mining status ' + this.metaData.mining['E48S52']);

  }
}

const MINERAL_KEEP_AMOUNT = 51000;
const SELL_AMOUNT = 20000;
