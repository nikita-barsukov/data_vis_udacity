function draw_range_plot() {
    d3.csv('data/interest_rate_state.csv', function(data){
        var margin_scplt = {top: 5, right: 0, bottom: 35, left: 100}
        var width = 600 - margin_scplt.left - margin_scplt.right,
            height = 700 -  margin_scplt.top -  margin_scplt.bottom;
            
        var quartile_plot = d3.select("#rate_quartiles").append('svg').
            attr("width", width + margin_scplt['left'] + margin_scplt['right']).
            attr("height", height + margin_scplt['top'] + margin_scplt['bottom']).
            append("g").
            attr("transform", "translate(" + margin_scplt.left + "," + margin_scplt.top + ")");
        
        var states = data.map(function(d){return d['state']})
        var quartile_x_func = d3.scale.linear().
            range([0, width]).
            domain([0.1, 0.3])

        var quartile_y_func = d3.scale.ordinal().
            domain(states).
            rangeRoundBands([0, height], 1);

        var x_axis_func = d3.svg.axis()
            .scale(quartile_x_func)
            .orient("bottom")
            .innerTickSize(-height)
            .outerTickSize(0)
            .tickPadding(10)
            .tickFormat(d3.format('%'));

        var y_axis_func = d3.svg.axis()
            .scale(quartile_y_func)
            .orient("left")
            .innerTickSize(-width)
            .outerTickSize(0)
            .tickPadding(10);        

        quartile_plot.selectAll('line').
            data(data).
            enter().
            append('line').
            attr({
                'x1': function(d){return quartile_x_func(d['q_1'])},
                'x2': function(d){return quartile_x_func(d['q_3'])},
                'y1': function(d){return quartile_y_func(d['state'])},
                'y2': function(d){return quartile_y_func(d['state'])},
                'stroke': "black",
                'stroke-width': "2"
            });

        quartile_plot.selectAll('circle').
            data(data).
            enter().
            append('circle').
            attr({
                'cx': function(d){return quartile_x_func(d['q_2'])},
                'cy': function(d){return quartile_y_func(d['state'])},
                'fill': "gray",
                'r': "3"
            });

        quartile_plot.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(x_axis_func)

        quartile_plot.append("g")
            .attr("class", "y axis")
            .call(y_axis_func)        
    })

}
