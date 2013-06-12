/**
 *	@file		IVARTECH Communication class, for client to server AJAX comunication
 *	@author		Nikola Stamatovic Stamat <stamat@ivartech.com>
 *	@copyright	IVARTECH http://ivartech.com
 *	@version	20130313  
 *	
 *	@namespace	ivar.net
 */

//TODO: Finis file upload, purge jquery form the script

ivar.require('ivar.data.Map');
ivar.require('ivar.patt.Events');

ivar.namespace('ivar.net');

/**
 *	@class
 *	@classdesc	Class that is used to efficiently and easily enable communication with the server side through XMLHttpRequest {@link https://developer.mozilla.org/en-US/docs/DOM/XMLHttpRequest}, with error feedback, event system, debug history, and many other features
 *
 *	@todo	Add file upload methods, form submission , and Image download methods. REST and XML-RPC conversions. SOAP? Multi method calls on server, multi responses...
 *
 *	@constructor
 *	@param 		{object}	options
 *	@param 		{string}	options.url					URL of server side interface
 *	@param		{boolean}	[options.async=true]		Should a request be asynchronous or not
 *	@param		{string}	[options.method='GET']		HTTP method GET, POST, PUT, DELETE
 *	@param		{string}	[options.content_type='application/json']	Content MIME type json|rest|xml| image|file...
 *	@param		{string}	[options.user]				User name for HTTP auth
 *	@param		{string}	[options.password]			User password for HTTP auth
 *	@param 		{boolean}	history
 *		
 *	@property	{Map}		registered	Map of all registered request objects where key is the name of the method invoked on server
 *	@property	{Map}		sent	
 *	@property	{Map}		received 	
 *	@property	{Map}		unsuccessful
 *	@property	{object}	defaults
 *	@property	{boolean}	defaults.async=true
 *	@property	{string}	defaults.method='GET'
 *	@property	{string}	defaults.content_type='application/json'
 *	@property	{boolean}	history
 *	@property	{Events}	events
 */
ivar.net.Communication = function Communication(options, history) {
	this.registered = new ivar.data.Map();
	this.sent = new ivar.data.Map();
	this.unsuccessful = new ivar.data.Map();
	this.received = new ivar.data.Map();
	this.defaults = {
		async: true,
		method: 'GET',
		content_type: 'application/json'
	};
	this.history = false;
	if(isSet(history))
		this.history = history;
		
	this.applyOptions(options);
	
	//this.events = new ivar.patt.Events();
	new ivar.patt.Events(this);
};

ivar.net.Communication.prototype.constructor = ivar.net.Communication;

/**
 *	Applies new options to the default template
 *
 *	@param	{object}	options
 */
ivar.net.Communication.prototype.applyOptions = function(options) {
	if(ivar.isSet(options))
		ivar.extend(this.defaults, options);
		
	var self = this;
	
	this.unsuccessful.each(function(i, obj){
		ivar.extend(obj, options);
	});
	
	this.sent.each(function(i, obj){
		ivar.extend(obj, options);
	});
	
	this.received.each(function(i, obj){
		ivar.extend(obj, options);
	});
	
	this.registered.each(function(i, obj){
		ivar.extend(obj, options);
	});
};

/**
 *	Registers a method to be called with all of it's constant options. Options that are not constant are request.params. If only a string is passed it becomes a method name request.method. Method can be further called Communication.nameOfMethod();
 *	
 *	@param 	{string|object}	obj
 *	@param 	{object}		obj.request 			JSON-RPC formed request: method name and params
 *	@param 	{string|number}	[obj.request.id] 		Request UID string if not supplied it is automatically generated
 *	@param 	{string}		obj.request.method 		Name of the method to be invoked on server 
 *	@param 	{object}		obj.request.params		Request data to be submitted to method on server as its parameters
 *	@param 	{string}		obj.url					URL of server side interface
 *	@param	{boolean}		[obj.async=true]		Should a request be asynchronous or not
 *	@param	{string}		[obj.method='GET']		HTTP method GET, POST, PUT, DELETE
 *	@param	{string}		[obj.content_type='application/json']	Content MIME type json|rest|xml| image|file...
 *	@param	{string}		[obj.user]				User name for HTTP auth
 *	@param	{string}		[obj.password]			User password for HTTP auth
 */
