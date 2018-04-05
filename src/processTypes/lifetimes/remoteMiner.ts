import {LifetimeProcess} from '../../os/process'
import {HarvestProcess} from '../creepActions/harvest'
import {DeliverProcess} from '../creepActions/deliver'
import {MoveProcess} from '../creepActions/move'
export class RemoteMinerLifetimeProcess extends LifetimeProcess
{
  type = 'rmlf'

  run()
  {
    let creep = this.getCreep();
    if(!creep)
    {
      return;
    }

    let flag = Game.flags[this.metaData.flag];

    if(!flag)
    {
      this.completed = true;
      return;
    }

    if(_.sum(creep.carry) === 0)
    {
      if(creep.pos.roomName == flag.pos.roomName)
      {
        let enemies = flag.room!.find(FIND_HOSTILE_CREEPS)
        if(enemies.length > 1)
        {
          flag.memory.enemies = true;
        }
        else if (enemies.length == 0)
        {
          flag.memory.enemies = false;
        }

        this.fork(HarvestProcess, 'harvest-' + creep.name, this.priority - 1, {
          source: flag.memory.source,
          creep: creep.name,
          flagName: flag.name
        });

        return;
      }
      else
      {
        this.fork(MoveProcess, 'move-' + creep.name, this.priority - 1, {
          creep: creep.name,
          pos: {
            x: flag.pos.x,
            y: flag.pos.y,
            roomName: flag.pos.roomName
          },
          range: 1
        });

        return;
      }
    }

    if(Game.rooms[this.metaData.deliverRoom].storage)
    {
      if(creep.pos.roomName == flag.pos.roomName)
      {
        let enemies = flag.room!.find(FIND_HOSTILE_CREEPS)
        if(enemies.length > 1)
        {
          flag.memory.enemies = true;
        }
        else if (enemies.length == 0)
        {
          flag.memory.enemies = false;
        }
      }

      this.fork(DeliverProcess, 'deliver-' + creep.name, this.priority - 1, {
        creep: creep.name,
        target: Game.rooms[this.metaData.deliverRoom].storage!.id,
        resource: RESOURCE_ENERGY
      });
    }
    else
    {
      let targets = [].concat(
        <never[]>this.kernel.data.roomData[this.metaData.deliverRoom].labs,
        <never[]>this.kernel.data.roomData[this.metaData.deliverRoom].generalContainers
      )


      let deliverTargets = _.filter(targets, (t: DeliveryTarget) =>{
        if(t.store)
        {
          return (_.sum(t.store) < t.storeCapacity)
        }
        else
        {
          return (t.energy < t.energy)
        }
      });

      if(deliverTargets.length > 0)
      {
        this.fork(DeliverProcess, 'deliver-' + creep.name, this.priority - 1, {
          creep: creep.name,
          target: deliverTargets[0].id,
          resource: RESOURCE_ENERGY
        });
      }
      else
      {
        this.suspend = 5;
      }
    }
  }
}
