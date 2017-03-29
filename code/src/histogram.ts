/// <reference path="../node_modules/@types/d3/index.d.ts" />

namespace ninjaPixel {

    export class Histogram extends ninjaPixel.Chart {
        private _cornerRounding: number = 1;
        private _bins;
        private _plotFrequency: boolean = true; // if false, will plot the probability on the y scale

        cornerRounding(_x: number): any {
            if (!arguments.length) return this._cornerRounding;
            this._cornerRounding = _x;
            return this;
        }
        bins(_x: number): any {
            if (!arguments.length) return this._bins;
            this._bins = _x;
            return this;
        }
        plotFrequency(_x: boolean): any {
            if (!arguments.length) return this._plotFrequency;
            this._plotFrequency = _x;
            return this;
        }

        private _histogramFunction = d3.histogram();

        constructor() { super(); }


        plot(_selection) {

            _selection.each((_data) => {
                this._init(_selection);
                let functor = this._functor;
                let myToolTip = this._toolTip;




                // Update the x-sca
                // let xScale = d3.scaleBand()
                //     .range([0, this._chartWidth])
                //     .padding(0.1);
                let xScale = d3.scaleLinear()
                    .range([0, this._chartWidth]);
                const xObjects = _data.map(d => {
                    return { x: d };
                });
                const {min, max} = this._getMinMaxX(xObjects);
                xScale.domain([min, max]);

                // Compute the histogram.
                if (this._bins != null) {
                    xScale.ticks(this._bins);
                    this._histogramFunction.thresholds(xScale.ticks());
                }
                const bins = this._histogramFunction.domain([min, max])(_data);
                // let barWidth = 0.9 * this._chartWidth / bins.length;


                // Update the y-scale.
                let yMax: number = 0;
                if (this._y1Max != null) {
                    yMax = this._y1Max;
                } else {
                    yMax = d3.max(bins, (d: number[]) => d.length);
                }

                let yScale = d3.scaleLinear()
                    .domain([0, yMax])
                    .range([this._chartHeight, 0]);


                let bar = this._svg.select('.ninja-chartGroup')
                    .call(myToolTip)
                    .selectAll('.bars')
                    .data(bins);

                const enterBar = bar.enter().append('rect')
                    .classed('bars', true)
                    .attrs({
                        'x': function(d) {
                            return xScale(d.x0);
                        },
                        'y': function(d) {
                            return yScale(0);
                        },
                        'height': function(d) {
                            return 0;
                        },
                        'width': function(d){
                          return xScale(d.x1-d.x0);
                        },
                        fill: (d, i) => { return functor(this._itemFill, d, i); },
                        rx: this._cornerRounding,
                        ry: this._cornerRounding,
                        opacity: (d, i) => { return functor(this._itemOpacity, d, i); }
                    });
                bar.exit().remove();
                bar.merge(enterBar).transition()
                    .duration(this._transitionDuration)
                    .ease(this._transitionEase)
                    .attrs({
                        'x': function(d) {
                            return xScale(d.x0);
                        },
                        'width': function(d){
                          return xScale(d.x1-d.x0);
                        },
                        'y': function(d) {
                            return yScale(d.length);
                        },
                        'height': function(d) {
                            // return yScale.range()[0] - yScale(d.y);
                            return yScale(0) - yScale(d.length);
                        },
                        fill: (d, i) => { return functor(this._itemFill, d, i); },
                        opacity: (d, i) => { return functor(this._itemOpacity, d, i); }
                    });

                this._plotLabels();
                this._plotXAxis(xScale, yScale);
                this._plotYAxis(xScale, yScale);
                // end of _data loop
            });
        }

    }
}
