RoomPosition.prototype.lookForStructures = function(structureType: string): Structure
{
    let structures = this.lookFor(LOOK_STRUCTURES);
    return _.find(structures, {structureType: structureType}) as Structure;
};

RoomPosition.prototype.getPositionAtDirection = function(direction: number, range?: number): RoomPosition
{
    if(!range)
    {
        range = 1;
    }

    let x = this.x;
    let y = this.y;
    let room = this.roomName;

    if(direction === 1)
    {
        y -= range;
    }
    else if (direction === 2) {
        y -= range;
        x += range;
    }
    else if (direction === 3) {
        x += range;
    }
    else if (direction === 4) {
        x += range;
        y += range;
    }
    else if (direction === 5) {
        y += range;
    }
    else if (direction === 6) {
        y += range;
        x -= range;
    }
    else if (direction === 7) {
        x -= range;
    }
    else if (direction === 8) {
        x -= range;
        y -= range;
    }

    if(x < 0 || x > 49 || y < 0 || y > 49)
        return null;

    return new RoomPosition(x, y, room);
};


RoomPosition.prototype.isPassible = function(ignoreCreeps?: boolean): boolean
{
    if(this.isNearExit(0))
        return false;

    // look for walls
    if (_.head(this.lookFor(LOOK_TERRAIN)) !== "wall") {

        // look for creeps
        if (ignoreCreeps || this.lookFor(LOOK_CREEPS).length === 0) {

            // look for impassible structions
            if (_.filter(this.lookFor(LOOK_STRUCTURES), (struct: Structure) => {
                    return struct.structureType !== STRUCTURE_ROAD
                        && struct.structureType !== STRUCTURE_CONTAINER
                        && struct.structureType !== STRUCTURE_RAMPART;
                }).length === 0 ) {

                // passed all tests
                return true;
            }
        }
    }

    return false;
};

RoomPosition.prototype.isNearExit = function(range: number): boolean
{
    return this.x - range <= 0 || this.x + range >= 49 || this.y - range <= 0 || this.y + range >= 49;
};

RoomPosition.prototype.openAdjacentSpots = function(ignoreCreeps?: boolean): RoomPosition[]
{
    let positions = [];
    for(let i = 1; i <= 8; i++)
    {
        let testPosition = this.getPositionAtDirection(i);

        if(testPosition.isPassible(ignoreCreeps))
        {
            // passed all tests
            positions.push(testPosition);
        }
    }

    return positions;
};

RoomPosition.prototype.getOpenPositions = function(origin_pos: RoomPosition, range: number, opts?: OpenPositionsOptions) {
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
        ret = this.ulamSpiral(n);
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

        if (opts.avoidTerrain.length > 0)
        {
            const terrain = Game.map.getRoomTerrain(room_name);
            //if (_.includes(opts.avoidTerrain, (Game.map.getTerrainAt(ch_x,ch_y,room_name)))) {
            if(_.includes(opts.avoidTerrain, (terrain.get(ch_x, ch_y))))
                continue;
        }

        room = Game.rooms[room_name];
        if (room) {// Only make these checks if we have vision!
            if (opts.avoidStructures.length > 0) {
                has_blocker = false;
                results = room.lookForAt(LOOK_STRUCTURES,ch_x,ch_y);
                for (res of results) {
                    if (_.includes(opts.ignoreIds, (res.id))) {
                        continue;
                    }

                    if (_.includes(OBSTACLE_OBJECT_TYPES, res.structureType)) {
                        has_blocker = true;
                        break;
                    } else if (_.includes(opts.avoidStructures, (res.structureType))) {
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
                    if (_.includes(opts.ignoreIds, (res.id))) {
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
                    if (_.includes(opts.ignoreIds, (res.id))) {
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

RoomPosition.prototype.ulamSpiral = function(n) {
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

//RoomPosition.prototype.getOpenPositions = function(range:number, opts:OpenPositionsOptions): RoomPosition[]
//{
    /*_.defaults(opts,{
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

    let roomName = this.roomName;

    let lowEdge = 0 + opts.avoidEdges;
    let highEdge = 49 - opts.avoidEdges;

    let n = opts.offset;
    let ret = null;
    let results = [];
    let res = null;
    let ch_x = 0;
    let ch_y = 0;
    let room = null;
    let room_pos = null;
    let has_blocker = false;

    while(true)
    {
        ret = ulamSpiral(n);
        n += 1;

        if(ret.sq > range)
        {
            break;
        }

        ch_x = this.x + ret.x;
        ch_y = this.y + ret.y;

        if(ch_x < lowEdge || ch_x > highEdge)
        {
            continue;
        }
        else if (ch_y < lowEdge || ch_y > highEdge)
        {
            continue;
        }

        if(opts.avoidTerrain.length > 0)
        {
            if(opts.avoidTerrain.include(Game.map.getTerrainAt(ch_x, chy, roomName)))
            {
                continue;
            }
        }

        room = Game.rooms[roomName];
        if(room)
        {
            if(opts.avoidStructures.length > 0)
            {
                has_blocker = false;
                results = room.lookForAt(LOOK_STRUCTURES, ch_x, ch_y);
                for(res of results)
                {
                    if(_.includes(opts.ignoreIds, res.id) === true)
                    {
                        continue;
                    }
                    if(_.includes(OBSTACLE_OBJECT_TYPES, res.structureType))
                    {
                        has_blocker = true;
                        break;
                    }
                    else if(_.includes(opts.avoidStructures, res.structureType))
                    {
                        has_blocker = true;
                        break;
                    }

                    if(has_blocker)
                    {
                        continue;
                    }
                }

                if(opts.avoidCreeps)
                {
                    has_blocker = false;
                    results = room.lookForAt(LOOK_CREEPS, ch_x, ch_y);
                    for(res of results)
                    {
                        if(_.includes(opts.ignoreIds, res.id))
                        {
                            continue;
                        }

                        has_blocker = true;
                        break;
                    }

                    if(has_blocker)
                    {
                        continue;
                    }
                }

                if(opts.avoidConstructionSites)
                {
                    has_blocker = false;
                    results = room.lookForAt(LOOK_CONSTRUCTION_SITES, ch_x, ch_y);
                    for(res of results)
                    {
                        if(_.includes(opts.ignoreIds, res.id))
                        {
                            continue;
                        }

                        has_blocker = true;
                        break;
                    }

                    if(has_blocker)
                        continue;
                }
            }
        }

        room_pos = new RoomPosition(ch_x, ch_y, roomName);
        open_positions.push(room_pos);

        if(open_positions.length >= opts.maxPositions)
        {
            break;
        }
    }

    return open_positions;*/
//}
