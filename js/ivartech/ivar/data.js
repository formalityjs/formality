ivar.require('ivar.data.Map');

ivar.namespace('ivar.data');

/**
 * Key value data parser with quotations for string blocks
 *
 * @todo Can be done better (multilevel?)... Also make complex templater
 * @autor Stamat
 * @version 20130101
 */
ivar.data.dataParser = function(data, blockSeparator, keyValueSeparator) {
 
	var m =  new ivar.data.Map();
 
	if (data !== undefined && ivar.is(data, 'string') && data !== '') {
 
		var key = [];
		var value = [];
		var foundKey = false;
		var quotationsOpen = false;
		var quotationType;
 
		var valueStore = function() {
			foundKey = false;
			var keyString = key.join('').trim();
			var valueString = value.join('');
			if (valueString === '')
				valueString = null;
			key = [];
			value = [];
 			
 			m.put(keyString, valueString);
		};
 
		for (var i = 0; i < data.length; i++) {
			var c = data.charAt(i);
 
			if ((c == keyValueSeparator) && !quotationsOpen) {
				foundKey = true;
				continue;
			} else if ((c === blockSeparator) && !quotationsOpen) {
				valueStore();
				continue;
			} else if ((c === '"') || (c === '\'')) {
				if (!ivar.isSet(quotationType)) {
					quotationType = c;
					quotationsOpen = !quotationsOpen;
				} else {
					if (quotationType === c)
						quotationsOpen = !quotationsOpen;
				}
			} else {
				if (!foundKey)
					key.push(c);
				else
					value.push(c);
			}
 
			if (i === data.length - 1) valueStore();
		}
	}
	return m;
};
