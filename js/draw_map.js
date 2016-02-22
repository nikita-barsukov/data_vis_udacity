function draw_map() {
    var width = 600,
        height= 400;

    var projection = d3.geo.albersUsa()
        .scale(780)
        .translate([width / 2, height / 2]);

    var color_scale_func = d3.scale.quantile()
        .domain([0.15,0.2])
        .range(colorbrewer['OrRd'][5]);

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
            .attr('d', path)
            .attr('class', function(d){return d['id']})
            .attr('fill', function(d){
                datapoint = _.find(dataset, function(point){
                    return point['id'] == d['id']
                })
                if(typeof datapoint === 'undefined'){
                    return('#fff')
                };
                return color_scale_func(datapoint['interest'])
            })

    }
}
