import { close } from "fs";
import { Utils } from "lib/utils";
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
            if(r.name === 'E37S45')
              console.log(this.name, 'TEMPLE ROOM', r.memory.templeRoom, r.terminal?.store.getUsedCapacity(RESOURCE_ENERGY), r.terminal?.store.getCapacity() * .9)
            if(r.memory.templeRoom && r.terminal?.store.getUsedCapacity(RESOURCE_ENERGY) < r.terminal?.store.getCapacity() * .9)
            {
              console.log(this.name, 'TEMPLE ROOM')
              if(r.controller?.level === 8)
                return ((r.storage.store.getUsedCapacity(RESOURCE_ENERGY) < r.storage.store.getCapacity() * .95) && r.controller?.my &&
                  r.terminal?.my && r.terminal.store.getUsedCapacity() < r.terminal.store.getCapacity());
              if(r.controller?.level === 7 && r.controller.progress / r.controller.progressTotal > .85)
                return ((r.storage.store.getUsedCapacity(RESOURCE_ENERGY) < r.storage.store.getCapacity() * .95) && r.controller?.my &&
                  r.terminal?.my && r.terminal.store.getUsedCapacity() < r.terminal.store.getCapacity());
              else if(r.controller?.level >= 6)
                return ((r.storage.store.getUsedCapacity(RESOURCE_ENERGY) < 650000) && r.controller?.my &&
                  r.terminal?.my && r.terminal?.store.getUsedCapacity() < r.terminal?.store.getCapacity());
            }
            else
            {
              return ((r.storage.store.energy < 375000 || r.storage.store === undefined) && r.controller && r.controller.my &&
                r.terminal.my && r.terminal.store.getUsedCapacity() < r.terminal.storeCapacity && !r.memory.templeRoom);
            }
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
            else if(!r.memory.templeRoom)
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
            return (r.storage.store.getUsedCapacity() === r.storage.storeCapacity);
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
              lRooms.push({name: f.name, amount: f.terminal?.store.getFreeCapacity(), storeAmount: 0});
            }
            else if(f.storage)
            {
              lRooms.push({name: f.name, amount: f.terminal!.store.getUsedCapacity(), storeAmount: f.storage.store.energy});
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

          if(fRooms.length > 0 && lRooms.length > 0)
          {

            let lRoomIndex = 0;
            const fullRoomNames = fRooms.map(r => r.name);
            const fullRooms = Utils.inflateRooms(fullRoomNames);

            for(let i = 0; i < lRooms.length; i++)
            {
              let minDistance = 999;
              let closestRoomName = "";
              fullRooms.forEach( (fr: Room) => {
                const terminal = fr.terminal;
                if(!terminal?.cooldown)
                {
                  const distance = Game.map.getRoomLinearDistance(lRooms[i].name, fr.name, true);
                  if(distance < minDistance)
                  {
                    minDistance = distance;
                    closestRoomName = fr.name;
                  }
                }
              });

              if(minDistance != 999)
              {
                const sendingRoom = Game.rooms[closestRoomName];
                const terminal = sendingRoom.terminal;
                const lRoom = lRooms[i];
                let amount = lRoom.amount;
                if(amount > 50000)
                {
                  const cost = Game.market.calcTransactionCost(50000, lRooms[i].name, closestRoomName);
                  if(cost > 25000)
                    amount = 75000 - cost
                  else
                    amount = 50000
                }

                const ret = terminal.send(RESOURCE_ENERGY, amount, lRoom.name);
                console.log(this.name, sendingRoom.name, 'sending to', lRoom.name, 'amount', amount, 'ret', ret);
              }
            }
          }
        }

        console.log(this.name, Game.cpu.getUsed())
        //this.log('Cpu used ' + (Game.cpu.getUsed() - start));
      }

      console.log(this.name, Game.cpu.getUsed(), Game.cpu.bucket);

  }
}
