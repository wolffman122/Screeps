import { LifetimeProcess } from "os/process";


export class LinkHarvesterLifetimeProcess extends LifetimeProcess
{
  type = 'lhlf';

  run()
  {
    let creep = this.getCreep();

    if(!creep)
    {
      return;
    }

    let source = <Source>Game.getObjectById(this.metaData.source);

    if(this.kernel.data.roomData[source.room.name].sourceContainerMaps[source.id]
      &&
       this.kernel.data.roomData[source.room.name].sourceLinkMaps[source.id])
    {
      let container = this.kernel.data.roomData[source.room.name].sourceContainerMaps[source.id];
      let link = this.kernel.data.roomData[source.room.name].sourceLinkMaps[source.id];

      if(!creep.pos.inRangeTo(container, 0))
      {
        creep.travelTo(container);
      }

      creep.harvest(source);

      if(_.sum(creep.carry) == creep.carryCapacity)
      {
        creep.transfer(link, RESOURCE_ENERGY);
      }

    }
    else
    {
      return;
    }
  }
}
