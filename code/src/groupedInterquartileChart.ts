/// <reference path="../node_modules/@types/d3/index.d.ts" />
/// <reference path="chart.ts" />

namespace ninjaPixel {
    interface singleItem {
        yMax: number;
        yMed: number;
        yMin: number;
        group: string;
        color?: string;
        medColor?: string;
    }
    interface groupedBarChartDataItem {
        x: any; //string or datetime
        data: Array<singleItem>;
    }

    export class GroupedInterquartileChart extends ninjaPixel.Chart {
        _cornerRounding: number = 1;
        _xScale: any;
        _yScale: any;
        _barScale: any;
        _xScaleAdjusted: any;
        _medianWidth: number = 8;
        _plotCount:number;

        cornerRounding(_x: number): any {
            if (!arguments.length) return this._cornerRounding;
            this._cornerRounding = _x;
            return this;
        }

        medianWidth(_x: number): any {
            if (!arguments.length) return this._medianWidth;
            this._medianWidth = _x;
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
            this._plotCount=0;
        }

        plot(_selection, barWidth?: number) {
            this._init(_selection);
            let functor = this._functor;
            let myToolTip = this._toolTip; //need to reference this letiable in local scope as when I come to call the tooltip, it is within a function that is referencing a differnt 'this'
            let onClick = this._onClick;
            let mouseOverBarOpacity: any = this._mouseOverItemOpacity;
            let defaultBarOpacity: any = this._itemOpacity;
            let mouseOverBarStroke = this._mouseOverItemStroke;
            let defaultStroke = this._itemStroke;
            let barFill = this._itemFill;
            let barFill2 = this._itemFill2;
            let medianWidth = this._medianWidth;
            let itemStrokeWidth = this._itemStrokeWidth;
            const genericMouseoverBehaviour = this._simpleMouseoverBehaviour.bind(this);
            const genericMouseoutBehaviour = this._simpleMouseoutBehaviour.bind(this);

            function getMinDate(theData) {
                return d3.min(theData, (d: { x: number }) => {
                    return new Date(d.x).getTime();
                });
            }

            function getMaxDate(theData) {
                return d3.max(theData, (d: { x: number }) => {
                    return new Date(d.x).getTime();
                });
            }

            _selection.each((_data) => {
                // find the unique groups
                let distinctGroups = [];
                _data.forEach(function(d: groupedBarChartDataItem) {
                    d.data.forEach(function(e: singleItem) {
                        if (distinctGroups.indexOf(e.group) < 0) {
                            distinctGroups.push(e.group);
                        }
                    });
                });


                let barW: number;
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
                        barW = 0; // revisit this once we have xScale and do:  xScale.bandwidth();
                    }
                }
                let minData: any = 0;
                let maxData: any = 0;

                // TODO: check if yMed is the max or min value
                if (this._y1Min != null) {
                    minData = this._y1Min;
                } else {
                    _data.forEach(function(dd: groupedBarChartDataItem) {
                        let d3MinY = d3.min(dd.data, (d: singleItem) => d.yMin);
                        if (d3MinY < minData) {
                            minData = d3MinY;
                        }
                    });
                }
                if (this._y1Max != null) {
                    maxData = this._y1Max;
                } else {

                    _data.forEach(function(dd: groupedBarChartDataItem) {
                        let d3MaxY = d3.max(dd.data, (d: singleItem) => d.yMax);
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
                    const {min, max} = this._getMinMaxX(_data, this._isTimeseries);

                    this._xScale = d3.scaleTime()
                        .domain([min, max])
                        .range([0 + barW, this._chartWidth - barW]);
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

                let xScale = this._xScale;
                let yScale = this._yScale;
                let barScale = this._barScale;
                let xGroupScale = d3.scaleBand();


                if (barW <= 0) {
                    barW = xScale.bandwidth();
                }
                xGroupScale.domain(distinctGroups).rangeRound([0, barW]);

                let barAdjustmentX = 0;
                if (this._isTimeseries) {
                    barAdjustmentX = -barW / 2;
                }

                let calculateBarWidth = function(d, i) {
                    return xGroupScale(d.group)
                };
                let widthFactor = 0.95;

                function xScaleAdjusted(x) {
                    return xScale(x) + barAdjustmentX;
                }

                this._xScaleAdjusted = xScaleAdjusted;

                // Enter, Update, Exit on bars
                let yScale0 = yScale(0);
                let barsRoot = this._svg.select('.ninja-chartGroup')
                    .call(myToolTip)
                    .selectAll('.g')
                    .data(_data, function(d) {
                        return d.x;
                    });

                const barsRootEnter = barsRoot.enter().append("g")
                    .attr("class", "barGroup")
                    .attr("transform", function(d) {
                        return "translate(" + xScaleAdjusted(d.x) + ",0)"
                    });


                barsRoot.merge(barsRootEnter).transition()
                    .duration(this._transitionDuration)
                    .attr("transform", function(d) {
                        return "translate(" + xScaleAdjusted(d.x) + ",0)"
                    });

                barsRoot.exit()
                    .transition()
                    .styles({
                        opacity: (d, i) => { return 0; },
                    })
                    .remove()


                    // let barsRootObject;
                    // if(this._plotCount++ ===0){
                    //   barsRootObject = barsRootEnter;
                    // }else{
                    //   barsRootObject = barsRoot;
                    // }
                    const barsRootObject = this._svg.select('.ninja-chartGroup').selectAll('.barGroup');


                // interquartile range bar
                let bars = barsRootObject.selectAll(".bar")
                    // .data(function(d) {
                    //     return d.data;
                    // });
                    .data(function(d) {
                        return d.data;
                    }, function(d) {
                        return d.group;
                    });

                const iqBarsEnter = bars.enter().append('rect')
                    .classed('bar', true)
                    .attrs({
                        x: function(d, i) {
                            return xGroupScale(d.group);
                        },
                        width: function(d, i) {
                            return widthFactor * xGroupScale.bandwidth();
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
                    .on('mouseover', function(d, i) {
                        genericMouseoverBehaviour(d);
                    })
                    .on('mouseout', function(d, i) {
                        genericMouseoutBehaviour(d);
                    })
                    .on('click', function(d, i) {
                        onClick(d);
                    });

                bars.merge(iqBarsEnter).transition()
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
                        x: function(d, i) {
                            return xGroupScale(d.group);
                        },
                        width: function(d, i) {
                            return widthFactor * xGroupScale.bandwidth();
                        },
                        y: function(d) {
                            if (d.yMax > 0) {
                                return yScale(d.yMax);
                            } else {
                                return yScale(0);
                            }
                        },
                        height: function(d) {
                            let height = Math.abs(barScale(d.yMax) - barScale(d.yMin));
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
                        y: function(d) {
                            if (d.yMax > 0) {
                                return yScale(0);
                            } else {
                                return yScale(0);
                            }
                        },
                        height: function(d) {
                            let height = Math.abs(barScale(0));
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
                let medianBar = barsRootObject.selectAll(".bar-median")
                    // .data(function(d) {
                    //     return d.data;
                    // });
                    .data(function(d) {
                        return d.data;
                    }, function(d) {
                        return d.group;
                    });

                const medianBarEnter = medianBar.enter().append('rect')
                    .classed('bar-median', true)
                    .attrs({
                        x: function(d, i) {
                            return xGroupScale(d.group);
                        },
                        width: function(d, i) {
                            return widthFactor * xGroupScale.bandwidth();
                        },
                        y: yScale0,
                        height: 0,
                        fill: (d, i) => {
                            return functor(this._itemFill2, d, i)
                        },
                        rx: this._cornerRounding,
                        ry: this._cornerRounding
                    })
                    .on('mouseover', function(d, i) {
                        genericMouseoverBehaviour(d);
                    })
                    .on('mouseout', function(d, i) {
                        genericMouseoutBehaviour(d);
                    })
                    .on('click', function(d, i) {
                        onClick(d);
                    });

                medianBar.merge(medianBarEnter).transition()
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
                        x: function(d, i) {
                            return xGroupScale(d.group);
                        },
                        width: function(d, i) {
                            return widthFactor * xGroupScale.bandwidth();
                        },
                        y: function(d) {
                            if (d.yMax > 0) {
                                return yScale(d.yMed) - medianWidth / 2;
                            } else {
                                return yScale(0);
                            }
                        },
                        height: function(d) {
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
                        y: function(d) {
                            if (d.yMax > 0) {
                                return yScale(0);
                            } else {
                                return yScale(0);
                            }
                        },
                        height: function(d) {
                            let height = Math.abs(barScale(0));
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
                this._plotXYAxes(xScale, yScale);
                // end data loop
            });
            //end BarChart
        }


    }
}
