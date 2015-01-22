//ivar.require('ivar.patt.Events');
//ivar.require('ivar.data.jules');
//ivar.require('ivar.net.JSONRPC');
ivar.namespace('formality');

/**
 *  formality.js
 *  @require ivar.data.jules 
 *	@require ivar.net JSONRPC
 *
 *	FORMALITY is an extensible html form abstraction that enables complete 
 *	customization of forms adding flexibility, much like HTML5 forms, but better. It's main goal is to automatize
 *	form collection and submission to the server via ajax, and provide better 
 *	UX than traditional forms
 *
 *	@author Nikola Stamatovic Stamat
 *	@copyright IVARTECH <http://ivartech.com >
 *
 *	@since May 2013
 *	@lastupdate Jan/Feb 2015
 *
 *	@TODO: Create forms via schema!
 *	@TODO: refactor and document formality
 *	@TODO: formality xsl and namespace <f:input />
 *	@TODO: formality data tags
 */
 
 //TODO: FORMALITY INIT COMPLETE EVENT!!!!
 
 //TODO: FLAG to determine should the invalid field be warned or display an error
 
 //TODO: FLAG - ALL THE FIELDS OF THE SUBFORM, OR THE NOTED FIELDS MUST BE VALID OR NON EMPTY TO BE SUBMITTED TO THE SERVER
 //TODO: jules URI validation is no good... :|
 
 //TODO: What if more than one fields load, and that thing influences submit button.  You need to stack loading fields and resolve on completion.
 
 //TODO: Object array input module. A subform inputs N array elements, on get it returns an array. All fields are not included in the result. Elements can be reordered. Model and view are separate. View is filled by a suplied html template.

//TODO: Checkbox module

//TODO: Collecting defaults and setting defaults in button
//TODO: clearing the form after submit flag in button

//TODO: Captcha module of the form reset after submit

//TODO: FORMALITY ARRAY FORMS MODULE. An element with formality type array has an atribute that indicates how many times an inner form will be repeated. Each inner field is like a little form for itself, that means the fields validate themselves. On get of this module, all of the data is collected into an array :)

//TODO: setFormState!!! Form can function as an input and be validated as one

//******* CSS ********


//***************************************************************

//OPTIONAL-TODO: Make a template modification available for select and chackbox modules to be able to replace a select element with completely custom select, or for instance make a different modules called customselect and customcheckbox


formality.flag = true; //to be sure that we pass dom elements containing .formality class only once

//Tune in for formality events
formality.events = new ivar.patt.Events();

/*
 *	Functions that initializes formality fields that contain .formality class or passed array of fields
 *
 *	@param {String|Array} [field] One string selector,
 */
formality.init = function(fields) {
	
	/*
	 *
	 */
	function getFormName(field) {
		var form  = $(field).attr('form');
		if(form)
			return form.split(' ');
		var parent = $(field).parent();
		if(parent[0].tagName.toLowerCase() === 'form') {
			if(parent[0].id.trim() !== '')
				return parent[0].id;
		}
		form = $(parent).attr('form');
		if(form)
			return form.split(' ');
			
		return [0];
	};
	
	/*
	 *
	 */
	function parseFields(fields) {
		if(!ivar.isArray(fields))
			fields = $(fields);
		for (var i = 0 ; i < fields.length; i++) {
			var field = fields[i];
			if (!$(field).hasClass('formality-added'))
				$(field).addClass('formality-added');
			else continue;
			
			var form_names = getFormName(field);
			
			for (var j = 0; j < form_names.length; j++) {
				var form = formality.registerForm(form_names[j]);
				form.add(field);
			}
		}
		
		formality.flag = false;
	}

	//formality.event = ivar.patt.Events();
	if(!formality.forms[0])
		formality.forms[0] = new formality.Form(0);
		
	if (formality.flag && !ivar.isSet(fields))
		fields = $('.formality');
	parseFields(fields);
	formality.events.fire('onInitComplete');
};

formality.forms = {};

formality.registerForm = function(name, parent) {
	if (formality.forms[name])
		return formality.forms[name];
		
	return formality.forms[name] = new formality.Form(name, parent);
};

//TODO: get also child forms via namespace
formality.getForm = function(name) {
	if (name)
		return formality.forms[name];
	return formality.form[0];
};

