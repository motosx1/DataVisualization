function toNestedArray(data) {
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

    return ret;
}

/* Normalizes the data into the range [0, 1].

   @param unnormalized_data :: [[Double]], the original data
   @return :: [[Double]], the normalized data
   */
function normalize(unnormalized_data) {
    min_max = [ {min:unnormalized_data[0][0], max:unnormalized_data[0][0]}
                   , {min:unnormalized_data[0][1], max:unnormalized_data[0][1]}
                   , {min:unnormalized_data[0][2], max:unnormalized_data[0][2]}
                   , {min:unnormalized_data[0][3], max:unnormalized_data[0][3]}
                   , {min:unnormalized_data[0][4], max:unnormalized_data[0][4]}
                   , {min:unnormalized_data[0][5], max:unnormalized_data[0][5]}
                   , {min:unnormalized_data[0][6], max:unnormalized_data[0][6]}
                   , {min:unnormalized_data[0][7], max:unnormalized_data[0][7]}
                   , {min:unnormalized_data[0][8], max:unnormalized_data[0][8]}
                 ];

    // Find minima and maxima
    for (i = 0; i < unnormalized_data.length; i++) {
        for (j = 0; j < unnormalized_data[i].length; j++) {
            if (min_max[j].max < unnormalized_data[i][j]) {
                min_max[j].max = unnormalized_data[i][j];
            }
            if (unnormalized_data[i][j] < min_max[j].min) {
                min_max[j].min = unnormalized_data[i][j];
            }
        }
    }

    // normalize the data
    normalized_data = [];

    for (i = 0; i < unnormalized_data.length; i++) {
        normalized_data.push([]);
        for (j = 0; j < unnormalized_data[i].length; j++) {
            normalized_data[i].push((unnormalized_data[i][j] - min_max[j].min) /
                                    (min_max[j].max - min_max[j].min));
        }
    }
    return normalized_data;
}

/* Clusters the data in the given amount of clusters.

   @param data :: [[Double]], containing the data
   @param numblusters :: Int, the number of clusters
   @return :: [Int], containing the cluster assignments
*/
function clusterKMeans(data, numclusters) {
    var kmeans = new KMEANS();
    var clusters = kmeans.run(normalize(data), numclusters);

    out = [];
    for (var i = 0; i < clusters.length; i++) {
        for (var j = 0; j < clusters[i].length; j++) {
            out[clusters[i][j]] = i;
        }
    }

    return out;
}

/* Applies TSNE dimensionality reduction algorithm.

   @param data :: [[Double]], containing the data
   @return :: [[Double]], containing the data with reduced dimensionality
   */
function reduceDimTSNE(data) {
    var opt = {};
    opt.epsilon = 10; // epsilon is learning rate (10 = default)
    opt.perplexity = 30; // roughly how many neighbors each point influences (30 = default)
    opt.dim = 2; // dimensionality of the embedding (2 = default)

    var tsne = new tsnejs.tSNE(opt); // create a tSNE instance

    // initialize data.
    tsne.initDataRaw(normalize(data));

    for(var k = 0; k < 800; k++) {
        tsne.step(); // every time you call this, solution gets better
    }

    return tsne.getSolution(); // an array of 2-D points that you can plot
}

/* Zips the TSNE reduced data with the clusters and turns the result into a list of objects.
   zipWith (\xy, c -> {x:xy[0], y:xy[1], category:c})

   @param tsne_array :: [[Double]], containing output from TSNE
   @param clusters :: [Int], containing a list of cluster assignments
   @return :: [{x:,y:,category:}], list of objects containing the coordinates and category of a point
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
//var data_boats = toNestedArray(data);
//var reduced_tsne = reduceDimTSNE(data_boats);
//var clusters = clusterKMeans(data_boats);
//var tsne_clusters = toObjects(reduced_tsne, clusters);

// plot the data
//drawScatterplot(tsne_clusters);
