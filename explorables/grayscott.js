//(function(){

var world_width = 280,
	world_height = 280,
	controlbox_width = 280,
	controlbox_height = 100,
	n_grid_x = 24,
	n_grid_y = 6;
	
var world = d3.selectAll("#grayscott_display").append("canvas")
	.attr("width",world_width)
	.attr("height",world_height)
	.attr("class","explorable_display")
	
var context = world.node().getContext("2d");
			context.translate(world_width/2, world_height/2);		
	
var controls = d3.selectAll("#grayscott_controls").append("svg")
	.attr("width",controlbox_width)
	.attr("height",controlbox_height)
	.attr("class","explorable_widgets")	
	
var g = widget.grid(controlbox_width,controlbox_height,n_grid_x,n_grid_y);



var anchors = g.lattice(); // g has a method that returns a lattice with x,y coordinates

/*controls.selectAll(".grid").data(anchors).enter().append("circle")
	.attr("class","grid")
	.attr("transform",function(d){return "translate("+d.x+","+d.y+")"})
	.attr("r",1)
	.style("fill","rgb(200,200,200)")
	.style("stroke","none")*/


// fixed parameters 


// this are the default values for the slider variables

var N = 70,
	dt=.5;
	
var pixel_width = world_width / N;
var pixel_height = world_height / N;	

var def_q =0,
	def_s = 0.06;

var D = 0.08;

var Fk = sq2fk(def_s,def_q);

var C_U = d3.interpolateRdGy;
var C_V = d3.interpolateRdGy;
	
var parsets = [
	{q:0.00020399999999999845,s:0.06,name:"Keith Haring"},
	{q:-0.004620000000000003,s:0.03629500000000001,name:"Cell Division"},
	{q:-0.0037560000000000024,s:0.022903000000000003,name:"Dirk's Favorite"},
	{q:0.002003999999999999,s:0.013975000000000001,name:"Targets and Spirals"}
]	

var buttonblock = g.block({x0:6,y0:1.5,width:0,height:3}).Ny(2);
var radioblock = g.block({x0:12,y0:-0.75,width:9,height:6});

// here are the buttons


var playpause = { id:"gs_b1", name:"", actions: ["play","pause"], value: 0};
var back = { id:"gs_b2", name:"", actions: ["rewind"], value: 0};

butsize=45;
butssize = 28;

var buttons = [
	
	widget.button(back).update(function(){init1();draw()}).size(butsize).symbolSize(butssize),
	widget.button(playpause).update(runpause).size(butsize).symbolSize(butssize)
]

var name="grayscott"
explorable_states.push({name:"grayscott",state:false,ppbutton:buttons[1]})

// now the sliders for the fish

/*function sq2fk(s,q){
	return {k:0.5*Math.sqrt(s)-s+q,F:s}
}*/

function sq2fk(s,q){
	let n = Math.sqrt(1+(0.25/Math.sqrt(s)-1)*(0.25/Math.sqrt(s)-1))
	return {F:s+q*(0.25/Math.sqrt(s)-1)/n,k:Math.sqrt(s)/2-s-q/n}
}

var s = {id:"s", name: "tangent", range: [0.007,0.1], value: def_s};
var q = {id:"q", name: "normal", range: [0.006,-0.006], value: def_q};

// radios

var c1 = {
	id:"parsets", 
	name:"parsets", 
	choices: parsets.map(function(d){return d.name}), 
	value:0
}

var radios = [ widget.radio(c1).size(radioblock.h()).update(selectpattern)]



var bu = controls.selectAll(".button .others").data(buttons).enter().append(widget.buttonElement)
	.attr("transform",function(d,i){return "translate("+buttonblock.x(0)+","+buttonblock.y(i)+")"});	

var rad = controls.selectAll(".radio .sys").data(radios).enter().append(widget.radioElement)
	.attr("transform",function(d,i){return "translate("+radioblock.x(0)+","+radioblock.y(0)+")"});	

		
	


var Frange = [0.00,0.1];	
var krange = [0.03,0.08];


