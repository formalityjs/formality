/**
 * A hash table key value storage
 * Use it to quickly and resource efficiently find values bound to large object or large string keys in a very large collection. It uses CRC32 algorythm to convert supplied values into integer hashes and 
 * 
 * @author Nikola Stamatovic Stamat < stamat@ivartech.com >
 * @copyright ivartech < http://ivartech.com >
 * @version 1.0
 * @date 2013-11-17
 * @namespace ivar.data
 */
 
ivar.namespace('ivar.data');
 
/**
 * @example
 *	a = {'a':1,
		'b':{'c':[1,2,[3,45],4,5],
			'd':{'q':1, 'b':{q':1, 'b':8},'c':4},
			'u':'lol'},
		'e':2};
	
	b = {'a':1, 
		'b':{'c':[2,3,[1]],
			'd':{'q':3,'b':{'b':3}}},
		'e':2};
		
	c = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
	
	var hc = new HashMap();
	hc.put({a:1, b:1});
	hc.put({b:1, a:1});
	hc.put(true);
	hc.put('true');
	hc.put(a)
	console.log(hc.exists(b))
	console.log(hc.exists(a))
	console.log(hc.get(a))
	console.log(hc.exists(c))
	hc.remove(a)
	console.log(hc.exists(a))
	hc.put(c)
	console.log(hc.exists(c))
	console.log(hc.get(c))
	
 * @class
 * @param	{array}	a	An array of objects {key: key, value: value} to store on init
 */
ivar.data.HashMap = function(a) {
	/**
	 * Keeps values in arrays labeled under typewise crc32 hashes
	 *
	 * @this	HashMap
	 * @protected
	 */
	var storage = {};
	
	this.getStorage = function() {
		return storage;
	}
	
	/**
	 * Produces an integer hash of a given value
	 * If the object is passed, before JSON stringification the properties are ordered. Note that because crc32 hashes strings, then boolean true would be the same as string 'true' or a sting '123' would be the same as integer 123, etc... We could add some modifier to solve this but a chance of using this with a set of values different by type is low in common use.
	 *
	 * @this 	HashCache
	 * @protected
	 * @param	{any}	value 	Any value to be hashed
	 * @return	{integer}		Integer hash
	 *
	 * @see 	ivar.orderedStringify
	 * @see 	ivar.whatis
	 * @see 	ivar.types
	 */	
	var hashFn = function(value) {
		var type = ivar.types[ivar.whatis(value)];
		
		if (type === 5 || type === 6) {
			value = ivar.orderedStringify(value);
		} else {
			value = value.toString();
		}

		return	ivar.crc32(value);
	};
	
	/**
	 * Gets value stored under the submited key
	 *
	 * @this	HashMap
	 *
	 * @param	{any}		key		Submited key
	 * @return	{any}				Value stored under the key
	 *
	 * @see HashMap.storage
	 * @see	ivar.equal
	 */
	this.get = function(key) {
		var hash = hashFn(key);
		var bucket = storage[hash];
		if (bucket && bucket.length > 0) {
			for (var i = 0; i < bucket.length; i++) {
				if(ivar.equal(bucket[i].key, key))
					return bucket[i].value;
			}
		}
	};
	
	/**
	 * Gets bucket id if the key is already stored under the hash in the bucket
	 * Only for this.put
	 *
	 * @this	HashMap
	 *
	 * @param	{any}		key		Submited key
	 * @return	{integer}			If the key exists in bucket returns positive integer, otherwise -1
	 *
	 * @see HashMap.storage
	 * @see	ivar.equal
	 */
	var getBucketId = function(hash, key) {
		var bucket = storage[hash];
		if (bucket && bucket.length > 0) {
			for (var i = 0; i < bucket.length; i++) {
				if(ivar.equal(bucket[i].key, key))
					return i;
			}
		}
		return -1;
	};
	
	/**
	 * Hashes the value and stores it in the hash table where the generated hash is a key
	 *
	 * @this	HashMap
	 * @public
	 * @param	{any}	key 	Any value to be stored
	 * @param	{any}	value 	Any value to be stored
	 *
	 * @see	HashMap.hashFn
	 * @see HashMap.storage
	 * @see	HashMap.getBucketId
	 */
	this.put = function(key, value) {
		var hash = hashFn(key);
		var bucket_id = getBucketId(hash, key);
		if(bucket_id === -1) {
			if (storage.hasOwnProperty(hash)) {
				storage[hash].push({key: key, value: value});
			} else {
				storage[hash] = [{key: key, value: value}];
			}
		} else {
			storage[hash][bucket_id] = {key: key, value: value};
		}
	}
	
	/**
	 * Checks if the value is listed in HashCache instance
	 *
	 * @this	HashMap
	 * @public
	 * @param	{any}	key 	Any key to be checked for existance
	 * @return	{boolean}		If the value is listed
	 *
	 * @see	HashMap.hashFn
	 * @see HashMap.hashHoldsKey
	 */
	this.exists = function(key) {
		var hash = hashFn(key);
		return getBucketId(hash, key) > -1 ? true : false;
	}
	
	/**
	 * Finds the value listed and removes it from the HashCache instance
	 *
	 * @this	HashMap
	 * @public
	 * @param	{any}	value 	Any value to be removed
	 * @return 	{boolean}		If the value existed and was removed
	 *
	 * @see	HashMap.hashFn
	 * @see HashMap.storage
	 * @see ivar.equal
	 */
	this.remove = function(key) {
		var hash = hashFn(key);
		var bucket_id = getBucketId(hash, key);
		var res = false;
		if(bucket_id > -1) {
			bucket_id > 0 ? storage[hash].splice(bucket_id, 1) : delete storage[hash];
			return true;
		}
		return res;
	}
	
	
	//INIT
	if (a !== undefined && ivar.whatis(a) === 'array') {
		for (var i = 0; i < a.length; i++) {
			this.put(a[i].key, a[i].value);
		}
	}
};
