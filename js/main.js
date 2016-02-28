$(document).ready(function(){
	// Function that puts a node to first place among its siblings
	//   This deals with a situation when adjacent map areas overlap highlighted area
	//   because they are higher in the DOM tree
    d3.selection.prototype.moveToFront = function() {
      return this.each(function(){
        this.parentNode.appendChild(this);
      });
    };	
    draw_range_plot(); // Defined in js/draw_range_plot.js
    draw_map();        // Defined in js/draw_map.js
    draw_scatter();    // Defined in js/draw_scatter.js
})
