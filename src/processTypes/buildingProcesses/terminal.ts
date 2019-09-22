import { Process } from "os/process";
import { ENERGY_KEEP_AMOUNT, KEEP_AMOUNT } from "./mineralTerminal";

export class TerminalManagementProcess extends Process
{
  type = 'terminal';

  run()
  {
    if(Game.time % 10 === 1)
    {
      //let start = Game.cpu.getUsed();
      console.log(this.name)
      let minimum = 1000000;
      let minimumRoom: string;
      let lowRooms = _.filter(Game.rooms, (r) => {
        if(r.terminal && r.storage)
        {
          return ((r.storage.store.energy < 350000 || r.storage.store === undefined) && r.controller && r.controller.my &&
            r.terminal.my);
        }
        else
        {
          return false;
        }
      });

       _.forEach(Game.rooms, (r) =>{
        if(r.controller && r.controller.my && r.storage && r.terminal && r.terminal.my)
        {
          let storage = r.storage;
          if(_.sum(storage.store) < minimum)
          {
            minimum = _.sum(storage.store);
            minimumRoom = r.name;
          }
        }
      })

      //console.log('Final min', minimum, minimumRoom)

      let fullRooms = _.filter(Game.rooms, (r) => {
        if(r.controller && r.controller.my && r.terminal && r.storage)
        {
          return (r.controller.level === 8 && r.storage.store.energy > ENERGY_KEEP_AMOUNT &&
            r.terminal.cooldown == 0 && r.terminal.store.energy >= 50000);
        }
        else
        {
          return false;
        }
      });

      let fRooms: {name: string, amount: number}[] = [];
      if(fullRooms.length > 0)
      {
        _.forEach(fullRooms, (f) =>{
          if(f.storage)
          {
            fRooms.push({name: f.name, amount: f.storage.store.energy});
          }
        });
      }
      fRooms = _.sortBy(fRooms, 'amount').reverse();

      console.log(this.name, "Fullest room", fRooms[0].name, fRooms[0].amount);

      let maxFull = _.filter(Game.rooms, (r) => {
        if(r.controller && r.controller.my && r.terminal && r.storage)
        {
          return (_.sum(r.storage.store) === r.storage.storeCapacity);
        }
        return false;
      })

      //console.log(this.name, fullRooms.length, maxFull.length, lowRooms.length);
      if(maxFull.length > 0)
      {
        let fRooms: {name: string, amount: number}[] =[];
        _.forEach(maxFull, (m) => {
          if(m.storage)
          {
            fRooms.push({name: m.name, amount: m.storage.store.energy});
          }
        });

        if(fRooms.length > 0)
        {
          fRooms = _.sortBy(fRooms, 'amount').reverse();

          let room = Game.rooms[fRooms[0].name];

          if(room)
          {
            if(room.terminal && minimumRoom !== "")
            {
              let amount = 50000;
              let retVal = room.terminal.send(RESOURCE_ENERGY, amount, minimumRoom);
              this.log('!!!!!!!!!!!!!!!!!!!!!!!!!! Sending Max Energy from ' + room.name + ' to ' + minimumRoom + ' retVal ' + retVal + ' amount ' + amount);
            }
          }
        }
      }

      if(lowRooms.length > 0)
      {
        //console.log(this.name, fullRooms.length, lowRooms.length);
        let lRooms: {name: string, amount: number, storeAmount: number}[] = [];
        _.forEach(lowRooms, (f) => {
          if(f.storage)
          {
            lRooms.push({name: f.name, amount: _.sum(f.terminal!.store), storeAmount: f.storage.store.energy});
          }
        });

        lRooms = _.sortBy(lRooms, 'storeAmount');

        //_.forEach(lRooms, (l)=>{
        //  console.log(this.name, l.name, l.amount, l.storeAmount);
        //})

        //console.log(this.name, fullRooms.length);

        //console.log(this.name, "Getting further")

        if(fRooms.length > 0)
        {
          let retVal = -1;
          let index = 0;

          do
          {
            let room = Game.rooms[fRooms[index].name];

            if(room)
            {
              if(room.terminal && room.terminal.cooldown === 0)
              {
                console.log(this.name, room.name, 'sending to', lRooms[0].name, lRooms[0].amount);
                let amount = 300000 - lRooms[0].amount;
                console.log(this.name, "amount", amount);
                if(amount > 50000)
                {
                  amount = 50000;
                }
                let cost = Game.market.calcTransactionCost(amount, room.name, lRooms[0].name);
                if((cost + amount) < room.terminal.store.energy)
                {
                  retVal = room.terminal.send(RESOURCE_ENERGY, amount, lRooms[0].name);
                  this.log('!!!!!!!!!!!!!!!!!!!!!!!!!! Sending Energy from ' + room.name + ' to ' + lRooms[0].name + ' retVal ' + retVal + ' amount ' + amount + ' cost ' + cost);
                }
                else
                  index++;
              }
              else index++;
            }
            console.log(this.name, index, fRooms.length);
          } while (retVal != 0 || index >= fRooms.length);
        }
      }
      //this.log('Cpu used ' + (Game.cpu.getUsed() - start));
    }
  }
}
