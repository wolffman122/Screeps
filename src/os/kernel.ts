import {Process} from './process'

import {InitProcess} from '../processTypes/system/init'
import {HarvestProcess} from '../processTypes/creepActions/harvest'
import {HarvesterLifetimeProcess} from '../processTypes/lifetimes/harvester'
import {CollectProcess} from '../processTypes/creepActions/collect'
import {DeliverProcess} from '../processTypes/creepActions/deliver'
import {DistroLifetimeProcess} from '../processTypes/lifetimes/distro'
import {EnergyManagementProcess} from '../processTypes/management/energy'
import {MoveProcess} from '../processTypes/creepActions/move'
import {RoomDataProcess} from '../processTypes/roomData'
import {UpgradeProcess} from '../processTypes/creepActions/upgrade'
import {UpgraderLifetimeProcess} from '../processTypes/lifetimes/upgrader'
import {BuildProcess} from '../processTypes/creepActions/build'
import {BuilderLifetimeProcess} from '../processTypes/lifetimes/builder'
import {RepairProcess} from '../processTypes/creepActions/repair'
import {RepairerLifetimeProcess} from '../processTypes/lifetimes/repairer'
import {StructureManagementProcess} from '../processTypes/management/structure'
import {TowerDefenseProcess} from '../processTypes/buildingProcesses/towerDefense'
import {TowerRepairProcess} from '../processTypes/buildingProcesses/towerRepair'
import {SuspensionProcess} from '../processTypes/system/suspension'

import {DefenseManagementProcess} from '../processTypes/management/defense'
import {DefenderLifetimeProcess} from '../processTypes/lifetimes/defender'
import {DefendProcess} from '../processTypes/creepActions/defend'

import {RemoteMinerLifetimeProcess} from '../processTypes/lifetimes/remoteMiner'
import {RemoteMiningManagementProcess} from '../processTypes/management/remoteMining'

import {RemoteDefenseManagementProcess} from '../processTypes/management/remoteDefense'
import {RemoteDefenderLifetimeProcess} from '../processTypes/lifetimes/remoteDefender'

import {DismantleManagementProcess} from '../processTypes/management/dismantle'
import {DismantleLifetimeProcess} from '../processTypes/lifetimes/dismantler'
import {DismantleProcess} from '../processTypes/creepActions/dismantle'

import {RemoteBuilderLifetimeProcess} from '../processTypes/lifetimes/remoteBuilder'
import {ClaimProcess} from '../processTypes/empireActions/claim'

import { HoldRoomManagementProcess } from 'processTypes/management/holdRoom';
import { TransferProcess} from '../processTypes/empireActions/transfer'

/*
import {HoldRoomProcess} from '../processTypes/empireActions/hold'
import {HoldProcess} from '../processTypes/creepActions/hold'
import {MineralHarvestProcess} from '../processTypes/creepActions/mineralHarvest'
import {MineralharvesterLifetimeProcess} from '../processTypes/lifetimes/mineralHarvester'
import {MineralManagementProcess} from '../processTypes/management/mineral'



import {RoomLayoutProcess} from '../processTypes/management/roomLayout'
*/


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
import { BounceAttackProcess } from 'processTypes/management/bounceAttack';
import { HealAttackProcess } from 'processTypes/management/healAttack';
import { ControllerAttackLifetimeProcess } from 'processTypes/lifetimes/controllerAttack';
import { MinetalTerminalManagementProcess } from 'processTypes/buildingProcesses/mineralTerminal';
import { LabManagementProcess } from 'processTypes/management/lab';
import { LabDistroLifetimeProcess } from 'processTypes/lifetimes/labDistro';



