import { Process } from "os/process";
import { TerminalManagementProcess } from "./terminal";
import { ENERGY_KEEP_AMOUNT, MINERALS_RAW, REAGENT_LIST, KEEP_AMOUNT } from "./mineralTerminal";
import { forEach } from "lodash";

export class AllTerminalManagementProcess extends Process {
  metaData: AllTerminalManagementProcessMetaData;
  type = 'atmp'
  run() {
    if (!this.metaData.receiveStr)
      this.metaData.receiveStr = {};

    if (!this.metaData.sendStrings)
      this.metaData.sendStrings = {};

    for (const str in this.metaData.receiveStr) {
      const room = Game.rooms[str];
      if (room)
        room.visual.text(this.metaData.receiveStr[str], 5, 4, { color: 'white', align: 'left' });
      else
        delete this.metaData.receiveStr[str];
    }

    for (const str in this.metaData.sendStrings) {
      const room = Game.rooms[str];
      if (room)
        room.visual.text(this.metaData.sendStrings[str], 5, 5, { color: 'white', align: 'left' });
      else
        delete this.metaData.sendStrings[str];
    }

    // for(let c of Object.keys(COMMODITIES))
    // {
    //     const test = COMMODITIES[c];
    //     console.log(this.name, test, c);
    //     if(MINERALS_RAW.indexOf(<MineralConstant>c) === -1
    //         && c !== RESOURCE_ENERGY
    //         && c !== RESOURCE_GHODIUM)
    //         console.log(this.name, c, 'level', COMMODITIES[c].level);
    // }

    // Gathering Process
    if (Game.time % 20 === 5) {
      if (this.metaData.resources === undefined) {
        this.metaData.resources = {};
      }

      if (this.metaData.commoditiesToMove === undefined)
        this.metaData.commoditiesToMove = {};

      let regList: string[] = []
      _.forEach(Object.keys(REAGENT_LIST), (r) => {
        regList.push(r);
      });

      let resources = _.union(MINERALS_RAW, regList);
      _.forEach(Game.rooms, (r) => {
        if (r.memory.templeRoom)
          return;

        if (r.controller?.my && r.controller?.level >= 6) {
          if (this.metaData.shutDownTransfers[r.name] ?? false)
            return;

          let terminal = r.terminal;
          if (terminal?.my) {
            // Factory stuff
            const factory = this.roomInfo(r.name).factory;
            if (factory?.level) {
              // List setup
              if (!this.metaData.factoryLevelRoomList) {
                console.log(this.name, 'Factory room list false')
                this.metaData.factoryLevelRoomList = {}
              }
              else {
                if (!this.metaData.factoryLevelRoomList[factory.level]) {
                  this.metaData.factoryLevelRoomList[factory.level] = [];
                  if (this.metaData.factoryLevelRoomList[factory.level].indexOf(r.name) === -1)
                    this.metaData.factoryLevelRoomList[factory.level].push(r.name);
                }
                else {
                  if (this.metaData.factoryLevelRoomList[factory.level].indexOf(r.name) === -1)
                    this.metaData.factoryLevelRoomList[factory.level].push(r.name);
                }
              }
            }
            else if (factory) {
              if (r.name === 'E55S47')
                console.log(this.name, 'Factory no level test')
              //if(r.name === 'E55S47')
              {
                let sent = false;
                //console.log(this.name, 'Testing E55S47')
                for (const c of Object.keys(COMMODITIES)) {
                  const commodity = <ResourceConstant>c;
                  if (Object.keys(COMMODITIES[commodity].components).length === 3 && COMMODITIES[commodity].level === undefined) {
                    //console.log(this.name, 'Finding base commodities', commodity, COMMODITIES[commodity].level);
                    if (terminal.store.getUsedCapacity(commodity) > 0 && !terminal.cooldown) {
                      if (commodity === RESOURCE_CONDENSATE)
                        console.log(this.name, 'Full Terms of ', commodity, terminal.room.name);
                      if (this.metaData.factoryLevelRoomList) {
                        for (const level in this.metaData.factoryLevelRoomList) {
                          for (const roomName of this.metaData.factoryLevelRoomList[level]) {
                            const recTerminal = Game.rooms[roomName].terminal;
                            if (commodity === RESOURCE_CONDENSATE)
                              console.log(this.name, 'Sending room', terminal.room.name, terminal.store.getUsedCapacity(commodity), 'Reciving room', roomName, recTerminal?.store.getUsedCapacity(commodity));
                            if (recTerminal?.store.getUsedCapacity(commodity) < 1000) {
                              let amountNeeded = 1000 - recTerminal.store.getUsedCapacity(commodity);
                              if (recTerminal.store.getFreeCapacity() > 0 && amountNeeded) {
                                amountNeeded = (terminal.store.getUsedCapacity(commodity) > amountNeeded) ? amountNeeded : terminal.store.getUsedCapacity(commodity);
                                if (terminal.send(commodity, amountNeeded, roomName) === OK) {
                                  sent = true;
                                  console.log(this.name, 'Sending', commodity, 'from', terminal.room.name, 'to', roomName, amountNeeded);
                                  break;
                                }
                              }
                            }
                          }
                          if (sent)
                            break;
                        }
                        if (sent)
                          break;
                      }
                    }
                  }
                  //             && factory.level === COMMODITIES[c].level)
                  //             {
                  //                 if(this.metaData.commoditiesToMove[c] === undefined)
                  //                     this.metaData.commoditiesToMove[c] = [];

                  //                 const index = _.findIndex(this.metaData.commoditiesToMove[c], (ra) => {
                  //                     ra.roomName === r.name
                  //                 });

                  //                 if(index !== -1)
                  //                 {
                  //                     let data = this.metaData.commoditiesToMove[c][index];
                  //                     if(data.amount !== amount)
                  //                     {}
                  //                 }
                  //             }

                }
              }
            }

            if (r.name === 'E37S46')
              console.log(this.name, 'Factory after test')

            _.forEach(resources, (s) => {
              //console.log(this.name, s);
              let amount = terminal.store[s] === undefined ? 0 : terminal.store[s];
              let amount2 = terminal.store.getUsedCapacity(s as ResourceConstant);
              if (r.name === 'E37S46' && s === RESOURCE_CATALYZED_KEANIUM_ACID)
                console.log(this.name, 'XK problem', amount, amount2)
              if (this.metaData.resources[s] === undefined) {
                this.metaData.resources[s] = [];
              }


              let index = _.findIndex(this.metaData.resources[s], (ra) => {
                return (ra.roomName === r.name);
              });

              if (r.name === 'E37S46' && s === RESOURCE_CATALYZED_KEANIUM_ACID)
                console.log(this.name, 'XK problem', 2, index)
              if (index !== -1) {
                let data = this.metaData.resources[s][index];
                if (r.name === 'E37S46' && s === RESOURCE_CATALYZED_KEANIUM_ACID)
                  console.log(this.name, 'XK problem', 3, data.roomName, data.amount, data.terminal)
                if (data.amount !== amount) {
                  this.metaData.resources[s][index].amount = amount;
                }
              }
              else {
                const info = { roomName: r.name, amount: terminal.store[s], terminal: terminal.id };
                this.metaData.resources[s].push(info);
              }

            })
          }
        }
        else {
          _.forEach(resources, (s) => {
            let index = _.findIndex(this.metaData.resources[s], (ra) => {
              return (ra.roomName === r.name);
            });

            if (index !== -1)
              this.metaData.resources[s].splice(index, 1);
          })
        }
      });





      //console.log(this.name, Object.keys(this.metaData.resources).length)
      //_.forEach(Object.keys(this.metaData.resources), (s) => {
      //    console.log(this.name, s);
      //})

    }

    // Analyze Data

    let max: roomAmounts;
    let min: roomAmounts
    if (Game.time % 20 === 15) {
      console.log(this.name, 'Sending portinon');
      _.forEach(Object.keys(this.metaData.resources), (r: ResourceConstant) => {
        let max = _.max(this.metaData.resources[r], 'amount')
        let min = _.min(this.metaData.resources[r], 'amount')

        let minTerminal = <StructureTerminal>Game.getObjectById(min.terminal);

        let minOk = false;
        do {
          if (min.roomName === 'E36S43')
            console.log(this.name, 'H Problems', 1, this.roomInfo(min.roomName).mineral.mineralType, r)
          if (this.roomInfo(min.roomName).mineral.mineralType === r) {
            if (min.roomName === 'E36S43')
              console.log(this.name, 'H Problems', 2)
            const index = this.metaData.resources[r].indexOf(min, 0);
            if (index > -1) {
              if (min.roomName === 'E36S43')
                console.log(this.name, 'H Problems', 3)
              this.metaData.resources[r].splice(index, 1);
              min = _.min(this.metaData.resources[r], 'amount');
              if (min.roomName === 'E36S43')
                console.log(this.name, 'H Problems', 4, min.roomName)
              minTerminal = <StructureTerminal>Game.getObjectById(min.terminal);
            }
          }
          else
            minOk = true;

          if (min.roomName === 'E36S43')
            console.log(this.name, 'H Problems', 5, minOk)

        } while (!minOk);

        let minStorageOk = false;
        do {
          const storage = Game.rooms[min.roomName].storage;
          if (storage?.store[r] > KEEP_AMOUNT) {
            const index = this.metaData.resources[r].indexOf(min, 0);
            if (index > -1) {
              this.metaData.resources[r].splice(index, 1);
              min = _.min(this.metaData.resources[r], 'amount')
              minTerminal = <StructureTerminal>Game.getObjectById(min.terminal);
            }
          }
          else
            minStorageOk = true;

        } while (!minStorageOk);

        // Hopefully remove any terminals that don't have room.
        if (minTerminal?.store.getFreeCapacity() < 5000 || minTerminal.room.memory.templeRoom) {

          do {
            const index = this.metaData.resources[r].indexOf(min, 0);
            if (index > -1) {
              this.metaData.resources[r].splice(index, 1);
              min = _.min(this.metaData.resources[r], 'amount');
              minTerminal = <StructureTerminal>Game.getObjectById(min.terminal);
            }
          } while (minTerminal?.store.getFreeCapacity() < 5000)
        }

        let maxTerminal = <StructureTerminal>Game.getObjectById(max.terminal);
        if (r === RESOURCE_CATALYZED_KEANIUM_ACID) {
          console.log(this.name, r, max.roomName, max.amount);
          console.log(this.name, r, min.roomName, min.amount);
        }

        if (r === RESOURCE_ENERGY) {

        }
        else if (max.amount >= 6000 && min.amount < 5000 && minTerminal?.store.getFreeCapacity() > 0) {
          if (maxTerminal && maxTerminal.cooldown === 0) {
            let ret = maxTerminal.send(r, 5000 - min.amount, min.roomName);
            if (ret === OK) {
              const maxRoom = maxTerminal.room;
              const minRoom = minTerminal.room;
              this.metaData.sendStrings[maxRoom.name] = 'Send Information: To ' + minRoom.name + ' ' + r + ' ' + (5000 - min.amount) + ' : ' + Game.time;
              this.metaData.receiveStr[minRoom.name] = 'Recieved Information: From ' + maxRoom.name + ' ' + r + ' ' + (5000 - min.amount) + ' : ' + Game.time;
            }
            console.log('Sending', r, maxTerminal.room.name, 'to', minTerminal.room.name, 5000 - min.amount, 'Return value', ret);
          }
        }
      })
    }

    if (Game.time % 12 === 0)
      this.FactoryInventory()
  }

