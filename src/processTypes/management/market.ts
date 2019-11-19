import { Process } from "os/process";


export class MarketManagementProcess extends Process
{
  metaData: MarketManagementProcessMetaData;
  type = 'market';

  ensureMetaData()
  {
  }

  run()
  {
    _.forEach(Game.rooms, (room) => {

    })
  }

  private TakeInventory(room: Room)
  {
    let storage = room.storage;
    let terminal = room.terminal;

    // Full storage and full terminal start checking if we need to dump energy
    if(storage?.store.getFreeCapacity() < 5000
      && terminal.store.getFreeCapacity() === 0)
      {
        // Increment how long we have been full
        if(room.memory.fullEnergyCount)
          room.memory.fullEnergyCount++;
        else
          room.memory.fullEnergyCount = 1;

        if(room.memory.fullEnergyCount > 5)
        {
          // Time to analyze and dump some energy
        }
      }
      else
      {
        room.memory.fullEnergyCount === undefined;
      }
  }

  private AnalyzeMarket(resource: ResourceConstant, roomName: string)
  {
    const history = Game.market.getHistory(resource);
    let fourteenDayPriceAverage = 0;
    let fourteenDayQuantityAverage = 0;
    let sevenDayPriceAverage = 0;
    let sevenDayQuantityAverage = 0;
    let threeDayPriceAverage = 0;
    let threeDayQuantityAverage = 0;

    _.forEach(history, (h) => {
      fourteenDayPriceAverage += h.avgPrice;
      fourteenDayQuantityAverage += h.volume;

      if(history.indexOf(h) > 6)
      {
        sevenDayPriceAverage += h.avgPrice;
        sevenDayQuantityAverage += h.volume;
      }

      if(history.indexOf(h) > 10)
      {
        threeDayPriceAverage += h.avgPrice;
        sevenDayQuantityAverage += h.volume;
      }

    });

    fourteenDayPriceAverage /= 14;
    fourteenDayQuantityAverage /= 14;
    sevenDayPriceAverage /= 7;
    sevenDayQuantityAverage /= 7;
    threeDayPriceAverage /= 3;
    threeDayQuantityAverage /= 3;

  }
}

const MINERAL_KEEP_AMOUNT = 50000;
const SELL_AMOUNT = 20000;
const WAIT_FOR_PRICE_CHANGE = 1000;