formality.Form = function() {
	var self = this;
	
	function __init__(name, parent) {
		this.name = name;
		this.inputs = {};
		this.buttons = {};
		this.parent = parent; //parent form
		this.children = {}; //children forms
	};
	
	function getInputName(elem, collection) {
		if (collection === undefined) collection = 'inputs';
		
		var name = $(elem).attr('name');
		
		if(ivar.isSet(name) && name.trim() !== '') return name;
		
		if (elem.id.trim() !== '') {
			name = elem.id;
		} else {
			var newName = function() {
				name = 'formality_'+ivar.uid();
			}
			newName();
			while (self[collection][name])
				newName();
			elem.id = name;
		}
		
		$(elem).attr('name', name);
		
		return name;
	};
	
	function isButton(field) {
		if(field.tagName === 'button' || $(field).attr('type') === 'submit')
			return true;
			
		if($(field).attr('formality') === 'button') {
				$(field).removeAttr('formality');
			return true;
		}
		
		return false;
	};
	
	function isSubform(field) {
		if($(field).attr('formality') === 'subform') {
			$(field).removeAttr('formality');
			return true;
		}
		if ($(field).hasClass('formality-subform')) {
			return true;
		}
		return false;
	}
	
	this.add = function(field) {
		if (isSubform(field))
			return this.addSubform(field);
		if (isButton(field))
			return this.addButton(field);
		return this.addInput(field);
	};
	
	this.addSubform = function(field) {
		var name = getInputName(field);
		var form = formality.registerForm(name, this);
		this.children[name] = form;
		var label = $(field).attr('label');
		if (label && label.trim() !== '') {
			$(field).prepend('<div class="formality-subform-title"><h3>'+label+'</h3><hr /></div>');
			$(field).removeAttr('label');
		}
	};
	
	this.addInput = function(field) {
		var input_name = getInputName(field);
		return this.inputs[input_name] = new formality.Input(input_name, field, this);
	};
	
	this.removeInput = function(id) {
		delete this.inputs[id];
	};
	
	//TODO: Browse also child forms via namespace
	this.getInput = function(id) {
		return this.inputs[id];
	};
	
	this.getInputsByType = function(type) {
		var res = [];
		for (var i in this.inputs) {
			if (this.inputs[i].type === type)
				res.push(this.inputs[i]);
		}
		return res;
	};
	
	this.clear = function(type, method) {
		if (method === undefined) method = 'clear';
		for (var i in this.inputs) {
			var flag = true;
			if (type) flag = this.inputs[i].type === type;
			if (flag) this.inputs[i][method]();
		}
		
		//TODO: there is a bug!!!
		for (var i in this.children) {
			this.children[i][method](type);
		}
	};
	
	this.empty = function(type) {
		this.clear(type, 'empty');
	};
	
	this.addButton = function(field) {
		var button_name = getInputName(field, 'buttons');
		this.buttons[button_name] = new formality.Button(button_name, field, this);
	};
	
	this.removeButton = function(id) {
		delete this.buttons[id];
	};
	
	this.getButton = function(id) {
		return this.buttons[id];
	};
	
	this.getButtonByType = function(type) {
		var res = [];
		for (var i in this.buttons) {
			if (this.buttons[i].type === type)
				res.push(this.buttons[i]);
		}
		return res;
	};
	
	this.resetButtonStates = function(type) {
		var pass = true;
		for (var i in this.buttons) {
			if (type) pass = this.buttons[i].type === type;
			if (pass) {
				if (this.buttons[i].state !== 'disabled' && this.buttons[i].state !== 'load')
					this.buttons[i].setState(this.buttons[i].data.state);
			}
		}
	};
	
	this.resetButtonLoadState = function(type) {
		var pass = true;
		for (var i in this.buttons) {
			if (type) pass = this.buttons[i].type === type;
			if (pass) {
				if (this.buttons[i].state === 'load')
					this.buttons[i].setState(this.buttons[i].data.state);
			}
		}
	}
	
	this.setButtonStates = function(type, state) {
		for (var i in this.buttons) {
			if (this.buttons[i].type === type) {
				this.buttons[i].setState(state);
			}
		}
	};
	
	//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	//TODO: THIS METHOD DOESNT LOOK GOOD -.-
	this.get = function(fields) {
		var res = {
			data: {},
			valid: true,
			defaults: {} //store subforms how they are
		};

		if (!ivar.isSet(fields)) {
			for (var i in this.inputs) {
			
				if (this.inputs[i].data.exclude)
					continue;
					
				var valid = this.inputs[i].isValid();
				var mandatory = this.inputs[i].mandatory;
				var empty = this.inputs[i].isEmpty();
				var modified = this.inputs[i].isModified();
				
				if ((valid && !empty && modified) || (empty && modified)) {
					res.data[i] = this.inputs[i].get();
					res.defaults[i] = res.data[i];
				}
				
				if (!valid && mandatory)
					res.valid = false;
			}
		} else {
			if (!ivar.isArray(fields)) fields = [fields];
			for (var i = 0; i < fields.length; i++) {
			
				if (this.inputs[i].data.exclude)
					continue;
					
				var valid = this.inputs[fields[i]].isValid();
				var mandatory = this.inputs[fields[i]].mandatory;
				var empty = this.inputs[fields[i]].isEmpty();
				var modified = this.inputs[fields[i]].isModified();
				
				if ((valid && !empty) || (empty && modified)) {
					res.data[fields[i]] = this.inputs[fields[i]].get();
					res.defaults[fields[i]] = res.data[fields[i]];
				}
				
				if (!valid && mandatory) {
					res.valid = false;
				}
			}
		}
		
		for (var i in this.children) {
			var child = this.children[i].get(fields); //TODO: getting fields should be done better
			if(res.valid && !child.valid) res.valid = false;
			if (!ivar.isEmpty(child.data)) {
				res.data[i] = child.data;
				res.defaults[i] = child;
			}
		}
		
		return res;
	};
	
	this.setDefaults = function(obj, method) {
		if (!method) method = "setDefault"
		for (var i in obj) {
			if(obj[i].hasOwnProperty('data') && obj[i].hasOwnProperty('valid')) {
				this.children[i][method](obj[i]);
			} else {
				this.inputs[i][method](obj[i]);
			}
		}
	};
	
	this.set = function(obj) { this.setDefaults(obj, 'set'); };
	
	//TODO: setFormState!!! Form can function as an input and be validated as one
	
	//TODO: new getAll, get all fields, if a field isn't valid, get it's default
	this.getAll = function() {
		var res = {
			valid: true,
			data: {}
		};
		for (var i in this.inputs) {
			var valid = this.inputs[i].isValid();
			var mandatory = this.inputs[i].mandatory;
			
			res.data[i] = {value: this.inputs[i].get(), valid: valid, mandatory: mandatory};
			
			if (!valid && mandatory) {
				res.valid = false;
			}
		}
		
		//TODO: CHILDREN!!!
		return res;
	};
	
	this.getAllInvalid = function() {
		var res = [];
		for (var i in this.inputs) {
			if(!this.inputs[i].isValid())
				res.push(i);
		}
		return res;
	};
	
	this.getInvalid = function() {
		var res = [];
		for (var i in this.inputs) {
			var valid = this.inputs[i].isValid();
			var mandatory = this.inputs[i].mandatory;
			
			if (!valid && mandatory) {
				res.push(i);
			}
		}
		return res;
		//TODO: CHILDREN!!!
	};
	
	this.isValid = function() {
		return this.get().valid;
	};
	
	__init__.apply(this, arguments);
};

/**
 *	Formality Button class
 *	
 *
 */

