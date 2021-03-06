import {Process} from '../os/process'
//import {MineralManagementProcess} from './management/mineral'
//import {RoomLayoutProcess} from './management/roomLayout'
import {SpawnRemoteBuilderProcess} from './system/spawnRemoteBuilder'
import {TowerDefenseProcess} from './buildingProcesses/towerDefense'
import {TowerRepairProcess} from './buildingProcesses/towerRepair'
import { MineralManagementProcess } from 'processTypes/management/mineral';
import { skRoomManagementProcess } from './management/skroom';
import { TowerHealProcess } from './buildingProcesses/towerHeal';
import { PowerHarvestingManagement } from './management/powerHarvesting';
import { WorldMap } from 'lib/WorldMap';
import { AlleyObservationManagementProcess } from './management/alleyObservation';

interface RoomDataMeta{
  roomName: string
}

export class RoomDataProcess extends Process{
  type = "roomData"

  metaData: RoomDataMeta
  fields = [
    'constructionSites', 'containers', 'extensions', 'generalContainers', 'labs', 'spawns', 'sources', 'sourceContainers', 'towers',
    'enemySpawns', 'enemyExtensions', 'links', 'sourceLinks', 'lairs'
  ]

  mapFields = [
    'sourceContainerMaps', 'sourceLinkMaps'
  ]

  mapObjectFields = [ 'skSourceContainerMaps' ]

  singleFields = [
    'extractor', 'mineral', 'storageLink', 'controllerLink', 'controllerContainer', 'mineralContainer',
    'nuker', 'observer', 'powerBank', 'factory'
  ]

