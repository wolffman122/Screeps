import { Process } from "os/process";

interface MineralHarvestMetaData
{
  extractor: string
  mineral: string
  creep: string
}

export class MineralHarvest extends Process
{
  type = 'mineral-harvest';
  metaData: MineralHarvestMetaData

  run()
  {
    let creep = Game.creeps[this.metaData.creep];

    if(!creep || _.sum(creep.carry) === creep.carryCapacity)
    {
      this.completed = true;
      this.resume();
      return;
    }

    let mineral = <Mineral>Game.getObjectById(this.metaData.mineral);
    let extractor = <StructureExtractor>Game.getObjectById(this.metaData.extractor);

    if(mineral.mineralAmount === 0)
    {
      this.completed = true;
      this.resume();
      return;
    }

    if(!creep.pos.inRangeTo(extractor, 1))
    {
      creep.travelTo(extractor);
    }
    else
    {
      if(extractor.cooldown == 0)
      {
        creep.harvest(mineral);
      }
      else
      {
        this.suspend = extractor.cooldown;
      }
    }
  }
}