formality.Button = function() {
	var self = this;
	
	this.state = 'default';

	this.data = {
		'decorate': true,
		'visualstates': true,
		'statemessages': true,
		'bind': 'click',
		'type': null,
		'all': false,
		
		//AJAX vars
		'httpmethod': 'POST',
		'method': null,
		'async': null,
		'emptyrequest': false,
		'uri': null,
		'callback': null,
		'header': null,
		'protocol': 'JSONRPC',
		
		'fields': null,
		'state': 'default',
		'text': null,
		'output': null,
		'function': null,
		'message': {
			 'info': null,
			 'error': null,
			 'warn': null,
			 'valid': null,
			 'load': null,
			 'tip': null,
			 'default': null
		 },
		 
		 'onsuccessclear': true,
		 'onsuccessdefaults': false,
		 'defaultsubmitaction': true
	};
	
	function parseFields(val) {
		var res = val.split(','); 
		for(var i = 0; i < res.length;  i++) {
			res[i] = res[i].trim();
		}
	
		return res;
	}
	
	function injectInnerHtml(elem) {
		if(elem.tagName !== 'input') {
			if ($(elem).find('.text').length === 0 || $(elem).find('.icon').length === 0) {
				var inner = $('#formality-templates .input-button-inner').clone();
				if (inner.length === 0) throw new Error('Formality input template file not present!');
				
				var content = $(elem).html();
				$(inner).find('.text').append(content);
				$(elem).html('');
				$(elem).append(inner);
				self.data.text = content;
			}
		}
	}

	function __init__(name, elem, form) {
		this.name = name;
		this.elem = elem;
		this.form = form;
		
		var data = ivar.parseElementAttributes(elem, 
		{
		 'decorate': ivar.parseText(),
		 'visualstates': ivar.parseText(),
		 'statemessages': ivar.parseText(),
		 'bind': null,
		 'type': null,
		 'onsuccessclear': ivar.parseText, //should the form be cleared or values saved as default?
		 'onsuccessdefaults': ivar.parseText, //should the form be cleared or values saved as default?
		 'goto': null, //to what window.location.href should it jump
		 'defaultsubmitaction': ivar.parseText, // if callback is provided and this field is set to false, default error or valid set states wont work
		 
		 //AJAX vars
		 'httpmethod': null,
		 'method': null,
		 'uri': null,
		 'callback': null,
		 'async': ivar.parseText,
		 'header': JSON.parse,
		 'protocol': null,
		 
		 'collectionfn': null, //Additional non formality data collection
		 'all': ivar.parseText, //Should button submit all data?
		 'fields': parseFields,
		 'state': null,
		 'text': null,
		 'function': null, //some external function to be executed
		 'emptyrequest': ivar.parseText, //if empty request is enabled submit
		 'output': null, //Output elem ID where state messages will be outputed
		 'requirespassword': null, //on submit clear password default

		 'message_info': null,
		 'message_error': null,
		 'message_warn': null,
		 'message_valid': null,
		 'message_load': null,
		 'message_tip': null,
		 'message_default': null
		});
		
		ivar.extend(this.data, data);
		
		this.type = this.data.type;
		this.output = $(this.data.output);
		
		if (this.data.decorate)
			injectInnerHtml(elem);
		
		this.setState(this.data.state, null, this.data.text);
		
		$(elem).bind(this.data.bind, onActivate);
		
		initConnection();
	};
	
	function initConnection() {
		var o = {};
		if(self.data.httpmethod) o.method = self.data.httpmethod;
		if(self.data.uri) o.uri = self.data.uri;
		if(ivar.isSet(self.data.async)) o.async = self.data.async;
		if(self.data.header) o.header = self.data.header;
		
		if (o.uri || self.data.method) {
			self.ajax = new ivar.net[self.data.protocol](o);
		}
	}
	
	function onActivate(e) {
		if (self.state !== 'disabled' && self.state !== 'load') {
			if(self.data.type && functions.hasOwnProperty(self.data.type))
				functions[self.data.type](e);
			
			if (self.data['function']) {
				var fn = ivar.getProperyByNamespace(self.data['function']);
				fn(self);
			}
		}
		
	}
	
	this.gatherFormData = function() {
		var res = {};
		if (this.data.all) {
			res = self.form.getAll();
		} else {
			res = this.form.get(this.data.fields);
		}
		
		if(ivar.isSet(this.data.collectionfn))
			window[this.data.collectionfn](res, this);
		
		return res;
	};
	
	function JSONRPCSubmitCallback (req, res, local) {
		self.setState(self.data.state);
		var callback = self.data.callback;
		self.req_id = null;
		if(ivar.isSet(res)) {
			if (!res.error || res.result) {
			
				if(self.data.onsuccessdefaults) {
					self.form.setDefaults(local.defaults);
					if (self.data.requirespassword) {
						var passfield = self.form.getInput(self.data.requirespassword);
						passfield.setDefault('');
						passfield.setState(passfield.data.state);
					}
				}
			
				if(self.data.onsuccessclear) {
					self.form.clear();
				}
			}
			
			if(ivar.isSet(callback)) {
				var fn = ivar.getProperyByNamespace(callback);
				fn(req, res, self);
			}
			
			if(self.data.defaultsubmitaction) {
				if (res.error || !res.result) {
					self.setState('error', res.error ? res.error.message : undefined);
				} else {
					self.setState('valid');
				}
			}
			
			if(!res.error && ivar.isSet(self.data['goto'])) window.location.href  = self.data['goto'];
		} else {
			var msg = res.error ? res.error : undefined ;
			self.setState('error', msg);
			//TODO: DISPLAY MODAL ERROR DIALOGUE
		}
	}
	
	function JSONRPCSubmit() {
		self.ajax._setup.callback = JSONRPCSubmitCallback;
		var gathered_data = self.gatherFormData();
		
		var message = {};
		message.params = gathered_data.data;
		message.method = self.data.method;
		message.id = 'formality-'+self.form.name+'-'+self.name;
		
		if (self.req_id) { 
			self.ajax._abort(self.req_id);
		}
		
		if(!self.data.emptyrequest && ivar.isEmpty(message.params))
			gathered_data.valid = false;
		
		if (!gathered_data.valid) {
			self.setState('warn', gathered_data.message);
		} else {
			self.setState('load');
			self.req_id = self.ajax._send(message, {button: self, defaults: gathered_data.defaults});
		}
	}
	
	function submit(e) {
		if (!self.ajax)
			return;
			
		switch(self.data.protocol) {
			case 'JSONRPC':
				JSONRPCSubmit();
				break;
			//TODO: REST and XML-RPC
		}
	}
	
	function clear(e) {
		self.form.clear();
	}
	
	function validate(e) {
		self.form.isValid();
	}
	
	var functions = {
		'submit': submit,
		'clear': clear,
		'validate': validate
	}
	
	
	this.setState = function(state, message, text) {
		if (this.data.visualstates) {
			if($(this.elem).hasClass(this.state))
				$(this.elem).removeClass(this.state);
			var prev_state = this.state;
			this.state = state;
			$(this.elem).addClass(state);
			$(this.elem).find('.icon').html(formality._icons[state]);;
		
			if (ivar.isSet(text)) { 
				this.setText(text) 
			} else { 
				this.setText(this.data.text);
			}
		}
		
		this.setMessage(message, this.state, prev_state);
	}
	
	this.setText = function(text) {
		if (this.elem.tagName === 'input')
			$(this.elem).attr('value', text);
		var text_elem = $(this.elem).find('.text');
		if (text_elem.length > 0) $(text_elem).html(text);
		else $(this.elem).html(text);
	}
	
	this.setMessage = function(text, state, prev_state) {
		if (!this.data.statemessages) return;
		
		if (!ivar.isSet(text)) {
			var msg = this.data.message[state];
			text = ivar.isSet(msg) ? this.data.message[state] : '';
		}
		
		if (!this.data.output) {
			$(this.elem).attr('title', text);
		} else {
			$(this.output).html(text);
			if ($(this.output).hasClass(prev_state) )
				$(this.output).removeClass(prev_state);
			$(this.output).addClass(state);
		}
	}
	
	__init__.apply(this, arguments);
};

formality._icons = {
	'error': '&times;',
	'valid': '&#x2713;',
	'info': 'i',
	'warn': '!',
	'tip': '?',
	'load': '',
	'default': ''
};

/**
 *	Formality Input class
 *	
 *
 */

