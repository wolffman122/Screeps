import {Process} from '../../os/process';

interface UpgradeProcessMetaData{
  creep: string;
}

export class UpgradeProcess extends Process{
  metaData: UpgradeProcessMetaData;
  type = 'upgrade';

  run(){
    let creep = Game.creeps[this.metaData.creep];

    if (!creep || _.sum(creep.carry) === 0){
      this.completed = true;
      this.resumeParent();
      return;
    }

    if (!creep.pos.inRangeTo(creep.room.controller!, 3)){
      creep.travelTo(creep.room.controller!);
    }else{
      creep.upgradeController(creep.room.controller!);
    }
  }
}
