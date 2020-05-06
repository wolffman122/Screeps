import { Process } from "os/process";
import { ENERGY_KEEP_AMOUNT, KEEP_AMOUNT } from "./mineralTerminal";

export class TerminalManagementProcess extends Process
{
  type = 'terminal';
  metaData: TerminalManagementProcessMetaData;

  run()
  {
    if(!this.metaData.receiveStr)
      this.metaData.receiveStr = {};

    if(!this.metaData.sendStrings)
      this.metaData.sendStrings = {};


      for(const str in this.metaData.receiveStr)
      {
        const room = Game.rooms[str];
        if(room)
          room.visual.text(this.metaData.receiveStr[str], 5, 6, {color: 'white', align: 'left'});
        else
          delete this.metaData.receiveStr[str];
      }

      for(const str in this.metaData.sendStrings)
      {
        const room = Game.rooms[str];
        if(room)
          room.visual.text(this.metaData.sendStrings[str], 5, 7, {color: 'white', align: 'left'});
        else
          delete this.metaData.sendStrings[str];
      }

      console.log(this.name, Game.cpu.getUsed(), Game.cpu.bucket);
      if(Game.time % 10 === 1)
      {
        //let start = Game.cpu.getUsed();
        console.log(this.name)
        let minimum = 1000000;
        let minimumRoom: string;
        let lowRooms = _.filter(Game.rooms, (r) => {

          if((this.metaData.shutDownTransfers[r.name] ?? false))
            return false;

          if(r.terminal && r.storage)
          {

            if(r.memory.templeRoom && r.controller?.level === 8)
            {
            //   let amount = 700000
            //   if(r.controller.level === 7)
            //     amount = 800000

            //   console.log(this.name, 'Minimum room check', r.storage.store.getUsedCapacity(RESOURCE_ENERGY), amount, (r.storage.store.getUsedCapacity(RESOURCE_ENERGY) < amount), r.controller?.my,
            //   r.terminal?.my, r.terminal.store.getUsedCapacity() < r.terminal.store.getCapacity())
              return ((r.storage.store.getUsedCapacity(RESOURCE_ENERGY) < 900000) && r.controller?.my &&
                r.terminal?.my && r.terminal.store.getUsedCapacity() < r.terminal.store.getCapacity());
            }
            else
              return ((r.storage.store.energy < 250000 || r.storage.store === undefined) && r.controller && r.controller.my &&
                r.terminal.my && _.sum(r.terminal.store) < r.terminal.storeCapacity);
          }
          else
          {
            return false;
          }
        });

        console.log(this.name, 'low rooms', lowRooms.length);

        _.forEach(Game.rooms, (r) =>{
          if(r.controller && r.controller.my && r.storage && r.terminal && r.terminal.my)
          {
            if(r.memory.templeRoom && r.terminal.store.getUsedCapacity(RESOURCE_ENERGY) < 100000)
            {
              minimum = 10;
              minimumRoom = r.name;
            }
            else
            {
              let storage = r.storage;
              if(storage.store.getUsedCapacity() < minimum)
              {
                minimum = storage.store.getUsedCapacity(RESOURCE_ENERGY);
                console.log(this.name, 1, r.name, minimum)
                minimumRoom = r.name;
              }
            }
          }
        })

        console.log(this.name, 'Final min', minimum, minimumRoom)

        let fullRooms = _.filter(Game.rooms, (r) => {
          if(r.memory.templeRoom)
            return false;

          if(r.controller && r.controller.my && r.terminal && r.storage)
          {
            return (r.controller.level >= 7 && r.storage.store.energy > ENERGY_KEEP_AMOUNT &&
              r.terminal.cooldown == 0 && r.terminal.store.energy >= 50000);
          }
          else
          {
            return false;
          }
        });
        console.log(this.name, Game.cpu.getUsed())

        let fRooms: {name: string, amount: number}[] = [];
        if(fullRooms.length > 0)
        {
          _.forEach(fullRooms, (f) =>{
            if(f.storage)
            {
              console.log(this.name, 2)
              fRooms.push({name: f.name, amount: f.storage.store.energy});
            }
          });
          console.log(this.name, Game.cpu.getUsed())
        }
        fRooms = _.sortBy(fRooms, 'amount').reverse();

        console.log(this.name, Game.cpu.getUsed())
        console.log(this.name, "Fullest room", fRooms.length);

        let maxFull = _.filter(Game.rooms, (r) => {
          if(r.memory.templeRoom)
            return false;

          if(r.controller && r.controller.my && r.terminal && r.storage)
          {
            return (_.sum(r.storage.store) === r.storage.storeCapacity);
          }
          return false;
        })
        console.log(this.name, Game.cpu.getUsed())

        //console.log(this.name, fullRooms.length, maxFull.length, lowRooms.length);
        if(maxFull.length > 0)
        {
          let fRooms: {name: string, amount: number}[] =[];
          _.forEach(maxFull, (m) => {
            console.log(this.name, 'Max full', Game.cpu.getUsed())
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

        console.log(this.name, Game.cpu.getUsed())

        if(lowRooms.length > 0)
        {
          console.log(this.name, fullRooms.length, lowRooms.length);
          let lRooms: {name: string, amount: number, storeAmount: number}[] = [];
          _.forEach(lowRooms, (f) => {
            if(f.memory.templeRoom)
            {
              lRooms.push({name: f.name, amount: 0, storeAmount: 0});
            }
            else if(f.storage)
            {
              lRooms.push({name: f.name, amount: _.sum(f.terminal!.store), storeAmount: f.storage.store.energy});
            }
          });

          console.log(this.name,1);
          lRooms = _.sortBy(lRooms, 'storeAmount');
          console.log(this.name,2, fRooms.length);
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

              if((this.metaData.shutDownTransfers[room.name] ?? false))
              {
                index++;
                continue;
              }

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
                    console.log(this.name, room.name, "to", lRooms[0].name, retVal);
                    if(retVal === OK)
                    {
                      const minRoom = Game.rooms[lRooms[0].name];
                      this.metaData.sendStrings[room.name] = 'Send Information: To ' + minRoom.name + ' Energy ' + amount + ' : ' + Game.time;
                      this.metaData.receiveStr[minRoom.name] = 'Recieved Information: From ' + room.name + ' Energy ' + amount + ' : ' + Game.time;
                    }
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

        console.log(this.name, Game.cpu.getUsed())
        //this.log('Cpu used ' + (Game.cpu.getUsed() - start));
      }

      console.log(this.name, Game.cpu.getUsed(), Game.cpu.bucket);

  }
}