formality.Input = function() {
	var self = this;
	
	this.state = 'default';
	
	var decoration_excluded = {
		'objectarray': true
	}
	
	this.data = {
		 'validation': true,
		 'decoration': true,
		 'visualstates': true,
		 'statemessages': true,
		 'mandatory': false,
		 'label': null,
		 'schemaempty': true,
		 'state': 'default',
		 'schema': null,
		 'influencesubmit': true,
		 'message': {
			 'info': null,
			 'error': null,
			 'warn': null,
			 'valid': null,
			 'load': null,
			 'tip': null,
			 'default': null
		 }
	};
	
	this.valid = false;
	
	function parseArray(val) {
		var res = val.split(','); 
		
		for(var i = 0; i < res.length;  i++) {
			res[i] = res[i].trim();
			if (res[i].wrapped("'"))
				res[i] = res[i].unwrap("'");
			else
				res[i] = ivar.parseText(res[i]);
		}
		
		return res;
	}
	
	//XXX: This repeats a lot over the code
	function parseFunctions(val) {
		var res = val.split(',');
		for(var i = 0; i < res.length;  i++) {
			res[i] = res[i].trim();
		}
		return res;
	}
	
	function __init__(name, elem, form) {
		this.elem = elem;
		this.name = name;
		this.form = form;
		this.wrapper = null;
		
		var data = ivar.parseElementAttributes(elem, 
		{
		 'validation': ivar.parseText,
		 'decoration': ivar.parseText,
		 'visualstates': ivar.parseText,
		 'statemessages': ivar.parseText,
		 'exclude': ivar.parseText, //exclude element from form data get();
		 'mandatory': ivar.parseText,
		 'functions': parseFunctions, //fucntions to validate the value
		 'label': null,
		 'state': null,
		 'influencesubmit': ivar.parseText, // If state of this field is set to load, submit fields in the same form will be set to load
		 'schemaempty': ivar.parseText, //can the field be unset?
		 
		 'message_info': null,
		 'message_error': null,
		 'message_warn': null,
		 'message_valid': null,
		 'message_load': null,
		 'message_tip': null,
		 'message_default': null,
		 
		 'schema': JSON.parse,
		 'schema_minimum': ivar.parseText,
		 'schema_maximum': ivar.parseText,
		 'schema_min': ivar.parseText,
		 'schema_max': ivar.parseText,
		 'schema_exclusiveminimum': ivar.parseText,
		 'schema_exclusivemaximum': ivar.parseText,
		 'schema_maxitems': ivar.parseText,
		 'schema_minitems': ivar.parseText,
		 'schema_maxlength': ivar.parseText,
		 'schema_minlength': ivar.parseText,
		 'schema_multipleof': ivar.parseText,
		 'schema_dividableby': ivar.parseText,
		 'schema_numberpattern': null,
		 'schema_uniqueitems': ivar.parseText,
		 'schema_required': ivar.parseText,
		 'schema_type': function(val){ var res = val.split(','); if(res.length === 1) return res[0]; return parseArray(val)},
		 'schema_disallow': parseArray,
		 'schema_enum': JSON.parse,
		 'schema_items': JSON.parse,
		 'schema_forbidden': JSON.parse,
		 'schema_additionalitems': ivar.parseText,
		 'schema_additionalproperties': ivar.parseText,
		 'schema_patternproperties': JSON.parse,
		 'schema_requiredproperties': JSON.parse,
		 'schema_maxproperties': ivar.parseText,
		 'schema_minproperties': ivar.parseText,
		 'schema_required': JSON.parse,
		 'schema_properties': JSON.parse,
		 'schema_pattern': null,
		 'schema_format': null,
		 'schema_numberformat': null
		});
		
		ivar.extend(this.data, data);
		
		fixSchema();
		
		this.mandatory = this.data.mandatory;
		
		this.type = getModule(elem);
		
		if (decoration_excluded.hasOwnProperty(this.type))
			this.data.decoration = false;
		
		if (this.data.decoration) {
			this.wrapper = injectWrapperHtml(elem, name);
		} else {
			this.data.visualstates = false;
			this.wrapper = this.elem;
		}
		
		//TODO: what about subforms? Seriously now write the documentation after emotate closed beta!
		$(this.wrapper).addClass(this.form.name+'-'+this.name);
		
		this.setState(this.data.state);
		
		this.object = new formality.module[this.type](elem, this);
	}
	
	function injectWrapperHtml(elem, name) {
		var wrapper = $(elem).parent();
		if(!$(wrapper).hasClass('input-field')) {
			wrapper = $('#formality-templates .input-field').clone();
			
			$(wrapper).addClass('formality-'+self.type);
		
			if (wrapper.length === 0) throw new Error('Formality input template file not present!');
		
			var label = $(wrapper).find('label');
		
			if (self.data.mandatory) {
				$(label).append('<span class="mandatory">*</span>');
			}
		
			if (self.data.label) {
				$(label).append(self.data.label);
				$(label).attr('for', name);
			}
		
			elem = $(elem).replaceWith(wrapper);
			$(wrapper).find('#input-field-template').replaceWith(elem);
		}
		
		return wrapper;
	}
	
	function fixSchema(schema) {
		var fix = {
			'exclusiveminimum': 'exclusiveMinimum',
			'exclusiveMaximum': 'exclusiveMaximum',
			'maxitems': 'maxItems',
			'minitems': 'minItems',
			'maxlength': 'maxLength',
			'minlength': 'minLength',
			'multipleof': 'multipleOf',
			'dividableby': 'dividableBy',
			'numberpattern': 'numberPattern',
			'uniqueitems': 'uniqueItems',
			'numberformat': 'numberFormat',
			'minroperties': 'minProperties',
			'maxproperties': 'maxProperties',
			'requiredproperties': 'requiredProperties',
			'patternproperties': 'patternProperties',
			'additionalproperties': 'additionalProperties',
			'additionalItems': 'additionalItems'
		}
		
		if(schema === undefined) schema = self.data.schema;
		
		for (var i in schema) {
			if(fix.hasOwnProperty(i)) {
				var value = schema[i];
				delete schema[i];
				schema[fix[i]] = value;
			}
			if (i  === 'pattern') {
				var value = schema[i];
				schema[i] = value.replace(/&quot;/, '"');
			}
			
			if (ivar.isObject(schema[i])) fixSchemaNames(schema[i]);
		}
	}
	
	this.setState = function(state, message) {
		if (this.data.visualstates || (!this.data.visualstates && (state=='default' || state=='disabled'))) {
			if(this.state === 'disabled' && state !== 'disabled')
				this.disable(false);
		
			if (this.state !== 'disabled' && state === 'disabled')
				this.disable(true);
		
			$(this.wrapper).removeClass(this.state).addClass(state);
			var info_elem = $(this.wrapper).find('.input-info');
			var icon = $(info_elem).find('i');
			$(icon).removeClass(this.state).addClass(state); //this should be done better
			$(icon).html(formality._icons[state]);
		
			//TODO: ************************************************************************************************
			// IF the state of the field is loading, how can you set the state if loading didnt finish???
			
			//TODO: what if several fields are loading, you have to stack them and then resolve upon completion
			
			if(state === 'load' && this.data.influencesubmit)
				this.form.setButtonStates('submit', 'load');
			
			this.state = state;
		}
		
		this.setMessage(message, info_elem);
	}
	
	this.setMessage = function(message, info_elem) {
		if (!this.data.statemessages) return;
		
		if (!ivar.isSet(message))
			message = this.data.message[this.state];
		
		if(!ivar.isSet(message)) message = '';
		
		if (!info_elem)
			info_elem = $(this.wrapper).find('.input-info');
		$(info_elem).find('.message').html(message);
		$(info_elem).find('i').attr('title', message);
	}
	
	function getModule(elem) {
		var module_name = $(elem).attr('formality');
		if (module_name) {
			$('elem').removeAttr('formality');
			return module_name;
		}
		var type = $(elem).attr('type');
		var tagname = elem.tagName.toLowerCase();
		
		if (tagname === 'input') {
			if (type === 'text' || type === 'email') return 'text';
			if (type === 'password') return 'password';
		}
		if (tagname === 'textarea') return 'textarea';
		if (tagname === 'select') return 'select';
	}
	
	//Runs the actual validation of the field;
	//TODO: TRY TO SEPARATE isValid and validate. isValid should return true or false, and validate should do only setting visual states
	
	
	this.validate = function(value) {
	
		var valid = true;
		var error_state = 'warn';
		if (this.mandatory) 
			error_state = 'error';
		var state = 'valid';
		var message = null;
		
		if (this.data.validation) {
			valid = this.object.isValid();
			var modified = this.isModified();
			
			var canitbeempty = this.data.schema && this.data.schemaempty && !this.data.schema.minLength && value === '';
			
			if (this.data.schema !== null && !canitbeempty && modified)
				valid = jules.validate(value, this.data.schema);
			
			//object functions can influence validity, let's say we dont want to allow weak passwords
			//TODO: ALERT! ALERT! WILD CAMEL BACK APPEARS
			if(modified && valid && this.data.functions) {
				for (var i = 0; i < this.data.functions.length; i++ ) {
					if (ivar.isSet(this.object.functions[this.data.functions[i]])) {
						var o = this.object.functions[this.data.functions[i]](value);
						
						if (typeof o === 'object') {
							if (o.valid !== undefined) {
								valid = o.valid;
								if (!o.valid && o.state)
									error_state = o.state;
									
								if (o.valid && o.state)
									state = o.state;
							}
							if (o.message)
								message = o.message;
						} else {
							valid = o;
						}
					}
				}
			}
			
			if (!modified) {
				state = 'default';
				message = null;
			}
			
			if (this.mandatory && this.isEmpty())
				valid =  false;
			
		}
		
		if (!valid) {
			this.setState(error_state, message);
		} else {
			this.setState(state, message);
		}
		
		return valid;
	};
	
	//Input interface below
	
	var disabled = false;
	this.disable = function(bool) {
		if(!bool) bool = !disabled;
		disabled = bool;
		if(this.object.hasOwnProperty('disable')) {
			this.object.disable(bool);
			return this;
		}
			
		if (bool) {
			$(this.wrapper).find('input').attr('disabled','true');
		} else {
			$(this.wrapper).find('input').removeAttr('disabled');
		}
		
		return this;
	};
	
	this.isDisabled = function() {
		return disabled;
	};
	
	this.isModified = function() {
		if(this.object.hasOwnProperty('isModified'))
			return this.object.isModified();
		return !ivar.equal(this.object.get(), this.object.getDefault());
	};
	
	this.isEmpty = function() {
		if(this.object.hasOwnProperty('isEmpty'))
			return this.object.isEmpty();
		return this.object.get() === this.object.data.empty;
	};
	
	this.isValid = function () {
		this.value = this.object.get();
		this.valid = this.validate(this.value);
		if (this.data.influencesubmit)
			this.form.resetButtonStates('submit');
		return this.valid;
	};
	
	this.get = function () {
		return this.object.get.apply(this.object, arguments);
	};
	
	this.setDefault = function () {
		return this.object.setDefault.apply(this.object, arguments);
	};
	
	this.set = function () {
		return this.object.set.apply(this.object, arguments);
	};
	
	// equals to revert
	this.clear = function () {
		return this.object.clear();
	};
	
	this.empty = function () {
		return this.object.clear();
	};
	
	__init__.apply(this, arguments);
};

