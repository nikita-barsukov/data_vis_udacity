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

        var legend = map.append("g").attr("class", "legend");

        legend.append("rect")
            .attr("class", "legend-background")
            .attr("x", width - 120)
            .attr("y", 240)
            .attr("rx", 10)
            .attr("ry", 10)
            .attr("width", 100)
            .attr("height", 45 + 22 * (d3.range(color_buckets).length - 1));

        legend.selectAll(".legend-block")
            .data(d3.range(color_buckets))
            .enter().append("rect")
                .attr("width", 40)
                .attr("height", 20)
                .attr("y", function(d, i){ return 245 + i*23;})
                .attr("x", width - 110)
                .attr("fill", function(d,i){return colorbrewer['OrRd'][color_buckets][i]})
                .attr("class", "legend-block");

        legend.selectAll("text")
                .data(color_scale_func.quantiles())
            .enter().append("text")
                .attr("text-anchor", "start")
                .attr("x", width - 100)
                .attr("y", function(d, i){return 257 + i*23})
                .attr("dx", 35) 
                .attr("dy", 15)
                .attr("class", "legend")
                .text(function (d){return d3.format(".2%")(d) } );
    }
}
