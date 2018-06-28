//Fox's Military Technology Trees.
I've created this on what I've developed and the order I believe they should be developed.


Mutliple actions per tick -> Include Move to all actions.
Boosting -> Multi-boosting
Smart Bodies -> Situational Bodies
Rallying spot -> Moving as pair/group
Focus/Smart Targeting
Detection of body parts -> Non-boosted Squad fighting -> Boosted Squad Fighting
Patroling -> Multi-room Patroling

(heal) Echo-Healing -> Smart Pre Healing
(ranged Attack) Flee -> Kiting -> Edge Abuse -> Rest/Healing
(attack) Chasing(massRangeAttack/Attack) -> Counter Edge Abuse -> Chasing(by id)



1. Mutliple actions per tick -> Include Move to all actions.

This technology is more just knowledge - knowing what combinations work with others. Here are some important combinations.

	Attack+Move - Attack and move to target spot to chase.

    Creep.prototype.attackMove = function(badguy, options) {

        if (_.isArray(badguy)) {
            let target = this.pos.findClosestByRange(badguy);
            badguy = target;
        }
        if (this.attack(badguy) === OK) {
            var direction = this.pos.getDirectionTo(badguy);
            var moveStatus = this.move(direction, options);
            return moveStatus;
        }
    };

	Attack+MassRangeAttack -  Good to confuse Healers.
	Range+heal - Well rounded unit

Include move to all actions. You can always move regardless of your attack/range/heal action. THis is especially important with attack and range attack.


2. Boosting -> Multi-boosting
	This technology is self explaintory - Focus on boosting 1 body part, then work on boosting all body parts.  Note - you can boost while spawning.


3. Smart Bodies -> Situational Bodies
	a = attack, m = move, t = tough, r - range, h = heal.

	Melee should be 20a/24m/5a/1m ->  So it can always chase or flee based on hp.
	Ranged should be 24m/25r/1m -> So it can always fire.
	Heal should be 24m/25h/1m -> So it can always heal.
	Notice the 1 m at the end, this is so the creeps can always run away or go to healer.

	Situational Bodies is if you start dealing witih other boosted skirmishers - or want to light boost.
	Melee - 1-5T(t3)/24m/20-25A/1m
	Range - 1-2T(t3)/24m/23-25r/1m




4. Rallying spot -> Moving as pair/group
	Rallying spot at home somewhere safe so it can pair up. I have a flag in my rooms as the roomName so I can rally there.
	Pairing up - how I implment this is have a leader/follower - leader does his thing, but won't move unless follower is pos.isNearBy; Follower uses:

		if (follower.pos.isNearTo(leader)) {
       		return follower.move(follower.pos.getDirectionTo(leader));
      	}


5. Focus/Smart Targeting
	Attack as a group, if melee attacks, see what range can assist. I don't use this much in skirmises, but a bit in siege defense.


6. Detection of body parts -> Non-boosted Squad fighting -> Boosted Squad Fighting
	Detection of body parts: enemy.getActiveBodyparts(RANGED_ATTACK)

	Know when your out matched - detect boosts -> Run away.

	function analyzeBody(body) {
    var str = 0;
    for (var e in body) {
        if (body[e].boost === undefined) {
            str++;
        } else {
            if (body[e].boost.length === 2) {
                str += 2;
            } else if (body[e].boost.length === 4) {
                str += 3;
            } else if (body[e].boost.length === 5) {
                str += 4;
            }
        }
    }
    return Math.ceil(str);
	}


7. Patroling -> Multi-room Patroling
	Start with 1 room, and patrol between two point. Then have two points in seperate rooms. If you use flags to create squads, add a var as another flag name to patrol too.

8. (heal) Echo-Healing -> Smart Healing
	Echo-healing is healing the last target of your heal- because he's going to be attacked again.
	Smart-Healing - Try to determine who will be attacked. In a seige maybe it'll be the closest to the tower, or closests to rampart.

