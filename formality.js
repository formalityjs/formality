/*
 * formality.js
 *
 * @author Nikola Stamatovic Stamat 
 * @copyright IVARTECH < http://ivartech.com >
 * @since May 2013
 */


//data types: null, boolean, integer, number, string, array (, file)

//elements-basic: text, textarea, checkbox, select, multiple-select, button, file

//elements-advanced: items-list/tags(array), date-picker(string), color-picker(string), number-spinner(number),  multiple-checkboxes(array), threeway(number:-1,0,1), multiple-file(array:files), dropzone(array:files), slider(number)...

//states: default, info, warn, error, load, disabled, tip, valid/ok



ivar.namespace('formality');
formality.formAggregator = {};

ivar.require('ivar.data.jules');

ivar.ready(function() {
	//console.log(jules.validate('lol',{type: 'string'}));
	initInputs($('.ivartech-input'));
});

var schema = {
	name: '',
	type: 'text', //text, textarea, checkbox, multiple-checkbox, threeway, select, multiple-select, button, file, multiple-file, dropzone
	value: null,
	updateOn: 'blur',
	form: null,
	
	state: {
		// normal, error, tip, warn, valid, info, load, disabled
		'default': 'normal',
		'message': {
			'tip': '',
			'info': '',
			'warn': '',
			'load': '',
			'valid': '',
			'error': ''
		}
	},
	
	schema: {
		// JSON SCHEMA
	}
};

function InputField(o) {
	this.elem = null;
	this.field = null;
	this.value = null;
	this.updateOn = 'blur';
	this.schema = {};
	
	this.skip_validation = false;
	this.form = null;
	this.classes = '';
	
	this.info_msg = null;
	this.error_msg = null;
	this.valid_msg = null;
	this.tip_msg = null;
	
	this.default_state = null;
	
	if(o !== undefined)
		ivar.extend(this, o);
};

InputField.prototype.setState = function(state, title, message) {
	this.elem.attr('class', this.classes);
	if(state)
		this.elem.addClass(state);
	if(title)
		this.setStateTitle(state, title);
	if(message)
		this.setStateMessage(message);
	else
		this.setStateMessage('');
};

InputField.prototype.setStateTitle = function(state, title) {
	this.elem.find('.'+state).attr('title', title);
};

InputField.prototype.setStateMessage = function(message) {
	this.elem.find('.message').html(message);
};

InputField.prototype.setDefaultState = function() {
	if(this.default_state !== null)
		this.setState(this.default_state);
	else
		this.setState();
}

InputField.prototype.buildState = function(elem, state) {
	var attrName = state+'_msg';
	attrToObjProp(this, elem, attrName);
	this.setStateTitle(state, this[attrName]);
};

ivar.namespace('value.update');

value.update.text = function(elem) {
	return $(elem).val();
};

value.update.textarea = value.update.text;

InputField.prototype.update = function() {
	this.value = value.update[this.type](this.field);
};

InputField.prototype.validate = function() {
	this.update();
	console.log(this.value);
	console.log(jules.validator.type('string', 'type', this.schema));
	if(!jules.validator.type('string', 'type', this.schema))
		this.value = ivar.parseText(this.value);
	return jules.validate(this.value, this.schema);
};

function attrToObjProp(obj, elem, attrName) {
	if (elem.attr(attrName)) {
		obj[attrName] = elem.attr(attrName);
		elem.removeAttr(attrName);
	}
};

ivar.namespace('store.attr');
store.attr.data_type = function(o, v) {
	if (/\s/.test(v))
		v = v.split(' ');
	o.schema.type = v;
};

store.setRange = function(prop, prop2, o, v) {
	v = ivar.parseText(v);
	if(!o.schema[prop]) o.schema[prop] = {};
	o.schema[prop][prop2] = v;
};

store.attr.min = function(o, v) {
	store.setRange('min', 'value', o, v);
};

store.attr.max = function(o, v) {
	store.setRange('max', 'value', o, v);
};

store.attr.minexclusive = function(o, v) {
	store.setRange('min', 'exclusive', o, v);
};

store.attr.maxexclusive = function(o, v) {
	store.setRange('max', 'exclusive', o, v);
};

