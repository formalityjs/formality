
ivar.require('ivar.net.Communication');
ivar.require('ivar.data.Map');
ivar.require('ivar.patt.Events');

/**
 *  @file		IVARTECH Remote Model Abstraction class
 *	@author		Nikola Stamatovic Stamat <stamat@ivartech.com>
 *	@copyright	IVARTECH http://ivartech.com
 *	@version	20130313  
 *	
 *	@namespace	ivar.net
 */

ivar.namespace('ivar.net');

/**
 *	@class
 */
ivar.net.RMA = function RMA() {
	this.schema = null;
	this.original = [];
	this.storage = new ivar.data.Map();
};

ivar.net.RMA.prototype.sync = function() {
	if(!ivar.isSet(this.schema)) {
		//get model, get schema and init
	} else {
		//normalize stacks, if not empty send to server
	}
}


ivar.net.RMA.prototype.diff = function() {
	// calculate the difference between object arrays and generate edit create update delete
};

ivar.net.RMA.prototype.get = function() {
	return this.storage.values();
};

ivar.net.RMA.prototype.create = function() {
	//check if unique if needed
	//add to storage
	//add to create stack
};

ivar.net.RMA.prototype.update = function() {
	//check if unique if needed
	//update to storage
	//normalize stacks
	//add to update stack
};

ivar.net.RMA.prototype.delete = function() {
	//delete from storage
	//normalize stacks
	//add to delete stack
};
