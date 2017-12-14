var viewWidth = window.innerWidth;
var viewHeight = window.innerHeight;
d3.select(window).on("resize", resize);

var margin = {top: 20, right: 20, bottom: 30, left: 40};
var w = viewWidth - margin.left - margin.right;
var h = viewHeight - margin.top - margin.bottom;

var svg = d3.select("svg")
    .attr("width", viewWidth)
    .attr("height", viewHeight)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function drawLegend(colorScale) {
    var legendRectSize = 18;
    var legendRectHeight = 280;
    var legendSpacing = 4;
    var rectY = 50;
    var rectX = 10;

    var gradient = svg.append("linearGradient")
        .attr("id", "svgGradient")
        .attr("x1", "0%")
        .attr("x2", "0%")
        .attr("y1", "0%")
        .attr("y2", "100%");

    gradient.append("stop")
        .attr('class', 'start')
        .attr("offset", "0%")
        .attr("stop-color", "red")
        .attr("stop-opacity", 1);

    gradient.append("stop")
        .attr('class', 'end')
        .attr("offset", "100%")
        .attr("stop-color", "green")
        .attr("stop-opacity", 1);

    var legend = d3.select('svg')
        .append("g")
        .selectAll("g")
        .data(colorScale.domain())
        .enter()
        .append('g')
        .attr('class', 'legend');

    legend.append('rect')
        .attr("y", rectY)
        .attr("x", rectX)
        .attr('width', legendRectSize)
        .attr('height', legendRectHeight)
        .style('fill', "url(#svgGradient)")
        .attr("stroke", "url(#svgGradient)");

    legend.append('text')
        .attr('x', rectX + legendRectSize + legendSpacing)
        .attr('y', function (d, i) {
            return i * legendRectHeight + rectY + 4;
        })
        .text(function (d) {
            return Math.round(d);
        });
}

function drawAxis(xScale, yScale) {
    var xAxis = d3.axisBottom()
        .scale(xScale);

    var yAxis = d3.axisLeft()
        .scale(yScale);

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (h / 2) + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + margin.left + ", 0)")
        .call(yAxis);
}

function drawPoints(d, xScale, yScale, colorScale, colorNumberScale) {
    svg.selectAll("circle")
        .data(d)
        .enter()
        .append("circle")
        .attr("cx", function (d) {
            return xScale(d.x);
        })
        .attr("cy", function (d) {
            return yScale(d.y);
        })
        .attr("r", 8)
        .attr("fill", function (d) {
            return colorScale(d.u);
        })
        .on('mouseover', function (d) {
            console.log(colorNumberScale(d.u));

            var transitionTime = 300;
            d3.select(this)
                .transition()
                .duration(transitionTime)
                .attr("r", colorNumberScale(d.u));

            svg
                .append("text")
                .transition()
                .attr("class", "tip")
                .delay(transitionTime - 0.4 * transitionTime)
                .text(Math.round(d.x) + "," + Math.round(d.y) + ", color= " + Math.round(d.u))
                .attr("x", xScale(d.x) + colorNumberScale(d.u))
                .attr("y", yScale(d.y));
        })

        .on('mouseout', function (d) {
            var transitionTime = 150;
            svg.selectAll("text").filter(".tip")
                .remove();

            d3.select(this)
                .transition()
                .duration(transitionTime)
                .attr("r", 8);
        });
}

function drawScatterplot() {
    var d = boat_data.boats;
    var xScale = d3.scaleLinear()
        .domain([0, d3.max(d, function (data) {
            return data.x;
        })])
        .range([margin.left, w - 50]);

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(d, function (data) {
            return data.y;
        })])
        .range([h / 2, 50]);

    var minColor = d3.min(d, function (data) {
        return data.u;
    });
    var maxColor = d3.max(d, function (data) {
        return data.u;
    });

    var colorScale = d3.scaleLinear()
        .domain([minColor, maxColor])
        .range(["red", "green"]);


    var colorNumberScale = d3.scaleLinear()
        .domain([minColor, maxColor])
        .range([8, 20]);


    drawAxis(xScale, yScale);
    drawPoints(d, xScale, yScale, colorScale, colorNumberScale);
    drawLegend(colorScale);
}

function resize() {
    //This function is called if the window is resized
    //You can update your scatterplot here
    viewWidth = window.innerWidth;
    viewHeight = window.innerHeight;
}


drawScatterplot();


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
