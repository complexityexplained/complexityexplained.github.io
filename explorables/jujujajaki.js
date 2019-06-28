(function(){

var world_width = 280,
	world_height = 280,
	controlbox_width = 280,
	controlbox_height = 80,
	n_grid_x = 12,
	n_grid_y = 2,
	margin = 10;
	

	
var display = d3.selectAll("#jujujajaki_display").append("svg")
	.attr("width",world_width)
	.attr("height",world_height)
	.attr("class","explorable_display")
	
var controls = d3.selectAll("#jujujajaki_controls").append("svg")
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
	
var N = 100,
	w0 = 1,
	rho = 1/100,
	L = 2*world_width;
	
	var t;

// this are the default values for the slider variables

var def_delta = 8,
	def_p_explore = 0.1;
	def_p_local = 0.5;
	def_p_death= 0.15;
	
var playblock = g.block({x0:3,y0:1,width:0,height:0});
var buttonblock = g.block({x0:3,y0:1,width:6,height:0}).Nx(2);
//var radioblock = g.block({x0:8,y0:3,width:0,height:3});
var sliderblock = g.block({x0:1,y0:2,width:10,height:5}).Ny(4);
	
// here are the buttons

var playpause = { id:"ju_b1", name:"", actions: ["play","pause"], value: 0};
var back = { id:"ju_b2", name:"", actions: ["rewind"], value: 0};

var buttons = [
	widget.button(playpause).update(runpause).size(60).symbolSize(30),
	widget.button(back).update(resetsystem).size(60).symbolSize(30)
]

var name="jujujajaki"
explorable_states.push({name:"jujujajaki",state:false,ppbutton:buttons[0]})

var delta = {id:"delta", name: "reinforcement increment", range: [0,10], value: def_delta};
var p_explore = {id:"p_explore", name: "exploration probability", range: [0,1], value: def_p_explore};
var p_local = {id:"p_local", name: "local search probability", range: [0,1], value: def_p_local};
var p_death = {id:"p_death", name: "isolation rate", range: [0,1], value: def_p_death};

var sliderwidth = sliderblock.w(),
	handleSize = 14, 
	trackSize = 10;

var slider = [
	widget.slider(p_death).width(sliderwidth).trackSize(trackSize).handleSize(handleSize),
	widget.slider(p_local).width(sliderwidth).trackSize(trackSize).handleSize(handleSize),
	widget.slider(p_explore).width(sliderwidth).trackSize(trackSize).handleSize(handleSize),
	widget.slider(delta).width(sliderwidth).trackSize(trackSize).handleSize(handleSize)	
]

// radios

//var c1 = {id:"c1", name:"Radio", choices: ["button 1","button 2", "button 3"], value:0}


/*var radios = [
	widget.radio(c1).size(radioblock.h()).label("right")
	.shape("circle").buttonSize(26).buttonInnerSize(18).fontSize(16)
]*/
	
// darkness parameters


var bu = controls.selectAll(".button .others").data(buttons).enter().append(widget.buttonElement)
	.attr("transform",function(d,i){return "translate("+buttonblock.x(i)+","+buttonblock.y(0)+")"});	

//var spsl = controls.selectAll(".slider").data(slider).enter().append(widget.sliderElement)
//	.attr("transform",function(d,i){return "translate("+sliderblock.x(0)+","+sliderblock.y(i)+")"});

/*var rad = controls.selectAll(".radio .input").data(radios).enter().append(widget.radioElement)
	.attr("transform",function(d,i){return "translate("+radioblock.x(0)+","+radioblock.y(0)+")"});	*/
		
/////////////////////////
// this is the agent data	
/////////////////////////

// timer variable for the simulation

var tick=0;

var origin = display.append("g")
	.attr("transform","translate("+world_width/2+","+world_height/2+")");
	

var	S = d3.scaleLinear().range([1,5]);
var lw = d3.scaleLinear().range([.5,4]);
var lc = d3.scaleLinear().range(["black","darkred"])
var nc = d3.scaleLinear().range(["rgb(250,250,250)","rgb(20,20,20)"])

var nodes = [],
	links = [];

var simulation;	


nodes = d3.range(N).map(function(i){
		return {
				id:i,
				x:L*Math.random()-L/2,
				y:L*Math.random()-L/2,
				neighbors:[]
		}
	})
	
nodes.forEach(function(a,i){
	nodes.forEach(function(b,j){
			
			if (Math.random()<rho && j < i){
				let w = 1;
				a.neighbors.push(b);
				b.neighbors.push(a);
				links.push({source:a, target:b, weight: w})
				links.push({source:b, target:a, weight: w})
			}
		})
	})
	
compute_degree();
compute_clustering();

S.domain(d3.extent(nodes,function(d){return d.k}))
nc.domain(d3.extent(nodes,function(d){return d.cc}))
lw.domain(d3.extent(links,function(d){return d.weight}))
lc.domain(d3.extent(links,function(d){return d.weight}))
	
var km = d3.mean(nodes,function(d){return d.k})

var link = origin.selectAll(".edge").data(links, function(d) { return d.source.id + "-" + d.target.id; }).enter().append("line").attr("class","edge")
	.attr("x1",function(d){return d.source.x})
	.attr("y1",function(d){return d.source.y})
	.attr("x2",function(d){return d.target.x})
	.attr("y2",function(d){return d.target.y})
	.style("stroke-width",function(d){return lw(d.weight)})
	.style("stroke",function(d){return lc(d.weight)})
	

var node = origin.selectAll(".node").data(nodes).enter().append("circle")
	.attr("class","node")
	.attr("cx",function(d){return d.x})
	.attr("cy",function(d){return d.y})
	.attr("r",function(d){return S(d.k)})
		.call(d3.drag()
    	.on("start", dragstarted)
    	.on("drag", dragged)
    	.on("end", dragended))
	.style("fill",function(d){return nc(d.cc)})


// functions for the action buttons
simulation = d3.forceSimulation(nodes)
    .force("charge", d3.forceManyBody().strength(-40))
    .force("link", d3.forceLink(links).distance(20).strength(0.4))
	.alphaMin(0.0)
    .force("x", d3.forceX().strength(0.2))
    .force("y", d3.forceY().strength(0.2))
    .on("tick", ticked)
	

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

	tick=0,nodes = [],links = [];


nodes = d3.range(N).map(function(i){
		return {
				id:i,
				x:L*Math.random()-L/2,
				y:L*Math.random()-L/2,
				neighbors:[]
		}
	})
	
nodes.forEach(function(a,i){
	nodes.forEach(function(b,j){
			
			if (Math.random()<rho && j < i){
				let w = 1;
				a.neighbors.push(b);
				b.neighbors.push(a);
				links.push({source:a, target:b, weight: w})
				links.push({source:b, target:a, weight: w})
			}
		})
	})
	
compute_degree();

S.domain(d3.extent(nodes,function(d){return d.k}))
nc.domain(d3.extent(nodes,function(d){return d.cc}))
lw.domain(d3.extent(links,function(d){return d.weight}))
lc.domain(d3.extent(links,function(d){return d.weight}))
	simulation.nodes(nodes);

	simulation .force("link", d3.forceLink(links).distance(30).strength(0.5))
	
	simulation.alpha(1).restart();
	
	
	link = link.data(links, function(d) { return d.source.id + "-" + d.target.id; });
	link.exit().remove();
	link = link.enter().insert("line",".node").attr("class","edge").merge(link)
	
	link
	.style("stroke-width",function(d){return lw(d.weight)})
	.style("stroke",function(d){return lc(d.weight)})
	
node.data(nodes).attr("r",function(d){return S(d.k)}).style("opacity",function(d){
	return d.k == 0 ? 1 : 1
}).style("fill",function(d){return nc(d.cc)})
}

function resetparameters(){
	slider[3].click(def_delta);
	slider[2].click(def_p_explore);
	slider[1].click(def_p_local);
	slider[0].click(def_p_death);
}

function linked(a,b){
	
	return links.filter(function(l){
		return (l.source == a && l.target == b) 
	}).length > 0

}

function linksof(a,b){
	
	return links.filter(function(l){
		return ((l.source == a && l.target == b) || (l.source == b && l.target == a)) 
	})
}


function runsim(){
	
	tick++;
	let pair = d3.shuffle(d3.range(N)).slice(0,2)	
	var a = nodes[pair[0]];
	var b = nodes[pair[1]];
	
	if ( Math.random()<p_death.value ){ killnode(a); } else
	
	if (Math.random()<p_explore.value || a.k==0){
		
		
		if (!linked(a,b)) {
			
			a.neighbors.push(b);
				b.neighbors.push(a);
				
				links.push({source:a, target:b, weight: w0})
				links.push({source:b, target:a, weight: w0})
		}
	} 
	
	if (Math.random()<p_local.value){
		
		var b = pickneighbor(a);
								
		if ( b ){

			var c = pickneighbor(b);

			if (c.id != a.id) {
				if(!linked(a,c)) {
					a.neighbors.push(c);
					c.neighbors.push(a);
				
					links.push({source:a, target:c, weight: w0})
					links.push({source:c, target:a, weight: w0})
				} 
				else {
					var l1 = linksof(a,b);
					var l2 = linksof(a,c);
					
					l1[0].weight+=delta.value;
					l1[1].weight+=delta.value;
					l2[0].weight+=delta.value;
					l2[1].weight+=delta.value;								
					
				}
			} 
		}
	}
	
	compute_degree();
	compute_clustering();

	S.domain(d3.extent(nodes,function(d){return d.k}))
	nc.domain(d3.extent(nodes,function(d){return d.cc}))
	lw.domain(d3.extent(links,function(d){return d.weight}))
	lc.domain(d3.extent(links,function(d){return d.weight}))
	
	simulation.nodes(nodes);

	simulation .force("link", d3.forceLink(links).distance(30).strength(0.5))
	
	simulation.alpha(0.4).restart();
	
	
	link = link.data(links, function(d) { return d.source.id + "-" + d.target.id; });
	link.exit().remove();
	link = link.enter().insert("line",".node").attr("class","edge").merge(link)
	
	link
	.style("stroke-width",function(d){return lw(d.weight)})
	.style("stroke",function(d){return lc(d.weight)})
	
node.data(nodes).attr("r",function(d){return S(d.k)}).style("opacity",function(d){
	return d.k == 0 ? 1 : 1
}).style("fill",function(d){return nc(d.cc)})
	
}

function killnode(a){
	a.neighbors.forEach(function(n){
		n.neighbors = n.neighbors.filter(function(x){return x!=a})
			
		links = links.filter(function(l){
			return !(l.source == a && l.target == n) 
		})
		
		links = links.filter(function(l){
			return !(l.source == n && l.target == a) 
		})			
	});
	a.k = 0;	
	a.neighbors = [];
}

function pickneighbor(n){
	let ll = links.filter(function(l){
		return l.source == n;
	});
	if (ll.length>0){
		let w = ll.map(function(l){return l.weight});
		let p = cumsum(w).map(function(d,i){return {i:i,p:d}});
		let x = Math.random()*p[p.length-1].p;
		let ix = p.filter(function(d){
			return d.p>x})[0].i
		return ll[ix].target	
	} else {
	return null;
	}
}

function cumsum(a){
	for (var cumsum = [a[0]], i = 0, l = a.length-1; i<l; i++) 
	    cumsum[i+1] = cumsum[i] + a[i+1]; 
	return cumsum;
}	



function ticked() {
  link
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  node
	.attr("cx",function(d){return d.x})
	.attr("cy",function(d){return d.y})

}


function compute_degree(){
	
	nodes.forEach(function(n){
		n.k = n.neighbors.length;
	})
}

function compute_clustering(){
	
	nodes.forEach(function(n){

		// clustering coefficient
		
		let neighbors = n.neighbors;

		let Ln = 0;
		neighbors.forEach(function(i){
			neighbors.forEach(function(j){
				links.forEach(function(ll){
					if (ll.source.id==i.id && ll.target.id==j.id) {Ln++}
				})
			})
		})
		
		n.cc=n.k > 1 ? Ln/(n.k*(n.k-1)) : 0
	})
}

function dragstarted(d) {
	if (!d3.event.active) simulation.alphaTarget(0.3).restart();
	d.fx = d.x;
	d.fy = d.y;
}

function dragged(d) {
	d.fx = d3.event.x;
	d.fy = d3.event.y;
}

function dragended(d) {
	if (!d3.event.active) simulation.alphaTarget(0);
	d.fx = null;
	d.fy = null;
}

})()