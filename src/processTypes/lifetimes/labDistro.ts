import { LifetimeProcess } from "os/process";


export class LabDistroLifetimeProcess extends LifetimeProcess
{
  type = 'labdlf';
  metaData: LabDistroLifetimeProcessMetaData;


  creep: Creep | undefined;
  reagentLabs: StructureLab[] | undefined;
  productLabs: StructureLab[] | undefined;
  terminal: StructureTerminal | undefined;
  storage: StructureStorage | undefined;
  nuker: StructureNuker | undefined;
  labProcess?: LabProcess;
  room: Room;

  run()
  {
    this.creep = this.getCreep();

    if(!this.creep)
    {
      return;
    }
  }

}
