var viewWidth = window.innerWidth;
var viewHeight = window.innerHeight;
// d3.select(window).on("resize", resize);

var margin = {top: 20, right: 40, bottom: 30, left: 40};
var width = viewWidth - margin.left - margin.right - 50;
var height = viewHeight - margin.top - margin.bottom - 50;

// get the data
var boats;

/* Define a paading of 20px */
var padding = 20;

/* Define the size of a scatter plot */
var scatterPlotSize = 230;

/* Create a template for the left axis */
var scaleLeft = d3.scaleLinear()
    .range([scatterPlotSize - padding / 2, padding / 2]);

var leftAxis = d3.axisLeft(scaleLeft);

/* Create a template for the bottom axis */
var scaleBottom = d3.scaleLinear()
    .range([padding / 2, scatterPlotSize - padding / 2]);

var bottomAxis = d3.axisBottom(scaleBottom);

var totalFeatures;

var mainData;

var baseLeftOffset = 40;

var updateCallback;

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

function rescaleCoords(total) {
    var chart = d3.select('#headingFour');
    var targetWidth = chart.node().getBoundingClientRect().width;

    scatterPlotSize = targetWidth / total - padding;

    /* Create a template for the left axis */
    scaleLeft = d3.scaleLinear()
        .range([scatterPlotSize - padding / 2, padding / 2]);

    leftAxis = d3.axisLeft(scaleLeft)
        .ticks(6);

    /* Create a template for the bottom axis */
    scaleBottom = d3.scaleLinear()
        .range([padding / 2, scatterPlotSize - padding / 2]);

    bottomAxis = d3.axisBottom(scaleBottom)
        .ticks(3);
}

function createBins(data, featureNames, binNumber) {

	var bins = [];

	for (var i = 0; i < featureNames.length; ++i) {

		var currentExtent = d3.extent(data, function(d) { return d[featureNames[i]]; });
		//currentExtent = [Math.ceil(currentExtent[0] / 100) * 100, Math.ceil(currentExtent[1] / 100) * 100];
        ////console.log("Asd1: " + currentExtent);

        // Generate the thresholds
        currentExtent = d3.range(currentExtent[0], currentExtent[1],  Math.abs(currentExtent[1] - currentExtent[0]) / binNumber);

        ////console.log("Asd2: " + currentExtent);
		////console.log(d3.ticks(currentExtent[0], currentExtent[1], 10));

		bins.push(
			d3
				.histogram()
				.thresholds(currentExtent)
				(data.map(function(d) { return d[featureNames[i]]; } )) // , function(d) { return d[featureNames[i]]; }
		);

	}

	////console.log("The bins");
	////console.log(bins);


	return bins;
}

