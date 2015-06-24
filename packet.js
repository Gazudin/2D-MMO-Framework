var zeroBuffer = new Buffer('00', 'hex');
var _ = require('underscore');

module.exports = packet = {
	// Params: an array of javascript objects to be turned into buffers
	build: function(params){
		var packetParts = [];
		var packetSize = 0;

		params.forEach(function(param){
			var buffer;

			if(typeof param === 'string'){
				buffer = new Buffer(param, 'utf8');
				buffer = Buffer.concat([buffer, zeroBuffer], buffer.length + 1);
			}else if(typeof param === 'number'){
				buffer = new Buffer(2);
				buffer.writeUInt16LE(param, 0);
			}else{
				console.log("WARNING: Unknown data type in packet builder!");
			}

			packetSize += buffer.length;
			packetParts.push(buffer);
		});

		var dataBuffer = Buffer.concat(packetParts, packetSize);

		var size = new Buffer(1);
		size.writeUInt8(dataBuffer.length + 1, 0);

		var finalPacket = Buffer.concat([size, dataBuffer], size.length + dataBuffer.length);

		return finalPacket;
	},

	// Parse a packet to be handled for a client
	parse: function(c, data){
		var idx = 0;

		while(idx < data.length){
			var packetSize = data.readUInt8(idx);
			var extractedPacket = new Buffer(packetSize);
			data.copy(extractedPacket, 0, idx, idx + packetSize);

			this.interpret(c, extractedPacket);

			idx += packetSize;
		}
	},

	interpret: function(c, datapacket){
		var header = PacketModels.header.parse(datapacket);
		console.log("Interpret: " + header.command);
		switch(header.command.toUpperCase()){

			case "REGISTER":
				var data = PacketModels.auth.parse(datapacket);
				User.register(data.username, data.password, function(result){
					if(result){
						c.socket.write(packet.build(["REGISTER", "TRUE"]));
					}else{
						c.socket.write(packet.build(["REGISTER", "FALSE"]));
					}
				});
				break;

			case "LOGIN":
				var data = PacketModels.auth.parse(datapacket);
				User.login(data.username, data.password, function(result, user){
					console.log('Login Result ' + result);
					if(result){
						c.user = user;
						c.socket.write(packet.build(["LOGIN", "TRUE", c.user.username]));
						console.log("Available characters:");
						for(var i = 0; i < c.user.characters.length; ++i){
							console.log("" + c.user.characters[i]);
						}
					}else{
						c.socket.write(packet.build(["LOGIN", "FALSE"]));
					}
				});
				break;

			case "LOGOUT":
				var data = PacketModels.logout.parse(datapacket);
				// to do
				break;

			case "USER_INFORMATION":
				User.findName(c.user.username, function(user){
					c.user = user;
					var size = _.size(c.user.characters);

					if(size != 0){
						for(var i = 0; i < size; ++i){
							Character.findName(c.user.characters[i], function(character){
								c.socket.write(packet.build(["CHARACTER", character.charactername, character.gender, character.hair, character.chest, 
								character.pants, character.current_room, character.pos_x, character.pos_y])); 

							});
						}
					}else{
						// stuff
					}
				});
				

				break;

			case "CREATE":
				var data = PacketModels.create.parse(datapacket);

				Character.create(data.charactername, data.gender, data.hair, data.chest, data.pants, 
					data.username, function(result){
					if(result){
						c.socket.write(packet.build(["CREATE", "TRUE"]));
						c.user.characters.push(data.charactername);
						c.user.save();
						// Also send new character data to client
						c.socket.write(packet.build(["CHARACTER", data.charactername, data.gender, data.hair, data.chest, data.pants,
							maps[config.starting_zone].room, maps[config.starting_zone].start_x, maps[config.starting_zone].start_y]));
					
					}else{
						c.socket.write(packet.build(["CREATE", "FALSE"]));
					}
				});

				break;

			case "DELETE_CHARACTER":
				var data = PacketModels.charactername.parse(datapacket);
				Character.removeDoc(data.charactername, function(result, name){
					if(result){
						User.findName(c.user.username, function(user){
							var tmpCharacters = _.without(user.characters, data.charactername);
							User.updateCharacters(c.user.username, tmpCharacters, c, function(result){
								if(result){
									var size = _.size(c.user.characters);
									c.socket.write(packet.build(["UPDATE_CHARACTERS", data.charactername]));
									
								}else{
									console.log("Could not update " + c.user.username + "'s characters!");
								}
							});
						});

					}else{
						console.log("Error: could not remove character \"" + name + "\"");
					}

				});


				break;

			case "ENTER_GAME":
				var data = PacketModels.charactername.parse(datapacket);
				Character.findName(data.charactername, function(character){
					c.character = character;
					console.log(c.user.username + " entering game with \"" + character.charactername + "\"");
					c.socket.write(packet.build(["ENTER_GAME", c.character.charactername, c.character.current_room, c.character.pos_x, c.character.pos_y]));
					c.enter_room(c.character.current_room);
					
				});
				break;

			case "LEAVE_GAME":
				var data = PacketModels.charactername.parse(datapacket);
				console.log(data.charactername + " leaving game ");
				c.leave_room();
				c.character.save();
				
				break;

			case "POS":
				var data = PacketModels.pos.parse(datapacket);
				c.character.pos_x = data.target_x;
				c.character.pos_y = data.target_y;
				c.character.direction = data.direction;
				c.character.walkspeed = data.walkspeed;
				c.broadcast_room(packet.build(["POS", c.character.charactername, data.target_x, data.target_y, 
												data.direction, data.walkspeed]));
				console.log(data);
				console.log("Clients in room " + c.character.current_room + ":");
				maps[c.character.current_room].clients.forEach(function(client){
					console.log(client.character.charactername);
				});
				break;

			case "ROOM":
				var data = PacketModels.room.parse(datapacket);

				console.log(data);
 
				c.leave_room();  
				console.log("dest_room = " + data.dest_room);
				c.character.pos_x = data.dest_x;
				c.character.pos_y = data.dest_y;
				c.enter_room(data.dest_room);
				c.character.current_room = data.dest_room;
				c.character.save();
				break;

			default:
				console.log("Invalid packet header!");

		}

	}
}