9. (ranged Attack) Flee -> Kiting -> Edge Abuse -> Rest/Healing
	Flee . Important against melee units.
    Creep.prototype.runFrom = function(badguy, options) {

        //      if (this.memory.role === 'transport') {
        var baddies = [];
        if (_.isArray(badguy)) {
            for (var e in badguy) {
                baddies.push({ pos: badguy[e].pos, range: 5 });
            }
        } else {
            baddies.push({ pos: badguy.pos, range: 5 });
        }
        let result = PathFinder.search(this.pos, baddies, { flee: true });
        let edz = this.move(this.pos.getDirectionTo(result.path[0]));
        //        console.log(roomLink(this.room.name), 'doing new runFrom,', edz);
        if (edz === OK) {
            return true;
        } else {
            return false;
        }
    };

    Kiting - do a check for distance, if it's === 3 then don't move.

	function attackCreep(creep, bads) {
    	let enemy = creep.pos.findClosestByRange(bads);
	    let distance = creep.pos.getRangeTo(enemy);
    	    creep.smartRangedAttack();

	    if (enemy.getActiveBodyparts(RANGED_ATTACK) > 0 && enemy.getActiveBodyparts(ATTACK) === 0) { //
    	    creep.say('CHRG');
        	creep.moveMe(enemy, { maxRooms: 1, reusePath: 10 });
	    } else if (creep.hits < creep.hitsMax - 200 && enemy.getActiveBodyparts(MOVE) > 0 && distance < 3) {
    	    creep.moveToEdge();
	    } else if (distance == 3 && (enemy.getActiveBodyparts(ATTACK) > 0)) {

	    } else if ((distance > 2 || enemy.getActiveBodyparts(RANGED_ATTACK) > 0) && enemy.getActiveBodyparts(ATTACK) === 0) {
    	    creep.moveMe(enemy, { maxRooms: 1, reusePath: 10 });
    	} else if (distance < 3 && (enemy.getActiveBodyparts(RANGED_ATTACK) > 0 || enemy.getActiveBodyparts(ATTACK) > 0)) {
        	creep.moveToEdge();
    	} else {
        	creep.moveMe(enemy, { maxRooms: 1, reusePath: 10 });
    	}
	}


    Edge Abuse: Run away to the edge to confuse other AI's that are room.finding and buy more time to heal.

    Creep.prototype.moveToEdge = function(options) {
        var Exits = [FIND_EXIT_TOP,
            FIND_EXIT_RIGHT,
            FIND_EXIT_BOTTOM,
            FIND_EXIT_LEFT
        ];
        if (options === undefined) options = {};
        var closest = 100;
        var exited;

        for (var e in Exits) {
            const exit = this.pos.findClosestByRange(Exits[e]);
            var distance = this.pos.getRangeTo(exit);
            if (distance < closest) {
                closest = distance;
                exited = exit;
            }
        }
        if (exited !== undefined) {
            options.maxRooms = 1;
            this.moveMe(exited, options);
        }
    };



    Rest/healing: If you want to rest in another room to heal fully.

    Creep.prototype.moveInside = function(options) {

        if (creep.x > 47) {
            if (creep.x !== 47)
                creep.move(LEFT);

        } else if (creep.x < 3) {
            if (creep.x !== 3)
                creep.move(RIGHT);

        } else if (creep.y > 47) {
            if (creep.y !== 47)
                creep.move(TOP);

        } else if (creep.y < 3) {
            if (creep.y !== 3)
                creep.move(BOTTOM);

        } else {
            return false;
        }

        var direction = this.pos.getDirectionTo(badguy);
        var moveStatus = this.move(direction, options);
    };


10. (attack) Chasing(massRangeAttack/Attack) -> Counter Edge Abuse -> Chasing(by id)

	Chasing is just attack+massRange+move -> As above - do an action and follow it with a move to always move closer.

    Tools to Counter edge Abuse/Confusion:

    Object.defineProperty(Creep.prototype, 'isAtEdge', {
        configurable: true,
        get: function() {
            return (this.pos.x === 0 || this.pos.x === 49 || this.pos.y === 0 || this.pos.y === 49);
        }
    });

    Object.defineProperty(Creep.prototype, 'isNearEdge', {
        configurable: true,
        get: function() {
            return (this.pos.x <= 1 || this.pos.x >= 48 || this.pos.y <= 1 || this.pos.y >= 48);
        }
    });

    Chasing by ID means that you are storing the target, and still using room.find - if you don't find anything in the room, go chase the target to the next room
