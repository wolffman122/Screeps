import { LifetimeProcess } from "os/process";
import { HarvestProcess } from "processTypes/creepActions/harvest";
import { MoveProcess } from "../../creepActions/move";


export class HoldBuilderLifetimeProcess extends LifetimeProcess
{
  type = 'holdBuilderlf';
  metaData: HoldBuilderLifetimeProcessMetaData;

  run()
  {
    let room = Game.rooms[this.metaData.remoteName];
    let creep = this.getCreep();

    if(!creep)
    {
      this.completed = true;
      return;
    }

    if(room.name != creep.pos.roomName)
    {
      this.fork(MoveProcess, 'move-' + creep.name, this.priority - 1, {
        creep: creep.name,
        pos: room.controller.pos,
        range: 3
      });

      return;
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
                  if(!creep.pos.isNearTo(target))
                    creep.travelTo(target);
                  else
                    creep.withdraw(target, RESOURCE_ENERGY);

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
                  if(!creep.pos.isNearTo(target))
                    creep.travelTo(target);
                  else
                    creep.withdraw(target, RESOURCE_ENERGY);

                  return;
                }
              }
              else
              {
                let container = creep.pos.findClosestByPath(this.kernel.data.roomData[creep.room.name].sourceContainers);

                if(container && container.store.energy >= creep.carryCapacity)
                {
                  if(creep.pos.isNearTo(container))
                  {
                    creep.withdraw(container, RESOURCE_ENERGY);
                    return;
                  }

                  creep.travelTo(container);
                  return;
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
                    creep.harvest(source);
                    return;
                  }
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
                if(!creep.pos.isNearTo(target))
                  creep.travelTo(target);
                else
                  creep.withdraw(target, RESOURCE_ENERGY);

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
                  if(!creep.pos.isNearTo(target))
                    creep.travelTo(target);
                  else
                    creep.withdraw(target, RESOURCE_ENERGY);

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
        let sites = _.filter(this.kernel.data.roomData[creep.pos.roomName].constructionSites, (cs) => {
          return (cs.my);
        })
        let target = creep.pos.findClosestByRange(sites);

        if(target)
        {
          if(!creep.pos.inRangeTo(target, 3))
            creep.travelTo(target, {range: 3});
          else
            creep.build(target);

          return;
        }
        else
        {
          let sources = this.kernel.data.roomData[creep.pos.roomName].sources;
          let sourceContainersMaps = this.kernel.data.roomData[creep.pos.roomName].sourceContainerMaps;

          if(sources.length)
          {
            let missingConatiners = _.filter(sources, (s) => {
              return (!sourceContainersMaps[s.id])
            });

            if(missingConatiners.length)
            {
              let openSpaces = missingConatiners[0].pos.openAdjacentSpots(true);
              if(openSpaces.length)
              {
                let clearConstruction = false;
                let openSpace = openSpaces[0];
                const look = openSpace.look();
                _.forEach(look, (l) => {
                  if(LOOK_CONSTRUCTION_SITES === l.type)
                    clearConstruction = true;
                })
                if(clearConstruction)
                {
                  creep.travelTo(openSpace);
                  return;
                }

                missingConatiners[0].room.createConstructionSite(openSpace.x, openSpace.y, STRUCTURE_CONTAINER);
              }

            }
            /*else
            {
              console.log(this.name, 'Not missing some contianers');
            }*/
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
}
