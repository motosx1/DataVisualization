function toNestedArray(data) {
    return data.map(x => [x['x'], x['y'], x['u'], x['v'], x['m'], x['a']]);
}

function clusterKMeans(data, numclusters) {
    nested_array = toNestedArray(data);

    var kmeans = new KMEANS();
    var clusters = kmeans.run(nested_array, numclusters);

    out = [];
    for (var i = 0; i < clusters.length; i++) {
        for (var j = 0; j < clusters[i].length; j++) {
            out[clusters[i][j]] = i;
        }
    }

    return out;
}

function reduceDimTSNE(data) {
    var opt = {};
    opt.epsilon = 10; // epsilon is learning rate (10 = default)
    opt.perplexity = 30; // roughly how many neighbors each point influences (30 = default)
    opt.dim = 2; // dimensionality of the embedding (2 = default)

    var tsne = new tsnejs.tSNE(opt); // create a tSNE instance

    // initialize data.
    tsne.initDataRaw(data_boats);

    for(var k = 0; k < 500; k++) {
        tsne.step(); // every time you call this, solution gets better
    }

    return tsne.getSolution(); // an array of 2-D points that you can plot
}


var data_boats = toNestedArray(boat_data['boats']);
var clusters = clusterKMeans(boat_data['boats']);
var reduced_tsne = reduceDimTSNE(data_boats);

var data_tsne = [];
var ob = {};
for (i = 0; i < reduced_tsne.length; i++) {
    ob = {x:reduced_tsne[i][0], y:reduced_tsne[i][1], category:clusters[i]};
    data_tsne.push(ob);
}

drawScatterplot(data_tsne);
