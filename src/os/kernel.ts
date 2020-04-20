import {Process} from './process'

import {InitProcess} from '../processTypes/system/init'
import {HarvestProcess} from '../processTypes/creepActions/harvest'
import {HarvesterLifetimeProcess} from '../processTypes/lifetimes/harvester'
import {EnergyManagementProcess} from '../processTypes/management/energy'
import {MoveProcess} from '../processTypes/creepActions/move'
import {RoomDataProcess} from '../processTypes/roomData'
import {UpgradeProcess} from '../processTypes/creepActions/upgrade'
import {UpgraderLifetimeProcess} from '../processTypes/lifetimes/upgrader'
import {BuilderLifetimeProcess} from '../processTypes/lifetimes/builder'
import {RepairProcess} from '../processTypes/creepActions/repair'
import {RepairerLifetimeProcess} from '../processTypes/lifetimes/repairer'
import {StructureManagementProcess} from '../processTypes/management/structure'
import {TowerDefenseProcess} from '../processTypes/buildingProcesses/towerDefense'
import {TowerRepairProcess} from '../processTypes/buildingProcesses/towerRepair'
import {SuspensionProcess} from '../processTypes/system/suspension'

import {DefenseManagementProcess} from '../processTypes/management/defense'
import {RemoteDefenseManagementProcess} from '../processTypes/management/remoteDefense'
import {RemoteDefenderLifetimeProcess} from '../processTypes/lifetimes/remoteDefender'

import {DismantleManagementProcess} from '../processTypes/management/dismantle'
import {DismantleLifetimeProcess} from '../processTypes/lifetimes/dismantler'
import {DismantleProcess} from '../processTypes/creepActions/dismantle'

import {RemoteBuilderLifetimeProcess} from '../processTypes/lifetimes/remoteBuilder'
import {ClaimProcess} from '../processTypes/empireActions/claim'

import { HoldRoomManagementProcess } from 'processTypes/management/holdRoom';
import { TransferProcess} from '../processTypes/empireActions/transfer'

import {Stats} from '../lib/stats'
import { HolderLifetimeProcess } from 'processTypes/empireActions/lifetimes/holder';
import { HoldProcess } from 'processTypes/empireActions/creepActions/hold';
import { HoldBuilderLifetimeProcess } from 'processTypes/empireActions/lifetimes/holderBuilder';
import { HoldHarvesterLifetimeProcess } from 'processTypes/empireActions/lifetimes/holderHarvester';
import { HoldDistroLifetimeProcess } from 'processTypes/empireActions/lifetimes/holderDistro';
import { LinkManagementProcess } from 'processTypes/management/link';
import { SpinnerLifetimeProcess } from 'processTypes/lifetimes/spinner';
import { HoldWorkerLifetimeProcess } from 'processTypes/empireActions/lifetimes/holdWorker';
import { LinkHarvesterLifetimeProcess } from 'processTypes/lifetimes/linkHarvester';
import { UpgradeDistroLifetimeProcess } from 'processTypes/lifetimes/upgradeDistro';
import { MineralManagementProcess } from 'processTypes/management/mineral';
import { MineralHarvesterLifetimeProcess } from 'processTypes/lifetimes/mineralHarvester';
import { MineralHarvest } from 'processTypes/creepActions/mineralHarvest';
import { MineralDistroLifetimeProcess } from 'processTypes/lifetimes/mineralDistro';
import { AttackControllerManagementProcess } from 'processTypes/management/attackController';
import { MarketManagementProcess } from 'processTypes/management/market';
import { TerminalManagementProcess } from 'processTypes/buildingProcesses/terminal';
import { BounceAttackManagementProcess } from 'processTypes/management/bounceAttack';
import { HealAttackProcess } from 'processTypes/management/healAttack';
import { ControllerAttackLifetimeProcess } from 'processTypes/lifetimes/controllerAttack';
import { MinetalTerminalManagementProcess } from 'processTypes/buildingProcesses/mineralTerminal';
import { LabManagementProcess } from 'processTypes/management/lab';
import { LabDistroLifetimeProcess } from 'processTypes/lifetimes/labDistro';
import { SignControllerProcess } from 'processTypes/management/sign';
import { GeneralAttackManagementProcess } from 'processTypes/management/generalAttack';
import { AttackerLifetimeProcess } from 'processTypes/lifetimes/attacker';
import { HelperLifetimeProcess } from 'processTypes/lifetimes/Helper';
import { HelpManagementProcess } from 'processTypes/management/help';
import { DistroLifetimeOptProcess } from 'processTypes/lifetimes/distroOpt';
import { UpgradeDistroLifetimeOptProcess } from 'processTypes/lifetimes/upgradeDistroOpt';
import { HoldRoomOptManagementProcess } from 'processTypes/management/holdRoomOpt';
import { HoldHarvesterOptLifetimeProcess } from 'processTypes/empireActions/lifetimes/holderHarvesterOpt';
import { RangeAttackManagementProcess } from 'processTypes/management/rangeAttack';
import { RangeAttackerLifetimeProcess } from 'processTypes/lifetimes/rangeAttacker';
import { BounceAttackerLifetimeProcess } from 'processTypes/lifetimes/bounceAttacker';
import { SquadManagementProcess } from 'processTypes/management/squad';
import { HealerLifetimeProcess } from 'processTypes/lifetimes/healer';
import { SquadAttackerLifetimeProcess } from 'processTypes/lifetimes/squadAttacker';
import { ReportProcess } from 'processTypes/system/reports';
import { skRoomManagementProcess } from 'processTypes/management/skroom';
import { TowerHealProcess } from 'processTypes/buildingProcesses/towerHeal';
import { AllTerminalManagementProcess } from 'processTypes/buildingProcesses/allTerminal';
import { PowerHarvestingManagement } from 'processTypes/management/powerHarvesting';
import { DefenderLifetimeProcess } from 'processTypes/lifetimes/defender';
import { DefendProcess } from 'processTypes/creepActions/defend';
import { HolderDefenderLifetimeProcess } from 'processTypes/empireActions/lifetimes/holderDefender';
import { BusterLifetimeProcess } from 'processTypes/empireActions/lifetimes/buster';
import { StrongHoldDestructionProcess } from 'processTypes/management/strongHoldDestruction';
import { ObservationManagementProcess } from 'processTypes/management/observation'
import { AutomaticHoldManagementProcess } from 'processTypes/management/automaticHold'
import { StripManagementProcess } from 'processTypes/management/strip'
import { StripperLifetimeProcess } from 'processTypes/lifetimes/stripper'
import { TestProcessManagement } from 'processTypes/management/test'
import { PowerManagement } from 'processTypes/management/power'
import { PowerCreepLifetimeProcess } from 'processTypes/lifetimes/powerCreep'
import { AlleyObservationManagementProcess } from 'processTypes/management/alleyObservation'
import { DepositMiningManagementProcess } from 'processTypes/management/depositMining'
import { Spinner2LifeTimeProcess } from 'processTypes/lifetimes/spinner2'
import { TransferManagementProcess } from 'processTypes/management/transfer'
import { TempleProcess } from 'processTypes/management/temple'




