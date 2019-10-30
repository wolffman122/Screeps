import {Process} from '../../os/process'

export class LinkTransferProcess extends Process
{
  type = 'lt'

  run()
  {
    let room = Game.rooms[this.metaData.roomName];

    let sourceLinks = this.kernel.data.roomData[room.name].sourcLinks;
    let centralLink = this.kernel.data.roomData[room.name].centralLinks[0];
    let controllerLink = this.roomData().controllerLink;

    _.forEach(sourceLinks, (s: StructureLink) => {
      if(controllerLink && controllerLink.energy < controllerLink.energyCapacity)
      {
        s.transferEnergy(centralLink);
        return;
      }

      let ret = s.transferEnergy(centralLink);
      if(ret == ERR_FULL)
      {
        this.suspend = 10;
      }
      else if (ret == OK)
      {
        this.completed = true;
      }
    })
  }
}
