import {Process} from '../os/process'

//import {MineralManagementProcess} from './management/mineral'
//import {RoomLayoutProcess} from './management/roomLayout'
import {SpawnRemoteBuilderProcess} from './system/spawnRemoteBuilder'
import {TowerDefenseProcess} from './buildingProcesses/towerDefense'
import {TowerRepairProcess} from './buildingProcesses/towerRepair'
import { MineralManagementProcess } from 'processTypes/management/mineral';

interface RoomDataMeta{
  roomName: string
}

export class RoomDataProcess extends Process{
  type = "roomData"

  metaData: RoomDataMeta
  fields = [
    'constructionSites', 'containers', 'extensions', 'generalContainers', 'labs', 'roads', 'spawns', 'sources', 'sourceContainers', 'towers', 'ramparts', 'walls',
    'enemySpawns', 'enemyExtensions', 'links', 'sourceLinks'
  ]

  mapFields = [
    'sourceContainerMaps', 'sourceLinkMaps'
  ]

  singleFields = [
    'extractor', 'mineral', 'storageLink', 'controllerLink', 'controllerContainer', 'mineralContainer',
    'nuker'
  ]

  run(){
    let room = Game.rooms[this.metaData.roomName]

    this.importFromMemory(room)

    if(this.kernel.data.roomData[this.metaData.roomName].spawns.length === 0){
      if(this.kernel.data.roomData[this.metaData.roomName].constructionSites.length > 0 && this.kernel.data.roomData[this.metaData.roomName].constructionSites[0].structureType === STRUCTURE_SPAWN){
        this.kernel.addProcess(SpawnRemoteBuilderProcess, 'srm-' + this.metaData.roomName, 90, {
          site: this.kernel.data.roomData[this.metaData.roomName].constructionSites[0].id,
          roomName: this.metaData.roomName
        })
      }
    }

    if(room)
    {
      if((room.name ==='E45S57' || room.name == 'E43S52' || room.name == 'E44S51' || room.name == 'E43S53' || room.name == 'E46S51' ||
       room.name == 'E46S52' || room.name == 'E48S57' || room.name == 'E45S48' || room.name == 'E48S49' || room.name == 'E41S49')
        && room.controller && room.controller.my && this.roomData().mineral && this.roomData().mineral!.mineralAmount > 0 && this.roomData().extractor)
      {
        this.kernel.addProcessIfNotExist(MineralManagementProcess, 'minerals-' + this.metaData.roomName, 20, {
          roomName: room.name
        })
      }
    }

    if(room && room.controller!.my){
      /*this.kernel.addProcessIfNotExist(RoomLayoutProcess, 'room-layout-' + room.name, 20, {
        roomName: room.name
      })*/
    }

    if(room)
    {
      this.enemyDetection(room)
      this.repairDetection(room);
    }
    this.completed = true
  }