export const processTypes = <{[type: string]: any}>{
  'harvest': HarvestProcess,
  'hlf': HarvesterLifetimeProcess,
  'lhlf': LinkHarvesterLifetimeProcess,
  'em': EnergyManagementProcess,
  'move': MoveProcess,
  'roomData': RoomDataProcess,
  'upgrade': UpgradeProcess,
  'ulf': UpgraderLifetimeProcess,
  'blf': BuilderLifetimeProcess,
  'repair': RepairProcess,
  'rlf': RepairerLifetimeProcess,
  'sm': StructureManagementProcess,
  'suspend': SuspensionProcess,
  'td': TowerDefenseProcess,
  'tr': TowerRepairProcess,
  'dm': DefenseManagementProcess,
  'rdmp': RemoteDefenseManagementProcess,
  'rdlf': RemoteDefenderLifetimeProcess,
  'dmp': DismantleManagementProcess,
  'dislf': DismantleLifetimeProcess,
  'dismantle': DismantleProcess,
  'rblf': RemoteBuilderLifetimeProcess,
  'claim': ClaimProcess,
  'hrm': HoldRoomManagementProcess,
  'holdlf': HolderLifetimeProcess,
  'hold': HoldProcess,
  'holdBuilderlf': HoldBuilderLifetimeProcess,
  'holdHarvesterlf': HoldHarvesterLifetimeProcess,
  'holdDistrolf': HoldDistroLifetimeProcess,
  'holderDefenderlf': HolderDefenderLifetimeProcess,
  'transfer': TransferProcess,
  'lm': LinkManagementProcess,
  'slf': SpinnerLifetimeProcess,
  'slf2': Spinner2LifeTimeProcess,  // 45
  'holdWorkerlf': HoldWorkerLifetimeProcess,
  'udlf': UpgradeDistroLifetimeProcess,
  'minerals': MineralManagementProcess,
  'mhlf' : MineralHarvesterLifetimeProcess,
  'mineral-harvest': MineralHarvest,
  'mdlf': MineralDistroLifetimeProcess,
  'acmp': AttackControllerManagementProcess,
  'market': MarketManagementProcess,
  'terminal' : TerminalManagementProcess,
  'bamp' : BounceAttackManagementProcess,
  'healAttack' : HealAttackProcess,
  'calf' : ControllerAttackLifetimeProcess,
  'mineralTerminal': MinetalTerminalManagementProcess,
  'labm': LabManagementProcess,
  'labdlf': LabDistroLifetimeProcess,
  'sign': SignControllerProcess,
  'gamp': GeneralAttackManagementProcess,
  'attacklf': AttackerLifetimeProcess,
  'hmp': HelpManagementProcess,
  'hlp': HelperLifetimeProcess,
  'dlfOpt': DistroLifetimeOptProcess,
  'udlfOpt': UpgradeDistroLifetimeOptProcess,
  'hrmOpt': HoldRoomOptManagementProcess,
  'holdHarvesterlfOpt': HoldHarvesterOptLifetimeProcess,
  'ra': RangeAttackManagementProcess,
  'ralf': RangeAttackerLifetimeProcess,
  'balf': BounceAttackerLifetimeProcess,
  'sqm': SquadManagementProcess,
  'heallf': HealerLifetimeProcess,
  'salf': SquadAttackerLifetimeProcess,
  'report': ReportProcess,
  'skrmp': skRoomManagementProcess,
  'th': TowerHealProcess,
  'atmp': AllTerminalManagementProcess,
  'powm': PowerHarvestingManagement,
  'deflf': DefenderLifetimeProcess,
  'defend': DefendProcess,
  'busterlf': BusterLifetimeProcess,
  'shdp': StrongHoldDestructionProcess, // 35
  'omp': ObservationManagementProcess,
  'strip': StripManagementProcess,
  'stripper': StripperLifetimeProcess,
  'ahmp': AutomaticHoldManagementProcess,
  'test':  TestProcessManagement, // 40
  'powerm': PowerManagement, // 50
  'pclf': PowerCreepLifetimeProcess, // 49
  'aomp': AlleyObservationManagementProcess, // 25
  'dmmp': DepositMiningManagementProcess, // 24
  'tmp': TransferManagementProcess, // 20
  'temple': TempleProcess // 60
}

