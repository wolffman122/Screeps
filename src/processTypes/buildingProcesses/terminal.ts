import { Process } from "os/process";
import { ENERGY_KEEP_AMOUNT } from "./mineralTerminal";

export class TerminalManagementProcess extends Process
{
  type = 'terminal';

  run()
  {
    if(Game.time % 10 === 1)
    {
      //let start = Game.cpu.getUsed();
      console.log(this.name)

      let lowRooms = _.filter(Game.rooms, (r) => {
        if(r.terminal && r.storage)
        {
          return (r.storage.store.energy < 175000 && r.controller && r.controller.my &&
            r.terminal.my);
        }
        else
        {
          return false;
        }
      });

      let fullRooms = _.filter(Game.rooms, (r) => {
        if(r.terminal && r.controller && r.storage)
        {
          return (r.controller.level === 8 && r.storage.store.energy > ENERGY_KEEP_AMOUNT &&
            r.terminal.cooldown == 0 && r.terminal.store.energy >= 50000);
        }
        else
        {
          return false;
        }
      });

      if(lowRooms.length > 0)
      {
        let lRooms: {name: string, amount: number}[] = [];
        _.forEach(lowRooms, (f) => {
          if(f.storage)
          {
            lRooms.push({name: f.name, amount: _.sum(f.terminal!.store)});
          }
        });

        lRooms = _.sortBy(lRooms, 'amount');

        if(fullRooms.length > 0)
        {
          let fRooms: {name: string, amount: number}[] = [];
          _.forEach(fullRooms, (f) =>{
            if(f.storage)
            {
              fRooms.push({name: f.name, amount: f.storage.store.energy});
            }
          });

          if(fRooms.length > 0)
          {
            fRooms = _.filter(fRooms, (f) =>{
              return (Game.map.getRoomLinearDistance(f.name, lRooms[0].name) < 20);
            })
            fRooms = _.sortBy(fRooms, 'amount').reverse();


            let room = Game.rooms[fRooms[0].name];

            if(room)
            {
              if(room.terminal)
              {
                let amount = 300000 - lRooms[0].amount;
                //if(Game.map.getRoomLinearDistance(room.name, lRooms[0].name) > 10)
                if(amount > 50000)
                {
                  amount = 50000;
                }
                let cost = Game.market.calcTransactionCost(amount, room.name, lRooms[0].name);
                let retVal = room.terminal.send(RESOURCE_ENERGY, amount, lRooms[0].name);
                this.log('!!!!!!!!!!!!!!!!!!!!!!!!!! Sending Energy from ' + room.name + ' to ' + lRooms[0].name + ' retVal ' + retVal + ' amount ' + amount + ' cost ' + cost);
              }
            }
          }
        }
      }
      //this.log('Cpu used ' + (Game.cpu.getUsed() - start));
    }
  }
}
