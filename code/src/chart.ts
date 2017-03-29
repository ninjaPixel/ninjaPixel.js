/// <reference path="../node_modules/@types/d3/index.d.ts" />
/// <reference path="./typescript_definitions/ninjaTypes/index.d.ts" />

namespace ninjaPixel {
    export const version: string = '0.0.16.1';

    export enum Category {
        xy = 0,
        donut = 1,
        treemap = 2,
        simpleTreemap = 3
    }

    export class Chart {
        // gettable / settable variables
        _width: number = 800;
        _height: number = 600;
        _margin: ninjaTypes.marginObject = {
            top: 10,
            bottom: 10,
            left: 40,
            right: 5
        };
        _internalXAxisMargin: number;
        _axesOrigin: ninjaTypes.axesOriginObject;
        _title: string = '';
        _yAxis1Title: string = '';
        _yAxis2Title: string = '';
        _xAxisTitle: string = '';
        _yAxis1LogScale: boolean = false;
        _xAxisLogScale: boolean = false;
        _xAxisTextOrientation: string = 'bottom';
        _transitionDuration: number = 300;
        _transitionEase: ninjaTypes.ease = d3.easeLinear; //|d3.BackEasingFactory|d3.ElasticEasingFactory|d3.PolynomialEasingFactory
        _transitionDelay: ninjaTypes.numberOrFunction = 0;// function or value
        _removeTransitionDelay: ninjaTypes.numberOrFunction = 0;// function or value
        _removeDelay: ninjaTypes.numberOrFunction = 0;// function or value
        _labelEase: ninjaTypes.ease = d3.easeLinear;
        _plotHorizontalGrid: boolean = false;
        _plotHorizontalGridTopping: boolean = false;
        _plotVerticalGrid: boolean = false;
        _plotVerticalGridTopping: boolean = false;
        _svg: any;
        _xAxisTextTransform: string;
        _xAxisTickFormat: any;
        _xTitleVerticalOffset: number;
        _yTitleHorizontalOffset: number;
        //        _yAxisTextTransform: string;
        _yAxisTickFormat: any;
        _onMouseover: any = () => {
        };
        _onMouseout: any = () => {
        };
        _onClick: any = () => {
        };
        _plotBackground: boolean = false;
        _y1Max: number;
        _y2Max: number;
        _y1Min: number;
        _y2Min: number;
        _xMax: number | Date;
        _xMin: number | Date;
        _mouseOverItemOpacity: ninjaTypes.numberOrFunction = 0.3;// function or value
        _mouseOverItemStroke: ninjaTypes.stringOrFunction = 'none';// function or value
        _itemOpacity: ninjaTypes.numberOrFunction = 1;// function or value
        _itemStroke: ninjaTypes.stringOrFunction = 'none'; // function or value
        _itemFill: ninjaTypes.stringOrFunction = '#A7EBCA'; // function or value
        _itemFill2: ninjaTypes.stringOrFunction = 'lightgray'; // function or value
        _itemStrokeWidth: ninjaTypes.stringOrFunction = '3px'; // function or value
        _toolTip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            // .transitionDuration(300)
            .html(function() {
                return null;
            })
            .direction('n');
        _xAxisTicks: ninjaTypes.numberOrFunction;
        _yAxisTicks: ninjaTypes.numberOrFunction;
        // internal variables
        _chartHeight: number;
        _chartWidth: number;
        _category: Category;
        _itemTextLabelColor: ninjaTypes.stringOrFunction;


        constructor() {

        }

