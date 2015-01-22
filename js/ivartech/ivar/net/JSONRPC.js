/**
 *	@file		IVARTECH JSONRPC class, for client to server AJAX JSON-RPC comunication
 *	@author		Nikola Stamatovic Stamat <stamat@ivartech.com>
 *	@copyright	IVARTECH http://ivartech.com
 *	@version	20140308  
 *	
 *	@namespace	ivar.net
 */

//ivar.require('ivar.data.Map');
//ivar.require('ivar.patt.Events');

ivar.namespace('ivar.net');

ivar.net.JSONRPC = function JSONRPC() {
	var self = this;
	
	this._pending = new ivar.data.Map();
	this._registered = new ivar.data.Map();
	
	this._setup = {
		method: 'POST',
		uri: '~/ajax/index.php',
		header: {
			'Content-Type': 'application/json'
		},
		request: {
			jsonrpc: '2.0'
		}
	}
	
	function __init__(settings) {
		ivar.extend(this._setup, settings);
		
		new ivar.patt.Events(this);
		this._bind = this.bind;
		this._fire = this.fire;
		this._clear = this.clear;
		this._clearBound = this.clear;
	}
	
	
	__init__.apply(this, arguments);
};

ivar.net.JSONRPC.prototype._register = function(obj) {
	if(ivar.isString(obj))
		obj = {
			request: {
				method: obj
			}
		};
	var self = this;
	if(!this._registered.hasKey(obj.request.method)) {
		ivar.namespace(obj.request.method, this, '.', function(params, callback, local) {
			var requestObject = self._registered.get(obj.request.method);
			if (ivar.isSet(params))
				requestObject.request.params = params;
			if (ivar.isSet(callback))
				requestObject.callback = callback;
			self._send(requestObject, local);
		});;
	}
	this._registered.put(obj.request.method, ivar.extend(ivar.clone(this._setup), obj));
};

ivar.net.JSONRPC.prototype._unregister = function(method_name) {
	if(this._registered.hasKey(method_name)) {
		delete this[method_name];
		this._registered.remove(method_name);
	}
};

ivar.net.JSONRPC.prototype._send = function (o, local) {
	var request_data = ivar.clone(this._setup);
	request_data.thisArg = this; //_receive callback this reference
	if(!o.hasOwnProperty('request')) {
		ivar.extend(request_data.request, o);
	} else {
		ivar.extend(request_data, o);
	}
	
	if (!ivar.isSet(request_data.uri) || !ivar.isSet(request_data.request) || !ivar.isSet(request_data.request.method)) {
		return this._failed(request_data, 'URL or Request object, or request method is not set! Check your request object!', false);
	}
	
	var id = this._uniqueID();
	
	if (request_data.request.id)
		id = request_data.request.id +'-'+id;
	
	request_data.request.id = id;
	
	if(request_data.request.hasOwnProperty('interface')) {
		request_data.request.method = request_data.request['interface'] + '.' + request_data.request.method
		delete request_data.request['interface'];
	}
	
	if(!ivar.isSet(request_data.request.params)) request_data.request.params = {};
	
	request_data.message = JSON.stringify(request_data.request);
	
	var request = ivar.request(request_data, this._receive, id);
	
	if(!ivar.isSet(request))
		return this._failed(request_data, 'Error opening XMLHTTPRequest, or error sending!', local);
		
	this._addPending(id, request_data, local);
	
	ivar.echo('[request]: '+ request_data.request.method, request_data);
	this._fire(request_data.request.method+'-send', request_data, local);
	this._fire('send', request_data, local);
	
	return id;
};

ivar.net.JSONRPC.prototype._receive = function (request, e, id) {
	
	var pending = this._pending.get(id);
	
	if (pending.aborted) { 
		this._pending.remove(id);
		return;
	}
	
	var req = pending.request;
	var local = pending.local;
	
	var status = ivar.net.httpResponseStatus(request.status);
	
	if (status.type === 2) {
		if (status.code !== 200)
			ivar.warn(req.request.method +' - '+req.method + ' ' + req.url + ' ' + status.code + ' ' + '(' + status.codeTitle + ')');
		
		//TODO: Parse resp_text to JSON depending on response_type 
		//response_type: request.getResponseHeader('Content-Type')
		
		//XXX: FROM HERE ....
		var resp_text = request.responseText;
		var json_begin = resp_text.indexOf('{');
		var server_warning;
		if(json_begin > 0) {
			server_warning = resp_text.substring(0, json_begin);
			resp_text = resp_text.substring(json_begin, resp_text.lastIndexOf('}') + 1);
		} else if (json_begin === -1) {
			ivar.error('[server-error]: '+ resp_text);
		}

		if (ivar.isSet(server_warning) && (server_warning !== ''))
			ivar.warn('[server-warning]: ' + req.request.method, server_warning);
		
		var res = null;
		try {
			res = JSON.parse(resp_text);
		} catch (e) {
			return this._failed(req, 'Response JSON parse error: '+e.message, local);
 		}
 		
 		if (ivar.isSet(res)) {
 			
 			var date = request.getResponseHeader('Date');
 			//inject date
 			if(ivar.isSet(date)) {
	 			try {
	 				//TODO: Check formats for other browsers ivar.echo(obj.date);
						res['date'] = new Date(date);
				} catch (e) {
		 			ivar.error(e.message);
		 		}
		 	}
	 		
			this._fire(req.request.method+'-receive', req, res, local);
			this._fire('receive', req, res, local);
			
			//fire callback
			if (ivar.isSet(req.callback)) {
				req.callback(req, res, local);
			}
			ivar.echo('[response]: '+ req.request.method, res);
			this._pending.remove(id);
			
			return id;
		}
		//XXX: to HERE!
	} else {
		return this._failed(req, req.request.method +' - '+req.method + ' ' + req.url + ' ' + status.code + ' ' + '(' + status.codeTitle + ')', local);
	}
};

ivar.net.JSONRPC.prototype._uniqueID = function() {
	var id = null;
	var newName = function() {
		id = ivar.uid();
	}
	newName();
	while (this._pending[id])
		newName();
	return id;
};

ivar.net.JSONRPC.prototype._addPending = function(id, request, local) {
	if(!id) id = this._uniqueID();
	this._pending.put(id, {
		'request': request,
		'local': local,
		'aborted': false
	});
	return id;
};

ivar.net.JSONRPC.prototype._abort = function(id) {
	//this.pending.get(id).request.abort(); //XXX: should the regular abort be enabled or not?
	//this.pending.remove(id);
	
	this._pending.get(id).aborted = true;
};

ivar.net.JSONRPC.prototype._failed = function(req, err, local) {
	ivar.error(err);
	if(ivar.isSet(req.request) && ivar.isSet(req.request.method))
		this._fire(req.request.method+'-failed', req, local);
	this._fire('failed', req, local);
	
	if (ivar.isSet(req.callback)) req.callback(req, undefined, local);
	
	this._pending.remove(req.id); //XXX:?
	
	return false;
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
