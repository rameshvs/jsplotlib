
var linspace = function(min, max, N) {
    var newscale = d3.scale.linear()
        .domain([1,N])
        .range([min,max]);
    var data = [];
    for (var i=1 ; i<=N ; i++) {
        var output = newscale(i);
        if (min instanceof Date) {
            output = new Date(output);
        }
        data.push(output);
    };
    return data;
};
var range = function(N) {
    var l = [];
    for (var i=0 ; i<N ; i++) {
        l.push(i);
    }
    return l;
};
var ones = function(N) {
    var l = [];
    for(var i=0 ; i<N ; i++) {
        l.push(1);
    }
    return l;
};
