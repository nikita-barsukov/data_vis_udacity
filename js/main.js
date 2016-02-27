$(document).ready(function(){
    d3.selection.prototype.moveToFront = function() {
      return this.each(function(){
        this.parentNode.appendChild(this);
      });
    };	
    draw_range_plot();
    draw_map();  
})
