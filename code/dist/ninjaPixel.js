
var ninjaPixel;
(function (ninjaPixel) {
    ninjaPixel.version = '0.0.4';

    (function (Type) {
        Type[Type["xy"] = 0] = "xy";
        Type[Type["pie"] = 1] = "pie";
    })(ninjaPixel.Type || (ninjaPixel.Type = {}));
    var Type = ninjaPixel.Type;

    var Chart = (function () {
        function Chart() {
            this._width = 800;
            this._height = 600;
            this._margin = {
                top: 10,
                bottom: 10,
                left: 40,
                right: 5
            };
            this._title = '';
            this._yAxis1Title = '';
            this._yAxis2Title = '';
            this._xAxisTitle = '';
            this._transitionDuration = 300;
            this._transitionEase = 'linear';
            this._transitionDelay = 0;
            this._labelEase = 'linear';
            this._plotHorizontalGrid = false;
            this._plotHorizontalGridTopping = false;
            this._plotVerticalGrid = false;
            this._plotVerticalGridTopping = false;
            this._showToolTip = false;
            this._onMouseover = function () {
            };
            this._onMouseout = function () {
            };
            this._onClick = function () {
            };
            this._plotBackground = false;
            this._mouseOverItemOpacity = 0.3;
            this._mouseOverItemStroke = 'none';
            this._itemOpacity = 1;
            this._itemStroke = 'none';
            this._itemFill = '#A7EBCA';
            this._toolTip = d3.tip().attr('class', 'd3-tip').offset([-10, 0]).transitionDuration(300).html(function () {
                return 'Tooltip HTML not defined';
            }).direction('n');
        }
        Chart.prototype._init = function (_selection, _type) {
            if (typeof _type === "undefined") { _type = 0 /* xy */; }
            this._chartHeight = this._getChartHeight();
            this._chartWidth = this._getChartWidth();

            if (!this._svg) {
                this._svg = _selection.append('svg').classed('ninja-chart', true);
                var container = this._svg.append('g').classed('ninja-containerGroup', true);
                container.append('g').classed('ninja-horizontalGrid', true);
                container.append('g').classed('ninja-verticalGrid', true);
                container.append('g').classed('ninja-chartGroup', true);
                container.append('g').classed('ninja-horizontalGridTopping', true);
                container.append('g').classed('ninja-verticalGridTopping', true);
                container.append('g').classed('ninja-xAxisGroup ninja-axis', true);
                container.append('g').classed('ninja-yAxisGroup ninja-axis', true);
            }

            this._svg.transition().attr({
                width: this._width,
                height: this._height
            });

            if (_type == 1 /* pie */) {
                this._svg.select('.ninja-containerGroup').attr({
                    transform: 'translate(' + this._margin.left + this._chartWidth / 2 + ',' + this._margin.top + this._chartHeight / 2 + ')'
                });
            } else if (_type == 0 /* xy */) {
                this._svg.select('.ninja-containerGroup').attr({
                    transform: 'translate(' + this._margin.left + ',' + this._margin.top + ')'
                });
            }

            this._plotTheBackground();
        };

        Chart.prototype._plotXAxis = function (xScale, yScale) {
            var _this = this;
            var xAxis = d3.svg.axis().scale(xScale).orient('bottom').outerTickSize(0);

            if (this._xAxisTickFormat != null) {
                xAxis.tickFormat(this._xAxisTickFormat);
            }

            this._svg.select('.ninja-xAxisGroup.ninja-axis').attr({
                transform: function () {
                    if (_this._axesOrigin != null) {
                        return 'translate(0,' + yScale(_this._axesOrigin.y) + ')';
                    } else {
                        return 'translate(0,' + (_this._chartHeight) + ')';
                    }
                }
            }).call(xAxis);

            if (this._xAxisTextTransform != null) {
                this._svg.selectAll('.tick text').text(function (d) {
                    return d;
                }).style('text-anchor', 'end').attr('transform', this._xAxisTextTransform);
            }
        };

        Chart.prototype._plotYAxis = function (xScale, yScale) {
            var _this = this;
            var yAxis = d3.svg.axis().scale(yScale).orient('left').outerTickSize(0);

            this._svg.select('.ninja-yAxisGroup.ninja-axis').transition().ease(this._labelEase).attr({
                transform: function () {
                    if (_this._axesOrigin != null) {
                        return 'translate(' + xScale(_this._axesOrigin.x) + ',0)';
                    }
                }
            }).call(yAxis);
        };

        Chart.prototype._plotLabels = function () {
            if (this._svg.select('.ninja-chartTitle')[0][0] == null) {
                this._svg.append("g").classed("ninja-chartTitle", true);
                this._svg.append("g").classed("ninja-y1Title", true);
                this._svg.append("g").classed("ninja-y2Title", true);
                this._svg.append("g").classed("ninja-xTitle", true);
            }

            var arr = [0];

            var titleSvg = this._svg.select(".ninja-chartTitle").selectAll("text.ninja-chartTitle").data(arr);

            titleSvg.enter().append("text").attr("class", "ninja-chartTitle").attr('x', (this._chartWidth / 2) + this._margin.left).attr('y', (this._margin.top / 2)).style('text-anchor', 'middle');

            titleSvg.exit().transition().duration(this._transitionDuration).remove();

            titleSvg.transition().duration(this._transitionDuration).text(this._title);

            var yTitleSvg1 = this._svg.select(".ninja-y1Title").selectAll("text.ninja-y1Title").data(arr);

            yTitleSvg1.enter().append("text").attr("class", "ninja-y1Title").attr('transform', 'rotate(-90)').style('text-anchor', 'middle');

            yTitleSvg1.exit().transition().duration(this._transitionDuration).remove();

            yTitleSvg1.transition().duration(this._transitionDuration).text(this._yAxis1Title).attr('x', -(this._chartHeight / 2) - this._margin.top).attr('y', (this._margin.left * 0.4));

            var xTitleSvg = this._svg.select(".ninja-xTitle").selectAll("text.ninja-xTitle").data(arr);

            xTitleSvg.enter().append("text").attr("class", "ninja-xTitle").style('text-anchor', 'middle');

            xTitleSvg.exit().transition().duration(this._transitionDuration).remove();

            xTitleSvg.transition().duration(this._transitionDuration).text(this._xAxisTitle).attr('y', this._chartHeight + this._margin.top + this._margin.bottom / 2).attr('x', (this._chartWidth / 2) + this._margin.left);
        };

        Chart.prototype._getChartWidth = function () {
            return this._width - this._margin.left - this._margin.right;
        };
        Chart.prototype._getChartHeight = function () {
            return this._height - this._margin.bottom - this._margin.top;
        };

        Chart.prototype._plotGrids = function (xScale, yScale) {
            var svg = this._svg;
            var chartWidth = this._chartWidth;
            var chartHeight = this._chartHeight;
            var ease = this._labelEase;

            function plotHGrid(yScale, className) {
                var horizontalLines = svg.select('.' + className).selectAll('hLines').data(yScale.ticks());

                horizontalLines.enter().append('line').classed('hLines', true);

                horizontalLines.transition().ease(ease).attr({
                    "x1": 0,
                    "x2": chartWidth,
                    "y1": function (d) {
                        return yScale(d);
                    },
                    "y2": function (d) {
                        return yScale(d);
                    }
                });

                horizontalLines.exit().remove();
            }
            ;

            function plotVGrid(xScale, className) {
                var verticalLines = svg.select('.' + className).selectAll('hLines').data(xScale.ticks());

                verticalLines.enter().append('line').classed('hLines', true);

                verticalLines.transition().ease(ease).attr({
                    "x1": function (d) {
                        return xScale(d);
                    },
                    "x2": function (d) {
                        return xScale(d);
                    },
                    "y1": 0,
                    "y2": chartHeight
                });

                verticalLines.exit().remove();
            }
            ;

            if (this._plotHorizontalGrid) {
                plotHGrid(yScale, 'ninja-horizontalGrid');
            }
            if (this._plotHorizontalGridTopping) {
                plotHGrid(yScale, 'ninja-horizontalGridTopping');
            }
            if (this._plotVerticalGrid) {
                plotVGrid(xScale, 'ninja-verticalGrid');
            }
            if (this._plotVerticalGridTopping) {
                plotVGrid(xScale, 'ninja-verticalGridTopping');
            }
        };

        Chart.prototype._plotTheBackground = function () {
            if (this._plotBackground == true) {
                var background = this._svg.select('.ninja-chartGroup').selectAll('.ninja-background').data([1]);

                background.enter().append('rect').classed('ninja-background', true).attr({
                    x: 0,
                    y: 0,
                    height: this._chartHeight,
                    width: this._chartWidth });

                background.transition().attr({
                    x: 0,
                    y: 0,
                    height: this._chartHeight,
                    width: this._chartWidth });

                background.exit().remove();
            }
        };

        Chart.prototype._functor = function (variable, d, i) {
            function isFunction(functionToCheck) {
                return !!(functionToCheck && functionToCheck.constructor && functionToCheck.call && functionToCheck.apply);
            }

            if (isFunction(variable)) {
                return variable(d, i);
            } else {
                return variable;
            }
        };

        Chart.prototype.axesOrigin = function (_x) {
            if (!arguments.length)
                return this._axesOrigin;
            this._axesOrigin = _x;
            return this;
        };
        Chart.prototype.itemFill = function (_x) {
            if (!arguments.length)
                return this._itemFill;
            this._itemFill = _x;
            return this;
        };
        Chart.prototype.itemStroke = function (_x) {
            if (!arguments.length)
                return this._itemStroke;
            this._itemStroke = _x;
            return this;
        };
        Chart.prototype.itemOpacity = function (_x) {
            if (!arguments.length)
                return this._itemOpacity;
            this._itemOpacity = _x;
            return this;
        };
        Chart.prototype.mouseOverItemOpacity = function (_x) {
            if (!arguments.length)
                return this._mouseOverItemOpacity;
            this._mouseOverItemOpacity = _x;
            return this;
        };
        Chart.prototype.mouseOverItemStroke = function (_x) {
            if (!arguments.length)
                return this._mouseOverItemStroke;
            this._mouseOverItemStroke = _x;
            return this;
        };
        Chart.prototype.transitionDelay = function (_x) {
            if (!arguments.length)
                return this._transitionDelay;
            this._transitionDelay = _x;
            return this;
        };
        Chart.prototype.y1Max = function (_x) {
            if (!arguments.length)
                return this._y1Max;
            this._y1Max = _x;
            return this;
        };
        Chart.prototype.y2Max = function (_x) {
            if (!arguments.length)
                return this._y2Max;
            this._y2Max = _x;
            return this;
        };
        Chart.prototype.y1Min = function (_x) {
            if (!arguments.length)
                return this._y1Min;
            this._y1Min = _x;
            return this;
        };
        Chart.prototype.y2Min = function (_x) {
            if (!arguments.length)
                return this._y2Min;
            this._y2Min = _x;
            return this;
        };
        Chart.prototype.xMax = function (_x) {
            if (!arguments.length)
                return this._xMax;
            this._xMax = _x;
            return this;
        };
        Chart.prototype.xMin = function (_x) {
            if (!arguments.length)
                return this._xMin;
            this._xMin = _x;
            return this;
        };
        Chart.prototype.plotBackground = function (_x) {
            if (!arguments.length)
                return this._plotBackground;
            this._plotBackground = _x;
            return this;
        };
        Chart.prototype.onMouseover = function (_x) {
            if (!arguments.length)
                return this._onMouseover;
            this._onMouseover = _x;
            return this;
        };
        Chart.prototype.onMouseout = function (_x) {
            if (!arguments.length)
                return this._onMouseout;
            this._onMouseout = _x;
            return this;
        };
        Chart.prototype.onClick = function (_x) {
            if (!arguments.length)
                return this._onClick;
            this._onClick = _x;
            return this;
        };
        Chart.prototype.toolTip = function (_x) {
            if (!arguments.length)
                return this._toolTip;
            this._toolTip = _x;
            return this;
        };
        Chart.prototype.showToolTip = function (_x) {
            if (!arguments.length)
                return this._showToolTip;
            this._showToolTip = _x;
            return this;
        };
        Chart.prototype.plotVerticalGridTopping = function (_x) {
            if (!arguments.length)
                return this._plotVerticalGridTopping;
            this._plotVerticalGridTopping = _x;
            return this;
        };
        Chart.prototype.plotVerticalGrid = function (_x) {
            if (!arguments.length)
                return this._plotVerticalGrid;
            this._plotVerticalGrid = _x;
            return this;
        };
        Chart.prototype.plotHorizontalGridTopping = function (_x) {
            if (!arguments.length)
                return this._plotHorizontalGridTopping;
            this._plotHorizontalGridTopping = _x;
            return this;
        };
        Chart.prototype.plotHorizontalGrid = function (_x) {
            if (!arguments.length)
                return this._plotHorizontalGrid;
            this._plotHorizontalGrid = _x;
            return this;
        };
        Chart.prototype.transitionEase = function (_x) {
            if (!arguments.length)
                return this._transitionEase;
            this._transitionEase = _x;
            return this;
        };
        Chart.prototype.transitionDuration = function (_x) {
            if (!arguments.length)
                return this._transitionDuration;
            this._transitionDuration = _x;
            return this;
        };
        Chart.prototype.yAxis1Title = function (_x) {
            if (!arguments.length)
                return this._yAxis1Title;
            this._yAxis1Title = _x;
            return this;
        };
        Chart.prototype.yAxis2Title = function (_x) {
            if (!arguments.length)
                return this._yAxis2Title;
            this._yAxis2Title = _x;
            return this;
        };
        Chart.prototype.xAxisTitle = function (_x) {
            if (!arguments.length)
                return this._xAxisTitle;
            this._xAxisTitle = _x;
            return this;
        };
        Chart.prototype.width = function (_x) {
            if (!arguments.length)
                return this._width;
            this._width = _x;
            return this;
        };
        Chart.prototype.height = function (_x) {
            if (!arguments.length)
                return this._height;
            this._height = _x;
            return this;
        };
        Chart.prototype.margin = function (_x) {
            if (!arguments.length)
                return this._margin;
            this._margin = _x;
            return this;
        };
        Chart.prototype.title = function (_x) {
            if (!arguments.length)
                return this._title;
            this._title = _x;
            return this;
        };
        Chart.prototype.xAxisTextTransform = function (_x) {
            if (!arguments.length)
                return this._xAxisTextTransform;
            this._xAxisTextTransform = _x;
            return this;
        };
        Chart.prototype.xAxisTickFormat = function (_x) {
            if (!arguments.length)
                return this._xAxisTickFormat;
            this._xAxisTickFormat = _x;
            return this;
        };
        return Chart;
    })();
    ninjaPixel.Chart = Chart;
})(ninjaPixel || (ninjaPixel = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ninjaPixel;
(function (ninjaPixel) {
    var BarChart = (function (_super) {
        __extends(BarChart, _super);
        function BarChart() {
            _super.call(this);
            this._cornerRounding = 1;
        }
        BarChart.prototype.cornerRounding = function (_x) {
            if (!arguments.length)
                return this._cornerRounding;
            this._cornerRounding = _x;
            return this;
        };

        BarChart.prototype.plot = function (_selection) {
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

            _selection.each(function (_data) {
                var barW = _this._chartWidth / _data.length;
                var minData = 0;
                var maxData = 0;

                if (_this._y1Max != null) {
                    maxData = _this._y1Max;
                } else {
                    var d3MaxY = d3.max(_data, function (d) {
                        return d.y;
                    });
                    if (d3MaxY > 0) {
                        maxData = d3MaxY;
                    }
                }

                if (_this._y1Min != null) {
                    minData = _this._y1Min;
                } else {
                    var d3MinY = d3.min(_data, function (d) {
                        return d.y;
                    });
                    if (d3MinY < 0) {
                        minData = d3MinY;
                    }
                }

                var xScale = d3.scale.ordinal().domain(_data.map(function (d, i) {
                    return d.x;
                })).rangeRoundBands([0, _this._chartWidth], 0);

                var yScale = d3.scale.linear().domain([minData, maxData]).range([_this._chartHeight, 0]);

                var barScale = d3.scale.linear().domain([Math.abs(maxData - minData), 0]).range([_this._chartHeight, 0]);

                var yScale0 = yScale(0);
                var bars = _this._svg.select('.ninja-chartGroup').call(myToolTip).selectAll('.bar').data(_data);

                bars.enter().append('rect').classed('bar', true).attr({
                    x: function (d, i) {
                        return xScale(d.x);
                    },
                    width: barW * 0.95,
                    y: yScale0,
                    height: 0,
                    fill: function (d, i) {
                        return functor(_this._itemFill, d, i);
                    },
                    rx: _this._cornerRounding,
                    ry: _this._cornerRounding
                }).on('mouseover', function (d, i) {
                    d3.select(this).style({
                        opacity: function (d, i) {
                            return functor(mouseOverBarOpacity, d, i);
                        },
                        stroke: function (d, i) {
                            return functor(mouseOverBarStroke, d, i);
                        }
                    });
                    myToolTip.show(d);
                    onMouseover(d);
                }).on('mouseout', function (d, i) {
                    d3.select(this).style({
                        opacity: function (d, i) {
                            return functor(defaultBarOpacity, d, i);
                        },
                        stroke: function (d, i) {
                            return functor(defaultStroke, d, i);
                        }
                    });
                    myToolTip.hide();
                    onMouseout(d);
                }).on('click', function (d, i) {
                    onClick(d);
                });

                bars.transition().duration(_this._transitionDuration).delay(function (d, i) {
                    return functor(_this._transitionDelay, d, i);
                }).ease(_this._transitionEase).style({
                    opacity: function (d, i) {
                        return functor(defaultBarOpacity, d, i);
                    },
                    stroke: function (d, i) {
                        return functor(defaultStroke, d, i);
                    },
                    fill: function (d, i) {
                        return functor(barFill, d, i);
                    }
                }).attr({
                    x: function (d, i) {
                        return xScale(d.x);
                    },
                    width: barW * 0.9,
                    y: function (d) {
                        if (d.y > 0) {
                            return yScale(d.y);
                        } else {
                            return yScale(0);
                        }
                    },
                    height: function (d) {
                        return Math.abs(barScale(d.y));
                    }
                });

                bars.exit().transition().style({
                    opacity: 0
                }).remove();

                _this._plotLabels();
                _this._plotXAxis(xScale, yScale);
                _this._plotYAxis(xScale, yScale);
                _this._plotGrids(xScale, yScale);
            });
        };
        return BarChart;
    })(ninjaPixel.Chart);
    ninjaPixel.BarChart = BarChart;
})(ninjaPixel || (ninjaPixel = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ninjaPixel;
(function (ninjaPixel) {
    var StackedBarChart = (function (_super) {
        __extends(StackedBarChart, _super);
        function StackedBarChart() {
            _super.call(this);
        }
        StackedBarChart.prototype.plot = function (_selection) {
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

            _selection.each(function (_data) {
                var stack = d3.layout.stack();
                stack(_data.data);

                console.log('this is the stack', _data);

                var minData = 0;
                var maxData = 0;

                if (_this._y1Max != null) {
                    maxData = _this._y1Max;
                } else {
                }

                if (_this._y1Min != null) {
                    minData = _this._y1Min;
                } else {
                }

                console.log('maxData', maxData, 'minData', minData);

                var xScale = d3.scale.ordinal().domain(_data.data[0].map(function (d, i) {
                    return d.x;
                })).rangeRoundBands([0, _this._chartWidth], 0);
                var barWidth = xScale.rangeBand();

                var yScale = d3.scale.linear().domain([minData, maxData]).range([_this._chartHeight, 0]);

                var barScale = d3.scale.linear().domain([Math.abs(maxData - minData), 0]).range([_this._chartHeight, 0]);

                var yScale0 = yScale(0);
                var bars = _this._svg.select('.ninja-chartGroup').call(myToolTip).selectAll('.bar').data(_data);

                bars.enter().append('rect').classed('bar', true).attr({
                    x: function (d, i) {
                        return xScale(d.data.x);
                    },
                    width: barWidth,
                    y: yScale0,
                    height: 0,
                    fill: function (d, i) {
                        return functor(_this._itemFill, d, i);
                    },
                    rx: _this._cornerRounding,
                    ry: _this._cornerRounding
                }).on('mouseover', function (d, i) {
                    d3.select(this).style({
                        opacity: function (d, i) {
                            return functor(mouseOverBarOpacity, d, i);
                        },
                        stroke: function (d, i) {
                            return functor(mouseOverBarStroke, d, i);
                        }
                    });
                    myToolTip.show(d);
                    onMouseover(d);
                }).on('mouseout', function (d, i) {
                    d3.select(this).style({
                        opacity: function (d, i) {
                            return functor(defaultBarOpacity, d, i);
                        },
                        stroke: function (d, i) {
                            return functor(defaultStroke, d, i);
                        }
                    });
                    myToolTip.hide();
                    onMouseout(d);
                }).on('click', function (d, i) {
                    onClick(d);
                });

                bars.transition().duration(_this._transitionDuration).delay(function (d, i) {
                    return functor(_this._transitionDelay, d, i);
                }).ease(_this._transitionEase).style({
                    opacity: function (d, i) {
                        return functor(defaultBarOpacity, d, i);
                    },
                    stroke: function (d, i) {
                        return functor(defaultStroke, d, i);
                    },
                    fill: function (d, i) {
                        return functor(barFill, d, i);
                    }
                }).attr({
                    x: function (d, i) {
                        return xScale(d.x);
                    },
                    width: barWidth,
                    y: function (d) {
                        if (d.y > 0) {
                            return yScale(d.y);
                        } else {
                            return yScale(0);
                        }
                    },
                    height: function (d) {
                        barScale(5);
                    }
                });

                bars.exit().transition().style({
                    opacity: 0
                }).remove();

                _this._plotLabels();
                _this._plotXAxis(xScale, yScale);
                _this._plotYAxis(xScale, yScale);
                _this._plotGrids(xScale, yScale);
            });
        };
        return StackedBarChart;
    })(ninjaPixel.BarChart);
    ninjaPixel.StackedBarChart = StackedBarChart;
})(ninjaPixel || (ninjaPixel = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ninjaPixel;
(function (ninjaPixel) {
    var BubbleChart = (function (_super) {
        __extends(BubbleChart, _super);
        function BubbleChart() {
            _super.call(this);
            this._allowBubblesToSpillOffChart = false;
            this._maxBubbleRadius = 50;
        }
        BubbleChart.prototype.maxBubbleRadius = function (_x) {
            if (!arguments.length)
                return this._maxBubbleRadius;
            this._maxBubbleRadius = _x;
            return this;
        };
        BubbleChart.prototype.allowBubblesToSpillOffChart = function (_x) {
            if (!arguments.length)
                return this._allowBubblesToSpillOffChart;
            this._allowBubblesToSpillOffChart = _x;
            return this;
        };

        BubbleChart.prototype.plot = function (_selection) {
            var _this = this;
            this._init(_selection);

            _selection.each(function (_data) {
                var minX, maxX, minY, maxY, minR, maxR;
                minX = d3.min(_data, function (d) {
                    return d.x;
                });
                maxX = d3.max(_data, function (d) {
                    return d.x;
                });
                minY = d3.min(_data, function (d) {
                    return d.y;
                });
                maxY = d3.max(_data, function (d) {
                    return d.y;
                });
                minR = d3.min(_data, function (d) {
                    return d.r;
                });
                maxR = d3.max(_data, function (d) {
                    return d.r;
                });

                var minXOriginal = minX, maxXOriginal = maxX, minYOriginal = minY, maxYOriginal = maxY;

                _data.sort(function (a, b) {
                    return b.r - a.r;
                });

                var xScale = d3.scale.linear().domain([minX, maxX]).range([0, _this._chartWidth]);

                var yScale = d3.scale.linear().domain([minY, maxY]).range([_this._chartHeight, 0]);

                var rScale = d3.scale.linear().domain([0, maxR]).range([0, _this._maxBubbleRadius]);

                if (!_this._allowBubblesToSpillOffChart) {
                    var dataLength = _data.length;

                    var updateXYScalesBasedOnBubbleEdges = function () {
                        var bubbleEdgePixels = [];

                        for (var i = 0; i < dataLength; i++) {
                            var rPixels = rScale(_data[i].r), rInTermsOfX = Math.abs(minX - xScale.invert(rPixels)), rInTermsOfY = Math.abs(maxY - yScale.invert(rPixels));
                            var upperPixelsY = _data[i].y + rInTermsOfY;
                            var lowerPixelsY = _data[i].y - rInTermsOfY;
                            var upperPixelsX = _data[i].x + rInTermsOfX;
                            var lowerPixelsX = _data[i].x - rInTermsOfX;
                            bubbleEdgePixels.push({
                                highX: upperPixelsX,
                                highY: upperPixelsY,
                                lowX: lowerPixelsX,
                                lowY: lowerPixelsY
                            });
                        }

                        var minEdgeX = d3.min(bubbleEdgePixels, function (d) {
                            return d.lowX;
                        });
                        var maxEdgeX = d3.max(bubbleEdgePixels, function (d) {
                            return d.highX;
                        });
                        var minEdgeY = d3.min(bubbleEdgePixels, function (d) {
                            return d.lowY;
                        });
                        var maxEdgeY = d3.max(bubbleEdgePixels, function (d) {
                            return d.highY;
                        });

                        maxY = maxEdgeY;
                        minY = minEdgeY;
                        maxX = maxEdgeX;
                        minX = minEdgeX;

                        if (_this._y1Min) {
                            minY = _this._y1Min;
                        }
                        if (_this._y1Max) {
                            maxY = _this._y1Max;
                        }
                        if (_this._xMin) {
                            minX = _this._xMin;
                        }
                        if (_this._xMax) {
                            maxX = _this._xMax;
                        }

                        xScale = d3.scale.linear().domain([minX, maxX]).range([0, _this._chartWidth]);

                        yScale = d3.scale.linear().domain([minY, maxY]).range([_this._chartHeight, 0]);
                    };

                    for (var scaleCount = 0; scaleCount < 10; scaleCount++) {
                        updateXYScalesBasedOnBubbleEdges();
                    }
                }

                var functor = _this._functor;
                var rScale0 = rScale(0);
                var mouseOverOpacity = _this._mouseOverItemOpacity;
                var mouseOverStroke = _this._mouseOverItemStroke;
                var itemOpacity = _this._itemOpacity;
                var onMouseover = _this._onMouseover;
                var onMouseout = _this._onMouseout;
                var onClick = _this._onClick;
                var itemStroke = _this._itemStroke;
                var myToolTip = _this._toolTip;

                var bubbles = _this._svg.select('.ninja-chartGroup').call(myToolTip).selectAll('.bubble').data(_data);

                bubbles.enter().append('circle').classed('bubble', true).attr({
                    r: rScale0
                }).on('mouseover', function (d) {
                    d3.select(this).style({
                        opacity: function (d, i) {
                            return functor(mouseOverOpacity, d, i);
                        },
                        stroke: function (d, i) {
                            return functor(mouseOverStroke, d, i);
                        }
                    });
                    myToolTip.show(d);
                    onMouseover(d);
                }).on('mouseout', function (d) {
                    d3.select(this).style({
                        opacity: function (d, i) {
                            return functor(itemOpacity, d, i);
                        },
                        stroke: function (d, i) {
                            return functor(itemStroke, d, i);
                        }
                    });
                    myToolTip.hide(d);
                    onMouseout(d);
                }).on('click', function (d) {
                    onClick(d);
                });

                bubbles.transition().duration(_this._transitionDuration).delay(function (d, i) {
                    return functor(_this._transitionDelay, d, i);
                }).ease(_this._transitionEase).style({
                    opacity: function (d, i) {
                        return functor(itemOpacity, d, i);
                    },
                    stroke: function (d, i) {
                        return functor(itemStroke, d, i);
                    },
                    fill: function (d, i) {
                        return functor(_this._itemFill, d, i);
                    }
                }).attr({
                    cx: function (d) {
                        return xScale(d.x);
                    },
                    cy: function (d) {
                        return yScale(d.y);
                    },
                    r: function (d) {
                        return rScale(d.r);
                    }
                });

                bubbles.exit().transition().style({
                    opacity: 0
                }).remove();

                _this._plotLabels();
                _this._plotXAxis(xScale, yScale);
                _this._plotYAxis(xScale, yScale);
                _this._plotGrids(xScale, yScale);
            });
        };
        return BubbleChart;
    })(ninjaPixel.Chart);
    ninjaPixel.BubbleChart = BubbleChart;
})(ninjaPixel || (ninjaPixel = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ninjaPixel;
(function (ninjaPixel) {
    var LineChart = (function (_super) {
        __extends(LineChart, _super);
        function LineChart() {
            _super.call(this);
            this._isTimeseries = false;
            this._areaOpacity = 0;
            this._lineInterpolation = 'basis';
        }
        LineChart.prototype.isTimeseries = function (_x) {
            if (!arguments.length)
                return this._isTimeseries;
            this._isTimeseries = _x;
            return this;
        };
        LineChart.prototype.areaOpacity = function (_x) {
            if (!arguments.length)
                return this._areaOpacity;
            this._areaOpacity = _x;
            return this;
        };
        LineChart.prototype.lineInterpolation = function (_x) {
            if (!arguments.length)
                return this._lineInterpolation;
            this._lineInterpolation = _x;
            return this;
        };

        LineChart.prototype.plot = function (_selection) {
            var _this = this;
            var functor = this._functor;
            this._init(_selection);

            function getMinDate(theData) {
                return d3.min(theData, function (d) {
                    return new Date(d.x).getTime();
                });
            }

            function getMaxDate(theData) {
                return d3.max(theData, function (d) {
                    return new Date(d.x).getTime();
                });
            }

            function getMinX(theData) {
                return d3.min(theData, function (d) {
                    return d.x;
                });
            }

            function getMaxX(theData) {
                return d3.max(theData, function (d) {
                    return d.x;
                });
            }

            function getMinY(theData) {
                return d3.min(theData, function (d) {
                    return d.y;
                });
            }

            function getMaxY(theData) {
                return d3.max(theData, function (d) {
                    return d.y;
                });
            }

            _selection.each(function (_data) {
                var dataLen = _data.length;
                var minX, maxX, minY, maxY;

                for (var index = 0; index < dataLen; index++) {
                    var minYOfThisArray = getMinY(_data[index].data), maxYOfThisArray = getMaxY(_data[index].data), minXOfThisArray, maxXOfThisArray;

                    if (_this._isTimeseries) {
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

                if (_this._y1Min != null) {
                    minY = _this._y1Min;
                }
                if (_this._y1Max != null) {
                    maxY = _this._y1Max;
                }
                if (_this._xMin != null) {
                    minX = _this._xMin;
                }
                if (_this._xMax != null) {
                    maxX = _this._xMax;
                }

                var xScale;
                if (_this._isTimeseries) {
                    xScale = d3.time.scale().range([0, _this._chartWidth]).domain([minX, maxX]);
                } else {
                    xScale = d3.scale.linear().range([0, _this._chartWidth]).domain([minX, maxX]);
                }
                var yScale = d3.scale.linear().domain([minY, maxY]).range([_this._chartHeight, 0]);

                var singleLine = d3.svg.line().x(function (d) {
                    return xScale(d.x);
                }).y(function (d) {
                    return yScale(d.y);
                });
                singleLine.interpolate(_this._lineInterpolation);

                var baseLine = d3.svg.line().x(function (d) {
                    return xScale(d.x);
                }).y(function (d) {
                    return yScale(0);
                });
                baseLine.interpolate(_this._lineInterpolation);

                var area = d3.svg.area().x(function (d) {
                    return xScale(d.x);
                }).y0(function (d) {
                    if (minY > 0) {
                        return yScale(minY);
                    } else if (maxY < 0) {
                        return yScale(maxY);
                    } else {
                        return yScale(0);
                    }
                }).y1(function (d) {
                    return yScale(d.y);
                });
                area.interpolate(_this._lineInterpolation);

                var baseArea = d3.svg.area().x(function (d) {
                    return xScale(d.x);
                }).y0(function (d) {
                    return yScale(0);
                }).y1(function (d) {
                    return yScale(0);
                });
                baseArea.interpolate(_this._lineInterpolation);

                var areaSvg = _this._svg.select('.ninja-chartGroup').selectAll('path.area').data(_data, function (d) {
                    return d.name;
                });

                areaSvg.enter().append('svg:path').attr('class', 'area').style('opacity', 0).style('fill', 'none').style('stroke-width', '0px').attr('d', function (d) {
                    return baseArea(d.data);
                });

                areaSvg.transition().delay(function (d, i) {
                    return functor(_this._transitionDelay, d, i);
                }).duration(function (d, i) {
                    return functor(_this._transitionDuration, d, i);
                }).ease(_this._transitionEase).attr('d', function (d) {
                    return area(d.data);
                }).style({
                    opacity: function (d, i) {
                        return functor(_this._areaOpacity, d, i);
                    },
                    fill: function (d, i) {
                        return functor(_this._itemFill, d, i);
                    }
                });

                areaSvg.exit().transition().duration(500).ease('linear').style('opacity', 0).remove();

                var lineSvg = _this._svg.select('.ninja-chartGroup').selectAll('path.line').data(_data, function (d) {
                    return d.name;
                });

                lineSvg.enter().append('svg:path').attr('class', 'line').style({
                    opacity: 0,
                    stroke: function (d, i) {
                        return functor(_this._itemFill, d, i);
                    },
                    fill: 'none',
                    'stroke-width': '2.5px'
                }).attr('d', function (d) {
                    return baseLine(d.data);
                });

                lineSvg.transition().delay(function (d, i) {
                    return functor(_this._transitionDelay, d, i);
                }).duration(function (d, i) {
                    return functor(_this._transitionDuration, d, i);
                }).ease(_this._transitionEase).attr('d', function (d) {
                    return singleLine(d.data);
                }).style({
                    opacity: function (d, i) {
                        return functor(_this._itemOpacity, d, i);
                    },
                    stroke: function (d, i) {
                        return functor(_this._itemFill, d, i);
                    }
                });

                lineSvg.exit().transition().duration(function (d, i) {
                    return functor(_this._transitionDuration, d, i);
                }).ease(_this._transitionEase).style('opacity', 0).remove();

                _this._plotLabels();
                _this._plotXAxis(xScale, yScale);
                _this._plotYAxis(xScale, yScale);
                _this._plotGrids(xScale, yScale);
            });
        };
        return LineChart;
    })(ninjaPixel.Chart);
    ninjaPixel.LineChart = LineChart;
})(ninjaPixel || (ninjaPixel = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ninjaPixel;
(function (ninjaPixel) {
    var Histogram = (function (_super) {
        __extends(Histogram, _super);
        function Histogram() {
            _super.call(this);
            this._cornerRounding = 1;
            this._plotFrequency = true;
            this._histogramFunction = d3.layout.histogram();
        }
        Histogram.prototype.cornerRounding = function (_x) {
            if (!arguments.length)
                return this._cornerRounding;
            this._cornerRounding = _x;
            return this;
        };
        Histogram.prototype.bins = function (_x) {
            if (!arguments.length)
                return this._bins;
            this._bins = _x;
            return this;
        };
        Histogram.prototype.plotFrequency = function (_x) {
            if (!arguments.length)
                return this._plotFrequency;
            this._plotFrequency = _x;
            return this;
        };

        Histogram.prototype.plot = function (_selection) {
            var _this = this;
            _selection.each(function (_data) {
                _this._init(_selection);
                var functor = _this._functor;
                var myToolTip = _this._toolTip;

                if (_this._bins != null) {
                    _this._histogramFunction.bins(_this._bins);
                }
                _this._histogramFunction.frequency(_this._plotFrequency);
                _data = _this._histogramFunction(_data);

                var xScale = d3.scale.ordinal().domain(_data.map(function (d) {
                    return d.x;
                }));
                xScale.rangeRoundBands([0, _this._chartWidth], .1);
                var barWidth = xScale.rangeBand();

                var yMax = d3.max(_data, function (d) {
                    return d.y;
                });
                if (_this._y1Max != null) {
                    yMax = _this._y1Max;
                }

                var yScale = d3.scale.linear().domain([0, yMax]).range([_this._chartHeight, 0]);

                var bar = _this._svg.select('.ninja-chartGroup').call(myToolTip).selectAll('.bars').data(_data);

                bar.enter().append('rect').classed('bars', true).attr({
                    'x': function (d) {
                        return xScale(d.x);
                    },
                    'y': function (d) {
                        return yScale(0);
                    },
                    'height': function (d) {
                        return 0;
                    },
                    fill: function (d, i) {
                        return functor(_this._itemFill, d, i);
                    },
                    rx: _this._cornerRounding,
                    ry: _this._cornerRounding,
                    opacity: function (d, i) {
                        return functor(_this._itemOpacity, d, i);
                    }
                });
                bar.exit().remove();
                bar.transition().duration(_this._transitionDuration).ease(_this._transitionEase).attr('width', barWidth).attr({
                    'x': function (d) {
                        return xScale(d.x);
                    },
                    'y': function (d) {
                        return yScale(d.y);
                    },
                    'height': function (d) {
                        return yScale.range()[0] - yScale(d.y);
                    },
                    fill: function (d, i) {
                        return functor(_this._itemFill, d, i);
                    },
                    opacity: function (d, i) {
                        return functor(_this._itemOpacity, d, i);
                    }
                });

                _this._plotLabels();
                _this._plotXAxis(xScale, yScale);
                _this._plotYAxis(xScale, yScale);
                _this._plotGrids(xScale, yScale);
            });
        };
        return Histogram;
    })(ninjaPixel.Chart);
    ninjaPixel.Histogram = Histogram;
})(ninjaPixel || (ninjaPixel = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ninjaPixel;
(function (ninjaPixel) {
    var Donut = (function (_super) {
        __extends(Donut, _super);
        function Donut() {
            _super.call(this);
            this._outerRadius = 80;
            this._innerRadius = 50;
        }
        Donut.prototype.outerRadius = function (_x) {
            if (!arguments.length)
                return this._outerRadius;
            this._outerRadius = _x;
            return this;
        };
        Donut.prototype.innerRadius = function (_x) {
            if (!arguments.length)
                return this._innerRadius;
            this._innerRadius = _x;
            return this;
        };

        Donut.prototype.plot = function (_selection) {
            var _this = this;
            _selection.each(function (_data) {
                _this._init(_selection, 1 /* pie */);

                var arc = d3.svg.arc().outerRadius(_this._outerRadius).innerRadius(_this._innerRadius);

                var pie = d3.layout.pie().sort(null).value(function (d) {
                    return d.y;
                });

                var path = _this._svg.select('.ninja-chartGroup').selectAll("path").data(pie(_data)).enter().append("path");

                path.transition().duration(_this._transitionDuration).attr("fill", function (d, i) {
                    return d.color;
                }).attr("d", arc).each(function (d) {
                    this._current = d;
                });

                function change(data) {
                    path.data(pie(data));
                    path.transition().duration(750).attrTween("d", arcTween);
                }

                function arcTween(a) {
                    var i = d3.interpolate(this._current, a);
                    this._current = i(0);
                    return function (t) {
                        return arc(i(t));
                    };
                }
            });
        };
        return Donut;
    })(ninjaPixel.Chart);
    ninjaPixel.Donut = Donut;
})(ninjaPixel || (ninjaPixel = {}));
