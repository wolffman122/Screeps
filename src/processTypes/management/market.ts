import { Process } from "os/process";
import { Utils } from "lib/utils";
import { FACTORY_KEEP_AMOUNT } from "processTypes/buildingProcesses/mineralTerminal";


export class MarketManagementProcess extends Process
{
  metaData: MarketManagementProcessMetaData;
  type = 'market';

  ensureMetaData()
  {
  }

  run()
  {
    let buying = false;
    const barRooms: {
      [bar: string]: string[]
    } = {};
    const catRooms = _.filter(Game.rooms, (r) => {
      if(r.memory.barType && r.controller?.my && r.terminal?.store[r.memory.barType] >= FACTORY_KEEP_AMOUNT)
      {
        if(!barRooms[r.memory.barType])
          barRooms[r.memory.barType]  = [];

        barRooms[r.memory.barType].push(r.name);
      }
    })

    this.metaData.roomWithResource = catRooms.map(r => r.name);

    console.log(this.name, 'Rooms that have bars', this.metaData.roomWithResource.length)
    let totalTransactions = 0;
    if(buying)
    {
      if(Game.time % 5 === 0)
      {
        for(let b in barRooms)
        {
          const bar = b as CommodityConstant;
          console.log(this.name, bar, barRooms[bar].length);
          let roomDistance: RoomDistance = {};
          const orders = this.getBuyOrders(bar);
          console.log(this.name, 'Orders for', bar, orders.length);

          for(let i = 0; i < orders.length; i++)
          {
            console.log(this.name, 1)
            const order = orders[i];
            if(order.remainingAmount > 0)
            {
              let bestDistance = 999;
              let bestRoom = '';
              for(let j = 0; j < barRooms[bar].length; j++)
              {
                console.log(this.name, 3)
                const sourceRoom = Game.rooms[barRooms[bar][j]];
                const terminal = sourceRoom.terminal;
                if(terminal?.cooldown === 0 && terminal.store[RESOURCE_PURIFIER] >= order.amount)
                {
                  console.log(this.name, 4)
                  const cost = Game.market.calcTransactionCost(order.amount, order.roomName, sourceRoom.name)
                  console.log(this.name, 'Cost', cost);
                  if(cost < 5000)
                  {
                    console.log(this.name, 5)
                    const ret = Game.market.deal(order.id, order.amount, sourceRoom.name);
                    console.log(this.name, 'Order info destroom', order.roomName, 'cost', cost, 'Amount', order.amount, 'sourceRoom', sourceRoom.name, 'Ret', ret);
                    if(ret === OK)
                    {
                      totalTransactions++;
                      break;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    else
    {
      if(Game.time % 105 === 0)
      {
        for(let b in barRooms)
        {
          const bar = b as CommodityConstant;
          this.AnalyzeMarket(bar);
          const orders = this.getSellOrders(bar);

          for(let i = 0; i < orders.length; i++)
          {
            const order = orders[i]
          }
        }
      }
    }
  }

  private getBuyOrders(resource: CommodityConstant) : Order[]
  {
    return Game.market.getAllOrders({type: ORDER_BUY, resourceType: resource});
  }

  private getSellOrders(resource: CommodityConstant) : Order[]
  {
    return Game.market.getAllOrders({type: ORDER_SELL, resourceType: resource});
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

  private AnalyzeMarket(resource: ResourceConstant)
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

    // console.log(this.name, "14 Day Price:", fourteenDayPriceAverage, "Volume:", fourteenDayQuantityAverage,
    //   "7 Day Price:", sevenDayPriceAverage, "Voluem:", sevenDayQuantityAverage,
    //   "3 Day Price:", threeDayPriceAverage, "Voluem:", threeDayQuantityAverage)
  }
}

const MINERAL_KEEP_AMOUNT = 50000;
const SELL_AMOUNT = 20000;
const WAIT_FOR_PRICE_CHANGE = 1000;
