// type shim for nodejs' `require()` syntax
// for stricter node.js typings, remove this and install `@types/node`
declare const require: (module: string) => any;

// add your custom typings here
interface Creep extends RoomObject {
    fixMyRoad(): boolean;
    transferEverything(target: Creep|StructureContainer|StructureStorage|StructureTerminal): number;
    withdrawEverything(target: Creep|StructureContainer|StructureStorage|StructureTerminal|Tombstone|StructureLab): number;
    yieldRoad(target: {pos: RoomPosition}, allowSwamps: boolean): number;
    idleOffRoad(anchor: {pos: RoomPosition}, maintainDistance: boolean): number;
    getFlags(identifier: string, max: Number): Flag[]
    boostRequest(boosts: string[], allowUnboosted: boolean): any
    getBodyPart(type: BodyPartConstant): boolean;
    getBodyParts(): BodyPartConstant[];
  }

interface RoomPosition {
  lookForStructures(structureType: string): Structure;
  getPositionAtDirection(direction: number, range?: number): RoomPosition;
  isPassible(ignoreCreeps?: boolean): boolean;
  isNearExit(range: number): boolean;
  openAdjacentSpots(ignoreCreeps?: boolean): RoomPosition[];
  getOpenPositions(range:number, opts:{}): RoomPosition[];
}

interface Game {
  cache: {
    structures: { [roomName: string]: {[structureType: string]: Structure[]} },
    labProcesses: { [resourceType: string]: number },
    activeLabCount: number;
  }
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
      gcl: number
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
    observer?: StructureObserver
    powerBank?: StructurePowerBank
    powerSpawn?: StructurePowerSpawn
    generalContainers: StructureContainer[]
    mineral: Mineral | undefined
    labs: StructureLab[]
    roads: StructureRoad[]
    spawns: StructureSpawn[]
    sources: Source[]
    sourceContainers: StructureContainer[]
    sourceContainerMaps: {[id: string]: StructureContainer}
    skSourceContainerMaps: {
      [id: string]:
        {
          container?: StructureContainer;
          lair: StructureKeeperLair;
        }
      }
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
    lairs: StructureKeeperLair[];
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