  /** Returns the room data */
  build(room: Room){
    let structures = <Structure[]>room.find(FIND_STRUCTURES)
    let myStructures = <Structure[]>room.find(FIND_MY_STRUCTURES)

    let containers = <StructureContainer[]>_.filter(structures, function(structure){
      return (structure.structureType === STRUCTURE_CONTAINER)
    })

    let sourceContainerMaps = <{[id: string]: StructureContainer}>{}

    let sourceContainers = _.filter(containers, function(container){
      var sources: Array<Source> = container.pos.findInRange(FIND_SOURCES, 1)

      if(sources[0]){
        sourceContainerMaps[sources[0].id] = container
      }

      return (sources.length != 0)
    })

    let controllerContainers = _.filter(containers, function(container){
      if(container.room.controller)
      {
        return (container.pos.inRangeTo(container.room.controller, 4));
      }
      else
      {
        return false;
      }
    });

    let mineral = <Mineral>room.find(FIND_MINERALS)[0];

    let mineralContainers = _.filter(containers, function(container) {
      return (container.pos.inRangeTo(mineral, 2));
    })

    let generalContainers = _.filter(containers, function(container){
      let matchContainers = <StructureContainer[]>[].concat(
        <never[]>sourceContainers,
        <never[]>controllerContainers,
        <never[]>mineralContainers)

      var matched = _.filter(matchContainers, function(mc){
        return (mc.id == container.id)
      })

      return (matched.length == 0)
    })

    let controllerContainer = undefined;

    if(controllerContainers.length > 0)
    {
      controllerContainer = controllerContainers[0];
    }

    let mineralContainer = undefined;

    if(mineralContainers.length > 0)
    {
      mineralContainer = mineralContainers[0];
    }

    let links = <StructureLink[]>_.filter(myStructures, (s) => {
      return (s.structureType === STRUCTURE_LINK);
    })

    let sourceLinkMaps = <{[id: string]: StructureLink}>{};

    let sourceLinks = _.filter(links, (l) => {
      var sources: Array<Source> = l.pos.findInRange(FIND_SOURCES, 3);

      if(sources[0])
      {
        sourceLinkMaps[sources[0].id] = l
      }

      return (sources.length != 0);
    });

    let storageLink: StructureLink | undefined = undefined;
    if(room.storage)
    {
      storageLink = <StructureLink>room.storage.pos.findInRange(links, 2)[0];
    }


    let controllerLink = <StructureLink>room.controller!.pos.findInRange(links, 2)[0];

    let generalLinks = _.filter(links, function(l){
      let matchedLinks = [].concat(
        <never[]>sourceLinks) as StructureLink[];

      if(storageLink)
      {
        matchedLinks = [].concat(
          <never[]>matchedLinks,
          <never[]>[storageLink]
        ) as StructureLink[];
      }

      if(controllerLink)
      {
        matchedLinks = [].concat(
          <never[]>matchedLinks,
          <never[]>[controllerLink]
        ) as StructureLink[];
      }

      let matched = _.filter(matchedLinks, function(ml){
        return (ml.id == l.id);
      });

      return (matched.length == 0);
    });


    let roads = <StructureRoad[]>_.filter(structures, function(structure){
      return (structure.structureType === STRUCTURE_ROAD)
    })

    let labs = <StructureLab[]>_.filter(myStructures, function(structure){
      return (structure.structureType === STRUCTURE_LAB)
    })





    let roomData: RoomData = {
      constructionSites: <ConstructionSite[]>room.find(FIND_CONSTRUCTION_SITES),
      containers: containers,
      extensions: <StructureExtension[]>_.filter(myStructures, function(structure){
        return (structure.structureType === STRUCTURE_EXTENSION)
      }),
      extractor: <StructureExtractor>_.filter(myStructures, function(structure){
        return (structure.structureType === STRUCTURE_EXTRACTOR)
      })[0],
      nuker: <StructureNuker>_.filter(myStructures, function(structure){
        return (structure.structureType === STRUCTURE_NUKER);
      })[0],
      generalContainers: generalContainers,
      mineral: <Mineral>room.find(FIND_MINERALS)[0],
      labs: labs,
      roads: roads,
      spawns: <StructureSpawn[]>_.filter(myStructures, function(structure){
        return (structure.structureType === STRUCTURE_SPAWN)
      }),
      enemySpawns: <StructureSpawn[]>_.filter(structures, function(structure: StructureSpawn){
        return (structure.structureType === STRUCTURE_SPAWN
                &&
                !structure.my
               );

      }),
      enemyExtensions: <StructureExtension[]>_.filter(structures, function(structure: StructureExtension){
        return (structure.structureType === STRUCTURE_EXTENSION
                &&
                !structure.my
               );
      }),
      sources: <Source[]>room.find(FIND_SOURCES),
      sourceContainers: sourceContainers,
      sourceContainerMaps: sourceContainerMaps,
      towers: <StructureTower[]>_.filter(myStructures, function(structure){
        return (structure.structureType === STRUCTURE_TOWER)
      }),
      ramparts: <StructureRampart[]>_.filter(myStructures, function(s){
        return (s.structureType === STRUCTURE_RAMPART);
      }),
      walls: <StructureWall[]>_.filter(structures, function(s){
        return (s.structureType === STRUCTURE_WALL);
      }),
      links: generalLinks,
      sourceLinks: sourceLinks,
      sourceLinkMaps: sourceLinkMaps,
      storageLink: storageLink,
      controllerLink: controllerLink,
      controllerContainer: controllerContainer,
      mineralContainer: mineralContainer
    }

    this.kernel.data.roomData[this.metaData.roomName] = roomData

    room.memory.cache = {}

    let proc = this
    _.forEach(this.fields, function(field){
      room.memory.cache[field] = proc.deflate(roomData[field])
    })

    _.forEach(this.mapFields, function(field){
      let result = <{[id:string]: string[]}>{}
      let keys = Object.keys(roomData[field])

      _.forEach(keys, function(key){
        result[key] = roomData[field][key].id
      })

      room.memory.cache[field] = result
    })

    _.forEach(this.singleFields, function(field){
      if(roomData[field])
      {
        if(roomData[field].id)
        {
          room.memory.cache[field] = roomData[field].id
        }
      }
    })
  }