        _init(_selection: any, category = Category.xy) {

            const mouseOverFn = this._onMouseover;
            this._onMouseover = function(d) {
                mouseOverFn(d);
                if (this._toolTip && this._toolTip.getBoundingBox) {
                    this._toolTip.getBoundingBox();
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
                } else {
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
            } else if (this._category == Category.xy || this._category == Category.treemap || this._category == Category.simpleTreemap) {
                this._svg.select('.ninja-containerGroup')
                    .attrs({
                        transform: 'translate(' + Number(this._margin.left) + ',' + Number(this._margin.top) + ')'
                    });
            }


            this._plotTheBackground();
        }

        _getMinMaxX(data: [{ x }], isTimeseries: Boolean = false): {min:number, max:number} {

            const mapXToDate = (d: { x: number }) => {
                return new Date(d.x).getTime();
            };
            const sortAsc = (a: number, b: number) => a - b;
            const sortDesc = (a: number, b: number) => b - a;

            function getMinDate(theData): Number {
                const sortedByDate = theData.map(mapXToDate).sort(sortAsc);
                return sortedByDate[0];
            }

            function getMaxDate(theData): Number {
                const sortedByDate = theData.map(mapXToDate).sort(sortDesc);
                return sortedByDate[0];
            }

            if (isTimeseries) {
                let minX, maxX;
                if (this._xMin != null) {
                    minX = new Date(this._xMin).getTime();
                } else {
                    minX = getMinDate(data);
                }
                if (this._xMax != null) {
                    maxX = new Date(this._xMax).getTime();
                } else {
                    maxX = getMaxDate(data);
                }
                return {min:minX, max:maxX};
            }else{
              let minX=0, maxX=1;
              if (this._xMin != null) {
                  minX = Number(this._xMin);
              } else {
                  minX = data.map(d=>d.x).sort(sortAsc)[0];
              }
              if (this._xMax != null) {
                  maxX = Number(this._xMax);
              } else {
                  maxX = data.map(d=>d.x).sort(sortDesc)[0];
              }
              return {min:minX, max:maxX};
            }
        }

        _plotXAxis(xScale: any, yScale: any) {
            const top = this._xAxisTextOrientation === 'top';

            const setTickSizeInner = () => {
                if (top) {
                    xAxis.tickSizeInner(-this._chartHeight);

                } else {
                    xAxis.tickSizeInner(this._chartHeight);

                }
            };

            const transformAxis = () => {
                if (this._axesOrigin != null) {
                    let yPosition = yScale(this._axesOrigin.y);
                    if (!yPosition) {
                        // this isn't ideal, it's a hack
                        // if we have a chart with an ordinal scale then yScale will return undefined, so gotta catch that here.
                        yPosition = 0;
                    }
                    return 'translate(0,' + yPosition + ')';
                } else {
                    return 'translate(0,' + (this._chartHeight) + ')';
                }
            };


            let xAxis = d3.axisBottom(xScale);
            if (top) {
                xAxis = d3.axisTop(xScale);
            }
            xAxis.tickSizeOuter(0); // remove that pesky final tick


            if (!this._xAxisLogScale) {
                if (this._xAxisTickFormat != null) {
                    xAxis.tickFormat(this._xAxisTickFormat);
                }
                if (this._xAxisTicks != null) {
                    xAxis.ticks(this._xAxisTicks);
                }
            } else {
                // NOTE
                // When using a log scale in conjunction with an axis, you typically want to use axis.ticks rather than axis.tickFormat to take advantage of the log scale’s custom tick format, as in bl.ocks.org/5537697. https://github.com/mbostock/d3/wiki/Quantitative-Scales#linear_tickFormat
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
                const topping = this._svg.select('.ninja-verticalGridTopping');
                topping.transition()
                    .ease(this._labelEase)
                    .call(xAxis);

                this._hideAxisLineAndText(topping);
            }

            if (this._plotVerticalGrid) {
                setTickSizeInner();
                const grid = this._svg.select('.ninja-verticalGrid');
                grid.call(xAxis);
                this._hideAxisLineAndText(grid);

            }

        }

        _plotYAxis(xScale: any, yScale: any) {

            const yAxis = d3.axisLeft(yScale)
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
                    transform: () => {
                        if (this._axesOrigin != null) {
                            return 'translate(' + xScale(this._axesOrigin.x) + ',0)';
                        } else {
                            return `translate(0,0)`;
                        }
                    }
                })
                .call(yAxis);

            if (this._plotHorizontalGridTopping) {
                yAxis.tickSizeInner(-this._chartWidth);
                const topping = this._svg.select('.ninja-horizontalGridTopping');
                topping.transition()
                    .ease(this._labelEase)
                    .call(yAxis);

                this._hideAxisLineAndText(topping);


            }

            if (this._plotHorizontalGrid) {
                yAxis.tickSizeInner(-this._chartWidth);
                const grid = this._svg.select('.ninja-horizontalGrid');
                grid.transition()
                    .ease(this._labelEase)
                    .call(yAxis);
                this._hideAxisText(grid)
            }
        }

        _hideAxisLine(selection) {
            selection.selectAll('path.domain')
                .style('stroke', 'none');
        }

        _hideAxisText(selection) {
            selection.selectAll('text')
                .style('font-size', '0px');
        }

        _hideAxisLineAndText(selection) {
            this._hideAxisLine(selection);
            this._hideAxisText(selection);


        }

        _plotXYAxes(xScale: any, yScale: any) {
            this._plotXAxis(xScale, yScale);
            this._plotYAxis(xScale, yScale);
        }

