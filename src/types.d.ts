// type shim for nodejs' `require()` syntax
// for stricter node.js typings, remove this and install `@types/node`
declare const require: (module: string) => any;

type WOS_HARVESTER_LIFETIME_PROCESS = 'hlf'
type WOS_LINK_HARVESTER_LIFETIME_PROCESS = 'lhlf'
type WOS_ENERGY_MANAGEMENT_PROCESS = 'em'
type WOS_MOVE_PROCESS = 'move'
type WOS_ROOM_DATA_PROCESS = 'roomData'
type WOS_UPGRADE_LIFETIME_PROCESS = 'ulf'
type WOS_BUILDER_LIFETIME_PROCESS = 'blf'
type WOS_REPAIR_PROCESS = 'repair'
type WOS_REPAIR_LIFETIME_PROCESS = 'rlf'
type WOS_STRUCTURE_MANAGEMENT_PROCESS = 'sm'
type WOS_SUSPEND_PROCESS = 'suspend'
type WOS_TOWER_DEFENSE_PROCESS = 'td'
type WOS_TOWER_REPAIR_PROCESS = 'tr'
type WOS_DEFENSE_MANAGEMENT_PROCESS = 'dm'
type WOS_REMOTE_DEFENSE_MANAGEMENT_PROCESS = 'rdmp'
type WOS_REMOTE_DEFENDER_LIFETIME_PROCESS = 'rdlf'
type WOS_DISMANTLE_MANAGEMENT_PROCESS = 'dmp'
type WOS_DISMANTLE_LIFETIME_PROCESS = 'dislf'
type WOS_DISMANTLE_PROCESS = 'dismantle'
type WOS_REMOTE_BUILDER_LIFETIME_PROCESS = 'rblf'
type WOS_CLAIM_PROCESS = 'claim'
type WOS_HOLD_ROOM_MANAGEMENT_PROCESS = 'hrm'
type WOS_HOLDER_LIFETIME_PROCESS = 'holdlf'
type WOS_HOLD_PROCESS = 'hold'
type WOS_HOLD_BUILDER_LIFETIME_PROCESS = 'holdBuilderlf'
type WOS_HOLD_HARVESTER_LIFETIME_PROCESS = 'holdHarvesterlf'
type WOS_HOLD_DISTRO_LIFETIME_PROCESS = 'holdDistrolf'
type WOS_HOLD_DEFENDER_LIFETIME_PROCESS = 'holderDefenderlf'
type WOS_TRANSFER_PROCESS = 'transfer'
type WOS_LINK_MANAGEMENT_PROCESS = 'lm'
type WOS_SPINNER_LIFETIME_PROCESS = 'slf'
type WOS_SPINNER_2_LIETIME_PROCESS = 'slf2'
type WOS_HOLD_WORKER_LIFETIME_PROCESS = 'holdWorkerlf'
type WOS_UPGRADE_DISTRO_LIFETIME_PROCESS = 'udlf'
type WOS_MINERAL_MANAGEMENT_PROCESS = 'minerals'
type WOS_MINERAL_HARVESTER_LIFETIME_PROCESS = 'mhlf'
type WOS_MINERAL_HARVEST_PROCESS = 'mineral-harvest'
type WOS_MINERAL_DISTRO_LIFETIME_PROCESS = 'mdlf'
type WOS_ATTACK_CONTROLLER_MANAGEMENT_PROCESS = 'acmp'
type WOS_MARKET_MANAGEMENT_PROCESS = 'market'
type WOS_TERMINAL_MANAGEMENT_PROCESS = 'terminal'
type WOS_BOUNCE_ATTACK_MANAGEMENT_PROCESS = 'bamp'
type WOS_HEAL_ATTACK_PROCESS = 'healAttack'
type WOS_CONTROLLER_ATTACK_PROCESS = 'calf'
type WOS_MINERAL_TERMINAL_MANAGEMENT_PROCESS = 'mineralTerminal'
type WOS_LAB_MANAGEMENT_PROCESS = 'labm'
type WOS_LAB_DISTRO_LIFETIME_PROCESS = 'labdlf'
type WOS_SIGN_PROCESS = 'sign'
type WOS_GENERAL_ATTACK_MANAGEMENT_PROCESS = 'gamp'
type WOS_ATTACK_LIFETIME_PROCESS = 'attacklf'
type WOS_HELP_MANAGEMENT_PROCESS = 'hmp'
type WOS_HELPER_LIFETIME_PROCESS = 'hlp'
type WOS_DISTRO_LIFETIME_OPT_PROCESS = 'dlfOpt'
type WOS_UPGRADE_DISTRO_LIFETIME_OPT_PROCESS = 'udlfOpt'
type WOS_HOLD_ROOM_MANAGEMENT_OPT_PROCESS = 'hrmOpt'
type WOS_HOLD_HARVESTER_LIFETIME_OPT_PROCESS = 'holdHarvesterlfOpt'
type WOS_RANGE_ATTACK_PROCESS = 'ra'
type WOS_RANGE_ATTACK_LIFETIME_PROCESS = 'ralf'
type WOS_BOUNCE_ATTACK_LIFETIME_PROCESS = 'balf'
type WOS_SQUAD_MANAGEMENT_PROCESS = 'sqm'
type WOS_HEALER_LIFETIME_PROCESS = 'heallf'
type WOS_SQUAD_ATTACKER_LIFETIME_PROCESS = 'salf'
type WOS_REPORT_PROCESS = 'report'
type WOS_SK_ROOM_MANAGEMENT_PROCESS = 'skrmp'
type WOS_TOWER_HEAL_PROCESS = 'th'
type WOS_ALL_TERMINAL_MANAGEMENT_PROCESS = 'atmp'
type WOS_POWER_HARVESTING_MANAGEMENT = 'powm'
type WOS_DEFENDER_LIFETIME_PROCESS = 'deflf'
type WOS_DEFEND_PROCESS = 'defend'
type WOS_BUSTER_LIFETIME_PROCESS = 'busterlf'
type WOS_STRONG_HOLD_DESTRUCTION_PROCESS = 'shdp'
type WOS_OBSERVATION_MANAGEMENT_PROCESS = 'omp'
type WOS_STRIP_MANAGEMENT_PROCESS = 'strip'
type WOS_STRIPPER_LIFETIME_PROCESS = 'stripper'
type WOS_AUTOMATIC_HOLD_MANAGEMENT_PROCESS = 'ahmp'
type WOS_TEST_PROCESS = 'test'
type WOS_POWER_MANAGEMENT_PROCESS = 'powerm'
type WOS_POWER_CREEP_LIFETIME_PROCESS = 'pclf'
type WOS_ALLEY_OBSERVATION_MANAGEMENT_PROCESS = 'aomp'
type WOS_DEPOSIT_MINING_MANAGEMENT_PROCESS = 'dmmp'
type WOS_TRANSFER_MANAGEMENT_PROCESS = 'tmp'
type WOS_TEMPLE_PROCESS = 'temple'

