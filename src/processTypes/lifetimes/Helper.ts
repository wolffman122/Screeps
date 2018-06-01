import { LifetimeProcess } from "os/process";
import { HarvestProcess } from "../creepActions/harvest";
import { BuildProcess } from "../creepActions/build";
import { UpgradeProcess } from "../creepActions/upgrade";

export class HelperLifetimeProcess extends LifetimeProcess
{
    type = 'hlp';
    metaData: HelperLifetimeProcessMetaData;

    run()
    {
      let creep = this.getCreep()
      let flag = Game.flags[this.metaData.flagName];

      if(!flag || !creep)
      {
        this.completed = true;
        return;
      }

      if(_.sum(creep.carry) === 0 && creep.room.storage && creep.room.storage.my && creep.room.storage.store.energy >= creep.carryCapacity)
      {
        if(creep.pos.isNearTo(creep.room.storage))
        {
          creep.withdraw(creep.room.storage, RESOURCE_ENERGY);
          return;
        }

        creep.travelTo(creep.room.storage);
        return;
      }

      let sites = flag.room!.find(FIND_CONSTRUCTION_SITES);
      if(sites.length > 0)
      {
        let site = sites[0];
        this.metaData.site = site.id;

        if(_.sum(creep.carry) === 0)
        {
          if(creep.pos.roomName == site.pos.roomName)
          {
            let source = site.pos.findClosestByRange(this.kernel.data.roomData[site.pos.roomName].sources)

            this.fork(HarvestProcess, 'harvest-' + creep.name, this.priority - 1, {
              creep: creep.name,
              source: source.id
            })

            return;
          }
          else
          {
              creep.travelTo(flag.pos);
              return;
          }
        }

        this.fork(BuildProcess, 'build-' + creep.name, this.priority - 1, {
            creep: creep.name,
            site: site.id
          });
      }
      else
      {
        if(_.sum(creep.carry) === 0)
        {
          let sources = _.filter(this.roomData().sources, (s)=>{
            return (s.energy > 0);
          })
          let source = creep.pos.findClosestByPath(sources);

          if(source)
          {
            this.fork(HarvestProcess, 'harvest-' + creep.name, this.priority - 1, {
              source: source.id,
              creep: creep.name
            })
          }
        }

        if(_.sum(creep.carry) !== 0)
        {
          this.fork(UpgradeProcess, 'upgrade-' + creep.name, this.priority - 1, {
            creep: creep.name
          })
        }
      }
    }
}
