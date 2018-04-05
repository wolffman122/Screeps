import { Process } from "os/process";

export class TerminalManagementProcess extends Process
{
  type = 'terminal';

  run()
  {
    //let start = Game.cpu.getUsed();

    let lowRooms = _.filter(Game.rooms, (r) => {
      if(r.terminal)
      {
        return (r.storage.store.energy < 300000 &&
          r.terminal.my);
      }
    });

    let fullRooms = _.filter(Game.rooms, (r) => {
      if(r.terminal)
      {
        return (r.controller.level === 8 && r.storage.store.energy > 400000 &&
          r.terminal.cooldown == 0 && r.terminal.store.energy >= 100000);
      }
    });

    if(lowRooms.length > 0)
    {
      let lRooms: {name: string, amount: number}[] = [];
      _.forEach(lowRooms, (f) => {
        lRooms.push({name: f.name, amount: f.storage.store.energy});
      });

      lRooms = _.sortBy(lRooms, ['amount']);

      if(fullRooms.length > 0)
      {
        let fRooms: {name: string, amount: number}[] = [];
        _.forEach(fullRooms, (f) =>{
          fRooms.push({name: f.name, amount: f.storage.store.energy});
        });

        if(fRooms.length > 0)
        {
          fRooms = _.sortBy(fRooms, ['amount']).reverse();

          let room = _.find(fullRooms, (fr) => {
            return (fr.name == fRooms[0].name);
          });

          if(room)
          {
            let retVal = room.terminal.send(RESOURCE_ENERGY, 50000, lRooms[0].name);
            this.log('Sending Energy ' + retVal);
          }
        }
      }
    }
    //this.log('Cpu used ' + (Game.cpu.getUsed() - start));
  }
}
