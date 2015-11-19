/// <reference path="typescript_definitions/d3.d.ts" />
/// <reference path="chart.ts" />
module ninjaPixel{
    interface donutDataItem {
        color?: string;
        x: string;
        y: number;        
    }
 export class Donut extends ninjaPixel.Chart{
 
     private _outerRadius: number = 80;
     private _innerRadius: number = 50;
     
    outerRadius(_x: number):any {
        if (!arguments.length) return this._outerRadius;
        this._outerRadius = _x;
        return this;
    }
    innerRadius(_x: number):any {
        if (!arguments.length) return this._innerRadius;
        this._innerRadius = _x;
        return this;
    }
     

     
    constructor(){super();}
     
    plot(_selection){        
        _selection.each((_data) => {
            this._init(_selection, Category.donut);
            
            var arc = d3.svg.arc()
                .outerRadius(this._outerRadius)
                .innerRadius(this._innerRadius);

            var pie = d3.layout.pie()
                .sort(null)
                .value(function(d: any) {
                    return d.y;
                });
          
            var path = this._svg.select('.ninja-chartGroup')
                .selectAll('path')
                .data(pie(_data));
            
            path.enter()
                .append('path')
                .style({
                    opacity: (d, i) => {return this._functor(this._itemOpacity, d, i);}, 
                    stroke:  (d, i) => {return this._functor(this._itemStroke, d, i);},
                    fill:    (d, i) => {return this._functor(this._itemFill, d, i);}
                })
                .attr('d', arc)            
                .each(function(d) {
                    this._current = d;
                });


            path.transition()
                .duration(this._transitionDuration)
                .style({
                    opacity: (d, i) => {return this._functor(this._itemOpacity, d, i);}, 
                    stroke:  (d, i) => {return this._functor(this._itemStroke, d, i);},
                    fill:    (d, i) => {return this._functor(this._itemFill, d, i);}
                })
                .attr('d', arc)
                .attrTween('d', arcTween);


    
            plotDonutLabels(this);
            this._plotLabels();
            
            // Store the displayed angles in _current.
            // Then, interpolate from _current to the new angles.
            // During the transition, _current is updated in-place by d3.interpolate.
            function arcTween(a) {
                var i = d3.interpolate(this._current, a);
                this._current = i(0);
                return function(t) {
                    return arc(<any>i(t));
                };}
            
            function plotDonutLabels(that){
                var labels = that._svg.select('.ninja-chartGroup')
                    .selectAll('text.donut-label')
                    .data(pie(_data));

                labels.enter().append('text')
                    .classed('donut-label', true)                
                    .attr('dy', '.35em')
                    .style('text-anchor', 'middle')
                    .attr('transform', function(d) { return 'translate(' + arc.centroid(d) + ')'; });

                labels.transition()
                    .duration(that._transitionDuration)
                    .attr('transform', function(d) { return 'translate(' + arc.centroid(d) + ')'; })
                    .text(function(d) { return d.data.x; });

                labels.exit()
                    .transition()
                    .duration(that._transitionDuration)
                    .remove();
            }
            
            // end data loop
         }); 
     }
     
    }
    
}