require(__dirname + '/Resources/config.js');

// Import required libraries
require(__dirname + '/Resources/config.js');
var fs = require('fs');
var net = require('net');
require('./packet.js');

// 1. load the initializers
var init_files = fs.readdirSync(__dirname + "/Initializers");
init_files.forEach(function(initFile){
	console.log('Loading Initializer: ' + initFile);
	require(__dirname + "/Initializers/" + initFile);
});

// 2. load the data models
var model_files = fs.readdirSync(__dirname + "/Models");
model_files.forEach(function(modelFile){
	console.log('Loading ModelmodelFile: ' + modelFile);
	require(__dirname + "/Models/" + modelFile);
});

// 3. load game maps data
maps = {};
var map_files = fs.readdirSync(config.data_paths.maps);
map_files.forEach(function(mapFile){
	console.log('Loading Map: ' + mapFile);
	var map = require(config.data_paths.maps + mapFile);
	maps[map.room] = map;
});

// 4. initiate server and listen to the internets
net.createServer(function(client){

	console.log("Client connected");

	var c_inst = new require('./client.js');
	var thisClient = new c_inst();

	thisClient.socket = client;
	thisClient.initiate();

	client.on('error', thisClient.error);

	client.on('end', thisClient.end);

	client.on('data', thisClient.data);
}).listen(config.port);

console.log("Initialize completed, Server running on port: " + config.port + " for environment " + config.environment);

