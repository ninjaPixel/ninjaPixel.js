/// <reference path="typescript_definitions/d3.d.ts" />
/// <reference path="chart.ts" />
// declare var d3: D3.Base;
module ninjaPixel{
     
    export class Treemap extends ninjaPixel.Chart{
        constructor(){
            super();
        }
        
        plot(_selection) {
            this._init(_selection, Category.treemap);
            var functor = this._functor;
            function position() {
                
                this.style('left', function(d) {
                        return d.x + 'px';
                    })
                    .style('top', function(d) {
                        return d.y + 'px';
                    })
                    .style('width', function(d) {
                        return Math.max(0, d.dx - 1) + 'px';
                    })
                    .style('height', function(d) {
                        return Math.max(0, d.dy - 1) + 'px';
                    });
            }
            var color = d3.scale.category20c();

            _selection.each((_data) => {
                
                
                var treemapLayout = d3.layout.treemap()
                    .size([this._chartWidth, this._chartHeight])
                    .sticky(true)
                    .value(function(d) {
                        return d.size;
                    });
                
                var treemap = this._svg.select('.ninja-chartGroup')
//                    .append('div')
//                    .style('position', 'relative')
//                    .call(myToolTip)
                    .datum(_data)
                    .selectAll('.treemap-node')                        
                    .data(treemapLayout.nodes);
                
        
                treemap.enter().append('rect')
                    .attr('class', 'treemap-node')
                    .call(position)
                    .attr({
                        x: (d) => { return d.x;},
                        width: (d) => { return Math.max(0, d.dx - 1);},
                        y: (d) => { return d.y;},
                        height: (d) => { return Math.max(0, d.dy - 1);},
                        fill: (d, i) => {return functor(this._itemFill, d, i);}
                    })
                    .style('fill', function(d) {
                        var bgColor =  d.children ? color(d.name) : null;
                        return bgColor;
                    })
                    .text(function(d) {
                        return d.children ? null : d.name;
                    });

                treemap.transition()
                    .duration(this._transitionDuration)
                    .call(position);
                
            });
        }
    }
}