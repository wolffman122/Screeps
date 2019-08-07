export var helper = {

    pathablePosition(roomName: string): RoomPosition
    {
        for(let radius = 0; radius < 20; radius++)
        {
            for(let xDelta = - radius; xDelta <= radius; xDelta++)
            {
                for(let yDelta = -radius; yDelta <= radius; yDelta++)
                {
                    if(Math.abs(yDelta) !== radius && Math.abs(xDelta) !== radius)
                    {
                        continue;
                    }
                    let x = 25 + xDelta;
                    let y = 25 + yDelta;
                    let terrain = Game.map.getTerrainAt(x, y, roomName);
                    if(terrain !== "wall")
                        return new RoomPosition(x, y, roomName);
                }
            }
        }
    },
};