var ka = d3.range(krange[0],krange[1],(krange[1]-krange[0])/100);
var Fa = d3.range(Frange[0],Frange[1],(Frange[1]-Frange[0])/100);



function setpar(){
	let q = parsets[c1.value].q
	let s = parsets[c1.value].s
	Fk=sq2fk(s,q);	
	
}

function selectpattern(d){

	let p = parsets[d.value()]
	setpar()
	init1()
	draw()
}

var X = d3.scaleLinear().domain([-N,N]).range([-world_width/2,world_width/2]);
var Y = d3.scaleLinear().domain([-N,N]).range([-world_width/2,world_width/2]);
var color = d3.scaleLinear().domain([0,1]).range([0,1]);

var cell = d3.line().x(function(d) { return X(d.x); }).y(function(d) { return Y(d.y);; });

var G = lattice.square4(N).scale(1).boundary("periodic");
var nodes = G.nodes;

nodes.forEach(function(d){ d.u=0; d.v=0; })

init1()



// timer variable for the simulation

var t,tick=0; 
var updates_per_frame = 10;

// functions for the action buttons

function wurst() {
            for(let step=0; step<updates_per_frame; step++)
            {
                update();
            }
            draw();
            }



	function runpause(d){ 
		if (d.value == 1) {
			explorable_states.forEach(function(d){
				if (d.state==true) {
					d.ppbutton.click()
					d.state=false
				}
			})
			t = d3.interval(wurst,0)
			explorable_states.filter(function(d){return d.name==name})[0].state=true

		} else {
			t.stop()
			explorable_states.filter(function(d){return d.name==name})[0].state=false
		}
	 }


function resetparameters(){
	let q = parsets[c1.value].q
	let s = parsets[c1.value].s
}


/// THIS IS THE INITIAL SETUP



function init1(){
	nodes.forEach(function(d){
		d.u=1;
		d.v=0;
	})
	
	let M = 40;
	let wmin=5;
	let wmax=20;

	let rects = d3.range(M).map(function(d){
		let x0 = wmax+Math.floor(Math.random()*(2*N+1-2*wmax)+0.5);
		let y0 = wmax+Math.floor(Math.random()*(2*N+1-2*wmax)+0.5);
		return {
			x0:x0,
			y0:y0,
			x1:x0+wmin+Math.floor((wmax-wmin)*Math.random()+0.5),		
			y1:y0+wmin+Math.floor((wmax-wmin)*Math.random()+0.5)
		}
	})
	
	rects.forEach(function(R){
		let u = Math.random();
		let v = Math.random();
		nodes.filter(function(z){
			return (z.m > R.x0 && z.m < R.x1 && z.n > R.y0 && z.n < R.y1)
		}).forEach(function(x){x.u = u; x.v=v})
		
	})
	
update()
draw()
update()
draw()
update()
draw()
}



/// HERE'S THE LOCAL DYNAMICS OF GRAY-SCOTT


function f(x){
		var z = x[0]*x[1]*x[1];
		return [ - z + Fk.F * (1-x[0]), z - (Fk.F+Fk.k)*x[1] ]		
}


// THIS IS THE ITERATION THAT TAKES TIME


function update(){
	nodes.forEach(function(d){
		let dx = f([d.u,d.v])
		d.du = dt*dx[0] + 
			2 * D * dt * ( -d.neighbors.length*d.u + d3.sum(d.neighbors,function(x){return x.u}));
		d.dv = dt*dx[1] + 
			D * dt * ( -d.neighbors.length*d.v + d3.sum(d.neighbors,function(x){return x.v})); 			
	})	
	nodes.forEach(function(d){
		d.u += d.du; d.v += d.dv;
	})
}

function draw(){
 draw_U() ;
}

function draw_U(){
	
	nodes.forEach(function(d){
		context.fillStyle=C_U(d.u);
		context.fillRect(X(d.x), Y(d.y), pixel_width/2, pixel_width/2);
	})
		
}



//})()