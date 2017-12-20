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

    self.c = ['rgb(255, 127, 14)', 'rgb(31, 119, 180)', 'red'];


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
        var initial_array = toNestedArray(self._data);
        var reduced_tsne = reduceDimTSNE(initial_array);
        var clusters = clusterKMeans(initial_array);
        var tsne_clusters = toObjects(reduced_tsne, clusters);

        self._data.forEach(function (p, i) {
            p['category'] = self.color(tsne_clusters[i]['category']);
            p['tsne-x'] = tsne_clusters[i].x;
            p['tsne-y'] = tsne_clusters[i].y;
        });

        initTsneScatter(self._data, self.color, self.c);
        drawScatterplot(self._data);

        self._pcp = parallelCoordinatesChart2("pcp", self._data, self.callback_updateCharts);

        // Filter out the data which should not be plotted
        var newData = JSON.parse(JSON.stringify(self._data));
        newData.forEach(function(d) {delete d['tsne-x']; delete d['tsne-y'];});
        // console.log("The new Data:" + newData);


        self._scatterPlot = drawScatterplotMatrix(self._data, self.callback_updateCharts, getFeatureNames(self._data, ['tsne-x', 'tsne-y']));
        addButtons(getFeatureNames(self._data, ['tsne-x', 'tsne-y']));
    },

    color: function (i) {
        return self.c[i % 3];
    },

    callback_updateCharts: function (selected_data, source_name) {
        switch (source_name.toUpperCase()) {
            case "PCP":
                updateScatterplot(selected_data, self.color, self.c);
                selectDataByIndex(selected_data);
                break;
            case "TSNE":
                selectDataByIndex(selected_data);
                break;
            case "SPM":
                updateScatterplot(selected_data, self.color, self.c);
                break;

        }
    }


}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}