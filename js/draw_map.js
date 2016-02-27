function draw_map() {
    var width = 600,
        height= 400;

    var tooltip = d3.select("#tooltip")

    var projection = d3.geo.albersUsa()
        .scale(780)
        .translate([width / 2, height / 2]);

    var color_scale_func = d3.scale.quantile()
        .domain([0.15,0.2])
        .range(colorbrewer['OrRd'][5]); // Colorbrewer is a color palette library.

    var path = d3.geo.path()
        .projection(projection);

    var map = d3.select("#map").append("svg")
        .attr("width", width)
        .attr("height", height);

    queue()
        .defer(d3.json, "/js/vendor/USA.json")
        .defer(d3.csv, "/data/map_data.csv")
        .await(ready);
    
    function ready(error, us, dataset) {
        map.selectAll('path')
            .data(topojson.feature(us, us.objects.units).features)
            .enter().append('path')
            .attr({
                'd': path,
                'class': function(d){return d['id']} ,
                'fill': function(d){
                            datapoint = _.find(dataset, function(point){
                                return point['id'] == d['id']
                            })
                            // DC is absent from map dataset
                            // Since it's too small to be noticeable on map,
                            // Instead of fixing data
                            // I just return white color for DC polygon fill.
                            if(typeof datapoint === 'undefined'){
                                return('#fff')
                            };
                            return color_scale_func(datapoint['interest'])
                        }
                })
            .on('mouseover', function(d){
                tooltip.style({
                    "display":"block",
                    "top": (d3.event.pageY - 20) + "px" ,
                    "left": (d3.event.pageX + 10) + "px"
                });
                datapoint = _.find(dataset, function(point){
                    return point['id'] == d['id']
                })
                draw_tooltip_plot(tooltip, datapoint, color_scale_func(datapoint['interest']));
                d3.selectAll("." + d['id']).classed("highlighted", true).moveToFront()
            })
            .on("mousemove", function(d){
                tooltip.style({
                    "top": (d3.event.pageY - 20) + "px" ,
                    "left": (d3.event.pageX + 10) + "px"                    
                })
            })
            .on("mouseout", function(d){
                d3.selectAll("." + d['id']).classed("highlighted", false)                
                tooltip.style("display", "none");
                tooltip.html("");
            });

    }
}

function draw_tooltip_plot(t_tip, dataset, color){

    t_tip.append('p').append('b')
        .text(dataset['name']);

    t_tip.append('p')
        .html('Avg. interest rate: <b>' + d3.format(".2%")(dataset['interest']) + '</b>');

    var barchart_ds = []
    var params_for_barchart = ["Cancelled","Chargedoff","Completed","Current","Defaulted","Final Payment","Past Due"]
    Object.keys(dataset).forEach(function(d){
        if (params_for_barchart.indexOf(d) > -1) {
            barchart_ds.push({'key': d, 'value': dataset[d]})
        }
    })

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
        domain([0, 0.7])

    var y_scale_func = d3.scale.ordinal().
        rangeRoundBands([0, height], .1).
        domain(params_for_barchart);

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
        .tickPadding(10); 

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
        .call(x_axis_func)

    barchart_plot.append("g")
        .attr("class", "y axis")
        .call(y_axis_func)     
}
