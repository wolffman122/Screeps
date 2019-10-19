interface PartList{
  [name: string]: BodyPartConstant[]
}

interface WeightList{
  [part: string]: number
}

export const CreepBuilder = {
  design: function(creepType: string, room: Room, memory: any) : BodyPartConstant[]
  {
    if(creepType === 'vision')
    {
      console.log('Vision problems 1')
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
    else if(creepType === 'custom')
    {
      return memory.body;
    }

    let body = <BodyPartConstant[]>[].concat(<never[]>CreepBuilder.typeStarts[creepType])
    let spendCap

    let creepCount = _.filter(Game.creeps, function(creep){
      return creep.room.name === room.name
    }).length
    let emergancy = (creepType === 'harvester' && creepCount < 2) || (creepType === 'mover' && creepCount < 4)

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

    while(add){
      var creepCost = CreepBuilder.bodyCost(body)

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
      return temp;
    }
    else
    {
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
    'claimer': [TOUGH, CLAIM, MOVE, MOVE, MOVE, MOVE],
    'harvester': [WORK, WORK, CARRY, MOVE],
    'skHarvester': [WORK, WORK, WORK, CARRY, MOVE, MOVE],
    'hold': [CLAIM, MOVE],
    'mover': [CARRY, MOVE],
    'bigMover': [CARRY, MOVE],
    'worker': [WORK, CARRY, MOVE, MOVE],
    'bigWorker': [WORK, WORK, CARRY, MOVE, MOVE],
    'upgrader': [WORK,WORK, CARRY,CARRY, MOVE],
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
    'labDistro': [CARRY,MOVE],
    'special': [MOVE],
    'rangeAttack': [RANGED_ATTACK,RANGED_ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
      MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
      MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,
      RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,HEAL,HEAL],
    'vision': [MOVE],
    'bounce': [TOUGH, MOVE],
  },

  typeExtends: <PartList>{
    'claimer': [TOUGH, CLAIM, MOVE, MOVE, MOVE, MOVE],
    'harvester': [MOVE, WORK],
    'skHarvester': [WORK, WORK, MOVE],
    'bigHarvester': [WORK, WORK, MOVE],
    'hold': [CLAIM, MOVE],
    'mover': [CARRY, CARRY, MOVE],
    'bigMover': [CARRY, CARRY, MOVE],
    //'worker': [WORK, CARRY, MOVE, MOVE]
    'worker': [CARRY, WORK, MOVE, MOVE],
    'bigWorker': [WORK, WORK, CARRY, MOVE, MOVE],
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
    'dismantleCarry': [WORK,WORK,WORK,CARRY,MOVE,MOVE],
    'labDistro': [CARRY,MOVE],
    'special': [MOVE],
    'rangeAttack': [],
    'vision': [],
    'bounce': [TOUGH, MOVE],
  },

  typeLengths: <{[name: string]: number}>{
    'claimer': 12,
    'harvester': 14,
    'skHarvester': 15,
    'hold': 4,
    'mover': 32,
    'bigMover': 42,
    'worker': 16,
    'bigWorker': 40,
    'upgrader': 32,
    'defender': 49,
    'spinner': 14,
    'holdmover': 50,
    'mineralHarvester': 48,
    'remoteWorker': 48,
    'upgrader1': 27,
    'toughDefender': 48,
    'healer': 42,
    'attack': 50,
    'attackController': 15,
    'dismantler': 50,
    'labDistro': 40,
    'special': 2,
    'rangeAttack': 50,
    'vision': 1,
    'bounce': 50,
  }
}