        _plotLabels() {
            if (!this._svg.select('.ninja-chartTitle')[0] || !this._svg.select('.ninja-chartTitle')[0][0]) {

                // first call, so we'll append the extra title elements.
                this._svg.append("g").classed("ninja-chartTitle", true);
                this._svg.append("g").classed("ninja-y1Title", true);
                this._svg.append("g").classed("ninja-y2Title", true);
                this._svg.append("g").classed("ninja-xTitle", true);
            }

            const arr = [0];

            // main chart title
            const titleSvg = this._svg.select(".ninja-chartTitle")
                .selectAll("text.ninja-chartTitle")
                .data(arr);
            // enter
            const enterTitle = titleSvg.enter()
                .append("text")
                .attr("class", "ninja-chartTitle")
                .attr('x', (this._chartWidth / 2) + this._margin.left)
                .attr('y', (this._margin.top / 2))
                .style('text-anchor', 'middle');
            // exit
            titleSvg.exit()
                .transition()
                .duration(this._transitionDuration)
                .remove();
            // transition
            titleSvg.merge(enterTitle).transition()
                .duration(this._transitionDuration)
                .text(this._title);


            // y title
            const yTitleSvg1 = this._svg.select('.ninja-y1Title')
                .selectAll('text.ninja-y1Title')
                .data(arr);
            // enter
            const enterYTitleSvg1 = yTitleSvg1.enter().append('text')
                .attr('class', 'ninja-y1Title')
                .attr('transform', 'rotate(-90)')
                .style('text-anchor', 'middle');
            // exit
            yTitleSvg1.exit().transition()
                .duration(this._transitionDuration)
                .remove();
            // transition
            let horizontalOffset = this._margin.left * 0.4;
            if (this._yTitleHorizontalOffset) {
                horizontalOffset = this._yTitleHorizontalOffset;
            }
            yTitleSvg1.merge(enterYTitleSvg1).transition()
                .duration(this._transitionDuration)
                .text(this._yAxis1Title)
                .attr('x', -(this._chartHeight / 2) - this._margin.top)
                .attr('y', horizontalOffset);

            // x title
            const xTitleSvg = this._svg.select('.ninja-xTitle')
                .selectAll('text.ninja-xTitle').data(arr);
            // enter
            const enterXTitleSvg = xTitleSvg.enter().append('text')
                .attr('class', 'ninja-xTitle')
                .style('text-anchor', 'middle');
            // exit
            xTitleSvg.exit().transition()
                .duration(this._transitionDuration)
                .remove();
            // transition
            const xPos = (this._chartWidth / 2) + Number(this._margin.left);
            let verticalOffset = this._margin.bottom / 1.5;
            if (this._xTitleVerticalOffset) {
                verticalOffset = this._xTitleVerticalOffset;
            }
            var yPos = this._chartHeight + this._margin.top + verticalOffset;
            xTitleSvg.merge(enterXTitleSvg).transition()
                .duration(this._transitionDuration)
                .text(this._xAxisTitle)
                .attr('y', yPos)
                .attr('x', xPos);

        }


        _getChartWidth(): number {
            return this._width - this._margin.left - this._margin.right;
        }

        _getChartHeight(): number {
            return this._height - this._margin.bottom - this._margin.top;
        }

        _plotTheBackground() {
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
        }

        _functor(variable, d, i): any {
            // if variable is a function, then execute it. Otherwise just return the variable.
            function isFunction(functionToCheck) {
                return !!(functionToCheck && functionToCheck.constructor && functionToCheck.call && functionToCheck.apply); // this is how underscore.js does it.
            }

            if (isFunction(variable)) {
                return variable(d, i);
            } else {
                return variable;
            }
        }

        _genericMouseoverBehaviour(that, d, i, mouseOverItemOpacity = this._mouseOverItemOpacity, mouseOverItemStroke = this._mouseOverItemStroke) {
            d3.select(that)
                .style(
                'opacity', (d, i) => {
                    return this._functor(mouseOverItemOpacity, d, i);
                })
                .style('stroke', (d, i) => {
                    return this._functor(mouseOverItemStroke, d, i);
                });

            if (this._toolTip) {
                this._toolTip.show(d);
            }
            this._onMouseover(d);
        }

        _genericMouseoutBehaviour(that, d, i, itemOpacity = this._itemOpacity, itemStroke = this._itemStroke) {
            d3.select(that)
                .style('opacity', (d, i) => {
                    return this._functor(itemOpacity, d, i);
                })
                .style('stroke', (d, i) => {
                    return this._functor(itemStroke, d, i);
                });

            if (this._toolTip) {
                this._toolTip.hide();
            }
            this._onMouseout(d);
        }


