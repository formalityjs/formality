ivar.require('ivar.data');

ivar.namespace('ivar.ui.navigation');

ivar.ui.navigation.bindHashChange = function(callback) {
 	var re = /^#!(.*)/;
 	
	var getLinkData = function() {
		var hash = window.location.hash;
		hash = re.exec(hash)[1];
		return ivar.data.dataParser(hash, '&', '=');
	};
 
 	if (re.test(window.location.hash))
		callback(getLinkData());
 
	if ('onhashchange' in window) {
		window.onhashchange = function() {
			if (re.test(window.location.hash))
				callback(getLinkData());
		};
	} else {
		__STORED_HASH__ = window.location.hash;
		window.setInterval(function() {
			if (window.location.hash != __STORED_HASH__) {
			    __STORED_HASH__ = window.location.hash;
			    if (re.test(window.location.hash))
			    	callback(getLinkData());
			}
		}, 100);
	}
};
