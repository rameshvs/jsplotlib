
jsplotlib.imshow = function(chart) {
    var that = jsplotlib.construct_graph(chart);

    // equivalent to matlab's caxis or matplotlib's clim
    that.cmap_bounds = function(cmin,cmax) {
        this._cmin = cmin;
        this._cmax = cmax;
        this._color_picker = d3.interpolateRgb(cmin,cmax);
        return this;
    };

    that.colormap_jet = function() {
        // this is kind of hacky... TODO clean up and generalize (segmented linear colormap
        // like matplotlib?)
        // might be able to use d3 polylinear scale here...
        var interpolators = [d3.interpolateRgb('#000088','#0000ff'),
                             d3.interpolateRgb('#0000ff','#0088ff'),
                             d3.interpolateRgb('#0088ff','#00ffff'),
                             d3.interpolateRgb('#00ffff','#88ff88'),
                             d3.interpolateRgb('#88ff88','#ffff00'),
                             d3.interpolateRgb('#ffff00','#ff8800'),
                             d3.interpolateRgb('#ff8800','#ff0000'),
                             d3.interpolateRgb('#ff0000','#880000')];

        this._color_picker = function(val) {
            var idx = Math.min(Math.floor(val*8),7);
            return interpolators[idx](val*8 - idx);
        };
        return this;
    };
    that.colormap_gray = function() {
        this.cmap_bounds('#010101','#fefefe');
        return this;
    };

    that.draw = function() {
        this._init_common();

        this._xlimits([0, this._data[0].length]);
        // y increases going down
        this._ylimits([this._data.length, 0]);

        //this._compute_scales();
        var xscale = this.get_xscale();
        var yscale = this.get_yscale();
        var width = xscale(1) - xscale(0);
        var height = yscale(1) - yscale(0);

        var color_picker = this._color_picker;

        // map data into [0,1] so we can use interpolateRgb to get a color
        var max_value = d3.max(this._data, function(d) { return d3.max(d); });
        var min_value = d3.min(this._data, function(d) { return d3.min(d); });

        var data_rescaler = d3.scale.linear().domain([min_value,max_value]).range([0,1]);

        this._rows = chart.selectAll("g.img_row")
            .data(this._data)
            .enter()
            .append("g")
            .attr("class","img_row")
            .attr("transform", function(d,i) { return "translate(0,"+yscale(i)+")"; });

        this._pixels = this._rows.selectAll("g.img_pixel")
            .data(function(d,i) { return d; })
            .enter()
            .append("g")
            .attr("class", "img_pixel");

        this._pixels.append("rect")
            .attr("x", function(d, i) { return xscale(i); })
            .attr("width", width)
            .attr("height", height)
            .style("fill", function(d,i) { return color_picker(data_rescaler(d)); })
            .on("mouseover", this.resize_function(1.15, "grow"))
            .on("mouseout", this.resize_function(1.15, "shrink"));

        var xformat = this._xaxis._formatter || function(x) { return x; };
        var yformat = this._yaxis._formatter || function(x) { return x; };
        $("#"+chart.attr("id")+" rect").tipsy({ 
            gravity: 'w',
            html: true,
            title: function() {
                return ""+this.__data__;
            }
        });
        this._draw_axes();
        return this;
    };
    return that;
};

