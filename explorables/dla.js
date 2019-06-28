(function(){


var world_width = 280,
	world_height = 280,
	controlbox_width = 280,
	controlbox_height = 120,

	n_grid_x = 12,
	n_grid_y = 4;

;

// fixed parameters 
	
var N = 300, // # of agents
	L = 64 , // world size
	agentsize = 1,
	dt = 1,
	dt2 = Math.sqrt(dt),
	agentcolor = "rgb(150,150,150)",
	hiddenagentcolor = "rgb(230,230,230)",
	structurecolor = "darkred",
	agents = []; 

// this are the default values for the slider variables

var def_speed = 0.8, 
	def_noise = 0.8,
	def_attraction = 0.05,
	def_twist = 0.05,
	def_twistmix = 0.0;
	
var g = widget.grid(controlbox_width,controlbox_height,n_grid_x,n_grid_y);


	
// parameter objects for the sliders
	
var v = {id:"speed", name: "speed", range: [0,1.4], value: def_speed};
var sigma = {id:"wiggle", name: "wiggle", range: [0,agentsize], value: def_noise};
var gamma = {id:"attraction", name: "atraction", range: [0,0.5*agentsize], value: def_attraction};
var delta = {id:"twist", name: "twist", range: [0,0.5*agentsize], value: def_twist};
var twistmix = {id:"twistmix", name: "twist mix", range: [0,1], value: def_twistmix};

// action parameters for the buttons

var playpause = { id:"b1", name:"", actions: ["play","pause"], value: 0};
var back = { id:"b2", name:"", actions: ["rewind"], value: 0};
var reload = { id:"b3", name:"", actions: ["reload"], value: 0};

var hide = {id:"t1", name: "hide particles",  value: false};

// widget.block helps distributing widgets in neat arrays

var buttonblock = g.block({x0:3,y0:1,width:0,height:2}).Ny(2);
var sliderblock = g.block({x0:6,y0:1,width:10,height:2}).Ny(2);


// slider objects

var sliders = [
//	widget.slider(v).width(slider_width-slider_margin.left-slider_margin.right),
//	widget.slider(sigma).width(slider_width-slider_margin.left-slider_margin.right),
	widget.slider(gamma),
	widget.slider(delta),
//	widget.slider(twistmix).width(slider_width-slider_margin.left-slider_margin.right)
]

// button objects

var buttons = [
		widget.button(back).update(setup),
	widget.button(playpause).update(runpause)

//	widget.button(reload).update(resetparameters)
]

var name="dla"
explorable_states.push({name:"dla",state:false,ppbutton:buttons[1]})

// position scales
var X = d3.scaleLinear().domain([-L,L]).range([0,world_width]);
var Y = d3.scaleLinear().domain([-L,L]).range([world_height,0]);
var R = d3.scaleLinear().domain([0,2 * L]).range([0,world_width]);

// this is the box for the simulation


var world = d3.selectAll("#dla_display").append("canvas")
	.attr("width",world_width)
	.attr("height",world_height)
	.attr("class","explorable_display")


var context = world.node().getContext("2d");	

// this is the svg for the widgets
	
var controls = d3.selectAll("#dla_controls").append("svg")
	.attr("width",controlbox_width)
	.attr("height",controlbox_height)
	.attr("class","explorable_widgets")

/*controls.selectAll(".grid").data(g.lattice()).enter().append("circle")
		.attr("class","grid")
		.attr("transform",function(d){
			return "translate("+d.x+","+d.y+")"
		})
		.attr("r",1)
		.style("fill","black")
		.style("stroke","none")*/

var pb = controls.selectAll(".button").data(buttons).enter().append(widget.buttonElement)
		.attr("transform",function(d,i){return "translate("+buttonblock.x(0)+","+buttonblock.y(i)+")"});

var sl = controls.selectAll(".slider").data(sliders).enter().append(widget.sliderElement)
		.attr("transform",function(d,i){return "translate("+sliderblock.x(0)+","+sliderblock.y(i)+")"});	

/////////////////////////////////////////
		
// add agents to the scene
	
setup();

// timer variable for the simulation

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

function setup(){
	d3.select("#button_b1").transition().style("opacity",1)
	agents = d3.range(N).map(function(d,i){
		var theta = Math.random() * 2 * Math.PI;
		return {
				x: Math.random()  * 2 * L -L, 
				y: Math.random()  * 2 * L -L,
				state: 1,
				polarity: Math.random()
		}
	})
	agents.push({x: 0, y: 0 ,state: 0});
	
	context.fillStyle = "rgb(230,230,230)";
	context.fillRect(0,0,world_width-1,world_height-1)		
	agents.forEach(function(d){
					context.moveTo(X(d[0]), Y(d[1]));
					context.beginPath();
				    context.arc(X(d.x), Y(d.y), R(agentsize) / 2, 0, 2 * Math.PI);
					context.fillStyle = d.state ? (hide.value ? hiddenagentcolor : agentcolor) : structurecolor
					context.fill()
	})
}

function redraw(){
	context.fillStyle = "rgb(230,230,230)";
	context.fillRect(0,0,world_width-1,world_height-1)		
	agents.forEach(function(d){
					context.moveTo(X(d[0]), Y(d[1]));
					context.beginPath();
				    context.arc(X(d.x), Y(d.y), R(agentsize) / 2, 0, 2 * Math.PI);
					context.fillStyle = d.state ? (hide.value ? hiddenagentcolor : agentcolor) : structurecolor
					context.fill()
	})
}

function resetparameters(){
	sliders[0].click(def_speed);
	sliders[1].click(def_noise);
	sliders[2].click(def_attraction);
	sliders[3].click(def_twist);
	sliders[4].click(def_twistmix);
}

function finished(){
	buttons[0].click();	
}

function runsim(){	
		
	// make a step
	var fin = 1;
	agents.forEach(function(d){
		if (d.state == 1)
		{
			var P = d.polarity < twistmix.value ? 1 : -1;	
			var r = Math.sqrt(d.x * d.x + d.y * d.y);
			var dx =  v.value * dt * ( (- gamma.value * d.x + P * delta.value * d.y) / r ) + sigma.value * (Math.random()-0.5) * dt2 * Math.sqrt(v.value);
			var dy =  v.value * dt * ( (- gamma.value * d.y - P * delta.value * d.x) / r ) + sigma.value * (Math.random()-0.5) ** dt2 * Math.sqrt(v.value);
	
			var x_new= (d.x + dx);
			var y_new= (d.y + dy);
		
			if (x_new < - L || x_new > L) {dx *= -1 }
			if (y_new < - L || y_new > L) {dy *= -1 }

			d.x= (d.x + dx)
			d.y= (d.y + dy)
			statics = agents.filter(function(d){return d.state == 0});
			var i = 0;

			while(d.state == 1 && i<statics.length && fin == 1){
				var a = statics[i];
				if (( d.x - a.x ) * ( d.x - a.x ) + ( d.y - a.y ) * ( d.y - a.y ) < agentsize *  agentsize ) {
					d.state = 0; addagent()
					if ((d.x * d.x + d.y * d.y) > (L-2)*(L-2) ) {
						finished();
						fin = 0;	
					}	
				}
				i++
			}
		}
	})



	
	// update stuff on screen
	context.fillStyle = "rgb(230,230,230)";
	context.fillRect(0,0,world_width-1,world_height-1)		
	agents.forEach(function(d){
					context.moveTo(X(d[0]), Y(d[1]));
					context.beginPath();
				    context.arc(X(d.x), Y(d.y), R(agentsize) / 2, 0, 2 * Math.PI);
										context.fillStyle = d.state ? (hide.value ? hiddenagentcolor : agentcolor) : structurecolor
					context.fill()
	})
		
}

function addagent(){
	var theta = Math.random() * 2 * Math.PI;
	agents.push({
			x:  L * Math.cos(theta), 
			y:  L * Math.sin(theta),
			state: 1,
			polarity: Math.random()
	})
}
		

	
})()