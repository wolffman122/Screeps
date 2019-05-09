import { Process } from "os/process";

export class ObservationProcess extends Process
{
    type = 'op';

    run()
    {
        if(this.name === 'op-E48S49')
        {
            if(Game.time % 30 === 5 )
            {
                let room = Game.rooms['E48S49'];
                if(room)
                {
                    console.log(this.name, 1)
                    let observer = room.find(FIND_STRUCTURES, {filter: s=> s.structureType === STRUCTURE_OBSERVER})[0] as StructureObserver;
                    if(observer)
                    {
                        observer.observeRoom('E50S49');
                    }
                }
            }
        }
    }

    /*private getRandomRoom(room: string, max: number) : string
    {

        let parsed = /^([WE])([0-9]+)([NS])([0-9]+)$/.exec(room);

        if(parsed)
        {
            let _we = parsed[1];
            let _we_num = +parsed[2];
            let _ns = parsed[3];
            let _ns_num = +parsed[4];

            _we_num = _we_num + Math.ceil(Math.random() * (2 * max)) - max;
            _ns_num = _ns_num + Math.ceil(Math.random() * (2 * max)) - max;
            if(_we_num < 0)
            {
                if(_we === 'W')
                {
                    _we = 'E';
                }
                else{
                    _we = 'W';
                }

                _we_num = (_we_num + 1) * -1;
            }

            if(_ns_num < 0)
            {
                if(_ns === 'N')
                {
                    _ns = 'S';
                }
                else
                {
                    _ns = 'N'
                }

                _ns_num = (_ns_num + 1)  * -1;
            }

            if(_ns_num > 60)
            {
                _ns_num = 60;
            }

            if(_we_num > 60)
            {
                _we_num = 60;
            }

           // Game.rooms[room].memory.randomN += 1;
            return _we + _we_num + _ns + _ns_num;
        }

        return room;
    }

    /private basicRoomCheck(roomName: string)
    {
        //console.log(this.name, roomName);
        let room = Game.rooms[roomName];
        if(room)
        {
            if(room.controller && !room.controller.my)
            {
                if(!Memory.observeRoom[roomName])
                {
                    Memory.observeRoom[roomName] = {};
                }

                Memory.observeRoom[roomName].sourceCount = room.find(FIND_SOURCES).length;
                let mineral = room.find(FIND_MINERALS)[0];
                if(mineral)
                {
                    Memory.observeRoom[roomName].mineralType = mineral.mineralType;
                }

                if(room.controller.owner)
                {
                    Memory.observeRoom[roomName].controllerOwner = room.controller.owner.username;
                    Memory.observeRoom[roomName].controllerLevel = room.controller.level;
                }
            }
            else if(room.find(FIND_SOURCES).length > 2)
            {
                if(!Memory.observeRoom[roomName])
                {
                    Memory.observeRoom[roomName] = {};

                    Memory.observeRoom[roomName].sourceCount = room.find(FIND_SOURCES).length;
                    let mineral = room.find(FIND_MINERALS)[0];
                    if(mineral)
                    {
                        Memory.observeRoom[roomName].mineralType = mineral.mineralType;
                    }
                }
            }
        }
    }*/
}
