// Returns axis function, used for barplot, scatterplot and quartile plots
// More info on how generate axis with D3: 
//    https://github.com/mbostock/d3/wiki/SVG-Axes
//    http://alignedleft.com/tutorials/d3/axes
function generate_axis(scale_func, tick_size, orient) {
	return d3.svg.axis()
        .scale(scale_func)
       	.orient(orient)
       	.innerTickSize(-tick_size)
        .outerTickSize(0)
       	.tickPadding(10)
}

// Puts plot with barchart of shares of loan types in each state
//   to a tooltip and makes it visible 
function draw_tooltip_plot(t_tip, dataset, color){
    t_tip.append('p').append('b')
        .text(dataset['name']);

    t_tip.append('p')
        .html('Avg. interest rate: <b>' + d3.format(".2%")(dataset['interest']) + '</b>');

    // Constructs dataset with shares of loans by type
    //   used in barchart
    //  Dataset in data/map_data.csv contains also state name, interest rate
    //    so we need to have a separate dataset with just loan types and their shares by state 
    var barchart_ds = [];
    var params_for_barchart = ["Cancelled","Chargedoff","Completed","Current","Defaulted","Final Payment","Past Due"];
    Object.keys(dataset).forEach(function(d){
        if (params_for_barchart.indexOf(d) > -1) {
            barchart_ds.push({'key': d, 'value': dataset[d]})
        }
    });

    var margin_scplt = {top: 5, right: 5, bottom: 35, left: 80}
    var width = 400 - margin_scplt.left - margin_scplt.right,
        height = 200 -  margin_scplt.top -  margin_scplt.bottom;
            
    var barchart_plot = t_tip.append('svg').
        attr("width", width + margin_scplt['left'] + margin_scplt['right']).
        attr("height", height + margin_scplt['top'] + margin_scplt['bottom']).
        append("g").
        attr("transform", "translate(" + margin_scplt.left + "," + margin_scplt.top + ")");

    var x_scale_func = d3.scale.linear().
        range([0, width]).
        domain([0, 0.7]);

    var y_scale_func = d3.scale.ordinal().
        rangeRoundBands([0, height], .1).
        domain(params_for_barchart);

    var x_axis_func = generate_axis(x_scale_func, height, 'bottom').tickFormat(d3.format('%'));
    var y_axis_func = generate_axis(y_scale_func, width, 'left');

    barchart_plot.selectAll('rect').
        data(barchart_ds).
        enter().
        append('rect').
        attr({
            'x': 0,
            "width": function(d){return x_scale_func(d['value'])},
            "y": function(d) {return y_scale_func(d['key'])},
            'height': function(d){return y_scale_func.rangeBand()},
            'fill': function(d){
                if(['Cancelled', 'Chargedoff', 'Defaulted', 'Past Due'].indexOf(d['key']) > -1) {
                    return '#fc8d59'
                } else {
                    return '#91bfdb'
                }
            }
        });

    barchart_plot.append("g").
        attr({
            'class': 'x axis',
            "transform": "translate(0," + height + ")"
        })
        .call(x_axis_func);

    barchart_plot.append("g")
        .attr("class", "y axis")
        .call(y_axis_func);    
}
