var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var ninjaPixel;
(function (ninjaPixel) {
    var BarChart = (function (_super) {
        __extends(BarChart, _super);
        function BarChart() {
            var _this = _super.call(this) || this;
            _this._cornerRounding = 1;
            _this._isTimeseries = false;
            return _this;
        }
        BarChart.prototype.cornerRounding = function (_x) {
            if (!arguments.length)
                return this._cornerRounding;
            this._cornerRounding = _x;
            return this;
        };
        BarChart.prototype.isTimeseries = function (_x) {
            if (!arguments.length)
                return this._isTimeseries;
            this._isTimeseries = _x;
            return this;
        };
        BarChart.prototype.barWidth = function (_x) {
            if (!arguments.length)
                return this._barWidth;
            this._barWidth = _x;
            return this;
        };
        BarChart.prototype.plot = function (_selection, barWidth) {
            var _this = this;
            this._init(_selection);
            var functor = this._functor;
            var myToolTip = this._toolTip;
            var onMouseover = this._onMouseover;
            var onMouseout = this._onMouseout;
            var onClick = this._onClick;
            var mouseOverBarOpacity = this._mouseOverItemOpacity;
            var defaultBarOpacity = this._itemOpacity;
            var mouseOverBarStroke = this._mouseOverItemStroke;
            var defaultStroke = this._itemStroke;
            var barFill = this._itemFill;
            var mapXToDate = function (d) {
                return new Date(d.x).getTime();
            };
            var sortAsc = function (a, b) { return a - b; };
            var sortDesc = function (a, b) { return b - a; };
            function getMinDate(theData) {
                var sortedByDate = theData.map(mapXToDate).sort(sortAsc);
                return sortedByDate[0];
            }
            function getMaxDate(theData) {
                var sortedByDate = theData.map(mapXToDate).sort(sortDesc);
                return sortedByDate[0];
            }
            _selection.each(function (_data) {
                var barW;
                if (barWidth != null) {
                    barW = barWidth;
                }
                else if (_this._barWidth) {
                    barW = _this._barWidth;
                }
                else {
                    if (_this._isTimeseries) {
                        barW = 0.9 * _this._chartWidth / (_data.length + 1);
                    }
                    else {
                        barW = 0;
                    }
                }
                var minData = 0;
                var maxData = 0;
                if (_this._y1Min != null) {
                    minData = _this._y1Min;
                }
                else {
                    var d3MinY = _data.map(function (d) { return d.y; }).sort(sortAsc)[0];
                    if (d3MinY < 0) {
                        minData = d3MinY;
                    }
                }
                if (_this._y1Max != null) {
                    maxData = _this._y1Max;
                }
                else {
                    var d3MaxY = _data.map(function (d) { return d.y; }).sort(sortDesc)[0];
                    if (d3MaxY > 0) {
                        maxData = d3MaxY;
                    }
                    if (maxData === minData) {
                        maxData += 10;
                    }
                }
                if (_this._isTimeseries) {
                    var minX, maxX;
                    if (_this._xMin != null) {
                        minX = new Date(_this._xMin).getTime();
                    }
                    else {
                        minX = getMinDate(_data);
                    }
                    if (_this._xMax != null) {
                        maxX = new Date(_this._xMax).getTime();
                    }
                    else {
                        maxX = getMaxDate(_data);
                    }
                    _this._xScale = d3.scaleTime()
                        .domain([minX, maxX])
                        .rangeRound([0 + barW, _this._chartWidth - barW]);
                }
                else {
                    _this._xScale = d3.scaleBand()
                        .domain(_data.map(function (d, i) {
                        return d.x;
                    }))
                        .rangeRound([0, _this._chartWidth])
                        .padding(0.1);
                }
                _this._yScale = d3.scaleLinear()
                    .domain([minData, maxData])
                    .rangeRound([_this._chartHeight, 0]);
                _this._barScale = d3.scaleLinear()
                    .domain([Math.abs(maxData - minData), 0])
                    .rangeRound([_this._chartHeight, 0]);
                var xScale = _this._xScale;
                var yScale = _this._yScale;
                var barScale = _this._barScale;
                if (barW <= 0) {
                    barW = xScale.bandWidth();
                }
                var barAdjustmentX = 0;
                if (_this._isTimeseries) {
                    barAdjustmentX = -barW / 2;
                }
                if (barWidth != null) {
                    barAdjustmentX = (xScale.bandWidth() - barW) / 2;
                }
                var calculateBarWidth = function (d, i) {
                    return barW;
                };
                function xScaleAdjusted(x) {
                    return xScale(x) + barAdjustmentX;
                }
                _this._xScaleAdjusted = xScaleAdjusted;
                var yScale0 = yScale(0);
                var bars = _this._svg.select('.ninja-chartGroup')
                    .call(myToolTip)
                    .selectAll('.bar')
                    .data(_data, function (d) {
                    return d.x;
                });
                var enter = bars.enter().append('rect')
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
                    fill: function (d, i) {
                        return functor(_this._itemFill, d, i);
                    },
                    rx: _this._cornerRounding,
                    ry: _this._cornerRounding
                })
                    .styles({
                    opacity: function (d, i) {
                        return functor(defaultBarOpacity, d, i);
                    },
                    stroke: function (d, i) {
                        return functor(defaultStroke, d, i);
                    },
                    fill: function (d, i) {
                        return functor(barFill, d, i);
                    }
                })
                    .on('mouseover', function (d, i) {
                    d3.select(this)
                        .style('opacity', function (d, i) {
                        return functor(mouseOverBarOpacity, d, i);
                    })
                        .style('stroke', function (d, i) {
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
                    var thisElem = d3.select(this);
                    thisElem.style('opacity', function (d, i) {
                        return functor(defaultBarOpacity, d, i);
                    });
                    thisElem.style('stroke', function (d, i) {
                        return functor(defaultStroke, d, i);
                    });
                    myToolTip.hide();
                    onMouseout(d);
                })
                    .on('click', function (d, i) {
                    onClick(d);
                });
                bars.merge(enter)
                    .transition()
                    .duration(_this._transitionDuration)
                    .delay(function (d, i) {
                    return functor(_this._transitionDelay, d, i);
                })
                    .ease(_this._transitionEase)
                    .attrs({
                    y: function (d) {
                        if (d.y > 0) {
                            return yScale(d.y);
                        }
                        else {
                            return yScale(0);
                        }
                    },
                    height: function (d) {
                        return Math.abs(barScale(d.y));
                    },
                });
                bars.exit()
                    .transition()
                    .duration(function (d, i) {
                    return functor(_this._removeTransitionDelay, d, i);
                })
                    .ease(_this._transitionEase)
                    .attrs({
                    y: function (d) {
                        if (d.y > 0) {
                            return yScale(0);
                        }
                        else {
                            return yScale(0);
                        }
                    },
                    height: function (d) {
                        return Math.abs(barScale(0));
                    },
                })
                    .delay(function (d, i) {
                    return functor(_this._removeDelay, d, i);
                })
                    .remove();
                _this._plotLabels();
                _this._plotXAxis(xScale, yScale);
                _this._plotYAxis(xScale, yScale);
            });
        };
        return BarChart;
    }(ninjaPixel.Chart));
    ninjaPixel.BarChart = BarChart;
})(ninjaPixel || (ninjaPixel = {}));
//# sourceMappingURL=barChart.js.map