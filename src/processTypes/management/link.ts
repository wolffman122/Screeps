import { Process } from "os/process";


export class LinkManagementProcess extends Process
{
  type = 'lm';

  run()
  {
    if(!this.roomData())
    {
      this.completed = true;
      return;
    }

    if(this.roomData().sourceLinks.length > 0)
    {
      let controllerLink = this.roomData().controllerLink;
      let storageLink = this.roomData().storageLink;
      let storage = storageLink.room.storage;

      _.forEach(this.roomData().sourceLinks, (sl) => {
        if(controllerLink)
        {
          if(sl.cooldown == 0 && sl.energy > 700 && controllerLink.energy < 200 &&
            storage.store.getUsedCapacity(RESOURCE_ENERGY) > 30000)
          {
            sl.transferEnergy(controllerLink);
            return;
          }
        }

        if(storageLink)
        {
          if(sl.cooldown == 0 && sl.energy > 700 && storageLink!.energy < 100)
          {
            sl.transferEnergy(storageLink!);
            return;
          }
        }
      });
    }

    if(this.roomData().links.length > 0)
    {
      let storageLink = this.roomData().storageLink;

      if(storageLink)
      {
        _.forEach(this.roomData().links, (l) => {
          if(l.cooldown == 0 && l.energy > 200 && storageLink!.energy < 100)
          {
            let retValue = l.transferEnergy(storageLink!);
            return;
          }
        })
      }
    }
  }
}
