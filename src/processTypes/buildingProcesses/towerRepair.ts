import {Process} from '../../os/process'

export class TowerRepairProcess extends Process
{
  type = 'tr';
  metaData: TowerRepairProcessMetaData;

  run()
  {
    if(!Game.rooms[this.metaData.roomName])
    {
      this.completed = true;
      return;
    }

    if(Game.rooms[this.metaData.roomName]?.find(FIND_HOSTILE_CREEPS)?.length > 0)
    {
      return;
    }

    // const ramparts = this.roomData().ramparts.filter(rampart => {
    //   return (rampart.hits < 50000);
    // });

    const containers = this.roomData().generalContainers.filter(container => {
      return (container.hits < container.hitsMax);
    });

    const sourceContainers = this.roomData().sourceContainers.filter(sourceContainer => {
      return (sourceContainer.hits < sourceContainer.hitsMax);
    });

    let roads: StructureRoad[] = [];
    if(Game.time % 111 === 0)
    {
      this.metaData.roads = [];
      const room = Game.rooms[this.metaData.roomName];
      const roads = room.find(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_ROAD }).sort((a,b) => (a.hits < b.hits) ? -1 : 1);
      if(roads?.length)
      {
        const lowestRoads = roads.splice(0, 10);
        for(const road of lowestRoads)
        {
          this.metaData.roads.push(road.id);
        }
      }
    }
    else
    {
      if(this.metaData.roads)
      {
        let allRepaired = true;
        for(let id of this.metaData.roads)
        {
          const road = <StructureRoad>Game.getObjectById(id);
          if(road.hits < road.hitsMax)
          {
            roads.push(road);
            allRepaired = false;
          }
        }

        if(allRepaired)
          delete this.metaData.roads;
      }
    }

    const spawns = this.roomData().spawns.filter(s => s.hits < s.hitsMax);

    let sortedRamparts = _.sortBy(<Structure[]>[].concat(
      <never[]>spawns,
      //<never[]>ramparts,
      <never[]>containers,
      <never[]>sourceContainers,
      <never[]>[this.roomData().controllerContainer],
      <never[]>[this.roomData().mineralContainer],
      <never[]>[this.roomData().extractor],
      <never[]>roads
    ), 'hits')
    let usedTowers = <{[towerId: string]: boolean}>{}

    _.forEach(this.roomData().towers, function(tower){
      usedTowers[tower.id] = (tower.energy < 500)
    });

    let proc = this;
    _.forEach(sortedRamparts, function(rampart){
      let towers = proc.roomData().towers?.filter(tower => {
        return !usedTowers[tower.id];
      });

      if(towers?.length > 0 && rampart)
      {
        let tower = rampart.pos.findClosestByRange(towers);

        tower.repair(rampart);

        usedTowers[tower.id] = true;
      }
    });
  }
}
