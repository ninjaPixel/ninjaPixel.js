namespace ninjaPixel {
    interface bubbleChartDataItem {
        color?: string;
        x: number;
        y: number;
        r: number;
    }

    export class BubbleChart extends ninjaPixel.Chart {
        private _allowBubblesToSpillOffChart: boolean = false;
        private _maxBubbleRadius = 50; // this value is in pixels

        constructor() {
            super();
        }

        maxBubbleRadius(_x): any {
            if (!arguments.length) return this._maxBubbleRadius;
            this._maxBubbleRadius = _x;
            return this;
        }

        allowBubblesToSpillOffChart(_x): any {
            if (!arguments.length) return this._allowBubblesToSpillOffChart;
            this._allowBubblesToSpillOffChart = _x;
            return this;
        }

        plot(_selection) {
            this._init(_selection);

            _selection.each((_data) => {
                var minX, maxX, minY, maxY, minR, maxR;
                if (this._xMin) {
                    minX = this._xMin;
                } else {
                    minX = d3.min(_data, (d: bubbleChartDataItem) => {
                        return d.x;
                    });
                }
                if (this._xMax) {
                    maxX = this._xMax;
                } else {
                    maxX = d3.max(_data, (d: bubbleChartDataItem) => {
                        return d.x;
                    });
                }
                if (this._y1Min) {
                    minY = this._y1Min;
                } else {
                    minY = d3.min(_data, (d: bubbleChartDataItem) => {
                        return d.y;
                    });
                }
                if (this._y1Max) {
                    maxY = this._y1Max;
                } else {
                    maxY = d3.max(_data, (d: bubbleChartDataItem) => {
                        return d.y;
                    });
                }

                minR = d3.min(_data, (d: bubbleChartDataItem) => {
                    return d.r;
                });
                maxR = d3.max(_data, (d: bubbleChartDataItem) => {
                    return d.r;
                });

                /*
                 save the actual min and max values before they get recalculated
                 by the 'no spill' algorithm.
                 i need these values when drawing the grid lines becasue in
                 cases where the original min x is near 0, then the no spill
                 algorithm may set minX to be a negative number and it doesn't
                 quite look right to have the grid lines flowing over the y-axis
                 */
                var minXOriginal = minX,
                    maxXOriginal = maxX,
                    minYOriginal = minY,
                    maxYOriginal = maxY;

                /*
                 sort the bubbles by the radius, as we want to plot the smallest
                 bubble last so that they are not covered by larger bubbles
                 */
                _data.sort(function (a, b) {
                    return b.r - a.r;
                });

                var xScale;
                if (this._xAxisLogScale) {
                    xScale = d3.scaleLog()
                        .domain([minX, maxX]);
                } else {
                    xScale = d3.scaleLinear()
                        .domain([minX, maxX]);
                }
                xScale.range([0, this._chartWidth]);

                var yScale = d3.scaleLinear()
                    .domain([minY, maxY])
                    .range([this._chartHeight, 0]);

                // create the radius scaling function
                var rScale = d3.scaleLinear()
                    .domain([0, maxR])
                    .range([0, this._maxBubbleRadius]);


                // spill algorithm
                if (!this._allowBubblesToSpillOffChart) {
                    // calculate where the edges of the bubble will be plotted (in pixels), so that
                    // they don't spill off the chart
                    var dataLength = _data.length;

                    // this is an iterative solution.
                    // we can work out how many x and y units the radius of each cirle will take up
                    // and then set the scaling factors appropriately (i.e. using modified xMax, xMin etc.)
                    // but then when we plot the circle (which has a fixed radius in terms of pixels)
                    // it will take up a different number of x and y units
                    // therefore we take an iterative approach to converge on a suitable result.
                    var updateXYScalesBasedOnBubbleEdges = () => {
                        var bubbleEdgePixels = [];

                        // find out where the edges of each bubble will be, in terms of pixels
                        for (var i = 0; i < dataLength; i++) {
                            var rPixels = rScale(_data[i].r),
                                rInTermsOfX = Math.abs(minX - xScale.invert(rPixels)),
                                rInTermsOfY = Math.abs(maxY - yScale.invert(rPixels));
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

                        // if the user has specified min/max x/y values, then apply them now
                        if (this._y1Min) {
                            minY = this._y1Min;
                        }
                        if (this._y1Max) {
                            maxY = this._y1Max;
                        }
                        if (this._xMin) {
                            minX = this._xMin;
                        }
                        if (this._xMax) {
                            maxX = this._xMax;
                        }

                        // redefine the X Y scaling functions, now that we have this new information
                        xScale = d3.scaleLinear()
                            .domain([minX, maxX])
                            .range([0, this._chartWidth]);

                        yScale = d3.scaleLinear()
                            .domain([minY, maxY])
                            .range([this._chartHeight, 0]);
                    };

                    // TODO: break if delta is small, rather than a specific number of interations
                    for (var scaleCount = 0; scaleCount < 10; scaleCount++) {
                        updateXYScalesBasedOnBubbleEdges();
                    }
                }

                // Enter, Update, Exit on bubbles
                let functor = this._functor;
                let rScale0 = rScale(0);
                // let mouseOverOpacity = this._mouseOverItemOpacity;
                // let mouseOverStroke = this._mouseOverItemStroke;
                let itemOpacity = this._itemOpacity;
                // let onMouseover = this._onMouseover;
                // let onMouseout = this._onMouseout;
                let onClick = this._onClick;
                let itemStroke: any = this._itemStroke;
                let myToolTip = this._toolTip; //need to reference this variable in local scope as when I come to call the tooltip, it is within a function that is referencing a differnt 'this'
                const genericMouseoverBehaviour = this._genericMouseoverBehaviour.bind(this);
                const genericMouseoutBehaviour = this._genericMouseoutBehaviour.bind(this);

                var bubbles = this._svg.select('.ninja-chartGroup')
                    .call(myToolTip)
                    .selectAll('.bubble')
                    .data(_data);

                // enter
                const enterBubbles = bubbles.enter().append('circle')
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
                        genericMouseoverBehaviour(this, d, i)
                    })
                    .on('mouseout', function (d, i) {
                        genericMouseoutBehaviour(this, d, i);
                    })
                    .on('click', function (d) {
                        onClick(d);
                    });

                bubbles.merge(enterBubbles)
                    .transition()
                    .duration(this._transitionDuration)
                    .delay((d, i) => {
                        return functor(this._transitionDelay, d, i);
                    })
                    .ease(this._transitionEase)
                    .styles({
                        opacity: (d, i) => {
                            return functor(itemOpacity, d, i);
                        }, // Re-sets the opacity of the circle
                        stroke: (d, i) => {
                            return functor(itemStroke, d, i);
                        },
                        fill: (d, i) => {
                            return functor(this._itemFill, d, i);
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


                this._plotLabels();
                this._plotXYAxes(xScale, yScale);
                // end data loop
            });
        }

    }

}