import { Process } from "os/process";
import { PowerCreepLifetimeProcess } from "processTypes/lifetimes/powerCreep";

export class PowerManagement extends Process
{
  type = 'powerm';
  metaData: PowerManagementProcessMetaData

  run()
  {
    _.forEach(Game.powerCreeps, (p)=> {
      if(!p.ticksToLive)
      {
        const roomName = p.name.split('-')[0];
        const powerSpawn = this.roomInfo(roomName).powerSpawn;
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
}
