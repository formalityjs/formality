/**
 *	@file		Array and object iterator
 *	@author		Nikola Stamatovic Stamat <stamat@ivartech.com>
 *	@copyright	IVARTECH http://ivartech.com
 *	@version	20130706  
 *	
 *	@namespace	ivar.data
 */
 
ivar.namespace('ivar.data');

function ArrayIterator(e) {
	this.keys = e;
	
	this.now = function() {
		return this.keys[this.pointer];
	};
	
	this.remove = function() {
		this.keys.splice(this.pointer, 1);
	};
	
	this.add = function(val) {
		this.keys.splice(this.pointer, 0, val);
		this.next();
	};
	
	this.set = function(val) {
		this.keys[this.pointer] = val;
	};
};

function ObjectIterator(e) {
	this.inst = e;
	this.keys = ivar.keys(this.inst);
	
	this.now = function() {
		return this.keys[this.pointer];
	};
	
	this.remove = function() {
		delete this.inst[this.keys[this.pointer]];
		this.keys.splice(this.pointer, 1);
	};
	
	this.add = function(key, val) {
		if(!this.inst.hasOwnProperty(key)) {
			this.inst[key] = val;
			this.keys.splice(this.pointer, 0, key);
			this.next();
			return true;
		}
		return false;
	};
	
	this.set = function(val) {
		this.inst[this.keys[this.pointer]] = val;
	};
};

function CustomIterator(e) {
	this.inst = e;
	this.keys = ivar.clone(typeof e.keys === 'function' ? e.keys() : e.keys);
	
	this.now = function() {
		return this.keys[this.pointer];
	};
	
	this.remove = function() {
		if(this.inst.remove && typeof this.inst.remove === 'function')
			this.inst.remove(this.keys[this.pointer]);
		else
			this.inst['delete'](this.keys[this.pointer]);
		
		this.keys.splice(this.pointer, 1);
	};
	
	this.add = function(key, val) {
		if(this.inst.put && typeof this.inst.put === 'function')
			this.inst.put(key, val);
		else
			this.inst.add(key, val);
		this.keys.splice(this.pointer, 0, key);
		this.next();
	};
	
	this.set = function(val) {
		this.inst.set(this.keys[this.pointer], val);
	};
};

function Iterator(e) {

	if(!ivar.isSet(e))
		throw new Error('Iterator requires an argument');
		
	var type = ivar.types[ivar.whatis(e)];
	this.pointer = 0;
	this.keys = null;
	
	if (type === 5) {
		ivar.extend(this, new ArrayIterator(e));
	} else if (e.hasOwnProperty('keys') && (typeof e.keys === 'function' || ivar.whatis(e.keys) === 'array')) {
		ivar.extend(this, new CustomIterator(e));
	} else if (type === 6) {
		ivar.extend(this, new ObjectIterator(e));
	} else {
		throw new TypeError();
	}
};

Iterator.prototype.hasNext = function() {
	return this.pointer < this.keys.length;
};

Iterator.prototype.next = function() {
	if(this.hasNext()) {
		this.pointer++;
	}
};

Iterator.prototype.nextIndex = function() {
	if(this.hasNext()) {
		return this.pointer+1;
	}
};

Iterator.prototype.hasPrevious = function() {
	return this.pointer > 0;
};

Iterator.prototype.previous = function() {
	if(this.hasPrevious()) {
		this.pointer--;
	}
};

Iterator.prototype.previousIndex = function() {
	if(this.hasPrevious()) {
		return this.pointer-1;
	}
};

Iterator.prototype.start = function() {
	this.pointer = 0;
};

Iterator.prototype.end = function() {
	this.pointer = this.keys.length;
};

Iterator.prototype.now = function() {
	
};

Iterator.prototype.remove = function() {
	
};

Iterator.prototype.add = function(val) {
	
};

Iterator.prototype.set = function(val) {
	
};
