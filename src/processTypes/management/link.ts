import { Process } from "os/process";


export class LinkManagementProcess extends Process
{
  type = 'lm';

  run()
  {
    if(this.roomData().controllerLink)
    {
      let controllerLink = this.roomData().controllerLink;

      let storageLink = this.roomData().storageLink;

      if(storageLink)
      {
        if(controllerLink)
        {
          if(storageLink.cooldown == 0 && storageLink.energy > 700 && controllerLink.energy < 450)
          {
            let ret = storageLink.transferEnergy(controllerLink);
            if(ret == ERR_FULL)
            {
              this.suspend = 15;
            }
          }
          else
          {
            this.suspend = 10;
          }
        }
      }
    }

    if(this.roomData().sourceLinks.length > 0)
    {
      let storageLink = this.roomData().storageLink

      if(storageLink)
      {
        _.forEach(this.roomData().sourceLinks, (sl) => {
          if(sl.cooldown == 0 && sl.energy > 700 && storageLink.energy < 100)
          {
            sl.transferEnergy(storageLink);
          }
        });
      }
    }

    if(this.roomData().links.length > 0)
    {
      let storageLink = this.roomData().storageLink;

      if(storageLink)
      {
        _.forEach(this.roomData().links, (l) => {
          if(l.cooldown == 0 && l.energy > 200 && storageLink.energy < 100)
          {
            let retValue = l.transferEnergy(storageLink);
            if(storageLink.room.name == 'E43S52')
            {
              console.log('Why not sending ' + retValue);
            }
          }
        })
      }
    }
  }
}
