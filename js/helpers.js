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
