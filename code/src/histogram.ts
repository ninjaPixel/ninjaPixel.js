/// <reference path="../node_modules/@types/d3/index.d.ts" />

namespace ninjaPixel{

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

    private _histogramFunction = d3.histogram();

    constructor(){super();}


     plot(_selection){
       const average = (v1:number, v2:number):number=>{
         return (v1+v2)/2;
       };
        _selection.each((_data) => {
            this._init(_selection);
            let functor = this._functor;
            let myToolTip = this._toolTip;


            // Compute the histogram.
            if(this._bins != null){
            //  this._histogramFunction.bins(this._bins);
            }
            // this._histogramFunction.frequency(this._plotFrequency);
            _data = this._histogramFunction(_data);

            // Update the x-scale.
            let xScale = d3.scaleBand()
                .domain(_data.map(function (d) {
                  // return average(d.x1, d.x0);
                  return d.x1;
            }));
            xScale.range([0, this._chartWidth])
            .padding(0.1);
            // let barWidth = xScale.rangeBand();
            let barWidth = xScale.bandwidth();
console.log('barwidth',barWidth)

            // Update the y-scale.
            let yMax:number = 0;// d3.max(_data, function (d :{y}) {
            //     return d.y;
            // });

            if (this._y1Max != null) {
                yMax = this._y1Max;
            }else{
              yMax = d3.max(_data, (d:number[])=>d.length);
            }
            console.log('histo _data',_data);
            console.log('histo yMax',yMax);

            let yScale = d3.scaleLinear()
                .domain([0, yMax])
                .range([this._chartHeight, 0]);


            let bar = this._svg.select('.ninja-chartGroup')
                .call(myToolTip)
                .selectAll('.bars')
                .data(_data);

            const enterBar = bar.enter().append('rect')
                .classed('bars', true)
                .attrs({
                    'x': function (d) {
                        return xScale(d.x1);
                    },
                    'y': function (d) {
                        return yScale(0);
                    },
                    'height': function (d) {
                        return 0;
                    },
                    'width': function(d){
                      return barWidth;
                    },
                    fill: (d,i) => {return functor(this._itemFill, d, i);},
                    rx: this._cornerRounding,
                    ry: this._cornerRounding,
                    opacity: (d,i) => {return functor(this._itemOpacity, d, i);}
                });
            bar.exit().remove();
            bar.merge(enterBar).transition()
                .duration(this._transitionDuration)
                .ease(this._transitionEase)
                .attrs({
                    'x': function (d) {
                      // return xScale(average(d.x0,d.x1));
                      return xScale(d.x1);

                    },
                    'y': function (d) {
                        return yScale(d.length);
                    },
                    'height': function (d) {
                      // return yScale.range()[0] - yScale(d.y);
                      return yScale(0)-yScale(d.length);
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
