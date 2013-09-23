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
ivar.data.Node = function(name, value, end, parent) {
	this.children = [];
	if(name === undefined) throw 'Node must have a name';
	this.name = name;
	this.value = value !== undefined ? value : null;
	this.parent = parent ? parent : null;
	this.end = end !== undefined ? end : null;
	this.level = 0;
};

ivar.data.Node.prototype.getChildID = function(val, field) {
	if(field === undefined) field = 'name';
	for (var i = 0; i < this.children.length; i++) {
		if(ivar.equal(this.children[i][field], val))
			return i;
	}
};

ivar.data.Node.prototype.getChild = function(val, field) {
	var id = this.getChildID(val, field);
	if(id !== undefined)
		return this.children[id];
};

ivar.data.Node.prototype.removeChild = function(val, field) {
	var id = this.getChildID(val, field);
	if(id !== undefined)
		return this.children.splice(id, 1);
};

ivar.data.Node.prototype.remove = function() {
	return this.parent.removeChild(this.name);
};

ivar.data.Node.prototype.equals = function(node) {
	if(this === node) return true;
	if(this.end !== node.end) return false;
	if(!ivar.equal(this.name, node.name)) return false;
	if(!ivar.equal(this.value, node.value)) return false;
	if(this.children.length !== node.children.length) return false;
	for(var i = 0; i < this.children.length; i++) {
		if(!this.children[i].equals(node.children[i])) return false;
	}
	return true;
};

ivar.data.Node.prototype.childExists = function(val, field) {
	return this.getChild(val, field) !== undefined;
};

ivar.data.Node.prototype.hasChildren = function() {
	return this.children.length > 0;
};

ivar.data.Node.prototype.addChild = function(node) {
	this.children.push(node);
	if(node.parent === null)
		node.parent = this;
	node.level = node.parent.level+1;
	return node;
};

/**
 *	Tree class with methods of storing, getting and removing path of nodes
 *	@class
 */
ivar.data.Tree = function() {
	this.root = new ivar.data.Node('root');
	//this.leaves = [];
	//this.ends = [];
};

ivar.data.Tree.prototype.clear = function() {
	this.root = new ivar.data.Node('root');
	//this.leaves = [];
	//this.ends = [];
};

ivar.data.Tree.prototype.addNode = function(pnode, name, value, end) {
	var node = pnode.getChild(name);
	if(node  === undefined) {
		node = new ivar.data.Node(name, value, end);
		pnode.addChild(node);
	} else {
		if(value !== undefined) node.value = node.value;
		if(end !== undefined) node.end = node.end;
	};
	return node;
};

ivar.data.Tree.prototype.put = function(path, value, root) {
	var root = root ? root : this.root;	
	
	for(var i = 0; i < path.length; i++) {
		root = this.addNode(root, path[i]);
	}
	
	if(value !== undefined) root.value = value;
	root.end = true;
	
	return root;
};

ivar.data.Tree.prototype.pathExists = function(path, root) {
	return this.get(path, root) !== undefined;
};

/* If entry exists */
ivar.data.Tree.prototype.exists = function(path) {
	var node = this.get(path, this.root);
	return node !== undefined && node.end;
};

ivar.data.Tree.prototype.get = function(path, root) {
	if(root === undefined) root = this.root;
	for(var i = 0; i < path.length; i++) {
		root = root.getChild(path[i]);
		if(root === undefined) break;
		if(i === path.length-1) return root;
	}
};

ivar.data.Tree.prototype.getValue = function(path, root) {
	var node = this.get(path, root);
	if(node !== undefined)
		return node.value;
};

