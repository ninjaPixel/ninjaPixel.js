/// <reference path="./typescript_definitions/ninjaTypes/index.d.ts" />


namespace ninjaPixel {
    interface horizontalBarChartDataItem {
        color?: string;
        y: string;
        x: number;
    }

    export class HorizontalBarChart extends ninjaPixel.Chart {
        _cornerRounding: number = 1;
        _xScale: any;
        _yScale: any;
        _barScale: any;
        _yScaleAdjusted: any;

        cornerRounding(_x: number): any {
            if (!arguments.length) return this._cornerRounding;
            this._cornerRounding = _x;
            return this;
        }

        private _isTimeseries: boolean = false;

        isTimeseries(_x): any {
            if (!arguments.length) return this._isTimeseries;
            this._isTimeseries = _x;
            return this;
        }

        private _barWidth: number;

        barWidth(_x): any {
            if (!arguments.length) return this._barWidth;
            this._barWidth = _x;
            return this;
        }

        constructor() {
            super();
        }

        plot(_selection, barHeight?: number) {
            if (this._barWidth) {
                // auto calc the height of the chart
                var barCount = 1;
                _selection.each((_data) => {
                    if (_data.length > barCount) {
                        barCount = _data.length;
                    }
                });
                this._height = (this._barWidth * barCount * 1.5) + this._margin.top + this._margin.bottom;
            }

            this._init(_selection);
            let functor = this._functor;
            let myToolTip = this._toolTip; //need to reference this variable in local scope as when I come to call the tooltip, it is within a function that is referencing a differnt 'this'
            let onClick = this._onClick;
            let defaultBarOpacity: any = this._itemOpacity;
            let defaultStroke = this._itemStroke;
            let barFill = this._itemFill;
            const genericMouseoverBehaviour = this._genericMouseoverBehaviour.bind(this);
            const genericMouseoutBehaviour = this._genericMouseoutBehaviour.bind(this);

            function getMinDate(theData) {
                return d3.min(theData, (d: {y: number}) => {
                    return new Date(d.y).getTime();
                });
            }

            function getMaxDate(theData) {
                return d3.max(theData, (d: {y: number}) => {
                    return new Date(d.y).getTime();
                });
            }

            _selection.each((_data) => {
                var barH: number;
                if (barHeight != null) {
                    // set by other functions e.g. lollipop chart
                    barH = barHeight;
                }
                else if (this._barWidth) {
                    // set by the user
                    barH = this._barWidth;
                }
                else {
                    if (this._isTimeseries) {
                        barH = 0.9 * this._chartWidth / (_data.length + 1);
                    } else {
                        barH = 0; // revisit this once we have xScale and do:  xScale.rangeBand();
                    }
                }
                var minData: any = 0;
                var maxData: any = 0;

                if (this._xMin != null) {
                    minData = this._xMin;
                } else {
                    var d3MinX = d3.min(_data, (d: horizontalBarChartDataItem) => d.x);
                    if (d3MinX < 0) {
                        minData = d3MinX;
                    }
                }
                if (this._xMax != null) {
                    maxData = this._xMax;
                } else {
                    var d3MaxX = d3.max(_data, (d: horizontalBarChartDataItem) => d.x);
                    if (d3MaxX > 0) {
                        maxData = d3MaxX;
                    }

                    // if the max and min are the same value, then there is no range for us to plot with.
                    // only do this when the user hasn't specified the max.
                    if (maxData === minData) {
                        maxData += 10;
                    }
                }


                if (this._isTimeseries) {
                    // completely untested
                    console.warn('The timeseries option is untested.');
                    var minY, maxY;
                    if (this._xMin != null) {
                        minY = new Date(this._y1Min).getTime();
                    } else {
                        minY = getMinDate(_data);
                    }
                    if (this._xMax != null) {
                        maxY = new Date(this._y1Max).getTime();
                    } else {
                        maxY = getMaxDate(_data);
                    }

                    this._yScale = d3.scaleTime()
                        .domain([minY, maxY])
                        .range([0 + barH, this._chartHeight - barH]);
                } else {
                    this._yScale = d3.scaleBand()
                        .domain(_data.map(function (d, i) {
                            return d.y;
                        }))
                        .range([0, this._chartHeight])
                        .padding(0.1);
                }


                this._xScale = d3.scaleLinear()
                    .domain([minData, maxData])
                    .range([0, this._chartWidth]);

                this._barScale = d3.scaleLinear()
                    .domain([Math.abs(maxData - minData), 0])
                    .range([this._chartHeight, 0]);

                const xScale = this._xScale;
                const yScale = this._yScale;
                const barScale = this._barScale;

                if (barH <= 0) {
                    barH = yScale.bandwidth();
                }

                // set bar adjustment
                var barAdjustmentY = 0;
                if (this._isTimeseries) {
                    barAdjustmentY = -barH / 2;
                }
                if (barHeight != null) {
                    // set by other functions e.g. lollipop chart. Untested
                    barAdjustmentY = (yScale.bandwidth() - barH) / 2;

                }


                function yScaleAdjusted(y) {
                    return yScale(y) + barAdjustmentY;
                }

                this._yScaleAdjusted = yScaleAdjusted;

                // Enter, Update, Exit on bars
                const xScale0 = xScale(0);
                const bars = this._svg.select('.ninja-chartGroup')
                    .call(myToolTip)
                    .selectAll('.bar')
                    .data(_data, function (d) {
                        return d.y;
                    });

                const enterBars = bars.enter().append('rect')
                    .classed('bar', true)
                    .attrs({
                        y: function (d, i) {
                            return yScaleAdjusted(d.y);
                        },
                        width: 0,
                        x: xScale0,
                        height: barH,
                        fill: (d, i) => {
                            return functor(this._itemFill, d, i)
                        },
                        rx: this._cornerRounding,
                        ry: this._cornerRounding
                    })
                    .on('mouseover', function (d, i) {
                        genericMouseoverBehaviour(this, d, i);
                    })
                    .on('mouseout', function (d, i) {
                        genericMouseoutBehaviour(this,d,i);
                    })
                    .on('click', function (d, i) {
                        onClick(d);
                    });

                bars.merge(enterBars)
                    .transition()
                    .duration(this._transitionDuration)
                    .delay((d, i) => {
                        return functor(this._transitionDelay, d, i);
                    })
                    .ease(this._transitionEase)
                    .styles({
                        opacity: (d, i) => {
                            return functor(defaultBarOpacity, d, i);
                        },
                        stroke: (d, i) => {
                            return functor(defaultStroke, d, i);
                        },
                        fill: (d, i) => {
                            return functor(barFill, d, i);
                        }
                    })
                    .attrs({
                        y: function (d, i) {
                            return yScaleAdjusted(d.y);
                        },
                        height: barH,
                        x: xScale(0),
                        width: function (d) {
                            var width;
                            if (d.x > 0) {
                                width = xScale(d.x);
                            } else {
                                width = xScale(0);
                            }
                            if (width > 0) {
                                return width;
                            } else {
                                return 0;
                            }
                        }
                    });

                bars.exit()
                    .transition()
                    .duration((d, i) => {
                        return functor(this._removeTransitionDelay, d, i);
                    })
                    .ease(this._transitionEase)
                    .attrs({
                        x: 0
                    })
                    .delay((d, i) => {
                        return functor(this._removeDelay, d, i);
                    })

                    .remove();

                this._plotLabels();
                this._plotXYAxes(xScale, yScale);

            });
            //end BarChart
        }


    }
}
