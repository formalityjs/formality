ivar.require('ivar.data.HashMap');
ivar.require('ivar.patt.Events');

/**
 * Communication mockup for easier frontend development
 * 
 * @author Nikola Stamatovic Stamat < stamat@ivartech.com >
 * @copyright ivartech < http://ivartech.com >
 * @version 1.0
 * @date 2013-11-17
 * @namespace ivar.net
 */
ivar.namespace('ivar.net');

ivar.net.CommunicationMockup = function() {
	this.maps = {};
	this.empty_requests = {};
	new ivar.patt.Events(this);
};

/*
 *	Prepare your mockup request response pairs
 *
 * 	@param	{string}		method				Method identificator for binding the events
 *	@param	{any|object}	request
 *	@param  {any|object}	response
 *	@param  {int}			[timeout=1000]		Timeout in milliseconts for the response to arive
 */
ivar.net.CommunicationMockup.prototype.create = function(method, request, response, timeout) {
	if (!ivar.isSet(timeout)) timeout = 1000;
	var obj =  {response: response, timeout: timeout};
	if (!ivar.isSet(request)) {
		this.empty_requests[method] = obj;
	} else {
		if(!ivar.isSet(this.maps[method]))
			this.maps[method] = new ivar.data.HashMap();
		this.maps[method].put(request, obj);
	}
};

ivar.net.CommunicationMockup.prototype.get = function(method, request) {
	if(!ivar.isSet(request)) {
		return this.empty_requests[method]
	} else {
		if(this.maps[method] === undefined) {
			return this.empty_requests[method];
		} else {
			return this.maps[method].get(request);
		}
	}
};

ivar.net.CommunicationMockup.prototype.register = function(method) {
	this[method] = function(request, local, callback, fail) {
		this.send(method, request, local, callback, fail);
	};
};

/*
 *	Make a mockup request
 *
 * 	@param	{string}		method			Method identificator for binding the events
 *	@param	{any|object}	request		
 *  @param  {boolean}		[fail=false]	Fail the request
 */
ivar.net.CommunicationMockup.prototype.send = function(method, request, local, callback, fail) {

	var res = this.get(method, request);
	
	this.fire(method+'send', request, local);
	this.fire('send', request, local);
	
	if (!ivar.isSet(fail)) fail = false;
	var self = this;
	setTimeout(function() {
		if(fail) {
			self.fire(method+'-fail', request, local);
			self.fire('fail', request, local);
		} else {
			self.fire(method+'-recieve', request, res.response, local);
			self.fire('recieve', request, res.response, local);
		}
		if (ivar.isSet(callback)) callback(request, res.response, local);
	}, res.timeout);
};
