import { Process } from "os/process";


export class MarketManagementProcess extends Process
{
  metaData: MarketManagementProcessMetaData;
  type = 'market';

  ensureMetaData()
  {
    if(!this.metaData.data)
    {
      this.log('Meta Data Reset');
      this.metaData.data = {}
    }
  }

  run()
  {
    this.ensureMetaData();

    //this.metaData.waitingToSell = !this.metaData.waitingToSell;
    //this.log('Waiting to sell ' + this.metaData.waitingToSell);

    if(Game.time % 5 === 0)
    {

    }

    _.forEach(Game.rooms, (room) => {

      let buyOrders = Game.market.getAllOrders({resourceType: RESOURCE_ENERGY, type: ORDER_BUY});

      buyOrders = _.sortBy(buyOrders, 'price').reverse();

      if(room.controller && room.controller.my && room.controller.level >= 8)
      {
        let storage = room.storage;
        let terminal = room.terminal;
        let mineral = <Mineral>room.find(FIND_MINERALS)[0];

        if(storage && (_.sum(storage.store) >= storage.storeCapacity * .8))
        {
          this.log('Energy orders');
          if(terminal && terminal.cooldown == 0 && terminal.store.energy > 80000)
          {
            let dealAmount = terminal.store.energy - 80000;
            console.log('Deal ' + room.name + ' id ' + buyOrders[0] + ' amount ' + dealAmount);
            Game.market.deal(buyOrders[0].id, dealAmount, room.name)
          }
        }
        else if(mineral)
        {
          if(this.metaData.data[room.name] === undefined)
          {
            this.metaData.data[room.name] = { mining: false, amount: 0, waitingToSell: false, orderId: undefined};
            this.log('Initial Set');
          }

          let terminal = room.terminal;
          if(terminal && terminal.my)
          {
            if(!this.metaData.data[room.name].mining && !this.metaData.data[room.name].waitingToSell)
            {
              if(terminal.store[mineral.mineralType]! <= (mineral.mineralAmount + MINERAL_KEEP_AMOUNT))
              {
                this.log('Sending a messate to ' + mineral.room!.name);

                this.kernel.sendIpc('market', 'minerals-'+mineral.room!.name, {value: "Start-Mining"})
                this.metaData.data[room.name].mining = true;
                this.metaData.data[room.name].waitingToSell = false;
                this.metaData.data[room.name].amount = mineral.mineralAmount;
              }
            }

            if(mineral.mineralAmount === 0 && this.metaData.data[room.name].mining)
            {
              this.log('Mineral Order Creation');
              // Not sure if we want to send another message to Mineral process thinking not

              this.kernel.sendIpc('market', 'minerals-'+mineral.room!.name, {value: "Stop-Mining"});

              this.metaData.data[room.name].mining = false;
              this.metaData.data[room.name].waitingToSell = true;
            }

            if(this.metaData.data[room.name].waitingToSell && this.metaData.data[room.name].amount > 0)
            {
              let sellOrders = Game.market.getAllOrders({resourceType: mineral.mineralType, type: ORDER_SELL});

              let avgPrice = this.getSellPrice(sellOrders);
              let minPrice = _.min(sellOrders, 'price');

              this.log("Should make an order " + avgPrice);
              if(Game.market.createOrder(ORDER_SELL, mineral.mineralType, avgPrice, this.metaData.data[room.name].amount, mineral.room!.name) === OK)
              {
                this.metaData.data[room.name].amount = 0;
              }
            }
            else if(this.metaData.data[room.name].waitingToSell && this.metaData.data[room.name].orderId === undefined)
            {
              this.log("Getting the order number");
              let orders = Game.market.getAllOrders({roomName: room.name, resourceType: mineral.mineralType});
              if(orders.length === 1)
              {
                this.metaData.data[room.name].orderId = orders[0].id;
              }
            }
            else if(this.metaData.data[room.name].waitingToSell)
            {
              this.log("Waiting for the sale");
              let orders = Game.market.getAllOrders({id: this.metaData.data[room.name].orderId});
              if(orders.length === 1)
              {
                if(orders[0].remainingAmount === 0)
                {
                  //this.metaData[room.name].waitingToSell = false;
                }
              }
            }
          }

        }
      }
    });
  }

  getSellPrice(orders: Order[]): number
  {
    orders = _.sortBy(orders, 'price');

    let lowEnd = _.dropRight(orders, (orders.length - 14));

    let amountTotal = 0;

    let priceTotal = 0;

    for(let i = 0; i < orders.length; i++)
    {
      priceTotal += orders[i].remainingAmount * orders[i].price;
      amountTotal += orders[i].remainingAmount;
    }

    return (priceTotal / amountTotal);
  }
}

const MINERAL_KEEP_AMOUNT = 5000;
const SELL_AMOUNT = 20000;
