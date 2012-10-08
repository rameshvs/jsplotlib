# jsplotlib
## A matplotlib/MATLAB (TM) -inspired library for creating interactive plots with d3.js

This is a javascript library for creating interactive matplotlib-/MATLAB-style
plots.  It provides a simple API for creating "charts" (SVG figures) and plots
(scatter plots, line plots, bar graphs, and images) in HTML pages. Here's an
example:

    var chart = jsplotlib.make_chart(800,400); // (width, height) in pixels
    jsplotlib.bar_graph(chart)
        .data([[1,2,3,4,5],[9,7,5,3,1]])
        .xlabel("x-axis label")
        .ylabel("y-axis label")
        .draw()

See `examples/{index.html,example.js}` for more examples.

This library requires d3.js, JQuery, and tipsy.

It's still rough around the edges. Known minor issues:

*   Bars/image elements sometimes move in ways they shouldn't (and cover axes) on mouseover

*   Axis labels are slightly off-center

*   Many features only work properly in WebKit browsers (tested on Safari & Chrome)

