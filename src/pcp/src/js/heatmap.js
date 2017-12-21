var margin = { top: 50, right: 0, bottom: 100, left: 30 };
var colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"]; // alternatively colorbrewer.YlGnBu[9]


window.drawHeatmap = function(data, featureNames, bucketNumber) {
    var chart = d3.select('#headingFive');
    var targetWidth = chart.node().getBoundingClientRect().width - margin.left - margin.right;
    var sqSize = Math.floor(targetWidth / (3 * featureNames.length));
    var targetHeight = sqSize * featureNames.length + (3.5 * margin.bottom);
    var legendElementWidth = sqSize * 2;

    var svg = d3
        .select("#corr-heatmap")
        .append("svg")
            .attr("width", targetWidth + margin.left + margin.right)
            .attr("height", targetHeight + margin.top + margin.bottom)
        .append("g")
            .attr("id", "g-heat-map")
            .attr("transform", "translate(" + margin.left + "," + (margin.top / 2) + ")");

    svg.selectAll(".featureLabelBottom")
        .data(featureNames)
        .enter()
        .append("text")
        .text(function (d) { return d; })
        .attr("x", 0)
        .attr("y", function (d, i) { return i * sqSize; })
        .style("text-anchor", "end")
        .attr("transform", "translate(" + (sqSize * 3.5) + "," + (sqSize * featureNames.length + 5) +")rotate(-90)");

    svg.selectAll(".featureLabelLeft")
        .data(featureNames)
        .enter()
        .append("text")
        .text(function(d) { return d; })
        .attr("y", function(d, i) { return i * sqSize; })
        .attr("x", 0)
        .style("text-anchor", "end")
        .attr("transform", "translate(" + (3 * sqSize - 5) + "," + margin.top +")");

    // This is temporary, i.e. the price column should be replaced with the correlation column
    var correlationColumnName = 'price';

    var matMax = d3.max(data, function(d, i) {
        return d[i];
    });

    var colorScale = d3
            .scaleQuantile()
            .domain([0, bucketNumber - 1, matMax])
            .range(colors);

    for (var i = 0; i < featureNames.length; ++i)
        for (var j = 0; j <= i; ++j) {


            svg
                .append("rect")
                .attr("class", "correlationSquare")
                .attr("x", j * sqSize)
                .attr("y", i * sqSize)
                .attr("rx", 4)
                .attr("ry", 4)
                // .attr("class", "hour bordered")
                .attr("width", sqSize)
                .attr("height", sqSize)
                .style("fill", colorScale(data[i][j]))
                .attr("transform", "translate(" + (sqSize * 3) + "," + 0 +")")
                .append("title").text(data[i][j]);
        }

    var cards = svg
        .selectAll(".correlationSquare");

    cards.exit().remove();

    var legend = svg.selectAll(".legend")
        .data([0].concat(colorScale.quantiles()), function(d) { return d; });

    legend.enter().append("g")
            .attr("class", "legend")
        .append("rect")
            .attr("x", function(d, i) { return legendElementWidth * i; })
            .attr("y", 0)
            .attr("width", legendElementWidth)
            .attr("height", sqSize / 2)
            .style("fill", function(d, i) { return colors[i]; });

    legend.append("text")
        .attr("class", "mono")
        .text(function(d) { return "≥ " + Math.round(d); })
        .attr("x", function(d, i) { return legendElementWidth * i; })
        .attr("y", targetHeight + sqSize);

    legend.exit().remove();
};
