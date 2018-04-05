import { Utils } from "lib/utils";
import { LabDistroLifetimeProcess } from "../lifetimes/labDistro";
import { Process } from "os/process";

export class LabManagementProcess extends Process
{
  metaData: LabManagementProcessMetaData
  type = 'labm';

  ensureMetaData()
  {
    if(!this.metaData.labDistros)
    {
      this.metaData.labDistros = [];
    }
  }

  run()
  {
    this.ensureMetaData();

    this.metaData.labDistros = Utils.clearDeadCreeps(this.metaData.labDistros);

    if(!this.kernel.data.roomData[this.metaData.roomName])
    {
      this.completed= true;
      return;
    }

    if(this.roomData().labs.length > 3 && this.metaData.labDistros.length < 1)
    {
      let creepName = 'labdlf-' + this.metaData.roomName + '-' + Game.time;
      let spawned = Utils.spawn(this.kernel, this.metaData.roomName, 'labDistro', creepName, {});
      if(spawned)
      {
        this.metaData.labDistros.push(creepName);
        this.kernel.addProcess(LabDistroLifetimeProcess, 'labdlf-' + creepName, 35, {
          creep: creepName,
          roomName: this.metaData.roomName

        });
      }
    }

  }
}
