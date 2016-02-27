function draw_scatter(){
    d3.csv('/data/interest_vs_bad_loans.csv', function(data){
        var margin_scplt = {top: 5, right: 20, bottom: 55, left: 50}
        var width = 600 - margin_scplt.left - margin_scplt.right,
            height = 500 -  margin_scplt.top -  margin_scplt.bottom;
        var tooltip = d3.select("#tooltip");
            
        var scatterplot = d3.select("#scatterplot").append('svg').
            attr("width", width + margin_scplt['left'] + margin_scplt['right']).
            attr("height", height + margin_scplt['top'] + margin_scplt['bottom']).
            append("g").
            attr("transform", "translate(" + margin_scplt.left + "," + margin_scplt.top + ")");

        var x_scale_func = d3.scale.linear().
            range([0, width]).
            domain([0, 0.4])

        var y_scale_func = d3.scale.linear().
            range([height, 0]).
            domain([0.14, 0.22]);

        var x_axis_func = d3.svg.axis()
            .scale(x_scale_func)
            .orient("bottom")
            .innerTickSize(-height)
            .outerTickSize(0)
            .tickPadding(10)
            .tickFormat(d3.format('%'));

        var y_axis_func = d3.svg.axis()
            .scale(y_scale_func)
            .orient("left")
            .innerTickSize(-width)
            .outerTickSize(0)
            .tickPadding(10)
            .tickFormat(d3.format('%'));

        scatterplot.selectAll('circle').
            data(data).
            enter().
            append('circle').
            attr({
                'cx': function(d){return x_scale_func(d['bad_loans'])},
                'cy': function(d){return y_scale_func(d['interest'])},
                'fill': "black",
                'r': "3"
            })
            .on('mouseover', function(d){
                tooltip.style({
                    "display":"block",
                    "top": (d3.event.pageY - 20) + "px" ,
                    "left": (d3.event.pageX + 10) + "px"
                });
                scatter_tooltip(tooltip, d);                
            })
            .on("mousemove", function(d){
                tooltip.style({
                    "top": (d3.event.pageY - 20) + "px" ,
                    "left": (d3.event.pageX + 10) + "px"                    
                })
            })
            .on("mouseout", function(d){
                tooltip.style("display", "none");
                tooltip.html("");
            });            

        scatterplot.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(x_axis_func)
            .append("text")
            .attr("x", width/2-100)
            .attr("y", 50)
            .attr("dx", ".71em")
            .text("Avg. interest rate");

        scatterplot.append("g")
            .attr("class", "y axis")
            .call(y_axis_func)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 15)
            .style("text-anchor", "end")
            .text("Share of bad loans");
    })
}

function scatter_tooltip(t_tip, dataset){
    t_tip.append('p').append('b').text(dataset['name']);
    var tbl = t_tip.append('table');

    var row_1 = tbl.append('tr');
    row_1.append('td').text('Interest rate:');
    row_1.append('td').text(d3.format(".2%")(dataset['interest']));

    var row_2 = tbl.append('tr')
    row_2.append('td').text('Share of bad loans:');
    row_2.append('td').text(d3.format(".2%")(dataset['bad_loans']));
}
