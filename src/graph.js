
jsplotlib.construct_graph = function(chart) { // constructor
    // Note that nothing is encapsulated/private.
    // "private" things are prefaced with an underscore _
    var that = {"chart": chart};

    that._chartheight = parseInt(chart.attr("height"),10);
    that._chartwidth = parseInt(chart.attr("width"));

    that._title_string = "";
    that._title_size = 0; // default to no title

    that._xaxis = jsplotlib.construct_axis(that, "x");
    that._yaxis = jsplotlib.construct_axis(that, "y");

    that._axes = [that._xaxis, that._yaxis];


    that.data = function(d) {
        this._data = d;
        return this;
    };
    that.xlabel = function(xl) {
        this._xaxis.set_label(xl);
        return this;
    };
    that.ylabel = function(yl) {
        this._yaxis.set_label(yl);
        return this;
    };
    that.xaxis_off = function() {
        this._xaxis._turn_off();
        return this;
    };
    that.yaxis_off = function() {
        this._yaxis._turn_off();
        return this;
    };
    that.xaxis_on = function() {
        this._xaxis._turn_on();
        return this;
    };
    that.yaxis_on = function() {
        this._yaxis._turn_on();
        return this;
    };
    that.axis_on = function() {
        this.yaxis_on();
        this.xaxis_on();
        return this;
    };
    that.axis_off = function() {
        this.yaxis_off();
        this.xaxis_off();
        return this;
    };
    that.title = function(title_string) {
        this._title_string = title_string;
        // TODO  make customizable
        this._title_size = this._chartheight * .1;
        this._title_transform_string = "translate("+(this._chartwidth/2)+","+(this._title_size/2)+")";
        return this;
    };

    that._ylimits = function(minmax) {
        this._yaxis._set_data_range(minmax);
        return this;
    };
    that._xlimits = function(minmax) {
        this._xaxis._set_data_range(minmax);
        return this;
    };
    that.yformat = function(formatter) {
        this._yaxis._set_formatter(formatter);
        return this;
    };
    that.xformat = function(formatter) {
        this._xaxis._set_formatter(formatter);
        return this;
    };

    that.get_yscale = function() {
        return this._yaxis.get_scale();
    };
    that.get_xscale = function() {
        return this._xaxis.get_scale();
    };
    that._init_common = function() {

        for (var i = 0 ; i < 2 ; i++) {
            this._axes[i]._init(this);
        }
        // height and width of drawable area, not counting axes
        this._height = this._chartheight - this._xaxis._size;
        this._width = this._chartwidth - this._yaxis._size;

        return this;
    };

    // thoughts

    that._draw_axes = function() {
        for (var i = 0 ; i < 2 ; i++) {
            this._axes[i]._draw_axis(this);
            this._axes[i]._draw_label(this);
        }
        var myselector = "#" + chart.attr("id") + " .axis line, #" + chart.attr("id") + " .axis path";
        $(myselector).css("fill","none").css("stroke","#000");
        d3.svg.axis(chart);
        if (this._title_string !== "") {
            that.chart.append("svg:g")
                .attr("class", "graph_title")
                .attr("transform", this._title_transform_string)
                .append("text").append("tspan")
                .attr("text-anchor", "middle")
                .attr("class", "graph_title")
                .attr("writing-mode", "rl-tb")
                .text(this._title_string);
        }
        return this;
    };
    // for resizing rectangles. TODO make this neater!
    var chart_id = that.chart.attr("id");
    that.resize_function = function(resize_amount, direction) {
        return function() {

            // TODO make this restore axes to the front on mouseout.
            // maybe direction should be changed to mouseover/mouseout
            // to make that more explicit

            // Move this node to the front by recursing up the DOM
            // until we get to the parent chart
            var node = this;
            while(node.id !== chart_id) {
                node.parentNode.appendChild(node);
                node = node.parentNode;
            }

            var object = d3.select(this);
            var x0 = parseInt( object.attr("x") || "0" , 10);
            var width0 = parseInt( object.attr("width") , 10);
            var y0 = parseInt( object.attr("y") || "0" , 10);
            var height0 = parseInt( object.attr("height") , 10);

            var newwidth, newheight, newx, newy;
            if (direction === "grow") {
                // store the old values so that we can recover
                // them when we want to shrink (mouseout)
                object
                    .attr("x_orig", x0)
                    .attr("y_orig", y0)
                    .attr("width_orig", width0)
                    .attr("height_orig", height0);
                newwidth = width0 * resize_amount;
                newheight = height0 * resize_amount;
                newx = x0 - (resize_amount - 1) * width0 / 2;
                newy = y0 - (resize_amount - 1) * height0 / 2;
            } else if (direction === "shrink") {
                // restore from earlier
                newwidth = object.attr("width_orig");
                newheight = object.attr("height_orig");
                newx = object.attr("x_orig");
                newy = object.attr("y_orig");
            }
            object
                .attr("x", newx)
                .attr("y", newy)
                .attr("height", newheight)
                .attr("width", newwidth);
        };
    };

    // data entry
    that.x = function(x) {
        this._x = x;
        this._xlimits([d3.min(x), d3.max(x)]);
        return this;
    };
    that.y = function(y) {
        this._y = y;
        this._ylimits([d3.min(y), d3.max(y)]);
        return this;
    };
    that.xrange = function(min, max, N) {
        this.x(linspace(min,max,N));
        return this;
    };
    that.yrange = function(min, max, N) {
        this.y(linspace(min,max,N));
        return this;
    };
    return that;
};

