/**
 *	@file		IVARTECH JavaScript Library - main class
 *	@author		Nikola Stamatovic Stamat <stamat@ivartech.com>
 *	@copyright	IVARTECH http://ivartech.com
 *	@version	20130313  
 *	
 *	@namespace	ivar
 */

if (ivar === undefined) var ivar = {};
if ($i === undefined) var $i = ivar;

ivar.types = {
	'undefined': -1,
	'null': 0,
	'boolean': 1,
	'integer': 2,
	'float': 3,
	'string': 4,
	'array': 5,
	'object': 6,
	'function': 7,
	'regexp': 8,
	'date': 9
}

ivar._global = this;

ivar.getProperyByNamespace = function(str, root, del) {
	if(!del) del = '.';
	var parts = str.split(del);
	var current = !root ? ivar._global : root;
	for (var i = 0; i < parts.length; i++) {
		if (current.hasOwnProperty(parts[i])) {
			current = current[parts[i]];
		} else {
			return;
		}
	}
	return current;
};

ivar.namespace = function(str, root, del, end) {
	if(!del) del = '.';
	var parts = str.split(del);
	var current = !root ? ivar._global : root;
	for(var i = 0; i < parts.length; i++) {
		if (!current.hasOwnProperty(parts[i])) {
			if(end !== undefined && i === parts.length - 1) {
				current[parts[i]] = end;
			} else {
				current[parts[i]] = {};
			}
		}
		current = current[parts[i]];
	};
	return current;
};

ivar.DEBUG = true;
ivar.LOADED = false;
ivar.namespace('ivar._private');
ivar._private.libpath = '';
ivar._private.imported = {};
ivar._private.loading = {
	scripts: {},
	length: 0
};

ivar._private.on_ready_fn_stack = [];
ivar._private.libname = 'ivar';

ivar._private.output = undefined; //define debug output function, print your output somewhere else...

ivar.regex = {};
ivar.regex.regex = /^\/(.*)\/(?:(?:i?g?m?)|(?:i?m?g?)|(?:g?i?m?)|(?:g?m?i?)|(?:m?g?i?)|(?:m?i?g?))$/;
ivar.regex.email = /^[a-z0-9\._\-]+@[a-z\.\-]+\.[a-z]{2,4}$/;

