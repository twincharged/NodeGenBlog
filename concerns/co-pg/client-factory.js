'use strict';
var util = require('util'),
    thunk = require('thunkify');


function buildJsClient(Client) {
	function CoClient() {
		CoClient.super_.apply(this, arguments);
	}
	util.inherits(CoClient, Client);

	CoClient.prototype.connect_ = thunk(Client.prototype.connect);
	CoClient.prototype.query_ = thunk(Client.prototype.query);

	return CoClient;
}

function buildNativeCoClientBuilder(clientBuilder) {
	return function nativeCoClientBuilder(config) {
		var connection = clientBuilder(config);
		connection.connect_ = thunk(connection.connect);
		connection.query_ = thunk(connection.query);
		return connection;
	};
}

exports = module.exports = function(pg) {
	var Client = pg.Client;

	//determine if `Client` is a Client prototype or a native client builder
	if (Client.prototype.connect) {
		return buildJsClient(Client);
	} else {
		return buildNativeCoClientBuilder(Client);
	}
};