
import { WHITE_LIST } from "processTypes/buildingProcesses/mineralTerminal";
import { Utils } from "lib/utils";
import { LABDISTROCAPACITY } from "processTypes/management/lab";

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

Creep.prototype.withdrawEverything = function(target: StructureContainer|StructureStorage|StructureTerminal|Tombstone|StructureLab)
{
  if(!(target instanceof StructureLab))
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
  }
  else if(target instanceof StructureLab)
  {
    let mineralType = target.mineralType;
    let amount = target.mineralAmount;
    if(mineralType && amount && amount > 0)
    {
      return this.withdraw(target, mineralType);
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

/*Room.prototype.findEnemies = function(): Creep[]
{
  let hostileCreeps = this.find(FIND_HOSTILE_CREEPS);
  hostileCreeps = _.filter(hostileCreeps, (hc: Creep) => {
    return !_.contains(WHITE_LIST, hc.owner.username);
  });

  return hostileCreeps;
}*/

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

Creep.prototype.getFlags = function(identifier: string, max: Number): Flag[]
{
  let flags = [];
  for(let i = 0; i < max; i++)
  {
      let flag = Game.flags[identifier + '-' + i];
      if(flag)
      {
          flags.push(flag);
      }
  }

  return flags;
}

Creep.prototype.boostRequest = function(boosts: string[], allowUnboosted: boolean): any
{
  let totalBoosts = boosts.length;
  let boosted = true;
  for(let boost of boosts)
  {
    console.log(this.name, 'Boost Request 1')
    if(this.memory[boost])
    {
      totalBoosts--;
      console.log(this.name, 'Boost Request 2')
      continue;
    }

    console.log(this.name, 'Boost Request 3')
    let room = Game.rooms[this.pos.roomName];

    if(room)
    {
      let requests = room.memory.boostRequests;
      if(!requests)
      {
        this.memory[boost] = true;
        continue;
      }

      if(!requests[boost])
      {
        requests[boost] = { flagName: undefined, requesterIds: [] };
      }

      // check if already boosted
      let boostedPart = _.find(this.body, {boost: boost});
      if(boostedPart)
      {
        this.memory[boost] = true;
        requests[boost!].requesterIds = _.pull(requests[boost].requesterIds, this.id);
        continue;
      }

      boosted = false;
      if(!_.include(requests[boost].requesterIds, this.id))
      {
        requests[boost].requesterIds.push(this.id);
      }

      if(this.spawning)
        continue;

      let flag = Game.flags[requests[boost].flagName!];
      if(!flag)
      {
        continue;
      }

      let lab = flag.pos.lookForStructures(STRUCTURE_LAB) as StructureLab;

      if(lab.mineralType === boost && lab.mineralAmount >= LABDISTROCAPACITY && lab.energy >= LABDISTROCAPACITY)
      {
        if(this.pos.isNearTo(lab))
        {
          lab.boostCreep(this);
          return OK;
        }
        else
        {
          this.travelTo(lab);
          return ERR_BUSY;
        }
      }
      else if(allowUnboosted)
      {
        console.log("BOOST: no boost for", this.name, " so moving on (alloweUnboosted = true)");
        requests[boost].requesterIds = _.pull(requests[boost].requesterIds, this.id);
        this.memory[boost] = true;
        return;
      }
      else
      {
        if(Game.time % 10 === 0)
          console.log("BOOST: no boost for", this.name);
          this.idleOffRoad(this.room!.storage!, false);
        return;
      }
    }
  }

  if(totalBoosts === 0)
  {
    console.log(this.name, 'Time to exit boostfxn');
    this.memory.boost = true;
  }
}


Creep.prototype.getBodyParts = function(type: BodyPartConstant): boolean
{
  return(_.include(this.body, (b: BodyPartDefinition) => {
    return b.type === type;
  }));
}