const processTypes = <{[type: string]: any}>{
  'harvest': HarvestProcess,
  'hlf': HarvesterLifetimeProcess,
  'lhlf': LinkHarvesterLifetimeProcess,
  'collect': CollectProcess,
  'deliver': DeliverProcess,
  'dlf': DistroLifetimeProcess,
  'em': EnergyManagementProcess,
  'move': MoveProcess,
  'roomData': RoomDataProcess,
  'upgrade': UpgradeProcess,
  'ulf': UpgraderLifetimeProcess,
  'build': BuildProcess,
  'blf': BuilderLifetimeProcess,
  'repair': RepairProcess,
  'rlf': RepairerLifetimeProcess,
  'sm': StructureManagementProcess,
  'suspend': SuspensionProcess,
  'td': TowerDefenseProcess,
  'tr': TowerRepairProcess,
  'dm': DefenseManagementProcess,
  'deflf': DefenderLifetimeProcess,
  'defend': DefendProcess,
  'rmlf': RemoteMinerLifetimeProcess,
  'rmmp': RemoteMiningManagementProcess,
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
  'transfer': TransferProcess,
  'lm': LinkManagementProcess,
  'slf': SpinnerLifetimeProcess,
  'holdWorkerlf': HoldWorkerLifetimeProcess,
  'udlf': UpgradeDistroLifetimeProcess,
  'minerals': MineralManagementProcess,
  'mhlf' : MineralHarvesterLifetimeProcess,
  'mineral-harvest': MineralHarvest,
  'mdlf': MineralDistroLifetimeProcess,
  'acmp': AttackControllerManagementProcess,
  'mmp': MarketManagementProcess,
  'terminal' : TerminalManagementProcess,
  'bounce' : BounceAttackProcess,
  'healAttack' : HealAttackProcess,
  'calf' : ControllerAttackLifetimeProcess,
  'mineralTerminal': MinetalTerminalManagementProcess,
  'labm': LabManagementProcess,
  'labdlf': LabDistroLifetimeProcess
  /*



  'holdRoom': HoldRoomProcess,
  'hold': HoldProcess,
  'mh': MineralHarvestProcess,
  'mhlf': MineralharvesterLifetimeProcess,
  'mineralManagement': MineralManagementProcess,






  'roomLayout': RoomLayoutProcess,

  */
}

interface KernelData{
  roomData: {
    [name: string]: RoomData
  }
  usedSpawns: string[]
}

interface ProcessTable{
  [name: string]: Process
}

export class Kernel{
  /** The CPU Limit for this tick */
  limit = Game.cpu.limit * 0.9
  /** The process table */
  processTable: ProcessTable = {}

  toRunProcesses?: string[]

  /** IPC Messages */
  ipc: IPCMessage[] = []

  processTypes = processTypes

  data = <KernelData>{
    roomData: {},
    usedSpawns: []
  }

  execOrder: {}[] = []
  suspendCount = 0
  schedulerUsage = 0;

  /**  Creates a new kernel ensuring that memory exists and re-loads the process table from the last. */
  constructor(){
    if(!Memory.wolffOS)
    {
      Memory.wolffOS = {}
    }

    this.loadProcessTable()

    this.addProcess(InitProcess, 'init', 99, {})
  }

  /** Check if the current cpu usage is below the limit for this tick */
  underLimit(){
    return (Game.cpu.getUsed() < this.limit)
  }

  /** Is there any processes left to run */
  needsToRun(){
    if(this.toRunProcesses && this.toRunProcesses.length > 0)
    {
      return true;
    }
    else
    {
      return _.filter(this.processTable, function(process) {
        return (!process.ticked && process.suspend === false)
      }).length > 0
    }
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

    //if(this.data.usedSpawns.length != 0){
    //  console.log(this.execOrder.length)
    //}


    if(stats)
    {
      Stats.build(this);
    }


    Memory.wolffOS.processTable = list
  }

  /** Returns the highest priority process in the process table */
  getHighestProcess()
  {
    let cpu = Game.cpu.getUsed()

    if(!this.toRunProcesses || this.toRunProcesses.length === 0)
    {
      let toRunProcesses = _.filter(this.processTable, function(entry) {
        return (!entry.ticked && entry.suspend === false);
      });

      let sorted = _.sortBy(toRunProcesses, 'priority').reverse();
      this.toRunProcesses = _.map(sorted, 'name');
    }

    let name = this.toRunProcesses.shift()!;

    this.schedulerUsage += Game.cpu.getUsed() - cpu;

    return this.processTable[name!];
  }

  /** Run the highest priority process in the process table */
  runProcess(){
    let process = this.getHighestProcess()
    let cpuUsed = Game.cpu.getUsed()
    let faulted = false

    try{
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
  addProcess(processClass: any, name: string, priority: number, meta: {}, parent?: string | undefined){
    let process = new processClass({
      name: name,
      priority: priority,
      metaData: meta,
      suspend: false,
      parent: parent
    }, this)

    //console.log("Add process ", name);
    this.processTable[name] = process
    this.toRunProcesses = [];
  }

  /** Add a process to the process table if it does not exist */
  addProcessIfNotExist(processClass: any, name: string, priority: number, meta: {}){
    if(!this.hasProcess(name)){
      this.addProcess(processClass, name, priority, meta)
    }
  }

  /** No operation */
  noop(){}

  /** Send message to another process */
  sendIpc(sourceProcess: string, targetProcess: string, message: object){
    this.ipc.push({
      from: sourceProcess,
      to: targetProcess,
      message: message
    })
  }

  /** Get ipc messages for the given process */
  getIpc(targetProcess: string){
    return _.filter(this.ipc, function(entry){
      return (entry.to == targetProcess)
    })
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
}
