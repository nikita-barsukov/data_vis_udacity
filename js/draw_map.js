function draw_map() {
    var width = 600,
        height= 400;

    var tooltip = $("#tooltip")      

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
                tooltip.css({
                    "display":"block",
                    "top": (d3.event.pageY) + "px" ,
                    "left": (d3.event.pageX + 10) + "px"
                });
                tooltip.html('<h2>TOOLTIP</h2>')
            })
            .on("mousemove", function(d){
                tooltip.css({
                    "top": (d3.event.pageY) + "px" ,
                    "left": (d3.event.pageX + 10) + "px"                    
                })
            })
            .on("mouseout", function(d){
                tooltip.css("display", "none");
                tooltip.empty();
            });;

    }
}
