(function(){

var world_width = 280,
	world_height = 280,
	controlbox_width = 280,
	controlbox_height = 130,
	n_grid_x = 12,
	n_grid_y = 8;
	

// fixed parameters 
	
var g = widget.grid(controlbox_width,controlbox_height,n_grid_x,n_grid_y);	

		var t;
		
var N = 200, // # of agents
	L = 128, // world size
	agentsize = 3.5,
	dt = 1, 
	noise_speed = 0.25, //variation in individuals' speeds
	epsilon = 0.2; // angular increment

// this are the default values for the slider variables

var def_speed = 0.64, 
	def_noise_heading = 15,
	def_R_coll = 1,
	def_R_align = 5,
	def_R_attract = 15,
	def_blindspot = 120;

// parameter objects for the sliders
	
var speed = {id:"fl_speed", name: "Speed", range: [0,1], value: def_speed};
var noise_heading = {id:"fl_noise_heading", name: "Wiggle", range: [0,30], value: def_noise_heading};
var R_coll = {id:"fl_rcoll", name: "Collision Radius", range: [0,2], value: def_R_coll};
var R_align = {id:"fl_ralign", name: "Alignment Radius", range: [0,10], value: def_R_align};
var R_attract = {id:"fl_rattract", name: "Attraction Radius", range: [0,20], value: def_R_attract};
var blindspot = {id:"fl_blindspot", name: "Blind Spot", range: [1,360], value: def_blindspot};

// action parameters for the buttons

var playpause = { id:"fl_b1", name:"", actions: ["play","pause"], value: 0};
var back = { id:"fl_b2", name:"", actions: ["back"], value: 0};
var reload = { id:"fl_b3", name:"", actions: ["rewind"], value: 0};

// widget.block helps distributing widgets in neat arrays


var playblock = g.block({x0:1,y0:1.5,width:0,height:5}).Ny(3);
var sliderblock = g.block({x0:3,y0:1,width:8,height:5}).Ny(3);


// slider objects

var handleSize = 12, trackSize = 8;
var slider_width = sliderblock.w();

var sliders = [
	widget.slider(speed).width(slider_width).trackSize(trackSize).handleSize(handleSize),
	widget.slider(R_align).width(slider_width).trackSize(trackSize).handleSize(handleSize),
	widget.slider(R_attract).width(slider_width).trackSize(trackSize).handleSize(handleSize),
]

// button objects

butsize=35;
butssize = 20;

var buttons = [
widget.button(reload).update(resetparameters).size(butsize).symbolSize(butssize),
widget.button(back).update(resetpositions).size(butsize).symbolSize(butssize),
widget.button(playpause).update(runpause).size(butsize).symbolSize(butssize)

]

var name="swarm"
explorable_states.push({name:"swarm",state:false,ppbutton:buttons[2]})


// position scales
var X = d3.scaleLinear().domain([0,L]).range([0,world_width]);
var Y = d3.scaleLinear().domain([0,L]).range([world_height,0]);

// helps translate degrees and radian

var g2r = d3.scaleLinear().domain([0,360]).range([0,2*Math.PI]);
var r2g = d3.scaleLinear().range([0,360]).domain([0,2*Math.PI]);

/////////////////////////
// this is the agent data	
/////////////////////////
	
var agents = d3.range(N).map(function(d,i){
	return {id:i, 
			x: Math.random() * L, 
			y: Math.random() * L, 
			theta: Math.random() * 360,
			speed_var:(1+Math.random()*noise_speed),
			selected: false}
})

// this is the box for the simulation

var world = d3.selectAll("#flocking_display").append("svg")
	.attr("width",world_width)
	.attr("height",world_height)
	.attr("class","explorable_display")

// this is the svg for the widgets
	
var controls = d3.selectAll("#flocking_controls").append("svg")
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


pb = controls.selectAll(".button").data(buttons).enter().append(widget.buttonElement)
	.attr("transform",function(d,i){return "translate("+playblock.x(0)+","+playblock.y(i)+")"});

sl = controls.selectAll(".slider").data(sliders).enter().append(widget.sliderElement)
	.attr("transform",function(d,i){return "translate("+sliderblock.x(0)+","+sliderblock.y(i)+")"});	


/*var slider = controls.append("g").attr("id","sliders")
	.attr("transform","translate("+controlbox_margin.left+","+ controlbox_margin.top +")")

var button = controls.append("g")
	.attr("transform","translate("+button_x +","+ button_y +")")

// sliders, buttons and cartoon elements

slider.selectAll(".slider").data(sliders).enter().append(widget.sliderElement)
	.attr("transform",function(d,i){return "translate(0,"+sbl.x(i)+")"});
	
button.selectAll(".button").data(buttons).enter().append(widget.buttonElement)
	.attr("transform",function(d,i){return "translate("+(bbl.x(i) - button_width / 2)+",0)"});	*/


						
/////////////////////////////////////////
		
// add agents to the scene

agent = world.selectAll(".agent").data(agents).enter().append("g")
	.attr("class","agent")
	.attr("transform",function(d){
		return "translate("+X(d.x)+","+Y(d.y)+")rotate("+(-d.theta)+")"
	})
	
	
agent.append("path")
	.attr("class","drop")
	.attr("d",tadpole)
	.style("opacity",0)
	.transition().duration(1000).style("opacity",1)

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


function resetpositions(){
	
	if (typeof(t) === "object") {t.stop()};
	
	agents.forEach(function(d){
		d.x = Math.random() * L;
		d.y = Math.random() * L;
		d.theta = Math.random() * 360;
	})

	d3.selectAll(".agent").transition().duration(1000).attr("transform",function(d){
		return "translate("+X(d.x)+","+Y(d.y)+")rotate("+(-d.theta)+")"
	}).call(function(){
		if (typeof(t) === "object" && playpause.value == 1 ) {t = d3.timer(runsim,0)}
	})
	
}

function resetparameters(){
	speed.value = def_speed;
	noise_heading.value = def_noise_heading;
	R_coll.value = def_R_coll;
	R_align.value = def_R_align;
	R_attract.value = def_R_attract;
	blindspot.value = def_blindspot;
	d3.selectAll(".slider").select(".handle").transition().attr("cx", function(d){ return d.X(d.value())})
	
}


function runsim(){

	var wanted_x, // this is the target direction 
		wanted_y; // an agent wants to move to		
	
	var blind = Math.cos(( 180 - blindspot.value / 2 )/180*Math.PI);
	
	agents.forEach(function(a){

		// these are the agents in the collision radius apart from the reference agent
		var colliders = [];
		colliders = agents.filter(function(d){
			dx = (a.x-d.x);
			dy = (a.y-d.y);
			return ( Math.sqrt(dx*dx + dy*dy)  < R_coll.value ) && ( d.id != a.id )
		})
		// either collisions occur or alignment and attraction occur
		
		if(colliders.length>0) {
			wanted_x = a.x - d3.mean(colliders,function(d){ return d.x});
			wanted_y = a.y - d3.mean(colliders,function(d){ return d.y});
		} 
		
		// if no collisions occur agents align with agents in their alignment radius
		// and are attracted to the the agents in the attraction radius
		
		else {
			vx = Math.cos(g2r(a.theta));
			vy = Math.sin(g2r(a.theta));
			vabs = Math.sqrt(vx*vx + vy*vy);

			// the interaction set are all agents within the larger attraction radius
			// and outside the blind spot
			
			interaction_set = agents.filter(function(d){
					dx = d.x-a.x;
					dy = d.y-a.y;
					d.r = Math.sqrt(dx*dx+dy*dy);
					sight = (dx*vx + dy*vy) / (vabs * d.r);
					return ( d.r < R_attract.value ) &&  (sight > blind) && d.id!=a.id
			})
			
			// now we separate them into the agents to align with and those to be attracted to
			
			var n_orient = interaction_set.filter(function(d){ return d.r < R_align.value })
			var n_attract = interaction_set.filter(function(d){ return d.r > R_align.value })
			
			var theta_orient = a.theta,
				theta_attract = a.theta;

			var L_orient = n_orient.length;
			var L_attract = n_attract.length;

			if (L_orient > 0){
					var mx = d3.mean(n_orient,function(x){ return Math.cos(g2r(x.theta))})
					var my = d3.mean(n_orient,function(x){ return Math.sin(g2r(x.theta))})
					theta_orient = r2g(Math.atan2(my,mx));
			}
			
			if (L_attract > 0){
					var mx = d3.mean(n_attract,function(d){ return d.x});
					var my = d3.mean(n_attract,function(d){ return d.y});
					theta_attract = r2g(Math.atan2(my-a.y,mx-a.x));
			} 
			
			// this is the anticipated direction
			
			wanted_x = 0.5*( Math.cos(g2r(theta_orient)) + Math.cos(g2r(theta_attract)))
			wanted_y = 0.5*( Math.sin(g2r(theta_orient)) + Math.sin(g2r(theta_attract)))
		}
		
		// this is the update rule, epsilon is the amount of change towards the target direction	
		
		var new_x = Math.cos(g2r(a.theta)) +  epsilon * wanted_x;
		var new_y = Math.sin(g2r(a.theta)) +  epsilon * wanted_y;
		a.theta=  r2g(Math.atan2(new_y,new_x));
	})
	
	// wiggle: add a little noise to the angle
	
	agents.forEach(function(d){
		d.theta = d.theta + (Math.random() -  0.5) * noise_heading.value;
	})
		
	// make a step
	
	agents.forEach(function(d){
		var v = speed.value;
		var phi = g2r(d.theta);
		var dx =  dt * v*d.speed_var * Math.cos(phi);
		var dy =  dt * v*d.speed_var * Math.sin(phi);
	
		var x_new= (d.x + dx);
		var y_new= (d.y + dy);
		
		// this takes care of the boundaries
		
		if (x_new < 0 || x_new > L) dx *= -1;
		if (y_new < 0 || y_new > L) dy *= -1;

		d.x= (d.x + dx)
		d.y= (d.y + dy)
		d.theta = r2g(Math.atan2(dy,dx))	
	})
	
	// update stuff on screen

	agent.data(agents)
		.attr("transform",function(d){
				return "translate("+X(d.x)+","+Y(d.y)+")rotate("+(-d.theta)+")"
		})		
}		

	
/////////////////////////////////////////	

// this is the shape of the agent as a path
	
function tadpole () {
	var M = 30;
	var line = d3.line().x(function(d) { return agentsize*d.x; }).y(function(d) { return agentsize*d.y; });	
	var drop = d3.range(M).map(function(d,i){
			return { 
				x: -2 * Math.cos(i/M*Math.PI*2), 
				y:      Math.sin(i/M*Math.PI*2) * Math.pow( Math.sin(i/M/2*Math.PI*2) , 6 )
			};
		})
	return line(drop);
}	

// this updates the cartoon figure
		
// this is for drawing the scope segments, the circular area of vision
	
function scope(r,theta){
	var x0 =  r*Math.cos(theta/360*2*Math.PI);
	var y0 = -r*Math.sin(theta/360*2*Math.PI);
	var x1 =  -x0;
	var y1 = y0;
	var donkey = theta < 180 ? 0 : 1;
	return "M 0,0 L " +x0+","+y0+" A "+r+" "+r+" 0 "+donkey+" 1 "+x1+","+y1+ "L 0,0" 
}	

})()