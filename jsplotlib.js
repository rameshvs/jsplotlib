(function() {
  jsplotlib = {};
  jsplotlib.make_chart = function() {
    var chart_counter = 0;
    var f = function(width, height, where_to_insert, how_to_insert, attributes) {
      chart_counter++;
      var DEFAULT_PADDING = 10;
      where_to_insert = where_to_insert || "body";
      width = width - 2 * DEFAULT_PADDING || 500;
      height = height - 2 * DEFAULT_PADDING || 200;
      attributes = attributes || {};
      if (!("id" in attributes)) {
        attributes.id = "chart" + chart_counter;
      }
      var chart;
      if (!how_to_insert) {
        chart = d3.select(where_to_insert).append("svg");
      } else {
        chart = d3.select(where_to_insert).insert("svg", how_to_insert);
      }
      chart.attr("class", "chart").attr("width", width).attr("height", height).attr("chart_count", chart_counter);
      for (var attribute in attributes) {
        if (attributes.hasOwnProperty(attribute)) {
          chart.attr(attribute, attributes[attribute]);
        }
      }
      $(".chart#" + attributes.id).css("padding", DEFAULT_PADDING + "px");
      return chart;
    };
    return f;
  }();
  jsplotlib.construct_axis = function() {
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
        var min = minmaxplus[0];
        var oldmax = minmaxplus[1];
        var plus = minmaxplus[2];
        var newmax;
        if (oldmax instanceof Date) {
          newmax = new Date(oldmax.getTime() + plus);
        } else {
          newmax = oldmax + plus;
        }
        this._set_data_range([ min, newmax ]);
      };
      that._set_data_range = function(minmax) {
        this._min = minmax[0];
        this._max = minmax[1];
        if (this._min instanceof Date || this._max instanceof Date) {
          this._scale = d3.time.scale();
          this._min = new Date(this._min);
          this._max = new Date(this._max);
        } else {
          this._scale = d3.scale.linear();
        }
        this._domain = [ this._min, this._max ];
        return this;
      };
      that._set_formatter = function(formatter) {
        this._formatter = formatter;
        return this;
      };
      that.get_scale = function() {
        if (this._x_or_y === "x") {
          this._range = [ parent_graph._yaxis._size, parent_graph._chartwidth ];
        } else if (this._x_or_y === "y") {
          this._range = [ parent_graph._height, parent_graph._title_size ];
        }
        this._scale.domain(this._domain).range(this._range);
        return this._scale;
      };
      that._init = function(chart) {
        if (this._will_draw_axis) {
          if (this._x_or_y === "x") {
            this._size = parent_graph._chartheight * this._axis_proportion;
            this._label_offset = this._size * this._label_proportion;
          } else if (this._x_or_y === "y") {
            this._size = parent_graph._chartwidth * this._axis_proportion;
            this._label_offset = this._size * this._label_proportion;
          } else {
            throw "Invalid axis type (must be x or y): " + this._x_or_y;
          }
        } else {
          this._size = 0;
        }
        return this;
      };
      that._compute_transform_string = function() {
        var offset_h, offset_v;
        var offset_label_h, offset_label_v;
        var label_rotation = "";
        if (this._x_or_y === "x") {
          offset_h = 0;
          offset_v = parent_graph._height;
          offset_label_h = parent_graph._yaxis._size + parent_graph._chartwidth / 2;
          offset_label_v = parent_graph._height + this._label_offset;
          this._writing_mode = "lr-tb";
          this._orientation = "bottom";
        } else if (this._x_or_y === "y") {
          offset_h = this._size;
          offset_v = 0;
          offset_label_h = this._size - this._label_offset;
          offset_label_v = parent_graph._chartheight / 2;
          label_rotation = "rotate(180)";
          this._writing_mode = "tb-rl";
          this._orientation = "left";
        } else {
          throw "Invalid axis type (must be x or y): " + this._x_or_y;
        }
        this._transform_string = "translate(" + offset_h + "," + offset_v + ")scale(1,1)";
        this._label_transform_string = "translate(" + offset_label_h + "," + offset_label_v + ")" + label_rotation;
      };
      that._draw_axis = function() {
        if (this._will_draw_axis) {
          this._formatter = this._formatter || this.get_scale().tickFormat(this.n_ticks);
          this._compute_transform_string();
          this._axis = d3.svg.axis().scale(this.get_scale()).ticks(this.n_ticks).orient(this._orientation).tickSubdivide(0).tickFormat(this._formatter);
          parent_graph.chart.append("svg:g").attr("id", this._id).attr("class", this._x_or_y + " axis").attr("transform", this._transform_string).call(this._axis);
        }
      };
      that._draw_label = function() {
        this._compute_transform_string();
        if (this._will_draw_axis && this._will_draw_label) {
          parent_graph.chart.append("svg:g").attr("class", this._x_or_y + " axis_label").attr("transform", this._label_transform_string).append("text").append("tspan").attr("text-anchor", "middle").attr("class", this._x_or_y + " axis_label").attr("writing-mode", this._writing_mode).text(this._label_string);
        }
      };
      return that;
    };
  }();
  jsplotlib.construct_graph = function(chart) {
    var that = {
      chart: chart
    };
    that._chartheight = parseInt(chart.attr("height"), 10);
    that._chartwidth = parseInt(chart.attr("width"));
    that._title_string = "";
    that._title_size = 0;
    that._xaxis = jsplotlib.construct_axis(that, "x");
    that._yaxis = jsplotlib.construct_axis(that, "y");
    that._axes = [ that._xaxis, that._yaxis ];
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
      this._title_size = this._chartheight * .1;
      this._title_transform_string = "translate(" + this._chartwidth / 2 + "," + this._title_size / 2 + ")";
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
      for (var i = 0; i < 2; i++) {
        this._axes[i]._init(this);
      }
      this._height = this._chartheight - this._xaxis._size;
      this._width = this._chartwidth - this._yaxis._size;
      return this;
    };
    that._draw_axes = function() {
      for (var i = 0; i < 2; i++) {
        this._axes[i]._draw_axis(this);
        this._axes[i]._draw_label(this);
      }
      var myselector = "#" + chart.attr("id") + " .axis line, #" + chart.attr("id") + " .axis path";
      $(myselector).css("fill", "none").css("stroke", "#000");
      d3.svg.axis(chart);
      if (this._title_string !== "") {
        that.chart.append("svg:g").attr("class", "graph_title").attr("transform", this._title_transform_string).append("text").append("tspan").attr("text-anchor", "middle").attr("class", "graph_title").attr("writing-mode", "rl-tb").text(this._title_string);
      }
      return this;
    };
    var chart_id = that.chart.attr("id");
    that.resize_function = function(resize_amount, direction) {
      return function() {
        var node = this;
        while (node.id !== chart_id) {
          node.parentNode.appendChild(node);
          node = node.parentNode;
        }
        var object = d3.select(this);
        var x0 = parseInt(object.attr("x") || "0", 10);
        var width0 = parseInt(object.attr("width"), 10);
        var y0 = parseInt(object.attr("y") || "0", 10);
        var height0 = parseInt(object.attr("height"), 10);
        var newwidth, newheight, newx, newy;
        if (direction === "grow") {
          object.attr("x_orig", x0).attr("y_orig", y0).attr("width_orig", width0).attr("height_orig", height0);
          newwidth = width0 * resize_amount;
          newheight = height0 * resize_amount;
          newx = x0 - (resize_amount - 1) * width0 / 2;
          newy = y0 - (resize_amount - 1) * height0 / 2;
        } else if (direction === "shrink") {
          newwidth = object.attr("width_orig");
          newheight = object.attr("height_orig");
          newx = object.attr("x_orig");
          newy = object.attr("y_orig");
        }
        object.attr("x", newx).attr("y", newy).attr("height", newheight).attr("width", newwidth);
      };
    };
    that.x = function(x) {
      this._x = x;
      this._xlimits([ d3.min(x), d3.max(x) ]);
      return this;
    };
    that.y = function(y) {
      this._y = y;
      this._ylimits([ d3.min(y), d3.max(y) ]);
      return this;
    };
    that.xrange = function(min, max, N) {
      this.x(linspace(min, max, N));
      return this;
    };
    that.yrange = function(min, max, N) {
      this.y(linspace(min, max, N));
      return this;
    };
    return that;
  };
  jsplotlib.imshow = function(chart) {
    var that = jsplotlib.construct_graph(chart);
    that.cmap_bounds = function(cmin, cmax) {
      this._cmin = cmin;
      this._cmax = cmax;
      this._color_picker = d3.interpolateRgb(cmin, cmax);
      return this;
    };
    that.colormap_jet = function() {
      var interpolators = [ d3.interpolateRgb("#000088", "#0000ff"), d3.interpolateRgb("#0000ff", "#0088ff"), d3.interpolateRgb("#0088ff", "#00ffff"), d3.interpolateRgb("#00ffff", "#88ff88"), d3.interpolateRgb("#88ff88", "#ffff00"), d3.interpolateRgb("#ffff00", "#ff8800"), d3.interpolateRgb("#ff8800", "#ff0000"), d3.interpolateRgb("#ff0000", "#880000") ];
      this._color_picker = function(val) {
        var idx = Math.min(Math.floor(val * 8), 7);
        return interpolators[idx](val * 8 - idx);
      };
      return this;
    };
    that.colormap_gray = function() {
      this.cmap_bounds("#010101", "#fefefe");
      return this;
    };
    that.draw = function() {
      this._init_common();
      this._xlimits([ 0, this._data[0].length ]);
      this._ylimits([ this._data.length, 0 ]);
      var xscale = this.get_xscale();
      var yscale = this.get_yscale();
      var width = xscale(1) - xscale(0);
      var height = yscale(1) - yscale(0);
      var color_picker = this._color_picker;
      var max_value = d3.max(this._data, function(d) {
        return d3.max(d);
      });
      var min_value = d3.min(this._data, function(d) {
        return d3.min(d);
      });
      var data_rescaler = d3.scale.linear().domain([ min_value, max_value ]).range([ 0, 1 ]);
      this._rows = chart.selectAll("g.img_row").data(this._data).enter().append("g").attr("class", "img_row").attr("transform", function(d, i) {
        return "translate(0," + yscale(i) + ")";
      });
      this._pixels = this._rows.selectAll("g.img_pixel").data(function(d, i) {
        return d;
      }).enter().append("g").attr("class", "img_pixel");
      this._pixels.append("rect").attr("x", function(d, i) {
        return xscale(i);
      }).attr("width", width).attr("height", height).style("fill", function(d, i) {
        return color_picker(data_rescaler(d));
      }).on("mouseover", this.resize_function(1.15, "grow")).on("mouseout", this.resize_function(1.15, "shrink"));
      var xformat = this._xaxis._formatter || function(x) {
        return x;
      };
      var yformat = this._yaxis._formatter || function(x) {
        return x;
      };
      $("#" + chart.attr("id") + " rect").tipsy({
        gravity: "w",
        html: true,
        title: function() {
          return "" + this.__data__;
        }
      });
      this._draw_axes();
      return this;
    };
    return that;
  };
  jsplotlib.pplot = function(chart) {
    var that = jsplotlib.construct_graph(chart);
    that.s = function(s) {
      var N = this._y.length || this._x.length;
      if (!(s instanceof Array)) {
        this._s = ones(N).map(function(d) {
          return s * d;
        });
        this._s_was_set = false;
      } else {
        this._s = s;
        this._s_was_set = true;
      }
      return this;
    };
    that.marker_style = function(ms) {
      this._marker_style = ms;
      return this;
    };
    that.line_style = function(ls) {
      this._line_style = ls;
      return this;
    };
    that.draw = function() {
      this._init_common();
      var s_was_set = true;
      var N = this._y.length || this._x.length;
      if (this._line_style === undefined) {
        this._line_style = "-";
      }
      if (!this._x) {
        this.xrange(1, N, N);
      }
      if (!this._s) {
        var siz;
        if (!this._marker_style || this._marker_style === ".") {
          siz = 0;
        } else {
          siz = 5;
        }
        this.s(5);
      }
      var x = this._x;
      var s = this._s;
      var y = this._y;
      var xys = d3.zip(x, y, s);
      var pairs = d3.zip(xys.slice(0, -1), xys.slice(1));
      var xscale = this.get_xscale();
      var yscale = this.get_yscale();
      var xformat = this._xaxis._formatter || function(x) {
        return x;
      };
      var yformat = this._yaxis._formatter || function(x) {
        return x;
      };
      this._line_containers = chart.selectAll("g.pplot_lines").data(pairs).enter().append("g").attr("class", "pplot_lines");
      if (this._line_style === "-") {
        this._lines = this._line_containers.append("line").attr("x1", function(d) {
          return xscale(d[0][0]);
        }).attr("x2", function(d) {
          return xscale(d[1][0]);
        }).attr("y1", function(d) {
          return yscale(d[0][1]);
        }).attr("y2", function(d) {
          return yscale(d[1][1]);
        }).style("stroke", "steelblue").style("stroke-width", 2);
      }
      this._points = chart.selectAll("g.pplot_points").data(xys).enter().append("g").attr("x", function(d) {
        return d[0];
      }).attr("y", function(d) {
        return d[1];
      }).attr("s", function(d) {
        return d[2];
      }).attr("class", "pplot_points");
      var s_was_set = this._s_was_set;
      $("#" + chart.attr("id") + " g.pplot_points").tipsy({
        gravity: "nw",
        html: true,
        title: function() {
          var d = this.__data__;
          var output = "(" + xformat(d[0]) + "," + yformat(d[1]) + ")";
          if (s_was_set) {
            output += ": " + d[2];
          }
          return output;
        }
      });
      switch (this._marker_style) {
       case undefined:
       case ".":
       case "o":
        this._markers = this._points.append("circle").attr("cx", function(d) {
          return xscale(d[0]);
        }).attr("cy", function(d) {
          return yscale(d[1]);
        }).attr("r", function(d) {
          return d[2];
        });
        break;
       case "x":
        this._points.append("line").attr("x1", function(d) {
          return xscale(d[0]) - d[2];
        }).attr("x2", function(d) {
          return xscale(d[0]) + d[2];
        }).attr("y1", function(d) {
          return yscale(d[1]) - d[2];
        }).attr("y2", function(d) {
          return yscale(d[1]) + d[2];
        });
        this._points.append("line").attr("x1", function(d) {
          return xscale(d[0]) + d[2];
        }).attr("x2", function(d) {
          return xscale(d[0]) - d[2];
        }).attr("y1", function(d) {
          return yscale(d[1]) - d[2];
        }).attr("y2", function(d) {
          return yscale(d[1]) + d[2];
        });
        this._markers = this._points.selectAll("line").style("stroke-width", 2);
        break;
      }
      var resize_function = function(resize_amount) {
        return function() {
          var marker = d3.select(this);
          if (marker.attr("r")) {
            marker.attr("r", marker.attr("r") * resize_amount);
          } else {
            true;
          }
        };
      };
      this._markers.style("stroke", "steelblue").style("fill", "steelblue").on("mouseover", resize_function(1.25)).on("mouseout", resize_function(.8));
      this._draw_axes();
      return this;
    };
    return that;
  };
  jsplotlib.bar_graph = function(chart) {
    var that = jsplotlib.construct_graph(chart);
    that.series_labels = function(sl) {
      this._series_labels = sl;
      return this;
    };
    that.barwidth = function(bw) {
      this._barwidth = bw;
      return this;
    };
    that.draw = function() {
      this._init_common();
      var series_labels;
      if (!this._series_labels) {
        series_labels = [];
        for (var i = 0; i < this._data.length; i++) {
          series_labels.push("Series " + i);
        }
      } else {
        series_labels = this._series_labels;
      }
      var yaxis_width = this._yaxis_width;
      var myheight = this._height;
      var mywidth = this._width;
      var N = this._data[0].length;
      var bar_width = this._width / N;
      if (!this._x) {
        this.xrange(0, N - 1, N);
      }
      this._barwidth = this._barwidth || this._x[1] - this._x[0];
      this._xaxis.set_bar_limits([ d3.min(this._x), d3.max(this._x), this._barwidth ]);
      var x = this._x;
      var bdl = this._data.map(function(bd) {
        var out = [];
        for (var i = 0; i < bd.length; i++) {
          out.push({
            x: x[i],
            y: bd[i]
          });
        }
        return out;
      });
      var stacked_data = d3.layout.stack()(bdl);
      var maxy = d3.max(stacked_data, function(one_series) {
        return d3.max(one_series, function(stackdatum) {
          return stackdatum.y + stackdatum.y0;
        });
      });
      this._ylimits([ 0, maxy ]);
      var xscale = this.get_xscale();
      var true_height = function(d) {
        return d.y / maxy * myheight;
      };
      var true_y = function(d) {
        return myheight - (d.y + d.y0) / maxy * myheight;
      };
      this._series = chart.selectAll("g.bar_graph_series").data(stacked_data).enter().append("g").style("stroke", "white").attr("series_label", function(d, i) {
        return series_labels[i];
      }).attr("class", "bar_graph_series");
      this._subbars = this._series.selectAll("g.subbar").data(function(d, i) {
        return d;
      }).enter().append("g").attr("class", "subbar");
      this._rects = this._subbars.append("rect").attr("width", bar_width).attr("x", function(d, i) {
        return xscale(d.x);
      }).attr("y", this._height).attr("height", 0);
      this._rects.transition().delay(function(d, i) {
        return i * 10;
      }).attr("y", true_y).attr("height", true_height);
      this._rects.on("mouseover", this.resize_function(1.15, "grow")).on("mouseout", this.resize_function(1.15, "shrink"));
      var xformat = this._xaxis._formatter || function(x) {
        return x;
      };
      var yformat = this._yaxis._formatter || function(x) {
        return x;
      };
      $("#" + chart.attr("id") + "  rect").tipsy({
        gravity: "w",
        html: true,
        title: function() {
          var d = this.__data__;
          var output = "" + xformat(d.x) + ": " + yformat(d.y);
          return output;
        }
      });
      this._draw_axes();
      return this;
    };
    return that;
  };
  var linspace = function(min, max, N) {
    var newscale = d3.scale.linear().domain([ 1, N ]).range([ min, max ]);
    var data = [];
    for (var i = 1; i <= N; i++) {
      var output = newscale(i);
      if (min instanceof Date) {
        output = new Date(output);
      }
      data.push(output);
    }
    return data;
  };
  var range = function(N) {
    var l = [];
    for (var i = 0; i < N; i++) {
      l.push(i);
    }
    return l;
  };
  var ones = function(N) {
    var l = [];
    for (var i = 0; i < N; i++) {
      l.push(1);
    }
    return l;
  };
})();