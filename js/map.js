function mapping(map) {
	
	
	var startLongitude=-71.290921;
	var endLongitude=-70.920801;
	var startLatitude=42.254671;
	var endLatitude=42.440915;
	
	var grids=[];
	var numi=0;
	var numj=0;
	for (var i=startLatitude;i<endLatitude+0.01;i=i+0.0025){
		numj=0;
		for (var j=startLongitude;j<endLongitude+0.01;j=j+0.0035){
			var grid={};
			grid.start={};
			grid.end={};
			grid.start.latitude=i;
			grid.start.longitude=j;
			grid.end.latitude=i+0.0025;
			grid.end.longitude=j+0.0035;
			grids.push(grid);
			numj++;
		}
		numi++;
	}
	console.log(numi);
	console.log(numj);
	
	

	var svg = d3.select("#map").select("svg");
	
	var g = svg.append("g")
				.attr("id","great");
				
	var grid_import=[];
	var gridFile="data/boston_grids_json.json";
	var taxiFile="data/boston_top_taxi_json.json"
	
	
	

	proj4.defs("EPSG:2276","+proj=lcc +lat_1=33.96666666666667 +lat_2=32.13333333333333 +lat_0=31.66666666666667 +lon_0=-98.5 +x_0=600000 +y_0=2000000.0001016 +ellps=GRS80 +datum=NAD83 +to_meter=0.3048006096012192 +no_defs");
	proj4.defs("EPSG:4326","+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs");
	
	var tip = d3.tip()
				.attr('class', 'd3-tip')
				.offset([0, 0])
				.html(function(d) {
						return "<p style='line-height: 30%'><strong>"+d.name+"</strong></p>";
    });
	g.call(tip);
	
	index=[];
		
	
	map.on("moveend", reset);
	reset();

	function reset() {
		
		
		
		g.selectAll(".path")
		.remove();
		g.selectAll(".grid_boundary")
			.remove();
							
		g.selectAll(".grid")
			.remove();
		g.selectAll(".taxi")
			.remove();
		
		file="data/boston_segments_json.json";
		
		
		d3.json(file, function(error, collectionA) {
			if (error) throw error;
			bounds=map.getBounds();
			
			collection=[]
			

			
			
			collectionA.forEach(function (d){
				road={};
				road.type=d.road_type;
				road.name=d.name;
				road.path=d.points;

				if (anyin(road.path,bounds)){
					collection.push(road);
				}
			});
			console.log(collection.length);
			var toLine = d3.svg.line()
				.interpolate("bundle")
				.x(function(d) {
					return applyLatLngToLayer(d).x
				})
				.y(function(d) {
					return applyLatLngToLayer(d).y
				});

			function applyLatLngToLayer(d) {
				var y = d.latitude;
				var x = d.longitude;
				return map.latLngToLayerPoint(new L.LatLng(y, x))
			}
			function applyLatLngToLayerGrid(d) {
				var y = d.lat;
				var x = d.lng;
				return map.latLngToLayerPoint(new L.LatLng(y, x))
			}

			draw();
			/*
			for (var i=0;i<collection.length;i++){
				var ss=d3.selectAll(".path"+i)
						.attr("d",function (d){
							return toLine(d.points)});
						
			}*/
			
			
				
			function draw(){
				mark=0
				
				var wid=5;
				if (map.getZoom()>15){
					wid=map.getZoom()-13;
				}
				
				
				
				

					
				
							
							
				d3.json(gridFile, function(error, collectionGrid) {
					d3.json(taxiFile, function(error, collectionTaxi) {
						console.log(collectionTaxi);
						collectionGrid.data.forEach(function (d){		
								d.start = new L.LatLng(d.start_lat,d.start_lng);
								d.end = new L.LatLng(d.end_lat,d.end_lng);						
							});
						grid_import=collectionGrid.data;
						var grid_boundary=collectionGrid.boundary;
						console.log(grid_boundary);
						
						
						
						g.selectAll(".grid_boundary")
							.data(grid_boundary)
							.enter()
							.append("path")
							.attr("class","grid_boundary")
							.attr("d",function (d){
								return toLine(d);
							});
							
						var tt=g.selectAll(".path")
							.data(collection)
							.enter()
							.append("path")
							.attr("class",function (d){
								return "path "+d.type;
							})
							.style("fill","none")
							.style("opacity",1)
							.attr("d",function (d){

									return toLine(d.path)});
						
						
						
						g.selectAll(".grid")
							.data(grid_import)
							.enter()
							.append("rect")
							.attr("class",function (d){
								if (d.amount==0){
									return "grid out";
								}else {
									return "grid in";
								}
							})
							.attr("id",function (d,i){
								return "rect"+i;
							})
							.attr("x",function (d){
								return applyLatLngToLayerGrid(d.start).x;
							})
							.attr("y",function (d){
								return applyLatLngToLayerGrid(d.start).y;
							})
							.attr("width",function(d){
								return Math.abs(applyLatLngToLayerGrid(d.start).x - applyLatLngToLayerGrid(d.end).x);
							})
							.attr("height",function(d){
								return Math.abs(applyLatLngToLayerGrid(d.start).y - applyLatLngToLayerGrid(d.end).y);
							})
							.on("click",function (d,i){
								$("#rect"+i).attr("class","grid marked");
							});
							
						
						
						var ttt=g.selectAll(".taxi")
							.data(collectionTaxi)
							.enter()
							.append("path")
							.attr("class","taxi")
							.style("fill","none")
							.style("opacity",1)
							.style("stroke","#CD0000")
							.style("stroke-width","2")
							.attr("d",function(d){
								return toLine(d);
							});
							
						g.append("rect")
							.attr("x",function (d){
								return 220;
							})
							.attr("y",function (d){
								return 20;
							})
							.attr("width",function(d){
								return 900;
							})
							.attr("height",function(d){
								return 605;
							})
							.style("fill","none")
							.style("stroke","black")
							.style("stroke-width",3);
						
					});
					});
			}
			
		});
		
		
		

		return this;
	}
}
	
	
	

function in_array(stringToSearch, arrayToSearch) {
	for (s = 0; s < arrayToSearch.length; s++) {
		thisEntry = arrayToSearch[s].toString();
		if (thisEntry == stringToSearch) {
			return true;
		}
	}
	return false;
}

function anyin(points,bounds){
	var st=false;
	points.forEach(function (d){
		
		po=new L.LatLng(d.latitude,d.longitude);
		if (bounds.contains(po)){
			st=true;
		}
	});
	return st;
	
}