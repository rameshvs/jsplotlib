"use strict";
$(window).load(function () {

    // a simple plot with dates on the x-axis
    var chart1 = jsplotlib.make_chart(800,400); // like calling figure()
    jsplotlib.pplot(chart1)
        .y([3,4,16,15,42,23])
        // can use xrange() to specify a range of x values.
        .xrange(80, 200, 6)
        .yaxis_off()
        .draw();

    // a slightly more interesting plot
    var chart2 = jsplotlib.make_chart(400,400);
    jsplotlib.pplot(chart2)
        .x([5,6,10,11,15,16])
        .y([13,21,34,55,89,144])
        .marker_style("x") // supports 'o', 'x' (default 'o')
        .line_style("-") // default
        .xlabel("x units")
        .draw();

    // now let's do one without lines (a scatter plot)
    var chart3 = jsplotlib.make_chart(400,400);
    jsplotlib.pplot(chart3)
        .x([10,90,41,32,79,64,33,21])
        .y([0,202,100,105,90,91,150,130])
        .s([10,10,3,9,2,8,11,12,7]) // sizes (in pixels)
        .line_style("") // no lines
        .xaxis_off() // can control axes individually
        .draw();

    // a stacked bar graph
    var chart4 = jsplotlib.make_chart(400,400);
    jsplotlib.bar_graph(chart4)
        .data([[1,2,3,4,5],[9,7,5,3,1]])
        .ylabel("Counts")
        // Dates are supported too!
        .xrange(new Date("2005/01/01"), new Date("2012/10/01"), 5)
        .xformat(d3.time.format("%b %Y"))
        .draw();

    // visualizing matrix data: imshow
    var chart5 = jsplotlib.make_chart(400,400);
    jsplotlib.imshow(chart5)
        .data([[1,2,3,4],[5,6,7,8],[9,10,11,12]])
        .colormap_jet() // the standard matlab colormap
        .draw();
});
