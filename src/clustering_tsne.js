d3.csvParse()

var colors = [
    [20, 20, 80],
    [22, 22, 90],
    [250, 255, 253],
    [0, 30, 70],
    [200, 0, 23],
    [100, 54, 100],
    [255, 13, 8]
];

// Calculate clusters.
var clusters = clusterfck.kmeans(colors, 3);
//clusters.map(x => {console.log(x.length);  x.map(y => console.log(y));});

var opt = {};
opt.epsilon = 10; // epsilon is learning rate (10 = default)
opt.perplexity = 30; // roughly how many neighbors each point influences (30 = default)
opt.dim = 2; // dimensionality of the embedding (2 = default)

var tsne = new tsnejs.tSNE(opt); // create a tSNE instance

// initialize data.
tsne.initDataRaw(data);

for(var k = 0; k < 5; k++) {
    console.log("check");
    tsne.step(); // every time you call this, solution gets better
}

var reduced_colors = tsne.getSolution(); // Y is an array of 2-D points that you can plot
//reduced_colors.map(x => console.log(x));
