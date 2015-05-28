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
            var myToolTip = this._toolTip; //need to reference this variable in local scope as when I come to call the tooltip, it is within a function that is referencing a differnt 'this'
            var onMouseover = this._onMouseover;
            var onMouseout = this._onMouseout;
            var onClick = this._onClick;
            var mouseOverOpacity: any = this._mouseOverItemOpacity;
            var defaultOpacity: any = this._itemOpacity;
            var mouseOverStroke = this._mouseOverItemStroke;
            var defaultStroke = this._itemStroke;
            var barFill = this._itemFill;


            

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
//                    .call(position)
                    .attr({
                        x: (d) => { return d.x;},
                        width: (d) => { return Math.max(0, d.dx - 1);},
                        y: (d) => { return d.y;},
                        height: 0,
                        fill: (d, i) => {return functor(this._itemFill, d, i);}
                    })
                    .style({
                        opacity: (d, i) => {return functor(defaultOpacity,d, i);}, // Re-sets the opacity
                        stroke:  (d,i) => {return functor(defaultStroke, d, i);}
                    })
                    .text(function(d) {
                        return d.children ? null : d.name;
                    });

                treemap.transition()
                    .duration(this._transitionDuration)
                    .attr({
                        x: (d) => { return d.x;},
                        width: (d) => { return Math.max(0, d.dx - 1);},
                        y: (d) => { return d.y;},
                        height: (d) => { return Math.max(0, d.dy - 1);},
                        fill: (d, i) => {return functor(this._itemFill, d, i);}
                    })
                    .style({
                        opacity: (d, i) => {return functor(defaultOpacity,d, i);}, // Re-sets the opacity
                        stroke:  (d,i) => {return functor(defaultStroke, d, i);}
                    })
//                    .call(position);
                
            });
        }
    }
}