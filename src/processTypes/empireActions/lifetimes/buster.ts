import { LifetimeProcess } from "os/process";

export class BusterLifetimeProcess extends LifetimeProcess
{
  type = 'busterlf';
  metaData: BusterLifetimeProcessMetaData;

  run()
  {
    console.log(this.name, 1, this.metaData.coreId)
    if(this.name === 'busterlf-hrm-buster-E38S53-21536249')
      this.metaData.coreId = '5daa60444b82644dbd47aa04';
    const creep = this.getCreep();
    if(!creep)
    {
      this.completed = true;
      return;
    }

    let core = Game.getObjectById(this.metaData.coreId);
    const flag = Game.flags[this.metaData.flagName];

    if(this.metaData.coreId === undefined && flag)
    {
      core = flag.room.find(FIND_HOSTILE_STRUCTURES, {filter: s => s.structureType === STRUCTURE_INVADER_CORE})[0];
      if(core instanceof StructureInvaderCore)
      {
        this.metaData.coreId = core.id;
      }
    }

    if(this.metaData.boosts && !creep.memory.boost)
    {
      creep.boostRequest(this.metaData.boosts, false);
      return;
    }

    if(core instanceof StructureInvaderCore)
    {
      if(creep.pos.isNearTo(core))
      {
        creep.attack(core);
      }
      else
      {
        creep.travelTo(core);
      }
      return;
    }
    else
    {
      if(creep.room.name !== this.metaData.spawnRoom && Game.time % 10 === 5)
      {
        let cores = creep.room.find(FIND_HOSTILE_STRUCTURES, {filter: s=> s.structureType === STRUCTURE_INVADER_CORE});
        if(cores.length)
          this.metaData.coreId = cores[0].id;
      }

      let container = this.kernel.data.roomData[this.metaData.spawnRoom].generalContainers[0];
      if(container)
      {
        if(!creep.pos.inRangeTo(container, 0))
          creep.travelTo(container);
        else
          creep.suicide();

        return;
      }
    }
  }
}
