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
        return;
      }

      if(creep.name === 'em-E35S41-20892253')
        console.log(this.name, 1);
      if(_.sum(creep.carry) == creep.carryCapacity && link.energy < link.energyCapacity)
      {
        if(creep.name === 'em-E35S41-20892253')
        console.log(this.name, 2);

        creep.transfer(link, RESOURCE_ENERGY);
        return;
      }

      if(creep.name === 'em-E35S41-20892253')
        console.log(this.name, 3);
      if(creep.harvest(source) === ERR_NOT_ENOUGH_RESOURCES)
      {
        this.suspend = source.ticksToRegeneration;
      }
    }
    else
    {
      return;
    }
  }
}
