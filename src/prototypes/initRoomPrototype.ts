import { WorldMap } from "lib/WorldMap";

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

    StructureObserver.prototype._observeRoom = StructureObserver.prototype.observeRoom;

    StructureObserver.prototype.observeRoom = function(roomName: string, purpose = "unknown", override = false): ScreepsReturnCode
    {
       let makeObservation = (observation: Observation): ScreepsReturnCode => {
           this.observation;
           this.room.memory.observation = observation;
           this.alreadyObserved = true;
           return this._observeRoom(observation.roomName);
       };

       if(override)
       {
           return makeObservation({roomName: roomName, purpose: purpose});
       }
       else
       {
           if(!this.room.memory.obsQueue)
           {
               this.room.memory.obsQueue = [];
           }
           let queue = this.room.memory.obsQueue as Observation[];
           if(!_.find(queue, (item) => item.purpose === purpose))
           {
               queue.push({purpose: purpose, roomName: roomName});
           }
           if(!this.alreadyObserved)
           {
               return makeObservation(queue.shift());
           }
           else
           {
               return OK;
           }
       }
    };
}