/*
	remove endswise
*/
ivar.data.Tree.prototype.remove = function(path, root) {
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

ivar.data.Tree.prototype.clip = function(path, root) {
	var node = this.get(path, root);
	if(node !== undefined) {
		return node.remove();
	}
};

ivar.data.Tree.prototype.each = function(perNode, root) {
	if(root === undefined) root = this.root;
	
	var traverse = function(node) {
		for(var i = 0; i < node.children.length; i++) {
			perNode(node.children[i]);
			if(node.children[i].hasChildren()) {
				traverse(node.children[i]);
			}
		}
	};
	traverse(root);
};

ivar.data.Tree.prototype.getLevel = function(level, root) {
	if(root === undefined) root = this.root;	
	var l = 1;
	var traverse = function(nodes) {
		var all_children = [];
		for(var i = 0; i < nodes.length; i++) {
			if(nodes[i].hasChildren())
				all_children = all_children.concat(nodes[i].children);
		}
		
		if(level === l) return all_children;
		
		if(all_children.length > 0) {
			l++;
			return traverse(all_children);
		}
	};
	
	return traverse([root]);
};

ivar.data.Tree.prototype.countLevels = function(root) {
	if(root === undefined) root = this.root;	
	var l = 0;
	this.eachLevel(root, function(a){l++;});	
	return l;
};

ivar.data.Tree.prototype.eachLevel = function(nodes, perLevel, perNode) {
	var all_children = [];
	if(nodes.length === undefined) nodes = [nodes];
	for(var i = 0; i < nodes.length; i++) {
		if(perNode) perNode(nodes[i]);
		if(nodes[i].hasChildren()) {
			all_children = all_children.concat(nodes[i].children);
		}
	}
	if(all_children.length > 0) {
		if(perLevel) perLevel(all_children);
		this.eachLevel(all_children, perLevel, perNode);
	}
}

ivar.data.Tree.prototype.getLeaves = function(root) {
	var res = [];
	this.each(function(n){
		if(!n.hasChildren()) res.push(n);
	}, root);
	return res;
};

ivar.data.Tree.prototype.equals = function(tree) {
	return this.root.equals(tree.root);
};

ivar.data.Tree.prototype.merge = function() {
	//TODO
};

ivar.data.Tree.prototype.findAll = function(val, field, root) {
	var res = [];
	if(field === undefined) field = 'name';
	this.each(function(n){
		if(ivar.equal(n[field], val)) res.push(n);
	}, root);
	return res;
};

ivar.data.Tree.prototype.dfs = function(val, field, root) {
	if(root === undefined) root = this.root;
	if(field === undefined) field = 'name';
	
	var traverse = function(node) {
		for(var i = 0; i < node.children.length; i++) {
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

ivar.data.Tree.prototype.bfs = function(val, field, root) {
	if(root === undefined) root = this.root;
	if(field === undefined) field = 'name';
	
	var traverse = function(nodes) {
		var all_children = [];
		for(var i = 0; i < nodes.length; i++) {
			if(ivar.equal(nodes[i][field], val)) return nodes[i];
			if(nodes[i].hasChildren())
				all_children = all_children.concat(nodes[i].children);
		}
		
		if(all_children.length > 0)
			var res = traverse(all_children);
			if(res !== undefined) return res;
	};
	
	return traverse([root]);
};

ivar.data.Tree.prototype.find = function(val, field, type, root) {
	if(type === undefined) type = 'dfs';
	return this[type](val, field, root);
};

ivar.data.Tree.prototype.getEnds = function(root) {
	return this.findAll(true, 'end', root);
};

ivar.data.Tree.prototype.traverseUp = function(node, field) {
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

ivar.data.Tree.prototype.getPaths = function(set, field) {
	var paths = [];
	for(var i = 0; i < set.length; i++) {
		paths.push(this.traverseUp(set[i], field));
	}
	return paths;
};

ivar.data.Tree.prototype.getEntries = function(root) {
	return this.getPaths(this.getEnds(root), 'name');
};

/**
 *	Builds a tree out of passed object
 */
ivar.data.Tree.prototype.parse = function(obj) {
	var curr = this.root;
	var parseObject = function(obj, parent) {
		for(var i in obj) {
			var node = this.addNode(parent, i);
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
ivar.data.Tree.prototype.build = function() {
	var res = {};
	
	var traverse = function(node, obj) {
		for(var i = 0; i < node.children.length; i++) {
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
