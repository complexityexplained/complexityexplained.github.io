
(function(){

var world_width = 280,
	world_height = 280,
	controlbox_width = 280,
	controlbox_height = 80,
	n_grid_x = 12,
	n_grid_y = 2,
	margin = 10;
	
var display  = d3.select("#forrest_display").append("canvas")
		.attr("id", "canvas")
		.attr("width", world_width)
		.attr("height", world_height)
		.attr("class","explorable_display")
	
var context = display.node().getContext("2d");
	context.translate(world_width/2, world_height/2);
	
var controls = d3.selectAll("#forrest_controls").append("svg")
		.attr("width",controlbox_width)
		.attr("height",controlbox_height)
		.attr("class","explorable_widgets")	
	
var g = widget.grid(controlbox_width,controlbox_height,n_grid_x,n_grid_y);

/*controls.selectAll(".grid").data(g.lattice()).enter().append("circle")
	.attr("class","grid")
	.attr("transform",function(d){
		return "translate("+d.x+","+d.y+")"
	})
	.attr("r",1)
	.style("fill","black")
	.style("stroke","none")*/

//fixed parameters 
	
var N = 70,
	burntime=5,
	t;	

// this are the default values for the slider variables

var def_f = 0.25,
	def_p = 0.05,
	def_c = 1,
	def_ignition = 0.45;
	
//var playblock = g.block({x0:3,y0:10,width:0,height:0});
var buttonblock = g.block({x0:3,y0:1,width:6,height:0}).Nx(2);

//var sliderblock = g.block({x0:1,y0:1.5,width:10,height:5}).Ny(4);
//var plotblock = g.block({x0:1,y0:0.5,width:10,height:2});	
// here are the buttons

var playpause = { id:"ff_b1", name:"", actions: ["play","pause"], value: 0};
var back = { id:"ff_b2", name:"", actions: ["back"], value: 0};
//var reset = { id:"b3", name:"", actions: ["rewind"], value: 0};


 buttons = [
	widget.button(playpause).size(60).symbolSize(30).update(runpause),
	widget.button(back).size(60).symbolSize(30).update(resetsystem)
]

var name="forrest fire"
explorable_states.push({name:"forrest fire",state:false,ppbutton:buttons[0]})

var f = {id:"ff_f", name: "Lightning rate", range: [0.1,1], value: def_f};
var p = {id:"ff_p", name: "Vegetation growth rate", range: [0.01,0.1], value: def_p};
var c = {id:"ff_c", name: "Long distance dispersal", range: [1,.8], value: def_c};
var ignition = {id:"ignition", name: "Ingnition probability", range: [0.3,.6], value: def_ignition};


var bu = controls.selectAll(".button .others").data(buttons).enter().append(widget.buttonElement)
	.attr("transform",function(d,i){return "translate("+buttonblock.x(i)+","+buttonblock.y(0)+")"});	


var X = d3.scaleLinear().domain([-N,N]).range([-world_width/2,world_width/2]);
var Y = d3.scaleLinear().domain([-N,N]).range([-world_height/2,world_height/2]);

var C =  d3.scaleOrdinal().domain(["empty","tree","fire"]).range(["black","rgb(0,150,0)","red"]);
var CF =  d3.scaleLinear().domain([0,burntime]).range(["black","red"]);

var cell = d3.line()
		.x(function(d) { return X(d.x); })
		.y(function(d) { return Y(d.y);; })
		.context(context);
	
var G = lattice.square(N).scale(1).boundary("periodic");

var nodes = G.nodes;

var cell = d3.line().x(function(d) { return X(d.x); }).y(function(d) { return Y(d.y); }).context(context);
	
setup();

function setup(){
	nodes.forEach(function(d){
		d.state=Math.random()<0.1 ? "tree" : "empty";
	})
	draw();	
	draw()
}

function erase(){
	context.clearRect(-world_width/2, -world_height/2,world_width, world_height)
}
function draw(){
	nodes.forEach(function(d,i){
		context.beginPath();
		cell(G.cell(d));
		context.fillStyle=d.state!="fire" ? C(d.state) : CF(d.burning);
		context.fill();
	})
}


var tick=0;

var t;

// functions for the action buttons


function runpause(d){ 
	if (d.value == 1) {
		explorable_states.forEach(function(d){
			if (d.state==true) {
				d.ppbutton.click()
				d.state=false
			}
		})
		t = d3.interval(runsim,0)
		explorable_states.filter(function(d){return d.name==name})[0].state=true

	} else {
		t.stop()
		explorable_states.filter(function(d){return d.name==name})[0].state=false
	}
 }

function resetsystem(){
	setup();
	tick=0;
	
}



function runsim(){
	
	tick++;
	
	var trees = nodes.filter(function(d){return d.state=="tree"});

	var fire = nodes.filter(function(d){return d.state=="fire"});
	

	trees.forEach(function(n){
		if (Math.random()<p.value){
		if (Math.random()<c.value){
			var nn = n.neighbors[Math.floor(Math.random()*8)];
			if (nn.state=="empty") {nn.state="tree"} 
		} else {
			var ix = Math.floor(Math.random()*nodes.length);
			if (nodes[ix].state=="empty") {nodes[ix].state="tree"} 
		}
	}
		
	})
		
	
	fire.forEach(function(n){
		n.neighbors.forEach(function(x){
			if (x.state=="tree" && Math.random() <ignition.value && n.burning==burntime) {
				x.state="fire"
				x.burning=burntime;
			} 
		})
		n.burning-=1;
		if(n.burning==0){n.state="empty"}
	})
	
	if(Math.random()<f.value){
		var ix = Math.floor(Math.random()*nodes.length);
		nodes[ix].state="fire"
		nodes[ix].burning=burntime;
	}
	
	
	
	draw()
	
}


})()