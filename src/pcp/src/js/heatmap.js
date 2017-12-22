var margin = { top: 50, right: 0, bottom: 100, left: 30 };
var colors = ['#b2182b','#d6604d','#f4a582','#fddbc7','#f7f7f7','#d1e5f0','#92c5de','#4393c3','#2166ac']; // alternatively colorbrewer.YlGnBu[9]


/**
 * Plot the heatmap
 *
 * @param a matrix containing the feautre correlations
 * @param featureNames the names of the features in data which will be plotted
 */
window.drawHeatmap = function(data, featureNames) {
    var chart = d3.select('#headingFive');
    var targetWidth = chart.node().getBoundingClientRect().width - margin.left - margin.right;
    var sqSize = Math.floor(targetWidth / (3 * featureNames.length));
    var targetHeight = sqSize * featureNames.length + (3.5 * margin.bottom);
    var legendElementWidth = sqSize * 2;

    /* Create an SVG element associated to the heatmap */
    var svg = d3
        .select("#corr-heatmap")
        .append("svg")
            .attr("id", "g-heat-map-svg")
            .attr("width", (sqSize * featureNames.length * 2) + margin.left + margin.right)
            .attr("height", targetHeight + margin.top + margin.bottom)
        .append("g")
            .attr("id", "g-heat-map")
            .attr("transform", "translate(" + margin.left + "," + (margin.top / 2) + ")");

    /* Create the bottom feature labels */
    svg.selectAll(".featureLabelBottom")
        .data(featureNames)
        .enter()
        .append("text")
        .text(function (d) { return d; })
        .attr("x", 0)
        .attr("y", function (d, i) { return i * sqSize; })
        .style("text-anchor", "end")
        .attr("transform", "translate(" + (sqSize * 3.5) + "," + (sqSize * featureNames.length + 5) +")rotate(-90)");

    /* Create the left feature labels */
    svg.selectAll(".featureLabelLeft")
        .data(featureNames)
        .enter()
        .append("text")
        .text(function(d) { return d; })
        .attr("y", function(d, i) { return i * sqSize; })
        .attr("x", 0)
        .style("text-anchor", "end")
        .attr("transform", "translate(" + (3 * sqSize - 5) + "," + margin.top +")");

    /* Redundant, but still done: get the min and max values from the matrix */
    var matMax = d3.max(data, function(d, i) {
        return d[i];
    });

    var matMin = d3.min(data, function(d, i) {
        return d[i];
    });

    console.log("Max and min " + matMax + ", " + matMin);

    /* Create a color scale which maps values in the interval [-1, 1] to the divergent color scheme */
    var colorScale = d3
            .scaleQuantile()
            .domain([-1, 1])
            .range(colors);

    /* Create a rectangle for each of the unique pairs of features */
    for (var i = 0; i < featureNames.length; ++i)
        for (var j = 0; j <= i; ++j)
            svg
                .append("rect")
                .attr("class", "correlationSquare")
                .attr("x", j * sqSize)
                .attr("y", i * sqSize)
                .attr("rx", 4)
                .attr("ry", 4)
                .attr("width", sqSize)
                .attr("height", sqSize)
                .style("fill", colorScale(data[i][j]))
                .attr("transform", "translate(" + (sqSize * 3) + "," + 0 +")")
                .append("title").text(data[i][j]);


    var cards = svg
        .selectAll(".correlationSquare");

    cards.exit().remove();

    /* Create an element which corresponds to the legend */
    var legend = svg
        .selectAll(".legend")
        .data([0].concat(colorScale.quantiles()), function(d) { return d; })
        .enter()
        .append("g")
        .attr("class", "legend");

    /* For each of the bins, create a rectangular element in the legend, and add its color */
    legend
        .append("rect")
            .attr("x", function(d, i) { return legendElementWidth * i; })
            .attr("y", targetHeight)
            .attr("width", legendElementWidth)
            .attr("height", sqSize / 2)
            .style("fill", function(d, i) { return colors[i]; });

    /* Assign the labels to the legend */
    legend
        .append("text")
            .attr("class", "heat-font")
            .text(function(d) { return "≥ " + d3.format(".3g")(d); })
            .attr("x", function(d, i) { return legendElementWidth * i; })
            .attr("y", targetHeight + sqSize);

    legend.exit().remove();
};