ivar.regex.unicodesentence = /^[^\\!@#\$%\^\?"'\t\n\v\/\[\]\(\)\/`~:\*\&\.;<>]+$/;
ivar.regex.unicodeword = /^[^\\!@#\$%\^\?"'\t\n\v\/\[\]\(\)\/`~:\*\&\.;<>\s]+$/;

//FUCK THIS SHIT!
ivar.regex.uri = /^(?:([a-z\-\+\.]+):)?(?:\/\/)?(?:([^?#@:]*)(?::([^?#@:]*))?@)?([^?#\s\/]*)(?::([0-9]{1,5}))?(?:[^?#\s]*)(?:\?([^#\s"]*))?(?:#([^\s"]*))?$/;
ivar.regex.time = /^(([0-1][0-9])|(2[0-3])):([0-5][0-9]):([0-5][0-9])$/;

ivar.regex.function_name = /function\s+([a-zA-Z0-9_\$]+?)\s*\(/;

ivar.regex.hashtag = /(?:^|\s)#([^\\!@#\$%\^\?"'\t\n\v\/\[\]\(\)\{\}`~:\*\&\.;<>\s]+)/ig;
ivar.regex.attag = /(?:^@|\s@)([a-zA-Z0-9_\-]+)/ig;
ivar.regex.wikitag = /(^~|\s~)([a-zA-Z0-9_\-:\(\)]+)/ig;

//i tried...   http://username:password@some.fine.example.com:8042/over/there/index.dtb?type=animal&name=narwhal#nose
ivar.regex.getURIs = /(?:(?:https?|ftp):\/\/)(?:([^?#@:]*)(?::([^?#@:]*))?@)?((?:www\.|ftp\.)?([a-z0-9\-\.]+)\.(com|net|org|info|co|us|it|ca|cc|[a-z]{2,4})(:[0-9]{1,5})?((\/[^\/#\?\s]*)*)*)(\?([^#\s]*))?(#([^\s]*))?/ig;

Math.randomArbitrary = function(min, max) {
  return Math.random() * (max - min) + min;
};

Math.rand = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};


/*
	NUMBER prototypes
*/

Number.prototype.roundFloat = function(decimals) {
	if (decimals === undefined)
		decimals = 2;
	var dec = Math.pow(10, decimals);
	return Math.round(this*dec)/dec;
};

/*
	ARRAY prototypes
*/

Array.prototype.find = function(value, field) {
	var regex = ivar.isRegExp(value);
	
	if (this.length > 0)
		for (var i = 0; i < this.length; i++) {
			var elem = this[i];
			if (field && (typeof elem === 'object' || ivar.isArray(elem)))
				elem = this[i][field];
			if (regex) {
				if(value.test(elem))
					return i;
			} else {
				if (elem === value)
					return i;
			}
		}
	return -1;
};

Array.prototype.findAll = function(value, field) {
	var regex = ivar.isRegExp(value);
	var result = [];
	if (this.length > 0)
		for (var i = 0; i < this.length; i++) {
			var elem = this[i];
			if (field && (typeof elem === 'object' || ivar.isArray(elem)))
				elem = this[i][field];
			if (regex) {
				if(value.test(elem))
					result.push(i);
			} else {
				if (elem === value)
					result.push(i);
			}
		}
	return result;
};

Array.prototype.getFirst = function() {
	return this[0];
};

Array.prototype.getLast = function() {
	return this[this.length-1];
};

Array.prototype.removeFirst = function() {
	this.splice(0, 1)
};

Array.prototype.removeLast = function() {
	this.splice(this.length-1, 1)
};

Array.prototype.each = function(fn, reversed) {
	var count = 0;
	var step = 1;
	if (reversed) {
		step = -1;
		count = this.length - 1;
	}

	for (var i = 0; i < this.length; i++) {
		fn(count, this[count]);
		count = count + step;
	}
};

String.prototype.each = Array.prototype.each;

Array.prototype.equal = function(arr) {
	return ivar.compareArrays(this, arr);
};

Array.prototype.rm = function(id) {
	return this.splice(id, 1);
};

Array.prototype.remove = function(value) {
	if ((ivar.isString(value) && ivar.regex.regex.test(value)) || ivar.isRegExp(value))
		return ivar.patternRemove(this, value);
		
	var id = this.find(value);
	if (id > -1)
		return this.rm(id);
	return false;
};

ivar.patternRemove = function(obj, re) {
	if (ivar.isString(re))
		re = re.toRegExp();
	if (ivar.isArray(obj)) {
		for(var i = 0; i < obj.length; i++) {
			if(re.test(obj[i]))
				obj.rm(i);
		}
	} else if (typeof obj === 'object') {
		for(var i in obj) {
			if(re.test(i)) {
				delete obj[i];
			}
		}
	}
	return obj;
};

ivar.getAdditionalProperties = function(obj, properties, patternProperties) {
	var arr = ivar.getProperties(value);
	
	if(properties && ivar.isArray(properties))
	for(var i = 0; i < properties.length; i++) {
		arr.remove(properties[i]);
	}
	
	if(properties && ivar.isArray(patternProperties))
	for(var i = 0; i < patternProperties.length; i++) {
		arr.remove(patternProperties[i]);
	}
	
	return arr;
};

Array.prototype.insert = function(id, value) {
	return this.splice(id, 0, value);
};

Array.prototype.shuffle = function() {
	var res = [];
	while(this.length !== 0) {
		var id = Math.floor(Math.random() * this.length);
		res.push(this[id]);
		this.splice(id, 1);
	}
    return res;
};

Array.prototype.toObject = function() {
	var res = {};
	for(var i = 0; i < this.length; i++) {
		res[i] = this[i];
	}
	return res;
};

Array.prototype.invert = function() {
	var res = {};
	for(var i = 0; i < this.length; i++) {
		res[this[i]] = i;
	}
	return res;
};

ivar.toMapKey = function(value) {
	var type = ivar.types[ivar.whatis(value)];
		
	if (type === 5 || type === 6) {
		value = ivar.orderedStringify(value);
	} else {
		value = value.toString();
	}
	
	return  type+'_'+value;
};

Array.prototype.merge = function(arr) {
	var map = this.toMap();
	for (var i = 0; i < arr.length; i++) {
		if(!map.hasOwnProperty(ivar.toMapKey(arr[i])))
			this.push(arr[i]);
	}
};

//TODO: ?
Array.prototype.toMap = function(field) {
	var mapped = {};
	for (var i = 0; i< this.length; i++) {
		var value = this[i];
		if (ivar.isSet(field)) value = this[i][field];
		
		value = ivar.toMapKey(value);
			
		!mapped.hasOwnProperty(value) ? mapped[value] = [i] : mapped[value].push(i);
	}
	return mapped;
};

Array.prototype.isUnique = function() {
	var map = {};
	for(var i = 0; i < this.length; i++) {
		var map_key = ivar.toMapKey(this[i]);
		if(map.hasOwnProperty(map_key))
			return false;
		map[map_key] = i;
	}
	return true;
};

Array.prototype.unique = function() {
	var map = {};
	var uni = [];
	for(var i = 0; i < this.length; i++) {
		var map_key = ivar.toMapKey(this[i]);
		if(map.hasOwnProperty(map_key))
			continue;
		map[map_key] = i;
		uni.push(this[i]);
	}
	return uni;
};

Array.prototype.sortObjectsBy = function(field, desc, type) {
	var func = null;
	
	if(this.length == 0)
		return [];
	
	if(!ivar.isSet(type))
		type = ivar.whatis(this[0][field]);
	
	if(!ivar.isSet(desc))
		desc = false;
	
	if(ivar.isNumber(this[0][field])) {
		func = function(a, b) {
			return !desc?a[field]-b[field]:b[field]-a[field];
		};
	} else if(type === 'string') {
		func = function(a, b) {
			var fieldA = a[field].toLowerCase();
			var fieldB = b[field].toLowerCase();
			if (fieldA < fieldB)
				return !desc?-1:1; 
			if (fieldA > fieldB)
				return !desc?1:-1;
			return 0;
		};
	} else if(type === 'date') {
		func = function(a, b) {
			var fieldA = a[field].getTime();
			var fieldB = b[field].getTime();
			return !desc?fieldA-fieldB:fieldB-fieldA;
		};
	}
	
	return this.sort(func);
};

/*
	STRING prototypes
*/

if (!String.prototype.hasOwnProperty('startsWith'))
String.prototype.startsWith = function(str, pos) {
	var prefix = this.substring(pos, str.length);
	return prefix === str;
};

if (!String.prototype.hasOwnProperty('endsWith'))
String.prototype.endsWith = function(str, pos) {
	if (!pos)
		pos = this.length;
	var sufix = this.substring(pos - str.length, pos);
	return sufix === str;
};

if (!String.prototype.hasOwnProperty('trim'))
String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g,'');
};

String.prototype.trimAll = function() {
	return this.replace(/^[\s\n]+|[\s\n]+$/mg,'');
};

if (!String.prototype.hasOwnProperty('trimLeft'))
String.prototype.trimLeft = function() {
	return this.replace(/^\s+/,'');
};

if (!String.prototype.hasOwnProperty('trimRight'))
String.prototype.trimRight = function() {
	return this.replace(/\s+$/,'');
};

String.prototype.removePrefix = function(str) {
	var l = str;
	var what = ivar.types[ivar.whatis(str)];
	if (what === 4) str = [str];
	if (what !== 2 && what !== 3)
		for (var i = 0; i < str.length; i++) {
			if(this.startsWith(str[i])) {
				l = str[i].length;
				break;
			}
		}
	return this.substring(l, this.length);
};

String.prototype.removeSufix = function(str) {
	var l = str;
	var what = ivar.types[ivar.whatis(str)];
	if (what === 4) str = [str];
	if (what !== 2 && what !== 3)
		for (var i = 0; i < str.length; i++) {
			if(this.endsWith(str[i])) {
				l = str[i].length;
				break;
			}
		}
	return this.substring(0, this.length - l);
};

String.prototype.removeFirst = function(pat) {
	if(!pat || pat.indexOf(this[this.length-1]) > -1)
		return this.substring(1, this.length);
	else
		return this;
};

String.prototype.removeLast = function(pat) {
	if(!pat || pat.indexOf(this[this.length-1]) > -1)
		return this.substring(0, this.length-1);
	else
		return this;
};

String.prototype.getFirst = Array.prototype.getFirst;

String.prototype.getLast = Array.prototype.getLast;

String.prototype.insert = function(what, where, end) {
	if (typeof where === 'string') {
		var id = this.indexOf(where)
		end = end || id+where.length;
		where = id;
	}
	end = end || where;
	var res = [];
	res.push(this.substring(0, where));
	res.push(what);
	res.push(this.substring(end, this.length));
	return res.join('');
};

String.prototype.hasUpperCase = function() {
	return this !== this.toLowerCase() ? true : false;
};

String.prototype.hasLowerCase = function() {
	return this.toUpperCase() !== this ? true : false;
};

//TODO: namespace as tags!!!
String.prototype.template = function(obj, opened, closed) {
	//TODO: pattern tags
	opened = opened || '{{';
	closed = closed || '}}';	
	var str = this;
	var id = str.indexOf(opened);
	
	while (id > -1){
		var end = str.indexOf(closed, id+opened.length);
		var property_name = str.substring(id+opened.length, end);
		
		var repl = obj[property_name];
		
		if (repl === undefined)
			repl = '';
			
		str = str.insert(repl, id, end+closed.length);
		id = str.indexOf(opened, id+repl.length);
	}
	
	return str;
}

// find all occurrences of the pattern [and execute some function]
String.prototype.findAll = function(regex, fn) {
	var res = [];
	var f = null;
	var str = this;
	regex = ivar.regexpAddFlag(regex, 'g');
	while ((f = regex.exec(str)) !== null) {
		res.push(f);
		if (fn)
			fn(f, f.index);
	}
	return res;
};

String.prototype.swap = function(what, with_this, only_first) {
	if (only_first)
			return this.replace(what, with_this);
	var re = new RegExp(what+'+','g');
	return this.replace(re, with_this);
};

String.prototype.toRegExp = function() {
	var val = this;
	var pts = [];
	if(!ivar.regex.regex.test(val))
		pts[1] = val;
	else
		pts = ivar.regex.regex.exec(val);
	try {
		return new RegExp(pts[1], pts[2]);
	} catch (e) {
		return false;
	}
};

String.prototype.parseJSON = function() {
	if(/^\s*\{.*\}\s*$/.test(this)) {
		try {
			return JSON.parse(this);	
		} catch(e) {
			return;
		}
	}
	return;
};

String.prototype.wrap = function(pref, suf) {
	if (suf === undefined) suf = pref;
	return pref+this+suf;
};

String.prototype.unwrap = function(pref, suf) {
	var str = this;
	if (suf === undefined) suf = pref;
	str = str.removePrefix(pref);
	str = str.removeSuf(pref);
	return str;
};

ivar.getFunction = function(str) {
	var fn = ivar.getProperyByNamespace(str);
	return ivar.isFunction(fn)? fn : undefined;
};

ivar.getFunctions = function(str, delimiter) {
	if(delimiter === undefined)
		delimiter = ' ';
	var fns = str.split(delimiter);
	var res = [];
	for(var i = 0; i < fns.length; i++) {
		var fn = ivar.getFunction(fns[i]);
		if(fn)
			res.push(current);
	}
	return res;
};

String.prototype.func = function() {
	var fns = ivar.getFunctions(this);
	for(var i = 0; i < fns.length; i++) {
		fns[i](arguments);
	}
};

Function.prototype.parseName = function() {
	return ivar.regex.function_name.exec(this.toString())[1];
};

Function.prototype.method = function(func, func_name) {
	if (func_name === undefined)
		func_name = func.parseName();
	this.prototype[func_name] = func;
};

//TODO: What about inheriting the constructors??? test test test
Function.prototype.inherit = function(classes) {
	var i = 0;
	var _classes = [];
	while (arguments.hasOwnProperty(i)) {
		_classes.push(arguments[i]);
		var inst = arguments[i];
		if (typeof inst === 'function')
			inst = new inst();
		
		for (var j in inst)
			this.prototype[j] = inst[j];
		i++;
	}
	
	if (_classes.length === 1)
		_classes = _classes[0];
	this.prototype['__super__'] = _classes;
};

Array.prototype.chain = function() {
	var res = undefined;
	var args = [];
	
	var i = 0;
	while (arguments.hasOwnProperty(i)) {
		args.push(arguments[i]);
		i++;
	}
	
	for (var i = 0; i < this.length; i++) {
		if(typeof this[i] === 'function') {
			if (res !== undefined)
				args = [res].concat(args);
			res = this[i].apply(this[i], args);
			args = [];
		} else {
			args.push(this[i]);
		}
	}
	return res;
};

ivar.regexpGetFlags = function(re) {
	re = re.toString();
	return re.substring(re.lastIndexOf('/')+1, re.length);
};

ivar.regexpHasFlag = function(re, flag) {
	var t = new RegExp(flag, 'i');
	return t.test(ivar.regexpGetFlags(re));
};

ivar.regexpAddFlag = function(re, flag) {
	var ore = re;
	re = re.toString().removeFirst();
	var lio = re.lastIndexOf('/');
	var f = re.substring(lio+1, re.length);
	var t = new RegExp(flag,'i');
	re = re.substring(0, lio);
	if (!t.test(f))
		return new RegExp(re, flag+f);
	else
		return ore;
};

ivar.regexpCombine = function(arr, flags) {
	var lock = false;
	if (flags) lock = true;
	var res = [];
	if(arr.length > 1) {
		for (var i = 0; i < arr.length; i++) {
			arr[i] = arr[i].toString().removePrefix('/');
			var lio = arr[i].lastIndexOf('/');
			if(!lock) {
				var suf = arr[i].substring(lio+1, arr[i].length);
				flags = suf;
				if(/[mig]{3}/.test(flags)) {
					lock = true;
				}
			}
			arr[i] = arr[i].substring(0, arr[i].lastIndexOf('/'));
			res.push(arr[i].wrap('(',')'));
		}
	} else {
		return arr[0];
	}
	
	return new RegExp(res.join('|'), flags);
};

//TODO: what if i want to find only one occurrence?
//XXX: buggy in a way... Validates #hash#hash even though a #hash needs space up front, because after every substring it is valid because of the beginning og the string
ivar.findAndChange = function(str, regex, fn) {
	var f = null;
	var res = [];
	var id = 0;
	while ((f = regex.exec(str)) !== null) {
		id += f.index;
		var m = fn(f, id);
		res.push(str.substring(0, f.index));
		res.push(m);
		
		str = str.substring(f.index+f[0].length, str.length);
		if(regex.lastIndex) regex.lastIndex = 0;
		id += f[0].length;
		
	}
	res.push(str);
	return res.join('');
};

String.prototype.wrapped = function(pref, suf) {
	if (suf === undefined) suf = pref;
	return this.startsWith[pref] && this.endsWith[suf];
};

String.prototype.htmlWrap = function(tagname, attribs) {
	var pref = '<'+tagname;
	if (attribs)
	for (var i in attribs) {
		pref += ' '+i+'="'+attribs[i]+'" ';
	}
	pref += '>';
	var suf = tagname.wrap('</','>');
	return this.wrap(pref, suf);
};

String.prototype.htmlWrapped = function(tagname) {
	//TODO
};

String.prototype.htmlUnwrap = function(tagname) {
	//TODO
};

ivar.textToHtml = function(str) {
	var broken = str.split('\n');
	for (var i = 0; i < broken.length; i++) {
		broken[i] = ivar.findAndChange(broken[i], ivar.regex.getURIs, function(f){
			return f[0].htmlWrap('a',{href: f[0]});
		});
	}
	return broken.join('<br />');
};

ivar.htmlToText = function(str) {
	return ivar.findAndChange(str, /<([^>]+)>/m, function(f){ 
		if(f[1] === 'br' || f[1] === 'br\\') {
			return '\n';
		} else {
			return '';
		} 
	});
};

ivar.iso8601toDate = function(str, this_timezone) {
	//TODO: parsing and setting the timezone
	//TODO: other forms of the standard, with week... bwah...
	var res = {};
	try {
		res.year = parseInt(str.substring(0,4),10);
        res.month = parseInt(str.substring(5,7),10);
        res.day = parseInt(str.substring(8,10),10);
        res.hour = parseInt(str.substring(11,13),10);
        res.minute = parseInt(str.substring(14,16),10); 
        res.second = parseInt(str.substring(17,19),10);
		
		for (var i in res) {
			if(isNaN(res[i])) res[i] = 0;
		}
		
		var date_obj = new Date(res.year, res.month-1, res.day, res.hour, res.minute, res.second);
		return !this_timezone ? date_obj : new Date(date_obj.getTime() - new Date().getTimezoneOffset()*60*1000);
	} catch(e) {
		new Error('Not a valid iso8601 format!');
	}
};

ivar.dateToIso8601 = function(date) {
	try {
		var year = date.getFullYear();
		var month = date.getMonth() + 1;
		if (month < 10) month = '0'+ month;
		var day = date.getDate();
		if (day < 10) day = '0'+ day;
		var hour = date.getHours();
		if (hour < 10) hour = '0'+ hour;
		var minute = date.getMinutes();
		if (minute < 10) minute = '0'+ minute;
		var second = date.getSeconds();
		if (second < 10) second = '0'+ second;
	
		return year+'-'+month+'-'+day+'T'+hour+':'+minute+':'+second+'+00:00';
	} catch(e) {
		new Error('Not a Date object!');
	}
};

ivar.mysqlDATETIMEtoIso8601 = function (mysql_date) {
	return mysql_date.split(' ').join('T')+'+00:00';
}

ivar.getExtension = function (uri, arr) {
	var rm = uri.match(new RegExp('(\.'+arr.join(')|(\.')+')$','i'));
	return rm ? rm[0].toLowerCase().removeFirst() : null;
}


ivar.buildquery = function(obj) {
	var res = [];
	for (var i in obj) {
		res.push(i+'='+ encodeURIComponent(obj[i]));
	}
	return res.join('&');
}

ivar.request = function(opt, callback) {
	var defs = {
		method: 'GET',
		async: true,
		thisArg: null
	};
	
	if(ivar.isSet(opt))
		ivar.extend(defs, opt);
	
    var request = new XMLHttpRequest();
    
    var args = [];
	args.push(request);
	
	var addargs = [];
	ivar.eachArg(arguments, function(i, elem) {
		if(i > 1) {
			addargs.push(elem);
		}
	});
	
    request.onload = function(e) {
    	args.push(e);
    	args = args.concat(addargs);
		if(callback) {
			callback.apply(defs.thisArg, args);			
		}
	}
	
	if(ivar.isSet(defs.uri) && ivar.isSet(defs.query))
		defs.uri = defs.uri+'?'+ivar.buildquery(defs.query);
	
	try {
    	request.open(defs.method, defs.uri, defs.async, defs.user, defs.password);
    } catch(e) {
    	return;
    }
	
	if(ivar.isSet(defs.header)) {
		for(var i in defs.header) {
			request.setRequestHeader(i, defs.header[i]);
		}
	}
    
    try {
    	request.send(defs.message);
    } catch(e) {
    	return;
    }
    
    return request;
};

ivar.eachArg = function(args, fn, start_from, end_where) {
	var i = start_from || 0;
	for (i; i < args.length; i++ ) {
		if (end_where !== undefined && i === end_where)
			return i;
		if (fn !== undefined)
			fn(i, args[i]);
	}
	return i;
};

ivar.getProperties = function(obj, re) {
	return ivar.unzip(obj, re)[0];
};

ivar.getValues = function(obj, re) {
	return ivar.unzip(obj, re)[1];
};

//TODO: enhance with orderedStringify
ivar.zip = function(p, v) {
	var res = {};
	for (var i = 0; i < p.length; i++) {
		res[p[i]] = v[i];
	}
	return res;
}

ivar.unzip = function(obj, re) {
	var props = [];
	var vals = []
	var cond = false;
	
	if (re) {
		if(ivar.whatis(re) !== 'regexp')
			re = re.toRegExp();
		cond = true;
	}
	
	for(var i in obj) {
		if(cond && !re.test(i)) continue;
		props.push(i);
		vals.push(obj[i]);
	}
	
	return [props, vals];
};

ivar.countProperties = function(obj, fn) {
	var count = 0;
	for(var i in obj) {
		count++;
		if(fn) fn(count, i);
	}
	return count;
};

ivar.orderedStringify = function(o, fn) {
	var val = o;
	var type = ivar.types[ivar.whatis(o)];
	if(type === 6) {
		val = ivar._objectOrderedStrignify(o, fn);
    } else if(type === 5) {
    	val = ivar._arrayOrderedStringify(o, fn);
    } else if(type === 4) {
    	val = '"'+val+'"';
    }
    
    if(type !== 7)
    	return val;
};

ivar._objectOrderedStrignify = function(o, fn) {
	var res = '{';
	var props = ivar.keys(o);
	props = fn ? props.sort(fn): props.sort();
	
	for(var i = 0; i < props.length; i++) {
		var val = ivar.orderedStringify(o[props[i]], fn);
        if(val !== undefined)
        	res += '"'+props[i]+'":'+ val+',';
	}
	var lid = res.lastIndexOf(',');
	if (lid > -1)
		res = res.substring(res, lid);
    return res+'}';
};

ivar._arrayOrderedStringify = function(a, fn) {
	var res = '[';
	for(var i = 0; i < a.length; i++) {
		var val = ivar.orderedStringify(a[i], fn);
        if(val !== undefined)
        	res += ''+ val+',';
	}
	var lid = res.lastIndexOf(',');
	if (lid > -1)
		res = res.substring(res, lid);
	return res+']';
};

ivar.sortProperties = function(o, fn) {
	var res = {};
	var props = ivar.keys(o);
	props = fn ? props.sort(fn): props.sort();
	
	for(var i = 0; i < props.length; i++) {
		res[props[i]] = o[props[i]];
	}
	return res;
};

ivar.deepSortProperties = function(o, fn) {
	var res = o;
	var type = ivar.types[ivar.whatis(o)];
	if(type === 6) {
		res = ivar._objectSortProperties(o, fn);
    } else if(type === 5) {
    	res = ivar._arraySortProperties(o, fn);
    }
	return res;
};

ivar._objectSortProperties = function(o, fn) {
	var res = {};
	var props = ivar.keys(o);

	props = fn ? props.sort(fn): props.sort();
	for(var i = 0; i < props.length; i++) {
		res[props[i]] = ivar.deepSortProperties(o[props[i]]);
	}
	return res;
};

ivar._arraySortProperties = function(a, fn) {
	var res = [];
	for(var i = 0; i < a.length; i++) {
        res[i] = ivar.deepSortProperties(a[i]);
	}
	return res;
};

ivar._private.def_buildFnList = function(str) {
	var args = str.split(',');
	var argSets = [];
	var temp = [];
	var pref = '*';
	for(var i = 0; i < args.length; i++) {
		var notMandatory = args[i].startsWith(pref);
		if (notMandatory) {
			if (argSets.length === 0)
				argSets.push(temp.join());
			args[i] = args[i].removePrefix(pref);
			
		}
		
		temp.push(args[i]);
		
		if (notMandatory)
			argSets.push(temp.join());
	}
	if(argSets.length === 0)
		argSets.push(temp.join());
		
	return argSets;
};

//TODO: number and ? (any type) it will require a tree search, develop what you have started
//TODO: this really requires more thought
ivar.def = function(functions, parent) {
	var fn = {};
	if (typeof functions === 'function') {
		fn = functions;
	} else {
		for(var i in functions) {
			var trmd = i.replace(/\s*/g,''); //trim space
			
			if(!/^(null|undefined|boolean|integer|float|string|function|object|date|regexp|default)(,\*?(null|undefined|boolean|integer|float|string|function|object|date|regexp))*$/.test(trmd)) {
				throw "Invalid arguments data types string";	
			}
			
			
			if(i.indexOf('*') > -1) {
				var argSets = ivar._private.def_buildFnList(trmd);
		
				for(var j = 0; j < argSets.length; j++) {
					fn[argSets[j]] = functions[i];
				}
			} else {
				fn[trmd] = functions[i];
			}
		}
	}
	
	return function() {
		var types = [];
		var args = [];
		ivar.eachArg(arguments, function(i, elem) {
			args.push(elem);
			types.push(ivar.whatis(elem));
		});
		var key = types.join();
		if (fn.hasOwnProperty(key)) {
			return fn[key].apply(parent, args);
		} else {
			if (typeof fn === 'function')
				return fn.apply(parent, args);
			if (fn.hasOwnProperty('default'))
				return fn['default'].apply(parent, args);		
		}
	};
};

/**
 *	Checks if the variable is set or exists
 *
 *	@param	{any}	val		Any variable or property
 *	@return	{boolean}
 */
ivar.isSet = function(val) {
	return (val !== undefined) && (val !== null);
};

/**
 *	Checks if the variable is empty. Array with the length of 0, 
 *	empty string or empty object.
 *
 *	@param	{array|object|string}	obj		Any variable or property
 *	@return	{boolean}
 */
ivar.isEmpty = function(obj) {
	if (obj.length && obj.length > 0)
		return false;

	for (var key in obj) {
		if (hasOwnProperty.call(obj, key))
			return false;
	}
	return true;
};

/**
 *	System out print regular information shortcut. Prints to console or alert
 *	if console is unavailable.
 *
 *	@param	{any}	e		Message in a form of a string or any other object that can be presented in console
 */
ivar.echo = function(e) {
	var args = [];
	args.push('log');
	ivar.eachArg(arguments, function(i, elem){
		args.push(elem);
	});
	
	ivar.systemMessage.apply(null, args);
};

/**
 *	System out print warning information shortcut. Prints to console or alert
 *	if console is unavailable.
 *
 *	@param	{any}	e		Message in a form of a string or any other object that can be presented in console
 */
ivar.warn = function warning(e) {
	var args = [];
	args.push('warn');
	ivar.eachArg(arguments, function(i, elem){
		args.push(elem);
	});
	ivar.systemMessage.apply(null, args);
};

/**
 *	System out print error information shortcut. Prints to console or alert
 *	if console is unavailable.
 *
 *	@param	{any}	e		Message in a form of a string or any other object that can be presented in console
 */
ivar.error = function error(e) {
	if (!ivar.isSet(arguments[0]) || (arguments[0] === '') || (arguments[0] === ' '))
		arguments[0] = '[ERROR]: in function "' + arguments.callee.caller.parseName() + '"';
	var args = [];
	args.push('error');
	ivar.eachArg(arguments, function(i, elem){
		args.push(elem);
	});
	ivar.systemMessage.apply(null, args);
};

ivar.setDebugOutput = function(fn) {
	ivar._private.output = fn;
};

ivar._private.consolePrint = function(obj) {
	if (obj.msgs.length === 0) {
		console[obj.type](obj.title);
	} else {
		if ((obj.type === 'log') || (obj.type === 'warn'))
			console.groupCollapsed(obj.title);
		else
			console.group(obj.title);
		
		obj.msgs.each(function(i, elem) {
			console[obj.type](elem);
		});
		
		console.groupEnd();	
	}
};

ivar._private.alertPrint = function(obj) {
	if (obj.msgs.length === 0) {
		alert('[' + obj.type + '] ' + obj.title);
	} else {
		var resMsg = ['[' + obj.type + '] ' +obj.title, '------'];
		//resMsg.concat(obj.msgs); doesnt work for some reason
		alert(resMsg.join('\n')+'\n'+obj.msgs.join('\n'));
	}
};

/**
 *	System out print. Prints to console or alert
 *	if console is unavailable.
 *
 *	@param	{string}	fn		Function name of console object: log, warn, error...
 *	@param	{any}		msg		Message in a form of a string or any other object that can be presented in console. Or if other arguments are present it is used as a label of set of console outputs
 *	@param 	{any}		[obj1,[obj2,...]]	
 */
ivar.systemMessage = function(fn, msg) {
	var multi = ivar.isSet(arguments[2]);
	var consoleExists = ivar.isSet(ivar._global.console) && ivar.isSet(ivar._global.console[fn]);
	var obj = {
		type: fn,
		title: arguments[1],
		msgs: []
	};

	if (multi) {
		ivar.eachArg(arguments, function(i, elem){
			if (i > 1)
				obj.msgs.push(elem);
		});
	}
		
	if (consoleExists && ivar.DEBUG)
		ivar._private.consolePrint(obj);
	if (ivar.isSet(ivar._private.output))
		ivar._private.output(obj);
	else
		if (!consoleExists && ivar.DEBUG)
			ivar._private.alertPrint(obj);
};

ivar.is = function(obj, type) {
	if (type === 'number')
		return ivar.isNumber(obj);
	if (ivar.whatis(obj) === type)
		return true;
	if (type === 'empty')
		return ivar.isEmpty(obj);
	if (type === 'set')
		return ivar.isSet(obj);
	return false;
};

ivar.isArray = function(val) {
	return ivar.is(val, 'array');
};

ivar.isNumber = function(val) {
	if (isNaN(val))
		return false;
		
	var type = typeof val;
	if (type === 'object')
		type = ivar.getClass(val).toLowerCase();
		
	return type === 'number';
};

ivar.isInt = function(val) {
	return ivar.is(val, 'integer');
};

ivar.isFloat = function(val) {
	return ivar.is(val, 'float');
};

ivar.isString = function(val) {
	return ivar.is(val,'string');
};

ivar.isObject = function(val) {
	return ivar.is(val, 'object');
};

ivar.isFunction = function(val) {
	return ivar.is(val, 'function');
};

ivar.isDate = function(val) {
	return ivar.is(val,'date');
};

ivar.isBool = function(val) {
	return ivar.is(val, 'boolean');
};

ivar.isRegExp = function(val) {
	return ivar.is(val, 'regexp');
};

ivar.isNull = function(val) {
	return val === null;
};

ivar.isUndefined = function(val) {
	return val === undefined;
};

ivar.getClassName = function(val) {
	return val.constructor.parseName();
}

ivar.whatis = function(val) {

	if (val === undefined)
		return 'undefined';
	if (val === null)
		return 'null';
		
	var type = typeof val;
	
	if (type === 'object')
		type = ivar.getClass(val).toLowerCase();
	
	if (type === 'number') {
		if (val.toString().indexOf('.') > 0)
			return 'float';
		else
			return 'integer';
	}
	
	return type;
};

ivar.keys = function(o) {
	if(Object.keys)
		return Object.keys(o);
	var res = [];
	for (var i in o) {
		res.push(i);
	}
	return res;
};

/**
 *	Compares two objects
 *
 *	@param	{object}	a		Any object with properties
 *	@param	{object}	b		Any object with properties
 *	@return	{boolean}			True if equal
 */
ivar.compareObjects = function(a, b) {
	if (a === b)
		return true;
	for(var i in a) {
		if(b.hasOwnProperty(i)) {
			if(!ivar.equal(a[i],b[i])) return false;
		} else {
			return false;
		}
	}
	
	for(var i in b) {
		if(!a.hasOwnProperty(i)) {
			return false;
		}
	}
	return true;
};

ivar.compareArrays = function(a, b) {
	if (a === b)
		return true;
	if (a.length !== b.length)
		return false;
	for(var i = 0; i < a.length; i++){
		if(!ivar.equal(a[i], b[i])) return false;
	};
	return true;
};

ivar._equal = {};
ivar._equal.array = ivar.compareArrays;
ivar._equal.object = ivar.compareObjects;
ivar._equal.date = function(a, b) {
	return a.getTime() === b.getTime();
};
ivar._equal.regexp = function(a, b) {
	return a.toString() === b.toString();
};
ivar._equal['function'] = ivar._equal.regexp;

//	uncoment to support function as string compare
//	ivar._equal.fucntion =  ivar._equal.regexp;
 
 
 
/*
 * Are two values equal, deep compare for objects and arrays.
 * @param a {any}
 * @param b {any}
 * @return {boolean} Are equal?
 */
ivar.equal = function(a, b) {
	if (a !== b) {
		var atype = ivar.whatis(a), btype = ivar.whatis(b);
 
		if (atype === btype)
			return ivar._equal.hasOwnProperty(atype) ? ivar._equal[atype](a, b) : a==b;
 
		return false;
	}
 
	return true;
};

/**
 *	Extends properties of a second object into first, overwriting all of it's properties if 
 *	they have same properties. Used for loading options.
 *	
 *	@param	{object}	extended	First object to be extended
 *	@param	{object}	extender	Second object extending the first one
 *	@return	{object}				Returns cloned object
 */
ivar.extend = function(o1, o2, if_not_exists) {
	for (var i in o2) {
		if (!(ivar.isSet(o1[i]) && if_not_exists)) {
			if (ivar.whatis(o1[i]) === 'object' && ivar.whatis(o2[i]) === 'object') {
				ivar.extend(o1[i], o2[i], if_not_exists);
			} else {
				o1[i] = o2[i]
			}
		}
	}
	
	return o1;
};

ivar.extendToLevel = function(o1, o2, lvl, if_not_exists) {
	var count = 0;	
	return ivar._extendToLevel(o1, o2, lvl, if_not_exists, count);
};

ivar._extendToLevel = function(o1, o2, lvl, if_not_exists, count) {
	for (var i in o2) {
		if (!(ivar.isSet(o1[i]) && if_not_exists)) {
			if (lvl > count && ivar.whatis(o1[i]) === 'object' && ivar.whatis(o2[i]) === 'object') {
				count++;
				ivar._extendToLevel(o1, o2, lvl, if_not_exists, count);
			} else {
				o1[i] = o2[i];
			}
		}
	}
	
	return o1;
};

//Clones arrays and objects
//TODO: date, regexp
ivar.clone = function(o) {
	var res = null;
	var type = ivar.types[ivar.whatis(o)];
	if(type === 6) {
		res = ivar._cloneObject(o);
    } else if(type === 5) {
    	res = ivar._cloneArray(o);
    } else {
    	res = o;
    }
    return res;
};

ivar._cloneObject = function(o) {
	var res = {};
	for(var i in o) {
		res[i] = ivar.clone(o[i]);
	}
	return res;
};

ivar._cloneArray = function(a) {
	var res = [];
	for(var i = 0; i < a.length; i++) {
		res[i] = ivar.clone(a[i]);
	}
	return res;
};

/* Provide element and declared functions under the same name as expected attributes of the element. Parse attr values with declared functions and return the parsed value to an object that will be the result at the end */
//XXX: This is a DOM tool
ivar.parseElementAttributes = function (elem, decl_fns) {
	var res = {};
	var attr_names = [];
	for (var i = 0; i < elem.attributes.length; i++) {
		var attr = elem.attributes[i];
		//TODO: parse all arguments by provided REGEXP
		if(decl_fns !== undefined && decl_fns.hasOwnProperty(attr.name)) {
			var args = [];
			args.push(attr.value);
			args.push(attr.name);
			args.push(elem);
			args.push(res);
			ivar.eachArg(arguments, function(i, elem) {
				if(i > 1)
					args.push(elem);
			});
			var r = null;
			if (typeof decl_fns[attr.name] === 'function') {
				r = decl_fns[attr.name].apply(null, args);
			}
			
			if (r === null)
				r = attr.value;
			
			var last_del_id = attr.name.lastIndexOf('_');
			if (last_del_id > -1) {
				var attr_pref = attr.name.substring(0, last_del_id);
				var attr_suf = attr.name.substring(last_del_id+1, attr.name.length);
				var node = ivar.namespace(attr_pref, res, '_');
				node[attr_suf] = r;
			} else {
				res[attr.name] = r;
			}
			attr_names.push(attr.name);
		}
	}
	
	for (var i = 0; i < attr_names.length; i++) {
		elem.removeAttribute(attr_names[i]);
	}
	return res;
}

/**
 *	"Short" for loop. Should force me to separate inner loops into functions.
 *	
 *	@param	{number}	times	Number of times to spin the function
 *	@param	{function}	fn		Function to be spun for the given number of times
 *	@param	{number}	[step=1]	Direction of loop depending on positive or negative value, increases or decreases count by given step
 */
ivar.loop = function(times, fn, step) {
	var count = 0;
	if (!step)
		step = 1;
	else
		if (step < 0)
			count = times - 1;

	for (var i = 0; i < times; i++) {
		fn(count);
		count = count + step;
	}
};

ivar.findValue = function(obj, val) {
	for (var i in obj) {
		if (obj[i] === val)
			return i;
	}
	return;
};

ivar.Timer = function Timer(fn, timeout, count, now) {
	if(now === undefined) now = true;
	this.fn = fn;
	count = count-1
	var i = 0;
	var finite = function() {
		fn(i);
		if(i < count) {
			i++;
		} else {
			i = 0;
		}
	}
	
	var infinite = function() {
		fn(i);
		i++;
	}
	
	if(count !== undefined && count > -1) {
		if(count > 0)
			this.fn = finite;
		else
			this.fn = infinite;
	}
	
	this.timeout = timeout;
	var now = now;
	var timer_id = null;
	this.stopped = false;
	
	
	this.start = function() {
		this.stopped = false;
		if(now) this.fn();
		timer_id = window.setInterval(this.fn, this.timeout);
	};

	this.stop = function() {
		this.stopped = true;
		window.clearInterval(timer_id);
	};
	
	this.restart = function() {
		i = 0;
	}
};

/**
 *	Generates a random string identifier 
 *	from a timestamp, a random char of a random case and a hex number from combined timestamp and salt_size
 *	@param {integer} salt_size
 */
ivar.uid = function(salt_size) {
	if (!ivar.isSet(salt_size))
		salt_size = 100;
	var i = 97;
	if (Math.rand(0, 1) == 0)
		i = 65;
	var num = Date.now() * salt_size + Math.rand(0, salt_size);
	return String.fromCharCode(Math.rand(i, i + 25)) + num.toString(16);
};

//This function makes you be absolutely sure that the object has unique id in a collection, @see ivar.uid() it has a small chance but it has a chance to produce the same key.
ivar.setUniqueObject = function(obj, collection) {
	if (!ivar.isSet(obj))
		obj = {};
	if (!ivar.isSet(collection))
		collection = ivar._global;
	var uid = ivar.uid();
	while (collection[uid])
		uid = ivar.uid();
	obj.__uid__ = uid;
	
	collection[uid] = obj;
	return obj;
};

ivar.findScriptPath = function(script_name) {
	var script_elems = document.getElementsByTagName('script');
	for (var i = 0; i < script_elems.length; i++) {
		if (script_elems[i].src.endsWith(script_name)) {
			var href = window.location.href;
			href = href.substring(0, href.lastIndexOf('/'));
			var url = script_elems[i].src.removeSufix(script_name);
			return url.substring(href.length+1, url.length);
		}
	}
	return '';
};

ivar._private.onReady = function() {
	if (!ivar.LOADED) {
		ivar._private.on_ready_fn_stack.each(function(i, obj) {
			ivar._private.on_ready_fn_stack[i]();
		});
		ivar.LOADED = true;
	}
};

ivar.isGlobal = function(var_name, root) {
	if (!ivar.isSet(root))
		root = ivar._global;
	return root.hasOwnProperty(var_name); 
};

ivar.isPrivate = function(var_name) {
	return var_name.startsWith('_'); 
};

ivar.isConstant = function(var_name) {
	return !var_name.hasLowerCase();
};

ivar.referenceInNamespace = function(object, target) {
	if(!ivar.isSet(target))
		target = ivar._global;
	for(var i in object) {
		if (!ivar.isGlobal(i, target) && !ivar.isPrivate(i) && !ivar.isConstant(i))
			ivar._global[i] = ivar[i];
	}
};

ivar.namespaceToUri = function(script_name, url) {
	var np = script_name.split('.');
	if (np.getLast() === '*') {
		np.pop();
		np.push('_all');
	} else if (np.getLast() === 'js') {
		np.pop();
	}
	
	if (!ivar.isSet(url))
		url = '';
		
	script_name = np.join('.');
	return  url + np.join('/')+'.js';
};

ivar.injectScript = function(script_name, uri, callback, prepare, async) {
	if (ivar.isSet(prepare))
		prepare(script_name, uri);
	
	var script_elem = document.createElement('script');
	script_elem.type = 'text/javascript';
	script_elem.title = script_name;
	script_elem.src = uri;
	if(!ivar.isSet(async))
		async = false;
	script_elem.async = async;
	script_elem.defer = false;
	if (ivar.isSet(callback)) {
		script_elem.onload = function(e) {
			callback(script_name, uri);
		};
	}
	
	document.getElementsByTagName('head')[0].appendChild(script_elem);
};

ivar._private.requireCallback = function(script_name, uri) {
	ivar._private.loading.length--;
	delete ivar._private.loading.scripts[script_name];
	ivar._private.imported[script_name] = uri;
	//ivar.referenceInNamespace(ivar);
	if (ivar._private.loading.length == 0)
		ivar._private.onReady();
};

ivar._private.requirePrepare = function(script_name, uri) {
	ivar._private.loading.scripts[script_name] = uri;
	ivar._private.loading.length++;
};

//TODO: test it
//TODO: needs to wait for html finish
//TODO: check if the script exist before importing it!!!
ivar.require = function(script_name, async) {
	var uri = '';
	if (script_name.indexOf('/') > -1) {
		uri = script_name;
		var lastSlash = uri.lastIndexOf('/');
		script_name = uri.substring(lastSlash+1, uri.length);
	} else {
		
		uri = ivar.namespaceToUri(script_name, ivar._private.libpath);
	}
	
	if (!ivar._private.loading.scripts.hasOwnProperty(script_name) 
	 && !ivar._private.imported.hasOwnProperty(script_name)) {
		ivar.injectScript(script_name, uri, 
			ivar._private.requireCallback, 
				ivar._private.requirePrepare, async);
	}
};

ivar.ready = function(fn) {
	ivar._private.on_ready_fn_stack.push(fn);
};

/************ BORROWED CODE - START *************/

//Thanks to perfectionkills.com <http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/>
ivar.getClass = function(val) {
	return Object.prototype.toString.call(val)
		.match(/^\[object\s(.*)\]$/)[1];
};

function preg_quote( str ) {
    // http://kevin.vanzonneveld.net
    // +   original by: booeyOH
    // +   improved by: Ates Goral (http://magnetiq.com)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Onno Marsman
    // *     example 1: preg_quote("$40");
    // *     returns 1: '\$40'
    // *     example 2: preg_quote("*RRRING* Hello?");
    // *     returns 2: '\*RRRING\* Hello\?'
    // *     example 3: preg_quote("\\.+*?[^]$(){}=!<>|:");
    // *     returns 3: '\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:'

    return (str+'').replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1");
}

/**
 *	Parses string value into correct javascript data type
 *	@copyleft 2011 by Mozilla Developer Network
 *
 *	@param 	{string}	sValue
 *	@return {null|boolean|number|date}
 */
ivar.parseText = function(sValue) {
	var rIsNull = /^\s*$/, rIsBool = /^(?:true|false)$/i;
	if (rIsNull.test(sValue)) { return null; }
	if (rIsBool.test(sValue)) { return sValue.toLowerCase() === "true"; }
	if (isFinite(sValue)) { return parseFloat(sValue); }
	if (isFinite(Date.parse(sValue))) { return new Date(sValue); }
	return sValue;
};

/*   
=============================================================================== 
Crc32 is a JavaScript function for computing the CRC32 of a string 
............................................................................... 
 
Version: 1.2 - 2006/11 - http://noteslog.com/category/javascript/ 
 
------------------------------------------------------------------------------- 
Copyright (c) 2006 Andrea Ercolino 
http://www.opensource.org/licenses/mit-license.php 
=============================================================================== 
*/ 

ivar.crc32_table = [0x00000000, 0x77073096, 0xEE0E612C, 0x990951BA, 0x076DC419, 0x706AF48F, 0xE963A535,	0x9E6495A3, 0x0EDB8832, 0x79DCB8A4, 0xE0D5E91E, 0x97D2D988, 0x09B64C2B, 0x7EB17CBD, 0xE7B82D07, 0x90BF1D91, 0x1DB71064, 0x6AB020F2, 0xF3B97148, 0x84BE41DE, 0x1ADAD47D, 0x6DDDE4EB, 0xF4D4B551, 0x83D385C7, 0x136C9856, 0x646BA8C0, 0xFD62F97A, 0x8A65C9EC, 0x14015C4F, 0x63066CD9, 0xFA0F3D63, 0x8D080DF5, 0x3B6E20C8, 0x4C69105E, 0xD56041E4, 0xA2677172, 0x3C03E4D1, 0x4B04D447, 0xD20D85FD, 0xA50AB56B, 0x35B5A8FA, 0x42B2986C, 0xDBBBC9D6, 0xACBCF940, 0x32D86CE3, 0x45DF5C75, 0xDCD60DCF, 0xABD13D59, 0x26D930AC, 0x51DE003A, 0xC8D75180, 0xBFD06116, 0x21B4F4B5, 0x56B3C423, 0xCFBA9599, 0xB8BDA50F, 0x2802B89E, 0x5F058808, 0xC60CD9B2, 0xB10BE924, 0x2F6F7C87, 0x58684C11, 0xC1611DAB, 0xB6662D3D, 0x76DC4190, 0x01DB7106, 0x98D220BC, 0xEFD5102A, 0x71B18589, 0x06B6B51F, 0x9FBFE4A5, 0xE8B8D433, 0x7807C9A2, 0x0F00F934, 0x9609A88E, 0xE10E9818, 0x7F6A0DBB, 0x086D3D2D, 0x91646C97, 0xE6635C01, 0x6B6B51F4, 0x1C6C6162, 0x856530D8, 0xF262004E, 0x6C0695ED, 0x1B01A57B, 0x8208F4C1, 0xF50FC457, 0x65B0D9C6, 0x12B7E950, 0x8BBEB8EA, 0xFCB9887C, 0x62DD1DDF, 0x15DA2D49, 0x8CD37CF3, 0xFBD44C65, 0x4DB26158, 0x3AB551CE, 0xA3BC0074, 0xD4BB30E2, 0x4ADFA541, 0x3DD895D7, 0xA4D1C46D, 0xD3D6F4FB, 0x4369E96A, 0x346ED9FC, 0xAD678846, 0xDA60B8D0, 0x44042D73, 0x33031DE5, 0xAA0A4C5F, 0xDD0D7CC9, 0x5005713C, 0x270241AA, 0xBE0B1010, 0xC90C2086, 0x5768B525, 0x206F85B3, 0xB966D409, 0xCE61E49F, 0x5EDEF90E, 0x29D9C998, 0xB0D09822, 0xC7D7A8B4, 0x59B33D17, 0x2EB40D81, 0xB7BD5C3B, 0xC0BA6CAD, 0xEDB88320, 0x9ABFB3B6, 0x03B6E20C, 0x74B1D29A, 0xEAD54739, 0x9DD277AF, 0x04DB2615, 0x73DC1683, 0xE3630B12, 0x94643B84, 0x0D6D6A3E, 0x7A6A5AA8, 0xE40ECF0B, 0x9309FF9D, 0x0A00AE27, 0x7D079EB1, 0xF00F9344, 0x8708A3D2, 0x1E01F268, 0x6906C2FE, 0xF762575D, 0x806567CB, 0x196C3671, 0x6E6B06E7, 0xFED41B76, 0x89D32BE0, 0x10DA7A5A, 0x67DD4ACC, 0xF9B9DF6F, 0x8EBEEFF9, 0x17B7BE43, 0x60B08ED5, 0xD6D6A3E8, 0xA1D1937E, 0x38D8C2C4, 0x4FDFF252, 0xD1BB67F1, 0xA6BC5767, 0x3FB506DD, 0x48B2364B, 0xD80D2BDA, 0xAF0A1B4C, 0x36034AF6, 0x41047A60, 0xDF60EFC3, 0xA867DF55, 0x316E8EEF, 0x4669BE79, 0xCB61B38C, 0xBC66831A, 0x256FD2A0, 0x5268E236, 0xCC0C7795, 0xBB0B4703, 0x220216B9, 0x5505262F, 0xC5BA3BBE, 0xB2BD0B28, 0x2BB45A92, 0x5CB36A04, 0xC2D7FFA7, 0xB5D0CF31, 0x2CD99E8B, 0x5BDEAE1D, 0x9B64C2B0, 0xEC63F226, 0x756AA39C, 0x026D930A, 0x9C0906A9, 0xEB0E363F, 0x72076785, 0x05005713, 0x95BF4A82, 0xE2B87A14, 0x7BB12BAE, 0x0CB61B38, 0x92D28E9B, 0xE5D5BE0D, 0x7CDCEFB7, 0x0BDBDF21, 0x86D3D2D4, 0xF1D4E242, 0x68DDB3F8, 0x1FDA836E, 0x81BE16CD, 0xF6B9265B, 0x6FB077E1, 0x18B74777, 0x88085AE6, 0xFF0F6A70, 0x66063BCA, 0x11010B5C, 0x8F659EFF, 0xF862AE69, 0x616BFFD3, 0x166CCF45, 0xA00AE278, 0xD70DD2EE, 0x4E048354, 0x3903B3C2, 0xA7672661, 0xD06016F7, 0x4969474D, 0x3E6E77DB, 0xAED16A4A, 0xD9D65ADC, 0x40DF0B66, 0x37D83BF0, 0xA9BCAE53, 0xDEBB9EC5, 0x47B2CF7F, 0x30B5FFE9, 0xBDBDF21C, 0xCABAC28A, 0x53B39330, 0x24B4A3A6, 0xBAD03605, 0xCDD70693, 0x54DE5729, 0x23D967BF, 0xB3667A2E, 0xC4614AB8, 0x5D681B02, 0x2A6F2B94, 0xB40BBE37, 0xC30C8EA1, 0x5A05DF1B, 0x2D02EF8D]    
 
/* Number */ 
ivar.crc32 = function( /* String */ str, /* Number */ crc ) { 
    if( crc == window.undefined ) crc = 0; 
    var n = 0; //a number between 0 and 255 
    var x = 0; //an hex number 

    crc = crc ^ (-1); 
    for( var i = 0, iTop = str.length; i < iTop; i++ ) { 
        n = ( crc ^ str.charCodeAt( i ) ) & 0xFF; 
        crc = ( crc >>> 8 ) ^ ivar.crc32_table[n]; 
    } 
    return crc ^ (-1); 
};

/************ BORROWED CODE - END *************/

ivar._private.libpath = ivar.findScriptPath('main.js');
//XXX: ivar.referenceInNamespace(ivar);
