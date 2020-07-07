import { WorldMap } from "lib/WorldMap";
import { Kernel } from "os/kernel";

export function initRoomPrototype() {

    /**
     * Returns missionRoom coordinates for a given missionRoom
     * @returns {*}
     */

    Object.defineProperty(Room.prototype, "coords", {
        get: function myProperty() {
            if (!this.memory.coordinates) {
                this.memory.coordinates = WorldMap.getRoomCoordinates(this.name);
            }
            return this.memory.coordinates;
        }
    });

    // StructureObserver.prototype._observeRoom = StructureObserver.prototype.observeRoom;

    // StructureObserver.prototype.observeRoom = function(roomName: string, purpose = "unknown", override = false): ScreepsReturnCode
    // {
    //    let makeObservation = (observation: Observation): ScreepsReturnCode => {
    //        this.observation;
    //        this.room.memory.observation = observation;
    //        this.alreadyObserved = true;
    //        return this._observeRoom(observation.roomName);
    //    };

    //    if(override)
    //    {
    //        return makeObservation({roomName: roomName, purpose: purpose});
    //    }
    //    else
    //    {
    //        //console.log('observe', 1)
    //        if(!this.room.memory.obsQueue)
    //        {
    //         //console.log('observe', 2)
    //            this.room.memory.obsQueue = [];
    //        }
    //        let queue = this.room.memory.obsQueue as Observation[];
    //        if(!_.find(queue, (item) => item.purpose === purpose))
    //        {
    //         //console.log('observe', 3)
    //            queue.push({purpose: purpose, roomName: roomName});
    //        }
    //        if(!this.alreadyObserved)
    //        {
    //            const item = queue.shift();
    //         //console.log('observe', 4, item.purpose, item.room, item.roomName)
    //            return makeObservation(item);
    //        }
    //        else
    //        {
    //         //console.log('observe', 5)
    //            return OK;
    //        }
    //    }
    // };

    Object.defineProperty(StructureObserver.prototype, "observation", {
        get: function() {
            if (!this._observation) {
                let observation = this.room.memory.observation as Observation;
                if (observation) {
                    let room = Game.rooms[observation.roomName];
                    if (room) {
                        observation.room = room;
                        this._observation = observation;
                    }
                    else {
                        // console.log("bad observation:", JSON.stringify(observation));
                    }
                }
            }
            return this._observation;
        }
    });

    Room.prototype.findStructures = function(structureType: string)//: Structure[]
    {
        // if(Memory.structures === undefined)
        //     Memory.structures = {};

        // if(!Memory.structures[this.name])
        // {
        //     Memory.structures[this.name] = _.groupBy(this.find(FIND_STRUCTURES), (s: Structure) => s.structureType);
        // }
        // return Memory.structures[this.name][structureType] || [];
    };
}

