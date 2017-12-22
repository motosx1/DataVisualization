function Main() {
    self = this;

    // Data
    self._data = []
    self._data_selected = []


    // Charts
    self._pcp = null;
    self._donutMakes = null;
    self._donutTotals = null;
    self._legend = null;
    self._dataTable = null;
    self._stats = null;

    self.c_normal = ['#e41a1c', '#377eb8', '#4daf4a'];
    self.c_blind = ['#1b9e77', '#d95f02', '#7570b3'];
    self.c_map = null;

    self.init();
}

Main.prototype = {
    init: function (csvFile) {
        console.debug("Main: init");
        d3.csv("./data/car_data.csv", function (d) {
            return {
                'id': d['id'],
                'make': d['make'],
                'fuel-type': d['fuel_type'],
                'length': +d['length'],
                'width': +d['width'],
                'weight': +d['curb_weight'],
                'cylinders': +d['num_of_cylinders'],
                'engine-size': +d['engine_size'],
                'fuel-system': d['fuel_system'],
                'compression': +d['compression_ratio'],
                'horsepower': +d['horsepower'],
                'city-mpg': +d['city_mpg'],
                'highway-mpg': +d['highway_mpg'],
                'price': +d['price']
            };
        }, function (data) {

            self._data = data;
            self._data_selected = self._data.slice();
            self.setupCharts();

        });

    },

    setupCharts: function () {

        self.c_map = smartZip(self.c_normal, self.c_blind);

        $("#colorblindbutton").click(function () {
            if ($("#colorblindbutton").hasClass("selected"))
                $("#colorblindbutton").removeClass("selected");
            else
                $("#colorblindbutton").addClass("selected");

            self.changeColor();
        });

        $("#zoom-in-tsne").click(function () {
            if ($("#zoom-in-tsne").hasClass("clicked")) {
                $("#zoom-in-tsne").removeClass("clicked");
                $("#zoom-in-tsne").text("Zoom In Brush");
                changeBrush(false);
            } else {
                $("#zoom-in-tsne").addClass("clicked");
                $("#zoom-in-tsne").text("Selection Brush");
                changeBrush(true);
            }

        });

        var initial_array = toNestedArray(self._data);
        var reduced_tsne = reduceDimTSNE(initial_array);
        var clusters = clusterKMeans(initial_array);
        var tsne_clusters = toObjects(reduced_tsne, clusters);

        self._data.forEach(function (p, i) {
            p['category'] = self.color(tsne_clusters[i]['category']);
            p['tsne-x'] = tsne_clusters[i].x;
            p['tsne-y'] = tsne_clusters[i].y;
        });

        var colorScheme = $("#colorblindbutton").hasClass("selected") ? self.c_normal : self.c_blind;
        initTsneScatter(self._data, self.color, colorScheme);
        drawScatterplot(self._data, self.color, colorScheme);

        self._pcp = parallelCoordinatesChart("pcp", self._data, self.callback_updateCharts);

        /* Get the feature names, and whilst excluding the columns added for the t-sne plot */
        var names = getFeatureNames(self._data, ['tsne-x', 'tsne-y']);

        /* Draw the scatterplot matrix */
        self._scatterPlot = drawScatterplotMatrix(self._data, self.callback_updateCharts, names);

        /* Add the buttons for selecting and deselecting features for Scatterplot Matrix plotting */
        addButtons(names);

        /* Draw the heatmap */
        drawHeatmap(computeCorrelationMatrix(self._data, names), names);
    },

    color: function (i) {
        var colorScheme = $("#colorblindbutton").hasClass("selected") ? self.c_normal : self.c_blind;
        return colorScheme[i % 3];
    },

    changeColor: function () {
        self._data.forEach(function (d) {
            d['category'] = self.c_map.get(d['category']);
        });


        changeToNewSchemeScatterPlot();
        updateParallelCoordinatesChart(self._data);
        var colorScheme = $("#colorblindbutton").hasClass("selected") ? self.c_normal : self.c_blind;

        updateScatterplot(self._data, self.color, colorScheme);
    },


    callback_updateCharts: function (selected_data, source_name) {
        var colorScheme = self.colorBlindFlag ? self.c_blind : self.c_normal;
        switch (source_name.toUpperCase()) {
            case "PCP":
                updateScatterplot(selected_data, self.color, colorScheme);
                selectDataByIndex(selected_data);
                break;
            case "TSNE":
                selectDataByIndex(selected_data);
                updateParallelCoordinatesChart(selected_data);
                break;
            case "SPM":
                updateScatterplot(selected_data, self.color, colorScheme);
                updateParallelCoordinatesChart(selected_data);
                break;
            default:
                updateScatterplot(selected_data, self.color, colorScheme);
                updateParallelCoordinatesChart(selected_data);
                selectDataByIndex(selected_data);

        }
    }


}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function smartZip(arrayA, arrayB) {
    var finalData = new Map();


    arrayA.forEach(function (d, i) {
        finalData.set(d, arrayB[i]);
        finalData.set(arrayB[i], d);
    });

    console.log(finalData);

    return finalData;
}

function computeCorrelationMatrix(data, names) {
    var heatmapMatrix = new Array(names.length);
    var colArray = [];

    for (var i = 0; i < names.length; ++i)
        colArray.push(data.map(function (t) { return t[names[i]]; }));

    console.log("Col Array: ");
    console.log(colArray);


    for (var i = 0; i < names.length; ++i) {
        heatmapMatrix[i] = new Array(names.length);

        for (var j = 0; j < names.length; ++j)
            heatmapMatrix[i][j] =  getPearsonCorrelation(colArray[i], colArray[j]);
    }

    console.log(heatmapMatrix);

    return heatmapMatrix;
}
