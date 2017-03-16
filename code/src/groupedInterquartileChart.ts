/// <reference path="typescript_definitions/d3.d.ts" />
/// <reference path="chart.ts" />
//declare var d3: D3.Base;
namespace ninjaPixel {
    interface singleItem {
        yMax:number;
        yMed:number;
        yMin:number;
        group:string;
        color?:string;
        medColor?:string;
    }
    interface groupedBarChartDataItem {
        x:any; //string or datetime
        data:Array<singleItem>;
    }

    export class GroupedInterquartileChart extends ninjaPixel.Chart {
        _cornerRounding:number = 1;
        _xScale:any;
        _yScale:any;
        _barScale:any;
        _xScaleAdjusted:any;
        _medianWidth:number = 8;

        cornerRounding(_x:number):any {
            if (!arguments.length) return this._cornerRounding;
            this._cornerRounding = _x;
            return this;
        }

        medianWidth(_x:number):any {
            if (!arguments.length) return this._medianWidth;
            this._medianWidth = _x;
            return this;
        }

        private _isTimeseries:boolean = false;

        isTimeseries(_x):any {
            if (!arguments.length) return this._isTimeseries;
            this._isTimeseries = _x;
            return this;
        }

        private _barWidth:number;

        barWidth(_x):any {
            if (!arguments.length) return this._barWidth;
            this._barWidth = _x;
            return this;
        }

        constructor() {
            super();
        }

