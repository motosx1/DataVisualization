function toNestedArray(data) {
    return data.map(x => [x['x'], x['y'], x['u'], x['v'], x['m'], x['a']]);
}

/* Clusters the data in the given amount of clusters.

   @param data: [[Double]], containing the data
   @param numblusters: Int, the number of clusters
   @return [Int], containing the cluster assignments
   */
function clusterKMeans(data, numclusters) {
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

/* Applies TSNE dimensionality reduction algorithm.

   @param data: [[Double]], containing the data
   @return [[Double]], containing the data with reduced dimensionality
   */
function reduceDimTSNE(data) {
    var opt = {};
    opt.epsilon = 10; // epsilon is learning rate (10 = default)
    opt.perplexity = 30; // roughly how many neighbors each point influences (30 = default)
    opt.dim = 2; // dimensionality of the embedding (2 = default)

    var tsne = new tsnejs.tSNE(opt); // create a tSNE instance

    // initialize data.
    tsne.initDataRaw(data);

    for(var k = 0; k < 500; k++) {
        tsne.step(); // every time you call this, solution gets better
    }

    return tsne.getSolution(); // an array of 2-D points that you can plot
}

/* Zips the TSNE reduced data with the clusters and turns the result into a list of objects.

   @param tsne_array: [[Double]], containing output from TSNE
   @param clusters: [Int], containing a list of cluster assignments
   @return [{x:,y:,category:}], list of objects containing the coordinates and category of a point
   */
function toObjects(tsne_array, clusters) {
    var objects = [];
    var ob = {};
    for (i = 0; i < tsne_array.length; i++) {
        ob = {x:tsne_array[i][0], y:tsne_array[i][1], category:clusters[i]};
        objects.push(ob);
    }
    return objects;
}

/// Example workflow
// Work out thew datapoints
var data_boats = toNestedArray(boat_data['boats']);
var reduced_tsne = reduceDimTSNE(data_boats);
var clusters = clusterKMeans(data_boats);
var tsne_clusters = toObjects(reduced_tsne, clusters);

// plot the data
drawScatterplot(tsne_clusters);