declare const WOS_HARVESTER_LIFETIME_PROCESS = 'hlf'
declare const WOS_LINK_HARVESTER_LIFETIME_PROCESS = 'lhlf'
declare const WOS_ENERGY_MANAGEMENT_PROCESS = 'em'
declare const WOS_MOVE_PROCESS = 'move'
declare const WOS_ROOM_DATA_PROCESS = 'roomData'
declare const WOS_UPGRADE_LIFETIME_PROCESS = 'ulf'
declare const WOS_BUILDER_LIFETIME_PROCESS = 'blf'
declare const WOS_REPAIR_PROCESS = 'repair'
declare const WOS_REPAIR_LIFETIME_PROCESS = 'rlf'
declare const WOS_STRUCTURE_MANAGEMENT_PROCESS = 'sm'
declare const WOS_SUSPEND_PROCESS = 'suspend'
declare const WOS_TOWER_DEFENSE_PROCESS = 'td'
declare const WOS_TOWER_REPAIR_PROCESS = 'tr'
declare const WOS_DEFENSE_MANAGEMENT_PROCESS = 'dm'
declare const WOS_REMOTE_DEFENSE_MANAGEMENT_PROCESS = 'rdmp'
declare const WOS_REMOTE_DEFENDER_LIFETIME_PROCESS = 'rdlf'
declare const WOS_DISMANTLE_MANAGEMENT_PROCESS = 'dmp'
declare const WOS_DISMANTLE_LIFETIME_PROCESS = 'dislf'
declare const WOS_DISMANTLE_PROCESS = 'dismantle'
declare const WOS_REMOTE_BUILDER_LIFETIME_PROCESS = 'rblf'
declare const WOS_CLAIM_PROCESS = 'claim'
declare const WOS_HOLD_ROOM_MANAGEMENT_PROCESS = 'hrm'
declare const WOS_HOLDER_LIFETIME_PROCESS = 'holdlf'
declare const WOS_HOLD_PROCESS = 'hold'
declare const WOS_HOLD_BUILDER_LIFETIME_PROCESS = 'holdBuilderlf'
declare const WOS_HOLD_HARVESTER_LIFETIME_PROCESS = 'holdHarvesterlf'
declare const WOS_HOLD_DISTRO_LIFETIME_PROCESS = 'holdDistrolf'
declare const WOS_HOLD_DEFENDER_LIFETIME_PROCESS = 'holderDefenderlf'
declare const WOS_TRANSFER_PROCESS = 'transfer'
declare const WOS_LINK_MANAGEMENT_PROCESS = 'lm'
declare const WOS_SPINNER_LIFETIME_PROCESS = 'slf'
declare const WOS_SPINNER_2_LIETIME_PROCESS = 'slf2'
declare const WOS_HOLD_WORKER_LIFETIME_PROCESS = 'holdWorkerlf'
declare const WOS_UPGRADE_DISTRO_LIFETIME_PROCESS = 'udlf'
declare const WOS_MINERAL_MANAGEMENT_PROCESS = 'minerals'
declare const WOS_MINERAL_HARVESTER_LIFETIME_PROCESS = 'mhlf'
declare const WOS_MINERAL_HARVEST_PROCESS = 'mineral-harvest'
declare const WOS_MINERAL_DISTRO_LIFETIME_PROCESS = 'mdlf'
declare const WOS_ATTACK_CONTROLLER_MANAGEMENT_PROCESS = 'acmp'
declare const WOS_MARKET_MANAGEMENT_PROCESS = 'market'
declare const WOS_TERMINAL_MANAGEMENT_PROCESS = 'terminal'
declare const WOS_BOUNCE_ATTACK_MANAGEMENT_PROCESS = 'bamp'
declare const WOS_HEAL_ATTACK_PROCESS = 'healAttack'
declare const WOS_CONTROLLER_ATTACK_PROCESS = 'calf'
declare const WOS_MINERAL_TERMINAL_MANAGEMENT_PROCESS = 'mineralTerminal'
declare const WOS_LAB_MANAGEMENT_PROCESS = 'labm'
declare const WOS_LAB_DISTRO_LIFETIME_PROCESS = 'labdlf'
declare const WOS_SIGN_PROCESS = 'sign'
declare const WOS_GENERAL_ATTACK_MANAGEMENT_PROCESS = 'gamp'
declare const WOS_ATTACK_LIFETIME_PROCESS = 'attacklf'
declare const WOS_HELP_MANAGEMENT_PROCESS = 'hmp'
declare const WOS_HELPER_LIFETIME_PROCESS = 'hlp'
declare const WOS_DISTRO_LIFETIME_OPT_PROCESS = 'dlfOpt'
declare const WOS_UPGRADE_DISTRO_LIFETIME_OPT_PROCESS = 'udlfOpt'
declare const WOS_HOLD_ROOM_MANAGEMENT_OPT_PROCESS = 'hrmOpt'
declare const WOS_HOLD_HARVESTER_LIFETIME_OPT_PROCESS = 'holdHarvesterlfOpt'
declare const WOS_RANGE_ATTACK_PROCESS = 'ra'
declare const WOS_RANGE_ATTACK_LIFETIME_PROCESS = 'ralf'
declare const WOS_BOUNCE_ATTACK_LIFETIME_PROCESS = 'balf'
declare const WOS_SQUAD_MANAGEMENT_PROCESS = 'sqm'
declare const WOS_HEALER_LIFETIME_PROCESS = 'heallf'
declare const WOS_SQUAD_ATTACKER_LIFETIME_PROCESS = 'salf'
declare const WOS_REPORT_PROCESS = 'report'
declare const WOS_SK_ROOM_MANAGEMENT_PROCESS = 'skrmp'
declare const WOS_TOWER_HEAL_PROCESS = 'th'
declare const WOS_ALL_TERMINAL_MANAGEMENT_PROCESS = 'atmp'
declare const WOS_POWER_HARVESTING_MANAGEMENT = 'powm'
declare const WOS_DEFENDER_LIFETIME_PROCESS = 'deflf'
declare const WOS_DEFEND_PROCESS = 'defend'
declare const WOS_BUSTER_LIFETIME_PROCESS = 'busterlf'
declare const WOS_STRONG_HOLD_DESTRUCTION_PROCESS = 'shdp'
declare const WOS_OBSERVATION_MANAGEMENT_PROCESS = 'omp'
declare const WOS_STRIP_MANAGEMENT_PROCESS = 'strip'
declare const WOS_STRIPPER_LIFETIME_PROCESS = 'stripper'
declare const WOS_AUTOMATIC_HOLD_MANAGEMENT_PROCESS = 'ahmp'
declare const WOS_TEST_PROCESS = 'test'
declare const WOS_POWER_MANAGEMENT_PROCESS = 'powerm'
declare const WOS_POWER_CREEP_LIFETIME_PROCESS = 'pclf'
declare const WOS_ALLEY_OBSERVATION_MANAGEMENT_PROCESS = 'aomp'
declare const WOS_DEPOSIT_MINING_MANAGEMENT_PROCESS = 'dmmp'
declare const WOS_TRANSFER_MANAGEMENT_PROCESS = 'tmp'
declare const WOS_TEMPLE_PROCESS = 'temple'

