/// <reference path="typescript_definitions/d3.d.ts" />
/// <reference path="chart.ts" />
// declare var d3: D3.Base;
module ninjaPixel {

    export class Treemap extends ninjaPixel.Chart {
        constructor() {
            super();
        }

        private _nodeText: any = '';

        nodeText(_x): any {
            if (!arguments.length) return this._nodeText;
            this._nodeText = _x;
            return this;
        }

        private _itemFontSize: any = '8px';

        itemFontSize(_x): any {
            if (!arguments.length) return this._itemFontSize;
            this._itemFontSize = _x;
            return this;
        }

        private _itemTextOffsetLeft: any = 1;

        itemTextOffsetLeft(_x): any {
            if (!arguments.length) return this._itemTextOffsetLeft;
            this._itemTextOffsetLeft = _x;
            return this;
        }

        private _itemTextOffsetTop: any = 10;

        itemTextOffsetTop(_x): any {
            if (!arguments.length) return this._itemTextOffsetTop;
            this._itemTextOffsetTop = _x;
            return this;
        }

        private _useHtmlText: any = false;

        useHtmlText(_x): any {
            if (!arguments.length) return this._useHtmlText;
            this._useHtmlText = _x;
            return this;
        }

        private _textWrap: any = false; // options: 'crop', 'hide'

        textWrap(_x): any {
            if (!arguments.length) return this._textWrap;
            this._textWrap = _x;
            return this;
        }

        private _htmlTextPadding: any = '3px';

        htmlTextPadding(_x): any {
            if (!arguments.length) return this._htmlTextPadding;
            this._htmlTextPadding = _x;
            return this;
        }


