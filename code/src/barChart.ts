/// <reference path="../node_modules/@types/d3/index.d.ts" />
/// <reference path="chart.ts" />

namespace ninjaPixel {
    interface barChartDataItem {
        color?: string;
        x: string;
        y: number;
    }

    export class BarChart extends ninjaPixel.Chart {
        _cornerRounding: number = 1;
        _xScale: any;
        _yScale: any;
        _barScale: any;
        _xScaleAdjusted: any;

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

        plot(_selection, barWidth?: number) {
            this._init(_selection);
            let functor = this._functor;
            let myToolTip = this._toolTip; //need to reference this variable in local scope as when I come to call the tooltip, it is within a function that is referencing a differnt 'this'
            let onMouseover = this._onMouseover;
            let onMouseout = this._onMouseout;
            let onClick = this._onClick;
            let mouseOverBarOpacity: any = this._mouseOverItemOpacity;
            let defaultBarOpacity: any = this._itemOpacity;
            let mouseOverBarStroke = this._mouseOverItemStroke;
            let defaultStroke = this._itemStroke;
            let barFill = this._itemFill;

            const mapXToDate = (d: {x: number})=> {
                return new Date(d.x).getTime();
            };
            const sortAsc = (a: number, b: number)=> a - b;
            const sortDesc = (a: number, b: number)=> b - a;

            function getMinDate(theData) {
                // return d3.min(theData, (d:{x:number}) => {
                //     return new Date(d.x).getTime();
                // });
                const sortedByDate = theData.map(mapXToDate).sort(sortAsc);
                return sortedByDate[0];
            }

            function getMaxDate(theData) {
                // return d3.max(theData, (d:{x:number}) => {
                //     return new Date(d.x).getTime();
                // });
                const sortedByDate = theData.map(mapXToDate).sort(sortDesc);
                return sortedByDate[0];
            }

            _selection.each((_data) => {

                    var barW: number;
                    if (barWidth != null) {
                        // set by other functions e.g. lollipop chart
                        barW = barWidth;
                    }
                    else if (this._barWidth) {
                        // set by the user
                        barW = this._barWidth;
                    }
                    else {
                        if (this._isTimeseries) {
                            barW = 0.9 * this._chartWidth / (_data.length + 1);
                            barW=0;
                        } else {
                            barW = 0; // revisit this once we have xScale and do:  xScale.rangeBand();
                        }
                    }
                    var minData: any = 0;
                    var maxData: any = 0;

                    if (this._y1Min != null) {
                        minData = this._y1Min;
                    } else {
                        // var d3MinY = d3.min(_data, (d: barChartDataItem) => d.y);
                        let d3MinY = _data.map((d: barChartDataItem)=>d.y).sort(sortAsc)[0];

                        if (d3MinY < 0) {
                            minData = d3MinY;
                        }
                    }
                    if (this._y1Max != null) {
                        maxData = this._y1Max;
                    } else {
                        // var d3MaxY = d3.max(_data, (d: barChartDataItem) => d.y);
                        let d3MaxY = _data.map((d: barChartDataItem)=>d.y).sort(sortDesc)[0];
                        if (d3MaxY > 0) {
                            maxData = d3MaxY;
                        }

                        // if the max and min are the same value, then there is no range for us to plot with.
                        // only do this when the user hasn't specified the max.
                        if (maxData === minData) {
                            maxData += 10;
                        }
                    }

                    if (this._isTimeseries) {
                        var minX, maxX;
                        if (this._xMin != null) {
                            minX = new Date(this._xMin).getTime();
                        } else {
                            minX = getMinDate(_data);
                        }
                        if (this._xMax != null) {
                            maxX = new Date(this._xMax).getTime();
                        } else {
                            maxX = getMaxDate(_data);
                        }

                        this._xScale = d3.scaleTime()
                            .domain([minX, maxX])
                            .rangeRound([0 + barW, this._chartWidth - barW]);
                    } else {
                        this._xScale = d3.scaleBand()
                            .domain(_data.map(function (d, i) {
                                return d.x;
                            }))
                            // .rangeRoundBands([0, this._chartWidth], 0.1);
                            .rangeRound([0, this._chartWidth]);
                            // .padding(0.1);
                    }

//            if(useEntireXAxis){
//                // if we are plotting other types of char below this one
//                // then we will want the x labels to line up
//                // the bar chart has a buffer at each edge, so that bars don't get cropped
//                // but this means that the date alignment is different to other chart types
//                // Fix this with the _useEntireXAxis flag.
//                this._xScale.range([0, this._chartWidth]);  
//            }

                    this._yScale = d3.scaleLinear()
                        .domain([minData, maxData])
                        .rangeRound([this._chartHeight, 0]);

                    this._barScale = d3.scaleLinear()
                        .domain([Math.abs(maxData - minData), 0])
                        .rangeRound([this._chartHeight, 0]);

                    var xScale = this._xScale;
                    var yScale = this._yScale;
                    var barScale = this._barScale;



                    if (barW <= 0) {
                        // barW = xScale.rangeBand();
                        barW = xScale.domain().bandWidth();
                    }

                    // set bar adjustment
                    var barAdjustmentX = 0;
                    if (this._isTimeseries) {
                        barAdjustmentX = -barW / 2;
                    }
                    if (barWidth != null) {
                        // set by other functions e.g. lollipop chart
                        // barAdjustmentX = (xScale.rangeBand() - barW) / 2;
                        barAdjustmentX = (xScale.domain().bandWidth() - barW) / 2;

                    }

                    const calculateBarWidth = function (d, i) {
                        return barW;
                    };

                    function xScaleAdjusted(x) {
                        return xScale(x) + barAdjustmentX;
                    }

                    this._xScaleAdjusted = xScaleAdjusted;

                    // Enter, Update, Exit on bars
                    let yScale0 = yScale(0);
                    const bars = this._svg.select('.ninja-chartGroup')
                        .call(myToolTip)
                        .selectAll('.bar')
                        .data(_data, function (d) {
                            return d.x;
                        });


                    const enter = bars.enter().append('rect')
                        .classed('bar', true)
                        .attrs({
                            x: function (d, i) {
                                return xScaleAdjusted(d.x);
                            },
                            width: function (d, i) {
                                return calculateBarWidth(d, i);
                            },
                            y: yScale0,
                            height: 0,
                            fill: (d, i) => {
                                return functor(this._itemFill, d, i)
                            },
                            rx: this._cornerRounding,
                            ry: this._cornerRounding
                        })
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
                        .on('mouseover', function (d, i) {
                            d3.select(this)
                                .style(
                                    'opacity', (d, i) => {
                                        return functor(mouseOverBarOpacity, d, i);
                                    })
                                .style('stroke', (d, i) => {
                                    return functor(mouseOverBarStroke, d, i);
                                });


                            myToolTip.show(d);

                            onMouseover(d, function () {
                                if (myToolTip.getBoundingBox) {
                                    myToolTip.getBoundingBox();
                                }
                            });

                        })
                        .on('mouseout', function (d, i) {
                            const thisElem = d3.select(this);
                            thisElem.style('opacity', (d, i) => {
                                return functor(defaultBarOpacity, d, i);
                            });
                            thisElem.style('stroke', (d, i) => {
                                return functor(defaultStroke, d, i);
                            });

                            // d3.select(this)
                            //     .styles({
                            //         opacity: (d, i) => {
                            //             return functor(defaultBarOpacity, d, i);
                            //         }, // Re-sets the opacity
                            //         stroke: (d, i) => {
                            //             return functor(defaultStroke, d, i);
                            //         }
                            //     });
                            myToolTip.hide();
                            onMouseout(d);
                        })
                        .on('click', function (d, i) {
                            onClick(d);
                        });

                    bars.merge(enter)
                        .transition()
                        .duration(this._transitionDuration)
                        .delay((d, i) => {
                            return functor(this._transitionDelay, d, i);
                        })
                        .ease(this._transitionEase)
                        .attrs({
                            y: function (d) {
                                if (d.y > 0) {
                                    return yScale(d.y);
                                } else {
                                    return yScale(0);
                                }
                            },
                            height: function (d) {
                                return Math.abs(barScale(d.y));
                            },
                        });

                    bars.exit()
                        .transition()
                        .duration((d, i) => {
                            return functor(this._removeTransitionDelay, d, i);
                        })
                        .ease(this._transitionEase)
                        .attrs({
                            y: function (d) {
                                if (d.y > 0) {
                                    return yScale(0);
                                } else {
                                    return yScale(0);
                                }
                            },
                            height: function (d) {
                                return Math.abs(barScale(0));
                            },
                        })
                        .delay((d, i) => {
                            return functor(this._removeDelay, d, i);
                        })
                        // .style({
                        // opacity: 0
                        // })
                        .remove();

                    this._plotLabels();
                    this._plotXAxis(xScale, yScale);
                    this._plotYAxis(xScale, yScale);
//            this._plotGrids(xScale, yScale);

                    // end data loop
                }
            );
            //end BarChart
        }


    }
}