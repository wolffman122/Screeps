import { ErrorMapper } from "utils/ErrorMapper";
import "./lib/Traveler"
import {Kernel} from './os/kernel'
import { Traveler } from "./lib/Traveler";
import "creep.extensions";
import "roomPosition.extensions";
import "utils/constants";
import { initRoomPrototype } from "prototypes/initRoomPrototype";

Creep.prototype.fixMyRoad = function()
{
  if(this.carry.energy === 0)
  {
    return false;
  }

  let repairPower = this.getActiveBodyparts(WORK) * REPAIR_POWER;

  if(repairPower === 0)
  {
    return false;
  }
  let terrain = this.pos.lookFor(LOOK_TERRAIN);
  let found = this.pos.lookFor(LOOK_STRUCTURES);
  var road = _.filter(found, (f: Structure) => {
              if(f.structureType === STRUCTURE_ROAD)
              {
                if(terrain)
                {
                  let t = terrain[0] as Terrain;
                  if(t !== "wall")
                    return f;
                }
                else
                  return;
              }
              else
              {
                return;
              }
            })[0] as StructureRoad;

  if(!road)
  {
    return false;
  }

  var toFix = road.hitsMax - road.hits;
  this.repair(road);

  return toFix - repairPower > repairPower;
}

global.conLog = (message: string) => {
  global.displayOldProcesses = true;
}

global.WOS_HARVEST_PROCESS = 'harvest'
global.WOS_HARVESTER_LIFETIME_PROCESS = 'hlf'
global.WOS__PROCESS = 'lhlf'
global.WOS__PROCESS = 'em'
global.WOS__PROCESS = 'move'
global.WOS__PROCESS = 'roomData'
global.WOS__PROCESS = 'upgrade'
global.WOS__PROCESS = 'ulf'
global.WOS__PROCESS = 'blf'
global.WOS__PROCESS = 'repair'
global.WOS__PROCESS = 'rlf'
global.WOS__PROCESS = 'sm'
global.WOS__PROCESS = 'suspend'
global.WOS__PROCESS = 'td'
global.WOS__PROCESS = 'tr'
global.WOS__PROCESS = 'dm'
global.WOS__PROCESS = 'rdmp'
global.WOS__PROCESS = 'rdlf'
global.WOS__PROCESS = 'dmp'
global.WOS__PROCESS = 'dislf'
global.WOS__PROCESS = 'dismantle'
global.WOS__PROCESS = 'rblf'
global.WOS__PROCESS = 'claim'
global.WOS__PROCESS = 'hrm'
global.WOS__PROCESS = 'holdlf'
global.WOS__PROCESS = 'hold'
global.WOS__PROCESS = 'holdBuilderlf'
global.WOS__PROCESS = 'holdHarvesterlf'
global.WOS__PROCESS = 'holdDistrolf'
global.WOS__PROCESS = 'holderDefenderlf'
global.WOS__PROCESS = 'transfer'
global.WOS__PROCESS = 'lm'
global.WOS__PROCESS = 'slf'
global.WOS__PROCESS = 'slf2'
global.WOS__PROCESS = 'holdWorkerlf'
global.WOS__PROCESS = 'udlf'
global.WOS__PROCESS = 'minerals'
global.WOS__PROCESS = 'mhlf'
global.WOS__PROCESS = 'mineral-harvest'
global.WOS__PROCESS = 'mdlf'
global.WOS__PROCESS = 'acmp'
global.WOS__PROCESS = 'market'
global.WOS__PROCESS = 'terminal'
global.WOS__PROCESS = 'bamp'
global.WOS__PROCESS = 'healAttack'
global.WOS__PROCESS = 'calf'
global.WOS__PROCESS = 'mineralTerminal'
global.WOS__PROCESS = 'labm'
global.WOS__PROCESS = 'labdlf'
global.WOS__PROCESS = 'sign'
global.WOS__PROCESS = 'gamp'
global.WOS__PROCESS = 'attacklf'
global.WOS__PROCESS = 'hmp'
global.WOS__PROCESS = 'hlp'
global.WOS__PROCESS = 'dlfOpt'
global.WOS__PROCESS = 'udlfOpt'
global.WOS__PROCESS = 'hrmOpt'
global.WOS__PROCESS = 'holdHarvesterlfOpt'
global.WOS__PROCESS = 'ra'
global.WOS__PROCESS = 'ralf'
global.WOS__PROCESS = 'balf'
global.WOS__PROCESS = 'sqm'
global.WOS__PROCESS = 'heallf'
global.WOS__PROCESS = 'salf'
global.WOS__PROCESS = 'report'
global.WOS__PROCESS = 'skrmp'
global.WOS__PROCESS = 'th'
global.WOS__PROCESS = 'atmp'
global.WOS__PROCESS = 'powm'
global.WOS__PROCESS = 'deflf'
global.WOS__PROCESS = 'defend'
global.WOS__PROCESS = 'busterlf'
global.WOS__PROCESS = 'shdp'
global.WOS__PROCESS = 'omp'
global.WOS__PROCESS = 'strip'
global.WOS__PROCESS = 'stripper'
global.WOS__PROCESS = 'ahmp'
global.WOS__PROCESS = 'test'
global.WOS__PROCESS = 'powerm'
global.WOS__PROCESS = 'pclf'
global.WOS__PROCESS = 'aomp'
global.WOS__PROCESS = 'dmmp'
global.WOS__PROCESS = 'tmp'
global.WOS__PROCESS = 'temple'