store.attr.regex = function(o, v) {
	if(jules.validator.type('string', 'type', o.schema)) {
		o.schema.pattern = v;
	} else if(jules.validator.type('integer', 'type', o.schema) || 
		jules.validator.type('number', 'type', o.schema)) {
		o.schema.numberPattern = v;
	}
};

store.attr.format = function(o, v) {
	o.schema.format = v;
};

store.attr.form = function(o, v) {
	o.form = v;
	if(!formality.formAggregator.hasOwnProperty(o.form))
		formality.formAggregator[o.form] = [];
				
	formality.formAggregator[o.form].push(o);
};

function testPassword(pass) {
	var result = 0;
	if(/[a-z]+/.test(pass) && pass.length >= 6 )
		result = 1;
	if(result === 1 && /[0-9]+/.test(pass))
		result = 2;
	if(result === 2 && /[A-Z]+/.test(pass))
		result = 3;
	if(result === 3 && /[!@\#\$%\^&\*()_=+\/\|\-]+/.test(pass))
		result = 4;
	if(result === 4 && pass.length > 16)
		result = 5;
		
	return result;
}

function initInputs(elems) {
	for (var i = 0; i < elems.length; i++) {
	
		var ifield = new InputField();
		var attrs = elems[i].attributes;
		var stored = [];
		for (var j = 0; j < attrs.length; j++) {
			var attr = attrs[j];
			if(store.attr.hasOwnProperty(attr.name)) {
				store.attr[attr.name](ifield, attr.value);
				stored.push(attr.name);
			}
		}
		
		var template = $('#ivartech-templates .input-field').clone();
		var tmp = $(elems[i]).clone();
		ifield.elem = template;
		ifield.field = tmp;
		
		if(tmp.prop('tagName').toLowerCase() === 'input' && /(?:text|password)/.test(tmp.prop('type'))) {
			ifield.type = 'text';
		} else if(tmp.prop('tagName').toLowerCase() === 'textarea') {
			ifield.type = 'textarea';
		}
		
		if(!tmp.attr('data_type')) {
			if(ifield.type === 'text' || ifield.type === 'textarea')
			ifield.schema.type = 'string';
		}
		
		for (var j = 0; j < stored.length; j++) {
			elems[i].removeAttribute(stored[j]);
		}
		
		
		
		
		if(tmp.prop('tagName').toLowerCase() === 'textarea')
			template.addClass('textarea');
		
		template.find('#input-field-template').replaceWith(tmp);
		tmp.attr('name', tmp.attr('id'));
		template.find('label').html(
			tmp.attr('label')).attr(
				'for', tmp.attr('name'));

		var classes = template.attr('classes')?' '+template.attr('classes'):'';
		ifield.classes = template.attr('class') + classes;
		
		if(tmp.attr('mandatory') && tmp.attr('mandatory').toLowerCase() === 'true') {
			template.find('label').prepend('<span class="mandatory">*</span>');
			tmp.removeAttr('mandatory');
			template.attr('mandatory', 'true');
			ifield.mandatory = true; 
		}
		
		
		attrToObjProp(ifield, tmp, 'default_state');
		
		
		ifield.buildState(tmp, 'info');
		ifield.buildState(tmp, 'tip');
		ifield.buildState(tmp, 'error');
		ifield.buildState(tmp, 'valid');
		ifield.buildState(tmp, 'load');
		ifield.buildState(tmp, 'warn');

		attrToObjProp(ifield, tmp, 'skip_validation');
		
		ifield.setDefaultState();
		
		tmp.data('ivartech-input', ifield);
		
		tmp.blur(function(e) {
			fieldBlur(this, e);
		});
		
		tmp.focus(function(e) {
			fieldFocus(this, e);
		});
		
		$(elems[i]).replaceWith(template);
	}
};

function fieldFocus(elem, e) {
	var ifield = $(elem).data('ivartech-input');
	if(!ifield.skipvalidation)
		ifield.setDefaultState();
}

function fieldBlur(elem, e) {
	var ifield = $(elem).data('ivartech-input');
	console.log(ifield.schema);
	if(!ifield.skip_validation)
		if(ifield.validate()) {
			if(!ifield.mandatory && ifield.field.val().length === 0 ) {
				ifield.setDefaultState();
			} else {
				ifield.setState('valid');
			}
		} else {
			ifield.setState('error');
		}
}
