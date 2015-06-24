//Import required libraries
var args = require('minimist')(process.argv.slice(2));
var extend = require('extend');

// Store the environment variable
var environment = args.env || "test";

// Common config, ie: name, version, max_connections, etc...
var common_conf = {
	name: "2dmmo",
	version: "0.0.1",
	environment: environment,
	max_connections: 100,
	data_paths: {
		items: __dirname + "/Game Data" + "/Items/",
		maps: __dirname + "/Game Data" + "/Maps/"
	},
	starting_zone: "rm_map_home",
	auth: {auth: {authdb: "admin"}}
};

// Environment specific configuration
var conf = {
	production: {
		ip: args.ip || "0.0.0.0",
		port: args.port || 61037,
		database: "mongodb:///*classified*"
	},

	test: {
		ip: args.ip || "0.0.0.0",
		port: args.port || 61027,
		database: "mongodb:///*classified*"
	}
};

extend(false, conf.production, common_conf);
extend(false, conf.test, common_conf);

module.exports = config = conf[environment];
