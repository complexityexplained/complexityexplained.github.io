var lattice = (function(){

	var lattice; // instance of the lattice

	// constructor for square lattice
	
	var square = function(arg){	
		var N; if (typeof(arg)==="undefined"){N=10}else{N=arg}
		var Scale = N,
			BoundaryConditions = "dirichlet";
		
		var M = 2*N + 1;
		
		var nodes = d3.range(M*M).map(function(i){
   			return { m:(i % M), n: Math.floor(i / M), x: (i % M)-N, y: Math.floor(i / M)-N}
   	 	})		
		
   	 	nodes.forEach(function(d,i){
   			d.neighbors=nn_dirichlet(i,M).map(function(x){return nodes[x]});
   		})
		
		// methods
		
		var scale = function(s){
			if (typeof s !== "undefined") {
				Scale = s * N;
				nodes.forEach(function(d){d.x*=s,d.y*=s}) ; 
				return this; 
			} else {
				return Scale / N;
			}
		}
		
		var cell = function(point){			
			return [
				{x:point.x + Scale / N / 2, y:point.y + Scale / N / 2},
				{x:point.x - Scale / N / 2, y:point.y + Scale / N / 2},
				{x:point.x - Scale / N / 2, y:point.y - Scale / N / 2},
				{x:point.x + Scale / N / 2, y:point.y - Scale / N / 2},
				{x:point.x + Scale / N / 2, y:point.y + Scale / N / 2}
			]
		}
		
		var boundary = function(s){
			if (typeof s !== "undefined") {
				if(s=="dirichlet"){
					BoundaryConditions = "dirichlet";
			   	 	nodes.forEach(function(d,i){
			   			d.neighbors=nn_dirichlet(i,M).map(function(x){return nodes[x]});
			   		})
				} else {
					BoundaryConditions = "periodic";					
			   	 	nodes.forEach(function(d,i){
			   			d.neighbors=nn_periodic(i,M).map(function(x){return nodes[x]});
			   		})
				}
				return this;
			} else {
				return BoundaryConditions;
			}
		}
					
		return {
			type:"square",
			L:N,
			N:nodes.length,
			nodes: nodes,
			scale: scale,
			boundary: boundary,
			cell:cell
		}
	}

	var square4 = function(arg){	
		var N; if (typeof(arg)==="undefined"){N=10}else{N=arg}
		var Scale = N,
			BoundaryConditions = "dirichlet";
		
		var M = 2*N + 1;
		
		var nodes = d3.range(M*M).map(function(i){
   			return { m:(i % M), n: Math.floor(i / M), x: (i % M)-N, y: Math.floor(i / M)-N}
   	 	})		
		
   	 	nodes.forEach(function(d,i){
   			d.neighbors=nn_dirichlet(i,M).map(function(x){return nodes[x]});
   		})
		
		// methods
		
		var scale = function(s){
			if (typeof s !== "undefined") {
				Scale = s * N;
				nodes.forEach(function(d){d.x*=s,d.y*=s}) ; 
				return this; 
			} else {
				return Scale / N;
			}
		}
		
		var cell = function(point){			
			return [
				{x:point.x + Scale / N / 2, y:point.y + Scale / N / 2},
				{x:point.x - Scale / N / 2, y:point.y + Scale / N / 2},
				{x:point.x - Scale / N / 2, y:point.y - Scale / N / 2},
				{x:point.x + Scale / N / 2, y:point.y - Scale / N / 2},
				{x:point.x + Scale / N / 2, y:point.y + Scale / N / 2}
			]
		}
		
		var boundary = function(s){
			if (typeof s !== "undefined") {
				if(s=="dirichlet"){
					BoundaryConditions = "dirichlet";
			   	 	nodes.forEach(function(d,i){
			   			d.neighbors=nn4_dirichlet(i,M).map(function(x){return nodes[x]});
			   		})
				} else {
					BoundaryConditions = "periodic";					
			   	 	nodes.forEach(function(d,i){
			   			d.neighbors=nn4_periodic(i,M).map(function(x){return nodes[x]});
			   		})
				}
				return this;
			} else {
				return BoundaryConditions;
			}
		}
					
		return {
			type:"square4",
			L:N,
			N:nodes.length,
			nodes: nodes,
			scale: scale,
			boundary: boundary,
			cell:cell
		}
	}

	// constructor for hex lattice

	var hex = function(arg){
		var N; if (typeof(arg)==="undefined"){N=10}else{N=arg}
		var Scale = N,
			BoundaryConditions = "dirichlet";
		
			var b1 = [1,0], b2 = [0.5,Math.sqrt(3)/2],	
				u = [
					{l:1,m:0,n:-1},
					{l:1,m:-1,n:0},
					{l:0,m:-1,n:1},
					{l:0,m:1,n:-1},
					{l:-1,m:0,n:1},
					{l:-1,m:1,n:0}
				];
			
			var	tri = [
					[u[0],u[1]],
					[u[1],u[2]],
					[u[2],u[4]],
					[u[4],u[5]],
					[u[5],u[3]],
					[u[3],u[0]]
				];
			
			
			var nodes = [];
			var lookup = {};
			
			
			d3.range(-N,N+1).forEach(function(i){
				d3.range(-N,N+1).forEach(function(j){
					d3.range(-N,N+1).forEach(function(k){
						if (i+j+k == 0) nodes.push({l:i,m:j,n:k, x: i*b1[0]+j*b2[0], y: i*b1[1]+j*b2[1]})
					})
				})	
			})
			
			nodes.forEach(function(d){
				lookup[hexid(d)]=d;
			})

			dirichlet_neighbors(nodes);
			
			
			var scale = function(s){
				if (typeof s !== "undefined") {
					Scale = s * N;
					nodes.forEach(function(d){d.x*=s,d.y*=s}) ; 
					return this; 
				} else {
					return Scale / N;
				}
			}
			
			var cell = function(point){
				var D = 1.0/Math.sqrt(3);			
				return [
					{x:point.x + Scale / N / 2, y:point.y + D / 2 * Scale / N },
					{x:point.x, y:point.y + D * Scale / N},
					{x:point.x - Scale / N / 2, y:point.y  + D / 2 * Scale / N},
					{x:point.x - Scale / N / 2, y:point.y  -  D / 2 * Scale / N},
					{x:point.x, y:point.y - D * Scale / N},
					{x:point.x + Scale / N / 2, y:point.y - D / 2 * Scale / N },
					{x:point.x + Scale / N / 2, y:point.y + D / 2 * Scale / N }
				]
			}
			
			var boundary = function(s){
				if (typeof s !== "undefined") {
					if(s=="dirichlet"){
						BoundaryConditions = "dirichlet";
				   	 	dirichlet_neighbors(nodes);
						
					} else {
						BoundaryConditions = "periodic";					
				   	 	periodic_neighbors(nodes);
						
					}
					return this;
				} else {
					return BoundaryConditions;
				}
			}
			
			function periodic_neighbors(p){
				
				p.forEach(function(d){
					d.neighbors = [];
					u.forEach(function(n){
		
						var nuck = hexid ({l:(d.l+n.l),m:(d.m+n.m),n:(d.n+n.n)});
						
						if (typeof lookup[nuck] !== 'undefined') {
							d.neighbors.push(lookup[nuck])
						} else {
							if (d.l+n.l==N+1 && Math.abs(d.m+n.m)<=N+1 && Math.abs(d.n+n.n)<=N) {
								var nuck = hexid ({l:(d.l+n.l-(2*N+1)),m:(d.m+n.m+(N+1)),n:(d.n+n.n+N)});
								d.neighbors.push(lookup[nuck])
							}
							if (d.l+n.l==-(N+1) && Math.abs(d.m+n.m)<=N+1 && Math.abs(d.n+n.n)<=N) {
								var nuck = hexid ({l:(d.l+n.l+(2*N+1)),m:(d.m+n.m-(N+1)),n:(d.n+n.n-N)});
								d.neighbors.push(lookup[nuck])
							}
							if (d.m+n.m==N+1 && Math.abs(d.l+n.l)<=N && Math.abs(d.n+n.n)<=N+1) {
								var nuck = hexid ({m:(d.m+n.m-(2*N+1)),n:(d.n+n.n+(N+1)),l:(d.l+n.l+N)});
								d.neighbors.push(lookup[nuck])
							}
							if (d.m+n.m==-(N+1) && Math.abs(d.l+n.l)<=N && Math.abs(d.n+n.n)<=N+1) {
								var nuck = hexid ({m:(d.m+n.m+(2*N+1)),n:(d.n+n.n-(N+1)),l:(d.l+n.l-N)});
								d.neighbors.push(lookup[nuck])
							}
							if (d.n+n.n==N+1 && Math.abs(d.l+n.l)<=N+1 && Math.abs(d.m+n.m)<=N) {
								var nuck = hexid ({n:(d.n+n.n-(2*N+1)),l:(d.l+n.l+(N+1)),m:(d.m+n.m+N)});
								d.neighbors.push(lookup[nuck])
							}
							if (d.n+n.n==-(N+1) && Math.abs(d.l+n.l)<=N+1 && Math.abs(d.m+n.m)<=N) {
								var nuck = hexid ({n:(d.n+n.n+(2*N+1)),l:(d.l+n.l-(N+1)),m:(d.m+n.m-N)});
								d.neighbors.push(lookup[nuck])
							}
						}
					})
		
				})
				
				
				p.forEach(function(d){
					d.triangles = [];
					tri.forEach(function(n){
		
						var nuck = hexid ({l:(d.l+n[0].l),m:(d.m+n[0].m),n:(d.n+n[0].n)});
						var puck = hexid ({l:(d.l+n[1].l),m:(d.m+n[1].m),n:(d.n+n[1].n)});
												
						if (typeof lookup[nuck] === 'undefined')  {
							if (d.l+n[0].l==N+1 && Math.abs(d.m+n[0].m)<=N+1 && Math.abs(d.n+n[0].n)<=N) {
								var nuck = hexid ({l:(d.l+n[0].l-(2*N+1)),m:(d.m+n[0].m+(N+1)),n:(d.n+n[0].n+N)});

							}
							if (d.l+n[0].l==-(N+1) && Math.abs(d.m+n[0].m)<=N+1 && Math.abs(d.n+n[0].n)<=N) {
								var nuck = hexid ({l:(d.l+n[0].l+(2*N+1)),m:(d.m+n[0].m-(N+1)),n:(d.n+n[0].n-N)});

							}
							if (d.m+n[0].m==N+1 && Math.abs(d.l+n[0].l)<=N && Math.abs(d.n+n[0].n)<=N+1) {
								var nuck = hexid ({m:(d.m+n[0].m-(2*N+1)),n:(d.n+n[0].n+(N+1)),l:(d.l+n[0].l+N)});

							}
							if (d.m+n[0].m==-(N+1) && Math.abs(d.l+n[0].l)<=N && Math.abs(d.n+n[0].n)<=N+1) {
								var nuck = hexid ({m:(d.m+n[0].m+(2*N+1)),n:(d.n+n[0].n-(N+1)),l:(d.l+n[0].l-N)});

							}
							if (d.n+n[0].n==N+1 && Math.abs(d.l+n[0].l)<=N+1 && Math.abs(d.m+n[0].m)<=N) {
								var nuck = hexid ({n:(d.n+n[0].n-(2*N+1)),l:(d.l+n[0].l+(N+1)),m:(d.m+n[0].m+N)});

							}
							if (d.n+n[0].n==-(N+1) && Math.abs(d.l+n[0].l)<=N+1 && Math.abs(d.m+n[0].m)<=N) {
								var nuck = hexid ({n:(d.n+n[0].n+(2*N+1)),l:(d.l+n[0].l-(N+1)),m:(d.m+n[0].m-N)});

							}
						}
						
						if (typeof lookup[puck] === 'undefined')  {
							if (d.l+n[1].l==N+1 && Math.abs(d.m+n[1].m)<=N+1 && Math.abs(d.n+n[1].n)<=N) {
								var puck = hexid ({l:(d.l+n[1].l-(2*N+1)),m:(d.m+n[1].m+(N+1)),n:(d.n+n[1].n+N)});

							}
							if (d.l+n[1].l==-(N+1) && Math.abs(d.m+n[1].m)<=N+1 && Math.abs(d.n+n[1].n)<=N) {
								var puck = hexid ({l:(d.l+n[1].l+(2*N+1)),m:(d.m+n[1].m-(N+1)),n:(d.n+n[1].n-N)});

							}
							if (d.m+n[1].m==N+1 && Math.abs(d.l+n[1].l)<=N && Math.abs(d.n+n[1].n)<=N+1) {
								var puck = hexid ({m:(d.m+n[1].m-(2*N+1)),n:(d.n+n[1].n+(N+1)),l:(d.l+n[1].l+N)});

							}
							if (d.m+n[1].m==-(N+1) && Math.abs(d.l+n[1].l)<=N && Math.abs(d.n+n[1].n)<=N+1) {
								var puck = hexid ({m:(d.m+n[1].m+(2*N+1)),n:(d.n+n[1].n-(N+1)),l:(d.l+n[1].l-N)});

							}
							if (d.n+n[1].n==N+1 && Math.abs(d.l+n[1].l)<=N+1 && Math.abs(d.m+n[1].m)<=N) {
								var puck = hexid ({n:(d.n+n[1].n-(2*N+1)),l:(d.l+n[1].l+(N+1)),m:(d.m+n[1].m+N)});

							}
							if (d.n+n[1].n==-(N+1) && Math.abs(d.l+n[1].l)<=N+1 && Math.abs(d.m+n[1].m)<=N) {
								var puck = hexid ({n:(d.n+n[1].n+(2*N+1)),l:(d.l+n[1].l-(N+1)),m:(d.m+n[1].m-N)});

							}
						}
						
						d.triangles.push([lookup[nuck],lookup[puck]])
						
						
					})
		
				})
				
				
			}	
			function dirichlet_neighbors(p){
				
				p.forEach(function(d){
					d.neighbors = [];
					u.forEach(function(n){
		
						var nuck = hexid ({l:(d.l+n.l),m:(d.m+n.m),n:(d.n+n.n)});
						
						if (typeof lookup[nuck] !== 'undefined') {
							d.neighbors.push(lookup[nuck])
						} 
					})
		
				})
				
				p.forEach(function(d){
					d.triangles = [];
					tri.forEach(function(n){
		
						var nuck = hexid ({l:(d.l+n[0].l),m:(d.m+n[0].m),n:(d.n+n[0].n)});
						var puck = hexid ({l:(d.l+n[1].l),m:(d.m+n[1].m),n:(d.n+n[1].n)});
												
						if (typeof lookup[nuck] !== 'undefined' && typeof lookup[puck] !== 'undefined') {
							d.triangles.push([lookup[nuck],lookup[puck]])
						} 
					})
		
				})
				
				
			}	
						
		return {
			type:"hexagonal",
			L:N,
			N:nodes.length,
			nodes: nodes,
			scale: scale,
			boundary: boundary,
			cell:cell
		}
		
		
		
	}

	// module stuff
	
	return {
			square: function(N){
				lattice = square(N);
				return lattice;
			},
			square4: function(N){
				lattice = square4(N);
				return lattice;
			},
			hex: function(N){
				lattice = hex(N);
				return lattice;
			}
	}	
	

// private function needed for square lattice

	function d2l(x,y,n){ return y*n+x; }
	function l2d(i,n){ return [i % n, Math.floor(i/n)];}
	function nn_periodic(k,n){
		wadda=[];
		for(i=-1;i<=1;i++){
			for(j=-1;j<=1;j++){
				var p = l2d(k,n),
					x = p[0],
					y = p[1],
					a = x + i, 
					b = y+j;
				if (!(j == 0 && i==0)) {
					wadda.push(n*((b+n)%n)+(a+n)%n);
				}
			}
		}
		return wadda;
	}	
	function nn_dirichlet(k,n){
		wadda=[];
		for(i=-1;i<=1;i++){
			for(j=-1;j<=1;j++){
				var p = l2d(k,n),
					x = p[0],
					y = p[1],
					a = x + i, 
					b = y+j;
				if (!(j == 0 && i==0) && a<n && b < n && a>=0 && b>=0) {
					wadda.push(n*((b+n)%n)+(a+n)%n);
				}
			}
		}
		return wadda;
	}
	
	function nn4_periodic(k,n){
		var nucksen = [[-1,0],[1,0],[0,-1],[0,1]];
		wadda=[];
		
		nucksen.forEach(function(pp){
			var i = pp[0];
			var j = pp[1];
			var p = l2d(k,n),
				x = p[0],
				y = p[1],
				a = x + i, 
				b = y+j;
				if (!(j == 0 && i==0)) {
					wadda.push(n*((b+n)%n)+(a+n)%n);
				}
		})

		return wadda;
	}	
	function nn4_dirichlet(k,n){
		
		var nucksen = [[-1,0],[1,0],[0,-1],[0,1]];
		
		wadda=[];
		nucksen.forEach(function(pp){
			var i = pp[0];
			var j = pp[1];
				var p = l2d(k,n),
					x = p[0],
					y = p[1],
					a = x + i, 
					b = y+j;
				if (!(j == 0 && i==0) && a<n && b < n && a>=0 && b>=0) {
					wadda.push(n*((b+n)%n)+(a+n)%n);
				}
			})
		
		return wadda;
	}
	
	function hexid(d){
		return "id_l"+(d.l)+"m"+(d.m)+"n"+(d.n);
	}
	
})()


