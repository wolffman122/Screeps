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
}