        plot(_selection, barWidth?:number) {
            this._init(_selection);
            var functor = this._functor;
            var myToolTip = this._toolTip; //need to reference this variable in local scope as when I come to call the tooltip, it is within a function that is referencing a differnt 'this'
            var onMouseover = this._onMouseover;
            var onMouseout = this._onMouseout;
            var onClick = this._onClick;
            var mouseOverBarOpacity:any = this._mouseOverItemOpacity;
            var defaultBarOpacity:any = this._itemOpacity;
            var mouseOverBarStroke = this._mouseOverItemStroke;
            var defaultStroke = this._itemStroke;
            var barFill = this._itemFill;
            var barFill2 = this._itemFill2;
            var medianWidth = this._medianWidth;
            var itemStrokeWidth = this._itemStrokeWidth;

            function getMinDate(theData) {
                return d3.min(theData, (d:{x:number}) => {
                    return new Date(d.x).getTime();
                });
            }

            function getMaxDate(theData) {
                return d3.max(theData, (d:{x:number}) => {
                    return new Date(d.x).getTime();
                });
            }

            _selection.each((_data) => {
                // find the unique groups
                var distinctGroups = [];
                _data.forEach(function (d:groupedBarChartDataItem) {
                    d.data.forEach(function (e:singleItem) {
                        if (distinctGroups.indexOf(e.group) < 0) {
                            distinctGroups.push(e.group);
                        }
                    });
                });


                var barW:number;
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
                var minData:any = 0;
                var maxData:any = 0;

                // TODO: check if yMed is the max or min value                            
                if (this._y1Min != null) {
                    minData = this._y1Min;
                } else {
                    _data.forEach(function (dd:groupedBarChartDataItem) {
                        var d3MinY = d3.min(dd.data, (d:singleItem) => d.yMin);
                        if (d3MinY < minData) {
                            minData = d3MinY;
                        }
                    });
                }
                if (this._y1Max != null) {
                    maxData = this._y1Max;
                } else {

                    _data.forEach(function (dd:groupedBarChartDataItem) {
                        var d3MaxY = d3.max(dd.data, (d:singleItem) => d.yMax);
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

                    this._xScale = d3.time.scale()
                        .domain([minX, maxX])
                        .range([0 + barW, this._chartWidth - barW]);
                } else {
                    this._xScale = d3.scaleOrdinal()
                        .domain(_data.map(function (d, i) {
                            return d.x;
                        }))
                        .rangeRoundBands([0, this._chartWidth], 0.1);
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
                var xGroupScale = d3.scaleOrdinal();


                if (barW <= 0) {
                    barW = xScale.rangeBand();
                }
                xGroupScale.domain(distinctGroups).rangeRoundBands([0, barW]);

                var barAdjustmentX = 0;
                if (this._isTimeseries) {
                    barAdjustmentX = -barW / 2;
                }

                var calculateBarWidth = function (d, i) {
                    return xGroupScale(d.group)
                };
                var widthFactor = 0.95;

                function xScaleAdjusted(x) {
                    return xScale(x) + barAdjustmentX;
                }

                this._xScaleAdjusted = xScaleAdjusted;

                // Enter, Update, Exit on bars
                var yScale0 = yScale(0);
                var barsRoot = this._svg.select('.ninja-chartGroup')
                    .call(myToolTip)
                    .selectAll('.g')
                    .data(_data, function (d) {
                        return d.x;
                    });

                barsRoot.enter().append("g")
                    .attr("class", "g")
                    .attr("transform", function (d) {
                        return "translate(" + xScaleAdjusted(d.x) + ",0)"
                    });


                barsRoot.transition()
                    .duration(this._transitionDuration)
                    .attr("transform", function (d) {
                        return "translate(" + xScaleAdjusted(d.x) + ",0)"
                    });

                barsRoot.exit()
                    .transition()
                    .remove()


                // interquartile range bar
                var bars = barsRoot.selectAll(".bar")
                    .data(function (d) {
                        return d.data;
                    });

                bars.enter().append('rect')
                    .classed('bar', true)
                    .attrs({
                        x: function (d, i) {
                            return xGroupScale(d.group);
                        },
                        width: function (d, i) {
                            return widthFactor * xGroupScale.rangeBand();
                        },
                        y: yScale0,
                        height: 0,
                        fill: 'none',//(d, i) => {return functor(this._itemFill, d, i)},
                        rx: this._cornerRounding,
                        ry: this._cornerRounding,
                        'stroke-width': (d, i) => {
                            return functor(itemStrokeWidth, d, i);
                        }

                    })
                    .on('mouseover', function (d, i) {
                        // d3.select(this)
                        // .styles({
                        //     opacity: (d, i) => { return functor(mouseOverBarOpacity, d, i);},
                        //     stroke:  (d,i) => {return functor(mouseOverBarStroke, d, i);},
                        // });
                        myToolTip.show(d);
                        onMouseover(d, myToolTip.getBoundingBox());
                    })
                    .on('mouseout', function (d, i) {
                        // d3.select(this)
                        //     .styles({
                        //         opacity: (d, i) => {return functor(defaultBarOpacity,d, i);}, // Re-sets the opacity
                        //         stroke:  (d,i) => {return functor(defaultStroke, d, i);}
                        //     });
                        myToolTip.hide();
                        onMouseout(d);
                    })
                    .on('click', function (d, i) {
                        onClick(d);
                    });

                bars.transition()
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
                            return functor(barFill, d, i);
                        },
                        fill: 'none',//(d,i) => {return functor(barFill,d,i);},
                        'stroke-width': (d, i) => {
                            return functor(itemStrokeWidth, d, i);
                        }

                    })
                    .attrs({
                        x: function (d, i) {
                            return xGroupScale(d.group);
                        },
                        width: function (d, i) {
                            return widthFactor * xGroupScale.rangeBand();
                        },
                        y: function (d) {
                            if (d.yMax > 0) {
                                return yScale(d.yMax);
                            } else {
                                return yScale(0);
                            }
                        },
                        height: function (d) {
                            var height = Math.abs(barScale(d.yMax) - barScale(d.yMin));
                            if (isNaN(height)) {
                                height = 0;
                            }
                            return height;
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
                            if (d.yMax > 0) {
                                return yScale(0);
                            } else {
                                return yScale(0);
                            }
                        },
                        height: function (d) {
                            var height = Math.abs(barScale(0));
                            if (isNaN(height)) {
                                height = 0;
                            }
                            return height;
                        },
                    })
                    .delay((d, i) => {
                        return functor(this._removeDelay, d, i);
                    })
                    .remove();

                // median line/bar
                var medianBar = barsRoot.selectAll(".bar-median")
                    .data(function (d) {
                        return d.data;
                    });

                medianBar.enter().append('rect')
                    .classed('bar-median', true)
                    .attrs({
                        x: function (d, i) {
                            return xGroupScale(d.group);
                        },
                        width: function (d, i) {
                            return widthFactor * xGroupScale.rangeBand();
                        },
                        y: yScale0,
                        height: 0,
                        fill: (d, i) => {
                            return functor(this._itemFill2, d, i)
                        },
                        rx: this._cornerRounding,
                        ry: this._cornerRounding
                    })
                    .on('mouseover', function (d, i) {
                        d3.select(this)
                            .styles({
                                opacity: (d, i) => {
                                    return functor(mouseOverBarOpacity, d, i);
                                },
                                stroke: (d, i) => {
                                    return functor(mouseOverBarStroke, d, i);
                                }
                            });
                        myToolTip.show(d);
                        onMouseover(d, myToolTip.getBoundingBox());
                    })
                    .on('mouseout', function (d, i) {
                        d3.select(this)
                            .styles({
                                opacity: (d, i) => {
                                    return functor(defaultBarOpacity, d, i);
                                }, // Re-sets the opacity
                                stroke: (d, i) => {
                                    return functor(defaultStroke, d, i);
                                }
                            });
                        myToolTip.hide();
                        onMouseout(d);
                    })
                    .on('click', function (d, i) {
                        onClick(d);
                    });

                medianBar.transition()
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
                            return functor(barFill2, d, i);
                        }
                    })
                    .attrs({
                        x: function (d, i) {
                            return xGroupScale(d.group);
                        },
                        width: function (d, i) {
                            return widthFactor * xGroupScale.rangeBand();
                        },
                        y: function (d) {
                            if (d.yMax > 0) {
                                return yScale(d.yMed) - medianWidth / 2;
                            } else {
                                return yScale(0);
                            }
                        },
                        height: function (d) {
                            if (isNaN(d.yMed)) {
                                return 0;
                            }
                            return medianWidth;
                        },
                    });

                medianBar.exit()
                    .transition()
                    .duration((d, i) => {
                        return functor(this._removeTransitionDelay, d, i);
                    })
                    .ease(this._transitionEase)
                    .attrs({
                        y: function (d) {
                            if (d.yMax > 0) {
                                return yScale(0);
                            } else {
                                return yScale(0);
                            }
                        },
                        height: function (d) {
                            var height = Math.abs(barScale(0));
                            if (isNaN(height)) {
                                height = 0;
                            }
                            return height;
                        },
                    })
                    .delay((d, i) => {
                        return functor(this._removeDelay, d, i);
                    })
                    .remove();


                this._plotLabels();
                this._plotXAxis(xScale, yScale);
                this._plotYAxis(xScale, yScale);
//            this._plotGrids(xScale, yScale);

                // end data loop
            });
            //end BarChart            
        }


    }
}