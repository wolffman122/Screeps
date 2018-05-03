// Returns the n-th step along an ulam spiral
global.ulamSpiral = function(n) {
    // Note - The spiral paths counter-clockwise: (0,0) (0,1) (-1,1) (-1,0) ...
    let p = Math.floor(Math.sqrt(4*n+1));
    let q = n - Math.floor(p*p/4);
    let sq = Math.floor((p+2)/4);
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

    return {x:x,y:y,sq:sq};
};

// Returns an array of 'open' room positions within range of the origin position
global.getOpenPositions = function(origin_pos,range,opts = {}) {
    _.defaults(opts,{
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

    let low_edge  = 0 + opts.avoidEdges;
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
            if (opts.avoidTerrain.includes(Game.map.getTerrainAt(ch_x,ch_y,room_name))) {
                continue;
            }
        }

        room = Game.rooms[room_name];
        if (room) {// Only make these checks if we have vision!
            if (opts.avoidStructures.length > 0) {
                has_blocker = false;
                results = room.lookForAt(LOOK_STRUCTURES,ch_x,ch_y);
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
                results = room.lookForAt(LOOK_CREEPS,ch_x,ch_y);
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
                results = room.lookForAt(LOOK_CONSTRUCTION_SITES,ch_x,ch_y);
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

        room_pos = new RoomPosition(ch_x,ch_y,room_name);
        open_positions.push(room_pos);

        if (open_positions.length >= opts.maxPositions) {
            break;
        }
    }

    return open_positions
};
