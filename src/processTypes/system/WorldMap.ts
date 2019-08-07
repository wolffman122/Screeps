export class WorldMap
{
    public static negDirection(dir: string): string
    {
        switch(dir)
        {
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