type ProcessTypes =
WOS_HARVESTER_LIFETIME_PROCESS |
WOS_LINK_HARVESTER_LIFETIME_PROCESS |
WOS_ENERGY_MANAGEMENT_PROCESS |
WOS_MOVE_PROCESS |
WOS_ROOM_DATA_PROCESS |
WOS_UPGRADE_LIFETIME_PROCESS |
WOS_BUILDER_LIFETIME_PROCESS |
WOS_REPAIR_PROCESS |
WOS_REPAIR_LIFETIME_PROCESS |
WOS_STRUCTURE_MANAGEMENT_PROCESS |
WOS_SUSPEND_PROCESS |
WOS_TOWER_DEFENSE_PROCESS |
WOS_TOWER_REPAIR_PROCESS |
WOS_DEFENSE_MANAGEMENT_PROCESS |
WOS_REMOTE_DEFENSE_MANAGEMENT_PROCESS |
WOS_REMOTE_DEFENDER_LIFETIME_PROCESS |
WOS_DISMANTLE_MANAGEMENT_PROCESS |
WOS_DISMANTLE_LIFETIME_PROCESS |
WOS_DISMANTLE_PROCESS |
WOS_REMOTE_BUILDER_LIFETIME_PROCESS |
WOS_CLAIM_PROCESS |
WOS_HOLD_ROOM_MANAGEMENT_PROCESS |
WOS_HOLDER_LIFETIME_PROCESS |
WOS_HOLD_PROCESS |
WOS_HOLD_BUILDER_LIFETIME_PROCESS |
WOS_HOLD_HARVESTER_LIFETIME_PROCESS |
WOS_HOLD_DISTRO_LIFETIME_PROCESS |
WOS_HOLD_DEFENDER_LIFETIME_PROCESS |
WOS_TRANSFER_PROCESS |
WOS_LINK_MANAGEMENT_PROCESS |
WOS_SPINNER_LIFETIME_PROCESS |
WOS_SPINNER_2_LIETIME_PROCESS |
WOS_HOLD_WORKER_LIFETIME_PROCESS |
WOS_UPGRADE_DISTRO_LIFETIME_PROCESS |
WOS_MINERAL_MANAGEMENT_PROCESS |
WOS_MINERAL_HARVESTER_LIFETIME_PROCESS |
WOS_MINERAL_HARVEST_PROCESS |
WOS_MINERAL_DISTRO_LIFETIME_PROCESS |
WOS_ATTACK_CONTROLLER_MANAGEMENT_PROCESS |
WOS_MARKET_MANAGEMENT_PROCESS |
WOS_TERMINAL_MANAGEMENT_PROCESS |
WOS_BOUNCE_ATTACK_MANAGEMENT_PROCESS |
WOS_HEAL_ATTACK_PROCESS |
WOS_CONTROLLER_ATTACK_PROCESS |
WOS_MINERAL_TERMINAL_MANAGEMENT_PROCESS |
WOS_LAB_MANAGEMENT_PROCESS |
WOS_LAB_DISTRO_LIFETIME_PROCESS |
WOS_SIGN_PROCESS |
WOS_GENERAL_ATTACK_MANAGEMENT_PROCESS |
WOS_ATTACK_LIFETIME_PROCESS |
WOS_HELP_MANAGEMENT_PROCESS |
WOS_HELPER_LIFETIME_PROCESS |
WOS_DISTRO_LIFETIME_OPT_PROCESS |
WOS_UPGRADE_DISTRO_LIFETIME_OPT_PROCESS |
WOS_HOLD_ROOM_MANAGEMENT_OPT_PROCESS |
WOS_HOLD_HARVESTER_LIFETIME_OPT_PROCESS |
WOS_RANGE_ATTACK_PROCESS |
WOS_RANGE_ATTACK_LIFETIME_PROCESS |
WOS_BOUNCE_ATTACK_LIFETIME_PROCESS |
WOS_SQUAD_MANAGEMENT_PROCESS |
WOS_HEALER_LIFETIME_PROCESS |
WOS_SQUAD_ATTACKER_LIFETIME_PROCESS |
WOS_REPORT_PROCESS |
WOS_SK_ROOM_MANAGEMENT_PROCESS |
WOS_TOWER_HEAL_PROCESS |
WOS_ALL_TERMINAL_MANAGEMENT_PROCESS |
WOS_POWER_HARVESTING_MANAGEMENT |
WOS_DEFENDER_LIFETIME_PROCESS |
WOS_DEFEND_PROCESS |
WOS_BUSTER_LIFETIME_PROCESS |
WOS_STRONG_HOLD_DESTRUCTION_PROCESS |
WOS_OBSERVATION_MANAGEMENT_PROCESS |
WOS_STRIP_MANAGEMENT_PROCESS |
WOS_STRIPPER_LIFETIME_PROCESS |
WOS_AUTOMATIC_HOLD_MANAGEMENT_PROCESS |
WOS_TEST_PROCESS |
WOS_POWER_MANAGEMENT_PROCESS |
WOS_POWER_CREEP_LIFETIME_PROCESS |
WOS_ALLEY_OBSERVATION_MANAGEMENT_PROCESS |
WOS_DEPOSIT_MINING_MANAGEMENT_PROCESS |
WOS_TRANSFER_MANAGEMENT_PROCESS |
WOS_TEMPLE_PROCESS;

