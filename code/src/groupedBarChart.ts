/// <reference path="../node_modules/@types/d3/index.d.ts" />
/// <reference path="chart.ts" />

namespace ninjaPixel {
    interface singleItem {
        y: number;
        group: string;
        color?: string;
    }
    interface groupedBarChartDataItem {
        x: any; //string or datetime
        data: Array<singleItem>;
    }

    export class GroupedBarChart extends ninjaPixel.Chart {
        _cornerRounding: number = 1;
        _xScale: any;
        _yScale: any;
        _barScale: any;
        _xScaleAdjusted: any;
        _plotCount:number;

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
            this._plotCount = 0;
        }

        plot(_selection, barWidth?: number) {
            this._init(_selection);
            var functor = this._functor;
            var myToolTip = this._toolTip; //need to reference this variable in local scope as when I come to call the tooltip, it is within a function that is referencing a differnt 'this'
            var onMouseover = this._onMouseover;
            var onMouseout = this._onMouseout;
            var onClick = this._onClick;
            var mouseOverBarOpacity: any = this._mouseOverItemOpacity;
            var defaultBarOpacity: any = this._itemOpacity;
            var mouseOverBarStroke = this._mouseOverItemStroke;
            var defaultStroke = this._itemStroke;
            var barFill = this._itemFill;
            const genericMouseoverBehaviour = this._genericMouseoverBehaviour.bind(this);
            const genericMouseoutBehaviour = this._genericMouseoutBehaviour.bind(this);

            function getMinDate(theData) {
                return d3.min(theData, (d: { x: number }) => { return new Date(d.x).getTime(); });
            }

            function getMaxDate(theData) {
                return d3.max(theData, (d: { x: number }) => { return new Date(d.x).getTime(); });
            }

            _selection.each((_data) => {
                // find the unique groups
                var distinctGroups = [];
                _data.forEach(function(d: groupedBarChartDataItem) {
                    d.data.forEach(function(e: singleItem) {
                        if (distinctGroups.indexOf(e.group) < 0) {
                            distinctGroups.push(e.group);
                        }
                    });
                });



                var barW: number;
                if (barWidth != null) {
                    // set by other functions e.g. lollipop chart
                    barW = barWidth;
                }
                if (this._barWidth) {
                    // set by the user
                    barW = this._barWidth;
                }
                else {
                    if (this._isTimeseries) {
                        barW = 0.9 * this._chartWidth / (_data.length + 1);
                    } else {
                        barW = 0; // revisit this once we have xScale and do:  xScale.rangeBand();
                    }
                }
                var minData: any = 0;
                var maxData: any = 0;

                if (this._y1Min != null) {
                    minData = this._y1Min;
                } else {
                    _data.forEach(function(dd: groupedBarChartDataItem) {
                        var d3MinY = d3.min(dd.data, (d: singleItem) => d.y);
                        if (d3MinY < minData) {
                            minData = d3MinY;
                        }
                    });
                }
                if (this._y1Max != null) {
                    maxData = this._y1Max;
                } else {

                    _data.forEach(function(dd: groupedBarChartDataItem) {
                        var d3MaxY = d3.max(dd.data, (d: singleItem) => d.y);
                        if (d3MaxY > maxData) {
                            maxData = d3MaxY;
                        }
                    });
                    // if the max and min are the same value, then there is no range for us to plot with.
                    // only do this when the user hasn't specified the max.
                    if (maxData === minData) {
                        maxData += 10;
                    }
                }

                if (this._isTimeseries) {
                    const { min, max } = this._getMinMaxX(_data, this._isTimeseries);
                    this._xScale = d3.scaleTime()
                        .range([0 + barW, this._chartWidth - barW])
                        .domain([min, max]);
                } else {
                    this._xScale = d3.scaleBand()
                        .domain(_data.map(function(d, i) {
                            return d.x;
                        }))
                        .range([0, this._chartWidth])
                        .padding(0.1);
                }


                this._yScale = d3.scaleLinear()
                    .domain([minData, maxData])
                    .range([this._chartHeight, 0]);

                this._barScale = d3.scaleLinear()
                    .domain([Math.abs(maxData - minData), 0])
                    .range([this._chartHeight, 0]);

                var xScale = this._xScale;
                var yScale = this._yScale;
                var barScale = this._barScale;
                var xGroupScale = d3.scaleBand();


                if (barW <= 0) {
                    barW = xScale.bandwidth();
                }

                xGroupScale.domain(distinctGroups).rangeRound([0, barW]);



                var barAdjustmentX = 0;
                if (this._isTimeseries) {
                    barAdjustmentX = -barW / 2;
                }

                function xScaleAdjusted(x:any):number {
                    return xScale(x) + barAdjustmentX;
                }
                this._xScaleAdjusted = xScaleAdjusted;

                // Enter, Update, Exit on bars
                const yScale0 = yScale(0);
                const barsRoot = this._svg.select('.ninja-chartGroup')
                    .call(myToolTip)
                    .selectAll('.barGroup')
                    .data(_data, function(d) { return d.x; });

                const barsRootEnter = barsRoot.enter().append("g")
                    .attr("class", "barGroup")
                    .attr("transform", function(d) { return "translate(" + xScaleAdjusted(d.x) + ",0)" });


                barsRoot.merge(barsRootEnter).transition()
                    .duration(this._transitionDuration)
                    .attr("transform", function(d) { return "translate(" + xScaleAdjusted(d.x) + ",0)" });

                barsRoot.exit()
                    .transition()
                    .remove();

                var widthFactor = 0.95;

                let barsRootObject;
                if(this._plotCount++ ===0){
                  barsRootObject = barsRootEnter;
                }else{
                  barsRootObject = barsRoot;
                }
                const bars = barsRootObject
                    .selectAll(".bar")
                    .data(function(d) {
                      return d.data;
                    }, function(d){
                      return d.group
                    });

                const barsEnter = bars.enter().append('rect')
                    .classed('bar', true)
                    .attrs({
                        x: function(d, i) {
                            return xGroupScale(d.group);
                        },
                        width: function(d, i) { return widthFactor * xGroupScale.bandwidth(); },
                        y: yScale0,
                        height: 0,
                        fill: (d, i) => { return functor(this._itemFill, d, i) },
                        rx: this._cornerRounding,
                        ry: this._cornerRounding
                    })
                    .on('mouseover', function(d, i) {
                        genericMouseoverBehaviour(this, d, i);
                    })
                    .on('mouseout', function(d, i) {
                        genericMouseoutBehaviour(this, d, i);
                    })
                    .on('click', function(d, i) {
                        onClick(d);
                    });

                bars.merge(barsEnter).transition()
                    .duration(this._transitionDuration)
                    .delay((d, i) => { return functor(this._transitionDelay, d, i); })
                    .ease(this._transitionEase)
                    .styles({
                        opacity: (d, i) => { return functor(defaultBarOpacity, d, i); },
                        stroke: (d, i) => { return functor(defaultStroke, d, i); },
                        fill: (d, i) => { return functor(barFill, d, i); }
                    })
                    .attrs({
                        x: function(d, i) {
                            return xGroupScale(d.group);
                        },
                        width: function(d, i) { return widthFactor * xGroupScale.bandwidth(); },
                        y: function(d) {
                          let y;
                            if (d.y > 0) {
                                y= yScale(d.y);
                            } else {
                                y= yScale(0);
                            }
                            return y;
                        },
                        height: function(d) {
                            return Math.abs(barScale(d.y));
                        },
                    });

                bars.exit()
                    .transition()
                    .duration((d, i) => { return functor(this._removeTransitionDelay, d, i); })
                    .ease(this._transitionEase)
                    .attrs({
                        y: function(d) {
                            if (d.y > 0) {
                                return yScale(0);
                            } else {
                                return yScale(0);
                            }
                        },
                        height: function(d) {
                            return Math.abs(barScale(0));
                        },
                    })
                    .delay((d, i) => { return functor(this._removeDelay, d, i); })
                    // .styles({
                    // opacity: 0
                    // })
                    .remove();

                this._plotLabels();
                this._plotXYAxes(xScale, yScale);

                        // end data loop
            });
            //end BarChart
        }

    }
}