  /** Import the room data from memory */
  importFromMemory(room: Room){
    if(room)
    {
      if(!room.memory.cache){
        this.build(room)
        return
      }
    }

    let roomData: RoomData = {
      constructionSites: [],
      containers: [],
      extensions: [],
      extractor: undefined,
      nuker: undefined,
      generalContainers: [],
      mineral: undefined,
      labs: [],
      roads: [],
      spawns: [],
      sources: [],
      sourceContainers: [],
      sourceContainerMaps: <{[id: string]: StructureContainer}>{},
      towers: [],
      enemySpawns: [],
      enemyExtensions: [],
      ramparts: [],
      walls: [],
      links: [],
      sourceLinks: [],
      sourceLinkMaps: <{[id: string]: StructureLink}>{},
      storageLink: undefined,
      controllerLink: undefined,
      controllerContainer: undefined,
      mineralContainer: undefined
    }
    let run = true
    let i = 0

    if(room)
    {
      if(room.memory.numSites != Object.keys(Game.constructionSites).length){
        delete room.memory.cache.constructionSites
        room.memory.numSites = Object.keys(Game.constructionSites).length
      }
    }

    while(run){
      let field = this.fields[i]

      if(room)
      {
        if(room.memory.cache[field]){
          let inflation = this.inflate(room.memory.cache[field])
          if(inflation.rebuild){
            run = false
            this.build(room)
            return
          }else{
            roomData[field] = inflation.result
          }
        }else{
          run = false
          this.build(room)
          return
        }
      }

      i += 1
      if(i === this.fields.length){ run = false }
    }

    run = true
    i = 0
    let proc = this
    while(run){
      let field = this.mapFields[i]

      if(room)
      {
        if(room.memory.cache[field]){
          let keys = Object.keys(room.memory.cache[field])
          _.forEach(keys, function(key){
            let structure = Game.getObjectById(room.memory.cache[field][key])

            if(structure){
              roomData[field][key] = structure
            }else{
              run = false
              proc.build(room)
              return
            }
          })
        }else{
          run = false
          this.build(room)
          return
        }
      }

      i += 1
      if(i === this.mapFields.length){ run = false }
    }

    run = true
    i = 0
    while(run){
      let field = this.singleFields[i]

      if(room)
      {
        if(room.memory.cache[field]){
          let object = Game.getObjectById(room.memory.cache[field])

          if(object){
            roomData[field] = object
          }else{
            run = false
            this.build(room)
            return
          }
        }
      }

      i += 1
      if(i === this.singleFields.length){ run = false }
    }


    this.kernel.data.roomData[this.metaData.roomName] = roomData
  }

  /** Inflate the IDs in the array. Returns an object, result is the resuting array and rebuild is wether the data is wrong */
  inflate(ids: string[]){
    let rebuild = false
    let result: Structure[] = []

    _.forEach(ids, function(id){
      let object = <Structure>Game.getObjectById(id)

      if(object){
        result.push(object)
      }else{
        rebuild = true
      }
    })

    return {
      result: result,
      rebuild: rebuild
    }
  }

  deflate(objects: Structure[]){
    let result: string[] = []

    _.forEach(objects, function(object){
      result.push(object.id)
    })

    return result
  }

  /** Find enemies in the room */
  enemyDetection(room: Room)
  {
    let enemies = <Creep[]>room.find(FIND_HOSTILE_CREEPS);
    let controller = Game.rooms[this.metaData.roomName].controller;
    if(controller)
    {
      if(enemies.length > 0 &&  controller.my && !this.kernel.hasProcess('td-' + this.metaData.roomName)){
        this.kernel.addProcess(TowerDefenseProcess, 'td-' + this.metaData.roomName, 95, {
          roomName: this.metaData.roomName
        })
      }
    }
  }

  /** Find repairs need in the room */
  repairDetection(room: Room)
  {
    let structures = <Structure[]>room.find(FIND_STRUCTURES);

    let repairTargets = <Structure[]> _.filter(structures, (s) => {
      return (s.structureType != STRUCTURE_WALL && s.hits < s.hitsMax);
    });

    if(repairTargets.length > 0 && !this.kernel.hasProcess('tr-' + this.metaData.roomName))
    {
      this.kernel.addProcess(TowerRepairProcess, 'tr-' + this.metaData.roomName, 80, {
        roomName: this.metaData.roomName
      });
    }
  }
}
