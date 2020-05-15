import { Process } from "os/process";
import { WorldMap } from "lib/WorldMap";

export class ObservationManagementProcess extends Process
{
  type = 'omp';
  metaData: ObservationManagementProcessMetaData;
  room: Room;
  observer: StructureObserver;

  run()
  {
    try
    {
      //console.log(this.name, 'Observation running');
      this.room = Game.rooms[this.metaData.roomName];
      this.observer = this.roomData().observer;

      if(this.metaData.observingRooms === undefined)
      {
        this.GetRoomToObserve();
        return;
      }


      let observingRooms = this.metaData.observingRooms;
      //console.log(this.name, observingRooms.length, Object.keys(this.metaData.scoredRooms).length)
      if((this.metaData.scoredRooms === undefined) || (observingRooms.length !== Object.keys(this.metaData.scoredRooms).length))
      {
        //console.log(this.name, 1)
        let index = this.metaData.scanIndex++;
        //console.log(this.name, 'Observing a room');
        this.observer.observeRoom(observingRooms[index]);
        console.log(this.name, 'Observation', this.observer.room.name);
        if(index >= observingRooms.length - 1)
        {
          this.metaData.scanIndex = 0;
        }

        let scanRoom = Game.rooms[observingRooms[index > 0 ? index - 1 : observingRooms.length -1]];
        if(scanRoom)
        {
          //console.log(this.name, 2)
          if(this.metaData.scoredRooms === undefined)
          {
            this.metaData.scoredRooms = {};
          }

          //console.log(this.name, 3);
          if(!this.metaData.scoredRooms[scanRoom.name])
          {

            let controllers = scanRoom.find(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_CONTROLLER});
            //console.log(this.name, 2, controllers.length);
            if(controllers.length)
            {
              this.metaData.scoredRooms[scanRoom.name] = {
                controllerPos: controllers[0].pos,
                sourceNumbers: this.AnalyzeRoom(scanRoom)
              };
            }
            //console.log(this.name, 3);
          }
          //console.log(this.name, scanRoom.name, this.metaData.scoredRooms[scanRoom.name]);
        }
      }

      if(this.room.memory.surroundingRooms === undefined)
      {
        this.room.memory.surroundingRooms = {};
        _.forEach(Object.keys(this.metaData.scoredRooms), (sr) => {
          if(this.room.memory.surroundingRooms[sr] === undefined)
            this.room.memory.surroundingRooms[sr] = {
              controllerPos: this.metaData.scoredRooms[sr].controllerPos,
              sourceNumbers: this.metaData.scoredRooms[sr].sourceNumbers,
              harvesting: false
            };
        })
      }

      //console.log(this.name, 'Should be done', Object.keys(this.room.memory.surroundingRooms).length);
    }
    catch(error)
    {
      console.log(this.name, 'Run', error)
    }
  }

  private GetRoomToObserve()
  {
    try
    {
      this.metaData.observingRooms = [];
      let roomNames = [];
      let coord = WorldMap.getRoomCoordinates(this.room.name);

      for(let i = coord.x - 1; i < coord.x + 2; i++)
      {
        for(let j = coord.y - 1; j < coord.y + 2; j++)
        {
          let x = i;
          let xDir = coord.xDir;
          let y = j;
          let yDir = coord.yDir;

          let name = xDir + x + yDir + y;
          if(name !== this.room.name)
          {  roomNames.push(name);
          //console.log(this.name, name);
          }
        }
      }

      if(roomNames.length === 8)
        this.metaData.observingRooms = roomNames;
    }
    catch(error)
    {
      console.log(this.name, 'GetRoomToObserve', error);
    }
  }

  private AnalyzeRoom(room: Room): number
  {
    try
    {
      const controller = room.controller;
      let hostiles = room.find(FIND_HOSTILE_CREEPS);
      //console.log(this.name, !controller?.reservation, controller.reservation?.username === 'wolffman122',  controller.level == 0)
      if(hostiles.length === 0 && ((!controller?.reservation || controller.reservation?.username === 'wolffman122') || controller.level == 0))
      {
        let numberOfSources = this.roomInfo(room.name).sources.length;
        return numberOfSources;
      }

      return 0;
    }
    catch(error)
    {
      console.log(this.name, 'AnalyzeRoom', error);
    }
  }
}
