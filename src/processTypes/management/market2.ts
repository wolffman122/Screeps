import { Process } from "os/process";


export class MarketManagementProces2s extends Process
{
  metaData: MarketManagementProcessMetaData;
  type = 'mmp';


  run()
  {
    this.completed = true;
    return;
    let proc = this;
    //this.kernel.sendIpc('market', 'minerals-E48S57', {value: "Testing Send"});


    // TODO need to make metaData.mining an array to store if it is mining for each room.
    if(proc.metaData.mining === undefined)
    {
      proc.log('Reseting Mining');
      proc.metaData.mining = {};
    }

    proc.log('Beginning');
    if(Game.time % 5 === 0)
    {
      let buyOrders = Game.market.getAllOrders({resourceType: RESOURCE_ENERGY, type: ORDER_BUY});

      _.sortBy(buyOrders, 'price').reverse();

      let myRooms = _.filter(Game.rooms, r => r.controller && r.controller.my && r.controller.level >= 8);

      _.forEach(myRooms, function(room) {

        proc.log('Mining ' + proc.metaData.mining);
        _.forEach(Object.keys(proc.metaData.mining), (key) => {
          console.log(room.name, key);
        })
        if(proc.metaData.mining[room.name] ===  undefined)
        {
          proc.log('Settiong mining to false');
          proc.metaData.mining[room.name] === false;
        }
        else
        {
          proc.log('Mining should be true');
        }


        let mineral = <Mineral>room.find(FIND_MINERALS)[0];
        let terminal = room.terminal;
        let storage = room.storage;

        if(storage && (_.sum(storage.store) >= storage.storeCapacity * .8))
        {
          proc.log('Energy orders');
          if(terminal && terminal.cooldown == 0 && terminal.store.energy > 80000)
          {
            let dealAmount = terminal.store.energy - 80000;
            console.log('Deal ' + room.name + ' id ' + buyOrders[0] + ' amount ' + dealAmount);
            Game.market.deal(buyOrders[0].id, dealAmount, room.name)
          }
        }
        else if(mineral)  // Sell minerals if they are over 50000
        {
          proc.log('Into mineral mining ' + proc.metaData.mining[room.name] + ' terminal amount ' + terminal!.store[mineral.mineralType]! + ' density ' + MINERAL_DENSITY[mineral.density] + ' Room ' + mineral.room!.name + ' amount ' + mineral.mineralAmount);

          // Generate mine order
          if(!proc.metaData.mining[room.name] && terminal
            && terminal.my && terminal.store[mineral.mineralType]! <= MINERAL_KEEP_AMOUNT)
            //&& mineral.mineralAmount === MINERAL_DENSITY[mineral.density])
          {
            proc.log('Sending a message to ' + mineral.room!.name);
            // Tell Mining to start
            proc.kernel.sendIpc('market', 'minerals-'+ mineral.room!.name, {value: "Start-Mining"});
            proc.metaData.mining[room.name] = true;
            proc.metaData.amount = mineral.mineralAmount;
            proc.metaData.waitingToSell = false;
          }

          if(mineral.mineralAmount === 0 && proc.metaData[room.name].mining)
          {
            proc.log('Mineral Orders');
            proc.kernel.sendIpc('market', 'minerals-'+ mineral.room!.name, {value: "Stop-Mining"});

            // Stop mining and make sell order
            proc.metaData.mining[room.name] = false;
            proc.metaData.waitingToSell = true;

           /* proc.log('Time to sell some shit');
            let sellOrders = Game.market.getAllOrders({resourceType: mineral.mineralType, type: ORDER_SELL});

            let avgPrice = proc.getSellPrice(sellOrders);
            let minPrice = _.min(sellOrders, 'price');

            Game.market.createOrder(ORDER_SELL, mineral.mineralType, avgPrice, proc.metaData.amount, mineral.room!.name);*/
          }

          // Old Buy code trying to change to sell code might be able to remove all of this.
          /*if(terminal && terminal.cooldown == 0 && terminal.store[mineral.mineralType]! > MINERAL_KEEP_AMOUNT)
          {
            let minOrders = Game.market.getAllOrders({resourceType: mineral.mineralType, type: ORDER_BUY});

            _.sortBy(minOrders, 'price').reverse();

            let amount = terminal.store[mineral.mineralType]! - MINERAL_KEEP_AMOUNT;
            if(Game.market.deal(minOrders[0].id, amount, room.name) == OK)
            {
              console.log('Deal ' + room.name + ' ' + mineral.mineralType);
            }
          }*/
        }
      })
    }
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

const MINERAL_KEEP_AMOUNT = 51000;
const SELL_AMOUNT = 20000;
