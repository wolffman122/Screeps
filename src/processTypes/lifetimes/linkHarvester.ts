import { LifetimeProcess } from "os/process";


export class LinkHarvesterLifetimeProcess extends LifetimeProcess
{
  type = 'lhlf';

  run()
  {
    let creep = this.getCreep();

    if(!creep)
    {
      this.completed = true;
      return;
    }

    if(creep.room.memory.shutdown)
    {
      //this.completed = true;
      return;
    }

    if(creep.name === 'em-E36S38-25754790')
      console.log(this.name, '88888888888888888888888888888888888888888888888888888888888888888888888888888888888888888')

    const source = <Source>Game.getObjectById(this.metaData.source);
    if(this.kernel.data.roomData[source.room.name].sourceLinkMaps[source.id])
    {
      const link = this.kernel.data.roomData[source.room.name].sourceLinkMaps[source.id];
      if(creep.name === 'em-E36S38-25754790')
        console.log(this.name, 1);
      if(_.sum(creep.carry) == creep.carryCapacity)
      {
        if(creep.name === 'em-E36S38-25754790')
        console.log(this.name, 2);

        if((link.store[RESOURCE_ENERGY] ?? 0) !== link.store.getCapacity(RESOURCE_ENERGY))
        {
          if(!creep.pos.isNearTo(link))
            creep.travelTo(link);
          else
            creep.transfer(link, RESOURCE_ENERGY);
        }
        else
        {
          if(creep.name === 'em-E36S38-25754790')
        console.log(this.name, 3);

          const extensions = this.kernel.data.roomData[creep.room.name].extensions.filter(e => (e.store[RESOURCE_ENERGY] ?? 0) !== e.store.getCapacity(RESOURCE_ENERGY));
          if(extensions.length)
          {
            const extension = creep.pos.findClosestByPath(extensions);
            if(!creep.pos.isNearTo(extension))
              creep.travelTo(extension);
            else
              creep.transfer(extension, RESOURCE_ENERGY);
          }
        }
        if(creep.name === 'em-E36S38-25754790')
        console.log(this.name, 4);

        return;
      }


      if(!creep.pos.isNearTo(source))
      {
        creep.travelTo(source);
        return;
      }

      if(creep.store.getFreeCapacity() > 0)
      {
        if(creep.harvest(source) === ERR_NOT_ENOUGH_RESOURCES)
        {
          this.suspend = source.ticksToRegeneration;
        }
      }

    }
    else
    {
      return;
    }
  }
}
