
jsplotlib.construct_axis = (function() { // constructor
    var axis_count = 0;
    return function(parent_graph, x_or_y) {
        var that = {};
        that._id = "axis" + axis_count++;

        that._will_draw_label = false;
        that._will_draw_axis = true;
        that._x_or_y = x_or_y;
        that._size = 0;
        that._label_offset = 0;
        that._label_string = "";
        that._axis_proportion = .15;
        that._label_proportion = .7;

        that.n_ticks = 4;

        that.set_n_ticks = function(n) {
            this.n_ticks = n;
        };

        that.set_label = function(label_string) {
            this._label_string = label_string;
            return this;
        };

        that._turn_off = function() {
            this._will_draw_axis = false;
            return this;
        };
        that._turn_on = function() {
            this._will_draw_axis = true;
            return this;
        };
        that.set_bar_limits = function(minmaxplus) {
            // TODO make this more general
            var min = minmaxplus[0];
            var oldmax = minmaxplus[1];
            var plus = minmaxplus[2];
            var newmax;
            if (oldmax instanceof Date) {
                newmax = new Date(oldmax.getTime() + plus);
            } else {
                newmax = oldmax + plus;
            }
            this._set_data_range([min,newmax]);
        };
        that._set_data_range = function(minmax) {
            this._min = minmax[0];
            this._max = minmax[1];
            // TODO should I be using something more robust than instanceof?
            if (this._min instanceof Date || this._max instanceof Date) {
                this._scale = d3.time.scale();
                this._min = new Date(this._min);
                this._max = new Date(this._max);
            } else {
                this._scale = d3.scale.linear();
            };
            this._domain = [this._min, this._max];
            return this;
        };
        that._set_formatter = function(formatter) {
            this._formatter = formatter;
            return this;
        };

        that.get_scale = function() {
            // TODO this also has to be adjusted to get left/top axes
            if (this._x_or_y === "x") {
                this._range = [parent_graph._yaxis._size, parent_graph._chartwidth];
            } else if (this._x_or_y === "y") {
                this._range = [parent_graph._height, 0];
            };
            this._scale
                .domain(this._domain)
                .range(this._range);
            return this._scale;
        };
        // this._size: width for y-axis block, height for x-axis block
        that._init = function(chart) {
            if (this._will_draw_axis) {
                if (this._x_or_y === "x") {
                    this._size = parent_graph._chartheight * this._axis_proportion;
                    this._label_offset = this._size * this._label_proportion;
                    this._range = [parent_graph._height, 0];
                } else if (this._x_or_y === "y") {
                    this._size = parent_graph._chartwidth * this._axis_proportion;
                    this._label_offset = this._size * this._label_proportion;
                    this._range = [this._size, parent_graph.chart._chartwidth];
                } else {
                    throw "Invalid axis type (must be x or y): "+this._x_or_y
                }
            } else {
                this._size = 0;
            }
            return this;
        };

        that._compute_transform_string = function() {
            // TODO fix this to allow axes on left/top
            // TODO make the labels centered about their locations
            var offset_h, offset_v; // horizontal, vertical
            var offset_label_h, offset_label_v;
            var label_rotation = "";
            if (this._x_or_y === "x") {
                offset_h = 0;
                offset_v = parent_graph._height;

                offset_label_h = parent_graph._yaxis._size + parent_graph._chartwidth/2;
                offset_label_v = parent_graph._height + this._label_offset;

                this._writing_mode = "lr-tb";
                this._orientation = "bottom";
            } else if ((this._x_or_y) === "y") {
                offset_h = this._size;
                offset_v = 0;

                offset_label_h = this._size - this._label_offset;
                offset_label_v = parent_graph._chartheight/2;
                label_rotation = "rotate(180)";

                this._writing_mode = "tb-rl";
                this._orientation = "left";
            } else {
                throw "Invalid axis type (must be x or y): "+this._x_or_y
            }
            this._transform_string = "translate("+offset_h+","+offset_v+")scale(1,1)";
            this._label_transform_string = "translate("+ offset_label_h + ","+ offset_label_v +")" + label_rotation;
        };
        that._draw_axis = function() {
            if(this._will_draw_axis) {

                this._formatter = this._formatter || this.get_scale().tickFormat(this.n_ticks);
                this._compute_transform_string()

                // this._axis is the actual axis d3 element
                this._axis = d3.svg.axis()
                    .scale(this.get_scale())
                    .ticks(this.n_ticks)
                    .orient(this._orientation)
                    .tickSubdivide(0)
                    .tickFormat(this._formatter);

                parent_graph.chart.append("svg:g")
                    .attr("id", this._id)
                    .attr("class", this._x_or_y + " axis")
                    .attr("transform", this._transform_string)
                    .call(this._axis);
            }
        };
        that._draw_label = function() {
            this._compute_transform_string();
            if (this._will_draw_axis) {
                parent_graph.chart.append("svg:g")
                    .attr("class", this._x_or_y + " axis_label")
                    .attr("transform", this._label_transform_string)
                    .append("text").append("tspan")
                    .attr("text-anchor", "middle")
                    .attr("class", this._x_or_y + " axis_label")
                    .attr("writing-mode", this._writing_mode)
                    .text(this._label_string);
            }
        };
        return that;
    };
}());

