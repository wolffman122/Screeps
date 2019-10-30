import {LifetimeProcess} from '../../os/process'

export class DistroLifetimeProcess extends LifetimeProcess{
  type = 'dlf'

  run()
  {
    const creep = this.getCreep()
    if(!creep){ return }

    // Hibernation phase
    this.CheckHibernation(creep)


  }

  private CheckHibernation(creep: Creep)
  {
    if(creep.memory.sleep === undefined)
      creep.memory.sleep = 0;

    if(creep.room.energyAvailable != creep.room.energyCapacityAvailable)
      creep.memory.sleep = 0;

      const sources = this.roomData().sources;
      let minRegenSource = _.min(sources, (s) => { return s.ticksToRegeneration; });

      
  }
}
