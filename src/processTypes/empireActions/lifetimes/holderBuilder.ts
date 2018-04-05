import { LifetimeProcess } from "os/process";
import { BuildProcess } from "processTypes/creepActions/build";
//import { Utils } from "lib/utils";
import { CollectProcess } from "processTypes/creepActions/collect";
import { HarvestProcess } from "processTypes/creepActions/harvest";
//import { HarvestProcess } from "processTypes/creepActions/harvest";

interface HoldBuilderLifetimeProcessMetaData
{
  creep: string
  flagName: string
}
export class HoldBuilderLifetimeProcess extends LifetimeProcess
{
  type = 'holdBuilderlf';
  metaData: HoldBuilderLifetimeProcessMetaData;

  run()
  {
    let flag = Game.flags[this.metaData.flagName];
    let creep = this.getCreep();

    if(!creep || !flag)
    {
      return;
    }

    if(flag.pos.roomName != creep.pos.roomName)
    {
      this.log('Go to the flag ' + creep.name);
      creep.travelTo(new RoomPosition(25, 25, flag.pos.roomName));
    }
    else
    {
      if(_.sum(creep.carry) === 0)
      {
        if(this.kernel.data.roomData[creep.room.name].containers.length > 0)
        {
          let targets = _.filter(this.kernel.data.roomData[creep.room.name].containers, (c: StructureContainer) => {
            return (c.store.energy > 0);
          })

          let target = creep.pos.findClosestByPath(targets);

          if(target)
          {
            this.fork(CollectProcess, 'collect-' + creep.name, this.priority - 1, {
              creep: creep.name,
              target: target.id,
              resource: RESOURCE_ENERGY
            });

            return;
          }
        }
        else
        {
          if(this.kernel.data.roomData[creep.pos.roomName].sources)
          {
            let source = creep.pos.findClosestByRange( this.kernel.data.roomData[creep.pos.roomName].sources);

            if(source)
            {
              this.fork(HarvestProcess, 'harvest-' + creep.name, this.priority - 1, {
                creep: creep.name,
                source: source.id
              })

              return;
            }
          }
        }
      }

      let target = creep.pos.findClosestByRange(this.kernel.data.roomData[creep.pos.roomName].constructionSites);

      if(target)
      {
        this.fork(BuildProcess, 'build-' + creep.name, this.priority - 1, {
          creep: creep.name,
          site: target.id
        });

        return;
      }
      else
      {
        creep.say('spare');
      }
  }
  }
}
