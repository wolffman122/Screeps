import { LifetimeProcess } from "os/process";
import { BuildProcess } from "processTypes/creepActions/build";
import { CollectProcess } from "processTypes/creepActions/collect";
import { HarvestProcess } from "processTypes/creepActions/harvest";


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
      this.completed = true;
      return;
    }

    if(flag.pos.roomName != creep.pos.roomName)
    {
      creep.travelTo(flag);
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

          if(targets.length)
          {
            let target = creep.pos.findClosestByPath(targets);


            if(target)
            {
              if(!creep.pos.inRangeTo(target, 1))
              {
                creep.travelTo(target);
                return;
              }

              creep.withdraw(target, RESOURCE_ENERGY);
              return;
            }
          }
          else
          {
            let source = creep.pos.findClosestByRange(this.kernel.data.roomData[creep.pos.roomName].sources);

            if(source)
            {
              if(!creep.pos.inRangeTo(source, 1))
              {
                creep.travelTo(source);
                return;
              }

              if(creep.pos.inRangeTo(source, 1))
              {
                let sites = creep.room.find(FIND_CONSTRUCTION_SITES);
                if(sites.length > 0)
                {
                  let site = _.filter(sites, (s) => {
                    if(s.structureType == STRUCTURE_CONTAINER && s.pos.inRangeTo(source, 1))
                    {
                      return s;
                    }
                    return;
                  });

                  

                  return;
                }
              }
            }
          }
        }
        else
        {
          if(this.kernel.data.roomData[creep.pos.roomName].sources)
          {
            let source = creep.pos.findClosestByRange( this.kernel.data.roomData[creep.pos.roomName].sources);

            if(source)
            {
              if(!creep.pos.inRangeTo(source, 1))
              {
                creep.travelTo(source);
                return;
              }

              if(creep.pos.inRangeTo(source, 1))
              {
                let sites = creep.room.find(FIND_CONSTRUCTION_SITES);
                if(sites.length > 0)
                {
                  let site = _.filter(sites, (s) => {
                    if(s.structureType == STRUCTURE_CONTAINER && s.pos.inRangeTo(source, 1))
                    {
                      return s;
                    }
                    return;
                  });

                  this.fork(HarvestProcess, 'harvest-' + creep.name, this.priority - 1, {
                    creep: creep.name,
                    source: source.id,
                    resource: RESOURCE_ENERGY
                  });

                  return;
                }

                this.fork(HarvestProcess, 'harvest-' + creep.name, this.priority - 1, {
                  creep: creep.name,
                  source: source.id,
                  resource: RESOURCE_ENERGY
                });

                return;
              }
            }
          }
        }
      }

      if(_.sum(creep.carry) != 0)
      {
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
          if(!creep.pos.inRangeTo(creep.room.controller!, 5))
          {
            creep.travelTo(creep.room.controller!);
          }

          creep.say('spare');
        }
      }
  }
  }
}
