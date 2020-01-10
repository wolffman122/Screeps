import { Process } from "os/process";
import { Utils } from "lib/utils";


export class MarketManagementProcess extends Process
{
  metaData: MarketManagementProcessMetaData;
  type = 'market';

  ensureMetaData()
  {
  }

  run()
  {
    const catRooms = _.filter(Game.rooms, (r) => {
      return (r.controller?.my
        && this.kernel.data.roomData[r.name].mineral?.mineralType === RESOURCE_CATALYST &&
        r.terminal?.store[RESOURCE_PURIFIER] > 6000);
    })

    this.metaData.roomWithResource = catRooms.map(r => r.name);

    console.log(this.name, 'Rooms that have purifier', this.metaData.roomWithResource.length)

    if(Game.time % 5 === 0 && this.metaData.roomWithResource.length)
    {
      let roomDistance: RoomDistance = {};

      const orders = this.getOrders(RESOURCE_PURIFIER)
      console.log(this.name, 'Orders for Purifier', orders.length);

      for(let i = 0; i < orders.length; i++)
      {
        console.log(this.name, 1)
        const order = orders[i];
        if(order.remainingAmount > 0)
        {
          let bestDistance = 999;
          let bestRoom = '';
          for(let j = 0; j < this.metaData.roomWithResource.length; j++)
          {
            console.log(this.name, 3)
            const sourceRoom = Game.rooms[this.metaData.roomWithResource[j]];
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
                  break;
              }
            }
          }
        }
      }

    }
  }

  private getOrders(resource: CommodityConstant) : Order[]
  {
    return Game.market.getAllOrders({type: ORDER_BUY, resourceType: resource});
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

  }
}

const MINERAL_KEEP_AMOUNT = 50000;
const SELL_AMOUNT = 20000;
const WAIT_FOR_PRICE_CHANGE = 1000;
