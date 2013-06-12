/**
 *	@file		IVARTECH Map data class
 *	@author		Nikola Stamatovic Stamat <stamat@ivartech.com>
 *	@copyright	IVARTECH http://ivartech.com
 *	@version	20130313  
 *	
 *	@namespace	ivar.data
 */


ivar.namespace('ivar.data');

/**
 *	@class
 *	@classdesc Map class similar to Java Map, providing methods for efficient usage of traditional key-value hash table storage
 *
 *	@constructor	
 *	@property	{number}	length	Length of the map, like array length. Even though keys.length would do fine, this is kept for elegance
 *	@property	{object}	object	Object that contains key-value pairs
 *	@property	{array}		keys	Array containing key names used as keys in object to enable getFirst and getLast functionality
 */
ivar.data.Map = function Map() {
	this.length = 0;
	this.object = {};
	this.keys = [];
};

ivar.data.Map.prototype.constructor = ivar.data.Map;

/**
*	Stores key and value to map object
*
*	@this	{Map}
*	@param	{string|number}	key		A value that represents key for value retrieval
*	@param	{any}			value 	A value marked with the correspondent key
*	@return	{string|number}			Returns the key value		
*/
ivar.data.Map.prototype.put = function(key, value) {
	if(!this.hasKey(key)) {
		this.length += 1;
		this.keys.push(key);
	}
	this.object[key] = value;
	return key;
};

/**
*	Clones another map's values to this map
*
*	@this	{Map}
*	@param	{Map}	map		Map to which values should be cloned
*/
ivar.data.Map.prototype.putAll = function(map) {
	this.length = map.length;
	this.object = map.object;
	this.keys	= map.keys;
};

/**
 *	Removes the map entry by given key
 *
 *	@todo	Test on stupid IE, cause of delete property might not work
 *	{@link http://perfectionkills.com/understanding-delete/} 
 *
 *	@this	{Map}
 *	@param	{string|number}	key		Name of the key under which a value is stored
 *	@return	{any}					Returns the value of removed entry
 */
ivar.data.Map.prototype.remove = function(key) {
	if(this.hasKey(key)) {
		this.length -= 1;
		this.keys.remove(this.keys.find(key));
	}
	var value = this.object[key];
	delete this.object[key];
	return value;
};

/**
 *	Gets the value stored under given key
 *
 *	@this	{Map}
 *	@param	{string|number}	key		A value that represents key for value retrieval
 *	@return	{any}					Returns the value stored under the key or null if key isnt found
 */
ivar.data.Map.prototype.get = function(key) {
	var value = this.object[key];
	if (value != undefined)
		return value;
	return null;
};

/**
 *	Gets the value stored under given order number
 *
 *	@this	{Map}
 *	@param	{number}	id		Order number in keys array
 *	@return	{any}				Returns the value stored under the key or null if key isnt found
 */
ivar.data.Map.prototype.getById = function(id) {
	return this.get(this.keys[id]);
};

/**
 *	Gets the value stored under the last entered key
 *
 *	@this	{Map}
 *	@return	{any}				Returns the value stored under the key or null if key isn't found
 */
ivar.data.Map.prototype.getLast = function() {
	return this.getById(this.keys.length-1);
};

/**
 *	Gets the value stored under the first entered key
 *
 *	@this	{Map}
 *	@return	{any}				Returns the value stored under the key or null if key isn't found
 */
ivar.data.Map.prototype.getFirst = function() {
	return this.getById(0);
};

/**
 *	Gets a key name labeling the given value
 *
 *	@this	{Map}
 *	@param	{any}	value		Value used to find the keyname
 *	@return	{string|number}		Returns key name under which given value is stored
 */
ivar.data.Map.prototype.getKey = function(value) {
	return ivar.find(this.object, value); //SLOW
};

/**
 *	Gets this map's object containing keys and values
 *
 *	@this	{Map}
 *	@return	{object}	object containing keys and values
 */
ivar.data.Map.prototype.entrySet = function() {
	return this.object;
};

/**
 *	Length or size of the map, that is number of entries, someone prefers it this way
 *
 *	@this	{Map}
 *	@return	{number}	returns length or size of the map, someone prefers it this way.
 */
ivar.data.Map.prototype.size = function() {
	return this.length;
};


/**
 *	Checks if the map is empty
 *
 *	@this	{Map}
 *	@return	{boolean}	returns true if Map is empty, otherwise false.
 */
ivar.data.Map.prototype.isEmpty = function() {
	if (this.length == 0)
		return true;
	return false;
};

/**
 *	Does the map contain given key?
 *
 *	@this	{Map}
 *	@param	{string|number}	key 	
 *	@return	{boolean}				returns true if the given key exists in the map
 */
ivar.data.Map.prototype.hasKey = function(key) {
	return this.object.hasOwnProperty(key);
};

/**
 *	Does the map contain given value?
 *
 *	@this	{Map}
 *	@param	{any}		value 		
 *	@return	{boolean}				returns true if the given value exists in the map
 */
ivar.data.Map.prototype.hasValue = function(value) { //SLOW O(n)
	if (this.getKey(value) != null)
		return true;
	return false;
};

/**
 *	Returns list of all entry keys in the map
 *
 *	@this	{Map}	
 *	@return	{array}				returns array of keys
 */
ivar.data.Map.prototype.keys = function() {
	return this.keys;
};

/**
 *	Returns list of all entry values in the map. SLOW! O(n)
 *
 *	@this	{Map}	
 *	@return	{array}				returns array of values
 */
ivar.data.Map.prototype.values = function() { //SLOW O(n)
	var result = new Array();
	for (var i in this.object) {
		result.push(this.object[i]);
	}
	return result;
};

/**
 *	Checks if an other map is identical to this one! 
 *	Can be very slow if they have same keys and number of entries.
 *
 *	@this	{Map}
 *	@param 	{Map}	map 			
 *	@return	{boolean}				returns true if they are identical
 */
ivar.data.Map.prototype.equals = function(map) {
	if (this.length != map.length)
		return false;
	if(!this.keys.equal(map.keys))
		return false;
	return ivar.equal(this.object, map.object); //SLOW
};

/**
 *	Resets the contents of the map to empty state
 *
 *	@this	{Map}
 */
ivar.data.Map.prototype.clear = function() {
	this.length = 0;
	this.object = {};
	this.keys = [];
};

/**
 *	For each entry of the map executes the given function
 *
 *	@this	{Map}
 *	@param 	{function}	function(key,value) 	Given functions that receives key and value as arguments
 */
ivar.data.Map.prototype.each = function(fn) {
	for (var i in this.object) {
		fn(i, this.object[i]);
	}
};

ivar.data.Map.prototype.find = function(value) {
	for (var i in this.object) {
		if(value === this.object[i])
			return i;
	}
};
