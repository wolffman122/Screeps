/*Interplayer Segment Communication!
​
First off thank you Geir1983 and Issacar for working with me on this.  This is a work in progress. Please do not share this outside the clan currently
​
The first step is to select which segment you want to be public.
This can be setup by adding setMyPublicSegment([99]); This doesn't have to be 99 but whatever segment you would like.
​
*/
​
function setYPCommunicationSegment(array)
{
  if (!_.isArray(array))
    array = [array];

  RawMemory.setPublicSegments(array);
​
  for (var e in array)
    RawMemory.segments[array[e]] = makeRequestString();
}
​
function makeRequestString() {
​
    var rtrn = {
        basicTrading: {
            room: 'E1S11',
        },
    };
​
    var requests = ['X', 'U', 'L', 'Z', 'K', 'O', 'H'];
​
    for (var e in requests) {
        // Do a check here too see if you need a resource!
        if (rtrn.basicTrading[requests[e]] === undefined)
            rtrn.basicTrading[requests[e]] = false;
    }
​
    return JSON.stringify(rtrn);
}
​
/*
​
The setMyPublicSegment function will call makeRequestString - there we have an object that we parse and then set into the segment. BasicTrading is what we are working with, I have left in advancedTrading so you can see how you can add more objects for further communication. This is all it take to setup your segment - when you look at your segment 99 it should have a string that looks like :
​
{"basicTrading":{"room":"E1S11","energy":false,"H":false,"O":false,"X":false,"U":false,"L":false,"Z":false,"K":false},"advancedTrading":{"E3N15":{"K":5000,"XGHO2":100},"E1N15":{"L":5000}}}
​
Now we look learn how to look at other people's segments: Due to RawMemory.foreignSegment can be only 1 player, you cannot access all the players at once. So you need to go through an list every X ticks.
​
Fulfillment of basicTrading is at a rate of 100 minerals every X ticks. We can up this number, but currently with testing it's better to slowly balance our empires instead of vast exchanges of minerals. It's up to the player to turn off his request if he receives too much.
​
*/
function analyzeOtherPlayerSegment() {
    if (Game.shard.name !== 'shard1') return;
    // Reason this is an array instead of object, is that it's easy to use the keys in an array across multiple ticks.
    var alliedList = [
        ['Geir1983', 99],
        ['likeafox', 99],
    ];
​
​
    if (Memory.otherPlayerSegmentCount === undefined || Memory.otherPlayerSegmentCount >= alliedList.length) {
        Memory.otherPlayerSegmentCount = 0;
    }
​
// This will get the object of the player segement.
    var obj = getObjectPlayerSegment(alliedList[Memory.otherPlayerSegmentCount][0], alliedList[Memory.otherPlayerSegmentCount][1]);
    console.log(Memory.otherPlayerSegmentCount, alliedList[Memory.otherPlayerSegmentCount][0], alliedList[Memory.otherPlayerSegmentCount][1], 'Commands to segment',obj);
​
if(obj !== undefined){
    var basic = obj.basicTrading;
    console.log(basic,'basicTrading');
    if (basic !== undefined) {
        for (var resource in basic) {
            console.log('want to send ', resource,basic[resource], '@', basic.room, '#:', 100);
            if (basic[resource]) {
                    console.log('FULFILLING TERMINAL REQUEST');
            }
        }
    }
    Memory.otherPlayerSegmentCount++;
    if (Memory.otherPlayerSegmentCount >= alliedList.length) {
        Memory.otherPlayerSegmentCount = 0;
    }
    }
    RawMemory.setActiveForeignSegment(alliedList[Memory.otherPlayerSegmentCount][0], alliedList[Memory.otherPlayerSegmentCount][1]);
}
​
​
function getObjectPlayerSegment(playerName, seg) {
​
    var raw = RawMemory.foreignSegment;
​
    if (raw === undefined) {
        RawMemory.setActiveForeignSegment(playerName, seg);
        return undefined;
    }
​
    if (raw.username === playerName) {
        if (raw.data !== undefined) {
            var rtn = JSON.parse(raw.data);
            return rtn;
        }
    }
​
}
​
​
​
// This is how you track minerals
// You can use description as a way to track what comes in and fulfilles any order you have
​
​
​
function trackSegmentSharing() {
//    if (Game.time % 67 !== 0) return;
    if (Memory.segmentTransactions === undefined) {
        Memory.segmentTransactions = {
            lastIncommingTs: 0,
            lastOutgoingTs: 0,
        };
    }
    var incommingTrans = Game.market.incomingTransactions;
    var latestTransaction;
    var transaction;
    for (let id in incommingTrans) {
        transaction = incommingTrans[id];
        if (transaction.time > Memory.segmentTransactions.lastIncommingTs) {
            if (!latestTransaction) { latestTransaction = transaction.time; }
            if (!transaction.sender || transaction.order) { continue; }
//            if (transaction.description !== 'segmentTransactions') {continue; }
            let username = transaction.sender.username;
            if (username !== "likeafox" && transaction.order === undefined) {
                if (Memory.segmentTransactions[username] === undefined) { Memory.segmentTransactions[username] = {}; }
                if (Memory.segmentTransactions[username][transaction.resourceType] === undefined) { Memory.segmentTransactions[username][transaction.resourceType] = 0; }
                Memory.segmentTransactions[username][transaction.resourceType] += transaction.amount;
                // console.log("Segment sharing from " + username + " : " + transaction.amount + " " + transaction.resourceType + " at tick " + transaction.time);
            }
        } else {
            break;
        }
    }
    if (latestTransaction) { Memory.segmentTransactions.lastIncommingTs = latestTransaction; }
​
    var outgoingTrans = Game.market.outgoingTransactions;
    for (let id in outgoingTrans) {
        transaction = outgoingTrans[id];
        if (transaction.time > Memory.segmentTransactions.lastOutgoingTs) {
            if (!latestTransaction) { latestTransaction = transaction.time; }
            if (!transaction.recipient  || transaction.order) { continue; }
            let username = transaction.recipient.username;
            if (username !== "likeafox") {
                if (Memory.segmentTransactions[username] === undefined) { Memory.segmentTransactions[username] = {}; }
                if (Memory.segmentTransactions[username][transaction.resourceType] === undefined) { Memory.segmentTransactions[username][transaction.resourceType] = 0; }
                Memory.segmentTransactions[username][transaction.resourceType] -= transaction.amount;
                // console.log("Segment sharing to " + username + " : " + transaction.amount + " " + transaction.resourceType + " at tick " + transaction.time);
            }
        } else {
            break;
        }
    }
    if (latestTransaction) { Memory.segmentTransactions.lastOutgoingTs = latestTransaction; }
}