window.drawScatterplotMatrix = function(data, callback = null, selectedFeatures = [], excludedFeatures = []) {
	/* remove what was previously in this SVG */
	d3.select("#plotSVG").remove();

    mainData = data;

    rescaleCoords(selectedFeatures.length);
    //addButtons(selectedFeatures);
    totalFeatures = selectedFeatures;

    updateCallback = callback;

	////console.log("HERE");
	////console.log(data);

	/* Get some info on the data */
	var res = getDomainAndFeatureNr(data, excludedFeatures);
	var domains = res[0];
	var featureNames = getCommonSet(res[1], selectedFeatures);
    var featureNumber = res[2] < selectedFeatures.length ? res[2] : selectedFeatures.length;

    var bins = createBins(data, featureNames, 10);

    /* Create a brush */
    var brush = d3.brush()
		.extent(function() {
			return [[scaleBottom.range()[0], scaleLeft.range()[1]], [scaleBottom.range()[1], scaleLeft.range()[0]]]
		})
        .on("start", brushStart)
        .on("brush", brushMove)
        .on("end", brushEnd);

    ////console.log(res);

    var distanceToBottom = scatterPlotSize * featureNumber;

    leftAxis.tickSize(-distanceToBottom);
    bottomAxis.tickSize(-distanceToBottom);


    //console.log("The current distanceToBottom is " + distanceToBottom);

    /* Start adding elements */
    var svg = d3
		.select("#vis-scatter-matrix")
        .append("svg")
		.attr("id", "plotSVG")
        .attr("width", distanceToBottom + padding * 3)
        .attr("height", distanceToBottom + padding)
        .attr("transform", "translate(" + padding + ", " + padding / 2 + ")");


	var xAxes = svg.selectAll("xAxis")
				.data(featureNames)
				.enter()
					.append("g")
					.attr("class", "x_axis")
					.attr("transform", function(d, i) { return "translate(" + ((i * scatterPlotSize) + baseLeftOffset) + ", " + (distanceToBottom - padding / 2) + ")" })
					.each(function(d) { scaleBottom.domain(domains[d]); d3.select(this).call(bottomAxis.ticks(3).tickFormat(d3.formatPrefix(".0", 1e2))); })
				.append("text")
					.attr("class", "label")
					.attr("x", padding + baseLeftOffset)
					.attr("y", 20)
					.style("text-anchor", "end")
					.text(function(d) { return d.toUpperCase(); } );

	svg.selectAll("yAxis")
        .data(featureNames)
        .enter()
        .append("g")
			.attr("class", "y_axis")
			.attr("transform", function(d, i) { return "translate(" + (baseLeftOffset + 10) + ", " + ((featureNumber - 1 - i) * scatterPlotSize) + ")" })
			.each(function(d) { scaleLeft.domain(domains[d]); d3.select(this).call(leftAxis.ticks(3).tickFormat(d3.formatPrefix(".0", 1e2))); })
        .append("text")
			.attr("class", "label")
			.attr("x", -15)
			.attr("y", -baseLeftOffset)
			.attr("transform", "rotate(-90)")
			.style("text-anchor", "end")
			.text(function(d) { return d.toUpperCase(); } );

	/* Define a Curry-like function */
	var curryPlot = function(p) {
        plotCellAndPoints(this, domains, data, p, bins);
	};

	/* Cartesian product the names of the relevant features */
	var plotsData = cartesianProduct(featureNames, featureNames);

	/* Create each of the cells, and then plot the points within it */
	var cells = svg.selectAll("cell")
				.data(plotsData)
				.enter()
				.append("g")
				.attr("class", "cell")
				/* The constants 16 and 0.5 are used here for corrective purposes, i.e. to properly align the rectangle to the axes */
				.attr("transform", function(d) { return "translate(" + (d.i * scatterPlotSize + baseLeftOffset) + ", " + ((featureNumber - d.j - 1) * scatterPlotSize + 0.5) + ")"; })
				.each(curryPlot);

	/* Add a label to the cells found on the secondary diagonal of the scatter plot matrix */
	// cells.filter(function(d) { return d.i === d.j; })
	// 	.append("text")
	// 	.attr("x", padding)
	// 	.attr("y", padding)
	// 	.attr("dy", ".71em")
	// 	.text(function(d) { return d.iName; });

	cells
		.filter(function (t) { return t.i !== t.j; })
		.call(brush);

    /* The brushCell variable will hold the cell currently selected by the brush */
    var brushCell;

    function brushStart(p) {
        if (brushCell !== this) {
            d3.select(brushCell).call(brush.move, null);
            brushCell = this;
            //brush.move(d3.select(brushCell), null);

            scaleBottom.domain(domains[p.iName]);
            scaleLeft.domain(domains[p.jName]);
        }
    }

    function brushMove(p) {
        var e = d3.brushSelection(this);

        ////console.log("" + e);
        ////console.log(p.iName + " " + p.jName);

        if (!e) {
            svg.selectAll(".circle").classed("hidden", false);

            updateCallback([], "SPM");
        } else {
        	var returnedData = new Set();

            svg.selectAll(".circle").classed("hidden", function (d) {
            	var res = e[0][0] > scaleBottom(d[p.iName]) || scaleBottom(d[p.iName]) > e[1][0] ||
				          e[0][1] > scaleLeft(d[p.jName]) || scaleLeft(d[p.jName]) > e[1][1];
                if (!res)
                	returnedData.add(d);

                return res;
            });

            updateCallback(Array.from(returnedData), "SPM");
        }

    }

    // If the brush is empty, select all circles.
    function brushEnd() {
        if (d3.event.selection === null) {
            svg.selectAll(".hidden").classed("hidden", false);
            updateCallback(data, "SPM");
        }
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


function plotCellAndPoints(caller, domains, data, p, bins) {
    var cell = d3.select(caller);

    ////console.log(cell);

    cell.append("rect")
        .attr("class", "frame")
        .attr("x", padding / 2)
        .attr("y", padding / 2)
        .attr("height", scatterPlotSize - padding)
        .attr("width", scatterPlotSize - padding);

    scaleBottom.domain(domains[p.iName]);
    scaleLeft.domain(domains[p.jName]);

    if (p.i !== p.j)
		cell//.filter(function (d) { return d.i !== d.j; })
			.selectAll("circle")
			.data(data)
			.enter()
			.append("circle")
			.attr("class", "circle")
			.attr("cx", function (d) { return scaleBottom(d[p.iName]); })
			.attr("cy", function (d) { return scaleLeft(d[p.jName]); })
			.attr("r", 2)
			.style("fill", function(d) { return d['category']; });
    else {
    	cell.style("fill", "white");

    	var max = d3.max(bins[p.i], function (d) {
			return d.length;
        });

    	scaleLeft.domain([max, 0]);

        var div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);


        var bars = cell
				.selectAll(".bar")
				.data(bins[p.i])
				.enter()
				.append("g")
				.attr("class", "bar")
				.attr("transform", function(d) { return "translate(" + scaleBottom(d.x0) + ", " + (scaleLeft.range()[0] - scaleLeft(d.length) + 10) + ")"; } )
            .on("mouseover", function(d) {
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html("Range:</br>[" + d3.format(".1f")(d.x0) + "," + d3.format(".1f")(d.x1) + "]</br>Count: " + d.length)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY + 10) + "px");
            })
            .on("mouseout", function(d) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        bars.append("rect")
			.attr("x", 1)
			.style("fill", "#66c2a5")
            .attr("width", function (d) { return scaleBottom(d.x1) - scaleBottom(d.x0) - 1})
            .attr("height", function(d) { /*//console.log("The scale of " + d.length + " " + scaleLeft(d.length));*/  return scaleLeft(d.length) - 10; });
    }

}

