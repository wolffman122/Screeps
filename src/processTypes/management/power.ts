import { Process } from "os/process";
import { PowerCreepLifetimeProcess } from "processTypes/lifetimes/powerCreep";

export class PowerManagement extends Process
{
  type = 'powerm';
  metaData: PowerManagementProcessMetaData

  run()
  {
    try
    {
      console.log(this.name, '!!!!!!!!!!!running!!!!!!!!!!')
      _.forEach(Game.powerCreeps, (p)=> {
        console.log(this.name, 1, p.name, !p.ticksToLive);
        if(!p.ticksToLive)
        {
          const roomName = p.name.split('-')[0];
          const powerSpawn = this.roomInfo(roomName).powerSpawn;
          console.log(this.name, 2, roomName, powerSpawn)
          if(powerSpawn)
          {
            if(p.spawn(powerSpawn) === OK)
            {
              this.kernel.addProcess(PowerCreepLifetimeProcess, 'pclf-' + p.name, this.priority - 1, {
                powerCreep: p.name,
                roomName: roomName
              });
            }
          }
        }
      });
    }
    catch(error)
    {
      console.log(this.name, 'run', error);
    }
  }
}
