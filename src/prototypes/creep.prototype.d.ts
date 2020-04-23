interface Creep
{
  fixMyRoad(): boolean;
  transferEverything(target: Creep|StructureContainer|StructureStorage|StructureTerminal|StructureFactory): number;
  withdrawEverything(target: any): number;
  withdrawEverythingBut(target: any, res: ResourceConstant): number;
  yieldRoad(target: {pos: RoomPosition}, allowSwamps: boolean): number;
  idleOffRoad(anchor: {pos: RoomPosition}, maintainDistance: boolean): number;
  getFlags(identifier: string, max: Number): Flag[]
  boostRequest(boosts: string[], allowUnboosted: boolean): any
  getBodyPart(type: BodyPartConstant): boolean;
  getBodyParts(): BodyPartConstant[];
  getBodyPartBoosted(type: BodyPartConstant): boolean;
  moveDir(dir: DirectionConstant): string;
  almostFull(): boolean;
  getCost(): number;
}
