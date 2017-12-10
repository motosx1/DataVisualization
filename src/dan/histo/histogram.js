
var marginBottom = 50;
var viewWidth = window.innerWidth;
var viewHeight = window.innerHeight - marginBottom;
d3.select(window).on("resize", resize);

var svg = d3
	.select("svg")
		.attr("width", viewWidth)
		.attr("height", viewHeight)
	.append("g")
		.attr("transform", "translate(" + viewWidth/2 + "," + viewHeight/2 + ")");

	
var barHeight = Math.min(viewWidth, viewHeight) / 2 - 50; // gives you the circle radius minus some spacing for labels etc.

var numBins = 25;
var angles = convertData(boat_data.boats);

function convertData(data) {
	var converted = [];
	
	for (let boat of data) {
		console.log(boat.u + ", " + boat.v);
		
		var radian = Math.atan2(-boat.v, boat.u);

		radian = radian < 0 ? 2 * Math.PI + radian : radian;

		converted.push(
            radian
		);
	}

	return converted;
}
	
function drawHistogram() {
	// Clear the previous content
	svg.selectAll("*").remove();
  
	// Generate the thresholds
	var thresholdValues = d3.range(0, 2 * Math.PI,  Math.PI / numBins);

	console.log(thresholdValues);
	// Create a histogram object
	var bins = d3.histogram()
		.thresholds(thresholdValues)
		(angles);
		
	// Bin radius constant 
	var binRadConstant = barHeight / angles.length;

	// Normalize the histogram bin values
	for (i = 0; i < bins.length; ++i) {
		console.log("HERE " + bins[i].length);

		bins[i].binHeight = bins[i].length * binRadConstant;
	}

	console.log(bins);

	var barScale = d3.scaleLinear()
		.range([0, barHeight])
		.domain(d3.extent(bins, function(d){  return d.length; }));

	var x = d3.scaleLinear()
		.range([barHeight, 0])
		.domain(d3.extent(bins, function(d){  return d.length; }));


	var leftAxis = d3.axisLeft(x);

	var labels = bins.map(
		function (d, i) {
			// return (d.x0 / Math.PI * 180).toFixed(1) + " - " + (d.x1 / Math.PI * 180).toFixed(1) + "\xB0";
			return (i * 180 / numBins).toFixed(1) + " - " + ((i + 1) * 180 / numBins).toFixed(1) + "\xB0";
		}
	);

	console.log("My Labels:\n" + labels);

		
	// Create the actual bins
	var arc = d3
		.arc()
        // .startAngle(function(d) { return d.x0; })
        // .endAngle(function(d) { return d.x1; })
        .startAngle(function(d, i) { return i * Math.PI / numBins; })
        .endAngle(function(d, i) { return (i + 1) * Math.PI / numBins; })
        .innerRadius(0)
        .outerRadius( function(d) { return barScale(d.length); });
		
	var outlineArc = d3.arc()
		.innerRadius(0)
		.outerRadius(barHeight)
		.startAngle(0)
		.endAngle(2.0 * Math.PI);

    svg.selectAll("solidArc")
		//.data(pie(bins))
		.data(bins)
		.enter()
			.append("path")
			.attr("class", "solidArc")
			.attr("fill", "#5e7eff")
			.attr("stroke", "gray")
			.attr("d", arc)
			.on('mouseover', function () {
				d3.select(this).style("fill", "#1618ff")
            })
			.on('mouseout', function () {
				d3.select(this).style("fill", "#5e7eff")
            });

    svg.selectAll("circle")
        .data(barScale.ticks(3))
        .enter()
        .append("circle")
        .attr("r", function(d){ return barScale(d); })
        .style("stroke", "gray")
        .style("fill", "none")
		.style("stroke-dasharray", "5,2")
		.style("stroke-width", "2px");

    svg
		.append("path")
		.attr("class", "outlineArc")
		.attr("fill", "none")
		.attr("stroke", "gray")
		.attr("d", outlineArc);

    svg
		.append("g")
		.attr("transform", "translate(0," + -barHeight + ")")
		.call(leftAxis);


    svg.selectAll("line")
		.data(bins)
		.enter()
		.append("line")
		.style("stroke", "gray")
		.style("stroke-dasharray", "1,3")
		.attr("y2", -barHeight - 20)
        .attr("transform", function(d, i) { return "rotate(" + (i * 360 / numBins) + ")"; });

    // Set the radius
    var labelRadius = barHeight * 1.025;

    var labs = svg.append("g")
        .classed("labels", true);

    labs.append("def")
		.append("path")
		.attr("id", "label-path")
		.attr("d", "m0 " + -labelRadius + " a " + labelRadius + " " + labelRadius + " 0 1,1 -0.01 0");

    labs.selectAll("text")
		.data(labels)
		.enter()
		.append("text")
		.style("text-anchor", "middle")
		.append("textPath")
		.attr("xlink:href", "#label-path")
		.attr("startOffset", function(d, i) { return i * 100 / numBins + 50 / numBins + "%"; })
		.text(function (d) { return d; });

}

function resize() {
  viewWidth = window.innerWidth;
  viewHeight = window.innerHeight - marginBottom;
  
  d3.select("svg")
    .attr("width", viewWidth)
    .attr("height", viewHeight)
  
  svg.attr("transform", "translate(" + viewWidth/2 + "," + viewHeight/2 + ")");
  
  barHeight = Math.min(viewWidth, viewHeight) / 2 - 40;

  drawHistogram();
}

function setNumberOfBins() {
  numBins = parseInt(document.getElementById("numBins").value);
  drawHistogram();
}


drawHistogram();

// ===== TIPS:

// lookup d3.layout.histogram, it allows you to easily bin input data
// lookup d3.svg.arc to create circle segments
