var Parser = require('binary-parser').Parser;
var StringOptions = {length: 99, zeroTerminated: true};

module.exports = PacketModels = {

	header: new Parser().skip(1)
		.string("command", StringOptions),

	auth: new Parser().skip(1)
		.string("command", StringOptions)
		.string("username", StringOptions)
		.string("password", StringOptions),

	logout: new Parser().skip(1)
		.string("command", StringOptions)
		.string("username", StringOptions),

	create: new Parser().skip(1)
		.string("command", StringOptions)
		.string("username", StringOptions)
		.string("charactername", StringOptions)
		.string("gender", StringOptions)
		.uint16le("hair", StringOptions)
		.uint16le("chest", StringOptions)
		.uint16le("pants", StringOptions),

	charactername: new Parser().skip(1)
		.string("command", StringOptions)
		.string("charactername", StringOptions),

	pos: new Parser().skip(1)
		.string("command", StringOptions)
		.int32le("target_x", StringOptions)
		.int32le("target_y", StringOptions)
		.uint16le("direction", StringOptions)
		.uint16le("walkspeed", StringOptions),

	room: new Parser().skip(1)
		.string("command", StringOptions)
		.string("current_room", StringOptions)
		.string("dest_room", StringOptions)
		.int32le("dest_x", StringOptions)
		.int32le("dest_y", StringOptions)

}
