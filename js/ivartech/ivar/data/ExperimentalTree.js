/**
 *	Non binary tree data structure with parent references for reverse traversing.
 *	Accepts a path, that is, an array consisted of names for nodes, and can, but doesn't have too store the value at the end of the chain. *Note: Nodes must be named, names can be any data type, names uniquely deifne the node. Value field of a node is by default null. If it is undefined it is considered that node doesnt exist
 *
 *	@author		Nikola Stamatovic Stamat <stamat@ivartech.com>
 *	@copyright	IVARTECH http://ivartech.com
 *	@version	20130809  
 *	@file
 *
 *	@namespace	ivar.data
 */

ivar.namespace('ivar.data');

/**
 *	Sufficient to manifest a Node tree itself, but contains only Node-wise methods
 *	Which means that it needs a controler in order to offer a full tree functionality
 *	@class
 */
ivar.data.eNode = function(name, parent, value, end) {
	this.children = {};
	if(name === undefined) throw 'Node must have a name';
	this.name = name;
	value !== undefined ? this.value = value : this.value = null;
	parent !== undefined ? this.parent = parent : this.parent = null;
	end !== undefined ? this.end = end : this.end = false;
	this.level = 0;
};

ivar.data.eNode.prototype.getChildByValue = function(val) {
	if(field === undefined) field = 'name';
	for (var i in this.children) {
		if(ivar.equal(this.children[i].value, val))
			return this.children[i];
	}
};

ivar.data.eNode.prototype.getChild = function(val) {
		return this.children[val];
};

ivar.data.eNode.prototype.removeChild = function(val) {
		var res = this.children[val];
		delete this.children[val];
		return res;
};

ivar.data.eNode.prototype.remove = function() {
	return this.parent.removeChild(this.name);
};

ivar.data.eNode.prototype.equals = function(node) {
	if(this === node) return true;
	if(this.end !== node.end) return false;
	if(!ivar.equal(this.name, node.name)) return false;
	if(!ivar.equal(this.value, node.value)) return false;
	if(this.children.length !== node.children.length) return false;
	for(var i in this.children) {
		if(!this.children[i].equals(node.children[i])) return false;
	}
	return true;
};

ivar.data.eNode.prototype.childExists = function(val) {
	return this.getChild(val) !== undefined;
};

ivar.data.eNode.prototype.hasChildren = function() {
	return !ivar.isEmpty(this.children);
};

ivar.data.eNode.prototype.addChild = function(name, value, end) {
	var node = this.getChild(name);
	if(node  === undefined) {
		node = new ivar.data.eNode(name, this, value, end);
		this.children[name] = node;
	} else {
		if(value !== undefined) node.value = value;
		if(end !== undefined) node.end = end;
	}
	if(node.parent !== null)
		node.level = node.parent.level+1;
	return node;
};


/**
 *	Tree class with methods of storing, getting and removing path of nodes
 *	@class
 */
ivar.data.eTree = function() {
	this.root = new ivar.data.eNode('root');
	//this.leaves = [];
	//this.ends = [];
};

ivar.data.eTree.prototype.clear = function() {
	this.root = new ivar.data.eNode('root');
	//this.leaves = [];
	//this.ends = [];
};

ivar.data.eTree.prototype.put = function(path, val, root) {
	if(root === undefined) root = this.root;
	
	for(var i = 0; i < path.length; i++) {
		if(i === path.length-1) {
			root = root.addChild(path[i], val, true);
			break;
		}
		root = root.addChild(path[i]);
	}
	return root;
};

ivar.data.eTree.prototype.pathExists = function(path, root) {
	return this.get(path, root) !== undefined;
};

ivar.data.eTree.prototype.exists = function(path) {
	var node = this.get(path, this.root);
	return node !== undefined && node.end;
};

ivar.data.eTree.prototype.get = function(path, root) {
	if(root === undefined) root = this.root;
	for(var i = 0; i < path.length; i++) {
		root = root.getChild(path[i]);
		if(root === undefined) break;
		if(i === path.length-1) return root;
	}
};

ivar.data.eTree.prototype.getValue = function(path, root) {
	var node = this.get(path, root);
	if(node !== undefined)
		return node.value;
};

/*
	remove endswise
*/
ivar.data.eTree.prototype.remove = function(path, root) {
	var node = this.get(path, root);
	if(node !== undefined && node.end) {
		node.end = false;
		if(node.hasChildren()) {
			return node;
		} else {
			var prev;
			while (!node.end) {
				prev = node;
				if(node.parent.children.length > 1) break;
				node = node.parent;
			}
			return prev.remove();
		}
	}
};

ivar.data.eTree.prototype.clip = function(path, root) {
	var node = this.get(path, root);
	if(node !== undefined) {
		return node.remove();
	}
};

ivar.data.eTree.prototype.each = function(perNode, root) {
	if(root === undefined) root = this.root;
	
	var traverse = function(node) {
		for(var i in node.children) {
			perNode(node.children[i]);
			if(node.children[i].hasChildren()) {
				traverse(node.children[i]);
			}
		}
	};
	traverse(root);
};

