
jsplotlib.pplot = function(chart) {
    var that = jsplotlib.construct_graph(chart);

    that.s = function(s) {
        // absolute sizes in pixels
        this._s = s;
        return this;
    };
    that.marker_style = function(ms) {
        // One of 'o', 'x' (supported so far)
        this._marker_style = ms;
        return this;
    };
    that.line_style = function(ls) {
        // one of '-', '' (supported so far)
        this._line_style = ls;
        return this;
    };
    //that.get_lines_selector
    that.draw = function() {
        this._init_common();

        var N = this._y.length || this._x.length;
        if (this._line_style === undefined) {
            this._line_style =  "-";
        }
        if (!this._x) {
            this.xrange(1,N,N);
        }
        if (!this._s) {
            this._s = ones(N).map(function(d) { return d*5; });
            this._s_unset = true;
        }
        var x = this._x;
        var s = this._s;
        var y = this._y;

        var xys = d3.zip(x,y,s);

        // gives [(xys_0,xys_1),(xys_1,xys_2)], etc for making lines
        var pairs = d3.zip(xys.slice(0,-1),xys.slice(1));

        var xscale = this.get_xscale();
        var yscale = this.get_yscale();

        var xformat = this._xaxis._formatter || function(x) { return x; };
        var yformat = this._yaxis._formatter || function(x) { return x; };

        this._line_containers = chart.selectAll("g.pplot_lines")
            .data(pairs)
            .enter()
            .append("g")
            .attr("class", "pplot_lines");

        if (this._line_style === "-") {
            this._lines = this._line_containers.append("line")
                .attr("x1", function(d) { return xscale(d[0][0]); })
                .attr("x2", function(d) { return xscale(d[1][0]); })
                .attr("y1", function(d) { return yscale(d[0][1]); })
                .attr("y2", function(d) { return yscale(d[1][1]); })
                .style("stroke","steelblue")
                .style("stroke-width",2);
        }
        this._points = chart.selectAll("g.pplot_points")
            .data(xys)
            .enter()
            .append("g")
            .attr("x", function(d) { return d[0]; })
            .attr("y", function(d) { return d[1]; })
            .attr("s", function(d) { return d[2]; })
            .attr("class", "pplot_points");


        // TODO unify rectangle/circle mouseover
        $("#"+chart.attr("id")+" g.pplot_points").tipsy({ 
            gravity: 'nw',
            html: true,
            title: function() {
                var d = this.__data__;
                var output = "("+xformat(d[0])+","+yformat(d[1])+")";
                if (!this._s_unset) {
                    output += ": " + d[2];
                }
                return output;
            }
        });
        // TODO add support for markers other than circles/xs (low priority?)
        // TODO use labels for styling (like bar graph) instead of hardcoding steelblue
        // for everything
        switch(this._marker_style) {
            case undefined: // default to "o"
            case "o":
                this._markers = this._points.append("circle")
                    .attr("cx", function(d) { return xscale(d[0]); })
                    .attr("cy", function(d) { return yscale(d[1]); })
                    .attr("r",  function(d) { return d[2]; });
                // Only select circles from this chart
                break;
            case "x":
                this._points.append("line")
                    .attr("x1", function(d) { return xscale(d[0])-d[2]; })
                    .attr("x2", function(d) { return xscale(d[0])+d[2]; })
                    .attr("y1", function(d) { return yscale(d[1])-d[2]; })
                    .attr("y2", function(d) { return yscale(d[1])+d[2]; });
                this._points.append("line")
                    .attr("x1", function(d) { return xscale(d[0])+d[2]; })
                    .attr("x2", function(d) { return xscale(d[0])-d[2]; })
                    .attr("y1", function(d) { return yscale(d[1])-d[2]; })
                    .attr("y2", function(d) { return yscale(d[1])+d[2]; });
                this._markers = this._points.selectAll("line")
                    .style("stroke-width",2);
                break;
        }
        var resize_function = function(resize_amount) {
            return function() {
                var marker = d3.select(this);
                if (marker.attr("r")) {
                    marker.attr("r", marker.attr("r") * resize_amount);
                } else {
                    // not yet implemented
                    true;
                }
            };
        };
        this._markers
            .style("stroke", "steelblue")
            .style("fill", "steelblue")
            .on("mouseover", resize_function(1.25))
            .on("mouseout", resize_function(0.8));


        this._draw_axes();
        return this;
    };

    return that;
};
