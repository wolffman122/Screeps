// Returns the n-th step along an ulam spiral
global.ulamSpiral = function (n) {
  // Note - The spiral paths counter-clockwise: (0,0) (0,1) (-1,1) (-1,0) ...
  let p = Math.floor(Math.sqrt(4 * n + 1));
  let q = n - Math.floor(p * p / 4);
  let sq = Math.floor((p + 2) / 4);
  let x = 0;
  let y = 0;
  if (p % 4 === 0) {
    // Bottom Segment
    x = -sq + q;
    y = -sq;
  } else if (p % 4 === 1) {
    // Right Segment
    x = sq;
    y = -sq + q;
  } else if (p % 4 === 2) {
    // Top Segment
    x = sq - q - 1;
    y = sq;
  } else if (p % 4 === 3) {
    // Left Segment
    x = -sq;
    y = sq - q;
  }

  return { x: x, y: y, sq: sq };
};

// Returns an array of 'open' room positions within range of the origin position
global.getOpenPositions = function (origin_pos, range, opts = {}) {
  _.defaults(opts, {
    offset: 0,
    ignoreIds: [],
    maxPositions: 9999,
    avoidEdges: 0,
    avoidStructures: [],
    avoidTerrain: ['wall'],
    avoidCreeps: false,
    avoidConstructionSites: false,
  });
  let open_positions = [];

  let room_name = origin_pos.roomName;

  let low_edge = 0 + opts.avoidEdges;
  let high_edge = 49 - opts.avoidEdges;

  let n = opts.offset;
  let ret = null;
  let results = [];
  let res = null;
  let ch_x = 0;
  let ch_y = 0;
  let room = null;
  let room_pos = null;
  let has_blocker = false;

  while (true) {
    ret = ulamSpiral(n);
    n += 1;

    if (ret.sq > range) {
      break;
    }

    ch_x = origin_pos.x + ret.x;
    ch_y = origin_pos.y + ret.y;

    if (ch_x < low_edge || ch_x > high_edge) {
      continue;
    } else if (ch_y < low_edge || ch_y > high_edge) {
      continue;
    }

    if (opts.avoidTerrain.length > 0) {
      if (opts.avoidTerrain.includes(Game.map.getTerrainAt(ch_x, ch_y, room_name))) {
        continue;
      }
    }

    room = Game.rooms[room_name];
    if (room) {// Only make these checks if we have vision!
      if (opts.avoidStructures.length > 0) {
        has_blocker = false;
        results = room.lookForAt(LOOK_STRUCTURES, ch_x, ch_y);
        for (res of results) {
          if (opts.ignoreIds.includes(res.id)) {
            continue;
          }

          if (OBSTACLE_OBJECT_TYPES.includes(res.structureType)) {
            has_blocker = true;
            break;
          } else if (opts.avoidStructures.includes(res.structureType)) {
            has_blocker = true;
            break;
          }
        }
        if (has_blocker) {
          continue;
        }
      }

      if (opts.avoidCreeps) {
        has_blocker = false;
        results = room.lookForAt(LOOK_CREEPS, ch_x, ch_y);
        for (res of results) {
          if (opts.ignoreIds.includes(res.id)) {
            continue;
          }

          has_blocker = true;
          break;
        }
        if (has_blocker) {
          continue;
        }
      }

      if (opts.avoidConstructionSites) {
        has_blocker = false;
        results = room.lookForAt(LOOK_CONSTRUCTION_SITES, ch_x, ch_y);
        for (res of results) {
          if (opts.ignoreIds.includes(res.id)) {
            continue;
          }

          has_blocker = true;
          break;
        }
        if (has_blocker) {
          continue;
        }
      }
    }

    room_pos = new RoomPosition(ch_x, ch_y, room_name);
    open_positions.push(room_pos);

    if (open_positions.length >= opts.maxPositions) {
      break;
    }
  }

  return open_positions
};

/**
 * Generalized target locking function for actors with memory.
 *
 * Valid actors include creeps, flags, and structures if you assign them memory.
 *
 * The selector function picks all available candidates, but only runs during
 * the target selection phase. This is where your CPU heavy work should go.
 *
 * The validator function is ran for each candidate, and once per call to
 * ensure the target is still valid for use, so you want this function to be as
 * cheap as possible. The parameter is technically optional, with all values
 * being considered valid. But then why are you using this?
 *
 * The chooser function is ran once at the end of target selection, to pick
 * which of the valid candidates you want to use. This parameter is optional,
 * defaulting to the first item in the array if omitted. It expects a single
 * result so opt for a _.min or _.max over a sort.
 *
 * The prop parameter is the key used to store the target's id in memory. This
 * optionally allows us to have multiple target locks with different names.
 *
 * @param function selector - Gets a list of target candidates
 * @param function validator - Check if a target is still valid
 * @param function chooser - Pick the best target from the list
 * @param string prop - Property name in memory to store the target id
 */
RoomObject.prototype.getTarget = function (selector, validator = _.identity, chooser = _.first, prop = 'tid') {
  var tid = this.memory[prop];
  var target = Game.getObjectById(tid);
  if (target == null || !validator(target)) {
    var candidates = _.filter(selector.call(this, this), validator);
    if (candidates && candidates.length)
      target = chooser(candidates, this);
    else
      target = null;
    if (target)
      this.memory[prop] = target.id;
    else
      delete this.memory[prop];
  }
  if (target)
    target.room.visual.line(this.pos, target.pos, { lineStyle: 'dashed', opacity: 0.5 });
  return target;
}

/**
 * Similar to getTarget, but ensures no other actor is assigned to this target.
 *
 * @param function selector - Gets a list of target candidates
 * @param function restrictor - Called at start of target selection, expected to return array of invalid targets
 * @param function validator - Check if a target is still valid
 * @param function chooser - Pick the best target from the list
 * @param string prop - Property name in memory to store the target id
 */
RoomObject.prototype.getUniqueTarget = function (selector, restrictor, validator = _.identity, chooser = _.first, prop = 'tid') {
  var tid = this.memory[prop];
  var target = Game.getObjectById(tid);
  if (target == null || !validator(target)) {
    this.clearTarget(prop);
    var invalid = restrictor.call(this, this) || [];
    var candidates = _.filter(selector.call(this, this), x => validator(x) && !invalid.includes(x.id));
    if (candidates && candidates.length)
      target = chooser(candidates, this);
    else
      target = null;
    if (target)
      this.memory[prop] = target.id;
    // console.log(`New target on tick ${Game.time}: ${target}`);
  }
  if (target)
    target.room.visual.line(this.pos, target.pos, { lineStyle: 'dashed', opacity: 0.5 });
  return target;
}

RoomObject.prototype.clearTarget = function (prop = 'tid') {
  // delete this.memory[prop];
  this.memory[prop] = undefined;
}

Creep.prototype.getRepairTarget = function () {
  return this.getTarget(
    ({ room, pos }) => room.find(FIND_STRUCTURES),
    (structure) => structure.hits < structure.hitsMax,
    (candidates) => _.min(candidates, 'hits')
  );
}

Creep.prototype.getLoadedContainerTarget = function () {
  return this.getTarget(
    ({ room, pos }) => room.find(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_CONTAINER }),
    (container) => container.store.getUsedCapacity() > 0,
    (containers) => _.max(containers, c => container.store.getUsedCapacity())
  )
}
