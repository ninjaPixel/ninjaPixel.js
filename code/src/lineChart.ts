/// <reference path="./typescript_definitions/ninjaTypes/index.d.ts" />


namespace ninjaPixel {
    interface lineChartDataItem {
        color?: string;
        data: { x: number;
            y: number;};

    }

    export class LineChart extends ninjaPixel.Chart {
        private _isTimeseries: boolean = false;
        private _areaOpacity: number = 0;
        private _lineInterpolation: any = d3.curveLinear;
        private _lineDashArray: any = 'none';

        constructor() {
            super();
        }

        isTimeseries(_x): any {
            if (!arguments.length) return this._isTimeseries;
            this._isTimeseries = _x;
            return this;
        }

        areaOpacity(_x): any {
            if (!arguments.length) return this._areaOpacity;
            this._areaOpacity = _x;
            return this;
        }

        lineInterpolation(_x): any {
            if (!arguments.length) return this._lineInterpolation;
            this._lineInterpolation = _x;
            return this;
        }

        lineDashArray(_x): any {
            if (!arguments.length) return this._lineDashArray;
            this._lineDashArray = _x;
            return this;
        }


        plot(_selection) {
            var functor = this._functor;
            this._init(_selection);
            var myToolTip = this._toolTip; //need to reference this variable in local scope as when I come to call the tooltip, it is within a function that is referencing a differnt 'this'
            var onMouseover = this._onMouseover;
            var onMouseout = this._onMouseout;

            // just creating simple function to get the min and max values for each line (correct practice to do this outside the loop)
            function getMinDate(theData) {
                return d3.min(theData, (d: {x: number}) => {
                    return new Date(d.x).getTime();
                });
            }

            function getMaxDate(theData) {
                return d3.max(theData, (d: {x: number}) => {
                    return new Date(d.x).getTime();
                });
            }

            function getMinX(theData) {
                return d3.min(theData, (d: {x: number}) => {
                    return d.x;
                });
            }

            function getMaxX(theData) {
                return d3.max(theData, (d: {x: number}) => {
                    return d.x;
                });
            }

            function getMinY(theData) {
                return d3.min(theData, (d: {y: number}) => {
                    return d.y;
                });
            }

            function getMaxY(theData) {
                return d3.max(theData, (d: {y: number}) => {
                    return d.y;
                });
            }

            _selection.each((_data) => {
                var dataLen: number = _data.length;
                var minX,
                    maxX,
                    minY,
                    maxY;

                // cycle through all the data to get min and max dates and the min/max y values
                for (var index = 0; index < dataLen; index++) {
                    var minYOfThisArray = getMinY(_data[index].data),
                        maxYOfThisArray = getMaxY(_data[index].data),
                        minXOfThisArray,
                        maxXOfThisArray;

                    if (this._isTimeseries) {
                        minXOfThisArray = getMinDate(_data[index].data);
                        maxXOfThisArray = getMaxDate(_data[index].data);
                    } else {
                        minXOfThisArray = getMinX(_data[index].data);
                        maxXOfThisArray = getMaxX(_data[index].data);
                    }

                    if (index === 0) {
                        minX = minXOfThisArray;
                        maxX = maxXOfThisArray;
                        minY = minYOfThisArray;
                        maxY = maxYOfThisArray;
                    } else {
                        if (minXOfThisArray < minX) {
                            minX = minXOfThisArray;
                        }
                        if (maxXOfThisArray > maxX) {
                            maxX = maxXOfThisArray;
                        }
                        if (maxYOfThisArray > maxY) {
                            maxY = maxYOfThisArray;
                        }
                        if (minYOfThisArray < minY) {
                            minY = minYOfThisArray;
                        }
                    }
                }

                // if the user has specified min/max y values, then apply them now
                if (this._y1Min != null) {
                    minY = this._y1Min;
                }
                if (this._y1Max != null) {
                    maxY = this._y1Max;
                }
                if (this._xMin != null) {
                    minX = this._xMin;
                }
                if (this._xMax != null) {
                    maxX = this._xMax;
                }

                // create the scaling functions
                var xScale;
                if (this._isTimeseries) {
                    xScale = d3.scaleTime();
//                        .range([0, this._chartWidth])
//                        .domain([minX, maxX]);
                } else {
                    xScale = d3.scaleLinear();
//                        .range([0, this._chartWidth])
//                        .domain([minX, maxX]);
                }
                if (this._internalXAxisMargin) {
                    xScale.range([0 + this._internalXAxisMargin, this._chartWidth - this._internalXAxisMargin]);
                } else {
                    xScale.range([0, this._chartWidth]);
                }
                xScale.domain([minX, maxX]);
                var yScale;
                if (this._yAxis1LogScale) {
                    yScale = d3.scaleLog()
                        .domain([minY, maxY])
                        .range([this._chartHeight, 0]);
                } else {
                    yScale = d3.scaleLinear()
                        .domain([minY, maxY])
                        .range([this._chartHeight, 0]);
                }


                // *** CHARTING ***
                // create line and area functions
                var singleLine = d3.line()
                    .x(function (d: any) {
                        return xScale(d.x);
                    })
                    .y(function (d: any) {
                        return yScale(d.y);
                    });
                // singleLine.interpolate(this._lineInterpolation);
                singleLine.curve(this._lineInterpolation);

                var baseLine = d3.line()
                    .x(function (d: any) {
                        return xScale(d.x);
                    })
                    .y(function (d: any) {
                        return yScale(0);
                    });
                // baseLine.interpolate(this._lineInterpolation);
                baseLine.curve(this._lineInterpolation);

                var area = d3.area()
                    .x((d: any) => {
                        return xScale(d.x);
                    })
                    .y0((d) => {
                        if (minY > 0) {
                            return yScale(minY);
                        } else if (maxY < 0) {
                            return yScale(maxY);
                        } else {
                            return yScale(0);
                        }
                    })
                    .y1((d: any) => {
                        return yScale(d.y);
                    });
                // area.interpolate(this._lineInterpolation);
                area.curve(this._lineInterpolation);

                var baseArea = d3.area()
                    .x((d: any) => {
                        return xScale(d.x);
                    })
                    .y0((d) => {
                        return yScale(0);
                    })
                    .y1((d) => {
                        return yScale(0);
                    });
                // FIXME
                // baseArea.curve(this._lineInterpolation);

                // shade area
                var areaSvg = this._svg.select('.ninja-chartGroup').selectAll('path.area')
                    .data(_data, function (d) {
                        return d.name;
                    });


                const enterArea = areaSvg.enter()
                    .append('svg:path')
                    .attr('class', 'area')
                    .style('opacity', 0)
                    .style('fill', 'none')
                    .style('stroke-width', '0px')
                    .attr('d', function (d) {
                        return baseArea(d.data);
                    });

                areaSvg.merge(enterArea)
                    .transition()
                    .delay((d, i) => {
                        return functor(this._transitionDelay, d, i);
                    })
                    .duration((d, i) => {
                        return functor(this._transitionDuration, d, i);
                    })
                    // FIXME
                    // .ease(this._transitionEase)
                    .attr('d', function (d) {
                        return area(d.data);
                    })
                    .styles({
                        opacity: (d, i) => {
                            return functor(this._areaOpacity, d, i);
                        }, // Re-sets the opacity of the circle
                        fill: (d, i) => {
                            return functor(this._itemFill, d, i);
                        } // use the same fill as the item (i.e. the line).
                    });

                areaSvg.exit()
                    .transition()
                    .duration((d, i) => {
                        return functor(this._transitionDuration, d, i);
                    })
                    .ease(this._transitionEase)
                    .style('opacity', 0)
                    .remove();

                // draw line
                const lineSvg = this._svg.select('.ninja-chartGroup')
                    .call(myToolTip)
                    .selectAll('path.line')
                    .data(_data, function (d) {
                        return d.name;
                    });

                const lineEnter = lineSvg.enter()
                    .append('svg:path')
                    .attr('class', 'line')
                    .on('mouseover', function (d) {
                        myToolTip.show(d);
                        onMouseover(d, function () {
                            if (myToolTip.getBoundingBox) {
                                myToolTip.getBoundingBox();
                            }
                        });
                    })
                    .on('mouseout', function (d) {
                        //myToolTip.hide(d); typescript not happy
                        myToolTip.hide();
                        onMouseout(d);
                    })
                    .styles({
                        opacity: 0,//       (d, i) => {return functor(this._itemOpacity, d, i);}, // Re-sets the opacity of the circle                    
                        stroke: (d, i) => {
                            return functor(this._itemFill, d, i);
                        }, // use the same fill as the item (i.e. the line).
                        fill: 'none',
                        'stroke-dasharray': (d, i) => {
                            return functor(this._lineDashArray, d, i);
                        },
                        'stroke-width': (d, i) => {
                            return functor(this._itemStrokeWidth, d, i);
                        }//'2.5px'
                    })
                    .attr('d', (d) => {
                        return baseLine(d.data);
                    });

                lineSvg.merge(lineEnter)
                    .transition()
                    .delay((d, i) => {
                        return functor(this._transitionDelay, d, i);
                    })
                    .duration((d, i) => {
                        return functor(this._transitionDuration, d, i);
                    })
                    // .ease(this._transitionEase)
                    .attr('d', (d) => {
                        return singleLine(d.data);
                    })
                    .styles({
                        opacity: (d, i) => {
                            return functor(this._itemOpacity, d, i);
                        }, // Re-sets the opacity of the circle
                        stroke: (d, i) => {
                            return functor(this._itemFill, d, i);
                        }, // use the same fill as the item (i.e. the line).
                        'stroke-dasharray': (d, i) => {
                            return functor(this._lineDashArray, d, i);
                        },
                        'stroke-width': (d, i) => {
                            return functor(this._itemStrokeWidth, d, i);
                        }
                    });

                lineSvg.exit()
                    .transition()
                    .duration((d, i) => {
                        return functor(this._transitionDuration, d, i);
                    })
                    .ease(this._transitionEase)
                    .style('opacity', 0)
                    .remove();

                this._plotLabels();
                this._plotXAxis(xScale, yScale);
                this._plotYAxis(xScale, yScale);
                //this._plotGrids(xScale, yScale);
                // end _data loop
            });

            // end plot
        }


        // end LineChart
    }
}