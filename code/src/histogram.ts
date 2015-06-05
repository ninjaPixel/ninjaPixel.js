/// <reference path="typescript_definitions/d3.d.ts" />
/// <reference path="chart.ts" />
module ninjaPixel{
    
 export class Histogram extends ninjaPixel.Chart{
    private _cornerRounding: number = 1;
    private _bins;
    private _plotFrequency: boolean = true; // if false, will plot the probability on the y scale

    cornerRounding(_x: number):any {
        if (!arguments.length) return this._cornerRounding;
        this._cornerRounding = _x;
        return this;
    }
    bins(_x: number):any {
        if (!arguments.length) return this._bins;
        this._bins = _x;
        return this;
    }
    plotFrequency(_x: boolean):any {
        if (!arguments.length) return this._plotFrequency;
        this._plotFrequency = _x;
        return this;
    }
    
    private _histogramFunction = d3.layout.histogram();
    

    
    
    constructor(){super();}
     
     plot(_selection){        
        _selection.each((_data) => {
            this._init(_selection);        
            var functor = this._functor;
            var myToolTip = this._toolTip;
            
                
            // Compute the histogram. 
            if(this._bins != null){
             this._histogramFunction.bins(this._bins);   
            }
            this._histogramFunction.frequency(this._plotFrequency);
            _data = this._histogramFunction(_data);
         
            // Update the x-scale.
            var xScale = d3.scale.ordinal()
                .domain(_data.map(function (d) {
                    return d.x;
            }));
            xScale.rangeRoundBands([0, this._chartWidth], .1);
            var barWidth = xScale.rangeBand();


            // Update the y-scale.
            var yMax = d3.max(_data, function (d :{y}) {
                return d.y;
            });
            if (this._y1Max != null) {
                yMax = this._y1Max;
            }

            var yScale = d3.scale.linear()
                .domain([0, yMax])
                .range([this._chartHeight, 0]);
         
         
            var bar = this._svg.select('.ninja-chartGroup')
                .call(myToolTip)
                .selectAll('.bars')
                .data(_data);
            
            bar.enter().append('rect')
                .classed('bars', true)
                .attr({
                    'x': function (d) {
                        return xScale(d.x);
                    },
                    'y': function (d) {
                        return yScale(0);
                    },
                    'height': function (d) {
                        return 0;
                    },
                    fill: (d,i) => {return functor(this._itemFill, d, i);},
                    rx: this._cornerRounding,
                    ry: this._cornerRounding,
                    opacity: (d,i) => {return functor(this._itemOpacity, d, i);}
                });
            bar.exit().remove();
            bar.transition()
                .duration(this._transitionDuration)
                .ease(this._transitionEase)
                .attr('width', barWidth)
                .attr({
                    'x': function (d) {
                        return xScale(d.x);
                    },
                    'y': function (d) {
                        return yScale(d.y);
                    },
                    'height': function (d) {
                        return yScale.range()[0] - yScale(d.y);
                    },
                    fill: (d,i) => {return functor(this._itemFill, d, i);},
                    opacity: (d,i) => {return functor(this._itemOpacity, d, i);}
                });
         
            this._plotLabels();
            this._plotXAxis(xScale, yScale);
            this._plotYAxis(xScale, yScale); 
         // end of _data loop
         });
     }
     
    }
}