  FactoryInventory() {
    if (this.metaData.factoryLevelRoomList) {
      const factoryRoomLevelList = this.metaData.factoryLevelRoomList;
      for (const level in factoryRoomLevelList) {
        console.log(this.name, 'Level', level)
        for (const room of factoryRoomLevelList[level]) {
          console.log(this.name, 'Room', room);
          const receivingRoom = Game.rooms[room];
          for (const commodity of receivingRoom.memory.commoditiesForLevel) {
            const data = COMMODITIES[commodity];
            const numberOfMakes = Math.floor(POWER_INFO[PWR_OPERATE_FACTORY].cooldown / data.cooldown);
            console.log(this.name, 'Commodity', commodity, '# of Makes', numberOfMakes)
            for (const com in data.components) {
              const component = com as ResourceConstant;
              if (COMMODITIES[component].level) {
                const componentAmount = data.components[component];
                const amountNeeded = componentAmount * numberOfMakes;
                const terminal = receivingRoom.terminal;
                const storage = receivingRoom.storage;
                if (terminal && storage) {
                  console.log(this.name, '\tcomponents', component, 'Component Amount', componentAmount, 'Amount needed', amountNeeded)
                  const roomAmount = terminal.store.getUsedCapacity(component) + storage.store.getUsedCapacity(component);
                  if (roomAmount < amountNeeded) {
                    console.log(this.name, '\t\tNeed to find some', component);
                    const findData = COMMODITIES[component];
                    const lvlRooms = factoryRoomLevelList[findData.level];
                    for (let sName of lvlRooms) {
                      console.log(this.name, '\t\t\tLooking in', sName);
                      const sendRoom = Game.rooms[sName];
                      if (sendRoom.terminal) {
                        const terminal = sendRoom.terminal;
                        if (!terminal.cooldown && terminal.store.getUsedCapacity(component) >= amountNeeded) {
                          const ret = terminal.send(component, amountNeeded, room);
                          console.log(this.name, '\t\t\t', sName, 'sending', component, 'to', room, 'Retern Value', ret);
                        }
                      }

                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
