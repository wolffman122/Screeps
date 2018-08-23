export class WorldMap {
    /**
     * Return missionRoom coordinates for a given Room, authored by tedivm
     * @param roomName
     * @returns {{x: (string|any), y: (string|any), x_dir: (string|any), y_dir: (string|any)}}
     */

    public static getRoomCoordinates(roomName: string): RoomCoord|undefined
    {

        let coordinateRegex = /(E|W)(\d+)(N|S)(\d+)/g;
        let match = coordinateRegex.exec(roomName);
        if (!match) return;

        let xDir = match[1];
        let x = match[2];
        let yDir = match[3];
        let y = match[4];

        return {
            x: Number(x),
            y: Number(y),
            xDir: xDir,
            yDir: yDir,
        };
    }

    public static negaDirection(dir: string): string {
        switch (dir) {
            case "W":
                return "E";
            case "E":
                return "W";
            case "N":
                return "S";
            case "S":
                return "N";
        }
    }
}