interface KernelData{
  roomData: {
    [name: string]: RoomData
  }
  usedSpawns: string[];
  labProcesses: { [resourceType: string]: number };
  activeLabCount: number;
  costMatrixs: {
    [roomName: string]: CostMatrix
  }
}

interface ProcessTable{
  [name: string]: Process
}

export class Kernel{
  /** The CPU Limit for this tick */
  limit: number
  /** The process table */
  processTable: ProcessTable = {}

  /** IPC Messages */
  ipc: IPCMessage[] = []

  processTypes = processTypes

  data = <KernelData>{
    roomData: {},
    usedSpawns: [],
    activeLabCount: 0,
    labProcesses: {},
    costMatrixs: {},
  }

  execOrder: ExecOrder[] = []
  suspendCount = 0

  /**  Creates a new kernel ensuring that memory exists and re-loads the process table from the last. */
  constructor(){
    if(!Memory.wolffOS)
      Memory.wolffOS = {};

    this.setCPULimit();

    this.loadProcessTable()

    this.addProcess(WOS_INIT_PROCESS, 'init', 99, {})
  }

  sigmoid(x: number)
  {
    return 1.0/(1.0 + Math.exp(-x));
  }

  sigmoidSkewed(x: number)
  {
    return this.sigmoid((x * 12.0) - 6.0);
  }

  setCPULimit()
  {
    let bucketCeiling = 9500;
    let bucketFloor = 2000;
    let cpuMin = 0.6;

    if(Game.cpu.bucket > bucketCeiling)
      this.limit = Game.cpu.tickLimit - 10;
    else if(Game.cpu.bucket < 1000)
      this.limit = Game.cpu.limit * 0.4;
    else if(Game.cpu.bucket < bucketFloor)
      this.limit = Game.cpu.limit * cpuMin;
    else
    {
      let bucketRange = bucketCeiling - bucketFloor;
      let depthInRange = (Game.cpu.bucket - bucketFloor) / bucketRange;
      let minAssignable = Game.cpu.limit * cpuMin;
      let maxAssignable = Game.cpu.tickLimit - 15;
      this.limit = Math.round(minAssignable + this.sigmoidSkewed(depthInRange) * (maxAssignable - minAssignable));
    }
  }

  /** Check if the current cpu usage is below the limit for this tick */
  underLimit(){
    return (Game.cpu.getUsed() < this.limit)
  }

  /** Is there any processes left to run */
  needsToRun()
  {
    return(!!this.getHighestProcess());
  }

