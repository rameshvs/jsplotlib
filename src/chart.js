
jsplotlib.make_chart = (function () {
    // static counter across all charts in document
    var chart_counter = 0;

    var f = function(width,height,where_to_insert,how_to_insert,attributes) {
        // This is the equivalent of calling figure() in matlab/matplotlib.
        //
        // where_to_insert is a CSS selector that tells us which element the chart goes in.
        // how_to_insert is a CSS selector that tells us where in the element to put the chart. 
        //   If not given, it just appends it to the end.
        // attributes specifies a mapping of attributes for the chart HTML/SVG element.
        //   for example, can be used to give id
        //
        // Returns a d3 selection containing the chart. Can be used as the chart() argument
        // for any of the other functions in this module
        // sample usage:
        //   chart = make_chart(600,150,"body",":first-child",{"id":"sample_chart"});
        //   stacked_bar_graph().chart(chart).data(...)...

        chart_counter++;
        
        var DEFAULT_PADDING = 10;
        // sane defaults (0 is never a valid value for any of these)
        where_to_insert = where_to_insert || "body";
        width = (width-2*DEFAULT_PADDING) || 500;
        height = (height-2*DEFAULT_PADDING) || 200;

        attributes = attributes || {};

        if (!("id" in attributes)) {
            attributes.id = "chart" + chart_counter;
        }

        var chart;
        if (!how_to_insert) {
            chart = d3.select(where_to_insert).append("svg")
        } else {
            chart = d3.select(where_to_insert).insert("svg",how_to_insert);
        }
        chart.attr("class","chart")
            .attr("width",width)
            .attr("height",height)
            .attr("chart_count",chart_counter);

        for (var attribute in attributes) {
            if (attributes.hasOwnProperty(attribute)) {
                chart.attr(attribute, attributes[attribute]);
            }
        }
        $(".chart#"+attributes.id).css("padding",DEFAULT_PADDING+"px");
        return chart;
    };
    return f;
}());

