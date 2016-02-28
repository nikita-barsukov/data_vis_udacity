function generate_axis(scale_func, tick_size, orient) {
	return d3.svg.axis()
        	.scale(scale_func)
        	.orient(orient)
        	.innerTickSize(-tick_size)
        	.outerTickSize(0)
        	.tickPadding(10)
}
