
jsplotlib.bar_graph = function(chart) {
    var that = jsplotlib.construct_graph(chart);
    that.series_labels = function(sl) {
        this._series_labels = sl;
        return this;
    };
    // sets left end of each bar. defaults to 0-N
    that.barwidth = function(bw) {
        this._barwidth = bw;
        return this;
    };
    that.draw = function() {
        this._init_common();

        var series_labels;
        // values needed by helper functions
        if (!this._series_labels) {
            series_labels = [];
            for (var i=0 ; i<this._data.length ; i++) {
                series_labels.push("Series "+i);
            }
        } else {
            series_labels = this._series_labels;
        }
        var yaxis_width = this._yaxis_width;
        var myheight = this._height;
        var mywidth = this._width;

        var N = (this._data)[0].length;
        var bar_width = this._width / N;
        if(!this._x) {
            // TODO get barwidth in there!
            this.xrange(0,N-1,N);
        }
        this._barwidth = this._barwidth || (this._x[1] - this._x[0]);
        this._xaxis.set_bar_limits([d3.min(this._x), d3.max(this._x) , this._barwidth]);
        //this._xlimits([d3.min(this._x), d3.max(this._x) + this._barwidth]);

        var x = this._x;

        var bdl = this._data.map(function (bd) {
            var out = [];
            for (var i=0 ; i<bd.length ; i++) {
                out.push({ "x":x[i], "y":bd[i] });
            };
            return out;
        });
        var stacked_data = d3.layout.stack()(bdl);

        var maxy = d3.max(stacked_data, function(one_series) {
            return d3.max(one_series, function (stackdatum) {
                return stackdatum.y + stackdatum.y0;
            });
        });
        this._ylimits([0,maxy]);
        var xscale = this.get_xscale();

        var true_height = function(d) {
            return (d.y/maxy * myheight);
        };
        var true_y = function(d) {
            return myheight - ((d.y+d.y0)/maxy * myheight);
        };

        // this corresponds to a selection for each series.
        // 'g' is an SVG node used for grouping
        this._series = chart.selectAll("g.bar_graph_series")
            .data(stacked_data)
            .enter()
            .append("g")
            .style("stroke", "white")
            .attr("series_label", function (d,i) { return series_labels[i]; })
            .attr("class", "bar_graph_series");

        // selection for each bar (there's one bar in each 'column' for each series)
        this._subbars = this._series.selectAll("g.subbar")
            .data(function (d,i) { return d; })
            .enter()
            .append("g")
            .attr("class", "subbar");

        // each subbar has a _rect_ (an actual SVG primitive)
        this._rects = this._subbars.append("rect")
            .attr("width", bar_width)
            .attr("x", function(d,i) { return xscale(d.x); } )
            .attr("y", this._height) // initialize to "0" for animation
            .attr("height", 0);

        // animate on startup. each column delayed by 10ms more than previous one
        this._rects.transition()
            .delay(function (d,i) { return i*10; } )
            .attr("y", true_y)
            .attr("height", true_height);


        this._rects
            .on("mouseover", this.resize_function(1.15, "grow"))
            .on("mouseout", this.resize_function(1.15, "shrink"));

        var xformat = this._xaxis._formatter || function(x) { return x; };
        var yformat = this._yaxis._formatter || function(x) { return x; };
        $("#"+chart.attr("id")+"  rect").tipsy({ 
            gravity: 'w',
            html: true,
            title: function() {
                var d = this.__data__;
                var output = ""+xformat(d.x)+": "+yformat(d.y);
                return output;
            }
        });
        this._draw_axes()
        return this;
    };
    return that;
};
