/* Returns a list of rooms to path through from start_room to end_room */
var getMapPath = function(start_room,end_room,opts = {}) {
    _.defaults(opts,{
        avoidSK: true,          //Avoid SK rooms
        avoidHostile: true,     //Avoid rooms that have been blacklisted
        preferOwn: true,        //Prefer to path through claimed/reserved rooms
        preferHW: true,         //Prefer to path through Highways
        preferRooms: [],        //Prefer to path through a specific list of rooms
        avoidRooms: [],         //Avoid pathing through a specific list of rooms
    });
    let ret = Game.map.findRoute(start_room,end_room, {
        routeCallback: (roomName) => {
            if (opts.avoidRooms.length > 0) {
                //NOTE: This is above opts.preferRooms --> so will overwrite any preferRooms
                if (opts.avoidRooms.includes(roomName)) {
                    // Avoid pathing through specific rooms
                    return 8.0;
                }
            }

            if (opts.preferRooms.length > 0) {
                if (opts.preferRooms.includes(roomName)) {
                    // Prefer to path through specific rooms
                    return 1.0;
                }
            }

            if (opts.avoidHostile && Memory.hostile_rooms[roomName] && roomName !== start_room && roomName !== end_room) {
                // Avoid hostile rooms
                return Number.POSITIVE_INFINITY;
            }

            if (opts.preferOwn && Memory.empire_rooms[roomName]) {
                // Prefer to path through my own rooms
                return 1.5;
            }

            let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
            let fMod = parsed[1] % 10;
            let sMod = parsed[2] % 10;
            let isSK = !(fMod === 5 && sMod === 5) &&
                ((fMod >= 4) && (fMod <= 6)) &&
                ((sMod >= 4) && (sMod <= 6));
            if (opts.avoidSK && isSK) {
                // Avoid SK rooms
                return 8.0;
            }

            let isHW = (fMod === 0 || sMod === 0);
            if (opts.preferHW && isHW) {
                // Prefer to path through highways
                return 2.0;
            }

            // Default weight
            return 3.0;
        },
    });

    return ret;
};