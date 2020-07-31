import { Process } from "os/process";
import { Utils } from "lib/utils";

export class PortalClaimProcess extends Process
{
  metaData: PortalClaimProcessMetaData;
  type = 'portal-claim';

  ensureMetaData()
  {
    if(!this.metaData.claimCreeps)
      this.metaData.claimCreeps = [];
  }

  run()
  {
    const flag = Game.flags[this.metaData.flagName];
    if(!flag)
    {
      this.completed = true;
      return;
    }

    if(!this.metaData.roomName)
      this.metaData.roomName = flag.name.split('-')[1];

    this.ensureMetaData();

    const claimCount = 1;
    this.metaData.claimCreeps = Utils.clearDeadCreeps(this.metaData.claimCreeps);
    console.log(this.name, this.metaData.claimCreeps.length, claimCount);
    if(this.metaData.claimCreeps.length < claimCount)
    {
      console.log(this.name, 1);
      const flagSplit = flag.name.split('-');
      const creepName = 'Claim-' + flagSplit[3] + '-' + Game.time;
      const spawned = Utils.spawn(
        this.kernel,
        this.metaData.roomName,
        'vision',
        creepName,
        {}
      )

      console.log(this.name, 2, spawned);
      if(spawned)
        this.metaData.claimCreeps.push(creepName);

      return;
    }

    const creep = Game.creeps[this.metaData.claimCreeps[0]];
    if(creep)
    {
      if(!creep.pos.isEqualTo(flag))
        creep.travelTo(flag);
    }
  }
}
