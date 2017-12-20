function updateScatterplot(data, color_function, color_domain) {
    d3.select('#vis').selectAll('.dot').remove();
    drawScatterplot(data, color_function, color_domain);
}

var xScale;
var yScale;
var svg;

function initTsneScatter(data, color_function, color_domain) {

    var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;


    svg = d3.select("#vis")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    xScale = d3.scaleLinear()
        .domain(d3.extent(data, function (d) {
            return d['tsne-x'];
        })).nice()
        .range([0, width]);

    yScale = d3.scaleLinear()
        .domain(d3.extent(data, function (d) {
            return d['tsne-y'];
        })).nice()
        .range([height, 0]);

    var xAxis = d3.axisBottom()
        .scale(xScale);

    var yAxis = d3.axisLeft()
        .scale(yScale);


    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("Sepal Width (cm)");

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Sepal Length (cm)");

    var legend = svg.selectAll(".legend")
        .data(color_domain)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) {
            return "translate(0," + i * 20 + ")";
        });

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function (d, i) {
            return color_function(i);
        });

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function (d, i) {
            return "Category " + (i + 1);
        });
}

function drawScatterplot(data) {


    svg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 3.5)
        .attr("cx", function (d) {
            return xScale(d['tsne-x']);
        })
        .attr("cy", function (d) {
            return yScale(d['tsne-y']);
        })
        .style("fill", function (d) {
            return d['category'];
        });


}
