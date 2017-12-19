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

    // Other
    self._colors = {
        "selected": "#97a4bc",
        "un-selected": "#e8eefd",
        "alfa-romero": '#0a72ff',
        "audi": '#1eff06',
        "bmw": '#ff1902',
        "chevrolet": '#2dfefe',
        "dodge": '#827c01',
        "honda": '#fe07a6',
        "isuzu": '#a8879f',
        "jaguar": '#fcff04',
        "mazda": '#c602fe',
        "mercedes-benz": '#16be61',
        "mercury": '#ff9569',
        "mitsubishi": '#05b3ff',
        "nissan": '#8ffec2',
        "peugot": '#3f8670',
        "plymouth": '#e992ff',
        "porsche": '#ffb209',
        "renault": '#e72955',
        "saab": '#83bf02',
        "subaru": '#bba67b',
        "toyota": '#fe7eb1',
        "volkswagen": '#7570c1',
        "volvo": "#85bfd1"
    }
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
            self.cluster();
            self.setupCharts();

        });

    },

    cluster: function () {
        var initial_array = toNestedArray(self._data);
        var reduced_tsne = reduceDimTSNE(initial_array);
        var clusters = clusterKMeans(initial_array);
        var tsne_clusters = toObjects(reduced_tsne, clusters, self._data);
        drawScatterplot(tsne_clusters);

        self._data.forEach(function (p, i) {
            p['category'] = tsne_clusters[i]['category'];
        });


    },

    setupCharts: function () {
        // var dimensions = ['make',
        //     'fuel-type',
        //     'length',
        //     'width',
        //     'weight',
        //     'cylinders',
        //     'engine-size',
        //     'fuel-system',
        //     'compression',
        //     'horsepower',
        //     'city-mpg',
        //     'highway-mpg',
        //     'price'];

        // self._stats = stats(self._data);
        self._pcp = parallelCoordinatesChart2("pcp", self._data, self._colors, null, null);
        // self._legend = legendChart("legend", self._data_selected, self._colors, self.callback_applyGroupFilter)
        // self._donutMakes = donutChartGrouped("pie-groups", self._data_selected, "make",  self._colors, self._pcp.highlight_group);
        // self._donutTotals = donutChartTotals("pie-totals", self._data_selected, self._colors);
        // self._dataTable = dataTable("data-table", self._data, dimensions, self._colors, self._pcp.highlight_single)
        self._dataTable = dataTable("data-table", self._data, dimensions, self._colors);
    },

    callback_applyBrushFilter: function (brushed_data) {
        self._data_selected = brushed_data;
        self.refreshCharts();
    },

    refreshCharts: function () {
        self._donutTotals.update(self._data_selected);
        self._donutMakes.update(self._data_selected);
        self._pcp.update(self._data_selected);
        self._dataTable.update(self._data_selected);
    },


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
};

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
