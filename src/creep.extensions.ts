import { WHITE_LIST } from "processTypes/buildingProcesses/mineralTerminal";
import { Utils } from "lib/utils";

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
    let relDirection = direction + i;
    relDirection = Utils.clampDirection(relDirection);
    let position = this.pos.getPositionAtDirection(relDirection);
    if(!position.inRangeTo(target, 3))
      continue;

    if(position.lookFor(LOOK_STRUCTURES).length > 0)
      continue;

    if(!position.isPassible())
      continue;

    if(position.isNearExit(0))
      continue;

    if(position.lookFor(LOOK_TERRAIN)[0] === "swamp")
    {
      swampPosition = position;
      continue;
    }

    switch(relDirection)
    {
      case 1:
        this.move(TOP);
        break;
      case 2:
        this.move(TOP_RIGHT);
        break;
      case 3:
        this.move(RIGHT);
        break;
      case 4:
        this.move(BOTTOM_RIGHT);
        break;
      case 5:
        this.move(BOTTOM);
        break;
      case 6:
        this.move(BOTTOM_LEFT);
        break;
      case 7:
        this.move(LEFT);
        break;
      case 8:
        this.move(TOP_LEFT);
        break;
    }
  }

  if(swampPosition && allowSwamps)
  {
    return this.move(this.pos.getDirectionTo(swampPosition));
  }

  return this.travelTo(target);
}

Room.prototype.findEnemies = function(): Creep[]
{
  let hostileCreeps = this.find(FIND_HOSTILE_CREEPS);
  hostileCreeps = _.filter(hostileCreeps, (hc: Creep) => {
    return !_.contains(WHITE_LIST, hc.owner.username);
  });

  return hostileCreeps;
}

Creep.prototype.idleOffRoad = function(anchor: {pos: RoomPosition}, maintainDistance): number
{
  let offRoad = this.pos.lookForStructures(STRUCTURE_ROAD) === undefined;
  if(offRoad)
    return OK;

  let positions = _.sortBy(this.pos.openAdjacentSpots(), (p: RoomPosition) => p.getRangeTo(anchor));
  if(maintainDistance)
  {
    let currentRange = this.pos.getRangeTo(anchor);
    positions = _.filter(positions, (p: RoomPosition) => p.getRangeTo(anchor) <= currentRange);
  }

  let swampPosition;
  for(let position of positions)
  {
    if(position.lookForStructures(STRUCTURE_ROAD))
      continue;

    let terrain = position.lookFor(LOOK_TERRAIN)[0] as string;
    if(terrain === "swamp")
    {
      swampPosition = position;
    }
    else
    {
      return this.move(this.pos.getDirectionTo(position));
    }
  }

  if(swampPosition)
  {
    return this.move(this.pos.getDirectionTo(swampPosition));
  }

  return this.travelTo(anchor) as number;
}
