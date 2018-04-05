import {Process} from '../../os/process'
import { Utils } from 'lib/utils';
import { DeliverProcess } from '../creepActions/deliver';
import {CollectProcess} from '../creepActions/collect';
import { MoveProcess } from 'processTypes/creepActions/move';

interface TransferProcessMetaData
{
  creep: string
  flagName: string
  sourceRoom: string
  destinationRoom: string

}
export class TransferProcess extends Process
{
  metaData: TransferProcessMetaData;
  type = 'transfer';

  run()
  {
    let flag = Game.flags[this.metaData.flagName];

    if(!flag)
    {
      this.completed = true;
      return;
    }

    let creep = Game.creeps[this.metaData.creep];

    if(!creep)
    {
      let creepName = 'transfer-' + this.metaData.destinationRoom + '-' + Game.time;
      let spawned = Utils.spawn(
        this.kernel,
        this.metaData.destinationRoom,
        'mover',
        creepName,
        {}
      );

      if(spawned)
      {
        this.metaData.creep = creepName;
      }

      return;
    }

    if(creep.room.name != this.metaData.sourceRoom)
    {
      this.fork(MoveProcess, 'move-' + creep.name, this.priority - 1, {
        creep: creep.name,
        pos: Game.flags[this.metaData.destinationRoom].pos,
        range: 3
      });

      return
    }

    if(_.sum(creep.carry) === 0)
    {
      let structures = creep.room.find(FIND_STRUCTURES);
      let targets = _.filter(structures, (s: Structure) => {
        return (s.structureType == STRUCTURE_SPAWN
                ||
                s.structureType == STRUCTURE_TOWER
                ||
                s.structureType == STRUCTURE_LINK
                ||
                s.structureType == STRUCTURE_LAB);
      });

      this.log('Target length ' + targets.length)

      let pickupTargets = _.filter(targets, function(target: DeliveryTarget){
        return (target.energy > 0);
      });

      if(pickupTargets.length === 0)
      {
        targets = [].concat(
          <never[]>this.kernel.data.roomData[creep.room.name].labs,
          <never[]>this.kernel.data.roomData[creep.room.name].generalContainers
        )

        pickupTargets = _.filter(targets, function(target: DeliveryTarget){
          if(target.store)
          {
            return (target.store.energy > 0);
          }
          else
          {
            return (target.energy > 0);
          }
        });
      }

      if(pickupTargets.length === 0 && creep.room.storage)
      {
        targets = [].concat(
          <never[]>[creep.room.storage],
        );

        pickupTargets = _.filter(targets, function(t: Storage) {
          return (t.store.energy > 0);
        })
      }

      if(pickupTargets.length === 0 && creep.room.terminal)
      {
        targets = [].concat(
          <never[]>[creep.room.terminal]
        );

        pickupTargets = _.filter(targets, function(t: Terminal) {
          return (t.store.energy > 0);
        });
      }

      let target = <Structure>creep.pos.findClosestByPath(pickupTargets);

      if(target)
      {
        this.fork(CollectProcess, 'collect-' + creep.name, this.priority - 1, {
          creep: creep.name,
          target: target.id,
          resource: RESOURCE_ENERGY
        });
      }
      else
      {
        this.log('Problem selecting a pickup target');
      }
        /*else
        {
          this.completed = true;
          this.resumeParent();
        }*/
    }


    let deliveryStorage = Game.rooms[this.metaData.destinationRoom].storage;

    if(deliveryStorage)
    {
      this.fork(DeliverProcess, 'deliver-' + creep.name, this.priority - 1, {
        creep: creep.name,
        target: deliveryStorage.id,
        resource: RESOURCE_ENERGY
      });
    }
    else
    {
      this.log("Storage destination bad");
    }


  }
}
