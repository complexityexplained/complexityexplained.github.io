(function(){


var world_width = 280,
	world_height = 280,
	controlbox_width = 280,
	controlbox_height = 80,
	n_grid_x = 4,
	n_grid_y = 2;

var g = widget.grid(controlbox_width,controlbox_height,n_grid_x,n_grid_y);
	
// parameter objects for the sliders


//fixed parameters

	var t;
var def_theta1 = 3*Math.PI/4;
var def_theta2 = 3*Math.PI/4;
var def_p1 = 0;
var def_p2 = 0;
var fade = 5000;
var bar_border = 2;
var bar_thickness = 9;

	
var theta1 = {id:"dp_theta1", name: "angle 1", range: [-Math.PI+2e-3,Math.PI-2e-3], value: def_theta1};
var theta2 = {id:"dp_theta2", name: "angle 2", range: [-Math.PI,Math.PI], value: def_theta2};

var ghost = {id:"dp_t1", name: "ghost",  value: true};
var trace = {id:"dp_t2", name: "trace",  value: false};
var pendel = {id:"dp_t3", name: "hide pendulum",  value: false};
var trajectory = {id:"dp_t4", name: "show path on stop",  value: true};
var gravity = {id:"dp_timer5", name: "gravity",  value: true};

var buttons = [
	widget.button({ id:"dp_b1", name:"", actions: ["play","stop"], value: 0})
		.update(runpause).size(60).symbolSize(30),
	widget.button({ id:"dp_b2", name:"", actions: ["rewind"], value: 0})
		.update(reset).size(60).symbolSize(30)
	
]

var name="dp"
explorable_states.push({name:"dp",state:false,ppbutton:buttons[0]})


var playblock = g.block({x0:1,y0:1,width:2,height:1}).Nx(2);

var world = d3.selectAll("#double-pendulum_display").append("svg")
	.attr("width",world_width)
	.attr("height",world_height)
	.attr("class","explorable_display")
	
var controls = d3.selectAll("#double-pendulum_controls").append("svg")
	.attr("width",controlbox_width)
	.attr("height",controlbox_height)
	.attr("class","explorable_widgets")

pb = controls.selectAll(".button").data(buttons).enter().append(widget.buttonElement)
	.attr("transform",function(d,i){return "translate("+playblock.x(i)+","+playblock.y(0)+")"});	


/*controls.selectAll(".grid").data(g.lattice()).enter().append("circle")
	.attr("class","grid")
	.attr("transform",function(d){
		return "translate("+d.x+","+d.y+")"
	})
	.attr("r",1)
	.style("fill","black")
	.style("stroke","none")*/
	
	
//////////////////////////////////

var L = 0.95,
	M = 0.1,
	g = 9.81,
	dt = 0.0125;

var T = 0, y = [], z = [], f = doppelpendel(L,g);	

var X = d3.scaleLinear().range([-world_width / 2, world_width / 2]).domain([-2, 2]);
var Y = d3.scaleLinear().range([-world_width / 2, world_width / 2]).domain([2, -2]);
var line = d3.line().x(function(d) { return d.x; }).y(function(d) { return d.y; });
var hist = [] , ghist = [];

T = 0;

y[0] = def_theta1;
y[1] = def_theta2;
y[2] = def_p1;
y[3] = def_p2;

z[0] = def_theta1;
z[1] = def_theta2+1e-3;
z[2] = def_p1;
z[3] = def_p2;

hist.push({ 
	x:X( L * Math.cos(y[0]-Math.PI/2) + L * Math.cos(y[1]-Math.PI/2)),
	y:Y( L * Math.sin(y[0]-Math.PI/2) + L * Math.sin(y[1]-Math.PI/2))
})

ghist.push({ 
	x:X( L * Math.cos(z[0]-Math.PI/2) + L * Math.cos(z[1]-Math.PI/2)),
	y:Y( L * Math.sin(z[0]-Math.PI/2) + L * Math.sin(z[1]-Math.PI/2))
})



ghost_pendulum = world.append("g")
		.attr("id","ghost_pendulum")
		.attr("transform","translate("+world_width/2+","+(world_height/2)+")")
		.style("opacity",ghost.value ? null : 0)

pendulum = world.append("g")
		.attr("id","pendulum")
		.attr("transform","translate("+world_width/2+","+(world_height/2)+")")

ghost_pendulum.append("path").attr("d",line(ghist)).attr("class","trajectory-ghost");

ghost_pendulum.selectAll(".leg").data(legs(z[0],z[1])).enter().append("line")
			.attr("class", "leg")
			.attr("id",function(d,i){return "leg"+(2*i)})
			.attr("x1",function(d){return X(d.x1)})
			.attr("y1",function(d){return Y(d.y1)})
			.attr("x2",function(d){return X(d.x2)})
			.attr("y2",function(d){return Y(d.y2)})
			.style("stroke-width", bar_thickness+2*bar_border)

ghost_pendulum.selectAll(".leg-inset").data(legs(z[0],z[1])).enter().append("line")
			.attr("class", "leg-inset")
			.attr("id",function(d,i){return "leg"+(2*i+1)})
			.attr("x1",function(d){return X(d.x1)})
			.attr("y1",function(d){return Y(d.y1)})
			.attr("x2",function(d){return X(d.x2)})
			.attr("y2",function(d){return Y(d.y2)})
			.style("stroke-width", bar_thickness)
			

ghost_pendulum.select("#leg2").raise();
ghost_pendulum.select("#leg3").raise();

ghost_pendulum.selectAll(".joint").data(legs(z[0],z[1])).enter().append("circle")
			.attr("class", "joint")
			.attr("r",2)
			.attr("cx",function(d){return X(d.x1)})
			.attr("cy",function(d){return Y(d.y1)})
			.style("stroke","black").style("fill","black")

/////

pendulum.append("path").attr("d",line(hist)).attr("class","trajectory");

pendulum.selectAll(".leg").data(legs(y[0],y[1])).enter().append("line")
			.attr("class", "leg")
			.attr("id",function(d,i){return "leg"+(2*i)})
			.attr("x1",function(d){return X(d.x1)})
			.attr("y1",function(d){return Y(d.y1)})
			.attr("x2",function(d){return X(d.x2)})
			.attr("y2",function(d){return Y(d.y2)})
			.style("stroke-width", bar_thickness+2*bar_border)

pendulum.selectAll(".leg-inset").data(legs(y[0],y[1])).enter().append("line")
			.attr("class", "leg-inset")
			.attr("id",function(d,i){return "leg"+(2*i+1)})
			.attr("x1",function(d){return X(d.x1)})
			.attr("y1",function(d){return Y(d.y1)})
			.attr("x2",function(d){return X(d.x2)})
			.attr("y2",function(d){return Y(d.y2)})
			.style("stroke-width", bar_thickness)

pendulum.select("#leg2").raise();
pendulum.select("#leg3").raise();

pendulum.selectAll(".joint").data(legs(y[0],y[1])).enter().append("circle")
			.attr("class", "joint")
			.attr("r",2)
			.attr("cx",function(d){return X(d.x1)})
			.attr("cy",function(d){return Y(d.y1)})
			.style("stroke","black").style("fill","black")

function reset(){
	
	
	T = 0;
	y[0] = def_theta1;
	y[1] = def_theta2;
	y[2] = 0;
	y[3] = 0;
	z[0] = def_theta1+1e-3;
	z[1] = def_theta2;
	z[2] = 0;
	z[3] = 0;
		
	hist = [];
	ghist = [];
	
	d3.selectAll(".trace").transition().duration(400).style("opacity",0).remove();
	d3.selectAll(".trace-ghost").transition().duration(400).style("opacity",0).remove();
	pendulum.select(".trajectory")
		.attr("d",line(hist)).style("opacity",0).transition().duration(2000).style("opacity",trajectory.value ? 1:0)
		
	ghost_pendulum.select(".trajectory-ghost")
		.attr("d",line(ghist)).style("opacity",0).transition().duration(2000).style("opacity",trajectory.value ? 1:0)
		
	
	
	drawpendulum();
	pendulum.select(".trajectory").transition().duration(1000).style("opacity",0)
	ghost_pendulum.select(".trajectory-ghost").transition().duration(1000).style("opacity",0)
	
}

function showghost(){
	ghost_pendulum.transition().duration(1000).style("opacity",ghost.value ? null : 0)
}	

function hidependel(){
	pendulum.selectAll(".leg").transition().style("opacity",pendel.value ? 0 : null)
	pendulum.selectAll(".leg-inset").transition().style("opacity",pendel.value ? 0 : null)
	pendulum.selectAll(".joint").transition().style("opacity",pendel.value ? 0 : null)
	ghost_pendulum.selectAll(".leg").transition().style("opacity",pendel.value ? 0 : null)
	ghost_pendulum.selectAll(".leg-inset").transition().style("opacity",pendel.value ? 0 : null)
	ghost_pendulum.selectAll(".joint").transition().style("opacity",pendel.value ? 0 : null)

}

function drawpendulum(){	
	pendulum.selectAll(".leg").data(legs(y[0],y[1]))
			.attr("x1",function(d){return X(d.x1)})
			.attr("y1",function(d){return Y(d.y1)})
			.attr("x2",function(d){return X(d.x2)})
			.attr("y2",function(d){return Y(d.y2)})
	pendulum.selectAll(".leg-inset").data(legs(y[0],y[1]))
			.attr("x1",function(d){return X(d.x1)})
			.attr("y1",function(d){return Y(d.y1)})
			.attr("x2",function(d){return X(d.x2)})
			.attr("y2",function(d){return Y(d.y2)})
	pendulum.selectAll(".joint").data(legs(y[0],y[1]))
			.attr("cx",function(d){return X(d.x1)})
			.attr("cy",function(d){return Y(d.y1)})	
	ghost_pendulum.selectAll(".leg").data(legs(z[0],z[1]))
			.attr("x1",function(d){return X(d.x1)})
			.attr("y1",function(d){return Y(d.y1)})
			.attr("x2",function(d){return X(d.x2)})
			.attr("y2",function(d){return Y(d.y2)})
	ghost_pendulum.selectAll(".leg-inset").data(legs(z[0],z[1]))
			.attr("x1",function(d){return X(d.x1)})
			.attr("y1",function(d){return Y(d.y1)})
			.attr("x2",function(d){return X(d.x2)})
			.attr("y2",function(d){return Y(d.y2)})
	ghost_pendulum.selectAll(".joint").data(legs(z[0],z[1]))
			.attr("cx",function(d){return X(d.x1)})
			.attr("cy",function(d){return Y(d.y1)})			
}

function gravityswitch(){gravity.value ? g = 9.81 : g = 0;f = doppelpendel(L,g);}

function setangles(){
	T = 0;
	y[0] = theta1.value;
	y[1] = theta2.value;
	y[2] = 0;
	y[3] = 0;
	z[0] = theta1.value+1e-3;
	z[1] = theta2.value;
	z[2] = 0;
	z[3] = 0;
	drawpendulum();
	pendulum.select(".trajectory").transition().duration(1000).style("opacity",0)
	ghost_pendulum.select(".trajectory-ghost").transition().duration(1000).style("opacity",0)
}



function runpause(d){ 
	if (d.value==1){
			hist = [];
			ghist = [];
			hist.push({ 
				x:X( L * Math.cos(y[0]-Math.PI/2) + L * Math.cos(y[1]-Math.PI/2)),
				y:Y( L * Math.sin(y[0]-Math.PI/2) + L * Math.sin(y[1]-Math.PI/2))
			})
			ghist.push({ 
				x:X( L * Math.cos(z[0]-Math.PI/2) + L * Math.cos(z[1]-Math.PI/2)),
				y:Y( L * Math.sin(z[0]-Math.PI/2) + L * Math.sin(z[1]-Math.PI/2))
			})
			
			
											
			pendulum.select(".trajectory").transition().duration(500).style("opacity",0).transition().duration(500).style("opacity",null)
				.attr("d",line(hist))
			ghost_pendulum.select(".trajectory-ghost").transition().duration(500).style("opacity",0).transition().duration(500).style("opacity",null)
				.attr("d",line(ghist))
			explorable_states.forEach(function(d){
				if (d.state==true) {
					d.ppbutton.click()
					d.state=false
				}
			})
			t = d3.timer(runsim,0);
			explorable_states.filter(function(d){return d.name==name})[0].state=true
	
		
	} else {
		t.stop();
		
		explorable_states.filter(function(d){return d.name==name})[0].state=false
		theta1.value = y[0] > 0 ? (- Math.PI +(y[0]+Math.PI) % (2*Math.PI) ) : (Math.PI +(y[0]-Math.PI) % (2*Math.PI))
		theta2.value = y[1] > 0 ? (- Math.PI +(y[1]+Math.PI) % (2*Math.PI) ) : (Math.PI +(y[1]-Math.PI) % (2*Math.PI))
		
		
		pendulum.select(".trajectory")
			.attr("d",line(hist)).style("opacity",0).transition().duration(2000).style("opacity",trajectory.value ? 1:0)
		
		ghost_pendulum.select(".trajectory-ghost")
			.attr("d",line(ghist)).style("opacity",0).transition().duration(2000).style("opacity",trajectory.value ? 1:0)
		
		
		
	}

}




function legs(theta1,theta2){
	return [
		{	x1: 0,
			y1: 0,
			x2: L * Math.cos(theta1-Math.PI/2),
			y2: L * Math.sin(theta1-Math.PI/2),
		},
		{	x1:L * Math.cos(theta1-Math.PI/2),
			y1:L * Math.sin(theta1-Math.PI/2),
			x2:L * Math.cos(theta1-Math.PI/2) +  L * Math.cos(theta2-Math.PI/2),
			y2:L * Math.sin(theta1-Math.PI/2) + L * Math.sin(theta2-Math.PI/2)
		},
	]
}
	
function runsim(){
	

	var y0 = [], z0 = [];
	
	dy = rk(y,f,dt);
	dz = rk(z,f,dt);
		
	for(var i=0;i<4;i++){ 
		y0[i]=y[i]; y[i]=y[i]+dy[i];
		z0[i]=z[i]; z[i]=z[i]+dz[i];  
	}
	T+=dt;
	
	if (hist.length > 5000) {hist.shift()}
	if (ghist.length > 5000) {ghist.shift()}
	
	hist.push({ 
		x:X( L * Math.cos(y[0]-Math.PI/2) + L * Math.cos(y[1]-Math.PI/2)),
		y:Y( L * Math.sin(y[0]-Math.PI/2) + L * Math.sin(y[1]-Math.PI/2))
	})
	ghist.push({ 
		x:X( L * Math.cos(z[0]-Math.PI/2) + L * Math.cos(z[1]-Math.PI/2)),
		y:Y( L * Math.sin(z[0]-Math.PI/2) + L * Math.sin(z[1]-Math.PI/2))
	})
	
	
	drawpendulum();
	
	pendulum.append("line").attr("class","trace")
		.style("opacity",trace.value ? 1 : 0)
		.attr("x1",X( L * Math.cos(y0[0]-Math.PI/2) + L * Math.cos(y0[1]-Math.PI/2) ) )
		.attr("y1",Y( L * Math.sin(y0[0]-Math.PI/2) + L * Math.sin(y0[1]-Math.PI/2) ) )
		.attr("x2",X( L * Math.cos(y[0]-Math.PI/2) + L * Math.cos(y[1]-Math.PI/2) ) )
		.attr("y2",Y( L * Math.sin(y[0]-Math.PI/2) + L * Math.sin(y[1]-Math.PI/2) ) )
		.transition().duration(fade)
		.style("opacity",0).remove()
	
	ghost_pendulum.append("line").attr("class","trace-ghost")
		.style("opacity",trace.value ? 1 : 0)
		.attr("x1",X( L * Math.cos(z0[0]-Math.PI/2) + L * Math.cos(z0[1]-Math.PI/2) ) )
		.attr("y1",Y( L * Math.sin(z0[0]-Math.PI/2) + L * Math.sin(z0[1]-Math.PI/2) ) )
		.attr("x2",X( L * Math.cos(z[0]-Math.PI/2) + L * Math.cos(z[1]-Math.PI/2) ) )
		.attr("y2",Y( L * Math.sin(z[0]-Math.PI/2) + L * Math.sin(z[1]-Math.PI/2) ) )
		.transition().duration(fade)
		.style("opacity",0).remove()
	
	
}	

function doppelpendel(L,g){

	return function (x){
		var A= Math.cos(x[0]-x[1]);
		
		var f = [];
		f[0] =   (  x[2]-A*x[3]) / (2-A*A);
		f[1] =   (2*x[3]-A*x[2]) / (2-A*A);
		f[2] = - f[0]*f[1]*Math.sin(x[0]-x[1]) - 2*g/L*Math.sin(x[0]);
		f[3] =   f[0]*f[1]*Math.sin(x[0]-x[1]) -   g/L*Math.sin(x[1]);
		return f;
	}
}

function rk(y,f,dt){
	var k1 = f(y);
	var k2 = f ( y.map(function(yi,i){return yi + dt / 2 * k1[i] }) );
	var k3 = f ( y.map(function(yi,i){return yi + dt / 2 * k2[i] }) );
	var k4 = f ( y.map(function(yi,i){return yi + dt * k3[i] }) );
	return k1.map(function(ki,i){return dt / 6 * (ki+2*k2[i]+2*k3[i]+k4[i])})
}

function eu(y,f,dt){
	var k1 = f(y);
	return k1.map(function(ki,i){return dt * ki})
}

function energy(x){
	var T,U;
	var A = Math.cos(x[0]-x[1]);
	T = M*L*L / 2 * ( 2 * (x[2]-A*x[3])/(2-A*A)*(x[2]-A*x[3])/(2-A*A) + (2*x[3]-A*x[2]) / (2-A*A)*(2*x[3]-A*x[2]) / (2-A*A) + 2 * (  x[2]-A*x[3]) / (2-A*A) * (2*x[3]-A*x[2]) / (2-A*A) * A)
	U = - M * g * L * (2 * Math.cos(x[0]) + Math.cos(x[1]));
	return T + U;
}

	
})()