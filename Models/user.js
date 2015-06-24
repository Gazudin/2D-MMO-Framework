var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;
var _ = require('underscore');


userSchema = new Schema({
	username: {type: String, unique: true},
	password: String,

	characters: [String]
});

userSchema.statics.register = function(username, password, cb){
	var new_user = new User({
		username: username,
		password: password,

		characters: []
	});

	new_user.save(function(err){
		if(!err){
			cb(true);
		}else{
			cb(false);
			console.log("Error:");
			console.log(err);
		}
	});
};

userSchema.statics.login = function(username, password, cb){
	this.findOne({username: username}, function(err, user){
		if(!err && user){
			if(user.password == password){
				cb(true, user);
			}else{
				cb(false, null);
			}
		}else{
			// error || user doesn't exist...
			cb(false, null);
		}
	});

};

userSchema.statics.findName = function(username, cb){
	this.findOne({username: username}, function(err, user) {
		if(!err){
			cb(user);
		}else{
			console.log("Error, could not retrieve user:")
			console.log(err);
		}

	});
}

userSchema.statics.updateCharacters = function(username, tmpCharacters, client, cb){
	this.update({username: username}, {characters: tmpCharacters}, function(err){
		if(!err){
			client.user.save(function(error){
				if(!error){
					console.log("Saved client.user");
					console.log("Updated \"" + client.user.username + "\" Characters: " + client.user.characters);
					cb(true);
				}
			});
		}else{
			console.log("Error: " + err);
			cb(false);
		}
	});
};

module.exports = User = gamedb.model('User', userSchema);