        plot(_selection) {
            this._init(_selection, Category.treemap);
            var functor = this._functor;
            var myToolTip = this._toolTip; //need to reference this variable in local scope as when I come to call the tooltip, it is within a function that is referencing a differnt 'this'
            var onMouseover = this._onMouseover;
            var onMouseout = this._onMouseout;
            var onClick = this._onClick;
            var mouseOverOpacity: any = this._mouseOverItemOpacity;
            var defaultOpacity: any = this._itemOpacity;
            var mouseOverStroke = this._mouseOverItemStroke;
            var defaultStroke = this._itemStroke;
            var nodeFill = this._itemFill;
            var nodeText = this._nodeText;
            var fontSize = this._itemFontSize;
            var nodeTextOffsetLeft = this._itemTextOffsetLeft;
            var nodeTextOffsetTop = this._itemTextOffsetTop;
            var that = this;

            _selection.each((_data) => {

                var myTreemap: any = d3.layout.treemap()
                var treemapLayout = myTreemap
                    .size([this._chartWidth, this._chartHeight])
                    .sticky(true)
                    .value(function (d) {
                        return d.size;
                    });

                var treemapNode = this._svg.select('.ninja-chartGroup')
                    .call(myToolTip)
                    .datum(_data)
                    .selectAll('.treemap-node')
                    .data(treemapLayout.nodes);


                var drawEmptyTreemap = false;
                if (_data.area == 0) {
                    console.log('The data area is 0. Cannot draw a treemap.');
                    drawEmptyTreemap = true;
                }

                treemapNode.enter().append('rect')
                    .attr('class', 'treemap-node')
                    .attr({
                        x: (d) => {
                            return d.x;
                        },
                        width: (d) => {
                            return Math.max(0, d.dx - 1);
                        },
                        y: (d) => {
                            return d.y;
                        },
                        height: 0,
                        fill: (d, i) => {
                            return functor(nodeFill, d, i);
                        }
                    })
                    .style({
                        opacity: (d, i) => {
                            return functor(defaultOpacity, d, i);
                        }, // Re-sets the opacity
                        stroke: (d, i) => {
                            return functor(defaultStroke, d, i);
                        }
                    })
                    .on('mouseover', function (d, i) {
                        d3.select(this)
                            .style({
                                opacity: (d, i) => {
                                    return functor(mouseOverOpacity, d, i);
                                },
                                stroke: (d, i) => {
                                    return functor(mouseOverStroke, d, i);
                                }
                            });
                        myToolTip.show(d);
                        onMouseover(d, myToolTip.getBoundingBox());
                    })
                    .on('mouseout', function (d, i) {
                        d3.select(this)
                            .style({
                                opacity: (d, i) => {
                                    return functor(defaultOpacity, d, i);
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

                treemapNode.transition()
                    .duration(this._transitionDuration)
                    .attr({
                        x: (d) => {
                            return d.x;
                        },
                        width: (d) => {
                            if (drawEmptyTreemap) {
                                return 0;
                            }
                            return Math.max(0, d.dx - 1);
                        },
                        y: (d) => {
                            return d.y;
                        },
                        height: (d) => {
                            if (drawEmptyTreemap) {
                                return 0;
                            }
                            return Math.max(0, d.dy - 1);
                        },
                        fill: (d, i) => {
                            return functor(this._itemFill, d, i);
                        }
                    })
                    .style({
                        opacity: (d, i) => {
                            return functor(defaultOpacity, d, i);
                        }, // Re-sets the opacity
                        stroke: (d, i) => {
                            return functor(defaultStroke, d, i);
                        }
                    });


                treemapNode.exit().transition().remove();


                if (this._textWrap) {
                    var textWrapData = [];
                    var addTreemapTextToArray = function (data, i) {
                        if (data.name) {
                            var lineCount = 0;
                            var lineSpacing = 1.05;
                            var _fontSize = Number(functor(fontSize, data, i).split('px')[0]);
                            var fontFactor = 0.7; // this is an observed factor / magic number
                            var charsPerLine = Math.floor(data.dx / (fontFactor * _fontSize));
                            var reg = new RegExp("(\\S(.{0," + charsPerLine + "}\\S)?)\\s+", "g");
                            var wordwrapped = data.name.trim().replace(reg, '$1\n');

                            wordwrapped.split('\n').forEach(function (line0) {
                                var line = line0;
                                if (line.length > charsPerLine) {
                                    if (that._textWrap === 'hide') {
                                        // TODO (someday) flesh this out. It's VERY janky at the moment!
                                        console.log(line, "is too long to fit into this block");
                                        return;
                                    } else if (that._textWrap === 'crop') {
                                        // slice the end of the string until it fits and add ellipsis if there is space for one
                                        var tooManyChars = line.length - charsPerLine;
                                        if (tooManyChars > 3) {
                                            line = line.slice(0, charsPerLine - 1) + '...';
                                        } else if (tooManyChars > 2) {
                                            line = line.slice(0, charsPerLine + 0) + '..';
                                        } else {
                                            line = line.slice(0, charsPerLine + 1);

                                        }
                                    }
                                }

                                var lineOffset = lineCount * _fontSize * lineSpacing;
                                var y = data.y + lineOffset;
                                var obj = {
                                    name: line,
                                    _index: data.name + lineCount,
                                    x: data.x,
                                    y0: data.y,
                                    y: y,
                                    dx: data.dx,
                                    dy: data.dy,
                                    children: data.children ? true : false
                                };
                                lineCount++;
                                var newLineOffset = lineCount * _fontSize * lineSpacing;
                                if ((newLineOffset) <= data.dy) {
                                    textWrapData.push(obj);
                                } else {
                                    // can't plot this text as it leaves the bounds of the block
                                }
                            });
                        }
                        if (data.children) {
                            data.children.forEach(addTreemapTextToArray);
                        }
                    };

                    _data.children.forEach(addTreemapTextToArray);
                    var svgText = this._svg.select('.ninja-chartGroup')
                        .call(myToolTip)
                        // .datum(_data)
                        .selectAll('.treemap-text')
                        .data(textWrapData, function (d) {
                            return d._index;
                        });

                    svgText.enter().append('text')
                        .attr('class', 'treemap-text')
                        .attr({
                            fill: (d, i) => {
                                return functor(this._itemTextLabelColor, d, i);
                            },
                        })
                        .style({
                            opacity: (d, i) => {
                                return functor(defaultOpacity, d, i);
                            }, // Re-sets the opacity
                        });

                    svgText.transition()
                        .duration(this._transitionDuration)
                        .attr({
                            x: (d, i) => {
                                return d.x + functor(nodeTextOffsetLeft, d, i);
                            },
                            y: (d, i) => {
                                return d.y + functor(nodeTextOffsetTop, d, i);
                            },
                            'font-size': (d, i) => {
                                if (drawEmptyTreemap) {
                                    return 0;
                                }
                                return functor(fontSize, d, i);
                            }
                        })
                        .text(function (d, i) {
                            return functor(nodeText, d, i);
                        });

                    svgText.exit().transition().remove();

                } else if (this._useHtmlText) {
                    var htmlText = this._svg.select('.ninja-chartGroup')
                        .call(myToolTip)
                        .datum(_data)
                        .selectAll('.tweetText')
                        .data(treemapLayout.nodes);
                    // enter
                    htmlText.enter().append('foreignObject')
                        .append("xhtml:div")
                        .attr('class', 'tweetText')
                        .attr('x', function (d, i) {
                            return d.x;
                        })
                        .attr('y', function (d, i) {
                            return d.y;
                        })
                        .attr('width', function (d) {
                            return d.dx;
                        })
                        .attr('height', function (d) {
                            return d.dy;
                        })
                        .style('opacity', 1)
                        .html(function (d, i) {

                            var fontSize = functor(fontSize, d, i);
                            var text = functor(nodeText, d, i);
                            if (text) {

                                return `<div style="color: #ededed; font-size:${fontSize}px; padding:${that._htmlTextPadding}">${text}</div>`;
                            }
                        });

                    // tweetsText.transition().duration(300)
                    htmlText.exit().transition()
                        .ease(this._transitionEase)
                        .duration(this._transitionDuration)
                        .style('opacity', 0)
                        .attr('x', 0)
                        .attr('y', 0)
                        .remove();

                    // can't apply transition to the html property (yet): http://bost.ocks.org/mike/transition/#interpolation
                    htmlText.transition()
                        .ease(this._transitionEase)
                        .duration(this._transitionDuration)
                        .delay((d, i) => {
                            return functor(this._transitionDelay, d, i);
                        })
                        .attr('x', function (d, i) {
                            return d.x;
                        })
                        .attr('y', function (d, i) {
                            return d.y;
                        })
                        .attr('width', function (d) {
                            return d.dx;
                        })
                        .attr('height', function (d) {
                            return d.dy;
                        })
                        .style('opacity', 1)
                        .html(function (d, i) {

                            var fontSize = functor(fontSize, d, i);
                            var text = functor(nodeText, d, i);
                            if (text) {
                                return `<div style="color: #ededed; font-size:${fontSize}px; padding:${that._htmlTextPadding}">${text}</div>`;
                            }
                        })


                } else {
                    var svgText = this._svg.select('.ninja-chartGroup')
                        .call(myToolTip)
                        .datum(_data)
                        .selectAll('.treemap-text')
                        .data(treemapLayout.nodes);
                    svgText.enter().append('text')
                        .attr('class', 'treemap-text')
                        .attr({
                            fill: (d, i) => {
                                return functor(this._itemTextLabelColor, d, i);
                            },
                        })
                        .style({
                            opacity: (d, i) => {
                                return functor(defaultOpacity, d, i);
                            }, // Re-sets the opacity
                        })
                        .on('mouseover', function (d, i) {
                            d3.select(this)
                            myToolTip.show(d);
                            onMouseover(d, myToolTip.getBoundingBox());
                        })
                        .on('mouseout', function (d, i) {
                            d3.select(this)
                            myToolTip.hide();
                            onMouseout(d);
                        })
                        .on('click', function (d, i) {
                            onClick(d);
                        });

                    svgText.transition()
                        .duration(this._transitionDuration)
                        .attr({
                            x: (d, i) => {
                                return d.x + functor(nodeTextOffsetLeft, d, i);
                            },
                            y: (d, i) => {
                                return d.y + functor(nodeTextOffsetTop, d, i);
                            },
                            'font-size': (d, i) => {
                                if (drawEmptyTreemap) {
                                    return 0;
                                }
                                return functor(fontSize, d, i);
                            }
                        })
                        .text(function (d, i) {
                            return functor(nodeText, d, i);
                        });

                    svgText.exit().transition().remove();
                }


            });
        }
    }
}