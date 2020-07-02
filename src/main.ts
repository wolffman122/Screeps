import { ErrorMapper } from "utils/ErrorMapper";
import "./lib/Traveler"
import {Kernel} from './os/kernel'
import { Traveler } from "./lib/Traveler";
import "prototypes/creep";
import "roomPosition.extensions";
import "utils/constants";
import { initRoomPrototype } from "prototypes/initRoomPrototype";
import "prototypes/roomvisual";

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
  var road = found.filter((f: Structure) => {
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

global.sizeOf = (object: any) => {
  // initialise the list of objects and size
  const objects = [object];
  let size    = 0;

  // loop over the objects
  for (var index = 0; index < objects.length; index ++){

    // determine the type of the object
    switch (typeof objects[index]){

      // the object is a boolean
      case 'boolean': size += 4; break;

      // the object is a number
      case 'number': size += 8; break;

      // the object is a string
      case 'string': size += 2 * objects[index].length; break;

      // the object is a generic object
      case 'object':

        // if the object is not an array, add the sizes of the keys
        if (Object.prototype.toString.call(objects[index]) != '[object Array]'){
          for (const key in objects[index]) size += 2 * key.length;
        }

        // loop over the keys
        for (const key in objects[index]){

          // determine whether the value has already been processed
          var processed = false;
          for (let search = 0; search < objects.length; search ++){
            if (objects[search] === objects[index][key]){
              processed = true;
              break;
            }
          }

          // queue the value to be processed if appropriate
          if (!processed) objects.push(objects[index][key]);

        }

    }

  }

  // return the calculated size
  return size;
}

global.test = "Is this global working";
global.depositTypes = [RESOURCE_MIST, RESOURCE_BIOMASS, RESOURCE_METAL, RESOURCE_SILICON];
global.basicCommodities = [RESOURCE_WIRE, RESOURCE_CELL, RESOURCE_ALLOY, RESOURCE_CONDENSATE];
global[1] = {commodity: RESOURCE_EXTRACT, rooms:['E56S43']};
global.bucketCount = 0;
global.bucketTotal = 0;

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


  if(Game.cpu.bucket > 9800)
  {
    global.bucketCount++;
    global.bucketTotal += Game.cpu.bucket;
  }
  else
  {
    global.bucketCount = 0;
    global.bucketTotal = 0;
  }

  console.log('Bucket Average', global.bucketTotal / global.bucketCount, global.bucketCount);
  if(global.bucketCount >= 20 && (global.bucketTotal / global.bucketCount) >= 9950)
  {
    global.bucketCount = 0;
    global.bucketTotal = 0;
    Game.cpu.generatePixel()
    console.log('Making pixels');
  }

  //const size = global.sizeOf(Memory.rooms['E56S43']);
  //console.log("Rooms size", size);

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


});
