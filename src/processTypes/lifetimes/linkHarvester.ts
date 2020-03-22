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
      this.completed = true;
      return;
    }

    let source = <Source>Game.getObjectById(this.metaData.source);

    if(this.kernel.data.roomData[source.room.name].sourceContainerMaps[source.id]
      &&
       this.kernel.data.roomData[source.room.name].sourceLinkMaps[source.id])
    {
      let container = this.kernel.data.roomData[source.room.name].sourceContainerMaps[source.id];
      let link = this.kernel.data.roomData[source.room.name].sourceLinkMaps[source.id];

      if(creep.store.getFreeCapacity() === 0 && link.energy === link.energyCapacity
        && container.store[RESOURCE_ENERGY] > container.store.getCapacity() * .75)
      {
        let extensions = this.roomInfo(creep.room.name).extensions;
        extensions = extensions.filter(e => (e.store[RESOURCE_ENERGY] ?? 0) === 0);
        const extension = creep.pos.findClosestByPath(extensions);
        if(!creep.pos.isNearTo(extension))
          creep.moveTo(extension);
        else
          creep.transfer(extension, RESOURCE_ENERGY);

        return;
      }

      if(!creep.pos.inRangeTo(container, 0))
      {
        creep.moveTo(container);
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
