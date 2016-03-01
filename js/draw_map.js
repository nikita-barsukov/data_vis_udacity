function draw_map() {
    var width = 650,
        height= 400;

    var tooltip = d3.select("#tooltip"); //initial style is in css/main.css
    var color_buckets = 5;

    var projection = d3.geo.albersUsa()
        .scale(780)
        .translate([width / 2, height / 2]);

    var color_scale_func = d3.scale.quantile()
        .domain([0.15,0.2])
        .range(colorbrewer['OrRd'][color_buckets]); 
        // Colorbrewer is a color palette library, 
        // Defined in js/vendor/colorbrewer.js
        // http://colorbrewer2.org/
        // https://github.com/mbostock/d3/blob/master/lib/colorbrewer/colorbrewer.js

    var path = d3.geo.path()
        .projection(projection);

    var map = d3.select("#map").append("svg")
        .attr("width", width)
        .attr("height", height);

    queue()
        .defer(d3.json, "js/vendor/USA.json")
        .defer(d3.csv, "data/map_data.csv")
        .await(ready);
    
    function ready(error, us, dataset) {
        map.selectAll('path') // drawing a map
            .data(topojson.feature(us, us.objects.units).features)
            .enter().append('path')
            .attr({
                'd': path,
                'class': function(d){return d['id']} ,
                'fill': function(d){
                    // finding loan quality data from dataset by state ID
                    datapoint = _.find(dataset, function(point){
                        return point['id'] == d['id']
                    });
                    // DC is absent from map dataset
                    // Since it's too small to be noticeable on map,
                    // Instead of fixing data
                    // I just return white color for DC polygon fill.
                    if(typeof datapoint === 'undefined'){
                        return('#fff')
                    };
                    return color_scale_func(datapoint['interest']);
                }
            })
            .on('mouseover', function(d){
                tooltip.style({ // tooltip appears on mouseover
                    "display":"block",
                    "top": (d3.event.pageY - 20) + "px" ,
                    "left": (d3.event.pageX + 10) + "px"
                });
                // Finding data for hovered state
                datapoint = _.find(dataset, function(point){
                    return point['id'] == d['id']
                });
                draw_tooltip_plot(tooltip, datapoint, color_scale_func(datapoint['interest']));
                d3.selectAll("." + d['id']).classed("highlighted", true).moveToFront();
            })
            .on("mousemove", function(d){
                tooltip.style({
                    "top": (d3.event.pageY - 20) + "px" ,
                    "left": (d3.event.pageX + 10) + "px"                    
                });
            })
            .on("mouseout", function(d){ // tooltip disappears when mouse is out from a state
                d3.selectAll("." + d['id']).classed("highlighted", false);
                tooltip.style("display", "none");
                tooltip.html("");
            });

        var legend = map.append("g")
            .attr({
                "class": "legend",
                "transform": "translate(10,0)"
            });

        legend.append('text')
            .attr({
                'x': width-110,
                'y': 240
            })
            .text('Interest rate');

        legend.append("rect")
            .attr({
                "class": "legend-background",
                "x": width - 120,
                "y": 240,
                "rx": 10,
                "ry": 10,
                "width": 100,
                "height": 45 + 22 * (d3.range(color_buckets).length - 1)
            });

        legend.selectAll(".legend-block")
            .data(d3.range(color_buckets))
            .enter().append("rect")
                .attr({
                    "width": 40,
                    "height": 20,
                    "y": function(d, i){ return 245 + i*23;},
                    "x": width - 110,
                    "fill": function(d,i){return colorbrewer['OrRd'][color_buckets][i]},
                    class: 'legend-block'
                })

        legend.selectAll(".legend-label")
            .data(color_scale_func.quantiles())
            .enter()
            .append("text")
            .attr({
                "text-anchor": "start",
                "x": width - 100,
                "y": function(d, i){return 257 + i*23},
                "dx": 35,
                "dy": 15,
                "class": "legend-label",
            })
            .text(function (d){return d3.format(".2%")(d) } );
    }
}
