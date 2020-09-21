// type shim for nodejs' `require()` syntax
// for stricter node.js typings, remove this and install `@types/node`
declare const require: (module: string) => any;

// add your custom typings here


interface RoomPosition {
  lookForStructures(structureType: string): Structure;
  getPositionAtDirection(direction: number, range?: number): RoomPosition;
  isPassible(ignoreCreeps?: boolean): boolean;
  isNearExit(range: number): boolean;
  openAdjacentSpots(ignoreCreeps?: boolean): RoomPosition[];
  getOpenPositions(origin_pos: RoomPosition, range: number, opts?: OpenPositionsOptions): RoomPosition[];
  ulamSpiral(n: number);
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
      test: string;
      diagnoseMemory
      depositTypes: DepositConstant[];
      basicCommodities: ResourceConstant[];
      bucketTotal: number;
      bucketCount: number;
      sizeOf: (object: any) => number;
      powerProcessed: number;

    }
  }

  declare var global: NodeJS.Global;

  interface RawMemory{
    _parsed: Memory
  }

  interface RoomData{
    [name: string]: any
    constructionSites: ConstructionSite[]
    containers?: StructureContainer[]
    extensions: StructureExtension[]
    extractor: StructureExtractor | undefined
    nuker?: StructureNuker
    observer?: StructureObserver
    powerBank?: StructurePowerBank
    factory?: StructureFactory
    powerSpawn?: StructurePowerSpawn
    generalContainers: StructureContainer[]
    mineral: Mineral | undefined
    labs: StructureLab[]
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
    store: Store<RESOURCE_ENERGY | MineralConstant | MineralCompoundConstant, false>;
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

  interface HoldRoomData
  {
    roadComplete?: boolean;
    roads: {
      [sourceId: string]: boolean
    }
    enemies?: boolean;
    cores?: boolean;
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
      _trav?: {};
      _travel?: {};
      storageDelivery?: boolean;
      atPlace?: boolean;
      flagIndex?: number;
      boost?: boolean;
      boosts?: string[];
      distance?: number;
      devilName?: string;
      target?: string;
      filling?: boolean;
      pickup?: boolean;
      fleePath?: RoomPosition[];
      full?: boolean;
      standPos?: RoomPosition;
      idlePos?: string;
      leader?: boolean;
      squadPath?: {path: string};
  }

  interface PowerCreepMemory
  {
    opGenerationRoom?: string;
    renewTarget?: string;
    factoryRequest?: boolean;
  }

  interface FlagMemory
  {
    timeEnemies?: number;
    follower?: string;
    attackingCore?: boolean;
    holdData?: HoldRoomData;
    enemies?: boolean;
    cores?: boolean;
  }

  interface RoomMemory
  {
    shutdown?: boolean;
    seigeDetected?: boolean;
    avoid: number;
    cache: {[key: string]: any};
    boostRequests?: BoostRequests;
    assisted?: boolean;
    skSourceRoom?: boolean;
    lastVision: number;
    enemyId?: string;
    currentPatternCount?: number;
    currentPatternTimer?: number;
    skCostMatrix?: number[];
    miningStopTime?: number;
    pauseUpgrading?: boolean;
    upgradingBCFull?: boolean;
    upgradingTick?: number;
    fullEnergyCount?: number;
    specialMining?: boolean;
    depositMining?: boolean;
    surroundingRooms: {
      [roomName: string]: {
        sourceNumbers: number
        controllerPos: RoomPosition
        harvesting: boolean
      };
    };
    templeRoom: boolean;
    remoteHarvesting?: boolean;
    enemies?: boolean;
    roadComplete?: number;
    depositType: DepositConstant;
    instruct?: Instruction;
    componentInstruct?: Instruction;
    resourceToProduce?: CommodityConstant | MineralConstant | RESOURCE_GHODIUM;
    amoutToProduce?: number;
    linkDistances: {
      [linkId: string]: number
    };
    SKInfo?: {
      devilDistance: number
      sourceDistances: {
        [sourceId:string]: number
      }
    }
    transfering?: boolean;
    transferFlagName?: string;
    spinnerDump?: boolean;
    hostileCreepIds?: string[];
    barType?: CommodityConstant;
    powerHarvesting?: boolean;
    startedCommands?: boolean;
    commands?: Command[];
    commandIndex?: number;
    componentsReady?: boolean;
    factoryEmpty?: boolean;
    factoryPreviousAmount?: number;
    commoditiesForLevel?: CommodityConstant[];
    commoditiesToMake?: CommodityConstant[];
    commoditiesIndex?: number;
    roads?: {
      [sourceId: string]: boolean
    };
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
    openPositions:{x: number, y:number}[]
  }

  interface SquadManagementProcessMetaData
  {
    roomName: string,
    attackRoomName: string,
    attackers: string[],
    healers: string[],
    flagName: string,
    rollCallGood: boolean,
    squadPoint?: string,
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
    shutDownRamparts?: boolean
    upgradeType: number // -1 nothing, 0, maintain, 1 upgrade
    rampartCheckTime?: number
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

    builderCreeps?: string[]
    dismantlerCreeps?: string[]
    defenderCreeps?: string[]
    haulerCreeps?: string[]
    coreBuster: string[]
    flagName: string
    enemiesPresent?: boolean
    ruinCheck?: boolean
  }

  interface AutomaticHoldManagementProcessMetaData
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
    coreBuster: string[]
    flagName: string
    increasing: boolean
    remoteName: string
    controllerPos: RoomPosition
  }

  interface HoldHarvesterOptLifetimeProcessMetaData
  {
    flagName: string
    source: string
    harvesting: boolean
  }

  interface BusterLifetimeProcessMetaData
  {
    cree: string,
    flagName: string,
    spawnRoom: string,
    coreId: string,
    boosts: string[]
  }

  interface MarketManagementProcessMetaData
  {
    orderCreated?: boolean
    orderId?: string
    roomWithResource: string[]
  }

  interface DismantleManagementProcessMetaData
  {
      roomName: string
      flagName: string
      dismantleCreeps: string[]
  }

  interface StrongHoldDestructionProcessMetaData
  {
    roomName: string,
    spawnRoomName: string,
    coreId: string,
    attackers: string[]
    healers: string[],
    dismantlers: string[],
    haulers: string[],
    dismantleDone: boolean,
    haulerDone: boolean,
    haulerAlmostDone: boolean,
    standPos?: RoomPosition,
    moving?:boolean,
    stage?: number,
    cleaning: boolean
    finishTime?: number;
    coreLevel: number;
    corePos: RoomPosition;
    vision: boolean;
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
    site: string,
    spawnRoomName: string
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
    remoteName: string
    flagName: string
    spawnRoomName: string,
    boosted: boolean
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
    shutdownLabs?: boolean,
    labDistros: string[],
    idlePosition: RoomPosition;
    command?: Command;
    reagentLabIds?: string[];
    productLabIds?: string[];
    lastCommandTick: number;
    checkProcessTick: number;
    labProcess?: LabProcess;
    fillTowers?: boolean;
  }

  interface TempleProcessMetaData
  {
    roomName: string;
    flagName: string;
    feedRoom: string;
    claimed?: boolean;
    claim?: string[];
    builders: string[];
    haulers: string[];
    upgraders: string[];
    upgraders2: string[];
    distros: string[];
    openSpaces?: {x:number, y:number};

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

  interface PortalClaimProcessMetaData
  {
    roomName?: string;
    flagName: string;
    claimCreeps?: string[];

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

    commoditiesToMove: {
      [commodity: string]: roomAmounts[];
    }

    creeps: {
      [source: string]: string[]
    },
    sendStrings: {
      [roomName: string]: string
    },
    receiveStr: {
      [roomName: string]: string
    }
    shutDownTransfers: {
      [roomName: string]: boolean
    },
    factoryLevelRoomList?: {
      [level: number]: string[]}
    },
  }

  interface TerminalManagementProcessMetaData
  {
    sendStrings: {
      [roomName: string]: string
    },
    receiveStr: {
      [roomName: string]: string
    },
    shutDownTransfers: {
      [roomName: string]: boolean
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
    remoteName: string,
    sourceContainer: string
    flagName: string
    spawnRoom: string
    ruinCheck: boolean
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

  interface UpgradeDistroLifetimeProcessMetaData
  {
    creep: string,
    roomName: string,
    numberOfDropPickups: number,
  }

  interface PowerHarvestingManagementProcessMetaData
  {
    startTime?: number;
    roomName: string;
    powerBankId: string;
    spawnRoomName: string;
    attackers: string[];
    healers: string[];
    haulers: string[];
    powerBankPos?: string;
    suicideSequence?: boolean;
    decayTime?: number;
    haulerDone?: boolean;
    previousPowerBankHits?: number
    haulerMakeUp?: {
      boostLevel: number;
      amount: number;
    }[]
  }

  interface TowerRepairProcessMetaData
  {
    roomName: string;
    roads?: string[];
  }

  interface RepairerLifetimeProcessMetaData
  {
    creep: string,
    roomName: string,
    boosts?: string[],
    allowUnboosted: boolean,
    upgrading: boolean

  }

  interface CoreInfo
  {
    invaderCorePresent: boolean,
    coreId?: string,
    coreRoomName?: string,
    goodbyeTime?: number,
  }

  interface SKRoomManagementProcessMetaData
  {
    moveFlag: boolean,
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
    keepScanning: boolean,
    coreInfo?: CoreInfo,
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
    minerHauler: string[],
    loggingAverage: number,
    logginCount: number,
    coreInSK: boolean,
    invaderFailCount: number,
  }

  interface ObservationManagementProcessMetaData
  {
    roomName: string
    observingRooms?: string[]
    scanIndex: number
    scoredRooms: {
      [roomName: string]: {
        sourceNumbers: number
        controllerPos: RoomPosition
      }
    }
  }

interface StripManagementProcessMetaData {
  roomName: string
  stripperCreeps: string[]
  flagName: string
}

interface StripperLifetimeProcessMetaData {
  creep: string
  roomName: string
  flagName: string
  deliveryRoom: string
}

interface FlagWatcherProcessMetaData {
  skFlagCount?: {[roomName: string]: number};
}

interface TestProcessManagementMetaData {
  roomName: string
  leaders: string[]
  followers: string[]
  flagName: string
}

interface PowerManagementProcessMetaData
{
}

interface PowerCreepLifetimeProcessMetaData
{
  powerCreep: string,
  roomName: string,
  turnOnFactory?: boolean,
  templeStoragePower?: boolean,
  templeStorageId?: string
}

interface AlleyObservationManagementProcessMetaData
{
  roomName: string,
  lastCanTick: number,
  scanIndex: number,
  scanRooms: string[],
  checkRoom: string,
  occupiedPowerBanks: string[]
}

interface DepositMiningManagementProcessMetaData
{
  roomName:string,
  targetRoomName: string,
  vision: boolean,
  harvester: string[];
  haulers: string[];
  harvesterDone: boolean,
  harvesterCount?: number,
  haulerDone: boolean,
  avoidRooms: string[]
}

interface Spinner2LifeTimeProcessMetaData
{
  roomName: string,
  renewSpawnId?: string,
  numberOfFlags: number,
  skFeedRoom?: boolean,
  skMinerals?: string[],
}

interface TransferManagementProcessMetaData
{
  roomName: string,
  transferFlagName: string
  upgraders: string[];
  movers: string[];
  builders: string[];
  transportHealers: string[];
  clearStorage: boolean;
  lvl4Complete?: boolean;
  lvl5Complete?: boolean;
}

interface RemoteBuilderLifetimeProcessMetaData
{
  roomName: string,
  site: string,
  target?: string,

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
  offset?: number,
  ignoreIds?: string[],
  maxPositions?: number,
  avoidEdges?: number,
  avoidStructures?: string[],
  avoidTerrain?: number[],
  avoidCreeps?: boolean,
  avoidFlags?: boolean,
  avoidConstructionSites?: boolean,
}

interface AnimatedPositionOptions
{
  color?: number,
  opacity?: number,
  radius?: number,
  frames?: number,
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
  //findStructures<T>(structureType: string): T[];
  findStructures<T>(structureType: string); //Structure[];
   coords: RoomCoord
 }

 interface RoomCoord
 {
   x: number;
   y: number;
   xDir: string;
   yDir: string;
 }

 interface Instruction
 {
    [type:string]: number
 }

 interface Recipe
 {
   [type: string]: number;
 }

 interface RoomDistance
 {
   [roomName: string]: string;
 }
