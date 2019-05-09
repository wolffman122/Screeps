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
    _.forEach(Game.rooms, (r) => {
      if(r.name === 'E48S56' && r.terminal && r.terminal.my)
      {
        let terminal = r.terminal;
        let mineral = r.find(FIND_MINERALS)[0];

        if(mineral && !this.metaData.orderCreated && terminal.store[mineral.mineralType] >= MINERAL_KEEP_AMOUNT)
        {
          let orders = Game.market.getAllOrders({type: ORDER_SELL, resourceType: mineral.mineralType});
          if(orders)
          {
            orders = _.filter(orders, (o) => {
              return (o.amount >= 10000);
            })
            _.sortBy(orders, 'price');
            let price = orders[0].price;
            if(!this.metaData.orderCreated)
            {
              console.log('Mineral problem !!!!!!!!!!!!!1111')
              Game.market.createOrder(ORDER_SELL, mineral.mineralType, price * 0.95, 10000, r.name) == OK
              this.metaData.orderCreated = true;
            }
          }
        }
        else
        {
          if(this.metaData.orderId === undefined)
          {
            let orders = Game.market.getAllOrders({roomName: r.name});
            if(orders.length)
            {
              console.log('Order created', orders[0].id);
              this.metaData.orderId = orders[0].id;
            }
          }
          else
          {
            console.log('Checking orders');
            let order = Game.market.getOrderById(this.metaData.orderId)
            if(order.active === false)
            {
              console.log('Order finished');
              this.metaData.orderId = undefined;
              this.metaData.orderCreated = false;
            }
          }
        }
      }
    });
  }
}

const MINERAL_KEEP_AMOUNT = 50000;
const SELL_AMOUNT = 20000;
const WAIT_FOR_PRICE_CHANGE = 1000;
