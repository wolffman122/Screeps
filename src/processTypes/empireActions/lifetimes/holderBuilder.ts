import { LifetimeProcess } from "os/process";
import { HarvestProcess } from "processTypes/creepActions/harvest";
import { MoveProcess } from "../../creepActions/move";


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

    if(!creep.memory.atPlace)
    {
      if(!creep.pos.inRangeTo(flag, 3))
        creep.travelTo(flag);
      else
        creep.memory.atPlace = true

      return;
    }
    else
    {
      const sources = this.kernel.data.roomData[flag.room.name].sources.filter(s => s.energy > 0);
      const source = creep.pos.findClosestByRange(sources);
      if(_.sum(creep.carry) === 0 || !creep.memory.full)
      {
        if(creep.name === 'hrm-build-E38S36-27409648')
            console.log(this.name, 'ruins', 0.1)
        creep.memory.full = false;
        if(this.kernel.data.roomData[flag.room.name].containers.length > 0)
        {
          const ruins = creep.room.find(FIND_RUINS, {filter: r => r.store.getUsedCapacity(RESOURCE_ENERGY) > 0});
          if(ruins.length)
          {
            if(creep.name === 'hrm-build-E38S36-27409648')
            console.log(this.name, 'ruins', 2)
            const ruin = creep.pos.findClosestByPath(ruins);
            if(!creep.pos.isNearTo(ruin))
              creep.travelTo(ruin);
            else
            {
              if(creep.name === 'hrm-build-E38S36-27409648')
            console.log(this.name, 'ruins', 3)
              if(creep.withdraw(ruin, RESOURCE_ENERGY) === OK)
                creep.memory.full = true;
            }

            if(creep.name === 'hrm-build-E38S36-27409648')
            console.log(this.name, 'ruins', 4)
            return;
          }
          
          if(creep.name === 'hrm-build-E38S36-27409648')
            console.log(this.name, 'ruins', 0.2)
          let structures = flag.room!.find(FIND_HOSTILE_STRUCTURES);
          if(structures)
          {
            if(creep.name === 'hrm-build-E34S51-25539475')
          console.log(this.name, 'Problem', 2.1);
            let targets = structures.filter(s => {
              return ((s.structureType === STRUCTURE_LINK || s.structureType == STRUCTURE_TOWER || s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_LAB) && s.energy > 50);
            });

            if(targets.length > 0)
            {
              if(creep.name === 'hrm-build-E34S51-25539475')
          console.log(this.name, 'Problem', 2.2);
              let target = <Structure>creep.pos.findClosestByPath(targets);

              if(target)
              {
                creep.say('E1', true);
                  if(!creep.pos.isNearTo(target))
                    creep.travelTo(target);
                  else
                    creep.withdraw(target, RESOURCE_ENERGY);

                  return;
              }
            }
            else
            {
              if(creep.name === 'hrm-build-E34S51-25539475')
          console.log(this.name, 'Problem', 2.3);
              let targets = structures.filter( s => {
                return ((s.structureType === STRUCTURE_STORAGE || s.structureType === STRUCTURE_TERMINAL) && s.store.energy > 0);
              })

              if(targets.length > 0)
              {
                let target = creep.pos.findClosestByPath(targets);

                if(target)
                {
                  creep.say('E2', true);
                  if(!creep.pos.isNearTo(target))
                    creep.travelTo(target);
                  else
                    creep.withdraw(target, RESOURCE_ENERGY);

                  return;
                }
              }
              else
              {


                let container = creep.pos.findClosestByPath(this.kernel.data.roomData[flag.room.name].sourceContainers);

                if(creep.name === 'hrm-build-E34S51-25539475')
          console.log(this.name, 'Problem', 2.4, container);
                if(container && container.store.energy >= creep.carryCapacity)
                {
                  creep.say('E3', true);
                  if(creep.pos.isNearTo(container))
                  {
                    creep.withdraw(container, RESOURCE_ENERGY);
                    creep.memory.full = true;
                  }
                  else
                    creep.travelTo(container);

                  return;
                }
                else
                {
                  creep.say('E4', true);
                  if(source)
                  {
                    if(!creep.pos.inRangeTo(source, 1))
                      creep.travelTo(source);
                    else
                    {
                      creep.harvest(source);
                      if(creep.store.getFreeCapacity() === 0)
                        creep.memory.full = true;
                    }

                    return;
                  }
                }
              }
            }
          }
          else
          {
            if(creep.name === 'hrm-build-E34S51-25539475')
              console.log(this.name, "In the ROOM", 13);
            let targets = this.kernel.data.roomData[flag.room.name].containers.filter(c => {
              return (c.store.energy > 0);
            })

            if(targets.length)
            {
              if(creep.name === 'hrm-build-E34S51-25539475')
              console.log(this.name, "In the ROOM", 14);
              let target = creep.pos.findClosestByPath(targets);


              if(target)
              {
                creep.say('C', true);
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
              let source = creep.pos.findClosestByRange(this.kernel.data.roomData[flag.room.name].sources);

              if(source)
              {
                creep.say('S', true);
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
                    let site = sites.filter(s => {
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
          if(creep.name === 'hrm-build-E34S51-25539475')
          console.log(this.name, 'Problem', 2.6);
        }
        else
        {
          if(creep.name === 'hrm-build-E38S36-27409648')
            console.log(this.name, 'ruins', 0.3)
          let structures = creep.room!.find(FIND_HOSTILE_STRUCTURES);
          if(structures.length)
          {
            if(creep.name === 'hrm-build-E38S36-27409648')
            console.log(this.name, 'ruins', 0.4, structures)
            let targets = structures.filter(s => {
              return ((s.structureType === STRUCTURE_LINK || s.structureType == STRUCTURE_TOWER || s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_LAB) && s.energy > 50);
            });

            if(targets.length > 0)
            {
              let target = <Structure>creep.pos.findClosestByPath(targets);

              if(target)
              {
                creep.say('E5', true);
                if(!creep.pos.isNearTo(target))
                  creep.travelTo(target);
                else
                  creep.withdraw(target, RESOURCE_ENERGY);

                  return;
              }
            }
            else
            {
              let targets = structures.filter(s=>{
                return ((s.structureType === STRUCTURE_STORAGE || s.structureType === STRUCTURE_TERMINAL) && s.store.energy > 0);
              })

              if(targets.length > 0)
              {
                let target = creep.pos.findClosestByPath(targets);

                if(target)
                {
                  creep.say('E6', true);
                  if(!creep.pos.isNearTo(target))
                    creep.travelTo(target);
                  else
                    creep.withdraw(target, RESOURCE_ENERGY);

                  return;
                }
              }
              else
              {
                if(this.kernel.data.roomData[flag.room.name].sources)
                {
                  let source = creep.pos.findClosestByRange( this.kernel.data.roomData[flag.room.name].sources);

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
                        let site = sites.filter(s => {
                          if(s.structureType == STRUCTURE_CONTAINER && s.pos.inRangeTo(source, 1))
                          {
                            return s;
                          }
                          return;
                        });
                      }
                    }
                  }
                }
              }
            }
          }

          if(creep.name === 'hrm-build-E38S36-27409648')
            console.log(this.name, 'ruins', 1)
          const ruins = creep.room.find(FIND_RUINS, {filter: r => r.store.getUsedCapacity(RESOURCE_ENERGY) > 0});
          if(ruins.length)
          {
            if(creep.name === 'hrm-build-E38S36-27409648')
            console.log(this.name, 'ruins', 2)
            const ruin = creep.pos.findClosestByPath(ruins);
            if(!creep.pos.isNearTo(ruin))
              creep.travelTo(ruin);
            else
            {
              if(creep.name === 'hrm-build-E38S36-27409648')
            console.log(this.name, 'ruins', 3)
              if(creep.withdraw(ruin, RESOURCE_ENERGY) === OK)
                creep.memory.full = true;
            }

            if(creep.name === 'hrm-build-E38S36-27409648')
            console.log(this.name, 'ruins', 4)
            return;
          }
          if(creep.name === 'hrm-build-E38S36-27409648')
            console.log(this.name, 'ruins', 5)

          if(!creep.pos.isNearTo(source))
            creep.travelTo(source);
          else
          {
            creep.harvest(source);

            if(creep.name === 'hrm-build-E34S51-25539475')
              console.log(this.name, 'Creep full', creep.store.getFreeCapacity());

            if(creep.store.getFreeCapacity() === 0)
              creep.memory.full = true;

            return;
          }
        }
      }

      if(creep.name === 'hrm-build-E34S51-25539475')
          console.log(this.name, 'Problem', 3);

      if(_.sum(creep.carry) != 0)
      {
        if(creep.name === 'hrm-build-E34S51-25539475')
          console.log(this.name, 'Problem', 4);
        let sites = this.kernel.data.roomData[flag.room.name].constructionSites.filter(cs => {
          return (cs.my);
        })
        let target = creep.pos.findClosestByPath(sites);

        if(target)
        {
          if(creep.name === 'hrm-build-E34S51-25539475')
          console.log(this.name, 'Problem', 4.1);
          if(!creep.pos.inRangeTo(target, 3))
            creep.travelTo(target, {range: 3});
          else
          {
            if(creep.name === 'hrm-build-E34S51-25539475')
          console.log(this.name, 'Problem', 4.2);
            if(creep.pos.isEqualTo(target))
            {
              let dir = creep.pos.getDirectionTo(source) as number;
              if(creep.name === 'hrm-build-E34S51-25539475')
          console.log(this.name, 'Problem', 4.3, dir);
              dir = +((dir + 4) % 8 === 0) ? 1 : (dir+4) % 8;
              if(creep.name === 'hrm-build-E34S51-25539475')
          console.log(this.name, 'Problem', 4.4, dir);
              const pos = creep.pos.getPositionAtDirection(dir);
              creep.travelTo(pos);

            }
            else
            {
              if(creep.name === 'hrm-build-E34S51-25539475')
          console.log(this.name, 'Problem', 4.5);
              creep.build(target);
            }
          }

          return;
        }
        else
        {
          let sources = this.kernel.data.roomData[flag.room.name].sources;
          let sourceContainersMaps = this.kernel.data.roomData[flag.room.name].sourceContainerMaps;

          if(sources.length)
          {
            let missingConatiners = sources.filter(s => {
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
