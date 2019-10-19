export var helper = {
    pathablePosition(roomName: string): RoomPosition|undefined {
        for (let radius = 0; radius < 20; radius++) {
            for (let xDelta = -radius; xDelta <= radius; xDelta++) {
                for (let yDelta = -radius; yDelta <= radius; yDelta++) {
                    if (Math.abs(yDelta) !== radius && Math.abs(xDelta) !== radius) {
                        continue;
                    }
                    let x = 25 + xDelta;
                    let y = 25 + yDelta;
                    const terrain = Game.map.getRoomTerrain(roomName);
                    if (terrain.get(x,y) !== TERRAIN_MASK_WALL) {
                        return new RoomPosition(x, y, roomName);
                    }
                }
            }
        }
    },
}
