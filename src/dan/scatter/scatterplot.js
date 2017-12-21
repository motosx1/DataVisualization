var viewWidth = window.innerWidth;
var viewHeight = window.innerHeight;
d3.select(window).on("resize", resize);

var margin = {top: 20, right: 20, bottom: 30, left: 40};
var width = viewWidth - margin.left - margin.right - 50;
var height = viewHeight - margin.top - margin.bottom - 50;

var x = "x";
var y = "y";
var c = "a";

var svg = d3.select("svg")
    .attr("width", width + 50)
    .attr("height", height + 50)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var colors = ['red', 'blue'];
var color = d3.scaleLinear().range(colors);

var defs = svg.append("defs");

var legendGradient = defs.append("linearGradient")
    .attr("id", "legendGradient")
    .attr("x1", "0")
    .attr("x2", "0")
    .attr("y1", "1")
    .attr("y2", "0");

legendGradient.append("stop")
    .attr("id", "gradientStart")
    .attr("offset", "0%")
    .style("stop-opacity", 1);

legendGradient.append("stop")
    .attr("id", "gradientStop")
    .attr("offset", "100%")
    .style("stop-opacity", 1);

var transition = d3.transition()
	.duration(500)
    .ease(d3.easeLinear);

// get the data
var boats = boat_data.boats;

var points;
  
function drawScatterplot(xData, yData, cData) {
  svg.selectAll("g").remove();

  var xLimits = d3.extent(boats, function(d) { return d[xData]; });
  var yLimits = d3.extent(boats, function(d) { return d[yData]; });
  var colorLimits = d3.extent(boats, function(d) { return d[cData]; });

  //The svg is already defined, you can just focus on the creation of the scatterplot
  //you should at least draw the data points and the axes.
  console.log("Draw Scatterplot");
  
	// X axis
	var xScale = d3
		.scaleLinear()
		.domain([xLimits[0], xLimits[1]])
		.nice()
		.range([0, width]);

	var xAxis = d3.axisBottom(xScale);
	
	// Y axis
	var yScale = d3
		.scaleLinear()
		.domain([yLimits[0], yLimits[1]])
		.nice()
		.range([height, 0]);

	var yAxis = d3.axisLeft(yScale);

    console.log("(W, H): (" + width + ", " + height + ")");

	// Color Map
	var colorScale = d3
		.scaleLinear()
		.domain([colorLimits[0], colorLimits[1]])
		.nice()
		.range(['blue', 'red']);

	svg
		.append('g')
        	.attr("id", "yAxis")
			.attr('class', 'axis')
			.call(yAxis)
		.append("text")
			.attr("class", "axisLabels")
			.attr("x", 16)
			.attr("y", height)
			.attr("transform", "rotate(-90)")
			.style("text-anchor", "end")
			.text(yData);

	svg
		.append('g')
			.attr("id", "xAxis")
			.attr('class', 'axis')
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis)
		.append("text")
			.attr("class", "axisLabels")
			.attr("x", width)
			.attr("y", -16)
			.style("text-anchor", "end")
			.text(xData);

    points = svg
		.append('g')
			.attr("class", "plotArea")
		.selectAll(".dot")
			.data(boats)
		.enter()
		.append("circle")
			.attr("class", 'dot')
			.attr('r', 3.5)
			.attr('cx', function(d) { return xScale(d[xData]); })
			.attr('cy', function(d) { return yScale(d[yData]); })
			.style('fill', function(d) { return colorScale(d[cData]); })
    	.on('mouseover', function(datum) {
    		d3
				.select(this)
                .transition(transition)
                .attr('r', datum[cData] > 10 ? 10 : (datum[cData] < 2 ? 2 : datum[cData]));
		})
		.on('mouseout', function() {
			d3
				.select(this)
				.attr('r', 3.5)
				.transition()
		});

	// Manage the gradient legend

	svg.select("#gradientStart")
        .style("stop-color", colors[0]);
	svg.select("#gradientStop")
        .style("stop-color", colors[1]);

    var legend = svg
        .append("g")
        .attr("class", "legend");

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 72)
        .style("fill", "url(#legendGradient)");

    legend.append("text")
        .attr("x", width - 22)
        .attr("y",6)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text("high");

    legend.append("text")
        .attr("x", width - 22)
        .attr("y",66)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text("low");

    legend.append("text")
        .attr("id", "colorLabel")
        .attr("x", width)
        .attr("y", 82)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(cData);



}

function resize() {
  viewWidth = window.innerWidth;
  viewHeight = window.innerHeight;

  width = viewWidth - margin.left - margin.right - 50;
  height = viewHeight - margin.top - margin.bottom - 50;

  drawScatterplot(x, y, c);
}

function rearrangePoints(xLabel, yLabel, cLabel) {
	var transition = d3.transition().duration(1000).ease(d3.easeExpInOut);

    var xLimits = d3.extent(boats, function(d) { return d[xLabel]; });
    var yLimits = d3.extent(boats, function(d) { return d[yLabel]; });
    var colorLimits = d3.extent(boats, function(d) { return d[cLabel]; });

    var xMap = d3
		.scaleLinear()
		.domain([xLimits[0], xLimits[1]])
		.nice()
		.range([0, width]);

    var yMap = d3
        .scaleLinear()
		.domain([yLimits[0], yLimits[1]])
		.nice()
		.range([height, 0]);

    var colorScale = d3
        .scaleLinear()
		.domain([colorLimits[0], colorLimits[1]])
		.nice()
		.range(['blue', 'red']);

	points
        .transition(transition)
        .attr('cx', function(d) { return xMap(d[xLabel]); })
        .attr('cy', function(d) { return yMap(d[yLabel]); })
        .style('fill', function(d) { return colorScale(d[cLabel]); });
}

function changedSelect() {

	var selectionElements = document.getElementsByClassName("select-item");

	x = selectionElements[0].value;
	y = selectionElements[1].value;
	c = selectionElements[2].value;

	console.log(x);
	console.log(y);
	console.log(c);

    rearrangePoints(x, y, c);
}

drawScatterplot(x, y, c);



//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
////////////////////    ADDITIONAL TASKS   ///////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
/*
Once that you have implemented your basic scatterplot you can work on new features
  * Color coding of the points based on a third attribute
  * Legend for the third attribute with color scale
  * Interactive selection of the 3 attributes visualized in the scatterplot
  * Resizing of the window updates the scatterplot
*/