ivar.net.Communication.prototype.register = function(obj) {
	if(ivar.isString(obj))
		obj = {
			request: {
				method: obj
			}
		};
	if(!this.registered.hasKey(obj.request.method)) {
		this[obj.request.method] = function(params) {
			var requestObject = this.registered.get(obj.request.method);
			if (ivar.isSet(params))
				requestObject.request.params = params;
			this.send(requestObject, obj.request.method);
		};
	}
	this.registered.put(obj.request.method, ivar.extend(this.defaults, obj, 0));
};

/**true
 *	Removes already registered function so it can't be called anymore
 *
 *	@param	{string}	method_name
 */
ivar.net.Communication.prototype.unregister = function(method_name) {
	if(this.registered.hasKey(method_name)) {
		delete this[method_name];
		this.registered.remove(method_name);
	}
};

/**
 *	Send function of the communication class, used to send request to server 
 *	
 *	@param 	{object}		options						Option object containing request data 
 *	@param 	{object}		options.request 			JSON-RPC formed request: method name and params
 *	@param 	{string|number}	[options.request.id] 		Request UID string if not supplied it is automatically generated
 *	@param 	{string}		options.request.method 		Name of the method to be invoked on server 
 *	@param 	{object}		options.request.params		Request data to be submitted to method on server as its parameters
 *	@param 	{string}		options.url					URL of server side interface
 *	@param	{boolean}		[options.async=true]		Should a request be asynchronous or not
 *	@param	{string}		[options.method='GET']		HTTP method GET, POST, PUT, DELETE
 *	@param	{string}		[options.content_type='application/json']	Content MIME type json|rest|xml| image|file...
 *	@param	{string}		[options.user]				User name for HTTP auth
 *	@param	{string}		[options.password]			User password for HTTP auth
 *
 *	@return	{boolean}									If sending is successful or not	
 */
ivar.net.Communication.prototype.send = function(options) {
	var obj = ivar.extend(this.defaults, options, 0);
	
	if (!ivar.isSet(obj.url) || !ivar.isSet(obj.request) || !ivar.isSet(obj.request.method)) {
		return this.failed(obj, 'URL or Request object, or request method is not set! Check your request object!', false);
	}
	
	if (!isSet(obj.request.id))
		obj.request.id = ivar.uid();
	
	if (!isSet(obj.request.params))
		obj.request.params = {};

	var request = new XMLHttpRequest();
	try {
		request.open(obj.method, obj.url, obj.async, obj.user, obj.password);
	} catch (e) {
		return this.failed(obj, e);
	}
	request.setRequestHeader('Content-Type', obj.content_type);
	
	var self = this;
	request.onload = function() {
		self.receive({
			status: request.status,
			date: request.getResponseHeader('Date'),
			response_text: request.responseText,
			response_type: request.getResponseHeader('Content-Type'),
			id: obj.request.id
		});
	};
	try {
		var json;
		if(isSet(obj.request))
			json = JSON.stringify(obj.request);
		request.send(json);
	} catch(e) {
		return this.failed(obj, e);
	}
	
	this.sent.put(obj.request.id, obj);
	ivar.print('[request]: '+ obj.request.method, obj);
	this.fire(obj.request.method+'-send', obj);
	this.fire('send', obj);
	return true;
};

/**
 *	Method that is triggered upon receiving response from the server, It checks HTTP response status and parses it accordingly
 *	@todo	Support for xml response format.
 *	
 *	@param 	{object}		obj 	
 *	@param	{number}		obj.status			XMLHttpRequest.status
 *	@param	{string}		obj.date			XMLHttpRequest.getResponseHeader('Date')
 *	@param 	{string}		obj.response_text	XMLHttpRequest.responseText
 *	@param 	{string}		obj.response_type	XMLHttpRequest.getResponseHeader('Content-Type')
 *	@param 	{string|number}	obj.id 				Identificator of the request object
 */
