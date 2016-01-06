


var width = $('#map').width(),
    height = 500,
    centered;
// sets the type of view
var projection = d3.geo.albersUsa()
    .scale(1070) // size, bigger is bigger
    .translate([width / 2, height / 2]);

//creates a new geographic path generator
var path = d3.geo.path().projection(projection);
var xScale = d3.scale.linear()
    .domain([0, 7])
    .range([0, 500]);

var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom")
    .tickSize(13)
    .tickFormat(d3.format("0.0f"));


//set svg window
var svg = d3.select("#map")
      .append("svg")
      .attr("width", width)
      .attr("height", height)

var graticule = d3.geo.graticule()
    .extent([[-98 - 45, 38 - 45], [-98 + 45, 38 + 45]])
    .step([5, 5]);

// adding a blank background
svg.append("rect")
    .datum(graticule)
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
   // .on("click", clicked);

//declare g as our appended svg
var g = svg.append("g");

var defaultFill = "#aaa";

d3.json("data/nielsentopo.json", function(error, dma) {

  var nielsen = dma.objects.nielsen_dma.geometries;

  // adding data from tv json (number of TVs, etc) to map json
  d3.json("data/tv.json", function(error, tv){
    for (var i = 0; i < nielsen.length; i++){
      var dma_code = nielsen[i].id;
      for (key in tv[dma_code]){
        nielsen[i].properties[key] = tv[dma_code][key];
      }
    }
  dma.objects.nielsen_dma.geometries = nielsen;

  g.append("g")
    .attr("id", "dmas")
    .selectAll("path")
    .data(topojson.feature(dma, dma.objects.nielsen_dma).features)
    .enter()
    .append("path")
    .attr("d", path)

    .on("click", clicked)
    //.on("click", clicked)

    .on("mouseover", function(d){
      d3.select(this)
      .attr("fill", "orange");

      var prop = d.properties;

      var string = "<p><strong>Market Area Name</strong>: " + prop.dma1 + "</p>";
      string += "<p><strong>Homes with TVs</strong>: " + numberWithCommas(prop["TV Homes"]) + "</p>";
      string += "<p><strong>% with Cable</strong>: " + prop.cableperc + "%</p>";
      string += "<p><strong>Nielsen Rank</strong>: " + prop.Rank + "</p>";

      d3.select("#textbox")
        .html("")
        .append("text")
        .html(string)
    })

    .on("mouseout", function(d){
      d3.select(this)
      .attr("fill", defaultFill)
    })

    .attr("opacity", 0.9)
    .attr("fill", defaultFill);

  // add dma borders
  g.append("path", ".graticule")
      .datum(topojson.mesh(dma, dma.objects.nielsen_dma, function(a, b) {
        return true;
      }))
      .attr("id", "dma-borders")
      .attr("d", path);
  })
})

// via http://stackoverflow.com/a/2901298
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function clicked(d) {
  var x, y, k;

  if (d && centered !== d) {
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 4;
    centered = d;
  } else {
    x = width / 2;
    y = height / 2;
    k = 1;
    centered = null;
  }

  g.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });

  g.transition()
      .duration(1000)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");
}