type ProcessWithTypedMetaData<T extends ProcessTypes> = {
  metaData: MetaData[T]
  completed: boolean
}

type BlankMetaData = {};
type RoomMetaData = BlankMetaData & {
  /** The room this processing is running in. */
  roomName: string
}
type CreepMetaData = BlankMetaData & {
  creep: string
}
type ResourceMoveMetaData = CreepMetaData & {
  resource: ResourceConstant
  target: string
}
type FlagMetaData = {
  flag: string
}

type MetaData = {
  [processType: string]: {}
  hlf: CreepMetaData & {
    source: string;
  }
  lhlf: CreepMetaData & {
    source: string;
  }
 em: RoomMetaData & {
  harvestCreeps: {
    [source: string]: string[];
  };
  harvesterPrespawn?: boolean;
  distroCreeps?: {
    [container: string]: string;
  };
  upgradeCreeps: string[];
  spinCreeps: string[];
  upgradeDistroCreeps: string[];
  visionCreeps: string[];
  upgradePrespawn?: boolean;
  upgradeDistroPrespawn?: boolean;
 }
roomData: RoomMetaData
ulf: CreepMetaData & RoomMetaData & {
    openSpaces?: RoomPosition
}
blf
WOS_REPAIR_PROCESS = 'repair'
WOS_REPAIR_LIFETIME_PROCESS = 'rlf'
WOS_STRUCTURE_MANAGEMENT_PROCESS = 'sm'
WOS_SUSPEND_PROCESS = 'suspend'
WOS_TOWER_DEFENSE_PROCESS = 'td'
WOS_TOWER_REPAIR_PROCESS = 'tr'
WOS_DEFENSE_MANAGEMENT_PROCESS = 'dm'
WOS_REMOTE_DEFENSE_MANAGEMENT_PROCESS = 'rdmp'
WOS_REMOTE_DEFENDER_LIFETIME_PROCESS = 'rdlf'
WOS_DISMANTLE_MANAGEMENT_PROCESS = 'dmp'
WOS_DISMANTLE_LIFETIME_PROCESS = 'dislf'
WOS_DISMANTLE_PROCESS = 'dismantle'
WOS_REMOTE_BUILDER_LIFETIME_PROCESS = 'rblf'
WOS_CLAIM_PROCESS = 'claim'
WOS_HOLD_ROOM_MANAGEMENT_PROCESS = 'hrm'
WOS_HOLDER_LIFETIME_PROCESS = 'holdlf'
WOS_HOLD_PROCESS = 'hold'
WOS_HOLD_BUILDER_LIFETIME_PROCESS = 'holdBuilderlf'
WOS_HOLD_HARVESTER_LIFETIME_PROCESS = 'holdHarvesterlf'
WOS_HOLD_DISTRO_LIFETIME_PROCESS = 'holdDistrolf'
WOS_HOLD_DEFENDER_LIFETIME_PROCESS = 'holderDefenderlf'
WOS_TRANSFER_PROCESS = 'transfer'
WOS_LINK_MANAGEMENT_PROCESS = 'lm'
WOS_SPINNER_LIFETIME_PROCESS = 'slf'
WOS_SPINNER_2_LIETIME_PROCESS = 'slf2'
WOS_HOLD_WORKER_LIFETIME_PROCESS = 'holdWorkerlf'
WOS_UPGRADE_DISTRO_LIFETIME_PROCESS = 'udlf'
WOS_MINERAL_MANAGEMENT_PROCESS = 'minerals'
WOS_MINERAL_HARVESTER_LIFETIME_PROCESS = 'mhlf'
WOS_MINERAL_HARVEST_PROCESS = 'mineral-harvest'
WOS_MINERAL_DISTRO_LIFETIME_PROCESS = 'mdlf'
WOS_ATTACK_CONTROLLER_MANAGEMENT_PROCESS = 'acmp'
WOS_MARKET_MANAGEMENT_PROCESS = 'market'
WOS_TERMINAL_MANAGEMENT_PROCESS = 'terminal'
WOS_BOUNCE_ATTACK_MANAGEMENT_PROCESS = 'bamp'
WOS_HEAL_ATTACK_PROCESS = 'healAttack'
WOS_CONTROLLER_ATTACK_PROCESS = 'calf'
WOS_MINERAL_TERMINAL_MANAGEMENT_PROCESS = 'mineralTermina
WOS_LAB_MANAGEMENT_PROCESS = 'labm'
WOS_LAB_DISTRO_LIFETIME_PROCESS = 'labdlf'
WOS_SIGN_PROCESS = 'sign'
WOS_GENERAL_ATTACK_MANAGEMENT_PROCESS = 'gamp'
WOS_ATTACK_LIFETIME_PROCESS = 'attacklf'
WOS_HELP_MANAGEMENT_PROCESS = 'hmp'
WOS_HELPER_LIFETIME_PROCESS = 'hlp'
WOS_DISTRO_LIFETIME_OPT_PROCESS = 'dlfOpt'
WOS_UPGRADE_DISTRO_LIFETIME_OPT_PROCESS = 'udlfOpt'
WOS_HOLD_ROOM_MANAGEMENT_OPT_PROCESS = 'hrmOpt'
WOS_HOLD_HARVESTER_LIFETIME_OPT_PROCESS = 'holdHarvesterl
WOS_RANGE_ATTACK_PROCESS = 'ra'
WOS_RANGE_ATTACK_LIFETIME_PROCESS = 'ralf'
WOS_BOUNCE_ATTACK_LIFETIME_PROCESS = 'balf'
WOS_SQUAD_MANAGEMENT_PROCESS = 'sqm'
WOS_HEALER_LIFETIME_PROCESS = 'heallf'
WOS_SQUAD_ATTACKER_LIFETIME_PROCESS = 'salf'
WOS_REPORT_PROCESS = 'report'
WOS_SK_ROOM_MANAGEMENT_PROCESS = 'skrmp'
WOS_TOWER_HEAL_PROCESS = 'th'
WOS_ALL_TERMINAL_MANAGEMENT_PROCESS = 'atmp'
WOS_POWER_HARVESTING_MANAGEMENT = 'powm'
WOS_DEFENDER_LIFETIME_PROCESS = 'deflf'
WOS_DEFEND_PROCESS = 'defend'
WOS_BUSTER_LIFETIME_PROCESS = 'busterlf'
WOS_STRONG_HOLD_DESTRUCTION_PROCESS = 'shdp'
WOS_OBSERVATION_MANAGEMENT_PROCESS = 'omp'
WOS_STRIP_MANAGEMENT_PROCESS = 'strip'
WOS_STRIPPER_LIFETIME_PROCESS = 'stripper'
WOS_AUTOMATIC_HOLD_MANAGEMENT_PROCESS = 'ahmp'
WOS_TEST_PROCESS = 'test'
WOS_POWER_MANAGEMENT_PROCESS = 'powerm'
WOS_POWER_CREEP_LIFETIME_PROCESS = 'pclf'
WOS_ALLEY_OBSERVATION_MANAGEMENT_PROCESS = 'aomp'
WOS_DEPOSIT_MINING_MANAGEMENT_PROCESS = 'dmmp'
WOS_TRANSFER_MANAGEMENT_PROCESS = 'tmp'
WOS_TEMPLE_PROCESS = 'temple'
}
// add your custom typings here
interface Creep extends RoomObject {
    fixMyRoad(): boolean;
    transferEverything(target: Creep|StructureContainer|StructureStorage|StructureTerminal|StructureFactory): number;
    withdrawEverything(target: any): number;
    withdrawEverythingBut(target: any, res: ResourceConstant): number;
    yieldRoad(target: {pos: RoomPosition}, allowSwamps: boolean): number;
    idleOffRoad(anchor: {pos: RoomPosition}, maintainDistance: boolean): number;
    getFlags(identifier: string, max: Number): Flag[]
    boostRequest(boosts: string[], allowUnboosted: boolean): any
    getBodyPart(type: BodyPartConstant): boolean;
    getBodyParts(): BodyPartConstant[];
    getBodyPartBoosted(type: BodyPartConstant): boolean;
    moveDir(dir: DirectionConstant): string;
    almostFull(): boolean;
  }

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
    factory?: StructureFactory
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
    rampartCostMatrix?: number[];
    skCostMatrix?: number[];
    miningStopTime?: number;
    pauseUpgrading?: boolean;
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
    dismantlerCreeps: string[]
    workerCreeps: string[]
    defenderCreeps: string[]
    coreBuster: string[]
    flagName: string
    increasing: boolean
    enemiesPresent: boolean
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
    },
    sendStrings: {
      [roomName: string]: string
    },
    receiveStr: {
      [roomName: string]: string
    }
    shutDownTransfers: {
      [roomName: string]: boolean
    }
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

  interface UpgradeDistroLifetimeProcessMetaData
  {
    creep: string,
    roomName: string,
    numberOfDropPickups: number,
  }

  interface PowerHarvestingManagementProcessMetaData
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
  roomName: string
}

interface AlleyObservationManagementProcessMetaData
{
  roomName: string,
  lastCanTick: number,
  scanIndex: number,
  scanRooms: string[],
  checkRoom: string,
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
}

interface Spinner2LifeTimeProcessMetaData
{
  roomName: string,
  renewSpawnId?: string,
  numberOfFlags: number,
  skFeedRoom?: boolean,
  skMinerals?: string[],
  commands?: Command[],
  commandIndex?: number,
  factoryEmpty?: boolean,
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
  avoidConstructionSites?: boolean,
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
