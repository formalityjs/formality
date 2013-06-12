require('ivar/html.js');
require('ivar.test.*');
require('ivar.patt.Events');
require('ivar.data.StringTree');
require('ivar.data.Graph');
require('http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js');
require('ivar.net.Communication');


function test() {
	ivar.print(a);
	ivar.print(b);
}

function asd() {
	var test = ['omgzlol','omfg','lol'];
	var test1 = ['omgzlol','rofl','zlol', 'yolo'];
	var test2 = ['rofl'];
	var st = new ivar.data.StringTree();
	st.put(test);
	st.put(test1);
	st.put(test2);
	//st.put('omg');
	//st.put('foo');
	//st.put('fool');
	
	var out = def({
		'int': function(a) {
			alert('Here is int '+a);
		},
		
		'float': function(a) {
			alert('Here is float '+a);
		},
		
		'string': function(a) {
			alert('Here is string '+a);
		},
		
		'int,string': function(a, b) {
			alert('Here is an int '+a+' and a string '+b);
		},
		'default': function(obj) {
			alert('Here is some other value '+ obj);
		}
		
	});
		
	var u = setUniqueObject().__uid__;
	print(u);
	print(window[u]);
	print(uid());
	print(st);
	print(st.find(['omgzlol','omfg','lol']));
	namespace('ivar.lol.omg');
	ivar.lol.omg.zomg = 'yes!';
	print(ivar.lol.omg.zomg);
	var h = html.create('h1');
	h.innerHTML = 'lol!';
	var b = document.body;
	b.appendChild(h);
	
	function    Lol  () {
		this.test = '2';
	}
	
	Lol.method(function rofl(){return 'lolzors'});
	
	function Rofl() {
	
	};
	
	function Animal() {
		this.genitals = true;
	};
	
	Animal.method(function say(){
		print(this.says);
	});
	
	function Horse() {
		this.says = 'njiii';
		this.legs = 4;
	};
	
	Horse.inherit(Animal);
	
	function Bird() {
		this.says = 'ciuciu';
		this.legs = 2;
		this.wings = 2;
	};
	
	Bird.inherit(Animal);
	
	function Pegasus() {
		this.explodes = true;
	};
	
	Pegasus.inherit(Bird, Horse);
	
	var p = new Pegasus();
	
	print(p);
	p.say();
	
	Rofl.inherit(Lol);
	var a = new Rofl();
	for(var i in a)
		print(i);
	var lol = new Lol();
	print(lol);
	//print(lol.rofl());
	
	var g = new ivar.data.Graph();
	g.addNode('a');
	g.addNode('b');
	g.link({label: 'knows', distance: 26 },'a','b');
	g.link({label: 'knows', distance: 0 },'a');
	print(g);
}

ready(test);
ready(asd);
