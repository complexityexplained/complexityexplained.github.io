(function(){
		

var world_width = 280,
	world_height = 280,
	controlbox_width = 280,
	controlbox_height = 120,
	n_grid_x = 12,
	n_grid_y = 12,
	margin = 10;

var tick=0;

var NI,NS,NV;
	
var display = d3.selectAll("#herd_display").append("svg")
	.attr("width",world_width)
	.attr("height",world_height)
	.attr("class","explorable_display")
	
var controls = d3.selectAll("#herd_controls").append("svg")
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
	.style("stroke","none");*/
	
var playblock = g.block({x0:3,y0:10,width:0,height:0});
var buttonblock = g.block({x0:1.5,y0:6,width:2.5,height:0}).Nx(2);
var radioblock = g.block({x0:6.5,y0:7,width:0,height:4});
var sliderblock = g.block({x0:6,y0:3,width:5,height:6}).Ny(2);
	
var playpause = { id:"herd_b1", name:"", actions: ["play","pause"], value: 0};
var back = { id:"herd_b2", name:"", actions: ["rewind"], value: 0};
var reset = { id:"herd_b3", name:"", actions: ["rewind"], value: 0};

var def_vac = 0;
var def_alpha = 0.5;

var C = d3.scaleOrdinal().domain(["I","S","V"]).range(["red","white","rgb(80,80,80)"]);

var vac = {id:"", name: "Vaccine Uptake", range: [0,1], value: def_vac};
var alpha = {id:"v1", name: "Transmissibility", range: [0,1], value: def_alpha};	

var c1 = {id:"herd_c1", name:"Radio", choices: ["Mixing population","Static network", "dynamic Network","Lattice model"], value:2}

var models = [new model_well_mixed(),new model_static_network(),new model_dynamic_network(), new model_spatial()];



var buttons = [
	widget.button(playpause).update(runpause),
	
	widget.button(back).update(models[c1.value].resetsystem)
	
]

var name="epi"
explorable_states.push({name:"epi",state:false,ppbutton:buttons[0]})

var sliderwidth = sliderblock.w(),
	handleSize = 12, 
	trackSize = 8;

var slider = [
	widget.slider(vac).width(sliderwidth).trackSize(trackSize).handleSize(handleSize),
	widget.slider(alpha).width(sliderwidth).trackSize(trackSize).handleSize(handleSize)
]

var radios = [
	widget.radio(c1).size(radioblock.h()).label("right")
	.shape("circle").buttonSize(26).buttonInnerSize(18).fontSize(16).update(selectModel)
]

//var pb = controls.selectAll(".button .playbutton").data(playbutton).enter().append(widget.buttonElement)
//	.attr("transform",function(d,i){return "translate("+playblock.x(0)+","+playblock.y(i)+")"});	

var bu = controls.selectAll(".button .others").data(buttons).enter().append(widget.buttonElement)
	.attr("transform",function(d,i){return "translate("+buttonblock.x(i)+","+buttonblock.y(0)+")"});	

var spsl = controls.selectAll(".slider").data(slider).enter().append(widget.sliderElement)
	.attr("transform",function(d,i){return "translate("+sliderblock.x(0)+","+sliderblock.y(i)+")"});

//var rad = controls.selectAll(".radio .input").data(radios).enter().append(widget.radioElement)
//	.attr("transform",function(d,i){return "translate("+radioblock.x(0)+","+radioblock.y(0)+")"});	
			

function clearDisplay(){
	display.selectAll("*").remove()
}
var current_model = 0;

function selectModel(){

	if (buttons[0].value()==1) {
		t.stop()
		buttons[0].click()
	}
	models[current_model].stop();
	model = models[c1.value];
	buttons[1].update(model.resetsystem);
	model.setup();
	current_model=c1.value;

}	

var t;
// model well mixed

function runpause(d){ 
	if (d.value == 1) {
		explorable_states.forEach(function(d){
			if (d.state==true) {
				d.ppbutton.click()
				d.state=false
			}
		})
		t = d3.interval(model.runsim,0)
		explorable_states.filter(function(d){return d.name==name})[0].state=true

	} else {
		t.stop()
		explorable_states.filter(function(d){return d.name==name})[0].state=false
	}
 }
 
selectModel();

function model_well_mixed(){

		
var speed = 0.1,
	wiggle = 30/180*Math.PI,
	R = 1,
	L = 100,
	N=200,
	I0=10/N,
	personscale=0.035;

var beta = 0.005;
	
var X = d3.scaleLinear().domain([0,L]).range([0, world_width]),
	Y = d3.scaleLinear().domain([0,L]).range([0, world_height]),
	alpha_scale = d3.scaleLinear().domain([0,1]).range([0, .1])

var agents = [];
	node = [],
	men = [];

function setup() { 
	clearDisplay();
	
	agents = d3.range(N).map(function(i){
		var theta = 2*Math.PI*Math.random();
		var state = i > (1-I0)*N ? "I" : "S"
		return {
				id:i,
				theta: theta,
				x:L*Math.random(),
				y:L*Math.random(),
				vx:speed*Math.cos(theta),
				vy:speed*Math.sin(theta),
				state: state
		}
	})

NI=agents.filter(function(d){return d.state=="I"}).length;
NS=agents.filter(function(d){return d.state=="S"}).length;
NV=agents.filter(function(d){return d.state=="V"}).length;


node = display.selectAll(".agent").data(agents).enter().append("g").attr("class","agent")
	.attr("transform",function(d){return "translate("+X(d.x)+","+Y(d.y)+")"})
	
men = node.append("path").attr("class","man")
	.attr("d",man)
	.attr("transform","translate(-5.5,-12)scale("+personscale+")")
	.style("stroke-width",""+0.5/personscale+"px")
	.style("stroke","black")
	.style("fill",function(d){return C(d.state)})
}

function resetsystem(){
	
	agents = d3.range(N).map(function(i){
		var theta = 2*Math.PI*Math.random();
		var state = i > (1-I0)*N ? "I" : "S"
		return {
				id:i,
				theta: theta,
				x:L*Math.random(),
				y:L*Math.random(),
				vx:speed*Math.cos(theta),
				vy:speed*Math.sin(theta),
				state: state
		}
	})
	
	tick=0;
	
	node.data(agents).attr("transform",function(d){return "translate("+X(d.x)+","+Y(d.y)+")"});	
	men.data(agents).style("fill",function(d){return C(d.state)});

}

function resetparameters(){
	slider[0].click(def_vac);
	slider[1].click(def_alpha);
}

function runsim(){
	
	tick++;
	agents.forEach(function(agent){

	
		var x_new= (agent.x + agent.vx);
		var y_new= (agent.y + agent.vy);
		
		// this takes care of the boundaries
		
		if (x_new < 0 || x_new > L) agent.vx *= -1;
		if (y_new < 0 || y_new > L) agent.vy *= -1;

		agent.theta=  Math.atan2(agent.vy,agent.vx);
	
		agent.x += agent.vx;
		agent.y += agent.vy;
		agent.theta = agent.theta + (Math.random() -  0.5) * wiggle;
		agent.vx=speed*Math.cos(agent.theta),
		agent.vy=speed*Math.sin(agent.theta)
		
	})
	
	agents.forEach(function(agent){
		var colliders = agents.filter(function(other){return coll(agent,other,R) && agent.id!=other.id });

		colliders.forEach(function(b){
			//if(b.state=="I" && agent.state=="S" && Math.random()<alpha.value) {agent.state="I"}	
			if(b.state=="S" && agent.state=="I" && Math.random()<alpha_scale(alpha.value)) {b.state="I"}
		})	
	})
	
	agents.forEach(function(agent){
		if(Math.random()<beta && agent.state!="S") {Math.random()<vac.value ? agent.state="V" : agent.state="S"} 
	})
	
	
	node.data(agents).attr("transform",function(d){return "translate("+X(d.x)+","+Y(d.y)+")"});	
	men.data(agents).style("fill",function(d){return C(d.state)});
	
	NI=agents.filter(function(d){return d.state=="I"}).length;
	NS=agents.filter(function(d){return d.state=="S"}).length;
	NV=agents.filter(function(d){return d.state=="V"}).length;
	
}	
	
function coll(a,b,r){
	return (a.x-b.x)*(a.x-b.x)+(a.y-b.y)*(a.y-b.y)<4*r*r ? true : false
}




return {
	name:"Well Mixed Model 1",
	setup:setup,
	runsim:runsim,
	resetsystem:resetsystem,
	resetparameters:resetparameters,
	stop:function(){}
}

}

function model_static_network(){

		
var L = 2*world_width,
	k0 = 80,
	personscale=0.045,
	r0 = 1,
	r1 = 1,
	N=300,
	I0=20/N;

var beta=0.015;
	

var	S = d3.scaleLinear().range([r0*personscale,r1*personscale]),
	alpha_scale = d3.scaleLinear().domain([0,1]).range([0, 0.010])
var agents = [],
	links = [],
	node = [],
	men = [];
	
var origin;
	
var simulation;	
	
function setup() { 
	
	clearDisplay();
	links = [];
	node = [];
	men = [];
	
	agents = d3.range(N).map(function(i){
		var state = i > (1-I0)*N ? "I" : "S"
		return {
				id:i,
				x:L*Math.random()-L/2,
				y:L*Math.random()-L/2,
				state: state
		}
	})
	
	agents.forEach(function(a){

		var r = poisson(k0);
		a.neighbors = agents.filter(function(b){return dist(a,b)<r && a.id!=b.id});
		a.neighbors.forEach(function(b){
			links.push({source:a, target:b})
			links.push({source:b, target:a})
		})
		
	})
	
	compute_degree(agents);
	S.domain(d3.extent(agents,function(d){return d.k}))
	
	simulation = d3.forceSimulation(agents)
    .force("charge", d3.forceManyBody().strength(-15))
    .force("link", d3.forceLink(links).distance(20).strength(.4))
    .alphaDecay(0.05)
	.alphaMin(0.2)
    .force("x", d3.forceX().strength(0.1))
    .force("y", d3.forceY().strength(0.1))
    .on("tick", ticked)




NI=agents.filter(function(d){return d.state=="I"}).length;
NS=agents.filter(function(d){return d.state=="S"}).length;
NV=agents.filter(function(d){return d.state=="V"}).length;

origin = display.append("g").attr("transform","translate("+world_width/2+","+world_height/2+")");		


link = origin.selectAll(".horst").data(links).enter().append("line").attr("class","horst")
	.attr("x1",function(d){return d.source.x})
	.attr("y1",function(d){return d.source.y})
	.attr("x2",function(d){return d.target.x})
	.attr("y2",function(d){return d.target.y})
	.style("stroke","rgb(120,120,120)")
	.style("stroke-width",0.5)
	

node = origin.selectAll(".agent").data(agents).enter().append("g").attr("class","agent")
	.attr("transform",function(d){return "translate("+d.x+","+d.y+")"})
	
men = node.append("path").attr("class","man")
	.attr("d",man)
	.attr("transform",function(d){return "translate(-5.5,-12)scale("+S(d.k)+")"})
	.style("stroke-width",""+0.5/personscale+"px")
	.style("stroke","black")
	.style("fill",function(d){return C(d.state)})
	
}

function resetsystem(){
	
	links = [];

	agents = d3.range(N).map(function(i){
		var state = i > (1-I0)*N ? "I"  : "S"
		return {
				id:i,
				x:L*Math.random()-L/2,
				y:L*Math.random()-L/2,
				state: state
		}
	})
	
	agents.forEach(function(a){

		var r = poisson(k0);
		a.neighbors = agents.filter(function(b){return dist(a,b)<r && a.id!=b.id});
		a.neighbors.forEach(function(b){
			links.push({source:a, target:b})
			links.push({source:b, target:a})
		})
		
	})
	
	compute_degree(agents);
	S.domain(d3.extent(agents,function(d){return d.k}))
	
	simulation = d3.forceSimulation(agents)
    .force("charge", d3.forceManyBody().strength(-15))
    .force("link", d3.forceLink(links).distance(20).strength(.4))
    .alphaDecay(0.05)
	.alphaMin(0.2)
    .force("x", d3.forceX().strength(0.1))
    .force("y", d3.forceY().strength(0.1))
    .on("tick", ticked)


NI=agents.filter(function(d){return d.state=="I"}).length;
NS=agents.filter(function(d){return d.state=="S"}).length;
NV=agents.filter(function(d){return d.state=="V"}).length;

link.remove();

link = origin.selectAll(".horst").data(links).enter().insert("line",".agent").attr("class","horst")
	.attr("x1",function(d){return d.source.x})
	.attr("y1",function(d){return d.source.y})
	.attr("x2",function(d){return d.target.x})
	.attr("y2",function(d){return d.target.y})
	.style("stroke","rgb(120,120,120)")
	.style("stroke-width",0.5)



node = origin.selectAll(".agent").data(agents).attr("class","agent")
	.attr("transform",function(d){return "translate("+d.x+","+d.y+")"})
	
men.data(agents)
	.attr("transform",function(d){return "translate(-5.5,-12)scale("+S(d.k)+")"})
	.style("fill",function(d){return C(d.state)})
	

}

function resetparameters(){
	slider[0].click(def_vac);
	slider[1].click(def_alpha);
}

function runsim(){
	
	tick++;
	
	agents.forEach(function(agent){
		
		agent.neighbors.forEach(function(b){
			if(b.state=="S" && agent.state=="I" && Math.random()<alpha_scale(alpha.value)) {b.state="I"}
		})	
	})
	
	agents.forEach(function(agent){
		if(Math.random()<beta) { Math.random() < vac.value ? agent.state="V": agent.state="S"}
		
	})
	
	
	
	men.data(agents).style("fill",function(d){return C(d.state)});
	
	NI=agents.filter(function(d){return d.state=="I"}).length;
	NS=agents.filter(function(d){return d.state=="S"}).length;
	NV=agents.filter(function(d){return d.state=="V"}).length;
}	


function poisson(mean){

	var L = Math.exp(-mean);
	var p = 1.0;
	var k = 0;

	do {
	    k++;
	    p *= Math.random();
	} while (p > L);

	return (k - 1);
}


function ticked() {
  link
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  node
	.attr("transform",function(d) { return "translate("+d.x+","+d.y+")"})
}

function stopit(){
	simulation.stop();
}

return {
	name:"Static Network Model",
	setup:setup,
	runsim:runsim,
	resetsystem:resetsystem,
	resetparameters:resetparameters,
	stop:stopit
}



}

function model_spatial(){

var C = d3.scaleOrdinal().domain(["I","S","V"]).range(["red","white","black"]);
var N = 50;
I0=0.1;

var X = d3.scaleLinear().domain([-N,N]).range([-world_width/2,world_width/2]);
var Y = d3.scaleLinear().domain([-N,N]).range([-world_height/2,world_height/2]);
var cell = d3.line().x(function(d) { return X(d.x); }).y(function(d) { return Y(d.y);; });
		

var beta=0.1;
	
var alpha_scale = d3.scaleLinear().domain([0,1]).range([0, 0.1])
	
var origin;

var G = lattice.square(N).scale(1).boundary("dirichlet");
var agents = G.nodes;

function setup(){

clearDisplay();		

var rix=d3.shuffle(d3.range(agents.length));

agents.forEach(function(agent,i){
	agent.id = rix[i];
	agent.state = agent.id > (1-I0)*agents.length ? "I" : "S"
})

origin = display.append("g").attr("transform","translate("+world_width/2+","+world_height/2+")");		

origin.selectAll(".cell").data(agents).enter().append("path")
	.attr("class","cell")
	.attr("d",function(d){
		return cell(G.cell(d))
	})
	.style("stroke","none")	
	.style("fill",function(d){return C(d.state)})
	


NI=agents.filter(function(d){return d.state=="I"}).length;
NS=agents.filter(function(d){return d.state=="S"}).length;
NV=agents.filter(function(d){return d.state=="V"}).length;

	
}

function resetsystem(){

var rix=d3.shuffle(d3.range(agents.length));
	
agents.forEach(function(agent,i){
		agent.id = rix[i];
		agent.state = agent.id > (1-I0)*agents.length ? "I" : "S"
})

origin.selectAll(".cell").data(agents)
	.style("fill",function(d){return C(d.state)})
	


NI=agents.filter(function(d){return d.state=="I"}).length;
NS=agents.filter(function(d){return d.state=="S"}).length;
NV=agents.filter(function(d){return d.state=="V"}).length;


	

}

function resetparameters(){
	slider[0].click(def_vac);
	slider[1].click(def_alpha);
}

function runsim(){
	
	tick++;
	
	agents.forEach(function(agent){
		
		agent.neighbors.forEach(function(b){
			if(b.state=="S" && agent.state=="I" && Math.random()<alpha_scale(alpha.value)) {b.state="I"}
		})	
	})
	
	agents.forEach(function(agent){
		if(Math.random()<beta) { Math.random() < vac.value ? agent.state="V": agent.state="S"}
		
	})
	
	origin.selectAll(".cell").data(agents)
	.style("fill",function(d){return C(d.state)})
	
	NI=agents.filter(function(d){return d.state=="I"}).length;
	NS=agents.filter(function(d){return d.state=="S"}).length;
	NV=agents.filter(function(d){return d.state=="V"}).length;
}	


return {
	name:"Spatial Model",
	setup:setup,
	runsim:runsim,
	resetsystem:resetsystem,
	resetparameters:resetparameters,
	stop:function(){}
}



}

function model_dynamic_network(){

		
var L = 2*world_width,
	k0 = 3,
	personscale=0.035,
	Q = 0.9,
	w = 0.3,
	r0 = 1,
	r1 = 1,
	N=100,
	I0=10/N;

var P = k0/(N-1);
var beta=0.015;
	

var	S = d3.scaleLinear().range([r0*personscale,r1*personscale]),
	alpha_scale = d3.scaleLinear().domain([0,1]).range([0, 0.05])
var agents = [],
	links = [],
	node = [],
	men = [];
	
var origin;
	
var simulation;	
	
function setup() { 
	
	clearDisplay();
	links = [];
	node = [];
	men = [];
	
	agents = d3.range(N).map(function(i){
		var state = i > (1-I0)*N ? "I" : "S"
		return {
				id:i,
				x:L*Math.random()-L/2,
				y:L*Math.random()-L/2,
				state: state,
				neighbors:[]
		}
	})
	
	agents.forEach(function(a,i){
		
		agents.forEach(function(b,j){
			
			if (Math.random()<P && j < i){
				a.neighbors.push(b);
				b.neighbors.push(a);
				links.push({source:a, target:b})
				links.push({source:b, target:a})
			}
		})
	})
	
	compute_degree(agents);
	S.domain(d3.extent(agents,function(d){return d.k}))
	
	simulation = d3.forceSimulation(agents)
    .force("charge", d3.forceManyBody().strength(-20))
    .force("link", d3.forceLink(links).distance(6).strength(0.5))
	.alphaMin(0.0)
    .force("x", d3.forceX().strength(0.2))
    .force("y", d3.forceY().strength(0.2))
    .on("tick", ticked)




NI=agents.filter(function(d){return d.state=="I"}).length;
NS=agents.filter(function(d){return d.state=="S"}).length;
NV=agents.filter(function(d){return d.state=="V"}).length;

origin = display.append("g").attr("transform","translate("+world_width/2+","+world_height/2+")");		


link = origin.selectAll(".horst").data(links, function(d) { return d.source.id + "-" + d.target.id; }).enter().append("line").attr("class","horst")
	.attr("x1",function(d){return d.source.x})
	.attr("y1",function(d){return d.source.y})
	.attr("x2",function(d){return d.target.x})
	.attr("y2",function(d){return d.target.y})
	.style("stroke","rgb(120,120,120)")
	.style("stroke-width",0.5)
	

node = origin.selectAll(".agent").data(agents).enter().append("g").attr("class","agent")
	.attr("transform",function(d){return "translate("+d.x+","+d.y+")"})
	
men = node.append("path").attr("class","man")
	.attr("d",man)
	.attr("transform",function(d){return "translate(-5.5,-12)scale("+S(d.k)+")"})
	.style("stroke-width",""+0.5/personscale+"px")
	.style("stroke","black")
	.style("fill",function(d){return C(d.state)})
	
}

function resetsystem(){
	
	links = [];
	node = [];
	men = [];
	
	agents = d3.range(N).map(function(i){
		var state = i > (1-I0)*N ? "I" : "S"
		return {
				id:i,
				x:L*Math.random()-L/2,
				y:L*Math.random()-L/2,
				state: state,
				neighbors:[]
		}
	})
	
	agents.forEach(function(a,i){
		
		agents.forEach(function(b,j){
			
			if (Math.random()<P && j < i){
				a.neighbors.push(b);
				b.neighbors.push(a);
				links.push({source:a, target:b})
				links.push({source:b, target:a})
			}
		})
	})
	
	compute_degree(agents);
	S.domain(d3.extent(agents,function(d){return d.k}))
	
	simulation = d3.forceSimulation(agents)
    .force("charge", d3.forceManyBody().strength(-20))
    .force("link", d3.forceLink(links).distance(10).strength(0.4))
	.alphaMin(0.0)
    .force("x", d3.forceX().strength(0.1))
    .force("y", d3.forceY().strength(0.1))
    .on("tick", ticked)




NI=agents.filter(function(d){return d.state=="I"}).length;
NS=agents.filter(function(d){return d.state=="S"}).length;
NV=agents.filter(function(d){return d.state=="V"}).length;

link.remove();

link = origin.selectAll(".horst").data(links, function(d) { return d.source.id + "-" + d.target.id; }).enter().insert("line",".agent").attr("class","horst")
	.attr("x1",function(d){return d.source.x})
	.attr("y1",function(d){return d.source.y})
	.attr("x2",function(d){return d.target.x})
	.attr("y2",function(d){return d.target.y})
	.style("stroke","rgb(120,120,120)")
	.style("stroke-width",0.5)
	

node = origin.selectAll(".agent").data(agents)
	.attr("transform",function(d){return "translate("+d.x+","+d.y+")"})
	
men = node.append("path").attr("class","man")
	.attr("d",man)
	.attr("transform",function(d){return "translate(-5.5,-12)scale("+S(d.k)+")"})
	.style("stroke-width",""+0.5/personscale+"px")
	.style("stroke","black")
	.style("fill",function(d){return C(d.state)})
	
}

function resetparameters(){
	slider[0].click(def_vac);
	slider[1].click(def_alpha);
}

function runsim(){
	
	tick++;
	if(Math.random()<w){
	var a = agents[Math.floor(Math.random() * N)]
	var b = agents[Math.floor(Math.random() * N)]
	if (a!=b){
		a.neighbors.forEach(function(n){
			n.neighbors = n.neighbors.filter(function(x){return x!=a})
			
			links = links.filter(function(l){
				return !(l.source == a && l.target == n) 
			})
			links = links.filter(function(l){
				return !(l.source == n && l.target == a) 
			})			
		});
		
		a.neighbors = [];
		
		
		b.neighbors.forEach(function(n){
			if(Math.random()<.5){
				a.neighbors.push(n);
				n.neighbors.push(a);
				links.push({source:a,target:n})
				links.push({source:n,target:a})
			}
		})
		a.neighbors.push(b);
		b.neighbors.push(a);
		links.push({source:a,target:b})
		links.push({source:b,target:a})
	}
	}
	agents.forEach(function(agent){
		
		agent.neighbors.forEach(function(b){
			if(b.state=="S" && agent.state=="I" && Math.random()<alpha_scale(alpha.value)) {b.state="I"}
		})	
	})
	
	agents.forEach(function(agent){
		if(Math.random()<beta) { Math.random() < vac.value ? agent.state="V": agent.state="S"}
		
	})
	
	simulation.nodes(agents);

	simulation.force("link", d3.forceLink(links).distance(10).strength(.4))
	
	simulation.alpha(0.2).restart();
	
	
	link = link.data(links, function(d) { return d.source.id + "-" + d.target.id; });
	link.exit().remove();
	link = link.enter().insert("line",".agent").merge(link)
	.style("stroke","rgb(120,120,120)")
	.style("stroke-width",0.5)
	

	
	men.data(agents).style("fill",function(d){return C(d.state)});
	
	NI=agents.filter(function(d){return d.state=="I"}).length;
	NS=agents.filter(function(d){return d.state=="S"}).length;
	NV=agents.filter(function(d){return d.state=="V"}).length;
}	


function poisson(mean){

	var L = Math.exp(-mean);
	var p = 1.0;
	var k = 0;

	do {
	    k++;
	    p *= Math.random();
	} while (p > L);

	return (k - 1);
}


function ticked() {
  link
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  node
	.attr("transform",function(d) { return "translate("+d.x+","+d.y+")"})
}

function stopit(){
	simulation.stop();
}
return {
	name:"Static Network Model",
	setup:setup,
	runsim:runsim,
	resetsystem:resetsystem,
	resetparameters:resetparameters,
	stop:stopit
}



}

/////////////////
////////////////

function compute_degree(nodes){
	
	nodes.forEach(function(n){
		n.k = n.neighbors.length;
	})
}



function man(){
return "M53.5,476c0,14,6.833,21,20.5,21s20.5-7,20.5-21V287h21v189c0,14,6.834,21,20.5,21c13.667,0,20.5-7,20.5-21V154h10v116c0,7.334,2.5,12.667,7.5,16s10.167,3.333,15.5,0s8-8.667,8-16V145c0-13.334-4.5-23.667-13.5-31   s-21.5-11-37.5-11h-82c-15.333,0-27.833,3.333-37.5,10s-14.5,17-14.5,31v133c0,6,2.667,10.333,8,13s10.5,2.667,15.5,0s7.5-7,7.5-13   V154h10V476M61.5,42.5c0,11.667,4.167,21.667,12.5,30S92.333,85,104,85s21.667-4.167,30-12.5S146.5,54,146.5,42   c0-11.335-4.167-21.168-12.5-29.5C125.667,4.167,115.667,0,104,0S82.333,4.167,74,12.5S61.5,30.833,61.5,42.5z" 
	
}

function dist(a,b){
	return Math.sqrt((a.x-b.x)*(a.x-b.x)+(a.y-b.y)*(a.y-b.y))
}

})()