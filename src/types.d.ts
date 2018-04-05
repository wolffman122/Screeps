// type shim for nodejs' `require()` syntax
// for stricter node.js typings, remove this and install `@types/node`
declare const require: (module: string) => any;

// add your custom typings here
interface Creep {
    fixMyRoad(): boolean;
  }

  declare namespace NodeJS{
    interface Global {
      SCRIPT_VERSION: number
      lastTick: number
      LastMemory: Memory
      Memory: Memory
      roomData: {
        [key: string]: RoomData
      }
      keepAmount: Number
      spreadAmount: Number
      sellAbove: Number
    }
  }

  interface RawMemory{
    _parsed: Memory
  }

  interface RoomData{
    [name: string]: any
    constructionSites: ConstructionSite[]
    containers: StructureContainer[]
    extensions: StructureExtension[]
    extractor: StructureExtractor | undefined
    nuker: StructureNuker | undefined
    generalContainers: StructureContainer[]
    mineral: Mineral | undefined
    labs: StructureLab[]
    roads: StructureRoad[]
    spawns: StructureSpawn[]
    sources: Source[]
    sourceContainers: StructureContainer[]
    sourceContainerMaps: {[id: string]: StructureContainer}
    towers: StructureTower[]
    enemySpawns: StructureSpawn[]
    enemyExtensions: StructureExtension[]
    ramparts: StructureRampart[]
    walls: StructureWall[]
    links: StructureLink[]
    sourceLinks: StructureLink[]
    sourceLinkMaps: {[id: string]: StructureLink}
    storageLink: StructureLink | undefined
    controllerLink: StructureLink | undefined
    controllerContainer: StructureContainer | undefined
    mineralContainer: StructureContainer | undefined
  }

  interface IPCMessage{
    from: string
    to: string
    message: object
  }

  interface DeliveryTarget extends Structure{
    energy: number
    energyCapacity: number
    store: {
      [resource: string]: number
    }
    storeCapacity: number
  }

  interface RepairTarget extends Structure
  {
    ticksToDecay: number
    hits: number
    hitsMax: number
  }

  interface SerializedProcess{
    name: string
    priority: number
    metaData: object
    suspend: string | number | boolean
    parent: string | undefined
  }

  declare var global: NodeJS.Global;

  interface CreepMemory
  {
      _trav: {};
      _travel: {};
      storageDelivery: boolean;
  }

  interface FlagMemory
  {
      enemies: boolean;
      source: string;
  }

  interface RoomMemory
  {
    avoid: number;
    cache: {[key: string]: any};
    numSites: number;
  }

  interface SpawnMemory {}



  /// Meta Data's

  interface DeliverProcessMetaData
  {
    creep: string;
    target: string;
    resource: ResourceConstant;
  }

  interface MineralDistroLifetimeProcessMetaData
  {
      creep: string;
      container: string;
      mineralType: ResourceConstant;
  }

  interface EnergyManagementMetaData
  {
    roomName: string
    harvestCreeps: {
      [source: string]: string[]
    }
    distroCreeps: {
      [container: string]: string
    }
    upgradeCreeps: string[]
    spinCreeps: string[]
    upgradeDistroCreeps: string[]
  }

  interface StructureManagementProcessMetaData
  {
    roomName: string
    spareCreeps: string[]
    buildCreeps: string[]
    repairCreeps: string[]
    dismantleCreeps: string[]
  }
