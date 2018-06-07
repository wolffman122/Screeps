import { Process } from "os/process";

export class TerminalManagementProcess extends Process
{
  type = 'terminal';

  run()
  {
    //let start = Game.cpu.getUsed();

    let lowRooms = _.filter(Game.rooms, (r) => {
      if(r.terminal && r.storage)
      {
        return (r.storage.store.energy < 250000 && r.controller && r.controller.my &&
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
        return (r.controller.level === 8 && r.storage.store.energy > 500000 &&
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
          lRooms.push({name: f.name, amount: f.storage.store.energy});
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
          fRooms = _.sortBy(fRooms, 'amount').reverse();

          let room = Game.rooms[fRooms[0].name];

          if(room)
          {
            if(room.terminal)
            {
              let retVal = room.terminal.send(RESOURCE_ENERGY, 50000, lRooms[0].name);
              this.log('Sending Energy from ' + room.name + ' to ' + lRooms[0].name + ' retVal ' + retVal);
            }
          }
        }
      }
    }
    //this.log('Cpu used ' + (Game.cpu.getUsed() - start));
  }
}
