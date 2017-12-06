var viewWidth = window.innerWidth;
var viewHeight = window.innerHeight;
d3.select(window).on("resize", resize);

var margin = {top: 20, right: 40, bottom: 30, left: 40};
var width = viewWidth - margin.left - margin.right - 50;
var height = viewHeight - margin.top - margin.bottom - 50;

/* Define some offsets */
var xOffset = 15;

// get the data
var boats = boat_data.boats;

var points;

/* Define a paading of 20px */
var padding = 20;

/* Define the size of a scatter plot */
var scatterPlotSize = 230;

/* Create a template for the left axis */
var scaleLeft = d3.scaleLinear()
    .range([scatterPlotSize - padding / 2, padding / 2]);

var leftAxis = d3.axisLeft(scaleLeft)
    .ticks(6);


/* Create a template for the bottom axis */
var scaleBottom = d3.scaleLinear()
    .range([padding / 2, scatterPlotSize - padding / 2]);

var bottomAxis = d3.axisBottom(scaleBottom)
    .ticks(6);

function getDomainAndFeatureNr(data, excludedFeatures) {

	/* Initiate a domain variable */
	var domain = {};
	/* Get the name of the features, which are not excluded */
	var featureNames = d3.keys(data[0]).filter(function (d) { return excludedFeatures.indexOf(d) < 0; });
	/* Get the number of features */
	var featureNumber = featureNames.length;

	/* Build a map of the domain of each feature */
    featureNames.forEach(function(name) {
		domain[name] = d3.extent(data, function (d) { return d[name] });
	});

	/* return the triplet consisting of the domain, the names of the features, and the number of features */
	return [domain, featureNames, featureNumber];
}

function drawScatterplot(data, excludedFeatures = []) {
	/* remove what was previously in this SVG */
	d3.select("#plotSVG").remove();

	/* Get some info on the data */
	var res = getDomainAndFeatureNr(data, excludedFeatures);
	var domains = res[0],
		featureNames = res[1],
		featureNumber = res[2];

    /* Create a brush */
    // var brush = d3.brush()
    //     .on("brush start", brushStart)
    //     .on("brush", brushMove)
    //     .on("brush end", brushEnd);

    console.log(res);

    var distanceToBottom = scatterPlotSize * featureNumber;

    /* Start adding elements */
    var svg = d3
        .select("svg")
		.attr("id", "plotSVG")
        .attr("width", distanceToBottom + padding)
        .attr("height", distanceToBottom + padding)
        .attr("transform", "translate(" + padding + ", " + padding / 2 + ")");


	svg.selectAll("xAxis")
		.data(featureNames)
		.enter()
		.append("g")
		.attr("class", "x_axis")
		.attr("transform", function(d, i) { return "translate(" + ((i * scatterPlotSize) + 15) + ", " + (distanceToBottom - padding / 2) + ")" })
		.each(function(d) { scaleBottom.domain(domains[d]); d3.select(this).call(bottomAxis); });

	svg.selectAll("yAxis")
        .data(featureNames)
        .enter()
        .append("g")
        .attr("class", "y_axis")
        .attr("transform", function(d, i) { return "translate(" + 25 + ", " + ((featureNumber - 1 - i) * scatterPlotSize) + ")" })
        .each(function(d) { scaleLeft.domain(domains[d]); d3.select(this).call(leftAxis); });

	/* Define a Curry-like function */
	var curryPlot = function(p) {
        plotCellAndPoints(this, domains, data, p);
	};

	/* Cartesian product the names of the relevant features */
	var plotsData = cartesianProduct(featureNames, featureNames);

	/* Create each of the cells, and then plot the points within it */
	var cells = svg.selectAll("cell")
				.data(plotsData)
				.enter()
				.append("g")
				.attr("class", "cell")
				.attr("transform", function(d) { return "translate(" + (d.i * scatterPlotSize + 15) + ", " + (featureNumber - d.j - 1) * scatterPlotSize + ")"; })
				.each(curryPlot);

	/* Add a label to the cells found on the secondary diagonal of the scatter plot matrix */
	cells.filter(function(d) { return d.i === d.j; })
		.append("text")
		.attr("x", padding)
		.attr("y", padding)
		.attr("dy", ".71em")
        .style("fill", "red")
		.text(function(d) { return d.iName; });

	//cells.call(brush);

	/*  */
    /* The brushCell variable will hold the cell currently selected by the brush */
    var brushCell;

    function brushStart(p) {
        if (brushCell !== this) {
            d3.select(brushCell).call(brush.clear());
            scaleBottom.domain(domains[p.iName]);
            scaleLeft.domain(domains[p.jName]);
            brushCell = this;
        }
    }

    function brushMove(p) {
        var e = brush.extent();

        console.log(e);

        svg.selectAll("circle").classed("hidden", function(d) {
            return e[0][0] > d[p.x] || d[p.x] > e[1][0]
                || e[0][1] > d[p.y] || d[p.y] > e[1][1];
        });
    }

    // If the brush is empty, select all circles.
    function brushEnd() {
        if (brush.empty()) svg.selectAll(".hidden").classed("hidden", false);
    }

}
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function cartesianProduct(featureSetA, featureSetB) {
	var collection = [];

	for (var i = 0; i < featureSetA.length; ++i)
		for (var j = 0; j < featureSetB.length; ++j)
			collection.push(
				{
					// x: data[featureSetA[i]],
					// y: data[featureSetB[j]],
                    iName: featureSetA[i],
                    jName: featureSetB[j],
					i: i,
					j: j
				}
			);

	return collection;
}


function plotCellAndPoints(caller, domains, data, p) {
    var cell = d3.select(caller);

    console.log(cell);

    cell.append("rect")
        .attr("class", "frame")
        .attr("x", padding / 2)
        .attr("y", padding / 2)
        .attr("height", scatterPlotSize - padding)
        .attr("width", scatterPlotSize - padding);

    scaleBottom.domain(domains[p.iName]);
    scaleLeft.domain(domains[p.jName]);

    cell.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "circle")
        .attr("cx", function (d) { return scaleBottom(d[p.iName]); })
        .attr("cy", function (d) { return scaleLeft(d[p.jName]); })
        .attr("r", 3)
        .style("fill", getRandomColor());
}

function resize() {
  viewWidth = window.innerWidth;
  viewHeight = window.innerHeight;

  width = viewWidth - margin.left - margin.right - 50;
  height = viewHeight - margin.top - margin.bottom - 50;

  drawScatterplot(boats);
}

function changedSelect() {
	var selectionElements = document.getElementsByClassName("select-item");

	x = selectionElements[0].value;
	y = selectionElements[1].value;
	c = selectionElements[2].value;

	console.log(x);
	console.log(y);
	console.log(c);

    //rearrangePoints(x, y, c);
}

drawScatterplot(boats);