  run()
  {

    let room = Game.rooms[this.metaData.roomName]
    if(room === undefined)
    {
      if(Memory.rooms[this.metaData.roomName])
        delete Memory.rooms[this.metaData.roomName];
      this.completed;
      return;
    }
    else
    {
      const storage = room.storage;
      const terminal = room.terminal
      if(storage?.my)
      {
        room.store = storage.store;
        // if(terminal?.my)
        // {
        //   for(let res in terminal.store)
        //   {
        //     const resource = res as ResourceConstant;
        //     if(storage.store.getUsedCapacity(resource) > 0)
        //       storage.store[resource] =
        //   }
        // }
      }

      room.memory.lastVision = Game.time;
    }

    this.importFromMemory(room)

    if(Game.time % 10 === 0 && room?.controller?.my)
    {
      let hostiles = room.find(FIND_HOSTILE_CREEPS);
      if(hostiles.length)
      {
        if(hostiles.length > 2)
          room.memory.seigeDetected = true;
        else
          room.memory.seigeDetected = false;

        room.memory.hostileCreepIds = [];
        for(let i = 0; i < hostiles.length; i++)
          room.memory.hostileCreepIds.push(hostiles[i].id);
      }
      else
        room.memory.hostileCreepIds = undefined;
    }

    if(room.memory.seigeDetected)
      console.log(this.name, 'Siege Status ', room.memory.seigeDetected, room.name);

    if(this.kernel.data.roomData[this.metaData.roomName].spawns.length === 0)
    {
      if(this.kernel.data.roomData[this.metaData.roomName].constructionSites.length > 0 && this.kernel.data.roomData[this.metaData.roomName].constructionSites[0].structureType === STRUCTURE_SPAWN)
      {
        console.log(this.name, 'spawn remote builder');
        this.kernel.addProcessIfNotExist(SpawnRemoteBuilderProcess, 'srm-' + this.metaData.roomName, 90, {
          site: this.kernel.data.roomData[this.metaData.roomName].constructionSites[0].id,
          roomName: this.metaData.roomName
        })
      }
    }

    if(this.metaData.roomName === 'E26S29')
      console.log(this.name, 6)
    if(room)
    {
      if(room.controller?.my && !room.memory.templeRoom && this.roomData().mineral && this.roomData().mineral!.mineralAmount > 0
        && this.roomData().extractor)
      {
        this.kernel.addProcessIfNotExist(MineralManagementProcess, 'minerals-' + this.metaData.roomName, 40, {
          roomName: room.name
        })
      }


      //////////// Code to find alley rooms ///////////////////////
      let observer = this.kernel.data.roomData[room.name].observer
      if(observer?.my)
      {
        let coord = WorldMap.getRoomCoordinates(this.metaData.roomName);
        let zoneX = Math.floor(coord.x / 10) * 10;
        let zoneY = Math.floor(coord.y / 10) * 10;

        const cpTop = ((coord.y - (zoneY + 1)) * ((zoneX + 9) - (zoneX + 1)) - (coord.x - (zoneX + 1)) * ((zoneY + 1) - (zoneY + 1)));
        const cpLeft = ((coord.y - (zoneY + 1)) * ((zoneX + 1) - (zoneX + 1)) - (coord.x - (zoneX + 1)) * ((zoneY + 9) - (zoneY + 1)));
        const cpBot = ((coord.y - (zoneY + 9)) * ((zoneX + 9) - (zoneX + 1)) - (coord.x - (zoneX + 1)) * ((zoneY + 9) - (zoneY + 9)));
        const cpRight = ((coord.y - (zoneY + 1)) * ((zoneX + 9) - (zoneX + 9)) - (coord.x - (zoneX + 9)) * ((zoneY + 9) - (zoneY + 1)));
        if(!cpTop || !cpLeft || !cpBot || !cpRight)
        {
          if(this.metaData.roomName === 'E35S51' || this.metaData.roomName === 'E35S41'
            || this.metaData.roomName === 'E46S51' || this.metaData.roomName === 'E51S49'
            || this.metaData.roomName === 'E48S49' || this.metaData.roomName === 'E38S39'
            || this.metaData.roomName === 'E41S49' || this.metaData.roomName === 'E41S32'
            || this.metaData.roomName === 'E26S29' || this.metaData.roomName === 'E16S51')
          {
            this.kernel.addProcessIfNotExist(AlleyObservationManagementProcess, 'aomp' + this.metaData.roomName, 25, {
              roomName: this.metaData.roomName
            });
          }
        }
      }
    }

    if(this.metaData.roomName === 'E37S45')
      console.log(this.name, 7)
    if(room && room.controller && room.controller!.my)
    {
      if(Game.time % 25 === 0)
      {
        let flags = <Flag[]>room.find(FIND_FLAGS);
        flags = _.filter(flags, (f)=>{
          return (f.color === COLOR_YELLOW && f.secondaryColor === COLOR_YELLOW);
        });

        if(flags.length)
        {
          _.forEach(flags, (f) =>{
            let skRoomName = f.name.split('-')[0];
            this.kernel.addProcessIfNotExist(skRoomManagementProcess, 'skrmp-'+skRoomName, 30, {
              roomName: room.name,
              skRoomName: skRoomName,
              flagName: f.name
            })
          })
        }
      }
    }

    if(this.metaData.roomName === 'E37S45')
      console.log(this.name, 8, room.memory.templeRoom)
    if(room && room.controller && room.controller.my && !room.memory.templeRoom)
    {
      this.enemyDetection(room);
      this.healDetection(room);
      this.repairDetection(room)

      // if(this.roomData().observer && this.roomData().powerSpawn)
      // {
      //   this.kernel.addProcessIfNotExist(PowerHarvestingManagement, 'powm-' + room.name, 25, {
      //     roomName: room.name
      //   });
      // }

      // if(room.memory.rampartCostMatrix === undefined)
      // {
      //   // let rampartCost = new PathFinder.CostMatrix;

      //   // for(let x = 0; x < 50; x++)
      //   //   for(let y = 0; y < 50; y++)
      //   //     rampartCost.set(x, y, 0xff);

      //   // const centerFlag = Game.flags['Center-'+room.name];
      //   // room.find(FIND_STRUCTURES, {filter: t => t.pos.inRangeTo(centerFlag, 6) }).forEach(function(s) {
      //   //   if(s.structureType === STRUCTURE_RAMPART)
      //   //   {
      //   //     let look = s.pos.look()
      //   //     look = _.filter(look, (l) => l.type === LOOK_STRUCTURES);

      //   //     if(look.length === 1)
      //   //       rampartCost.set(s.pos.x, s.pos.y, 2);
      //   //     else
      //   //     {
      //   //       _.forEach(look, (l) => {
      //   //         let st = l.structure;
      //   //         if(st.structureType === STRUCTURE_ROAD)
      //   //           rampartCost.set(st.pos.x, st.pos.y, 1);

      //   //       })
      //   //     }
      //   //   }
      //   //   else if(s.structureType === STRUCTURE_ROAD)
      //   //   {
      //   //     rampartCost.set(s.pos.x, s.pos.y, 1);
      //   //   }
      //   //   else
      //   //   {
      //   //     rampartCost.set(s.pos.x, s.pos.y, 0xff);
      //   //   }
      //   // });

      //   // room.memory.rampartCostMatrix = rampartCost.serialize();
      // }
      // else
      // {
      //   delete room.memory.rampartCostMatrix;
      // }
    }

    if(this.metaData.roomName === 'E37S45')
      console.log(this.name, 9)
    this.completed = true
  }