        // setting the properties
        axesOrigin(_x): any {
            if (!arguments.length) return this._axesOrigin;
            this._axesOrigin = _x;
            return this;
        }

        itemFill(_x): any {
            if (!arguments.length) return this._itemFill;
            this._itemFill = _x;
            return this;
        }

        itemFill2(_x): any {
            if (!arguments.length) return this._itemFill2;
            this._itemFill2 = _x;
            return this;
        }

        itemStroke(_x): any {
            if (!arguments.length) return this._itemStroke;
            this._itemStroke = _x;
            return this;
        }

        itemTextLabelColor(_x): any {
            if (!arguments.length) return this._itemTextLabelColor;
            this._itemTextLabelColor = _x;
            return this;
        }

        itemStrokeWidth(_x): any {
            if (!arguments.length) return this._itemStrokeWidth;
            this._itemStrokeWidth = _x;
            return this;
        }

        itemOpacity(_x): any {
            if (!arguments.length) return this._itemOpacity;
            this._itemOpacity = _x;
            return this;
        }

        mouseOverItemOpacity(_x): any {
            if (!arguments.length) return this._mouseOverItemOpacity;
            this._mouseOverItemOpacity = _x;
            return this;
        }

        mouseOverItemStroke(_x): any {
            if (!arguments.length) return this._mouseOverItemStroke;
            this._mouseOverItemStroke = _x;
            return this;
        }

        transitionDelay(_x): any {
            if (!arguments.length) return this._transitionDelay;
            this._transitionDelay = _x;
            return this;
        }

        removeTransitionDelay(_x): any {
            if (!arguments.length) return this._removeTransitionDelay;
            this._removeTransitionDelay = _x;
            return this;
        }

        removeDelay(_x): any {
            if (!arguments.length) return this._removeDelay;
            this._removeDelay = _x;
            return this;
        }

        y1Max(_x): any {
            if (!arguments.length) return this._y1Max;
            this._y1Max = _x;
            return this;
        }

        y2Max(_x): any {
            if (!arguments.length) return this._y2Max;
            this._y2Max = _x;
            return this;
        }

        y1Min(_x): any {
            if (!arguments.length) return this._y1Min;
            this._y1Min = _x;
            return this;
        }

        y2Min(_x): any {
            if (!arguments.length) return this._y2Min;
            this._y2Min = _x;
            return this;
        }

        xMax(_x): any {
            if (!arguments.length) return this._xMax;
            this._xMax = _x;
            return this;
        }

        xMin(_x): any {
            if (!arguments.length) return this._xMin;
            this._xMin = _x;
            return this;
        }

        plotBackground(_x): any {
            if (!arguments.length) return this._plotBackground;
            this._plotBackground = _x;
            return this;
        }

        onMouseover(_x): any {
            if (!arguments.length) return this._onMouseover;
            this._onMouseover = _x;
            return this;
        }

        onMouseout(_x): any {
            if (!arguments.length) return this._onMouseout;
            this._onMouseout = _x;
            return this;
        }

        onClick(_x): any {
            if (!arguments.length) return this._onClick;
            this._onClick = _x;
            return this;
        }

        toolTip(_x): any {
            if (!arguments.length) return this._toolTip;
            this._toolTip = _x;
            return this;
        }

        plotVerticalGridTopping(_x): any {
            if (!arguments.length) return this._plotVerticalGridTopping;
            this._plotVerticalGridTopping = _x;
            return this;
        }

        plotVerticalGrid(_x): any {
            if (!arguments.length) return this._plotVerticalGrid;
            this._plotVerticalGrid = _x;
            return this;
        }

        plotHorizontalGridTopping(_x): any {
            if (!arguments.length) return this._plotHorizontalGridTopping;
            this._plotHorizontalGridTopping = _x;
            return this;
        }

        plotHorizontalGrid(_x): any {
            if (!arguments.length) return this._plotHorizontalGrid;
            this._plotHorizontalGrid = _x;
            return this;
        }

        yAxis1LogScale(_x): any {
            if (!arguments.length) return this._yAxis1LogScale;
            this._yAxis1LogScale = _x;
            return this;
        }

        xAxisLogScale(_x): any {
            if (!arguments.length) return this._xAxisLogScale;
            this._xAxisLogScale = _x;
            return this;
        }