ivar.namespace('formality.module');

formality.module.simpledate = function() {

	Date.prototype.getNumberOfDays = function(year, month) {
		if(year === undefined) year = this.getFullYear();
		if(month === undefined) month = this.getMonth()+1;
		return new Date(year, month, 0).getDate();
	}
	
	//TODO: Conditions and inter select field dependancies. For instance if date selection is allowed untill the certain time. Like when you book a ticket
	
	//TODO: support for different formats of output
	
	var self = this;
    
    this.year = null;
    this.month = null;
    this.day = null;
    
    this.fields = ['day','month','year'];
    
	this.data = {
		'year':{
			'range': null,
			'default': '0',
			'null': true,
			'disabled': false
		},
		'month':{
			'range': null,
			'default': '0',
			'null': true,
			'disabled': false
		},
		'day':{
			'range': null,
			'default': '0',
			'null': true,
			'disabled': false
		},
		'anniversary': false,
		'empty': null,
		'separator': '/'
	}
	
	function __init__(elem, input) {
		this.elem = elem;
		this.input = input;
	
		var data = ivar.parseElementAttributes(elem, 
			{'year_range': function(val){return dateRange(val, 'year');},
			 'month_range':function(val){return dateRange(val, 'month');},
			 'day_range':function(val){return dateRange(val, 'day');},
			 'year_default':function(val){return dateRange(val, 'year');},
			 'month_default':function(val){return dateRange(val, 'month');},
			 'day_default':function(val){return dateRange(val, 'day');},
			 'year_null':ivar.parseText,
			 'month_null':ivar.parseText,
			 'day_null':ivar.parseText,
			 'year_disabled':ivar.parseText,
			 'month_disabled':ivar.parseText,
			 'day_disabled': ivar.parseText,
			 'monthnames': parseMonths,
			 'fieldorder': parseFieldOrder,
			 'anniversary': ivar.parseText,
			 'empty': null,
			 'separator': null
			});
			
		ivar.extend(this.data, data);
		
		if(ivar.isSet(this.data.fieldorder))
			this.fields = this.data.fieldorder;
		
		addSelectElements();
		this.rebuild();
		
		if(!ivar.isSet(this.data.empty)) 
			autoSetEmpty();
			
		autoSetDefaults();
	};
	
	function parseCommaSeparated(val, count) {
		var res = val.split(',');
		if(ivar.isSet(count) && res.length !== count) return null;
		for(var i = 0; i < res.length;  i++) {
			res[i] = res[i].trim();
		}
		return res;
	};
	
	function parseMonths(val) {
		parseCommaSeparated(val, 12);
	}
	
	function parseFieldOrder(val) {
		parseCommaSeparated(val, 3);
	}
	
	function addSelectElements() {
		for (var i = 0; i < self.fields.length; i++) {
			self[self.fields[i]] = addSelectElement(self.fields[i]);
		}
		
		$(self.year).change(function(e) {
			refreshDay();
			self.input.isValid();
		});
	
		$(self.month).change(function(e) {
			refreshDay();
			self.input.isValid();
		});
		
		$(self.day).change(function(e) {
			self.input.isValid();
		});
	};
	
	function refreshDay() {
		var back = self.data['day']['default'];
		var numdays = new Date().getNumberOfDays(self.year.value, self.month.value);
		if (numdays >= self.day.value)
			self.data['day']['default'] = self.day.value;
		buildSelectOptions('day'); //TODO: count children remove last or add
		self.data['day']['default'] = back;
	}
	
	function addSelectElement(type) {
		var select = $('<select></select>').addClass(type);
		if (self.data[type].disabled)
			$(select).hide();
		$(self.elem).append(select);
		
		return select[0];
	};
	
	function buildSelectOptions(type, month_names) {
		var a = 1;
		var b = 31;
		var sign = 1;
		
		switch (type) {
			case 'year':
				a = new Date().getFullYear(); 
				b = a - 100;
				sign = -1;
				break;
			case 'month':
				b = 12; 
				break;
		}
		
		$(self[type]).html('');
		
		if(self.data[type]['null'])
			$(self[type]).append('<option value="0">-</option>');
			
		var range = self.data[type].range;
		if(range !== null) {
			if (range.length) {
				if (range[0] > range[1]) {
					sign = -1;	
				}
				a = range[0];
				b = range[1];	
			} else {
				b = range;
			}
		} else {
			if(type === 'day')
				b = new Date().getNumberOfDays(self.year.value, self.month.value);
		}

		while (a !== b+sign) {
			var name = a;
			if(type === 'month' && month_names !== undefined)
				name = month_names[a-1];
			$(self[type]).append('<option value="'+a+'">'+name+'</option>');
			a = a+sign;
		}
		
		if(self.data[type]['default'] !== null)
			self[type].value = self.data[type]['default'];
	};
	
	function dateRange(val, type) {
		var range = val.split('-');
		for (var i = 0; i < range.length; i++) {
			if(range[i] === 'now') {
				var d = new Date();
				switch (type) {
					case 'year':
						range[i] = d.getFullYear(); 
						break;
					case 'month':
						range[i] = d.getMonth()+1; 
						break;
					case 'day':
						range[i] = d.getDate(); 
						break;
				}
			} else {
				range[i] = ivar.parseText(range[i]);
			}
		}
	
		if(range.length === 1)
			range = range[0];
		return range;
	};
	
	function parseFormat(str) {
		var parts = str.split(self.data.separator);
		var obj = {};
		
		for (var i = 0; i <  parts.length; i++ ) {
			obj[self.fields[i]] = parts[i];
		}
		
		return obj;
	};
	
	this.getDefault = function() {
		var res = [];
		for(var i = 0; i < this.fields.length; i++) {
			res.push(this.data[this.fields[i]]['default']);
		}
		return res.join(this.data.separator);
	}
	
	function autoSetDefaults() {
		for(var i = 0; i < self.fields.length; i++) {
			if(!self.data[self.fields[i]]['null'] && self.data[self.fields[i]]['default'] === '0') {
				self.data[self.fields[i]]['default'] = $($(self[self.fields[i]]).find('option')[0]).attr('value');
				self[self.fields[i]].value = self.data[self.fields[i]]['default'];
			}
		}
	};
	
	function autoSetEmpty() {
		var res = []; 
		for(var i = 0; i < self.fields.length; i++) {
			if(!self.data[self.fields[i]]['null']) {
				res.push($($(self[self.fields[i]]).find('option')[0]).attr('value'));
			} else {
				res.push(0);
			}
		}
		
		self.data.empty = res.join(self.data.separator);
	}
	
	this.rebuild = function() {
		this.rebuildYear();
		this.rebuildMonth();
		this.rebuildDay();
	}
	
	this.rebuildYear = function() {
		buildSelectOptions('year');
	}
	
	this.rebuildMonth = function() {
		buildSelectOptions('month', this.data.monthnames);
	}
	
	this.rebuildDay = function() {
		buildSelectOptions('day');
	}
	
	this.get = function(fields) {
		if(!ivar.isSet(fields))
			fields = this.fields;
		
		if (ivar.isArray(fields)) {
			var res = [];
			for(var i = 0; i < fields.length; i++) {
				res.push(this[fields[i]].value);
			}
			return res.join(this.data.separator);
		} else {
			return this[fields].value;
		}
	}
	
	this.setDefault = function(str) {
		//XXX: What if someone enters 31/02/2012, there is no date validity checkup...
		var obj = parseFormat(str);
		
		for (var i in obj) {
			this.data[i]['default'] = obj[i];
		}
		
		this.rebuild();
	}
	
	this.set = function(obj, val) {
		//XXX: What if someone enters 31/02/2012, there is no date validity checkup...
		
		var obj = parseFormat(str);
		
		for (var i in obj) {
			this[i].value = obj[i];
		}
		
		//TODO: does this trigger change?
	}
	
	this.isValid = function() {
		var fields = this.fields;
		
		//if (this.data.anniversary) fields = ['month', 'day'];
		//TODO: !!!!
		if (this.data.anniversary && this['day'].value === '0' && this['year'].value !== '0') {
			return false;
		} 
//		else {
//			for(var i = 0; i < fields.length; i++) {
//				if (!this.data[fields[i]].disabled && this[fields[i]].value === '0') {
//						return false;
//				}
//			}
//		}
		
		return true;
	}
	
	this.isEmpty = function() {
		return this.get() === this.data.empty;
	}
	
	this.clear = function() {
		this.rebuild();
	}
	
	this.empty = function() {
		this.setDefault(this.data.empty);
	}
	
	__init__.apply(this, arguments);
};

