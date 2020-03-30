import { Process } from "os/process";


export class LinkManagementProcess extends Process
{
  type = 'lm';

  run()
  {
    if(Game.rooms[this.metaData.roomName]?.memory.shutdown)
    {
      this.completed = true;
      return;
    }

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
        if(this.metaData.roomName === 'E32S44')
          console.log(this.name, (controllerLink.store.getFreeCapacity(RESOURCE_ENERGY) ?? 0));
        if((controllerLink?.store.getFreeCapacity(RESOURCE_ENERGY) ?? 0) > 100)
        {
          if(sl.cooldown == 0 && sl.energy > 700 &&
            storage.store.getUsedCapacity(RESOURCE_ENERGY) > 30000)
          {
            if(sl.transferEnergy(controllerLink) === OK)
              return false;
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

      if((storageLink?.store.getUsedCapacity() ?? 0) === 0)
      {
        const room = Game.rooms[storageLink.room.name];
        if(!room?.memory.linkDistances)
          room.memory.linkDistances = {};

        if(Object.keys(room.memory.linkDistances).length < this.roomData().links.length)
        {
          const storage = room.storage;
          this.roomData().links.forEach( l => {
              room.memory.linkDistances[l.id] = l.pos.findPathTo(storage).length;
          });
        }

        _.forEach(this.roomData().links, (l) => {
          if(l.cooldown == 0 && l.energy > 200)
          {
            if(l.transferEnergy(storageLink) === OK)
              return false;
          }
        })
      }
    }
  }
}