function getCommonSet(setA, setB) {
	var finalSet = [];

	setA.sort();
	setB.sort();

	for (var indexA = 0, indexB = 0; indexA < setA.length && indexB < setA.length; ) {
		if (setA[indexA] === setB[indexB]) {
            finalSet.push(setA[indexA]);
            ++indexA;
            ++indexB;
        } else if (setA[indexA] < setB[indexB])
        	++indexA;
		else
			++indexB;
	}

	return finalSet;
}

window.elementSelected = function(element) {
	var value = element.getAttribute("value");
    var index = totalFeatures.indexOf(value);

	////console.log(value);

	if (index >= 0) {
        totalFeatures.splice(index, 1);
    	// element.setAttribute("style", "color: black;");
		$(element).addClass("selected");
	} else {
        totalFeatures.push(value);
    	// element.removeAttribute("style");
        $(element).removeClass("selected");
	}

	////console.log(totalFeatures);

    drawScatterplotMatrix(mainData, updateCallback, totalFeatures);
}


window.getFeatureNames = function(data) {
	var myKeys = d3.keys(data[0]);
	var finalKeys = [];

	for (var i = 0; i < myKeys.length; ++i) {

		var type = typeof data[0][myKeys[i]];

		//console.log("Type:" + type);

		if (type !== "string")
            finalKeys.push(myKeys[i]);

	}

	//console.log("Names: " + finalKeys);

	return finalKeys;
};

window.getFeatureNames = function(data, excluded) {
    var myKeys = d3.keys(data[0]);
    var finalKeys = [];

    for (var i = 0; i < myKeys.length; ++i) {

        var type = typeof data[0][myKeys[i]];

        //console.log("Type:" + type);

        if (type !== "string" && !excluded.includes(myKeys[i]))
            finalKeys.push(myKeys[i]);

    }

    //console.log("Names: " + finalKeys);

    return finalKeys;
};

window.addButtons = function(featureNames) {

	$("#featuresDiv").empty()

    for (var i = 0; i < featureNames.length; ++i) {
		var newElement = "<button onclick='elementSelected(this)' value='" + featureNames[i] + "' class = 'button'>" + featureNames[i] + "</button>";

		$("#featuresDiv").append(newElement);
    }

};

window.selectDataByIndex = function(selectedData) {

	var set = new Set();

	selectedData.forEach(function (d) {
		set.add(d['id']);
    });

    d3
        .select("#vis-scatter-matrix")
		.selectAll(".circle").classed("hidden", function (d) {
		// Waaay too slow
    	// var res = selectedData.reduce(function(acc, e) {return acc || (e['id'] === d['id'])}, false);
    	// //console.log(res);

        return !set.has(d['id']);
    });
};

window.changeToNewSchemeScatterPlot = function() {
    d3
        .select("#vis-scatter-matrix")
        .selectAll(".circle")
        .transition()
        .duration(1000)
        .style("fill", function(d) { return d['category'] });

}