  /** Load the process table from Memory */
  loadProcessTable(){
    let kernel = this

    _.forEach(Memory.wolffOS.processTable, function(entry){
      if(processTypes[entry.type]){
        //kernel.processTable.push(new processTypes[entry.type](entry, kernel))
        kernel.processTable[entry.name] = new processTypes[entry.type](entry, kernel)
      }else{
        kernel.processTable[entry.name] = new Process(entry, kernel)
      }
    })
  }

  /** Tear down the OS ready for the end of the tick */
  teardown(stats = true){
    let list: SerializedProcess[] = []
    _.forEach(this.processTable, function(entry){
      if(!entry.completed)
        list.push(entry.serialize())
    })

    if(stats)
    {
      Stats.build(this);
    }
    Memory.wolffOS.processTable = list
  }

  /** Returns the highest priority process in the process table */
  getHighestProcess()
  {
    let toRunProcesses = _.filter(this.processTable, function(entry) {
        return (!entry.ticked && entry.suspend === false);
      });

    return _.sortBy(toRunProcesses, 'priority').reverse[0];
  }

  /** Run the highest priority process in the process table */
  runProcess(){
    let process = this.getHighestProcess()
    let cpuUsed = Game.cpu.getUsed()
    let faulted = false
    try{
      process.init(this);
      process.run(this)

    }catch (e){
      console.log('process ' + process.name + ' failed with error ' + e)
      faulted = true
    }

    this.execOrder.push({
      name: process.name,
      cpu: Game.cpu.getUsed() - cpuUsed,
      type: process.type,
      faulted: faulted
    })

    process.ticked = true
  }

  /** Add a process to the process table */
  addProcess<T extends ProcessTypes>(
    processClass: T,
    name: string,
    priority: number,
    meta: MetaData[T],
    parent?: string | undefined)
  {
    let process = new processTypes[processClass]({
      name: name,
      priority: priority,
      metaData: meta,
      suspend: false,
      parent: parent
    }, this)

    this.processTable[name] = process
  }

  /** Add a process to the process table if it does not exist */
  addProcessIfNotExist<T extends ProcessTypes>(
    processClass: T,
    name: string,
    priority: number, meta: MetaData[T])
  {
    if(!this.hasProcess(name)){
      this.addProcess(processClass, name, priority, meta)
    }
  }

  /** No operation */
  noop(){}

  /** Send message to another process */
  sendIpc(sourceProcess: string, targetProcess: string, message: any)
  {
    let ipcMsg = _.find(this.ipc, (msg) => {
      if(msg.from === sourceProcess && msg.to === targetProcess)
      {
        return msg;
      }
      return;
    })

    if(ipcMsg == undefined)
    {
      this.ipc.push({
        from: sourceProcess,
        to: targetProcess,
        message: message,
        read: false
      })
    }

    console.log('IPC', this.ipc.length);
  }

  /** Get ipc messages for the given process */
  getIpc(targetProcess: string){
    //console.log('IPC get', this.ipc.length);
    _.forEach(this.ipc, (i) => {
    //  console.log('IPC list', i.to);
    })
    let index =  _.findIndex(this.ipc, function(entry){
      if(entry.to == targetProcess)
      {
        return entry;
      }
      return;
    });

    //console.log('IPC get', 2, index);
    if(index >= 0)
    {
      this.ipc[index].read = true;
      return this.ipc[index];
    }
    return;
  }

  getProcess<T extends ProcessTypes>(
    processType: T,
    name: string)
  {
    let proc = this.getProcessByName(name);
    if(proc && proc.type === processType)
      return <ProcessWithTypedMetaData<T>>proc;
    else
      return false;
  }

  /** get a process by name */
  getProcessByName(name: string){
    return this.processTable[name]
  }

  /** wait for the given process to complete and then runs cb */
  waitForProcess(name: string, thisArg: Process, cb: () => void){
    let proc = this.getProcessByName(name)

    if(!proc || proc.completed){
      cb.call(thisArg)
    }
  }

  /** does the given process exist in the process table */
  hasProcess(name: string): boolean{
    return (!!this.getProcessByName(name))
  }

  /** output a message to console */
  log(proc: Process, message: any){
    console.log('[' + proc.name + '] ' + message)
  }

  /** Remove the process if it exists */
  removeProcess(name: string){
    if(this.hasProcess(name)){
      let proc = this.getProcessByName(name)
      proc.completed = true
      proc.ticked = true
    }
  }

  getProcessByType(type: ProcessTypes)
  {
    return _.filter(this.processTable, function(process){
      return (process.type = type);
    })
  }
}
