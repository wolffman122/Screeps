interface PartList{
  [name: string]: BodyPartConstant[]
}

interface WeightList{
  [part: string]: number
}

export const CreepBuilder = {
  design: function(creepType: string, room: Room, memory: any) : BodyPartConstant[]
  {


    let creepCount = room.find(FIND_MY_CREEPS).length

    const containers = room.find(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_CONTAINER});

    let emergancy = ((creepType === 'harvester' || creepType === 'pHarvester' || creepType === 'pBigHarvester') && creepCount < 2)
      || (creepType === 'mover' && creepCount < 4) || (room.storage?.my && containers.length < 1);

    if(creepType === 'vision')
    {
      return [MOVE];
    }
    if(creepType === 'bigWorker')
    {
      return [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
              MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,
              WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,
              WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
              CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY];
    }
    if(creepType === 'guard')
    {
      return [MOVE,   MOVE,   MOVE,   MOVE,   MOVE,   MOVE,   MOVE,   MOVE,   MOVE,   MOVE,
              MOVE,   MOVE,   MOVE,   MOVE,   MOVE,   MOVE,   MOVE,   MOVE,   MOVE,   MOVE,
              MOVE,   MOVE,   MOVE,   MOVE,   ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK,
              ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK,
              ATTACK, HEAL, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK,  HEAL, HEAL, HEAL, MOVE, HEAL];
    }
    else if(creepType === 'skMiner')
    {
      return [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
              CARRY, CARRY, CARRY, WORK,  WORK,  WORK,  WORK,  WORK,  WORK,  WORK,
              WORK,  WORK,  WORK,  WORK,  WORK,  WORK,  WORK,  WORK,  WORK,  WORK,
              WORK,  WORK,  WORK,  WORK,  WORK,  CARRY, MOVE,  MOVE,  MOVE,  MOVE,
              MOVE,  MOVE,  MOVE,  MOVE,  MOVE,  MOVE,  MOVE,  MOVE,  WORK,  WORK];
    }
    else if(creepType === 'skMinerHauler')
    {
      return [MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY,
              MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY,
              MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY,
              MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY,
              MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY];
    }
    else if(creepType === 'testattacker')
    {
      return [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
              MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,
              ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,
              ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,
              ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK];
    }
    else if(creepType === 'testhealer')
    {
      return [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
              MOVE,MOVE,MOVE,MOVE,MOVE,HEAL,HEAL,HEAL,HEAL,HEAL,
              HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,
              HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,
              HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL];
    }
    else if(creepType === 'SHRange')
    {
      return [TOUGH, TOUGH, TOUGH, TOUGH, RANGED_ATTACK, TOUGH, TOUGH, TOUGH, RANGED_ATTACK, TOUGH,
              TOUGH, RANGED_ATTACK, TOUGH, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK,
              RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, TOUGH,
              RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, TOUGH,
              MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
    }
    else if(creepType === 'SH4Heal')
    {
      return [TOUGH, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL,
              HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL,
              HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL,
              HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, MOVE,
              MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, HEAL];
    }
    else if(creepType === 'shHauler')
    {
      return [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
              CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
              CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
              CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
              MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
    }
    else if(creepType === 'maxHealer')
    {
      return [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
              HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,
              HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,
              HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,
              HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL];
    }
    else if(creepType === 'maxRange')
    {
      return [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
              RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK,
              RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK,
              RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK,
              RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK];
    }
    else if(creepType === 'mage')
    {
      return [TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,RANGED_ATTACK,RANGED_ATTACK,
              MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
              RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,
              RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,
              RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL];
    }
    else if(creepType === 'soloMage')
    {
      return [TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,
              RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,
              RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,HEAL,HEAL,HEAL,HEAL,
              HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,
              MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
    }
    else if(creepType === 'despositMiner')
    {
      return [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
              WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
              MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
              CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
              MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
    }
    else if(creepType === 'transferUpgrader')
    {
      return [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
              MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
              MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,
              WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,
              WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY];
    }
    else if(creepType === 'transportHealer')
    {
      return [HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,
              HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,
              HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,
              HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,
              MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
    }
    else if(creepType === 'pHarvester')
    {
      if(emergancy)
        creepType = 'harvester';
      else
        return [WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,
                MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY];
    }
    else if(creepType === 'pBigHarvester')
    {
      if(emergancy)
        creepType = 'harvester';
      else
        return [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
                WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,
                WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,
                CARRY,CARRY,CARRY,CARRY];
    }
    else if(creepType === 'templeBuilder' || creepType === 'remoteWorker')
    {
      return [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
              WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,
              WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,
              CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
              CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY]
    }
    else if(creepType === 'tempDistro')
    {
      return [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
              MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,
              CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
              CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
              CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY];
    }
    else if(creepType === 'templeUpgrader')
    {
      return [WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,
              WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,
              WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,
              WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,
              WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
       /*[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
              MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,
              WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,
              WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,
              WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY];*/
    }
    else if(creepType === 'powerAttacker')
    {
      return [TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,
              ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,
              ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,
              ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,
              MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
    }
    else if(creepType === 'powerHealer')
    {
      return [HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,
              MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
    }
    else if(creepType === 'custom')
    {
      return memory.body;
    }
    else if(creepType === 'allWork')
    {
      return [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
        WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
        WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
        WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
    }

    let body = <BodyPartConstant[]>[].concat(<never[]>CreepBuilder.typeStarts[creepType])
    let spendCap

    if(emergancy){
      spendCap = 300
    }else{
      spendCap = room.energyCapacityAvailable
    }


    let add = true
    let extendIndex = 0

    if(creepType === 'vision')
    {
      console.log('Vision problems 2')
    }


    if(CreepBuilder.typeExtends[creepType].length === 0)
    {
      add = false;
    }

    if(room.name === 'E36S38' && creepType === 'harvester')
      console.log('Creep design', 1.1, creepType, add, spendCap)

    while(add)
    {
      if(room.name === 'E36S38' && creepType === 'harvester')
        console.log('Creep design', 0.2, creepCost, body)
      var creepCost = CreepBuilder.bodyCost(body)

      if(room.name === 'E36S38' && creepType === 'harvester')
      console.log('Creep design', 1.2, creepCost, body)
      if(memory.addition)
      {
        creepType = memory.addition;
      }

      var nextPart = <BodyPartConstant>CreepBuilder.typeExtends[creepType][extendIndex]
      let maximum = CreepBuilder.typeLengths[creepType];

      if(memory.max)
      {
        maximum = memory.max;
      }

      if(
        creepCost + BODYPART_COST[nextPart] > spendCap
        ||
        body.length === maximum
      ){
        add = false
      }else{
        body.push(CreepBuilder.typeExtends[creepType][extendIndex])
        extendIndex += 1
        if(extendIndex === CreepBuilder.typeExtends[creepType].length){
          extendIndex = 0
        }
      }
    }

    if(creepType === 'vision')
    {
      console.log('Vision problems 3', body)
    }

    if(body.length > 1)
    {
      let temp = _.chunk(body, body.length - 1)[0];
      temp = _.sortBy(temp, function(part){
        return CreepBuilder.partWeight[part]
      }) as BodyPartConstant[];

      let last = _.chunk(body, body.length -1)[1];
      temp.push(last[0]);
      if(creepType === 'vision')
      {
        console.log('Vision problems 4')
      }
      if(room.name === 'E36S38' && creepType === 'pHarvester')
      console.log('Creep design', 2)
      return temp;
    }
    else
    {
      if(room.name === 'E36S38' && creepType === 'pHarvester')
      console.log('Creep design', 3)
      return body;
    }
  },

  bodyCost: function(body: BodyPartConstant[]){
    let cost = 0

    for(let part in body){
      cost += BODYPART_COST[body[part]]
    }

    return cost
  },

  partWeight: <WeightList>{
    'attack': 15,
    'carry': 8,
    'claim': 9,
    'heal': 20,
    'move': 5,
    'ranged_attack': 14,
    'tough': 1,
    'work': 10
  },

  typeStarts: <PartList>{
    'claimer': [TOUGH, TOUGH, CLAIM, MOVE, MOVE, MOVE, MOVE],
    'harvester': [WORK, CARRY, MOVE, MOVE],
    'skHarvester': [WORK, WORK, WORK, CARRY, MOVE, MOVE],
    'hold': [CLAIM, MOVE],
    'mover': [CARRY, MOVE],
    'bigMover': [CARRY, MOVE],
    'worker': [WORK, CARRY, MOVE, MOVE],
    'upgrader': [WORK,WORK, CARRY,CARRY, MOVE, MOVE],
    'defender': [ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,
                 ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,
                 ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,
                 ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,
                 ATTACK,ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
    'spinner': [CARRY,CARRY,CARRY,CARRY,MOVE,MOVE],
    'holdmover': [CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,WORK],
    'mineralHarvester': [MOVE,WORK,WORK,CARRY,CARRY,CARRY],
    'remoteWorker': [WORK, CARRY, MOVE, MOVE],
    'upgrader1': [WORK, CARRY, CARRY, CARRY, MOVE,MOVE],
    'toughDefender': [ATTACK,TOUGH,TOUGH,MOVE],
    'healer': [HEAL, MOVE],
    'attack': [ATTACK, MOVE],
    'attackController': [CLAIM, MOVE, MOVE],
    'dismantler': [WORK,MOVE],
    'dismantleCarry': [WORK, CARRY, MOVE],
    'labDistro': [CARRY,MOVE],
    'special': [MOVE],
    'rangeAttack': [RANGED_ATTACK,RANGED_ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
      MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
      MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,
      RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,HEAL,HEAL],
    'vision': [MOVE],
    'bounce': [TOUGH, MOVE],
    'buster': [ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE]
  },

  typeExtends: <PartList>{
    'claimer': [MOVE],
    'harvester': [MOVE, WORK],
    'skHarvester': [WORK, WORK, MOVE],
    'bigHarvester': [WORK, WORK, MOVE],
    'hold': [CLAIM, MOVE],
    'mover': [CARRY, CARRY, MOVE],
    'bigMover': [CARRY, CARRY, MOVE],
    //'worker': [WORK, CARRY, MOVE, MOVE]
    'worker': [CARRY, WORK, MOVE, MOVE],
    'upgrader': [WORK, WORK, MOVE],
    'defender': [],
    'spinner': [CARRY],
    'holdmover': [CARRY,CARRY,MOVE],
    'mineralHarvester': [WORK,WORK,MOVE],
    'remoteWorker': [WORK, CARRY, MOVE, MOVE],
    'upgrader1': [WORK, WORK, MOVE],
    'toughDefender': [TOUGH, TOUGH, MOVE],
    'healer': [HEAL, MOVE],
    'attack': [ATTACK, MOVE],
    'attackController': [CLAIM, MOVE, MOVE],
    'dismantler': [WORK, MOVE],
    'dismantleCarry': [WORK, MOVE],
    'labDistro': [CARRY,MOVE],
    'special': [MOVE],
    'rangeAttack': [],
    'vision': [],
    'bounce': [TOUGH, MOVE],
    'buster': [],
  },

  typeLengths: <{[name: string]: number}>{
    'claimer': 16,
    'harvester': 14,
    'skHarvester': 15,
    'hold': 4,
    'mover': 32,
    'bigMover': 42,
    'worker': 16,
    'upgrader': 32,
    'defender': 49,
    'spinner': 22,
    'holdmover': 50,
    'mineralHarvester': 48,
    'remoteWorker': 48,
    'upgrader1': 27,
    'toughDefender': 48,
    'healer': 42,
    'attack': 50,
    'attackController': 15,
    'dismantler': 50,
    'dismantleCarry': 49,
    'labDistro': 40,
    'special': 2,
    'rangeAttack': 50,
    'vision': 1,
    'bounce': 50,
    'buster': 10,
  }
}
