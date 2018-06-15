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
    let room = flag.room;

    if(!creep || !flag)
    {
      this.completed = true;
      return;
    }

    if(flag.pos.roomName != creep.pos.roomName)
    {
      if(room)
      {
        let targets = _.filter(this.kernel.data.roomData[room.name].containers, (c: StructureContainer) => {
          return (c.store.energy > 0);
        })

        if(creep.name === 'hrm-build-E47S51-9302311')
        {
          console.log(this.name, "Not in the ROOM");
        }
        if(targets.length)
        {
          let target = targets[0];
          if(!creep.pos.inRangeTo(target, 1))
          {
            creep.travelTo(target);
            return;
          }

          creep.withdraw(target, RESOURCE_ENERGY);
          return;
        }
        else
        {
          creep.travelTo(flag);
          return;
        }
      }
      else
      {
        creep.travelTo(flag);
        return;
      }
    }
    else
    {
      if(_.sum(creep.carry) === 0)
      {
        if(this.kernel.data.roomData[creep.room.name].containers.length > 0)
        {
          let structures = creep.room!.find(FIND_HOSTILE_STRUCTURES);
          if(structures)
          {
            let targets = _.filter(structures, (s) => {
              return ((s.structureType === STRUCTURE_LINK || s.structureType == STRUCTURE_TOWER || s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_LAB) && s.energy > 50);
            });

            if(targets.length > 0)
            {
              let target = <Structure>creep.pos.findClosestByPath(targets);

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
              let targets = _.filter(structures, (s)=>{
                return ((s.structureType === STRUCTURE_STORAGE || s.structureType === STRUCTURE_TERMINAL) && s.store.energy > 0);
              })

              if(targets.length > 0)
              {
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
                let container = creep.pos.findClosestByPath(this.kernel.data.roomData[creep.room.name].sourceContainers);

                if(container)
                {
                  if(creep.pos.isNearTo(container))
                  {
                    creep.withdraw(container, RESOURCE_ENERGY);
                    return;
                  }

                  creep.travelTo(container);
                  return;
                }
              }
            }
          }
          else
          {
            if(creep.name === 'hrm-build-E47S51-9302311')
            {
              console.log(this.name, "In the ROOM", 13);
            }
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
        }
        else
        {
          if(creep.name === 'hrm-build-E47S51-9302311')
          {
            console.log(this.name, "In the ROOM", 3);
          }
          let structures = creep.room!.find(FIND_HOSTILE_STRUCTURES);
          if(structures)
          {
            let targets = _.filter(structures, (s) => {
              return ((s.structureType === STRUCTURE_LINK || s.structureType == STRUCTURE_TOWER || s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_LAB) && s.energy > 50);
            });

            if(targets.length > 0)
            {
              let target = <Structure>creep.pos.findClosestByPath(targets);

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
              let targets = _.filter(structures, (s)=>{
                return ((s.structureType === STRUCTURE_STORAGE || s.structureType === STRUCTURE_TERMINAL) && s.store.energy > 0);
              })

              if(targets.length > 0)
              {
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
