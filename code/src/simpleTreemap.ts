/// <reference path="typescript_definitions/d3.d.ts" />
/// <reference path="chart.ts" />
// declare var d3: D3.Base;
namespace ninjaPixel{
     
    export class SimpleTreemap extends ninjaPixel.Chart{
        constructor(){
            super();
        }
        
        plot(_selection) {
            this._init(_selection, Category.simpleTreemap);
            
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
                
                var myTreemap: any = d3.layout.treemap()
                var treemapLayout = myTreemap 
                    .size([this._chartWidth, this._chartHeight])
                    .sticky(true)
                    .value(function(d:any) {
                        return d.size;
                    });
                
                var treemap = this._svg.select('.ninja-containerGroup')
                    .append('div')
                    .style('position', 'relative')
//                    .call(myToolTip)
                    .datum(_data)
                    .selectAll('.treemap-node')                        
                    .data(treemapLayout.nodes);
                
        
                treemap.enter().append('div')
                    .attr('class', 'treemap-node')
                    .call(position)
                    .style('background', function(d) {
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