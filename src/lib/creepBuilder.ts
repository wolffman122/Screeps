interface PartList{
  [name: string]: BodyPartConstant[]
}

interface WeightList{
  [part: string]: number
}

export const CreepBuilder = {
  design: function(creepType: string, room: Room, memory: any) : BodyPartConstant[]
  {
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

    while(add){
      var creepCost = CreepBuilder.bodyCost(body)

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

    return _.sortBy(body, function(part){
      return CreepBuilder.partWeight[part]
    }) as BodyPartConstant[];
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
    'claimer': [TOUGH, MOVE, MOVE, CLAIM],
    'harvester': [WORK, WORK, CARRY, MOVE],
    'hold': [CLAIM, MOVE],
    'mover': [CARRY, MOVE],
    'bigMover': [CARRY, MOVE],
    'worker': [WORK, CARRY, MOVE, MOVE],
    'bigWorker': [WORK, WORK, CARRY, MOVE, MOVE],
    'upgrader': [WORK,WORK, CARRY,CARRY, MOVE],
    'defender': [MOVE,MOVE,MOVE,ATTACK,ATTACK],
    'spinner': [CARRY,CARRY,CARRY,CARRY,MOVE,MOVE],
    'holdmover': [CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,WORK],
    'bigHarvester': [WORK, WORK, CARRY, MOVE, MOVE],
    'mineralHarvester': [MOVE,WORK,WORK,CARRY,CARRY,CARRY],
    'remoteWorker': [TOUGH, TOUGH, WORK, CARRY, MOVE, MOVE],
    'upgrader1': [WORK, CARRY, MOVE,MOVE],
    'toughDefender': [TOUGH,TOUGH,MOVE],
    'healer': [HEAL, HEAL, MOVE],
    'attack': [TOUGH, TOUGH, ATTACK, ATTACK, MOVE, MOVE],
    'attackController': [CLAIM, MOVE],
    'dismantler': [WORK,WORK, WORK, MOVE,MOVE],
    'labDistro': [CARRY,MOVE],
  },

  typeExtends: <PartList>{
    'claimer': [CLAIM],
    'harvester': [MOVE, WORK],
    'hold': [CLAIM, MOVE],
    'mover': [CARRY, CARRY, MOVE],
    'bigMover': [CARRY, CARRY, MOVE],
    //'worker': [WORK, CARRY, MOVE, MOVE]
    'worker': [CARRY, WORK, MOVE, MOVE],
    'bigWorker': [WORK, WORK, CARRY, MOVE, MOVE],
    'upgrader': [WORK, WORK, MOVE],
    'defender': [TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,ATTACK,ATTACK],
    'spinner': [CARRY],
    'holdmover': [CARRY,CARRY,MOVE],
    'bigHarvester': [WORK, WORK],
    'mineralHarvester': [WORK,WORK,MOVE],
    'remoteWorker': [CARRY, WORK, MOVE, MOVE],
    'upgrader1': [WORK, WORK, MOVE],
    'toughDefender': [TOUGH, TOUGH, MOVE],
    'healer': [HEAL, HEAL, MOVE],
    'attack': [TOUGH, TOUGH, ATTACK, ATTACK, MOVE, MOVE],
    'attackController': [CLAIM, MOVE],
    'dismantler': [WORK, WORK, MOVE],
    'labDistro': [CARRY,MOVE]
  },

  typeLengths: <{[name: string]: number}>{
    'claimer': 4,
    'harvester': 14,
    'hold': 4,
    'mover': 32,
    'bigMover': 42,
    'worker': 16,
    'bigWorker': 40,
    'upgrader': 32,
    'defender': 26,
    'spinner': 14,
    'holdmover': 50,
    'bigHarvester': 15,
    'mineralHarvester': 48,
    'remoteWorker': 42,
    'upgrader1': 25,
    'toughDefender': 48,
    'healer': 39,
    'attack': 30,
    'attackController': 10,
    'dismantler': 50,
    'labDistro': 40
  }
}
