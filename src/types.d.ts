// type shim for nodejs' `require()` syntax
// for stricter node.js typings, remove this and install `@types/node`
declare const require: (module: string) => any;

// add your custom typings here
interface Creep extends RoomObject {
    fixMyRoad(): boolean;
    transferEverything(target: Creep|StructureContainer|StructureStorage|StructureTerminal): number;
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
    nuker?: StructureNuker
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
    message: object,
    read: Boolean
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
    initialized: boolean
  }

  interface Shortage {
    mineralType: ResourceConstant;
    amount: number;
  }

  interface LabProcess {
    targetShortage: Shortage;
    currentShortage: Shortage;
    reagentLoads: {[mineralType: string]: number};
    loadProgress: number;
  }

  interface Command {
    origin: string;
    destination: string;
    resourceType: ResourceConstant;
    amount?: number;
    reduceLoad?: boolean;
  }

  interface BoostRequests
  {
    [resourceType: string]:
    {
      flagName: string;
      requesterIds: string[];
    };
  }

  declare var global: NodeJS.Global;

  interface CreepMemory
  {
      _trav: {};
      _travel: {};
      storageDelivery: boolean;
      atPlace: boolean;
  }

  interface FlagMemory
  {
      enemies: boolean;
      source: string;
      droppedResource: boolean;
      rollCall: number;
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

  interface HoldRoomManagementProcessMetaData
  {
    roomName: string
    holdCreeps: string[]
    harvestCreeps: {
      [source: string]: string[]
    }
    distroCreeps: {
      [container: string]: string
    }
    builderCreeps: string[]
    workerCreeps: string[]
    flagName: string
    increasing: boolean

  }

  interface BuildProcessMetaData
  {
    creep: string;
    site: string;
  }

  interface CollectProcessMetaData
  {
    creep: string
    target: string,
    resource: ResourceConstant,
    collectAmount: number
  }

  interface DismantleManagementProcessMetaData
  {
      roomName: string
      flag: string
      dismantleCreeps: string[]
  }

  interface DismantleMetaData
  {
    creep: string
    flagName: string
  }

  interface HarvestMetaData
  {
    source: string
    creep: string
  }

  interface MineralHarvestMetaData
  {
    extractor: string
    mineral: string
    creep: string
  }

  interface MoveMetaData
  {
    creep: string
    pos: {
      x: number
      y: number
      roomName: string
    }
    range: number
  }

  interface RepairProcessMetaData
  {
    creep: string
    target: string
  }

  interface UpgradeProcessMetaData
  {
    creep: string;
  }

  interface HoldBuilderLifetimeProcessMetaData
  {
    creep: string
    flagName: string
  }

  interface HoldWorkerLifetimeProcessMetaData
  {
    creep: string
    targetRoom: string
    flagName: string
  }

  interface DefenderLifetimeProcessMetaData
  {
    flagName: string
  }

  interface AttackControllerManagementMetaData
  {
    creeps: string[],
    flagName: string
  }

  interface BounceAttackMetaData
  {
    creep: string,
    flagName: string
  }

  interface DefenseManagementProcessMetaData
  {
    roomName: string
    defenderCreeps: string[]
  }

  interface HealAttackMetaData
  {
    creep: string,
    flagName: string
  }

  interface LabManagementProcessMetaData
  {
    roomName: string,
    labDistros: string[],
  }

  interface LabDistroLifetimeProcessMetaData
  {
    creep: string,
    roomName: string,
    reagentLabIds?: string[],
    productLabIds?: string[],
    labProcess?: LabProcess,
    command?: Command,
    lastCommandTick: number,
    checkProcessTick: number,

  }

  interface ClaimProcessMetaData{
    creep: string
    targetRoom: string
    flagName: string
  }

//// Minerals


interface LabProcess {
  targetShortage: Shortage;
  currentShortage: Shortage;
  reagentLoads: {[mineralType: string]: number};
  loadProgress: number;
}

interface Shortage {
  mineralType: ResourceConstant;
  amount: number;
}
