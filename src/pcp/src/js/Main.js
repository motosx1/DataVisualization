function Main() {
    self = this;

    // Data
    self._data = [];
    self._data_selected = [];


    // Charts
    self._pcp = null;
    self._donutMakes = null;
    self._donutTotals = null;
    self._legend = null;
    self._dataTable = null;
    self._stats = null;
    self._scatterPlot = null;

    self.c = ['rgb(255, 127, 14)', 'rgb(31, 119, 180)', 'red'];


    self.init();
}

Main.prototype = {
    init: function (csvFile) {
        console.debug("Main: init");
        d3.csv("./data/car_data.csv", function (d) {
            return {
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
        var c = ['rgb(255, 127, 14)', 'rgb(31, 119, 180)', 'red'];

        var color = function (i) {
            // var c = ['#66c2a5', '#fc8d62', '#8ad0cb'];
            return c[i%3];
        }

        self._data.forEach(function (p, i) {
            p['category'] = self.color(tsne_clusters[i]['category']);
            p['tsne-x'] = tsne_clusters[i].x;
            p['tsne-y'] = tsne_clusters[i].y;
        });

        initTsneScatter(self._data, self.color, self.c);
        drawScatterplot(self._data);

        self._pcp = parallelCoordinatesChart2("pcp", self._data, self.callback_updateCharts);
        self._scatterPlot = drawScatterplotMatrix(self._data, getFeatureNames(self._data));
        addButtons(getFeatureNames(self._data));
    },

    color: function (i) {
        return self.c[i % 3];
    },

    callback_updateCharts: function (selected_data) {
        updateScatterplot(selected_data, self.color, self.c);
    }



    callback_applyGroupFilter: function (groupFilter) {
        var hide = false;
        var index = self._data_visible_groups.indexOf(groupFilter);
        if (index == -1) {   // Index does not exist
            hide = false;
            // Add group as a visible group
            self._data_visible_groups.push(groupFilter);
        } else { // Index does exist
            hide = true;
            // Remove group as visible
            self._data_visible_groups.splice(index, 1);
        }
        self.refreshCharts();
        return hide;
    },
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