ivar.net.Communication.prototype.receive = function(obj) {
	var sentObj = this.sent.get(obj.id);
	var status = ivar.net.httpResponseStatus(obj.status);
	
	if (status.type === 2) {
		if (status.code !== 200)
			ivar.warning(sentObj.request.method +' - '+sentObj.method + ' ' + sentObj.url + ' ' + status.code + ' ' + '(' + status.codeTitle + ')');
		var resp = obj.response_text;
		var jsonBegin = resp.indexOf('{');
		var serverWarning;
		if(jsonBegin > 0) {
			serverWarning = resp.substring(0, jsonBegin);
			resp = resp.substring(jsonBegin, resp.lastIndexOf('}') + 1);
		} else if (jsonBegin === -1) {
			ivar.error('[server-error]: '+resp);
		}

		if (ivar.isSet(serverWarning) && (serverWarning !== ''))
			ivar.warning('[server-warning]: '+sentObj.request.method, serverWarning);
		
		//TODO: Parse response_text to JSON depending on response_type
		var json;
		try {
			json = JSON.parse(resp);
		} catch (e) {
			this.failed(sentObj, ''+e+' > ' + resp );
 		}
 		
 		if (ivar.isSet(json)) {
 			try {
 				//TODO: Check formats for other browsers print(obj.date);
 				if(isSet(obj.date))
					json['date'] = new Date(obj.date);
			} catch (e) {
	 			error(e);
	 		}
	 		
			this.fire(sentObj.request.method+'-receive', sentObj, json);
			this.fire('receive', sentObj, json);
			
			if(this.unsuccessful.hasKey(json.id))
				this.unsuccessful.remove(json.id);
				
			if (isSet(sentObj.callback))
				sentObj.callback(json);
			
			if (this.history) {
				this.received.put(json.id, json);
			} else {
				this.sent.remove(json.id);
			}
			
			ivar.print('[response]: '+ sentObj.request.method, json);
		}
	} else {
		this.failed(sentObj, sentObj.request.method +' - '+sentObj.method + ' ' + sentObj.url + ' ' + status.code + ' ' + '(' + status.codeTitle + ')');
	}
};

/**
 *	Method that is called when send|receive methods fail for some reason. It stores request object into unsuccessful map.
 *
 *	@param 	{object}	obj				Request object described in the send method options {@see ivar.util.Communication.send}
 *	@param 	{string}	err 			Error message
 *	@param 	{boolean}	[store=true]	If store is true object will be stored to unsuccessful Map	
 */
ivar.net.Communication.prototype.failed = function(obj, err, store) {
	ivar.error(err);
	if(!ivar.isSet(store))
		store = true;
	if(store)
		this.unsuccessful.put(obj.request.id, obj);
	if(ivar.isSet(obj.request) && ivar.isSet(obj.request.method))
		this.fire(obj.request.method+'-failed', obj);
	this.fire('failed', obj);
	return false;
};

/**
 *	Resends unsuccessful request based on provided request id
 *
 *	@param	{string|number}	id 	Identificator of unsuccessful request object
 *	@return {boolean}			Returns true if successful
 */
ivar.net.Communication.prototype.resend = function(id) {
	if(ivar.isObject(id))
		if(id.request && id.request.id)
			id = id.request.id;
		else
			return this.failed(id, 'Resubmitted object does not contain request identificator!', false);
		
	return this.send(this.unsuccessful.remove(id));
};

ivar.net.Communication.prototype.resendAll = function() {
	var self = this;
	this.unsuccessful.each(function(i, obj){
		self.resend(obj);
	});
};

ivar.net.Communication.prototype.execute = function(args) {
	var self = this;
	ivar.eachArg(arguments, function(i, elem) {
		if(self.registered.hasKey(elem))
			self.send(self.registered.get(elem));
	});
};

ivar.net.Communication.prototype.multiple = function(args) {
	var multiple_request = null;
	var self = this;
	ivar.eachArg(arguments, function(i, elem){
		if(self.registered.hasKey(elem)) {
			if(!ivar.isSet(multiple_request)) {
				multiple_request = ivar.clone(self.registered.get(elem));
				multiple_request.request = [multiple_request.request];
			} else {
				multiple_request.request.push(self.registered.get(elem).request);
			}
		}
	});
	
	if(multiple_request.request.length == 1)
		this.send(args);
	else if(multiple_request.request.length > 1)
		this.send(multiple_request);
};

