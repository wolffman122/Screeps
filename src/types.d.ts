// type shim for nodejs' `require()` syntax
// for stricter node.js typings, remove this and install `@types/node`
declare const require: (module: string) => any;

// add your custom typings here
interface Creep extends RoomObject {
    fixMyRoad(): boolean;
    transferEverything(target: Creep|StructureContainer|StructureStorage|StructureTerminal): number;
    withdrawEverything(target: Creep|StructureContainer|StructureStorage|StructureTerminal): number;
    yieldRoad(target: {pos: RoomPosition}, allowSwamps: boolean): number;
    idleOffRoad(anchor: {pos: RoomPosition}, maintainDistance: boolean): number;
    getFlags(identifier: string, max: Number): Flag[]
  }

interface RoomPosition {
  lookForStructures(structureType: string): Structure;
  getPositionAtDirection(direction: number, range?: number): RoomPosition;
  isPassible(ignoreCreeps?: boolean): boolean;
  isNearExit(range: number): boolean;
  openAdjacentSpots(ignoreCreeps?: boolean): RoomPosition[];
}

interface Flag {

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
      displayOldProcesses: boolean
      conLog: (message: string) => void;
    }
  }

  declare var global: NodeJS.Global;

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
    message: any,
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



  interface CreepMemory
  {
      _trav: {};
      _travel: {};
      storageDelivery: boolean;
      atPlace: boolean;
      currentRoom: string;
      roomPath: -2 | { exit: ExitConstant, room: string}[],
      flagIndex: number;
      dieing: boolean;
      boost: boolean;
      distance?: number;
      reachedDest?: boolean;
  }

  interface FlagMemory
  {
      enemies: boolean;
      timeEnemies?: number;
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
    harvesterPrespawn?: boolean
    distroCreeps: {
      [container: string]: string
    }
    upgradeCreeps: string[]
    spinCreeps: string[]
    upgradeDistroCreeps: string[]
    upgradePrespawn?: boolean
    upgradeDistroPrespawn?: boolean
  }

  interface SquadManagementProcessMetaData
  {
    attackers: string[],
    healers: string[],
    flagName: string,
  }

  interface SquadAttackerLifetimeProcessMetaData
  {
    creep: string,
    follower: string,
    identifier: string,
    number: number
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

  interface HoldRoomOptManagementProcessMetaData
  {
    roomName: string
    holdCreeps: string[]
    harvestCreeps: {
      [source: string]: string[]
    }
    distroCreeps: {
      [container: string]: string[]
    }
    distroDistance: {
      [container: string]: number
    }

    builderCreeps: string[]
    workerCreeps: string[]
    flagName: string
    increasing: boolean
  }

  interface HoldHarvesterOptLifetimeProcessMetaData
  {
    flagName: string
    source: string
    harvesting: boolean
  }

  interface MarketManagementProcessMetaData
  {
    data: {
      [roomName: string]: {
        mining: boolean,
        amount: number,
        waitingToSell: boolean,
        orderId?: string,
        tickLastPriceChange: number,
        sellPrice: number
      }
    }
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
      flagName: string
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
    flagName: string,
    site: string
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

  interface BounceAttackManagementMetaData
  {
    bounceAttackCreeps: string[],
    flagName: string
  }

  interface BounceAttackerLifetimeProcessMetaData
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
    idlePosition: RoomPosition;
    command?: Command;
    labCount: number;
    reagentLabIds?: string[];
    productLabIds?: string[];
    lastCommandTick: number;
    checkProcessTick: number;
    labProcess?: LabProcess;
  }

  interface LabMemory
  {
    idlePosition: RoomPosition;
    command?: Command;
    labCount: number;
    reagentLabIds?: string[];
    productLabIds?: string[];
    lastCommandTick: number;
    checkProcessTick: number;
    labProcess?: LabProcess;
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



  interface MineralManagementProcessMetaData
  {
    roomName: string
    mineralHarvesters: string[]
    mineralHaulers: string[]
    mining: boolean
  }

  interface RemoteDefenseManagementProcessMetaData
  {
    roomName: string,
    defendingCreep: string[],
    flagName: string,
  }

  interface HoldDistroLifetimeProcessMetaData
  {
    flagName: string,
    sourceContainer: string
    spawnRoom: string
  }

  interface GeneralAttackManagementProcessMetaData
  {
    flagName: string,
    attackers: string[],
    healers: string[]
  }

  interface RangeAttackManagementProcessMetaData
  {
    flagName: string,
    attackers: string[],
    healers: string[]
  }

  interface AttackerLifetimeProcessMetaData
  {
    creep: string[],
    flagName: string,
  }

  interface RangeAttackerLifetimeProcessMetaData
  {
    creep: string,
    flagName: string,
  }

  interface RemoteBuilderLifetimeProcessMetaData
  {
    flagName: string,
    site: string,
  }

  interface HelpManagementProcessMetaData
  {
    flagName: string,
    creeps: string[],
  }

  interface HelperLifetimeProcessMetaData
  {
    flagName: string,
    site: string,
  }

  interface UpgradeLifetimeProcessMetaData
  {
    creep: string,
    boosts?: string[],
    boostRequests: BoostRequests,
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

interface TravelOptions {
  avoidSK: boolean,          //Avoid SK rooms
  avoidHostile: boolean,     //Avoid rooms that have been blacklisted
  preferOwn: boolean,        //Prefer to path through claimed/reserved rooms
  preferHW: boolean,         //Prefer to path through Highways
  preferRooms: string[],        //Prefer to path through a specific list of rooms
  avoidRooms: string[],         //Avoid pathing through a specific list of rooms
}


interface ExecOrder {
  name: string,
  cpu: number,
  type: string,
  faulted: boolean
}
