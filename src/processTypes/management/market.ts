import { Process } from "os/process";

export class MarketManagementProcess extends Process
{
  type = 'mmp';

  run()
  {
    if(Game.time % 5 === 0)
    {
      let buyOrders = Game.market.getAllOrders({resourceType: RESOURCE_ENERGY, type: ORDER_BUY});

      _.sortBy(buyOrders, ['price']);

      let myRooms = _.filter(Game.rooms, r => r.controller && r.controller.my);

      _.forEach(myRooms, function(room) {
        let mineral = <Mineral>room.find(FIND_MINERALS)[0];
        let terminal = room.terminal;
        let storage = room.storage;

        if(storage && (_.sum(storage.store) >= storage.storeCapacity * .8))
        {
          if(terminal && terminal.cooldown == 0 && terminal.store.energy > 80000)
          {
            let dealAmount = terminal.store.energy - 80000;
            console.log('Deal ' + room.name + ' id ' + buyOrders[0] + ' amount ' + dealAmount);
            Game.market.deal(buyOrders[0].id, dealAmount, room.name)
          }
        }
        else if(mineral)  // Sell minerals if they are over 80000
        {
          if(terminal && terminal.cooldown == 0 && terminal.store[mineral.mineralType] > 100000)
          {
            let minOrders = Game.market.getAllOrders({resourceType: mineral.mineralType, type: ORDER_BUY});

            _.sortBy(minOrders, ['price']);

            let amount = terminal.store[mineral.mineralType] - 100000;
            if(Game.market.deal(minOrders[0].id, amount, room.name) == OK)
            {
              console.log('Deal ' + room.name + ' ' + mineral.mineralType);
            }
          }
        }
      })
    }
  }
}
