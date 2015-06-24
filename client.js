var now = require('performance-now');
var _ = require('underscore');

module.exports = function(){

	var client = this;

	this.initiate = function(){

		// Send the connection handshake packet to the client
		client.socket.write(packet.build(["HELLO", now().toString()]));

		console.log('Client initiated');
	};

	// Client Methods
	this.enter_room = function(room){
		maps[room].clients.forEach(function(otherClient){

			otherClient.socket.write(packet.build(["ENTER_ROOM", client.character.charactername, client.character.gender,
				client.character.hair, client.character.chest, client.character.pants,
				client.character.pos_x, client.character.pos_y]));

			client.socket.write(packet.build(["ENTER_ROOM", otherClient.character.charactername, otherClient.character.gender,
				otherClient.character.hair, otherClient.character.chest, otherClient.character.pants,
				otherClient.character.pos_x, otherClient.character.pos_y]));
		});
		maps[room].clients.push(client);
	};

	this.leave_room = function(){
		var i = 0;
		maps[client.character.current_room].clients.forEach(function(otherClient){
			// sent each client except yourself in the current room a leave packet and - 
			if(otherClient.character.charactername != client.character.charactername){
				otherClient.socket.write(packet.build(["LEAVE_ROOM", client.character.charactername]));
			}else{
				// remove current character from that map's clients array
				console.log("removing \"" + client.character.charactername + "\" from " + client.character.current_room);
				maps[client.character.current_room].clients.splice(i, 1);
			}
			i += 1;
		});
	};

	this.broadcast_room = function(packetData){
		maps[client.character.current_room].clients.forEach(function(otherClient){
			if(otherClient.character.charactername != client.character.charactername){
				(console.log("Sending POS to client\"" + otherClient.user.username + "\""));
				otherClient.socket.write(packetData);
			};
		});
	};

	// Socket stuff
	this.data = function(data){
		packet.parse(client, data);
	};

	this.error = function(err){
		console.log("Client error: " + err.toString());
	};

	this.end = function(){
		if(client.user){
			client.user.save(); // Check if logged in (could also end while in login screen)
		}
		if(client.character){ // Check if ingame (could also end while in login-screen/character selection)
			client.character.save();
			console.log("Client saved");
			var i = 0;
			maps[client.character.current_room].clients.forEach(function(otherClient){
				if(otherClient.character.charactername == client.character.charactername){
					console.log("removing \"" + client.character.charactername + "\" from " + client.character.current_room);
					maps[client.character.current_room].clients.splice(i, 1);
				};
				i += 1;
			});

		}
		
		console.log("Client closed");
	};
}