  interface Observation
  {
    purpose: string,
    roomName: string,
    room?: Room,
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
      flagName?: string;
      requesterIds: string[];
      amount?: number[];
    };
  }

  interface Memory
  {
    observeRoom: {[name: string]: ObserveMemory}
    playerConfig: {
      /*terminalNetworkRange: number;
      enableStats: boolean;
      muteSpawn: boolean;
      creditReserveAmount: number;*/
      powerMinimum: number;
    };
    gclAmount: number;
    wolffOS: any;
    stats: any;
    powerObservers: {[scanningRoomName: string]: {[roomName: string]: number}};
    structures: { [roomName: string]: {[structureType: string]: Structure[]} };
  }

  interface ObserveMemory
  {
    sourceCount?: number;
    mineralType?: MineralConstant;
    controllerOwner?: string;
    controllerLevel?: number;

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
      boosts: string[];
      distance?: number;
      reachedDest?: boolean;
      devilName: string;
      target?: string;
      filling: boolean;
      pickup: boolean;
      fleePath?: RoomPosition[];
      full: boolean;
      sleep?: number;
  }

  interface FlagMemory
  {
      enemies: boolean;
      timeEnemies?: number;
      source: string;
      droppedResource: boolean;
      rollCall: number;
      follower: string;
      skMineral?: string;
      centerSKMineral?: string;
      roadComplete?: number;
      healer?: string;
      attacker?: string;
  }

  interface RoomMemory
  {
    seigeDetected?: boolean;
    avoid: number;
    cache: {[key: string]: any};
    numSites: number;
    boostRequests: BoostRequests;
    observeTarget: string;
    randomN: number;
    Information: {
      owner: string,
      level: number
    };
    assisted: boolean;
    rampartHealth?: number;
    invadersPresent?: boolean;
    skSourceRoom?: boolean;
    lastVision: number;
    enemyId?: string;
    currentPatternCount?: number;
    currentPatternTimer?: number;
    rampartCostMatrix?: number[];
  }

  interface SpawnMemory {}



  /// Meta Data's
  interface MineralDistroLifetimeProcessMetaData
  {
      creep: string;
      container: string;
      mineralType: ResourceConstant;
  }

  interface TowerDefenseProcessMetaData
  {
    roomName: string,
    offOn: boolean,
    counter: number,
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
    visionCreeps: string[]
    upgradePrespawn?: boolean
    upgradeDistroPrespawn?: boolean
  }

  interface DistroLifetimeOptProcessMetaData
  {
    roomName: string,
    sourceContainer: string,
    resource: ResourceConstant,
  }

  interface SquadManagementProcessMetaData
  {
    roomName: string,
    attackRoomName: string,
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
    defenderCreeps: string[]
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
    orderCreated?: boolean
    orderId?: string
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

  interface HolderDefenderLifetimeProcessMetaData
  {
    creep: string,
    targetRoom: string
    flagName: string
    spawnRoomName: string
  }

  interface DefenderLifetimeProcessMetaData
  {
    roomName: string
    flagName: string
    boosts?: string[],
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
    processFlag?: string;
    testMessage?: string;
    fillTowers?: boolean;
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

  interface roomAmounts
  {
    roomName: string,
    amount: number,
    terminal: string
  }
  interface AllTerminalManagementProcessMetaData
  {
    resources: {
      [mineral: string]: roomAmounts[]
    }

    creeps: {
      [source: string]: string[]
    }
  }


  interface MineralManagementProcessMetaData
  {
    roomName: string
    mineralHarvesters: string[]
    mineralHaulers: string[]
    mining: boolean;
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
    roomData: string
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

  interface HealerLifetimeProcessMetaData
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
    creeps: {
      [source: string]: string[]
    }
  }

  interface HelperLifetimeProcessMetaData
  {
    flagName: string,
    site: string,
    boosts?: string[],
    allowUnboosted?: boolean,
    harvesting: boolean,
    source: string
  }

  interface UpgradeLifetimeProcessMetaData
  {
    creep: string,
    roomName: string,
    boosts?: string[],
    allowUnboosted: boolean,
    openSpaces?: RoomPosition
  }

  interface PowerManagementProcessMetaData
  {
    roomName: string;
    currentBank: BankData;
    scanIndex: number;
    scanData: {[roomName: string]: number}
  }

  interface TowerRepairProcessMetaData
  {
    roomName: string;
  }

  interface RepairerLifetimeProcessMetaData
  {
    creep: string,
    roomName: string,
    boosts?: string[],
    allowUnboosted: boolean,

  }

  interface SKRoomManagementProcessMetaData
  {
    mineralMining: boolean,
    centerSKMining: boolean,
    miningFlag: string,
    centerMiningFlag: string,
    invaders: boolean,
    flagName: string,
    roomName: string,
    skRoomName: string,
    centerRoomName: string,
    scoutName?: string,
    vision: boolean,
    scanIndex: number,
    invaderCorePresent: boolean,
    locations: {
      [types: string]: any[]
    },
    devils: string[],
    builderCreeps: string[],
    //workerCreeps: string[],
    distroCreeps: {
      [container: string]: string[]
    }
    distroDistance: {
      [container: string]: number
    }
    harvestCreeps: {
      [source: string]: string[]
    }
    roadsDone: {
      [container: string]: boolean
    }
    miningDistance?: number
    centerMiningDistance?: number
    miner: string[]
    centerMiner: string[]
    minerHauler: string[]
  }

  interface ObservationProcessMetaData
  {
    roomName: string;
    scanRooms?: string[];
    initializeData: boolean;
    currentBank: BankData;
    scanIndex: number;
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

interface ProcessLog {
  [type:string]: {
    cpuUsed:number;
    count:number;
  }
}

interface OpenPositionsOptions
{
  offset: number,
  ignoreIds: string[],
  maxPositions: number,
  avoidEdges: number,
  avoidStructures: string[],
  avoidTerrain: string[],
  avoidCreeps: boolean,
  avoidConstructionSites: boolean,
}

interface BankData
{
  pos: RoomPosition;
  hits: number;
  power: number;
  assisting?: boolean;
  finishing?: boolean;
  distance: number;
  timeout: number;
}
 interface Room
 {
  findStructures<T>(structureType: string): T[];
  findStructures<T>(structureType: string): Structure[];
   coords: RoomCoord
 }

 interface RoomCoord
 {
   x: number;
   y: number;
   xDir: string;
   yDir: string;
 }
