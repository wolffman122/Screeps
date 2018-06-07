RoomPosition.prototype.lookForStructures = function(structureType: string): Structure
{
    let structures = this.lookFor(LOOK_STRUCTURES);
    return _.find(structures, {structureType: structureType}) as Structure;
}