ivar.data.eTree.prototype.getLevel = function(level, root) {
	if(root === undefined) root = this.root;	
	var l = 1;
	var traverse = function(nodes) {
		var all_children = [];
		for(var i = 0; i < nodes.length; i++) {
			if(nodes[i].hasChildren())
				all_children = all_children.concat(ivar.getValues(nodes[i].children));
		}
		
		if(level === l) return all_children;
		
		if(all_children.length > 0) {
			l++;
			return traverse(all_children);
		}
	};
	
	return traverse([root]);
};

ivar.data.eTree.prototype.countLevels = function(root) {
	if(root === undefined) root = this.root;	
	var l = 0;
	this.eachLevel(root, function(a){l++;});	
	return l;
};

ivar.data.eTree.prototype.eachLevel = function(nodes, perLevel, perNode) {
	var all_children = [];
	if(nodes.length === undefined) nodes = [nodes];
	for(var i = 0; i < nodes.length; i++) {
		if(perNode) perNode(nodes[i]);
		if(nodes[i].hasChildren()) {
			all_children = all_children.concat(ivar.getValues(nodes[i].children));
		}
	}
	if(all_children.length > 0) {
		if(perLevel) perLevel(all_children);
		this.eachLevel(all_children, perLevel, perNode);
	}
}

ivar.data.eTree.prototype.getLeaves = function() {
	var res = [];
	this.each(function(n){
		if(!n.hasChildren()) res.push(n);
	});
	return res;
};

ivar.data.eTree.prototype.equals = function(tree) {
	return this.root.equals(tree.root);
};

ivar.data.eTree.prototype.merge = function() {
	//TODO
};

ivar.data.eTree.prototype.findAll = function(val, field) {
	var res = [];
	if(field === undefined) field = 'name';
	this.each(function(n){
		if(ivar.equal(n[field], val)) res.push(n);
	});
	return res;
};

ivar.data.eTree.prototype.dfs = function(val, field, root) {
	if(root === undefined) root = this.root;
	if(field === undefined) field = 'name';
	
	var traverse = function(node) {
		for(var i in node.children) {
			if(ivar.equal(node.children[i][field], val)) { 
				return node.children[i];
			}
			if(node.children[i].hasChildren()) {
				var res = traverse(node.children[i]);
				if(res !== undefined) return res;
			}
		}
	};
	return traverse(root);
};

ivar.data.eTree.prototype.bfs = function(val, field, root) {
	if(root === undefined) root = this.root;
	if(field === undefined) field = 'name';
	
	var traverse = function(nodes) {
		var all_children = [];
		for(var i = 0; i < nodes.length; i++) {
			if(ivar.equal(nodes[i][field], val)) return nodes[i];
			if(nodes[i].hasChildren())
				all_children = all_children.concat(ivar.getValues(nodes[i].children));
		}
		
		if(all_children.length > 0)
			var res = traverse(all_children);
			if(res !== undefined) return res;
	};
	
	return traverse([root]);
};

ivar.data.eTree.prototype.find = function(val, field, type, root) {
	if(type === undefined) type = 'dfs';
	return this[type](val, field, root);
};

ivar.data.eTree.prototype.getEnds = function() {
	return this.find(true, 'end');
};

ivar.data.eTree.prototype.traverseUp = function(node, field) {
	var path = [];
	var n = node;
	var f;
	while(n.parent !== null) {
		field !== undefined && n.hasOwnProperty(field) ? f = n[field] : f = n;
		path[n.level-1] = f;
		n = n.parent;
	}
	return path;
};

ivar.data.eTree.prototype.getPaths = function(set, field) {
	var paths = [];
	for(var i = 0; i < set.length; i++) {
		paths.push(this.traverseUp(set[i], field));
	}
	return paths;
};

ivar.data.eTree.prototype.getEntries = function() {
	return this.getPaths(this.getEnds(), 'name');
};

/**
 *	Builds a tree out of passed object
 */
ivar.data.eTree.prototype.parse = function(obj) {
	var curr = this.root;
	var parseObject = function(obj, parent) {
		for(var i in obj) {
			var node = parent.addChild(i);
			if(Object.prototype.toString.call(obj[i])
		.match(/^\[object\s(.*)\]$/)[1].toLowerCase() === 'object') { //TODO:WHAT IF IT IS A TREE OR A NODE?
				parseObject(obj[i], node);
			} else {
				node.value = obj[i];
			}
		}
	};
	
	parseObject(obj, curr);
	this.root = curr;
	return this;
};

/**
 *	Builds an object out of the current tree
 */
ivar.data.eTree.prototype.build = function() {
	var res = {};
	
	var traverse = function(node, obj) {
		for(var i in node.children) {
			if(node.children[i].hasChildren()) {
				obj[node.children[i].name] = {};
				traverse(node.children[i], obj[node.children[i].name]);
			} else {
				obj[node.children[i].name] = node.children[i].value;
			}
		}
	}
	
	traverse(this.root, res);
	return res;
};