  /** Returns the room data */
  build(room: Room){

    let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(room.name) as any;
    let fMod = parsed[1] % 10;
    let sMod = parsed[2] % 10;
    let isSK =  !(fMod === 5 && sMod === 5) &&
        ((fMod >= 4) && (fMod <= 6)) &&
        ((sMod >= 4) && (sMod <= 6));

    let structures = <Structure[]>room.find(FIND_STRUCTURES)
    let myStructures = <Structure[]>room.find(FIND_MY_STRUCTURES)

    let lairs: StructureKeeperLair[];
    if(isSK)
    {
      lairs = <StructureKeeperLair[]>_.filter(structures, function(s){
        return (s.structureType === STRUCTURE_KEEPER_LAIR);
      });
    }

    let containers = <StructureContainer[]>_.filter(structures, function(structure){
      return (structure.structureType === STRUCTURE_CONTAINER)
    })

    let sourceContainerMaps = <{[id: string]: StructureContainer}>{}
    let skSourceContainerMaps = <{[id: string]: {container: StructureContainer, lair: StructureKeeperLair}}>{}

    let sourceContainers = _.filter(containers, function(container){
      let sources: Array<Source> = container.pos.findInRange(FIND_SOURCES, 1)

      if(sources.length)
      {
        if(isSK)
        {
          if(sources[0])
          {
            let lair = container.pos.findClosestByRange(lairs);
            skSourceContainerMaps[sources[0].id] = { container: container, lair: lair };
          }
        }
        else
        {
          if(sources[0]){
            sourceContainerMaps[sources[0].id] = container
          }
        }
      }

      return (sources.length != 0)
    })

    let controllerContainers = _.filter(containers, function(container){
      if(container.room.controller)
      {
        if(container.room.name === 'E58S52')
        {
          return (container.pos.inRangeTo(container.room.controller, 3));
        }
        else
        {
          let sources = container.pos.findInRange(FIND_SOURCES, 1);
          if(sources.length)
          {
            return false;
          }

          return (container.pos.inRangeTo(container.room.controller, 4));
        }
      }
      else
      {
        return false;
      }
    });

    let mineral = <Mineral>room.find(FIND_MINERALS)[0];

    let mineralContainers = _.filter(containers, function(container) {
      if(container.room.name === 'E43S55')
      {
        return container.pos.inRangeTo(mineral, 8);
      }
      else
      {
        return (container.pos.inRangeTo(mineral, 2));
      }
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
      var sources: Array<Source> = l.pos.findInRange(FIND_SOURCES, 2);

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

      if(!storageLink && room.controller && room.controller.my)
      {
        storageLink = <StructureLink>room.controller.pos.findInRange(links, 2)[0];
      }
    }

    let controllerLink: StructureLink|undefined
    let generalLinks: StructureLink[] = []
    if(room.controller)
    {
      let distance = 2;
      while(controllerLink === undefined)
      {
      controllerLink = <StructureLink>room.controller!.pos.findInRange(links, distance)[0];
      distance++;
      if(distance === 5)
        break;
      };


      generalLinks = _.filter(links, function(l){
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
    }

    let labs = <StructureLab[]>_.filter(myStructures, function(structure){
      return (structure.structureType === STRUCTURE_LAB && structure.isActive());
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
      observer: <StructureObserver>_.filter(myStructures, function(structure){
        return (structure.structureType === STRUCTURE_OBSERVER);
      })[0],
      powerBank: <StructurePowerBank>_.filter(myStructures, function(structure){
        return (structure.structureType === STRUCTURE_POWER_BANK);
      })[0],
      factory: <StructureFactory>_.filter(myStructures, function(structure) {
        return (structure.structureType === STRUCTURE_FACTORY);
      })[0],
      powerSpawn: <StructurePowerSpawn>_.filter(structures, function(structure){
        return (structure.structureType === STRUCTURE_POWER_SPAWN);
      })[0],
      generalContainers: generalContainers,
      mineral: <Mineral>room.find(FIND_MINERALS)[0],
      labs: labs,
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
      skSourceContainerMaps: skSourceContainerMaps,
      towers: <StructureTower[]>_.filter(myStructures, function(structure){
        return (structure.structureType === STRUCTURE_TOWER)
      }),
      links: generalLinks,
      sourceLinks: sourceLinks,
      sourceLinkMaps: sourceLinkMaps,
      storageLink: storageLink,
      controllerLink: controllerLink,
      controllerContainer: controllerContainer,
      mineralContainer: mineralContainer,
      lairs: lairs
    }

    this.kernel.data.roomData[this.metaData.roomName] = roomData

    room.memory.cache = {}

    let proc = this
    _.forEach(this.fields, function(field){
      if(Game.rooms[proc.metaData.roomName])
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

    _.forEach(this.mapObjectFields, function(field){
      let result = <{[id:string]: {}}>{}
      let keys = Object.keys(roomData[field])

      _.forEach(keys, function(key){
        result[key] = roomData[field][key]
      });
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
      observer: undefined,
      powerSpawn: undefined,
      powerBank: undefined,
      factory: undefined,
      generalContainers: [],
      mineral: undefined,
      labs: [],
      spawns: [],
      sources: [],
      sourceContainers: [],
      sourceContainerMaps: <{[id: string]: StructureContainer}>{},
      skSourceContainerMaps: <{[id: string]: { container: StructureContainer, lair: StructureKeeperLair}}>{},
      towers: [],
      enemySpawns: [],
      enemyExtensions: [],
      links: [],
      sourceLinks: [],
      sourceLinkMaps: <{[id: string]: StructureLink}>{},
      storageLink: undefined,
      controllerLink: undefined,
      controllerContainer: undefined,
      mineralContainer: undefined,
      lairs: []
    }
    let run = true
    let i = 0

    // if(room)
    // {
    //   if(room.memory.numSites != Object.keys(Game.constructionSites).length){
    //     delete room.memory.cache.constructionSites
    //     room.memory.numSites = Object.keys(Game.constructionSites).length
    //   }
    // }

    ////////////////////////////////////////////////////////////
    ///
    ///          General Fields
    ///
    ////////////////////////////////////////////////////////////
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

    ////////////////////////////////////////////////////////////
    ///
    ///          Map Fields
    ///
    ////////////////////////////////////////////////////////////
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
          });
        }else{
          run = false
          this.build(room)
          return
        }
      }

      i += 1
      if(i === this.mapFields.length){ run = false }
    }

    ////////////////////////////////////////////////////////////
    ///
    ///          Map Object Fields
    ///
    ////////////////////////////////////////////////////////////
    run = true
    i = 0
    while(run){
      let field = this.mapObjectFields[i]

      if(room)
      {
        if(room.memory.cache[field]){
          let keys = Object.keys(room.memory.cache[field])
          _.forEach(keys, function(key){
            let mapObject = room.memory.cache[field]
            let container = Game.getObjectById(mapObject.container)
            let lair = Game.getObjectById(mapObject.lair)
            if(container && lair)
            {
              roomData[field][key] = {container, lair}
            }else{
              run = false
              proc.build(room)
              return
            }
          });
        }else{
          run = false
          this.build(room)
          return
        }
      }

      i += 1
      if(i == this.mapObjectFields.length) { run = false }
    }


    ////////////////////////////////////////////////////////////
    ///
    ///          Single Fields
    ///
    ////////////////////////////////////////////////////////////
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
    let controller = Game.rooms[this.metaData.roomName].controller;
    if(controller?.my && room.memory.hostileCreepIds?.length)
    {
      this.kernel.addProcessIfNotExist(TowerDefenseProcess, 'td-' + this.metaData.roomName, 95, {
        roomName: this.metaData.roomName
      })
    }
  }

  healDetection(room: Room)
  {
    let controller = room.controller;
    if(controller && controller.level >= 3)
    {
      this.kernel.addProcessIfNotExist(TowerHealProcess, 'th-' + this.metaData.roomName, 90, {
        roomName: this.metaData.roomName
      })
    }
  }

  /** Find repairs need in the room */
  repairDetection(room: Room)
  {
    let structures = <Structure[]>room.find(FIND_STRUCTURES);

    let repairTargets = <Structure[]> _.filter(structures, (s) => {
      return (s.structureType != STRUCTURE_WALL && s.hits < s.hitsMax);
    });

    if(room.memory.hostileCreepIds === undefined && repairTargets.length > 0 && !this.kernel.hasProcess('tr-' + this.metaData.roomName))
    {
      this.kernel.addProcess(TowerRepairProcess, 'tr-' + this.metaData.roomName, 80, {
        roomName: this.metaData.roomName
      });
    }
  }
}
