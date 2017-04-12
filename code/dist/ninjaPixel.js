var ninjaPixel;
(function (ninjaPixel) {
    ninjaPixel.version = '0.0.17.0';
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
            var mouseOverFn = this._onMouseover;
            this._onMouseover = function (d) {
                if (this._toolTip && this._toolTip.getBoundingBox) {
                    mouseOverFn(d, this._toolTip.getBoundingBox());
                }
                else {
                    mouseOverFn(d);
                }
            };
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
        Chart.prototype._getMinMaxX = function (data, isTimeseries) {
            if (isTimeseries === void 0) { isTimeseries = false; }
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
            if (isTimeseries) {
                var minX = void 0, maxX = void 0;
                if (this._xMin != null) {
                    minX = new Date(this._xMin).getTime();
                }
                else {
                    minX = getMinDate(data);
                }
                if (this._xMax != null) {
                    maxX = new Date(this._xMax).getTime();
                }
                else {
                    maxX = getMaxDate(data);
                }
                return { min: minX, max: maxX };
            }
            else {
                var minX = 0, maxX = 1;
                if (this._xMin != null) {
                    minX = Number(this._xMin);
                }
                else {
                    minX = data.map(function (d) { return d.x; }).sort(sortAsc)[0];
                }
                if (this._xMax != null) {
                    maxX = Number(this._xMax);
                }
                else {
                    maxX = data.map(function (d) { return d.x; }).sort(sortDesc)[0];
                }
                return { min: minX, max: maxX };
            }
        };
        Chart.prototype._plotXAxis = function (xScale, yScale) {
            var _this = this;
            var top = this._xAxisTextOrientation === 'top';
            var setTickSizeInner = function () {
                if (top) {
                    xAxis.tickSizeInner(-_this._chartHeight);
                }
                else {
                    xAxis.tickSizeInner(_this._chartHeight);
                }
            };
            var transformAxis = function () {
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
            };
            var xAxis = d3.axisBottom(xScale);
            if (top) {
                xAxis = d3.axisTop(xScale);
            }
            xAxis.tickSizeOuter(0);
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
                transform: transformAxis
            })
                .call(xAxis);
            if (this._xAxisTextTransform != null) {
                this._svg.select('.ninja-xAxisGroup.ninja-axis')
                    .selectAll('.tick text')
                    .style('text-anchor', 'end')
                    .attr('transform', this._xAxisTextTransform);
            }
            if (this._plotVerticalGridTopping) {
                setTickSizeInner();
                var topping = this._svg.select('.ninja-verticalGridTopping');
                topping.transition()
                    .ease(this._labelEase)
                    .call(xAxis);
                this._hideAxisLineAndText(topping);
            }
            if (this._plotVerticalGrid) {
                setTickSizeInner();
                var grid = this._svg.select('.ninja-verticalGrid');
                grid.call(xAxis);
                this._hideAxisLineAndText(grid);
            }
        };
        Chart.prototype._plotYAxis = function (xScale, yScale) {
            var _this = this;
            var yAxis = d3.axisLeft(yScale)
                .tickSizeOuter(0);
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
                    else {
                        return "translate(0,0)";
                    }
                }
            })
                .call(yAxis);
            if (this._plotHorizontalGridTopping) {
                yAxis.tickSizeInner(-this._chartWidth);
                var topping = this._svg.select('.ninja-horizontalGridTopping');
                topping.transition()
                    .ease(this._labelEase)
                    .call(yAxis);
                this._hideAxisLineAndText(topping);
            }
            if (this._plotHorizontalGrid) {
                yAxis.tickSizeInner(-this._chartWidth);
                var grid = this._svg.select('.ninja-horizontalGrid');
                grid.transition()
                    .ease(this._labelEase)
                    .call(yAxis);
                this._hideAxisText(grid);
            }
        };
        Chart.prototype._hideAxisLine = function (selection) {
            selection.selectAll('path.domain')
                .style('stroke', 'none');
        };
        Chart.prototype._hideAxisText = function (selection) {
            selection.selectAll('text')
                .style('font-size', '0px');
        };
        Chart.prototype._hideAxisLineAndText = function (selection) {
            this._hideAxisLine(selection);
            this._hideAxisText(selection);
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
            var enterTitle = titleSvg.enter()
                .append("text")
                .attr("class", "ninja-chartTitle")
                .attr('x', (this._chartWidth / 2) + this._margin.left)
                .attr('y', (this._margin.top / 2))
                .style('text-anchor', 'middle');
            titleSvg.exit()
                .transition()
                .duration(this._transitionDuration)
                .remove();
            titleSvg.merge(enterTitle).transition()
                .duration(this._transitionDuration)
                .text(this._title);
            var yTitleSvg1 = this._svg.select('.ninja-y1Title')
                .selectAll('text.ninja-y1Title')
                .data(arr);
            var enterYTitleSvg1 = yTitleSvg1.enter().append('text')
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
            yTitleSvg1.merge(enterYTitleSvg1).transition()
                .duration(this._transitionDuration)
                .text(this._yAxis1Title)
                .attr('x', -(this._chartHeight / 2) - this._margin.top)
                .attr('y', horizontalOffset);
            var xTitleSvg = this._svg.select('.ninja-xTitle')
                .selectAll('text.ninja-xTitle').data(arr);
            var enterXTitleSvg = xTitleSvg.enter().append('text')
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
            xTitleSvg.merge(enterXTitleSvg).transition()
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
        Chart.prototype._genericMouseoverBehaviour = function (that, d, i, mouseOverItemOpacity, mouseOverItemStroke) {
            var _this = this;
            if (mouseOverItemOpacity === void 0) { mouseOverItemOpacity = this._mouseOverItemOpacity; }
            if (mouseOverItemStroke === void 0) { mouseOverItemStroke = this._mouseOverItemStroke; }
            d3.select(that)
                .style('opacity', function (d, i) {
                return _this._functor(mouseOverItemOpacity, d, i);
            })
                .style('stroke', function (d, i) {
                return _this._functor(mouseOverItemStroke, d, i);
            });
            if (this._toolTip) {
                this._toolTip.show(d);
            }
            this._onMouseover(d);
        };
        Chart.prototype._genericMouseoutBehaviour = function (that, d, i, itemOpacity, itemStroke) {
            var _this = this;
            if (itemOpacity === void 0) { itemOpacity = this._itemOpacity; }
            if (itemStroke === void 0) { itemStroke = this._itemStroke; }
            d3.select(that)
                .style('opacity', function (d, i) {
                return _this._functor(itemOpacity, d, i);
            })
                .style('stroke', function (d, i) {
                return _this._functor(itemStroke, d, i);
            });
            if (this._toolTip) {
                this._toolTip.hide();
            }
            this._onMouseout(d);
        };
        Chart.prototype._simpleMouseoverBehaviour = function (d) {
            if (this._toolTip) {
                this._toolTip.show(d);
            }
            this._onMouseover(d);
        };
        Chart.prototype._simpleMouseoutBehaviour = function (d) {
            if (this._toolTip) {
                this._toolTip.hide();
            }
            this._onMouseout(d);
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
//
var ninjaPixel;
(function (ninjaPixel) {
    var Formatter = (function () {
        function Formatter() {
        }
        Formatter.prototype.Financial = function (_a) {
            var _b = _a.prefix, prefix = _b === void 0 ? '' : _b, _c = _a.suffix, suffix = _c === void 0 ? '' : _c, _d = _a.digits, digits = _d === void 0 ? 0 : _d;
            return function (num) {
                var out = d3.format("." + digits + "s")(num);
                if (out.slice(-1) === 'G') {
                    out = out.slice(0, -1) + 'B';
                }
                return "" + prefix + out + suffix;
            };
        };
        return Formatter;
    }());
    ninjaPixel.Formatter = Formatter;
})(ninjaPixel || (ninjaPixel = {}));
//
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
            var onClick = this._onClick;
            var defaultBarOpacity = this._itemOpacity;
            var defaultStroke = this._itemStroke;
            var barFill = this._itemFill;
            var genericMouseoverBehaviour = this._genericMouseoverBehaviour.bind(this);
            var genericMouseoutBehaviour = this._genericMouseoutBehaviour.bind(this);
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
                    var _a = _this._getMinMaxX(_data, _this._isTimeseries), min = _a.min, max = _a.max;
                    _this._xScale = d3.scaleTime()
                        .range([0 + barW, _this._chartWidth - barW])
                        .domain([min, max]);
                }
                else {
                    _this._xScale = d3.scaleBand()
                        .domain(_data.map(function (d, i) {
                        return d.x;
                    }))
                        .range([0, _this._chartWidth])
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
                    if (!_this._isTimeseries) {
                        barW = xScale.bandwidth();
                    }
                    else {
                        console.warn("Bar width is " + barW + " for a timeseries bar chart. This shouldn't be happening.");
                    }
                }
                var barAdjustmentX = 0;
                if (_this._isTimeseries) {
                    barAdjustmentX = -barW / 2;
                }
                if (barWidth != null) {
                    barAdjustmentX = (xScale.bandwidth() - barW) / 2;
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
                    genericMouseoverBehaviour(this, d, i);
                })
                    .on('mouseout', function (d, i) {
                    genericMouseoutBehaviour(this, d, i);
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
                _this._plotXYAxes(xScale, yScale);
            });
        };
        return BarChart;
    }(ninjaPixel.Chart));
    ninjaPixel.BarChart = BarChart;
})(ninjaPixel || (ninjaPixel = {}));
//
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
    var HorizontalBarChart = (function (_super) {
        __extends(HorizontalBarChart, _super);
        function HorizontalBarChart() {
            var _this = _super.call(this) || this;
            _this._cornerRounding = 1;
            _this._isTimeseries = false;
            return _this;
        }
        HorizontalBarChart.prototype.cornerRounding = function (_x) {
            if (!arguments.length)
                return this._cornerRounding;
            this._cornerRounding = _x;
            return this;
        };
        HorizontalBarChart.prototype.isTimeseries = function (_x) {
            if (!arguments.length)
                return this._isTimeseries;
            this._isTimeseries = _x;
            return this;
        };
        HorizontalBarChart.prototype.barWidth = function (_x) {
            if (!arguments.length)
                return this._barWidth;
            this._barWidth = _x;
            return this;
        };
        HorizontalBarChart.prototype.plot = function (_selection, barHeight) {
            var _this = this;
            if (this._barWidth) {
                var barCount = 1;
                _selection.each(function (_data) {
                    if (_data.length > barCount) {
                        barCount = _data.length;
                    }
                });
                this._height = (this._barWidth * barCount * 1.5) + this._margin.top + this._margin.bottom;
            }
            this._init(_selection);
            var functor = this._functor;
            var myToolTip = this._toolTip;
            var onClick = this._onClick;
            var defaultBarOpacity = this._itemOpacity;
            var defaultStroke = this._itemStroke;
            var barFill = this._itemFill;
            var genericMouseoverBehaviour = this._genericMouseoverBehaviour.bind(this);
            var genericMouseoutBehaviour = this._genericMouseoutBehaviour.bind(this);
            function getMinDate(theData) {
                return d3.min(theData, function (d) {
                    return new Date(d.y).getTime();
                });
            }
            function getMaxDate(theData) {
                return d3.max(theData, function (d) {
                    return new Date(d.y).getTime();
                });
            }
            _selection.each(function (_data) {
                var barH;
                if (barHeight != null) {
                    barH = barHeight;
                }
                else if (_this._barWidth) {
                    barH = _this._barWidth;
                }
                else {
                    if (_this._isTimeseries) {
                        barH = 0.9 * _this._chartWidth / (_data.length + 1);
                    }
                    else {
                        barH = 0;
                    }
                }
                var minData = 0;
                var maxData = 0;
                if (_this._xMin != null) {
                    minData = _this._xMin;
                }
                else {
                    var d3MinX = d3.min(_data, function (d) { return d.x; });
                    if (d3MinX < 0) {
                        minData = d3MinX;
                    }
                }
                if (_this._xMax != null) {
                    maxData = _this._xMax;
                }
                else {
                    var d3MaxX = d3.max(_data, function (d) { return d.x; });
                    if (d3MaxX > 0) {
                        maxData = d3MaxX;
                    }
                    if (maxData === minData) {
                        maxData += 10;
                    }
                }
                if (_this._isTimeseries) {
                    console.warn('The timeseries option is untested.');
                    var minY, maxY;
                    if (_this._xMin != null) {
                        minY = new Date(_this._y1Min).getTime();
                    }
                    else {
                        minY = getMinDate(_data);
                    }
                    if (_this._xMax != null) {
                        maxY = new Date(_this._y1Max).getTime();
                    }
                    else {
                        maxY = getMaxDate(_data);
                    }
                    _this._yScale = d3.scaleTime()
                        .domain([minY, maxY])
                        .range([0 + barH, _this._chartHeight - barH]);
                }
                else {
                    _this._yScale = d3.scaleBand()
                        .domain(_data.map(function (d, i) {
                        return d.y;
                    }))
                        .range([0, _this._chartHeight])
                        .padding(0.1);
                }
                _this._xScale = d3.scaleLinear()
                    .domain([minData, maxData])
                    .range([0, _this._chartWidth]);
                _this._barScale = d3.scaleLinear()
                    .domain([Math.abs(maxData - minData), 0])
                    .range([_this._chartHeight, 0]);
                var xScale = _this._xScale;
                var yScale = _this._yScale;
                var barScale = _this._barScale;
                if (barH <= 0) {
                    barH = yScale.bandwidth();
                }
                var barAdjustmentY = 0;
                if (_this._isTimeseries) {
                    barAdjustmentY = -barH / 2;
                }
                if (barHeight != null) {
                    barAdjustmentY = (yScale.bandwidth() - barH) / 2;
                }
                function yScaleAdjusted(y) {
                    return yScale(y) + barAdjustmentY;
                }
                _this._yScaleAdjusted = yScaleAdjusted;
                var xScale0 = xScale(0);
                var bars = _this._svg.select('.ninja-chartGroup')
                    .call(myToolTip)
                    .selectAll('.bar')
                    .data(_data, function (d) {
                    return d.y;
                });
                var enterBars = bars.enter().append('rect')
                    .classed('bar', true)
                    .attrs({
                    y: function (d, i) {
                        return yScaleAdjusted(d.y);
                    },
                    width: 0,
                    x: xScale0,
                    height: barH,
                    fill: function (d, i) {
                        return functor(_this._itemFill, d, i);
                    },
                    rx: _this._cornerRounding,
                    ry: _this._cornerRounding
                })
                    .on('mouseover', function (d, i) {
                    genericMouseoverBehaviour(this, d, i);
                })
                    .on('mouseout', function (d, i) {
                    genericMouseoutBehaviour(this, d, i);
                })
                    .on('click', function (d, i) {
                    onClick(d);
                });
                bars.merge(enterBars)
                    .transition()
                    .duration(_this._transitionDuration)
                    .delay(function (d, i) {
                    return functor(_this._transitionDelay, d, i);
                })
                    .ease(_this._transitionEase)
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
                        }
                        else {
                            width = xScale(0);
                        }
                        if (width > 0) {
                            return width;
                        }
                        else {
                            return 0;
                        }
                    }
                });
                bars.exit()
                    .transition()
                    .duration(function (d, i) {
                    return functor(_this._removeTransitionDelay, d, i);
                })
                    .ease(_this._transitionEase)
                    .attrs({
                    x: 0
                })
                    .delay(function (d, i) {
                    return functor(_this._removeDelay, d, i);
                })
                    .remove();
                _this._plotLabels();
                _this._plotXYAxes(xScale, yScale);
            });
        };
        return HorizontalBarChart;
    }(ninjaPixel.Chart));
    ninjaPixel.HorizontalBarChart = HorizontalBarChart;
})(ninjaPixel || (ninjaPixel = {}));
//
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
    var GroupedBarChart = (function (_super) {
        __extends(GroupedBarChart, _super);
        function GroupedBarChart() {
            var _this = _super.call(this) || this;
            _this._cornerRounding = 1;
            _this._isTimeseries = false;
            return _this;
        }
        GroupedBarChart.prototype.cornerRounding = function (_x) {
            if (!arguments.length)
                return this._cornerRounding;
            this._cornerRounding = _x;
            return this;
        };
        GroupedBarChart.prototype.isTimeseries = function (_x) {
            if (!arguments.length)
                return this._isTimeseries;
            this._isTimeseries = _x;
            return this;
        };
        GroupedBarChart.prototype.barWidth = function (_x) {
            if (!arguments.length)
                return this._barWidth;
            this._barWidth = _x;
            return this;
        };
        GroupedBarChart.prototype.plot = function (_selection, barWidth) {
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
            var genericMouseoverBehaviour = this._genericMouseoverBehaviour.bind(this);
            var genericMouseoutBehaviour = this._genericMouseoutBehaviour.bind(this);
            function getMinDate(theData) {
                return d3.min(theData, function (d) { return new Date(d.x).getTime(); });
            }
            function getMaxDate(theData) {
                return d3.max(theData, function (d) { return new Date(d.x).getTime(); });
            }
            _selection.each(function (_data) {
                var distinctGroups = [];
                _data.forEach(function (d) {
                    d.data.forEach(function (e) {
                        if (distinctGroups.indexOf(e.group) < 0) {
                            distinctGroups.push(e.group);
                        }
                    });
                });
                var barW;
                if (barWidth != null) {
                    barW = barWidth;
                }
                if (_this._barWidth) {
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
                    _data.forEach(function (dd) {
                        var d3MinY = d3.min(dd.data, function (d) { return d.y; });
                        if (d3MinY < minData) {
                            minData = d3MinY;
                        }
                    });
                }
                if (_this._y1Max != null) {
                    maxData = _this._y1Max;
                }
                else {
                    _data.forEach(function (dd) {
                        var d3MaxY = d3.max(dd.data, function (d) { return d.y; });
                        if (d3MaxY > maxData) {
                            maxData = d3MaxY;
                        }
                    });
                    if (maxData === minData) {
                        maxData += 10;
                    }
                }
                if (_this._isTimeseries) {
                    var _a = _this._getMinMaxX(_data, _this._isTimeseries), min = _a.min, max = _a.max;
                    _this._xScale = d3.scaleTime()
                        .range([0 + barW, _this._chartWidth - barW])
                        .domain([min, max]);
                }
                else {
                    _this._xScale = d3.scaleBand()
                        .domain(_data.map(function (d, i) {
                        return d.x;
                    }))
                        .range([0, _this._chartWidth])
                        .padding(0.1);
                }
                _this._yScale = d3.scaleLinear()
                    .domain([minData, maxData])
                    .range([_this._chartHeight, 0]);
                _this._barScale = d3.scaleLinear()
                    .domain([Math.abs(maxData - minData), 0])
                    .range([_this._chartHeight, 0]);
                var xScale = _this._xScale;
                var yScale = _this._yScale;
                var barScale = _this._barScale;
                var xGroupScale = d3.scaleBand();
                if (barW <= 0) {
                    barW = xScale.bandwidth();
                }
                xGroupScale.domain(distinctGroups).rangeRound([0, barW]);
                var barAdjustmentX = 0;
                if (_this._isTimeseries) {
                    barAdjustmentX = -barW / 2;
                }
                function xScaleAdjusted(x) {
                    return xScale(x) + barAdjustmentX;
                }
                _this._xScaleAdjusted = xScaleAdjusted;
                var yScale0 = yScale(0);
                var barsRoot = _this._svg.select('.ninja-chartGroup')
                    .call(myToolTip)
                    .selectAll('.g')
                    .data(_data, function (d) { return d.x; });
                var barsRootEnter = barsRoot.enter().append("g")
                    .attr("class", "g")
                    .attr("transform", function (d) { return "translate(" + xScaleAdjusted(d.x) + ",0)"; });
                barsRoot.merge(barsRootEnter).transition()
                    .duration(_this._transitionDuration)
                    .attr("transform", function (d) { return "translate(" + xScaleAdjusted(d.x) + ",0)"; });
                barsRoot.exit()
                    .transition()
                    .remove();
                var widthFactor = 0.95;
                var bars = barsRoot.selectAll(".bar")
                    .data(function (d) { return d.data; });
                var barsEnter = bars.enter().append('rect')
                    .classed('bar', true)
                    .attrs({
                    x: function (d, i) {
                        return xGroupScale(d.group);
                    },
                    width: function (d, i) { return widthFactor * xGroupScale.bandwidth(); },
                    y: yScale0,
                    height: 0,
                    fill: function (d, i) { return functor(_this._itemFill, d, i); },
                    rx: _this._cornerRounding,
                    ry: _this._cornerRounding
                })
                    .on('mouseover', function (d, i) {
                    genericMouseoverBehaviour(this, d, i);
                })
                    .on('mouseout', function (d, i) {
                    genericMouseoutBehaviour(this, d, i);
                })
                    .on('click', function (d, i) {
                    onClick(d);
                });
                bars.merge(barsEnter).transition()
                    .duration(_this._transitionDuration)
                    .delay(function (d, i) { return functor(_this._transitionDelay, d, i); })
                    .ease(_this._transitionEase)
                    .styles({
                    opacity: function (d, i) { return functor(defaultBarOpacity, d, i); },
                    stroke: function (d, i) { return functor(defaultStroke, d, i); },
                    fill: function (d, i) { return functor(barFill, d, i); }
                })
                    .attrs({
                    x: function (d, i) {
                        return xGroupScale(d.group);
                    },
                    width: function (d, i) { return widthFactor * xGroupScale.bandwidth(); },
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
                    .duration(function (d, i) { return functor(_this._removeTransitionDelay, d, i); })
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
                    .delay(function (d, i) { return functor(_this._removeDelay, d, i); })
                    .remove();
                _this._plotLabels();
                _this._plotXYAxes(xScale, yScale);
            });
        };
        return GroupedBarChart;
    }(ninjaPixel.Chart));
    ninjaPixel.GroupedBarChart = GroupedBarChart;
})(ninjaPixel || (ninjaPixel = {}));
//
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
    var GroupedInterquartileChart = (function (_super) {
        __extends(GroupedInterquartileChart, _super);
        function GroupedInterquartileChart() {
            var _this = _super.call(this) || this;
            _this._cornerRounding = 1;
            _this._medianWidth = 8;
            _this._isTimeseries = false;
            return _this;
        }
        GroupedInterquartileChart.prototype.cornerRounding = function (_x) {
            if (!arguments.length)
                return this._cornerRounding;
            this._cornerRounding = _x;
            return this;
        };
        GroupedInterquartileChart.prototype.medianWidth = function (_x) {
            if (!arguments.length)
                return this._medianWidth;
            this._medianWidth = _x;
            return this;
        };
        GroupedInterquartileChart.prototype.isTimeseries = function (_x) {
            if (!arguments.length)
                return this._isTimeseries;
            this._isTimeseries = _x;
            return this;
        };
        GroupedInterquartileChart.prototype.barWidth = function (_x) {
            if (!arguments.length)
                return this._barWidth;
            this._barWidth = _x;
            return this;
        };
        GroupedInterquartileChart.prototype.plot = function (_selection, barWidth) {
            var _this = this;
            this._init(_selection);
            var functor = this._functor;
            var myToolTip = this._toolTip;
            var onClick = this._onClick;
            var mouseOverBarOpacity = this._mouseOverItemOpacity;
            var defaultBarOpacity = this._itemOpacity;
            var mouseOverBarStroke = this._mouseOverItemStroke;
            var defaultStroke = this._itemStroke;
            var barFill = this._itemFill;
            var barFill2 = this._itemFill2;
            var medianWidth = this._medianWidth;
            var itemStrokeWidth = this._itemStrokeWidth;
            var genericMouseoverBehaviour = this._simpleMouseoverBehaviour.bind(this);
            var genericMouseoutBehaviour = this._simpleMouseoutBehaviour.bind(this);
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
            _selection.each(function (_data) {
                var distinctGroups = [];
                _data.forEach(function (d) {
                    d.data.forEach(function (e) {
                        if (distinctGroups.indexOf(e.group) < 0) {
                            distinctGroups.push(e.group);
                        }
                    });
                });
                var barW;
                if (barWidth != null) {
                    barW = barWidth;
                }
                if (_this._barWidth) {
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
                    _data.forEach(function (dd) {
                        var d3MinY = d3.min(dd.data, function (d) { return d.yMin; });
                        if (d3MinY < minData) {
                            minData = d3MinY;
                        }
                    });
                }
                if (_this._y1Max != null) {
                    maxData = _this._y1Max;
                }
                else {
                    _data.forEach(function (dd) {
                        var d3MaxY = d3.max(dd.data, function (d) { return d.yMax; });
                        if (d3MaxY > maxData) {
                            maxData = d3MaxY;
                        }
                    });
                    if (maxData === minData) {
                        maxData += 10;
                    }
                }
                if (_this._isTimeseries) {
                    var _a = _this._getMinMaxX(_data, _this._isTimeseries), min = _a.min, max = _a.max;
                    _this._xScale = d3.scaleTime()
                        .domain([min, max])
                        .range([0 + barW, _this._chartWidth - barW]);
                }
                else {
                    _this._xScale = d3.scaleBand()
                        .domain(_data.map(function (d, i) {
                        return d.x;
                    }))
                        .range([0, _this._chartWidth])
                        .padding(0.1);
                }
                _this._yScale = d3.scaleLinear()
                    .domain([minData, maxData])
                    .range([_this._chartHeight, 0]);
                _this._barScale = d3.scaleLinear()
                    .domain([Math.abs(maxData - minData), 0])
                    .range([_this._chartHeight, 0]);
                var xScale = _this._xScale;
                var yScale = _this._yScale;
                var barScale = _this._barScale;
                var xGroupScale = d3.scaleBand();
                if (barW <= 0) {
                    barW = xScale.bandwidth();
                }
                xGroupScale.domain(distinctGroups).rangeRound([0, barW]);
                var barAdjustmentX = 0;
                if (_this._isTimeseries) {
                    barAdjustmentX = -barW / 2;
                }
                var calculateBarWidth = function (d, i) {
                    return xGroupScale(d.group);
                };
                var widthFactor = 0.95;
                function xScaleAdjusted(x) {
                    return xScale(x) + barAdjustmentX;
                }
                _this._xScaleAdjusted = xScaleAdjusted;
                var yScale0 = yScale(0);
                var barsRoot = _this._svg.select('.ninja-chartGroup')
                    .call(myToolTip)
                    .selectAll('.g')
                    .data(_data, function (d) {
                    return d.x;
                });
                var barsRootEnter = barsRoot.enter().append("g")
                    .attr("class", "g")
                    .attr("transform", function (d) {
                    return "translate(" + xScaleAdjusted(d.x) + ",0)";
                });
                barsRoot.merge(barsRootEnter).transition()
                    .duration(_this._transitionDuration)
                    .attr("transform", function (d) {
                    return "translate(" + xScaleAdjusted(d.x) + ",0)";
                });
                barsRoot.exit()
                    .transition()
                    .remove();
                var bars = barsRoot.selectAll(".bar")
                    .data(function (d) {
                    return d.data;
                });
                var iqBarsEnter = bars.enter().append('rect')
                    .classed('bar', true)
                    .attrs({
                    x: function (d, i) {
                        return xGroupScale(d.group);
                    },
                    width: function (d, i) {
                        return widthFactor * xGroupScale.bandwidth();
                    },
                    y: yScale0,
                    height: 0,
                    fill: 'none',
                    rx: _this._cornerRounding,
                    ry: _this._cornerRounding,
                    'stroke-width': function (d, i) {
                        return functor(itemStrokeWidth, d, i);
                    }
                })
                    .on('mouseover', function (d, i) {
                    genericMouseoverBehaviour(d);
                })
                    .on('mouseout', function (d, i) {
                    genericMouseoutBehaviour(d);
                })
                    .on('click', function (d, i) {
                    onClick(d);
                });
                bars.merge(iqBarsEnter).transition()
                    .duration(_this._transitionDuration)
                    .delay(function (d, i) {
                    return functor(_this._transitionDelay, d, i);
                })
                    .ease(_this._transitionEase)
                    .styles({
                    opacity: function (d, i) {
                        return functor(defaultBarOpacity, d, i);
                    },
                    stroke: function (d, i) {
                        return functor(barFill, d, i);
                    },
                    fill: 'none',
                    'stroke-width': function (d, i) {
                        return functor(itemStrokeWidth, d, i);
                    }
                })
                    .attrs({
                    x: function (d, i) {
                        return xGroupScale(d.group);
                    },
                    width: function (d, i) {
                        return widthFactor * xGroupScale.bandwidth();
                    },
                    y: function (d) {
                        if (d.yMax > 0) {
                            return yScale(d.yMax);
                        }
                        else {
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
                    .duration(function (d, i) {
                    return functor(_this._removeTransitionDelay, d, i);
                })
                    .ease(_this._transitionEase)
                    .attrs({
                    y: function (d) {
                        if (d.yMax > 0) {
                            return yScale(0);
                        }
                        else {
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
                    .delay(function (d, i) {
                    return functor(_this._removeDelay, d, i);
                })
                    .remove();
                var medianBar = barsRoot.selectAll(".bar-median")
                    .data(function (d) {
                    return d.data;
                });
                var medianBarEnter = medianBar.enter().append('rect')
                    .classed('bar-median', true)
                    .attrs({
                    x: function (d, i) {
                        return xGroupScale(d.group);
                    },
                    width: function (d, i) {
                        return widthFactor * xGroupScale.bandwidth();
                    },
                    y: yScale0,
                    height: 0,
                    fill: function (d, i) {
                        return functor(_this._itemFill2, d, i);
                    },
                    rx: _this._cornerRounding,
                    ry: _this._cornerRounding
                })
                    .on('mouseover', function (d, i) {
                    genericMouseoverBehaviour(d);
                })
                    .on('mouseout', function (d, i) {
                    genericMouseoutBehaviour(d);
                })
                    .on('click', function (d, i) {
                    onClick(d);
                });
                medianBar.merge(medianBarEnter).transition()
                    .duration(_this._transitionDuration)
                    .delay(function (d, i) {
                    return functor(_this._transitionDelay, d, i);
                })
                    .ease(_this._transitionEase)
                    .styles({
                    opacity: function (d, i) {
                        return functor(defaultBarOpacity, d, i);
                    },
                    stroke: function (d, i) {
                        return functor(defaultStroke, d, i);
                    },
                    fill: function (d, i) {
                        return functor(barFill2, d, i);
                    }
                })
                    .attrs({
                    x: function (d, i) {
                        return xGroupScale(d.group);
                    },
                    width: function (d, i) {
                        return widthFactor * xGroupScale.bandwidth();
                    },
                    y: function (d) {
                        if (d.yMax > 0) {
                            return yScale(d.yMed) - medianWidth / 2;
                        }
                        else {
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
                    .duration(function (d, i) {
                    return functor(_this._removeTransitionDelay, d, i);
                })
                    .ease(_this._transitionEase)
                    .attrs({
                    y: function (d) {
                        if (d.yMax > 0) {
                            return yScale(0);
                        }
                        else {
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
                    .delay(function (d, i) {
                    return functor(_this._removeDelay, d, i);
                })
                    .remove();
                _this._plotLabels();
                _this._plotXYAxes(xScale, yScale);
            });
        };
        return GroupedInterquartileChart;
    }(ninjaPixel.Chart));
    ninjaPixel.GroupedInterquartileChart = GroupedInterquartileChart;
})(ninjaPixel || (ninjaPixel = {}));
//
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
    var BubbleChart = (function (_super) {
        __extends(BubbleChart, _super);
        function BubbleChart() {
            var _this = _super.call(this) || this;
            _this._allowBubblesToSpillOffChart = false;
            _this._maxBubbleRadius = 50;
            return _this;
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
                if (_this._xMin) {
                    minX = _this._xMin;
                }
                else {
                    minX = d3.min(_data, function (d) {
                        return d.x;
                    });
                }
                if (_this._xMax) {
                    maxX = _this._xMax;
                }
                else {
                    maxX = d3.max(_data, function (d) {
                        return d.x;
                    });
                }
                if (_this._y1Min) {
                    minY = _this._y1Min;
                }
                else {
                    minY = d3.min(_data, function (d) {
                        return d.y;
                    });
                }
                if (_this._y1Max) {
                    maxY = _this._y1Max;
                }
                else {
                    maxY = d3.max(_data, function (d) {
                        return d.y;
                    });
                }
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
                var xScale;
                if (_this._xAxisLogScale) {
                    xScale = d3.scaleLog()
                        .domain([minX, maxX]);
                }
                else {
                    xScale = d3.scaleLinear()
                        .domain([minX, maxX]);
                }
                xScale.range([0, _this._chartWidth]);
                var yScale = d3.scaleLinear()
                    .domain([minY, maxY])
                    .range([_this._chartHeight, 0]);
                var rScale = d3.scaleLinear()
                    .domain([0, maxR])
                    .range([0, _this._maxBubbleRadius]);
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
                        xScale = d3.scaleLinear()
                            .domain([minX, maxX])
                            .range([0, _this._chartWidth]);
                        yScale = d3.scaleLinear()
                            .domain([minY, maxY])
                            .range([_this._chartHeight, 0]);
                    };
                    for (var scaleCount = 0; scaleCount < 10; scaleCount++) {
                        updateXYScalesBasedOnBubbleEdges();
                    }
                }
                var functor = _this._functor;
                var rScale0 = rScale(0);
                var itemOpacity = _this._itemOpacity;
                var onClick = _this._onClick;
                var itemStroke = _this._itemStroke;
                var myToolTip = _this._toolTip;
                var genericMouseoverBehaviour = _this._genericMouseoverBehaviour.bind(_this);
                var genericMouseoutBehaviour = _this._genericMouseoutBehaviour.bind(_this);
                var bubbles = _this._svg.select('.ninja-chartGroup')
                    .call(myToolTip)
                    .selectAll('.bubble')
                    .data(_data);
                var enterBubbles = bubbles.enter().append('circle')
                    .classed('bubble', true)
                    .attrs({
                    cx: function (d) {
                        return xScale(d.x);
                    },
                    cy: function (d) {
                        return yScale(d.y);
                    },
                    r: rScale0
                })
                    .on('mouseover', function (d, i) {
                    genericMouseoverBehaviour(this, d, i);
                })
                    .on('mouseout', function (d, i) {
                    genericMouseoutBehaviour(this, d, i);
                })
                    .on('click', function (d) {
                    onClick(d);
                });
                bubbles.merge(enterBubbles)
                    .transition()
                    .duration(_this._transitionDuration)
                    .delay(function (d, i) {
                    return functor(_this._transitionDelay, d, i);
                })
                    .ease(_this._transitionEase)
                    .styles({
                    opacity: function (d, i) {
                        return functor(itemOpacity, d, i);
                    },
                    stroke: function (d, i) {
                        return functor(itemStroke, d, i);
                    },
                    fill: function (d, i) {
                        return functor(_this._itemFill, d, i);
                    }
                })
                    .attrs({
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
                bubbles.exit()
                    .transition()
                    .styles({
                    opacity: 0
                })
                    .remove();
                _this._plotLabels();
                _this._plotXYAxes(xScale, yScale);
            });
        };
        return BubbleChart;
    }(ninjaPixel.Chart));
    ninjaPixel.BubbleChart = BubbleChart;
})(ninjaPixel || (ninjaPixel = {}));
//
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
    var LineChart = (function (_super) {
        __extends(LineChart, _super);
        function LineChart() {
            var _this = _super.call(this) || this;
            _this._isTimeseries = false;
            _this._areaOpacity = 0;
            _this._lineInterpolation = d3.curveLinear;
            _this._lineDashArray = 'none';
            return _this;
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
        LineChart.prototype.lineDashArray = function (_x) {
            if (!arguments.length)
                return this._lineDashArray;
            this._lineDashArray = _x;
            return this;
        };
        LineChart.prototype.plot = function (_selection) {
            var _this = this;
            var functor = this._functor;
            this._init(_selection);
            var myToolTip = this._toolTip;
            var genericMouseoverBehaviour = this._genericMouseoverBehaviour.bind(this);
            var genericMouseoutBehaviour = this._genericMouseoutBehaviour.bind(this);
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
                    }
                    else {
                        minXOfThisArray = getMinX(_data[index].data);
                        maxXOfThisArray = getMaxX(_data[index].data);
                    }
                    if (index === 0) {
                        minX = minXOfThisArray;
                        maxX = maxXOfThisArray;
                        minY = minYOfThisArray;
                        maxY = maxYOfThisArray;
                    }
                    else {
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
                    xScale = d3.scaleTime();
                }
                else {
                    xScale = d3.scaleLinear();
                }
                if (_this._internalXAxisMargin) {
                    xScale.range([0 + _this._internalXAxisMargin, _this._chartWidth - _this._internalXAxisMargin]);
                }
                else {
                    xScale.range([0, _this._chartWidth]);
                }
                xScale.domain([minX, maxX]);
                var yScale;
                if (_this._yAxis1LogScale) {
                    yScale = d3.scaleLog()
                        .domain([minY, maxY])
                        .range([_this._chartHeight, 0]);
                }
                else {
                    yScale = d3.scaleLinear()
                        .domain([minY, maxY])
                        .range([_this._chartHeight, 0]);
                }
                var singleLine = d3.line()
                    .x(function (d) {
                    return xScale(d.x);
                })
                    .y(function (d) {
                    return yScale(d.y);
                });
                singleLine.curve(_this._lineInterpolation);
                var baseLine = d3.line()
                    .x(function (d) {
                    return xScale(d.x);
                })
                    .y(function (d) {
                    return yScale(0);
                });
                baseLine.curve(_this._lineInterpolation);
                var area = d3.area()
                    .x(function (d) {
                    return xScale(d.x);
                })
                    .y0(function (d) {
                    if (minY > 0) {
                        return yScale(minY);
                    }
                    else if (maxY < 0) {
                        return yScale(maxY);
                    }
                    else {
                        return yScale(0);
                    }
                })
                    .y1(function (d) {
                    return yScale(d.y);
                });
                area.curve(_this._lineInterpolation);
                var baseArea = d3.area()
                    .x(function (d) {
                    return xScale(d.x);
                })
                    .y0(function (d) {
                    return yScale(0);
                })
                    .y1(function (d) {
                    return yScale(0);
                });
                var areaSvg = _this._svg.select('.ninja-chartGroup').selectAll('path.area')
                    .data(_data, function (d) {
                    return d.name;
                });
                var enterArea = areaSvg.enter()
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
                    .delay(function (d, i) {
                    return functor(_this._transitionDelay, d, i);
                })
                    .duration(function (d, i) {
                    return functor(_this._transitionDuration, d, i);
                })
                    .attr('d', function (d) {
                    return area(d.data);
                })
                    .styles({
                    opacity: function (d, i) {
                        return functor(_this._areaOpacity, d, i);
                    },
                    fill: function (d, i) {
                        return functor(_this._itemFill, d, i);
                    }
                });
                areaSvg.exit()
                    .transition()
                    .duration(function (d, i) {
                    return functor(_this._transitionDuration, d, i);
                })
                    .ease(_this._transitionEase)
                    .style('opacity', 0)
                    .remove();
                var lineSvg = _this._svg.select('.ninja-chartGroup')
                    .call(myToolTip)
                    .selectAll('path.line')
                    .data(_data, function (d) {
                    return d.name;
                });
                var lineEnter = lineSvg.enter()
                    .append('svg:path')
                    .attr('class', 'line')
                    .on('mouseover', function (d, i) {
                    genericMouseoverBehaviour(this, d, i);
                })
                    .on('mouseout', function (d, i) {
                    genericMouseoutBehaviour(this, d, i);
                })
                    .styles({
                    opacity: 0,
                    stroke: function (d, i) {
                        return functor(_this._itemFill, d, i);
                    },
                    fill: 'none',
                    'stroke-dasharray': function (d, i) {
                        return functor(_this._lineDashArray, d, i);
                    },
                    'stroke-width': function (d, i) {
                        return functor(_this._itemStrokeWidth, d, i);
                    }
                })
                    .attr('d', function (d) {
                    return baseLine(d.data);
                });
                lineSvg.merge(lineEnter)
                    .transition()
                    .delay(function (d, i) {
                    return functor(_this._transitionDelay, d, i);
                })
                    .duration(function (d, i) {
                    return functor(_this._transitionDuration, d, i);
                })
                    .attr('d', function (d) {
                    return singleLine(d.data);
                })
                    .styles({
                    opacity: function (d, i) {
                        return functor(_this._itemOpacity, d, i);
                    },
                    stroke: function (d, i) {
                        return functor(_this._itemFill, d, i);
                    },
                    'stroke-dasharray': function (d, i) {
                        return functor(_this._lineDashArray, d, i);
                    },
                    'stroke-width': function (d, i) {
                        return functor(_this._itemStrokeWidth, d, i);
                    }
                });
                lineSvg.exit()
                    .transition()
                    .duration(function (d, i) {
                    return functor(_this._transitionDuration, d, i);
                })
                    .ease(_this._transitionEase)
                    .style('opacity', 0)
                    .remove();
                _this._plotLabels();
                _this._plotXYAxes(xScale, yScale);
            });
        };
        return LineChart;
    }(ninjaPixel.Chart));
    ninjaPixel.LineChart = LineChart;
})(ninjaPixel || (ninjaPixel = {}));
//
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
    var Histogram = (function (_super) {
        __extends(Histogram, _super);
        function Histogram() {
            var _this = _super.call(this) || this;
            _this._cornerRounding = 1;
            _this._plotFrequency = true;
            _this._histogramFunction = d3.histogram();
            return _this;
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
                var xScale = d3.scaleLinear()
                    .range([0, _this._chartWidth]);
                var xObjects = _data.map(function (d) {
                    return { x: d };
                });
                var _a = _this._getMinMaxX(xObjects), min = _a.min, max = _a.max;
                xScale.domain([min, max]);
                if (_this._bins != null) {
                    xScale.ticks(_this._bins);
                    _this._histogramFunction.thresholds(xScale.ticks());
                }
                var bins = _this._histogramFunction.domain([min, max])(_data);
                var yMax = 0;
                if (_this._y1Max != null) {
                    yMax = _this._y1Max;
                }
                else {
                    yMax = d3.max(bins, function (d) { return d.length; });
                }
                var yScale = d3.scaleLinear()
                    .domain([0, yMax])
                    .range([_this._chartHeight, 0]);
                var bar = _this._svg.select('.ninja-chartGroup')
                    .call(myToolTip)
                    .selectAll('.bars')
                    .data(bins);
                var enterBar = bar.enter().append('rect')
                    .classed('bars', true)
                    .attrs({
                    'x': function (d) {
                        return xScale(d.x0);
                    },
                    'y': function (d) {
                        return yScale(0);
                    },
                    'height': function (d) {
                        return 0;
                    },
                    'width': function (d) {
                        return xScale(d.x1 - d.x0);
                    },
                    fill: function (d, i) { return functor(_this._itemFill, d, i); },
                    rx: _this._cornerRounding,
                    ry: _this._cornerRounding,
                    opacity: function (d, i) { return functor(_this._itemOpacity, d, i); }
                });
                bar.exit().remove();
                bar.merge(enterBar).transition()
                    .duration(_this._transitionDuration)
                    .ease(_this._transitionEase)
                    .attrs({
                    'x': function (d) {
                        return xScale(d.x0);
                    },
                    'width': function (d) {
                        return xScale(d.x1 - d.x0);
                    },
                    'y': function (d) {
                        return yScale(d.length);
                    },
                    'height': function (d) {
                        return yScale(0) - yScale(d.length);
                    },
                    fill: function (d, i) { return functor(_this._itemFill, d, i); },
                    opacity: function (d, i) { return functor(_this._itemOpacity, d, i); }
                });
                _this._plotLabels();
                _this._plotXAxis(xScale, yScale);
                _this._plotYAxis(xScale, yScale);
            });
        };
        return Histogram;
    }(ninjaPixel.Chart));
    ninjaPixel.Histogram = Histogram;
})(ninjaPixel || (ninjaPixel = {}));
//
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
    var Donut = (function (_super) {
        __extends(Donut, _super);
        function Donut() {
            var _this = _super.call(this) || this;
            _this._outerRadius = 80;
            _this._innerRadius = 50;
            return _this;
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
                _this._init(_selection, ninjaPixel.Category.donut);
                var arc = d3.arc()
                    .outerRadius(_this._outerRadius)
                    .innerRadius(_this._innerRadius);
                var pie = d3.pie()
                    .sort(null)
                    .value(function (d) {
                    return d.y;
                });
                var path = _this._svg.select('.ninja-chartGroup')
                    .selectAll('path')
                    .data(pie(_data));
                path.enter()
                    .append('path')
                    .styles({
                    opacity: function (d, i) { return _this._functor(_this._itemOpacity, d, i); },
                    stroke: function (d, i) { return _this._functor(_this._itemStroke, d, i); },
                    fill: function (d, i) { return _this._functor(_this._itemFill, d, i); }
                })
                    .attr('d', arc)
                    .each(function (d) {
                    this._current = d;
                });
                path.transition()
                    .duration(_this._transitionDuration)
                    .styles({
                    opacity: function (d, i) { return _this._functor(_this._itemOpacity, d, i); },
                    stroke: function (d, i) { return _this._functor(_this._itemStroke, d, i); },
                    fill: function (d, i) { return _this._functor(_this._itemFill, d, i); }
                })
                    .attr('d', arc)
                    .attrTween('d', arcTween);
                plotDonutLabels(_this);
                _this._plotLabels();
                function arcTween(a) {
                    var i = d3.interpolate(this._current, a);
                    this._current = i(0);
                    return function (t) {
                        return arc(i(t));
                    };
                }
                function plotDonutLabels(that) {
                    var labels = that._svg.select('.ninja-chartGroup')
                        .selectAll('text.donut-label')
                        .data(pie(_data));
                    labels.enter().append('text')
                        .classed('donut-label', true)
                        .attr('dy', '.35em')
                        .style('text-anchor', 'middle')
                        .attr('transform', function (d) { return 'translate(' + arc.centroid(d) + ')'; });
                    labels.transition()
                        .duration(that._transitionDuration)
                        .attr('transform', function (d) { return 'translate(' + arc.centroid(d) + ')'; })
                        .text(function (d) { return d.data.x; });
                    labels.exit()
                        .transition()
                        .duration(that._transitionDuration)
                        .remove();
                }
            });
        };
        return Donut;
    }(ninjaPixel.Chart));
    ninjaPixel.Donut = Donut;
})(ninjaPixel || (ninjaPixel = {}));
//
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
    var Lollipop = (function (_super) {
        __extends(Lollipop, _super);
        function Lollipop() {
            var _this = _super.call(this) || this;
            _this._stickWidth = 6;
            _this._headRadius = 20;
            _this._headFill = 'white';
            _this._headStroke = 'none';
            _this._headOpacity = 1;
            _this._headToolTip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(function () {
                return 'Tooltip HTML not defined';
            })
                .direction('n');
            return _this;
        }
        Lollipop.prototype.stickWidth = function (_x) {
            if (!arguments.length)
                return this._stickWidth;
            this._stickWidth = _x;
            return this;
        };
        Lollipop.prototype.headRadius = function (_x) {
            if (!arguments.length)
                return this._headRadius;
            this._headRadius = _x;
            return this;
        };
        Lollipop.prototype.headFill = function (_x) {
            if (!arguments.length)
                return this._headFill;
            this._headFill = _x;
            return this;
        };
        Lollipop.prototype.headStroke = function (_x) {
            if (!arguments.length)
                return this._headStroke;
            this._headStroke = _x;
            return this;
        };
        Lollipop.prototype.headOpacity = function (_x) {
            if (!arguments.length)
                return this._headOpacity;
            this._headOpacity = _x;
            return this;
        };
        Lollipop.prototype.headMouseOverItemOpacity = function (_x) {
            if (!arguments.length)
                return this._itemFill;
            this._headMouseOverItemOpacity = _x;
            return this;
        };
        Lollipop.prototype.headMouseOverStroke = function (_x) {
            if (!arguments.length)
                return this._headMouseOverStroke;
            this._headMouseOverStroke = _x;
            return this;
        };
        Lollipop.prototype.headToolTip = function (_x) {
            if (!arguments.length)
                return this._headToolTip;
            this._headToolTip = _x;
            return this;
        };
        Lollipop.prototype.plot = function (_selection) {
            var _this = this;
            _selection.each(function (_data) {
                _super.prototype.plot.call(_this, _selection, _this._stickWidth);
                var functor = _this._functor;
                var mouseOverOpacity = _this._headMouseOverItemOpacity;
                var mouseOverStroke = _this._headMouseOverStroke;
                var itemOpacity = _this._headOpacity;
                var onMouseover = _this._onMouseover;
                var onMouseout = _this._onMouseout;
                var onClick = _this._onClick;
                var itemStroke = _this._headStroke;
                var myToolTip = _this._headToolTip;
                var genericMouseoverBehaviour = _this._genericMouseoverBehaviour.bind(_this);
                var genericMouseoutBehaviour = _this._genericMouseoutBehaviour.bind(_this);
                var superXScale = _this._xScaleAdjusted;
                var dx = _this._stickWidth / 2;
                function xScale(x) {
                    return superXScale(x) + dx;
                }
                var yScale = _this._yScale;
                var barScale = _this._barScale;
                var yScale0 = yScale(0);
                var bubbles = _this._svg.select('.ninja-chartGroup')
                    .call(myToolTip)
                    .selectAll('.lollipop-head')
                    .data(_data);
                var enterBubbles = bubbles.enter().append('circle')
                    .classed('lollipop-head', true)
                    .on('mouseover', function (d, i) {
                    genericMouseoverBehaviour(this, d, i, mouseOverOpacity, mouseOverStroke);
                })
                    .on('mouseout', function (d, i) {
                    genericMouseoutBehaviour(this, d, i, itemOpacity, itemStroke);
                })
                    .on('click', function (d) {
                    onClick(d);
                })
                    .attrs({
                    cx: function (d) {
                        return xScale(d.x);
                    },
                    cy: function (d) {
                        return yScale(0);
                    },
                    r: 1
                });
                bubbles.merge(enterBubbles).transition()
                    .duration(_this._transitionDuration)
                    .delay(function (d, i) {
                    return functor(_this._transitionDelay, d, i);
                })
                    .ease(_this._transitionEase)
                    .styles({
                    opacity: function (d, i) {
                        return functor(itemOpacity, d, i);
                    },
                    stroke: function (d, i) {
                        return functor(itemStroke, d, i);
                    },
                    fill: function (d, i) {
                        return functor(_this._headFill, d, i);
                    }
                })
                    .attrs({
                    cx: function (d) {
                        return xScale(d.x);
                    },
                    cy: function (d) {
                        return yScale(d.y);
                    },
                    r: _this._headRadius
                });
                bubbles.exit()
                    .transition()
                    .styles({
                    opacity: 0
                })
                    .remove();
            });
        };
        return Lollipop;
    }(ninjaPixel.BarChart));
    ninjaPixel.Lollipop = Lollipop;
})(ninjaPixel || (ninjaPixel = {}));
//
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
    var Treemap = (function (_super) {
        __extends(Treemap, _super);
        function Treemap() {
            var _this = _super.call(this) || this;
            _this._nodeText = '';
            _this._itemFontSize = '8px';
            _this._itemTextOffsetLeft = 1;
            _this._itemTextOffsetTop = 10;
            return _this;
        }
        Treemap.prototype.nodeText = function (_x) {
            if (!arguments.length)
                return this._nodeText;
            this._nodeText = _x;
            return this;
        };
        Treemap.prototype.itemFontSize = function (_x) {
            if (!arguments.length)
                return this._itemFontSize;
            this._itemFontSize = _x;
            return this;
        };
        Treemap.prototype.itemTextOffsetLeft = function (_x) {
            if (!arguments.length)
                return this._itemTextOffsetLeft;
            this._itemTextOffsetLeft = _x;
            return this;
        };
        Treemap.prototype.itemTextOffsetTop = function (_x) {
            if (!arguments.length)
                return this._itemTextOffsetTop;
            this._itemTextOffsetTop = _x;
            return this;
        };
        Treemap.prototype.plot = function (_selection) {
            var _this = this;
            this._init(_selection, ninjaPixel.Category.treemap);
            var functor = this._functor;
            var myToolTip = this._toolTip;
            var onMouseover = this._onMouseover;
            var onMouseout = this._onMouseout;
            var onClick = this._onClick;
            var mouseOverOpacity = this._mouseOverItemOpacity;
            var defaultOpacity = this._itemOpacity;
            var mouseOverStroke = this._mouseOverItemStroke;
            var defaultStroke = this._itemStroke;
            var nodeFill = this._itemFill;
            var nodeText = this._nodeText;
            var fontSize = this._itemFontSize;
            var nodeTextOffsetLeft = this._itemTextOffsetLeft;
            var nodeTextOffsetTop = this._itemTextOffsetTop;
            var genericMouseoverBehaviour = this._genericMouseoverBehaviour.bind(this);
            var genericMouseoutBehaviour = this._genericMouseoutBehaviour.bind(this);
            _selection.each(function (_data) {
                var myTreemap = d3.treemap();
                var treemapLayout = myTreemap
                    .size([_this._chartWidth, _this._chartHeight]);
                var treemapNode = _this._svg.select('.ninja-chartGroup')
                    .call(myToolTip)
                    .datum(_data)
                    .selectAll('.treemap-node')
                    .data(treemapLayout.nodes);
                var treemapText = _this._svg.select('.ninja-chartGroup')
                    .call(myToolTip)
                    .datum(_data)
                    .selectAll('.treemap-text')
                    .data(treemapLayout.nodes);
                var drawEmptyTreemap = false;
                if (_data.area == 0) {
                    console.log('The data area is 0. Cannot draw a treemap.');
                    drawEmptyTreemap = true;
                }
                var enterTreemapNode = treemapNode.enter().append('rect')
                    .attr('class', 'treemap-node')
                    .attrs({
                    x: function (d) { return d.x; },
                    width: function (d) { return Math.max(0, d.dx - 1); },
                    y: function (d) { return d.y; },
                    height: 0,
                    fill: function (d, i) { return functor(nodeFill, d, i); }
                })
                    .styles({
                    opacity: function (d, i) { return functor(defaultOpacity, d, i); },
                    stroke: function (d, i) { return functor(defaultStroke, d, i); }
                })
                    .on('mouseover', function (d, i) {
                    genericMouseoverBehaviour(this, d, i);
                })
                    .on('mouseout', function (d, i) {
                    genericMouseoutBehaviour(this, d, i);
                })
                    .on('click', function (d, i) {
                    onClick(d);
                });
                treemapNode.merge(enterTreemapNode).transition()
                    .duration(_this._transitionDuration)
                    .attrs({
                    x: function (d) { return d.x; },
                    width: function (d) {
                        if (drawEmptyTreemap) {
                            return 0;
                        }
                        return Math.max(0, d.dx - 1);
                    },
                    y: function (d) { return d.y; },
                    height: function (d) {
                        if (drawEmptyTreemap) {
                            return 0;
                        }
                        return Math.max(0, d.dy - 1);
                    },
                    fill: function (d, i) { return functor(_this._itemFill, d, i); }
                })
                    .styles({
                    opacity: function (d, i) { return functor(defaultOpacity, d, i); },
                    stroke: function (d, i) { return functor(defaultStroke, d, i); }
                });
                treemapNode.exit().transition().remove();
                var textEnter = treemapText.enter().append('text')
                    .attr('class', 'treemap-text')
                    .attrs({
                    fill: function (d, i) { return functor(_this._itemTextLabelColor, d, i); },
                })
                    .styles({
                    opacity: function (d, i) { return functor(defaultOpacity, d, i); },
                })
                    .on('mouseover', function (d, i) {
                    d3.select(this);
                    myToolTip.show(d);
                    onMouseover(d, myToolTip.getBoundingBox());
                })
                    .on('mouseout', function (d, i) {
                    d3.select(this);
                    myToolTip.hide();
                    onMouseout(d);
                })
                    .on('click', function (d, i) {
                    onClick(d);
                });
                treemapText.merge(textEnter).transition()
                    .duration(_this._transitionDuration)
                    .attrs({
                    x: function (d, i) { return d.x + functor(nodeTextOffsetLeft, d, i); },
                    y: function (d, i) { return d.y + functor(nodeTextOffsetTop, d, i); },
                    'font-size': function (d, i) {
                        if (drawEmptyTreemap) {
                            return 0;
                        }
                        return functor(fontSize, d, i);
                    }
                })
                    .text(function (d, i) {
                    return functor(nodeText, d, i);
                });
                treemapText.exit().transition().remove();
            });
        };
        return Treemap;
    }(ninjaPixel.Chart));
    ninjaPixel.Treemap = Treemap;
})(ninjaPixel || (ninjaPixel = {}));
//
//# sourceMappingURL=ninjaPixel.js.map