import { WHITE_LIST } from "processTypes/buildingProcesses/mineralTerminal";

Creep.prototype.transferEverything = function(target: Creep|StructureContainer|StructureStorage|StructureTerminal)
{
  for(let t in this.carry)
  {
      let resourceType = t as ResourceConstant;
      let amount = this.carry[resourceType];
      if(amount && amount > 0)
      {
        return this.transfer(target, resourceType);
      }
  }
  return ERR_NOT_ENOUGH_RESOURCES;
}

Creep.prototype.withdrawEverything = function(target: StructureContainer|StructureStorage|StructureTerminal)
{
  for(let t in target.store)
  {
    let resourceType = t as ResourceConstant;
    let amount = target.store[resourceType];
    if(amount && amount > 0)
    {
      return this.withdraw(target, resourceType);
    }
  }

  return ERR_NOT_ENOUGH_RESOURCES;
}

Creep.prototype.yieldRoad = function(target: {pos: RoomPosition}, allowSwamps = true): number
{
  let isOffRoad = this.pos.lookForStructures(STRUCTURE_ROAD) === undefined;
  if(isOffRoad)
  {
    return OK;
  }

  let swampPosition;
  // find movement options
  let direction = this.pos.getDirectionTo(target);
  for(let i = -2; i <= 2; i++)
  {
    
  }
}

Room.prototype.findEnemies = function(): Creep[]
{
  let hostileCreeps = this.find(FIND_HOSTILE_CREEPS);
  hostileCreeps = _.filter(hostileCreeps, (hc: Creep) => {
    return !_.contains(WHITE_LIST, hc.owner.username);
  });

  return hostileCreeps;
}
