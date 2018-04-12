import { ErrorMapper } from "utils/ErrorMapper";
import "./lib/Traveler"
import {Kernel} from './os/kernel'
import { Traveler } from "./lib/Traveler";
import "creep.extensions";

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

  let found = this.pos.lookFor(LOOK_STRUCTURES);
  var road = _.filter(found, (f) => {
              if(f.structureType === STRUCTURE_ROAD)
              {
                return f;
              }
              else
              {
                return;
              }
            })[0];

  if(!road)
  {
    return false;
  }

  var toFix = road.hitsMax - road.hits;
  this.repair(road);

  return toFix - repairPower > repairPower;
}

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  console.log(`Current game tick is ${Game.time}`);

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


});
