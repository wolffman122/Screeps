import {Process} from '../../os/process'

interface DefendProcessMetaData
{
  creep: string
  target: string
}

export class DefendProcess extends Process
{
  metaData: DefendProcessMetaData;
  type = 'defend';

  run()
  {
    let creep = Game.creeps[this.metaData.creep];
    let enemy = <Creep>Game.getObjectById(this.metaData.target);

    if(!creep || !enemy)
    {
      this.completed = true;
      this.resumeParent();
      return;
    }

    if(!creep.pos.inRangeTo(enemy, 1))
    {
      creep.travelTo(enemy);
    }
    else
    {
      creep.attack(enemy);
    }
  }
}