global.test = "Is this global working";

global.diagnoseMemory = function() {
  var stringified = JSON.stringify(Memory);
  var startCpu = Game.cpu.getUsed();
  JSON.parse(stringified);
  var endCpu = Game.cpu.getUsed();
  console.log('============================================================');
  console.log('CPU spent on Memory parsing: ' + (endCpu - startCpu));
  var toLog = {};
  var cpuSpend = {};
  var length = 20;
  for (var property in Memory) {
      var amount = recursiveIteration(Memory[property]);
      if (amount == 0)
          continue;
      if (property.length > length) {
          length = property.length;
      }
      stringified = JSON.stringify(Memory[property]);
      startCpu = Game.cpu.getUsed();
      JSON.parse(stringified);
      endCpu = Game.cpu.getUsed();
      toLog[property] = amount;
      cpuSpend[property] = (endCpu - startCpu);
  }
  for (var prop in toLog) {
      console.log('Amount of objects stored in Memory.' + /*prop.padRight(length, ' ')*/ prop.slice() + '  : ' + toLog[prop] + '     -   ' + cpuSpend[prop].toFixed(2));
  }
  console.log('============================================================');
​
}

function recursiveIteration(object) {
  var objectCount = 0;
  for (var property in object) {
      if (object.hasOwnProperty(property)) {
          if (typeof object[property] == "object") {
              objectCount++;
              if (Array.isArray(object[property])) {
                  objectCount += object[property].length;
              } else {
                  objectCount += recursiveIteration(object[property]);
              }
          } else {
              objectCount++;
          }
      }
  }
  return objectCount;
}


initRoomPrototype();

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  console.log(`Current game tick is ${Game.time}`);

  if(Game.time === 25852130)
    global.diagnoseMemory();
  else
  {
  if(Game.time % 2000 === 0)
  {
    for(var name in Memory.creeps)
    {
      if(!Game.creeps[name])
      {
          delete Memory.creeps[name];
          console.log('Clearing non-existing creep memory:', name);
      }
    }
  }

  // Load Memory from the global object if it is there and up to date.
  if(global.lastTick && global.LastMemory && Game.time === (global.lastTick + 1)){
    delete global.Memory
    global.Memory = global.LastMemory
    RawMemory._parsed = global.LastMemory
  }else{
    Memory;
    global.LastMemory = RawMemory._parsed
    global.roomData = {}
  }
  global.lastTick = Game.time
  global.keepAmount = 20000;
  global.spreadAmount = 2000;
  global.sellAbove = 30000;

  // Create a new Kernel
  let kernel = new Kernel

  if(global.displayOldProcesses)
  {
    console.log("Testing");
    global.displayOldProcesses = false;
    //kernel.removeOldProcesses();
  }

  console.log('Start Kernel run process');
  // While the kernel is under the CPU limit
  while(kernel.underLimit() && kernel.needsToRun()){
    kernel.runProcess()
  }

  // Tear down the OS
  kernel.teardown()

  Traveler.activeStructureMatrixCache = undefined;
  Traveler.creepMatrixCache = undefined;
  //Traveler.resetStructureMatrix();
  }

});
