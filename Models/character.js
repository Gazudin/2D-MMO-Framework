var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;

characterSchema = new Schema({
	charactername: {type: String, unique: true},
	gender: String,
	hair: Number,
	chest: Number,
	pants: Number,

	current_room: String,
	pos_x: Number,
	pos_y: Number,
	direction: Number,
	walkspeed: Number,

	user: String
});

characterSchema.statics.create = function(charactername, gender, hair, chest, pants, user, cb){
	var new_character = new Character({
		
		charactername: charactername,
		gender: gender, 
		hair: hair,
		chest: chest,
		pants: pants,

		current_room: maps[config.starting_zone].room,
		pos_x: maps[config.starting_zone].start_x,
		pos_y: maps[config.starting_zone].start_y,
		direction: 0,
		walkspeed: 1,

		user: user
	});

	new_character.save(function(err){
		if(!err){
			cb(true);
			console.log("Saved character to db");
		}else{
			cb(false);
			console.log("Error:");
			console.log(err);
		}
	});
};

characterSchema.statics.findName = function(charactername, cb){
	this.findOne({charactername: charactername}, function(err, character) {
		if(!err){
			cb(character);
		}else{
			console.log("Error, could not retrieve character:")
			console.log(err);
		}

	});
}

characterSchema.statics.removeDoc = function(charactername, cb){
	this.remove({charactername: charactername}, function(err, character) {
		if(!err){
			cb(true, charactername);
		}else{
			console.log("Error, could not remove character:")
			console.log(err);
		}

	});
}


module.exports = Character = gamedb.model('Character', characterSchema);
