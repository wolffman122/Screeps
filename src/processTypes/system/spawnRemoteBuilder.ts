import {Process} from '../../os/process'
import {Utils} from '../../lib/utils'
import {RemoteBuilderLifetimeProcess} from '../lifetimes/remoteBuilder'

export class SpawnRemoteBuilderProcess extends Process{
  type = "spawnRemoteBuilder"

  run(){
    let site = this.metaData.site
    console.log(this.name, 'Remote life time111111111111111111111111111111111111111111111111111111111111111111111111111111');
    let flag;
    let spawnRoom;
    let controller = Game.rooms[this.metaData.roomName].controller;
    if(controller)
    {
      let looks = controller.pos.lookFor(LOOK_FLAGS);
      if(looks.length)
      {
        flag = looks[0];
        spawnRoom = flag.name.split('-')[2];
      }
    }

    // if(spawnRoom === undefined)
    //   spawnRoom = Utils.nearestRoom(this.metaData.roomName, 500);
    spawnRoom = 'E27S38';

    if(!this.kernel.hasProcess('rblf-rb-' + site)){
      let spawned = Utils.spawn(
        this.kernel,
        spawnRoom,
        'remoteWorker',
        'rb-' + Game.time,
        {}
      )

      if(spawned){
        this.kernel.addProcess(RemoteBuilderLifetimeProcess, 'rblf-rb-' + site, 70, {
          creep: 'rb-' + Game.time,
          roomName: spawnRoom,
          site: site
        })
      }
    }

    this.completed = true
  }
}
