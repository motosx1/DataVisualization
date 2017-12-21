function updateScatterplot(data, color_function, color_domain) {
    d3.select('#tsne')
        .selectAll('.dot')
        .remove();
    d3.selectAll(".rect").style("fill", function (d, i) {
        return color_function(i);
    });
    drawScatterplot(data, color_function, color_domain);
}



var xScale;
var yScale;
var svg;

function initTsneScatter(data, color_function, color_domain) {
    var chart = d3.select("#headingThree"),
        targetWidth = chart.node().getBoundingClientRect().width;

    var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = targetWidth - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;


    svg = d3.select("#tsne")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xExtent = d3.extent(data, function (d) {
        return d['tsne-x'];
    });

    var yExtent = d3.extent(data, function (d) {
        return d['tsne-y'];
    });

    xScale = d3.scaleLinear()
        .domain(xExtent).nice()
        .range([0, width]);

    yScale = d3.scaleLinear()
        .domain(yExtent).nice()
        .range([height, 0]);

    var color = d3.scaleOrdinal(d3.schemeCategory20);

    var xAxis = d3.axisBottom()
        .scale(xScale);

    var yAxis = d3.axisLeft()
        .scale(yScale);

    var idle;
    var idleTime = 350;
    var brush = d3
        .brush()
        .on("end", brushEnd);

    svg.append("g").attr("class", "brush").call(brush);

    svg.append("g")
        .attr("class", "x-axis-tsne")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("Reduction 1");

    svg.append("g")
        .attr("class", "y-axis-tsne")
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Reduction 2");

    var legend = svg.selectAll(".legend")
        .data(color_domain)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) {
            return "translate(0," + i * 20 + ")";
        });

    legend.append("rect")
        .attr("class", "rect")
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


    function brushEnd() {
        /* If the selection is null, and we have a double click, reset the scale, and implicitly the graph */
        if (!d3.event.selection) {
            if (!idle)
                return idle = setTimeout(idled, idleTime);

            xScale.domain(xExtent);
            yScale.domain(yExtent);
        } else {
            /* Otherwise, adjust the scale such that it will not focus on the area encompassed by the brush drag */
            xScale.domain([d3.event.selection[0][0], d3.event.selection[1][0]].map(xScale.invert, xScale));
            yScale.domain([d3.event.selection[1][1], d3.event.selection[0][1]].map(yScale.invert, yScale));
            svg.select(".brush").call(brush.move, null);
        }
        /* Perform the zoom-in operation (or zoom-out in case of double click) */
        zoom();
    }

    function zoom() {
        var duration = 400;

        /* Adapt the axes to the new scales*/
        svg.select(".x-axis-tsne").transition().duration(duration).call(xAxis);
        svg.select(".y-axis-tsne").transition().duration(duration).call(yAxis);

        /* Adapt the circles to the new scales */
        svg
            .selectAll('.dot')
            .transition().duration(duration)
            .attr("cx", function (d) {
                return xScale(d['tsne-x']);
            })
            .attr("cy", function (d) {
                return yScale(d['tsne-y']);
            });
    }

    function idled() {
        idle = null;
    }

}

function drawScatterplot(data, color_function, color_domain) {
    svg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 3.5)
        .attr("cx", function(d) { return xScale(d['tsne-x']); })
        .attr("cy", function(d) { return yScale(d['tsne-y']); })
        .style("fill", function(d) { return d.category; })
        .on('mouseover', function (d) {
            var transitionTime = 100;

            svg.selectAll("text").filter(".tip")
                .remove();

            svg.append('text')
                .transition()
                .attr("class", "tip")
                .delay(transitionTime - 0.4 * transitionTime)
                .text("make: " + d.make
                      + ", fuel type: " + d['fuel-type']
                      + ", horsepower: " + d.horsepower
                      + ", city mpg: " + d['city-mpg']
                      + ", price: " + d.price)
                .attr("x", 20)
                .attr("y", 10);

            d3.select(this)
                .transition()
                .duration(transitionTime)
                .attr("r", 10);
        })
        .on('mouseout', function (d) {
            var transitionTime = 100;

            svg.selectAll("text").filter(".tip")
                .remove();

            d3.select(this)
                .transition()
                .duration(transitionTime)
                .attr("r", 4);
        });
}