        transitionEase(_x): any {
            if (!arguments.length) return this._transitionEase;
            this._transitionEase = _x;
            return this;
        }

        transitionDuration(_x): any {
            if (!arguments.length) return this._transitionDuration;
            this._transitionDuration = _x;
            return this;
        }

        yAxis1Title(_x): any {
            if (!arguments.length) return this._yAxis1Title;
            this._yAxis1Title = _x;
            return this;
        }

        yAxis2Title(_x): any {
            if (!arguments.length) return this._yAxis2Title;
            this._yAxis2Title = _x;
            return this;
        }

        xAxisTitle(_x): any {
            if (!arguments.length) return this._xAxisTitle;
            this._xAxisTitle = _x;
            return this;
        }

        width(_x): any {
            if (!arguments.length) return this._width;
            this._width = _x;
            return this;
        }

        height(_x): any {
            if (!arguments.length) return this._height;
            this._height = _x;
            return this;
        }

        margin(_x): any {
            if (!arguments.length) return this._margin;
            this._margin = _x;
            return this;
        }

        title(_x): any {
            if (!arguments.length) return this._title;
            this._title = _x;
            return this;
        }

        xAxisTextTransform(_x): any {
            if (!arguments.length) return this._xAxisTextTransform;
            this._xAxisTextTransform = _x;
            return this;
        }

        xTitleVerticalOffset(_x): any {
            if (!arguments.length) return this._xTitleVerticalOffset;
            this._xTitleVerticalOffset = Number(_x);
            return this;
        }

        yTitleHorizontalOffset(_x): any {
            if (!arguments.length) return this._yTitleHorizontalOffset;
            this._yTitleHorizontalOffset = Number(_x);
            return this;
        }

        xAxisTickFormat(_x): any {
            if (!arguments.length) return this._xAxisTickFormat;
            this._xAxisTickFormat = _x;
            return this;
        }

        xAxisTextOrientation(_x): any {
            if (!arguments.length) return this._xAxisTextOrientation;
            this._xAxisTextOrientation = _x;
            return this;
        }

        xAxisTicks(_x): any {
            if (!arguments.length) return this._xAxisTicks;
            this._xAxisTicks = _x;
            return this;
        }

        yAxisTickFormat(_x): any {
            if (!arguments.length) return this._yAxisTickFormat;
            this._yAxisTickFormat = _x;
            return this;
        }

        yAxisTicks(_x): any {
            if (!arguments.length) return this._yAxisTicks;
            this._yAxisTicks = _x;
            return this;
        }

        internalXAxisMargin(_x): any {
            if (!arguments.length) return this._internalXAxisMargin;
            this._internalXAxisMargin = _x;
            return this;
        }

    }


    // const formatBillionsWithB = function ():void {
    //     // Change D3's SI prefix to more business friendly units
    //     //      K = thousands
    //     //      M = millions
    //     //      B = billions (not G!)
    //     //      T = trillion
    //     //      P = quadrillion
    //     //      E = quintillion
    //     // small decimals are handled with e-n formatting. e-3 rather than 'm' - which looks like a million
    //     var d3_formatPrefixes = ["e-24", "e-21", "e-18", "e-15", "e-12", "e-9", "e-6", "e-3", "", "K", "M", "B", "T", "P", "E", "Z", "Y"].map(d3_formatPrefix);
    //
    //     function d3_formatPrefix(d:any, i:number) {
    //         var k = Math.pow(10, Math.abs(8 - i) * 3);
    //         return {
    //             scale: i > 8 ? function (d) {
    //                 return d / k;
    //             } : function (d) {
    //                 return d * k;
    //             },
    //             symbol: d
    //         };
    //     }
    //
    //     function d3_format_precision(x:number, p:number) {
    //         return p - (x ? Math.ceil(Math.log(x) / Math.LN10) : 1);
    //     }
    //
    //     // Override d3's formatPrefix function
    //     d3.formatPrefix = function (value:number, precision:number) {
    //         var i = 0;
    //         if (value) {
    //             if (value < 0) {
    //                 value *= -1;
    //             }
    //             if (precision) {
    //                 value = d3.round(value, d3_format_precision(value, precision));
    //             }
    //             i = 1 + Math.floor(1e-12 + Math.log(value) / Math.LN10);
    //             i = Math.max(-24, Math.min(24, Math.floor((i - 1) / 3) * 3));
    //         }
    //         return d3_formatPrefixes[8 + i / 3];
    //     };
    //
    //
    // }
    // formatBillionsWithB();
}
