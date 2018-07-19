import { Process } from "os/process";

export class ObservationProcess extends Process
{
    type = 'op';

    run()
    {
        if(Game.time % 20 == 0)
        {
            console.log(this.name, '555555555')
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
                            console.log(this.name, room.memory.observeTarget, retValue);
                        }
                        else
                        {
                        // Check for stuff
                        room.memory.observeTarget = this.getRandomRoom(room.name, 10);
                        }
                }

            }
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
/*
    private basicRoomCheck(roomName: string)
    {
        let room = Game.rooms[roomName];
        if(room)
        {
            if(room.controller && !room.controller.my)
            {
                room.memory.Information.owner = room.controller.owner.username;
                room.memory.Information.level = room.controller.level;
            }


            room.memory.Information.sourceCount = room.find(FIND_SOURCES).length;

            let minerals = room.find(FIND_MINERALS);
            if(minerals.length)
            {
                let mineral = minerals[0];
                room.memory.Information.mineralType = mineral.mineralType;
            }
        }
    }
*/
}
