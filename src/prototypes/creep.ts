
import { WHITE_LIST } from "processTypes/buildingProcesses/mineralTerminal";
import { Utils } from "lib/utils";
import { LABDISTROCAPACITY } from "processTypes/management/lab";

Creep.prototype.transferEverything = function(target: Creep|StructureContainer|StructureStorage|StructureTerminal|StructureFactory)
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

Creep.prototype.withdrawEverything = function(target: any)
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

Creep.prototype.withdrawEverythingBut = function (target: any, res: ResourceConstant)
{
  if(!(target instanceof StructureLab))
  {
    for(let t in target.store)
    {
      let resourceType = t as ResourceConstant;
      if(resourceType !== res)
      {
        let amount = target.store[resourceType];
        if(amount && amount > 0)
        {
          return this.withdraw(target, resourceType);
        }
      }
    }
  }
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
    return 5;

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

    if(position.lookForStructures(STRUCTURE_CONTAINER))
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
  if(Game.cpu.bucket < 6900)
    this.memory.boost = true;

  if(this.name === 'em-u-E38S39-22618434')
        console.log('Defense', 1);
  let totalBoosts = boosts.length;
  let boosted = true;
  for(let boost of boosts)
  {
    if(this.name === 'em-u-E38S39-22618434')
        console.log('Defense', 2, totalBoosts);
    if(this.memory[boost])
    {
      if(this.name === 'em-u-E38S39-22618434')
        console.log('Defense', 3);
      totalBoosts--;
      continue;
    }

    let room = Game.rooms[this.pos.roomName];

    if(room)
    {
      if(this.name === 'em-u-E38S39-22618434')
        console.log('Defense', 4);
      let requests = room.memory.boostRequests;
      if(!requests)
      {
        if(this.name === 'em-u-E38S39-22618434')
        console.log('Defense', 5);
        this.memory[boost] = true;
        continue;
      }

      if(!requests[boost])
      {
        if(this.name === 'em-u-E38S39-22618434')
        console.log('Defense', 6);
        requests[boost] = { flagName: undefined, requesterIds: [] };
      }

      // check if already boosted
      let boostedPart = _.find(this.body, {boost: boost});
      if(boostedPart)
      {
        if(this.name === 'em-u-E38S39-22618434')
        console.log('Defense', 7);
        this.memory[boost] = true;
        requests[boost!].requesterIds = _.pull(requests[boost].requesterIds, this.id);
        continue;
      }

      boosted = false;
      if(!_.include(requests[boost].requesterIds, this.id))
      {
        if(this.name === 'em-u-E38S39-22618434')
        console.log('Defense', 8);
        requests[boost].requesterIds.push(this.id);
      }

      if(this.spawning)
        continue;

      let flag = Game.flags[requests[boost].flagName!];
      if(!flag)
      {
        if(this.name === 'em-u-E38S39-22618434')
        {
          console.log('Defense', 9, boost, requests[boost].flagName, requests[boost].flagName.length);
          requests[boost].requesterIds = _.pull(requests[boost].requesterIds, this.id);
          this.memory[boost] = true;
          return;
        }
        continue;
      }

      let lab = flag.pos.lookForStructures(STRUCTURE_LAB) as StructureLab;

      if(lab.mineralType === boost && lab.mineralAmount >= LABDISTROCAPACITY && lab.energy >= LABDISTROCAPACITY)
      {
        if(this.name === 'em-u-E38S39-22618434')
          console.log('Defense', 10);

        if(this.pos.isNearTo(lab))
        {
          if(this.name === 'em-u-E38S39-22618434')
            console.log('Defense', 101);
          let ret = lab.boostCreep(this);
          if(this.name === 'em-u-E38S39-22618434')
            console.log('Defense', 101, ret);
          return OK;
        }
        else
        {
          let ret = this.travelTo(lab);
          if(this.name === 'em-u-E38S39-22618434')
            console.log('Defense', 102, ret, lab.pos, lab.id);
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
    this.memory.boost = true;
  }
}


Creep.prototype.getBodyPart = function(type: BodyPartConstant): boolean
{
  return(_.include(this.body, (b: BodyPartDefinition) => {
    if(this.room.name === 'E32S45')
          console.log('bp', 2, b.type, type);
    return b.type === type;
  }));
}

Creep.prototype.getBodyParts = function(): BodyPartConstant[]
{
  let retValue: BodyPartConstant[] = [];
  _.forEach(BODYPARTS_ALL, (bp) => {
    let amount = this.getActiveBodyparts(bp);
    let part: BodyPartConstant[] = [];
    for(let i = 0; i < amount; i++)
      part.push(bp);

    retValue = retValue.concat(part);
  });

  return retValue;
}

Creep.prototype.getBodyPartBoosted = function(type: BodyPartConstant): boolean
{
  console.log('GetBodyPartsBoosted', type);

  let foundBoosted = false;
  for(let i = 0; i < this.body.length && !foundBoosted; i++)
  {
    const part = this.body[i];
    if(part.type === type && part.boost && part.hits > 0)
      foundBoosted = true;
  }

  // Use string lenght of boost to determin tier level
//   part.boost.length === 2 tier 2
// 4:24
// part.boost.length === 4 tier 3
// 4:25
// oh, I mean tier 1 and 2,
  console.log(foundBoosted);

  return foundBoosted;
}

Creep.prototype.partCount = function(partType: string): number
{
  let count = 0;
  for(let part of this.body)
  {
    if(part.type = partType)
      count++;
  }
  return count;
}

Creep.prototype.moveDir = function(dir: DirectionConstant): string
{
  let ret = '';
  switch(dir)
  {
    case TOP:
      ret = '⬆';
      break;
    case TOP_RIGHT:
      ret = '↗'
      break;
    case RIGHT:
      ret = '➡'
      break;
    case BOTTOM_RIGHT:
      ret = ''
      break;
    case BOTTOM:
      ret = '⬇'
      break;
    case BOTTOM_LEFT:
      ret = '↙'
      break;
    case LEFT:
      ret = '⬅'
      break;
    case TOP_LEFT:
      ret = '↖'
      break;
  }

  return ret;
}

Creep.prototype.almostFull = function(): boolean
{
  if(this.name === 'em-E56S43-26245732')
  {
    console.log(this.name, 'Harvest power', this.getActiveBodyparts(WORK) * HARVEST_POWER + this.store.getUsedCapacity(), 'Capacity', this.store.getCapacity())
  }
  return (this.getActiveBodyparts(WORK) * HARVEST_POWER + this.store.getUsedCapacity() >= this.store.getCapacity());
}

Creep.prototype.getCost = function(): number
{
  let cost = 0;
  for(let i = 0; i < Object.keys(this.body).length; i++)
    cost += BODYPART_COST[this.body[i].type];

  return cost;
}
