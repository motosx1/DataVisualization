function toNestedArray(data) {
    // console.log(data[0]);
    var ret = data.map(x => [
        x['length'],
        x['width'],
        x['weight'],
        x['cylinders'],
        x['engine-size'],
        x['compression'],
        x['horsepower'],
        x['city-mpg'],
        x['price']
    ]);

    // console.log(ret[0]);
    return ret;
}

function clusterKMeans(data, numclusters) {
    // console.log(data[0]);
    var kmeans = new KMEANS();
    var clusters = kmeans.run(data, numclusters);

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
    tsne.initDataRaw(data);

    for (var k = 0; k < 50; k++) {
        tsne.step(); // every time you call this, solution gets better
    }

    return tsne.getSolution(); // an array of 2-D points that you can plot
}

function toObjects(reduced_tsne, clusters) {
    var objects = [];
    var ob = {};
    for (i = 0; i < reduced_tsne.length; i++) {
        ob = {x: reduced_tsne[i][0], y: reduced_tsne[i][1], category: clusters[i]};
        objects.push(ob);
    }
    return objects;
}