formality.module.text = function() {
	var self = this;
	
	this.last_verified = null;
	
	this.data = {
		'default': '',
		'bind': 'blur',
		'empty': null,
		'passlevel': 1,
		'submitbutton': null, //submit button selector
		'httpmethod': 'POST',
		'protocol': 'JSONRPC'
	};
	
	var empties = {
		'string': '',
		'integer': NaN,
		'float': NaN,
		'number': NaN,
		'array': [],
		'object': {}
		
	};
	
	function testPassword(pass) {
		var result = 0;
		if(/[a-z]+/.test(pass) && pass.length >= 6 )
			result++;
		if(result === 1 && /[0-9]+/.test(pass))
			result++;
		if(/[A-Z]+/.test(pass))
			result++;
		if(/[!@\#\$%\^&\*()_=+\/\|\-]+/.test(pass))
			result++;
		if(pass.length > 16)
			result++;

		return result;
	}
	
	function passwordStrength() {
		var pass = self.get();
		var mark = testPassword(pass);
		var res = {};
		res.message = 'weak'; //TODO: GET MESSAGES FROM THE TEMPLATE
		res.valid = true;
		
		if (mark < self.data.passlevel) {
			res.valid = false;
			res.message = 'weak';
		}
		
		if (mark < 5 && mark >= self.data.passlevel) {
			res.message = 'good';
			res.state = 'warn';
		} 
		if (mark === 5) {
			res.message = 'strong';
			res.state = 'valid';
		}

		return res;
	}
	
	function JSONRPCSubmitCallback (req, res, elem) {
		var callback = self.data.callback;

		self.req_id = null;
		self.input.disable(false);
		self.input.form.resetButtonLoadState();
		
		if(ivar.isSet(res)) {
			if(ivar.isSet(callback)) {
				var fn = ivar.getProperyByNamespace(callback);
				fn(req, res, self);
			} else {
				if (!res.result) {
					if(!res.error) res.error = {};
					self.input.setState('error', res.error.message);
				} else {
					self.input.setState('valid');
					self.input.valid = true;
					self.reserved = self.get();
					//self.setDefault(req.request.params);
					//console.log();
					
				}
			}
		} else {
			self.input.setState('error');
			//TODO: DISPLAY MODAL ERROR DIALOGUE
		}
	}
	
	function JSONRPCSubmit() {
		self.ajax._setup.callback = JSONRPCSubmitCallback;
		
		var message = {};
		message.params = self.get();
		message.method = self.data.method;
		message.id = 'formality-'+self.input.form.name+'-'+self.input.name;
		
		if (self.req_id) { 
			self.ajax._abort(self.req_id);
		}
		
		self.req_id = self.ajax._send(message, self);
	}
	
	function submit() {
		if (!self.ajax)
			return;
			
		switch(self.data.protocol) {
			case 'JSONRPC':
				JSONRPCSubmit();
				break;
		}
	}
	
	function isAvailable() {
		var val = self.get();
		
		if (val !== self.reserved && val !== self.data['default']) {
			
			self.input.disable(true);
			
			var res = {
				state: 'load',
				valid: false
			}
			
			submit();
			
			return res;
		} else {
			return true;
		}
	}
	
	this.functions = {
		'testpassword' : passwordStrength,
		'isavailable' : isAvailable
	};
	
	var data_type_parsers = {
		'string': function(val) { return val },
		'integer': function(val) { return parseInt(val, 10); },
		'number': function (val) { return parseFloat(val); },
		'float': function (val) { return parseFloat(val); },
		'array': function(val) {try { return JSON.parse(val);} catch(e){ return false}},
		'object': function(val) {try { return JSON.parse(val);} catch(e){ return false}}
	}
	
	var parseText = function(sValue) {
		if (isFinite(sValue)) { return parseFloat(sValue); }
		var json = false;
		try {
			json = JSON.parse(sValue);
		} catch (e) {
			//
		}
		if (json) return json;
		return sValue;
	};
	
	function flexareaAndCharnum(flexarea, charnum) {
		if (charnum) {
			self.char_elem = $('<div class="charnum">'+charnum.max+'</div>');
			$(self.elem).after(self.char_elem);
			if (!ivar.isSet(charnum.min)) charnum.min = 0;
		}
		
		if (flexarea) {
			if ($(self.elem).css('font-size') !== '' && $(self.elem).css('line-height') === '') {
				 $(self.elem).css('line-height', $(self.elem).css('font-size'));
				 if (!ivar.isSet(flexarea.min)) flexarea.min = 0;
			}
		}

		$(self.elem).bind('keypress', function(e) {
		
			var value = self.get();
		
			if(charnum) {
				var num = charnum.max-value.length;
				if(num < charnum.min) {
					if(!$(self.char_elem).hasClass('red'))
						$(self.char_elem).addClass('red');
				} else {
					if($(self.char_elem).hasClass('red'))
						$(self.char_elem).removeClass('red');
				}
				$(self.char_elem).html('<span>'+num+'</span>');
			}
			
			if(flexarea) {
				var lines = $(this).lines();
		
				if(jQuery.data(this, 'lines') !== lines) {
					jQuery.data(this, 'lines', lines);
					var sizeLines = flexarea.min;
					if(lines > flexarea.min) {
						sizeLines = lines;
						$(this).css('overflow','hidden');
					}
			
					if(lines > flexarea.max) {
						sizeLines = flexarea.max;
						$(this).css('overflow','auto');
					}
			
					var h = sizeLines*parseInt($(this).css('line-height'), 10);
					//$(this).animate({height:h}, 250);
					$(this).height(h);
				}
			}
		});
	
		$(self.elem).bind('keyup', function(e){
			$(this).trigger('keypress');
		});
	
		$(self.elem).bind('keydown', function(e){
			$(this).trigger('keypress');
		});
	
		$(self.elem).bind('paste', function(e){
			var self = this;
			setTimeout(function(){
				$(self).trigger('keypress');
			}, 100);
		});
	
		$(self.elem).bind('cut', function(e){
			var self = this;
			setTimeout(function(){
				$(self).trigger('keypress');
			}, 100);
		});
	};

	function __init__(elem, input) {
		this.elem = elem;
		this.input = input;
		this.data_type = 'string';
		
		if(this.input.data.schema && this.input.data.schema.type)
			this.data_type = this.input.data.schema.type; //TODO: WHAT IF THE FIELD SUPPORTS MULTIPLE DATA TYPES?
	
		var data = ivar.parseElementAttributes(elem, {
			 'default': data_type_parsers[this.data_type],
			 'empty': data_type_parsers[this.data_type],
			 'submitbutton': null, //For submit on enter
			 'passlevel': function(val){ return parseInt(val);},
			 'bind': null,
			 'charcount': ivar.parseText,
			 'maxlines': ivar.parseText, //for textarea only
			 'minlines': ivar.parseText, //for textarea only
			 'uri': null,
			 'httpmethod': null,
			 'method': null,
			 'protocol': null,
			 'callback': null,
			 'async': ivar.parseText,
		 	 'header': JSON.parse
		});
		
		ivar.extend(this.data, data);
		
		this.reserved = this.data['default'];
		
		if (ivar.isSet(this.data.charcount) && ivar.isSet(this.input.data.schema.maxLength)) {
			var charnum = {
				max: this.input.data.schema.maxLength,
				min: this.input.data.schema.minLength
			}
		}
		
		if (ivar.isSet(this.data.maxlines)) {
			var flexarea = {
				max: this.data.maxlines,
				min: this.data.minlines
			}
		}
		
		if(ivar.isSet(flexarea) || ivar.isSet(charnum)) {
			this.charnum = charnum;
			this.flexarea = flexarea;
			flexareaAndCharnum(flexarea, charnum);
		}
		
		if (ivar.isSet(this.data.submitbutton)) {
			$(this.elem).keydown(function(e){
				if(e.keyCode === 13)
					$(self.data.submitbutton).trigger('click');
			});
		}
		
		if (data['default']) this.clear();
		
		if (!ivar.isSet(this.data.empty))
			this.data.empty = empties[this.data_type];
		
		$(this.elem).bind(this.data.bind, function(e){
			input.isValid();
		});
		
		initConnection();
	};
	
	function initConnection() {
		var o = {};
		if(self.data.httpmethod) o.method = self.data.httpmethod;
		if(self.data.uri) o.uri = self.data.uri;
		if(ivar.isSet(self.data.async)) o.async = self.data.async;
		if(self.data.header) o.header = self.data.header;
		
		if (o.uri || self.data.method)
			self.ajax = new ivar.net[self.data.protocol](o);
	};

	this.getDefault = function() {
		var data_type = this.data_type;
		if(ivar.isArray(data_type)) data_type = ivar.whatis(parseText(this.data['default']));
		return data_type_parsers[data_type](this.data['default']);
	};

	this.get = function() {
		var data_type = this.data_type;
		var raw = $(this.elem).val();
		if(ivar.isArray(data_type)) data_type = ivar.whatis(parseText(raw));
		return data_type_parsers[data_type](raw);
	};
	
	this.setDefault = function(val) {
		this.data['default'] = val;
		this.clear();
	};
	
	this.set = function(val) {
		$(this.elem).val(val);
		if (ivar.isSet(this.flexarea) || ivar.isSet(this.charnum))
			$(this.elem).trigger('keypress');
		if (this.data.bind)
			$(this.elem).trigger(this.data.bind);
	};
	
	this.isValid = function() {
		return true;
	};
	
	this.clear = function() {
		this.set(this.data['default']);
	};
	
	this.empty = function() {
		this.setDefault(this.data.empty);
	};
	
	__init__.apply(this, arguments);
};


formality.module.password = formality.module.text;

formality.module.textarea = formality.module.text;

formality.module.select = function() {
	var self = this;

	this.data = {
		'empty': ''
	}	
	
	function __init__(elem, input) {
		this.elem = elem;
		this.input = input;

		var data = ivar.parseElementAttributes(elem, {
			 'default': null
		});
		
		ivar.extend(this.data, data);
		
		if (!ivar.isSet(this.data['default']))
			this.data['default'] = $(this.elem).find('option')[0].value
		else
			this.clear();
		
		$(this.elem).change(function(e) {
			self.input.isValid();
		});
		
	};
	
	this.isValid = function () {
		return true;
	};
	
	this.getDefault = function () {
		return this.data['default'];
	};
	
	this.get = function () {
		return this.elem.value;
	};
	
	this.setDefault = function (val) {
		this.data['default'] = val;
	};
	
	this.set = function (val) {
		this.elem.value = val;
		$(this.elem).trigger('change');
	};
	
	this.clear = function () {
		this.set(this.data['default']);
	};
	
	this.empty = function() {
		this.setDefault(this.data.empty);
	};
	
	__init__.apply(this, arguments);
};

formality._objectarray_modified = function(elem) {
	var elem_root = $(elem).parents('.formality');
	if (!$(elem_root).hasClass('objectarray-modified')) $(elem_root).addClass('objectarray-modified');
};

formality._objectarray_add = function(button) {
	var fd = button.gatherFormData();
	
	var elem_root = $(button.elem).parents('.formality');
	var name = $(elem_root).attr('name');
	var form = $(elem_root).attr('form');
	var max = 10;
	var out = $(elem_root).find('.objectarray-out');
	
	var existing = $(out).children('*');
	
	if(existing.length >= max) {
		button.setState('error', 'Maximum number of entries!'); //TODO: from template
		fd.valid = false;
	}
	
	if (fd.valid) {
		var html = $(elem_root).find('.objectarray-template').html();
		var filled = html.template(fd.data);
		
		var elem = $(filled);
		$(elem).find('.objectarray-json').html(JSON.stringify(fd.data));
		formality._objectarray_bindRemove([elem]);
		
		$(out).append(elem);
		button.form.clear();
		formality._objectarray_modified(elem);
	}
};

formality._objectarray_bindRemove = function(elems) {
	for (var i = 0; i < elems.length; i++ ) {
		$(elems[i]).find('.objectarray-remove').click(function(e){
			var elem = $(this).parents('.objectarray-entry');
			formality._objectarray_modified(elem);
			$(elem).remove();
		});
	}
};


//TODO: make this module more serious, auto create needed fields, auto label, toggle flag for sortable...
formality.module.objectarray = function() {

	function __init__(elem, input) {
		this.elem = elem;
		this.input = input;

		var data = ivar.parseElementAttributes(elem, {
			 
		});
		
		$(this.elem).find('.button[type="submit"]').attr('function', 'formality._objectarray_add');
		
		//ivar.extend(this.data, data);
		
		//rebind remove
		formality._objectarray_bindRemove($('.objectarray-out').children('*'));
		
	};
	
	this.isValid = function () {
		return true;
	};
	
	this.isModified = function() {
		return  $(this.elem).hasClass('objectarray-modified');
		//TODO: Can be done with object comparison and default...
	};
	
	this.isEmpty = function() {
		return $(this.elem).find('.objectarray-out').children('*').length === 0;
	};
	
	this.get = function () {
		var fields = $(this.elem).find('.objectarray-out').children('*');
		var res = [];
		for (var i = 0; i < fields.length; i++) {
			res.push(JSON.parse($(fields[i]).find('.objectarray-json').html()));
		}
		return res;
	};
	
	this.setDefault = function (val) {
		if ($(this.elem).hasClass('objectarray-modified')) $(this.elem).removeClass('objectarray-modified');
		//XXX
	};
	
	this.set = function (val) {
		//TODO: set from object!!!
	};
	
	this.clear = function () {
		$(this.elem).find('.objectarray-out').children('*').remove();
	};
	
	this.empty = function() {
		$(this.elem).find('.objectarray-out').children('*').remove();
	};
	
	__init__.apply(this, arguments);
};

//TODO: Checkbox can perform ajax, it also needs a loader
formality.module.checkbox = function() {

	var self = this;

	this.data = {
		'empty' : false
	}	
	
	function __init__(elem, input) {
		this.elem = elem;
		this.input = input;

		var data = ivar.parseElementAttributes(elem, {
			'default': ivar.parseText,
			'alwayssubmit': ivar.parseText
		});
		
		ivar.extend(this.data, data);
		
		if (!ivar.isSet(this.data['default'])) {
			this.data['default'] = this.elem.checked;
		} else {
			this.clear();
		}
		
		if (ivar.isSet(this.data['alwayssubmit'])) {
			this.isModified = function() { return true };
		}
		
		$(this.elem).change(function(e) {
			self.input.isValid();
		});
		
	};
	
	this.isValid = function () {
		return true;
	};
	
	this.getDefault = function () {
		return this.data['default'];
	};
	
	this.get = function () {
		return this.elem.checked;
	};
	
	this.setDefault = function (val) {
		this.data['default'] = val;
	};
	
	this.set = function (val) {
		this.elem.checked = val;
		$(this.elem).trigger('change');
	};
	
	this.clear = function () {
		this.set(this.data['default']);
	};
	
	this.empty = function() {
		this.setDefault(this.data.empty);
	};
	
	__init__.apply(this, arguments);
};

(function($) {
	$.fn.lines = function() {
		var val = '';
		if (this.is('textarea')) {
			val = this.val();
		} else {
			val = this.html();
		}
		var span = $('<span style="position:absolute; left:-9999px; top: 0px; font-size:' + this.css('font-size') + '; width:' + this.width() + 'px; white-space: pre-wrap; white-space: -moz-pre-wrap; white-space: -pre-wrap; white-space: -o-pre-wrap; word-wrap: break-word;"></style>');
		$(span).html(htmlEncode(val));
		$('body').append(span);
		var lines = $(span).height() / parseInt($(span).css('line-height'), 10);
		if (val.lastIndexOf('\n') == val.length - 1) {
			lines += 1;
		}
		$(span).remove();
		return lines;
	};
}(jQuery));


function htmlEncode(value){
  return $('<div/>').text(value).html();
}

function htmlDecode(value){
  return $('<div/>').html(value).text();
}