ivar.net.http_response_code = {};

ivar.net.http_response_code[2] = 'Successful';
ivar.net.http_response_code[200] = 'OK';
ivar.net.http_response_code[201] = 'Created';
ivar.net.http_response_code[202] = 'Accepted';
ivar.net.http_response_code[203] = 'Non-Authoritative Information';
ivar.net.http_response_code[204] = 'No Content';
ivar.net.http_response_code[205] = 'Reset Content';
ivar.net.http_response_code[206] = 'Partial Content';
ivar.net.http_response_code[3] = 'Redirection';
ivar.net.http_response_code[300] = 'Multiple Choices';
ivar.net.http_response_code[301] = 'Moved Permanently';
ivar.net.http_response_code[302] = 'Found';
ivar.net.http_response_code[303] = 'See Other';
ivar.net.http_response_code[304] = 'Not Modified';
ivar.net.http_response_code[305] = 'Use Proxy';
ivar.net.http_response_code[307] = 'Temporary Redirect';
ivar.net.http_response_code[4] = 'Client Error';
ivar.net.http_response_code[400] = 'Bad Request';
ivar.net.http_response_code[401] = 'Unauthorized';
ivar.net.http_response_code[402] = 'Payment Required';
ivar.net.http_response_code[403] = 'Forbidden';
ivar.net.http_response_code[404] = 'Not Found';
ivar.net.http_response_code[405] = 'Method Not Allowed';
ivar.net.http_response_code[406] = 'Not Acceptable';
ivar.net.http_response_code[407] = 'Proxy Authentication Required';
ivar.net.http_response_code[408] = 'Request Timeout';
ivar.net.http_response_code[409] = 'Conflict';
ivar.net.http_response_code[410] = 'Gone';
ivar.net.http_response_code[411] = 'Length Required';
ivar.net.http_response_code[412] = 'Precondition Failed';
ivar.net.http_response_code[413] = 'Request Entity Too Large';
ivar.net.http_response_code[414] = 'Request-URI Too Long';
ivar.net.http_response_code[415] = 'Unsupported Media Type';
ivar.net.http_response_code[416] = 'Requested Range Not Satisfiable';
ivar.net.http_response_code[417] = 'Expectation Failed';
ivar.net.http_response_code[5] = 'Server Error';
ivar.net.http_response_code[500] = 'Internal Server Error';
ivar.net.http_response_code[501] = 'Not Implemented';
ivar.net.http_response_code[502] = 'Bad Gateway';
ivar.net.http_response_code[503] = 'Service Unavailable';
ivar.net.http_response_code[504] = 'Gateway Timeout';
ivar.net.http_response_code[505] = 'HTTP Version Not Supported';

ivar.net.httpResponseStatus = function(num) {
	var typeId = Math.floor(num / 100);
	return {
		type: typeId,
		typeTitle: ivar.net.http_response_code[typeId],
		code: num,
		codeTitle: ivar.net.http_response_code[num]
	};
};

ivar.net.html5Upload = function(file, url, callback) {
	var fd = new FormData();
	fd.append('file', file);
	var request = new XMLHttpRequest();
	request.open('POST', url, true);
	request.onload = function() {
		print(request.responseText);
		if (request.status == 200) {
			try {
 				value = JSON.parse(request.responseText);
	 		} catch (e) {
	 			error(e);
	 		}
			callback(value);
		}
	};
	request.send(fd);
};

(function($) {
	$.fn.fileUpload = function(url, callback) {
		//TODO: if(!$(this).is('form')) {
		var iframe = $('<iframe id="uploadFrame" name="uploadFrame" width="0" height="0" border="0"></iframe>');
		$(this).parent().append(iframe);

	 	$(iframe).load(function() {
	 		var value = null;
	 		try {
	 			value = JSON.parse($(this).contents().find('body').html());
	 		} catch (e) {
	 			error(e);
	 		}
	 		callback(value);
		    setTimeout(function() {$(iframe).remove();}, 250);
	 	});

		$(this).attr({
			target: 'uploadFrame',
			action: url,
			method: 'post',
			enctype: 'multipart/form-data'
		});
		
		$(this).submit();
	};
}(jQuery));
