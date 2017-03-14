var ninjaPixel;
(function (ninjaPixel) {
    ninjaPixel.version = '0.0.15';
    var Category;
    (function (Category) {
        Category[Category["xy"] = 0] = "xy";
        Category[Category["donut"] = 1] = "donut";
        Category[Category["treemap"] = 2] = "treemap";
        Category[Category["simpleTreemap"] = 3] = "simpleTreemap";
    })(Category = ninjaPixel.Category || (ninjaPixel.Category = {}));
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
            this._yAxis1LogScale = false;
            this._xAxisLogScale = false;
            this._xAxisTextOrientation = 'bottom';
            this._transitionDuration = 300;
            this._transitionEase = d3.easeLinear;
            this._transitionDelay = 0;
            this._removeTransitionDelay = 0;
            this._removeDelay = 0;
            this._labelEase = d3.easeLinear;
            this._plotHorizontalGrid = false;
            this._plotHorizontalGridTopping = false;
            this._plotVerticalGrid = false;
            this._plotVerticalGridTopping = false;
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
            this._itemFill2 = 'lightgray';
            this._itemStrokeWidth = '3px';
            this._toolTip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(function () {
                return null;
            })
                .direction('n');
        }
        Chart.prototype._init = function (_selection, category) {
            if (category === void 0) { category = Category.xy; }
            this._category = category;
            this._chartHeight = this._getChartHeight();
            this._chartWidth = this._getChartWidth();
            if (!this._svg) {
                if (this._category == Category.simpleTreemap) {
                    this._svg = _selection
                        .append('div')
                        .classed('ninja-treemap', true);
                    var container = this._svg.append('div').classed('ninja-containerGroup', true);
                }
                else {
                    this._svg = _selection
                        .append('svg')
                        .classed('ninja-chart', true);
                    var container = this._svg.append('g').classed('ninja-containerGroup', true);
                    container.append('g').classed('ninja-horizontalGrid', true);
                    container.append('g').classed('ninja-verticalGrid', true);
                    container.append('g').classed('ninja-chartGroup', true);
                    container.append('g').classed('ninja-horizontalGridTopping', true);
                    container.append('g').classed('ninja-verticalGridTopping', true);
                    container.append('g').classed('ninja-xAxisGroup ninja-axis', true);
                    container.append('g').classed('ninja-yAxisGroup ninja-axis', true);
                }
            }
            this._svg.transition().attrs({
                width: this._width,
                height: this._height
            });
            this._svg.style("height", this._height);
            this._svg.style("width", this._width);
            if (this._category == Category.donut) {
                this._svg.select('.ninja-containerGroup')
                    .attrs({
                    transform: 'translate(' + Number(Number(this._margin.left) + Number(this._chartWidth / 2)) + ',' + Number(Number(this._margin.top) + Number(this._chartHeight / 2)) + ')'
                });
            }
            else if (this._category == Category.xy || this._category == Category.treemap || this._category == Category.simpleTreemap) {
                this._svg.select('.ninja-containerGroup')
                    .attrs({
                    transform: 'translate(' + Number(this._margin.left) + ',' + Number(this._margin.top) + ')'
                });
            }
            this._plotTheBackground();
        };
        Chart.prototype._plotXAxis = function (xScale, yScale) {
            var _this = this;
            var xAxis = d3.axisBottom(xScale)
                .tickSizeOuter(0);
            if (this._plotVerticalGridTopping) {
                xAxis.tickSizeInner(this._chartHeight);
            }
            if (!this._xAxisLogScale) {
                if (this._xAxisTickFormat != null) {
                    xAxis.tickFormat(this._xAxisTickFormat);
                }
                if (this._xAxisTicks != null) {
                    xAxis.ticks(this._xAxisTicks);
                }
            }
            else {
                if (this._xAxisTicks === null) {
                    this._xAxisTicks = 10;
                }
                xAxis.ticks(this._xAxisTicks, this._xAxisTickFormat);
            }
            this._svg.select('.ninja-xAxisGroup.ninja-axis')
                .attrs({
                transform: function () {
                    if (_this._axesOrigin != null) {
                        var yPosition = yScale(_this._axesOrigin.y);
                        if (!yPosition) {
                            yPosition = 0;
                        }
                        return 'translate(0,' + yPosition + ')';
                    }
                    else {
                        return 'translate(0,' + (_this._chartHeight) + ')';
                    }
                }
            })
                .call(xAxis);
            if (this._xAxisTextTransform != null) {
                this._svg.select('.ninja-xAxisGroup.ninja-axis')
                    .selectAll('.tick text')
                    .style('text-anchor', 'end')
                    .attr('transform', this._xAxisTextTransform);
            }
            if (this._plotVerticalGrid) {
                xAxis.tickSizeInner(this._chartHeight);
                this._svg.select('.ninja-verticalGrid')
                    .attrs({
                    transform: function () {
                        return 'translate(0,' + (_this._chartHeight) + ')';
                    }
                })
                    .call(xAxis);
            }
        };
        Chart.prototype._plotYAxis = function (xScale, yScale) {
            var _this = this;
            var yAxis = d3.axisLeft(yScale)
                .tickSizeOuter(0);
            if (this._plotHorizontalGridTopping) {
                yAxis.tickSizeInner(this._chartWidth);
            }
            if (this._yAxisTickFormat != null) {
                yAxis.tickFormat(this._yAxisTickFormat);
            }
            if (this._yAxisTicks != null) {
                yAxis.ticks(this._yAxisTicks);
            }
            this._svg.select('.ninja-yAxisGroup.ninja-axis')
                .transition()
                .ease(this._labelEase)
                .attrs({
                transform: function () {
                    if (_this._axesOrigin != null) {
                        return 'translate(' + xScale(_this._axesOrigin.x) + ',0)';
                    }
                }
            })
                .call(yAxis);
            if (this._plotHorizontalGrid) {
                yAxis.tickSizeInner(this._chartWidth);
                this._svg.select('.ninja-horizontalGrid')
                    .transition()
                    .ease(this._labelEase)
                    .attrs({
                    transform: function () {
                        if (_this._axesOrigin != null) {
                        }
                    }
                })
                    .call(yAxis);
            }
        };
        Chart.prototype._plotXYAxes = function (xScale, yScale) {
            this._plotXAxis(xScale, yScale);
            this._plotYAxis(xScale, yScale);
        };
        Chart.prototype._plotLabels = function () {
            if (!this._svg.select('.ninja-chartTitle')[0] || !this._svg.select('.ninja-chartTitle')[0][0]) {
                this._svg.append("g").classed("ninja-chartTitle", true);
                this._svg.append("g").classed("ninja-y1Title", true);
                this._svg.append("g").classed("ninja-y2Title", true);
                this._svg.append("g").classed("ninja-xTitle", true);
            }
            var arr = [0];
            var titleSvg = this._svg.select(".ninja-chartTitle")
                .selectAll("text.ninja-chartTitle")
                .data(arr);
            titleSvg.enter().append("text")
                .attr("class", "ninja-chartTitle")
                .attr('x', (this._chartWidth / 2) + this._margin.left)
                .attr('y', (this._margin.top / 2))
                .style('text-anchor', 'middle');
            titleSvg.exit()
                .transition()
                .duration(this._transitionDuration)
                .remove();
            titleSvg.transition()
                .duration(this._transitionDuration)
                .text(this._title);
            var yTitleSvg1 = this._svg.select('.ninja-y1Title')
                .selectAll('text.ninja-y1Title')
                .data(arr);
            yTitleSvg1.enter().append('text')
                .attr('class', 'ninja-y1Title')
                .attr('transform', 'rotate(-90)')
                .style('text-anchor', 'middle');
            yTitleSvg1.exit().transition()
                .duration(this._transitionDuration)
                .remove();
            var horizontalOffset = this._margin.left * 0.4;
            if (this._yTitleHorizontalOffset) {
                horizontalOffset = this._yTitleHorizontalOffset;
            }
            yTitleSvg1.transition()
                .duration(this._transitionDuration)
                .text(this._yAxis1Title)
                .attr('x', -(this._chartHeight / 2) - this._margin.top)
                .attr('y', horizontalOffset);
            var xTitleSvg = this._svg.select('.ninja-xTitle')
                .selectAll('text.ninja-xTitle').data(arr);
            xTitleSvg.enter().append('text')
                .attr('class', 'ninja-xTitle')
                .style('text-anchor', 'middle');
            xTitleSvg.exit().transition()
                .duration(this._transitionDuration)
                .remove();
            var xPos = (this._chartWidth / 2) + Number(this._margin.left);
            var verticalOffset = this._margin.bottom / 1.5;
            if (this._xTitleVerticalOffset) {
                verticalOffset = this._xTitleVerticalOffset;
            }
            var yPos = this._chartHeight + this._margin.top + verticalOffset;
            xTitleSvg.transition()
                .duration(this._transitionDuration)
                .text(this._xAxisTitle)
                .attr('y', yPos)
                .attr('x', xPos);
        };
        Chart.prototype._getChartWidth = function () {
            return this._width - this._margin.left - this._margin.right;
        };
        Chart.prototype._getChartHeight = function () {
            return this._height - this._margin.bottom - this._margin.top;
        };
        Chart.prototype._plotGrids_DEPRECATED = function (xScale, yScale) {
            console.log('WARNING: the -plotGrids methods has been deprecated and will shortly be removed');
            var svg = this._svg;
            var chartWidth = this._chartWidth;
            var chartHeight = this._chartHeight;
            var ease = this._labelEase;
            if (this._xAxisTicks != null) {
                xScale.ticks(this._xAxisTicks);
            }
            function plotHGrid(yScale, className) {
                var horizontalLines = svg.select('.' + className)
                    .selectAll('hLines')
                    .data(yScale.ticks());
                horizontalLines.enter()
                    .append('line')
                    .classed('hLines', true);
                horizontalLines.transition()
                    .ease(ease)
                    .attrs({
                    "x1": 0,
                    "x2": chartWidth,
                    "y1": function (d) {
                        return yScale(d);
                    },
                    "y2": function (d) {
                        return yScale(d);
                    }
                });
                horizontalLines.exit()
                    .remove();
            }
            ;
            function plotVGrid(xScale, className) {
                var verticalLines = svg.select('.' + className)
                    .selectAll('hLines')
                    .data(xScale.ticks());
                verticalLines.enter()
                    .append('line')
                    .classed('hLines', true);
                verticalLines.transition()
                    .ease(ease)
                    .attrs({
                    "x1": function (d) {
                        return xScale(d);
                    },
                    "x2": function (d) {
                        return xScale(d);
                    },
                    "y1": 0,
                    "y2": chartHeight
                });
                verticalLines.exit()
                    .remove();
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
                var background = this._svg.select('.ninja-chartGroup')
                    .selectAll('.ninja-background')
                    .data([1]);
                background.enter().append('rect')
                    .classed('ninja-background', true)
                    .attrs({
                    x: 0,
                    y: 0,
                    height: this._chartHeight,
                    width: this._chartWidth
                });
                background.transition()
                    .attrs({
                    x: 0,
                    y: 0,
                    height: this._chartHeight,
                    width: this._chartWidth
                });
                background.exit()
                    .remove();
            }
        };
        Chart.prototype._functor = function (variable, d, i) {
            function isFunction(functionToCheck) {
                return !!(functionToCheck && functionToCheck.constructor && functionToCheck.call && functionToCheck.apply);
            }
            if (isFunction(variable)) {
                return variable(d, i);
            }
            else {
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
        Chart.prototype.itemFill2 = function (_x) {
            if (!arguments.length)
                return this._itemFill2;
            this._itemFill2 = _x;
            return this;
        };
        Chart.prototype.itemStroke = function (_x) {
            if (!arguments.length)
                return this._itemStroke;
            this._itemStroke = _x;
            return this;
        };
        Chart.prototype.itemTextLabelColor = function (_x) {
            if (!arguments.length)
                return this._itemTextLabelColor;
            this._itemTextLabelColor = _x;
            return this;
        };
        Chart.prototype.itemStrokeWidth = function (_x) {
            if (!arguments.length)
                return this._itemStrokeWidth;
            this._itemStrokeWidth = _x;
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
        Chart.prototype.removeTransitionDelay = function (_x) {
            if (!arguments.length)
                return this._removeTransitionDelay;
            this._removeTransitionDelay = _x;
            return this;
        };
        Chart.prototype.removeDelay = function (_x) {
            if (!arguments.length)
                return this._removeDelay;
            this._removeDelay = _x;
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
        Chart.prototype.yAxis1LogScale = function (_x) {
            if (!arguments.length)
                return this._yAxis1LogScale;
            this._yAxis1LogScale = _x;
            return this;
        };
        Chart.prototype.xAxisLogScale = function (_x) {
            if (!arguments.length)
                return this._xAxisLogScale;
            this._xAxisLogScale = _x;
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
        Chart.prototype.xTitleVerticalOffset = function (_x) {
            if (!arguments.length)
                return this._xTitleVerticalOffset;
            this._xTitleVerticalOffset = Number(_x);
            return this;
        };
        Chart.prototype.yTitleHorizontalOffset = function (_x) {
            if (!arguments.length)
                return this._yTitleHorizontalOffset;
            this._yTitleHorizontalOffset = Number(_x);
            return this;
        };
        Chart.prototype.xAxisTickFormat = function (_x) {
            if (!arguments.length)
                return this._xAxisTickFormat;
            this._xAxisTickFormat = _x;
            return this;
        };
        Chart.prototype.xAxisTextOrientation = function (_x) {
            if (!arguments.length)
                return this._xAxisTextOrientation;
            this._xAxisTextOrientation = _x;
            return this;
        };
        Chart.prototype.xAxisTicks = function (_x) {
            if (!arguments.length)
                return this._xAxisTicks;
            this._xAxisTicks = _x;
            return this;
        };
        Chart.prototype.yAxisTickFormat = function (_x) {
            if (!arguments.length)
                return this._yAxisTickFormat;
            this._yAxisTickFormat = _x;
            return this;
        };
        Chart.prototype.yAxisTicks = function (_x) {
            if (!arguments.length)
                return this._yAxisTicks;
            this._yAxisTicks = _x;
            return this;
        };
        Chart.prototype.internalXAxisMargin = function (_x) {
            if (!arguments.length)
                return this._internalXAxisMargin;
            this._internalXAxisMargin = _x;
            return this;
        };
        return Chart;
    }());
    ninjaPixel.Chart = Chart;
})(ninjaPixel || (ninjaPixel = {}));
//# sourceMappingURL=chart.js.map