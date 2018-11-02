import { Process } from "os/process";

export class ObservationProcess extends Process
{
    type = 'op';

    run()
    {
        if(!Memory.observeRoom)
        {
            Memory.observeRoom = {};
        }

        if(Game.time % 20 <= 1)
        {
            let room = Game.rooms[this.metaData.roomName];
            if(room && room.controller  && room.controller.level >= 8)
            {
                let observer = this.roomData().observer;


                if(observer)
                {
                    if(room.memory.observeTarget === undefined)
                    {
                        room.memory.observeTarget = this.getRandomRoom(room.name, 10);
                        console.log(this.name, room.memory.observeTarget);
                        if(room.memory.observeTarget === room.name)
                        {
                            return;
                        }
                    }

                    if(Game.rooms[room.memory.observeTarget] === undefined)
                    {
                        let retValue = observer.observeRoom(room.memory.observeTarget);
                        //console.log(this.name, room.memory.observeTarget, retValue);
                    }
                    else
                    {
                    // Check for stuff
                    if(!Memory.observeRoom[room.memory.observeTarget])
                    {
                        this.basicRoomCheck(room.memory.observeTarget);
                    }

                    room.memory.observeTarget = this.getRandomRoom(room.name, 10);
                    }
                }
            }
        }

        if(Game.time % 10000 === 0)
        {
            let index = 0;
            let roomList: string = "Need Room";
            _.filter(Object.keys(Memory.observeRoom), (or) => {
                let room = Memory.observeRoom[or];
                if(room.mineralType === RESOURCE_KEANIUM && room.sourceCount === 2)
                {
                    roomList += "\n" + index++ + or;
                }
                return;
            });

            roomList += 'Total' + index;
            Game.notify(roomList);
        }
        else if (Game.time % 10000 === 5000)
        {
            let index = 0;
            let roomList: string = "SK Need Rooms";
            _.filter(Object.keys(Memory.observeRoom), (or)=>{
                let room = Memory.observeRoom[or];
                if(room.mineralType === RESOURCE_KEANIUM && room.sourceCount > 2)
                {
                    roomList += "\n" + index++ + or;
                }
                return;
            });

            roomList += 'Total ' + index;
            Game.notify(roomList);
        }

    }

    private getRandomRoom(room: string, max: number) : string
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

    private basicRoomCheck(roomName: string)
    {
        console.log(this.name, roomName);
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
    }
}
