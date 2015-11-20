// d3.tip
// Copyright (c) 2013 Justin Palmer
//
// Tooltips for d3.js SVG visualizations

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module with d3 as a dependency.
    define(['d3'], factory)
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS
    module.exports = function(d3) {
      d3.tip = factory(d3)
      return d3.tip
    }
  } else {
    // Browser global.
    root.d3.tip = factory(root.d3)
  }
}(this, function (d3) {

  // Public - contructs a new tooltip
  //
  // Returns a tip
  return function() {
    var direction = d3_tip_direction,
        offset    = d3_tip_offset,
        html      = d3_tip_html,
        node      = initNode(),
        svg       = null,
        point     = null,
        target    = null,
        transitionDuration = 0

    function tip(vis) {
      svg = getSVGNode(vis)
      point = svg.createSVGPoint()
      document.body.appendChild(node)
    }

    // Public - show the tooltip on the screen
    //
    // Returns a tip
    tip.show = function() {
      var args = Array.prototype.slice.call(arguments)
      if(args[args.length - 1] instanceof SVGElement) target = args.pop()

      var content = html.apply(this, args),
          poffset = offset.apply(this, args),
          dir     = direction.apply(this, args),
          nodel   = getNodeEl(),
          i       = directions.length,
          coords,
          scrollTop  = document.documentElement.scrollTop || document.body.scrollTop,
          scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft

      nodel.html(content)
        .transition()
        .duration(transitionDuration)
        .style({ opacity: 1, 'pointer-events': 'all' })

      while(i--) nodel.classed(directions[i], false)
      coords = direction_callbacks.get(dir).apply(this)
      nodel.classed(dir, true).style({
        top: (coords.top +  poffset[0]) + scrollTop + 'px',
        left: (coords.left + poffset[1]) + scrollLeft + 'px'
      })

      return tip
    }

    // Public - hide the tooltip
    //
    // Returns a tip
    tip.hide = function() {
      var nodel = getNodeEl()
      nodel.transition()
        .duration(transitionDuration)
        .style({ opacity: 0, 'pointer-events': 'none' });
        
      return tip
    }

    // Public: Proxy attr calls to the d3 tip container.  Sets or gets attribute value.
    //
    // n - name of the attribute
    // v - value of the attribute
    //
    // Returns tip or attribute value
    tip.attr = function(n, v) {
      if (arguments.length < 2 && typeof n === 'string') {
        return getNodeEl().attr(n)
      } else {
        var args =  Array.prototype.slice.call(arguments)
        d3.selection.prototype.attr.apply(getNodeEl(), args)
      }

      return tip
    }

    // Public: Proxy style calls to the d3 tip container.  Sets or gets a style value.
    //
    // n - name of the property
    // v - value of the property
    //
    // Returns tip or style property value
    tip.style = function(n, v) {
      if (arguments.length < 2 && typeof n === 'string') {
        return getNodeEl().style(n)
      } else {
        var args =  Array.prototype.slice.call(arguments)
        d3.selection.prototype.style.apply(getNodeEl(), args)
      }

      return tip
    }

    // Public: Set or get the direction of the tooltip
    //
    // v - One of n(north), s(south), e(east), or w(west), nw(northwest),
    //     sw(southwest), ne(northeast) or se(southeast)
    //
    // Returns tip or direction
    tip.direction = function(v) {
      if (!arguments.length) return direction
      direction = v == null ? v : d3.functor(v)

      return tip
    }

    // Public: Sets or gets the offset of the tip
    //
    // v - Array of [x, y] offset
    //
    // Returns offset or
    tip.offset = function(v) {
      if (!arguments.length) return offset
      offset = v == null ? v : d3.functor(v)

      return tip
    }

    // Public: sets or gets the html value of the tooltip
    //
    // v - String value of the tip
    //
    // Returns html value or tip
    tip.html = function(v) {
      if (!arguments.length) return html
      html = v == null ? v : d3.functor(v)

      return tip
    }

    // Public: sets or gets the tip's transition duration
    //
    // v - Int value of the transition duration, in milliseconds
    //
    // Returns transitionDuration value or tip
    tip.transitionDuration = function(v){
      if (!arguments.length) return transitionDuration
      transitionDuration = v 

      return tip
    }

    // Public: destroys the tooltip and removes it from the DOM
    //
    // Returns a tip
    tip.destroy = function() {
      if(node) {
        getNodeEl().remove();
        node = null;
      }
      return tip;
    }
    
    function d3_tip_direction() { return 'n' }
    function d3_tip_offset() { return [0, 0] }
    function d3_tip_html() { return ' ' }

    var direction_callbacks = d3.map({
      n:  direction_n,
      s:  direction_s,
      e:  direction_e,
      w:  direction_w,
      nw: direction_nw,
      ne: direction_ne,
      sw: direction_sw,
      se: direction_se
    }),

    directions = direction_callbacks.keys()

    function direction_n() {
      var bbox = getScreenBBox()
      return {
        top:  bbox.n.y - node.offsetHeight,
        left: bbox.n.x - node.offsetWidth / 2
      }
    }

    function direction_s() {
      var bbox = getScreenBBox()
      return {
        top:  bbox.s.y,
        left: bbox.s.x - node.offsetWidth / 2
      }
    }

    function direction_e() {
      var bbox = getScreenBBox()
      return {
        top:  bbox.e.y - node.offsetHeight / 2,
        left: bbox.e.x
      }
    }

    function direction_w() {
      var bbox = getScreenBBox()
      return {
        top:  bbox.w.y - node.offsetHeight / 2,
        left: bbox.w.x - node.offsetWidth
      }
    }

    function direction_nw() {
      var bbox = getScreenBBox()
      return {
        top:  bbox.nw.y - node.offsetHeight,
        left: bbox.nw.x - node.offsetWidth
      }
    }

    function direction_ne() {
      var bbox = getScreenBBox()
      return {
        top:  bbox.ne.y - node.offsetHeight,
        left: bbox.ne.x
      }
    }

    function direction_sw() {
      var bbox = getScreenBBox()
      return {
        top:  bbox.sw.y,
        left: bbox.sw.x - node.offsetWidth
      }
    }

    function direction_se() {
      var bbox = getScreenBBox()
      return {
        top:  bbox.se.y,
        left: bbox.e.x
      }
    }

    function initNode() {
      var node = d3.select(document.createElement('div'))
      node.style({
        position: 'absolute',
        top: 0,
        opacity: 0,
        'pointer-events': 'none',
        'box-sizing': 'border-box'
      })

      return node.node()
    }

    function getSVGNode(el) {
      el = el.node()
      if(el.tagName.toLowerCase() === 'svg')
        return el

      return el.ownerSVGElement
    }

    function getNodeEl() {
      if(node === null) {
        node = initNode();
        // re-add node to DOM
        document.body.appendChild(node);
      };
      return d3.select(node);
    }

    // Private - gets the screen coordinates of a shape
    //
    // Given a shape on the screen, will return an SVGPoint for the directions
    // n(north), s(south), e(east), w(west), ne(northeast), se(southeast), nw(northwest),
    // sw(southwest).
    //
    //    +-+-+
    //    |   |
    //    +   +
    //    |   |
    //    +-+-+
    //
    // Returns an Object {n, s, e, w, nw, sw, ne, se}
    function getScreenBBox() {
      var targetel   = target || d3.event.target;

      while ('undefined' === typeof targetel.getScreenCTM && 'undefined' === targetel.parentNode) {
          targetel = targetel.parentNode;
      }

      var bbox       = {},
          matrix     = targetel.getScreenCTM(),
          tbbox      = targetel.getBBox(),
          width      = tbbox.width,
          height     = tbbox.height,
          x          = tbbox.x,
          y          = tbbox.y

      point.x = x
      point.y = y
      bbox.nw = point.matrixTransform(matrix)
      point.x += width
      bbox.ne = point.matrixTransform(matrix)
      point.y += height
      bbox.se = point.matrixTransform(matrix)
      point.x -= width
      bbox.sw = point.matrixTransform(matrix)
      point.y -= height / 2
      bbox.w  = point.matrixTransform(matrix)
      point.x += width
      bbox.e = point.matrixTransform(matrix)
      point.x -= width / 2
      point.y -= height / 2
      bbox.n = point.matrixTransform(matrix)
      point.y += height
      bbox.s = point.matrixTransform(matrix)

      return bbox
    }

    return tip
  };

}));

var ninjaPixel;
(function (ninjaPixel) {
    ninjaPixel.version = '0.0.9';
    (function (Category) {
        Category[Category["xy"] = 0] = "xy";
        Category[Category["donut"] = 1] = "donut";
        Category[Category["treemap"] = 2] = "treemap";
        Category[Category["simpleTreemap"] = 3] = "simpleTreemap";
    })(ninjaPixel.Category || (ninjaPixel.Category = {}));
    var Category = ninjaPixel.Category;
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
            this._transitionDuration = 300;
            this._transitionEase = 'linear';
            this._transitionDelay = 0;
            this._removeTransitionDelay = 0;
            this._removeDelay = 0;
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
            this._itemFill2 = 'lightgray';
            this._itemStrokeWidth = '3px';
            this._toolTip = d3.tip().attr('class', 'd3-tip').offset([-10, 0]).transitionDuration(300).html(function () {
                return 'Tooltip HTML not defined';
            }).direction('n');
        }
        Chart.prototype._init = function (_selection, category) {
            if (category === void 0) { category = 0 /* xy */; }
            this._category = category;
            this._chartHeight = this._getChartHeight();
            this._chartWidth = this._getChartWidth();
            if (!this._svg) {
                if (this._category == 3 /* simpleTreemap */) {
                    this._svg = _selection.append('div').classed('ninja-treemap', true);
                    var container = this._svg.append('div').classed('ninja-containerGroup', true);
                }
                else {
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
            }
            this._svg.transition().attr({
                width: this._width,
                height: this._height
            });
            if (this._category == 1 /* donut */) {
                this._svg.select('.ninja-containerGroup').attr({
                    transform: 'translate(' + Number(Number(this._margin.left) + Number(this._chartWidth / 2)) + ',' + Number(Number(this._margin.top) + Number(this._chartHeight / 2)) + ')'
                });
            }
            else if (this._category == 0 /* xy */ || this._category == 2 /* treemap */ || this._category == 3 /* simpleTreemap */) {
                this._svg.select('.ninja-containerGroup').attr({
                    transform: 'translate(' + Number(this._margin.left) + ',' + Number(this._margin.top) + ')'
                });
            }
            this._plotTheBackground();
        };
        Chart.prototype._plotXAxis = function (xScale, yScale) {
            var _this = this;
            var xAxis = d3.svg.axis().scale(xScale).orient('bottom').outerTickSize(0);
            if (this._plotVerticalGridTopping) {
                xAxis.tickSize(-this._chartHeight, 0);
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
            this._svg.select('.ninja-xAxisGroup.ninja-axis').attr({
                transform: function () {
                    if (_this._axesOrigin != null) {
                        return 'translate(0,' + yScale(_this._axesOrigin.y) + ')';
                    }
                    else {
                        return 'translate(0,' + (_this._chartHeight) + ')';
                    }
                }
            }).call(xAxis);
            if (this._xAxisTextTransform != null) {
                this._svg.select('.ninja-xAxisGroup.ninja-axis').selectAll('.tick text').style('text-anchor', 'end').attr('transform', this._xAxisTextTransform);
            }
            if (this._plotVerticalGrid) {
                xAxis.tickSize(-this._chartHeight, 0);
                this._svg.select('.ninja-verticalGrid').attr({
                    transform: function () {
                        return 'translate(0,' + (_this._chartHeight) + ')';
                    }
                }).call(xAxis);
            }
        };
        Chart.prototype._plotYAxis = function (xScale, yScale) {
            var _this = this;
            var yAxis = d3.svg.axis().scale(yScale).orient('left').outerTickSize(0);
            if (this._plotHorizontalGridTopping) {
                yAxis.tickSize(-this._chartWidth, 0);
            }
            if (this._yAxisTickFormat != null) {
                yAxis.tickFormat(this._yAxisTickFormat);
            }
            if (this._yAxisTicks != null) {
                yAxis.ticks(this._yAxisTicks);
            }
            this._svg.select('.ninja-yAxisGroup.ninja-axis').transition().ease(this._labelEase).attr({
                transform: function () {
                    if (_this._axesOrigin != null) {
                        return 'translate(' + xScale(_this._axesOrigin.x) + ',0)';
                    }
                }
            }).call(yAxis);
            if (this._plotHorizontalGrid) {
                yAxis.tickSize(-this._chartWidth, 0);
                this._svg.select('.ninja-horizontalGrid').transition().ease(this._labelEase).attr({
                    transform: function () {
                        if (_this._axesOrigin != null) {
                        }
                    }
                }).call(yAxis);
            }
        };
        Chart.prototype._plotXYAxes = function (xScale, yScale) {
            this._plotXAxis(xScale, yScale);
            this._plotYAxis(xScale, yScale);
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
            var yTitleSvg1 = this._svg.select('.ninja-y1Title').selectAll('text.ninja-y1Title').data(arr);
            yTitleSvg1.enter().append('text').attr('class', 'ninja-y1Title').attr('transform', 'rotate(-90)').style('text-anchor', 'middle');
            yTitleSvg1.exit().transition().duration(this._transitionDuration).remove();
            var horizontalOffset = this._margin.left * 0.4;
            if (this._yTitleHorizontalOffset) {
                horizontalOffset = this._yTitleHorizontalOffset;
            }
            yTitleSvg1.transition().duration(this._transitionDuration).text(this._yAxis1Title).attr('x', -(this._chartHeight / 2) - this._margin.top).attr('y', horizontalOffset);
            var xTitleSvg = this._svg.select('.ninja-xTitle').selectAll('text.ninja-xTitle').data(arr);
            xTitleSvg.enter().append('text').attr('class', 'ninja-xTitle').style('text-anchor', 'middle');
            xTitleSvg.exit().transition().duration(this._transitionDuration).remove();
            var xPos = (this._chartWidth / 2) + Number(this._margin.left);
            var verticalOffset = this._margin.bottom / 1.5;
            if (this._xTitleVerticalOffset) {
                verticalOffset = this._xTitleVerticalOffset;
            }
            var yPos = this._chartHeight + this._margin.top + verticalOffset;
            xTitleSvg.transition().duration(this._transitionDuration).text(this._xAxisTitle).attr('y', yPos).attr('x', xPos);
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
                    width: this._chartWidth
                });
                background.transition().attr({
                    x: 0,
                    y: 0,
                    height: this._chartHeight,
                    width: this._chartWidth
                });
                background.exit().remove();
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
    })();
    ninjaPixel.Chart = Chart;
    var formatBillionsWithB = function () {
        var d3_formatPrefixes = ["e-24", "e-21", "e-18", "e-15", "e-12", "e-9", "e-6", "e-3", "", "K", "M", "B", "T", "P", "E", "Z", "Y"].map(d3_formatPrefix);
        d3.formatPrefix = function (value, precision) {
            var i = 0;
            if (value) {
                if (value < 0) {
                    value *= -1;
                }
                if (precision) {
                    value = d3.round(value, d3_format_precision(value, precision));
                }
                i = 1 + Math.floor(1e-12 + Math.log(value) / Math.LN10);
                i = Math.max(-24, Math.min(24, Math.floor((i - 1) / 3) * 3));
            }
            return d3_formatPrefixes[8 + i / 3];
        };
        function d3_formatPrefix(d, i) {
            var k = Math.pow(10, Math.abs(8 - i) * 3);
            return {
                scale: i > 8 ? function (d) {
                    return d / k;
                } : function (d) {
                    return d * k;
                },
                symbol: d
            };
        }
        function d3_format_precision(x, p) {
            return p - (x ? Math.ceil(Math.log(x) / Math.LN10) : 1);
        }
    };
    formatBillionsWithB();
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
            this._isTimeseries = false;
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
                    var d3MinY = d3.min(_data, function (d) { return d.y; });
                    if (d3MinY < 0) {
                        minData = d3MinY;
                    }
                }
                if (_this._y1Max != null) {
                    maxData = _this._y1Max;
                }
                else {
                    var d3MaxY = d3.max(_data, function (d) { return d.y; });
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
                    _this._xScale = d3.time.scale().domain([minX, maxX]).range([0 + barW, _this._chartWidth - barW]);
                }
                else {
                    _this._xScale = d3.scale.ordinal().domain(_data.map(function (d, i) {
                        return d.x;
                    })).rangeRoundBands([0, _this._chartWidth], 0.1);
                }
                _this._yScale = d3.scale.linear().domain([minData, maxData]).range([_this._chartHeight, 0]);
                _this._barScale = d3.scale.linear().domain([Math.abs(maxData - minData), 0]).range([_this._chartHeight, 0]);
                var xScale = _this._xScale;
                var yScale = _this._yScale;
                var barScale = _this._barScale;
                if (barW <= 0) {
                    barW = xScale.rangeBand();
                }
                var barAdjustmentX = 0;
                if (_this._isTimeseries) {
                    barAdjustmentX = -barW / 2;
                }
                var calculateBarWidth = function (d, i) {
                    return barW;
                };
                function xScaleAdjusted(x) {
                    return xScale(x) + barAdjustmentX;
                }
                _this._xScaleAdjusted = xScaleAdjusted;
                var yScale0 = yScale(0);
                var bars = _this._svg.select('.ninja-chartGroup').call(myToolTip).selectAll('.bar').data(_data, function (d) {
                    return d.x;
                });
                bars.enter().append('rect').classed('bar', true).attr({
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
                        return xScaleAdjusted(d.x);
                    },
                    width: function (d, i) {
                        return calculateBarWidth(d, i);
                    },
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
                bars.exit().transition().duration(function (d, i) {
                    return functor(_this._removeTransitionDelay, d, i);
                }).ease(_this._transitionEase).attr({
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
                }).delay(function (d, i) {
                    return functor(_this._removeDelay, d, i);
                }).remove();
                _this._plotLabels();
                _this._plotXAxis(xScale, yScale);
                _this._plotYAxis(xScale, yScale);
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
    var GroupedBarChart = (function (_super) {
        __extends(GroupedBarChart, _super);
        function GroupedBarChart() {
            _super.call(this);
            this._cornerRounding = 1;
            this._isTimeseries = false;
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
                    _this._xScale = d3.time.scale().domain([minX, maxX]).range([0 + barW, _this._chartWidth - barW]);
                }
                else {
                    _this._xScale = d3.scale.ordinal().domain(_data.map(function (d, i) {
                        return d.x;
                    })).rangeRoundBands([0, _this._chartWidth], 0.1);
                }
                _this._yScale = d3.scale.linear().domain([minData, maxData]).range([_this._chartHeight, 0]);
                _this._barScale = d3.scale.linear().domain([Math.abs(maxData - minData), 0]).range([_this._chartHeight, 0]);
                var xScale = _this._xScale;
                var yScale = _this._yScale;
                var barScale = _this._barScale;
                var xGroupScale = d3.scale.ordinal();
                if (barW <= 0) {
                    barW = xScale.rangeBand();
                }
                xGroupScale.domain(distinctGroups).rangeRoundBands([0, barW]);
                var barAdjustmentX = 0;
                if (_this._isTimeseries) {
                    barAdjustmentX = -barW / 2;
                }
                var calculateBarWidth = function (d, i) {
                    return xGroupScale(d.group);
                };
                function xScaleAdjusted(x) {
                    return xScale(x) + barAdjustmentX;
                }
                _this._xScaleAdjusted = xScaleAdjusted;
                var yScale0 = yScale(0);
                var barsRoot = _this._svg.select('.ninja-chartGroup').call(myToolTip).selectAll('.g').data(_data, function (d) {
                    return d.x;
                });
                barsRoot.enter().append("g").attr("class", "g").attr("transform", function (d) {
                    return "translate(" + xScaleAdjusted(d.x) + ",0)";
                });
                barsRoot.transition().duration(_this._transitionDuration).attr("transform", function (d) {
                    return "translate(" + xScaleAdjusted(d.x) + ",0)";
                });
                barsRoot.exit().transition().remove();
                var bars = barsRoot.selectAll(".bar").data(function (d) {
                    return d.data;
                });
                bars.enter().append('rect').classed('bar', true).attr({
                    x: function (d, i) {
                        return xGroupScale(d.group);
                    },
                    width: function (d, i) {
                        return xGroupScale.rangeBand();
                    },
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
                bars.exit().transition().duration(function (d, i) {
                    return functor(_this._removeTransitionDelay, d, i);
                }).ease(_this._transitionEase).attr({
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
                }).delay(function (d, i) {
                    return functor(_this._removeDelay, d, i);
                }).remove();
                _this._plotLabels();
                _this._plotXAxis(xScale, yScale);
                _this._plotYAxis(xScale, yScale);
            });
        };
        return GroupedBarChart;
    })(ninjaPixel.Chart);
    ninjaPixel.GroupedBarChart = GroupedBarChart;
})(ninjaPixel || (ninjaPixel = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ninjaPixel;
(function (ninjaPixel) {
    var GroupedInterquartileChart = (function (_super) {
        __extends(GroupedInterquartileChart, _super);
        function GroupedInterquartileChart() {
            _super.call(this);
            this._cornerRounding = 1;
            this._medianWidth = 8;
            this._isTimeseries = false;
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
            var onMouseover = this._onMouseover;
            var onMouseout = this._onMouseout;
            var onClick = this._onClick;
            var mouseOverBarOpacity = this._mouseOverItemOpacity;
            var defaultBarOpacity = this._itemOpacity;
            var mouseOverBarStroke = this._mouseOverItemStroke;
            var defaultStroke = this._itemStroke;
            var barFill = this._itemFill;
            var barFill2 = this._itemFill2;
            var medianWidth = this._medianWidth;
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
                    _this._xScale = d3.time.scale().domain([minX, maxX]).range([0 + barW, _this._chartWidth - barW]);
                }
                else {
                    _this._xScale = d3.scale.ordinal().domain(_data.map(function (d, i) {
                        return d.x;
                    })).rangeRoundBands([0, _this._chartWidth], 0.1);
                }
                _this._yScale = d3.scale.linear().domain([minData, maxData]).range([_this._chartHeight, 0]);
                _this._barScale = d3.scale.linear().domain([Math.abs(maxData - minData), 0]).range([_this._chartHeight, 0]);
                var xScale = _this._xScale;
                var yScale = _this._yScale;
                var barScale = _this._barScale;
                var xGroupScale = d3.scale.ordinal();
                if (barW <= 0) {
                    barW = xScale.rangeBand();
                }
                xGroupScale.domain(distinctGroups).rangeRoundBands([0, barW]);
                var barAdjustmentX = 0;
                if (_this._isTimeseries) {
                    barAdjustmentX = -barW / 2;
                }
                var calculateBarWidth = function (d, i) {
                    return xGroupScale(d.group);
                };
                function xScaleAdjusted(x) {
                    return xScale(x) + barAdjustmentX;
                }
                _this._xScaleAdjusted = xScaleAdjusted;
                var yScale0 = yScale(0);
                var barsRoot = _this._svg.select('.ninja-chartGroup').call(myToolTip).selectAll('.g').data(_data, function (d) {
                    return d.x;
                });
                barsRoot.enter().append("g").attr("class", "g").attr("transform", function (d) {
                    return "translate(" + xScaleAdjusted(d.x) + ",0)";
                });
                barsRoot.transition().duration(_this._transitionDuration).attr("transform", function (d) {
                    return "translate(" + xScaleAdjusted(d.x) + ",0)";
                });
                barsRoot.exit().transition().remove();
                var bars = barsRoot.selectAll(".bar").data(function (d) {
                    return d.data;
                });
                bars.enter().append('rect').classed('bar', true).attr({
                    x: function (d, i) {
                        return xGroupScale(d.group);
                    },
                    width: function (d, i) {
                        return xGroupScale.rangeBand();
                    },
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
                        return height;
                    },
                });
                bars.exit().transition().duration(function (d, i) {
                    return functor(_this._removeTransitionDelay, d, i);
                }).ease(_this._transitionEase).attr({
                    y: function (d) {
                        if (d.yMax > 0) {
                            return yScale(0);
                        }
                        else {
                            return yScale(0);
                        }
                    },
                    height: function (d) {
                        return Math.abs(barScale(0));
                    },
                }).delay(function (d, i) {
                    return functor(_this._removeDelay, d, i);
                }).remove();
                var medianBar = barsRoot.selectAll(".bar-median").data(function (d) {
                    return d.data;
                });
                medianBar.enter().append('rect').classed('bar-median', true).attr({
                    x: function (d, i) {
                        return xGroupScale(d.group);
                    },
                    width: function (d, i) {
                        return xGroupScale.rangeBand();
                    },
                    y: yScale0,
                    height: 0,
                    fill: function (d, i) {
                        return functor(_this._itemFill2, d, i);
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
                medianBar.transition().duration(_this._transitionDuration).delay(function (d, i) {
                    return functor(_this._transitionDelay, d, i);
                }).ease(_this._transitionEase).style({
                    opacity: function (d, i) {
                        return functor(defaultBarOpacity, d, i);
                    },
                    stroke: function (d, i) {
                        return functor(defaultStroke, d, i);
                    },
                    fill: function (d, i) {
                        return functor(barFill2, d, i);
                    }
                }).attr({
                    y: function (d) {
                        if (d.yMax > 0) {
                            return yScale(d.yMed) - medianWidth / 2;
                        }
                        else {
                            return yScale(0);
                        }
                    },
                    height: function (d) {
                        return medianWidth;
                    },
                });
                medianBar.exit().transition().duration(function (d, i) {
                    return functor(_this._removeTransitionDelay, d, i);
                }).ease(_this._transitionEase).attr({
                    y: function (d) {
                        if (d.yMax > 0) {
                            return yScale(0);
                        }
                        else {
                            return yScale(0);
                        }
                    },
                    height: function (d) {
                        return Math.abs(barScale(0));
                    },
                }).delay(function (d, i) {
                    return functor(_this._removeDelay, d, i);
                }).remove();
                _this._plotLabels();
                _this._plotXAxis(xScale, yScale);
                _this._plotYAxis(xScale, yScale);
            });
        };
        return GroupedInterquartileChart;
    })(ninjaPixel.Chart);
    ninjaPixel.GroupedInterquartileChart = GroupedInterquartileChart;
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
                }
                else {
                }
                if (_this._y1Min != null) {
                    minData = _this._y1Min;
                }
                else {
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
                        }
                        else {
                            return yScale(0);
                        }
                    },
                    height: function (d) {
                        barScale(5);
                    },
                });
                bars.exit().transition().style({
                    opacity: 0
                }).remove();
                _this._plotLabels();
                _this._plotXAxis(xScale, yScale);
                _this._plotYAxis(xScale, yScale);
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
                    xScale = d3.scale.log().domain([minX, maxX]);
                }
                else {
                    xScale = d3.scale.linear().domain([minX, maxX]);
                }
                xScale.range([0, _this._chartWidth]);
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
                    myToolTip.hide();
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
            this._lineDashArray = 'none';
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
            var onMouseover = this._onMouseover;
            var onMouseout = this._onMouseout;
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
                    xScale = d3.time.scale();
                }
                else {
                    xScale = d3.scale.linear();
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
                    yScale = d3.scale.log().domain([minY, maxY]).range([_this._chartHeight, 0]);
                }
                else {
                    yScale = d3.scale.linear().domain([minY, maxY]).range([_this._chartHeight, 0]);
                }
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
                    }
                    else if (maxY < 0) {
                        return yScale(maxY);
                    }
                    else {
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
                areaSvg.exit().transition().duration(function (d, i) {
                    return functor(_this._transitionDuration, d, i);
                }).ease('linear').style('opacity', 0).remove();
                var lineSvg = _this._svg.select('.ninja-chartGroup').call(myToolTip).selectAll('path.line').data(_data, function (d) {
                    return d.name;
                });
                lineSvg.enter().append('svg:path').attr('class', 'line').on('mouseover', function (d) {
                    myToolTip.show(d);
                    onMouseover(d);
                }).on('mouseout', function (d) {
                    myToolTip.hide();
                    onMouseout(d);
                }).style({
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
                    },
                    'stroke-dasharray': function (d, i) {
                        return functor(_this._lineDashArray, d, i);
                    },
                    'stroke-width': function (d, i) {
                        return functor(_this._itemStrokeWidth, d, i);
                    }
                });
                lineSvg.exit().transition().duration(function (d, i) {
                    return functor(_this._transitionDuration, d, i);
                }).ease(_this._transitionEase).style('opacity', 0).remove();
                _this._plotLabels();
                _this._plotXAxis(xScale, yScale);
                _this._plotYAxis(xScale, yScale);
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
                _this._init(_selection, 1 /* donut */);
                var arc = d3.svg.arc().outerRadius(_this._outerRadius).innerRadius(_this._innerRadius);
                var pie = d3.layout.pie().sort(null).value(function (d) {
                    return d.y;
                });
                var path = _this._svg.select('.ninja-chartGroup').selectAll('path').data(pie(_data));
                path.enter().append('path').style({
                    opacity: function (d, i) {
                        return _this._functor(_this._itemOpacity, d, i);
                    },
                    stroke: function (d, i) {
                        return _this._functor(_this._itemStroke, d, i);
                    },
                    fill: function (d, i) {
                        return _this._functor(_this._itemFill, d, i);
                    }
                }).attr('d', arc).each(function (d) {
                    this._current = d;
                });
                path.transition().duration(_this._transitionDuration).style({
                    opacity: function (d, i) {
                        return _this._functor(_this._itemOpacity, d, i);
                    },
                    stroke: function (d, i) {
                        return _this._functor(_this._itemStroke, d, i);
                    },
                    fill: function (d, i) {
                        return _this._functor(_this._itemFill, d, i);
                    }
                }).attr('d', arc).attrTween('d', arcTween);
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
                    var labels = that._svg.select('.ninja-chartGroup').selectAll('text.donut-label').data(pie(_data));
                    labels.enter().append('text').classed('donut-label', true).attr('dy', '.35em').style('text-anchor', 'middle').attr('transform', function (d) {
                        return 'translate(' + arc.centroid(d) + ')';
                    });
                    labels.transition().duration(that._transitionDuration).attr('transform', function (d) {
                        return 'translate(' + arc.centroid(d) + ')';
                    }).text(function (d) {
                        return d.data.x;
                    });
                    labels.exit().transition().duration(that._transitionDuration).remove();
                }
            });
        };
        return Donut;
    })(ninjaPixel.Chart);
    ninjaPixel.Donut = Donut;
})(ninjaPixel || (ninjaPixel = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ninjaPixel;
(function (ninjaPixel) {
    var Lollipop = (function (_super) {
        __extends(Lollipop, _super);
        function Lollipop() {
            _super.call(this);
            this._stickWidth = 6;
            this._headRadius = 20;
            this._headFill = 'white';
            this._headStroke = 'none';
            this._headOpacity = 1;
            this._headToolTip = d3.tip().attr('class', 'd3-tip').offset([-10, 0]).transitionDuration(300).html(function () {
                return 'Tooltip HTML not defined';
            }).direction('n');
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
            this._itemFill = _x;
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
                var superXScale = _this._xScaleAdjusted;
                var dx = _this._stickWidth / 2;
                function xScale(x) {
                    return superXScale(x) + dx;
                }
                var yScale = _this._yScale;
                var barScale = _this._barScale;
                var yScale0 = yScale(0);
                var bubbles = _this._svg.select('.ninja-chartGroup').call(myToolTip).selectAll('.lollipop-head').data(_data);
                bubbles.enter().append('circle').classed('lollipop-head', true).attr({
                    r: _this._headRadius
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
                }).attr({
                    cx: function (d) {
                        return xScale(d.x);
                    },
                    cy: function (d) {
                        return yScale(0);
                    },
                    r: _this._headRadius
                });
                ;
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
                        return functor(_this._headFill, d, i);
                    }
                }).attr({
                    cx: function (d) {
                        return xScale(d.x);
                    },
                    cy: function (d) {
                        return yScale(d.y);
                    },
                    r: _this._headRadius
                });
                bubbles.exit().transition().style({
                    opacity: 0
                }).remove();
            });
        };
        return Lollipop;
    })(ninjaPixel.BarChart);
    ninjaPixel.Lollipop = Lollipop;
})(ninjaPixel || (ninjaPixel = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ninjaPixel;
(function (ninjaPixel) {
    var SimpleTreemap = (function (_super) {
        __extends(SimpleTreemap, _super);
        function SimpleTreemap() {
            _super.call(this);
        }
        SimpleTreemap.prototype.plot = function (_selection) {
            var _this = this;
            this._init(_selection, 3 /* simpleTreemap */);
            function position() {
                this.style('left', function (d) {
                    return d.x + 'px';
                }).style('top', function (d) {
                    return d.y + 'px';
                }).style('width', function (d) {
                    return Math.max(0, d.dx - 1) + 'px';
                }).style('height', function (d) {
                    return Math.max(0, d.dy - 1) + 'px';
                });
            }
            var color = d3.scale.category20c();
            _selection.each(function (_data) {
                var myTreemap = d3.layout.treemap();
                var treemapLayout = myTreemap.size([_this._chartWidth, _this._chartHeight]).sticky(true).value(function (d) {
                    return d.size;
                });
                var treemap = _this._svg.select('.ninja-containerGroup').append('div').style('position', 'relative').datum(_data).selectAll('.treemap-node').data(treemapLayout.nodes);
                treemap.enter().append('div').attr('class', 'treemap-node').call(position).style('background', function (d) {
                    var bgColor = d.children ? color(d.name) : null;
                    return bgColor;
                }).text(function (d) {
                    return d.children ? null : d.name;
                });
                treemap.transition().duration(_this._transitionDuration).call(position);
            });
        };
        return SimpleTreemap;
    })(ninjaPixel.Chart);
    ninjaPixel.SimpleTreemap = SimpleTreemap;
})(ninjaPixel || (ninjaPixel = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ninjaPixel;
(function (ninjaPixel) {
    var Treemap = (function (_super) {
        __extends(Treemap, _super);
        function Treemap() {
            _super.call(this);
            this._nodeText = '';
            this._itemFontSize = '8px';
            this._itemTextOffsetLeft = 1;
            this._itemTextOffsetTop = 10;
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
            this._init(_selection, 2 /* treemap */);
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
            _selection.each(function (_data) {
                var myTreemap = d3.layout.treemap();
                var treemapLayout = myTreemap.size([_this._chartWidth, _this._chartHeight]).sticky(true).value(function (d) {
                    return d.size;
                });
                var treemapNode = _this._svg.select('.ninja-chartGroup').call(myToolTip).datum(_data).selectAll('.treemap-node').data(treemapLayout.nodes);
                var treemapText = _this._svg.select('.ninja-chartGroup').call(myToolTip).datum(_data).selectAll('.treemap-text').data(treemapLayout.nodes);
                var drawEmptyTreemap = false;
                if (_data.area == 0) {
                    console.log('The data area is 0. Cannot draw a treemap.');
                    drawEmptyTreemap = true;
                }
                treemapNode.enter().append('rect').attr('class', 'treemap-node').attr({
                    x: function (d) {
                        return d.x;
                    },
                    width: function (d) {
                        return Math.max(0, d.dx - 1);
                    },
                    y: function (d) {
                        return d.y;
                    },
                    height: 0,
                    fill: function (d, i) {
                        return functor(nodeFill, d, i);
                    }
                }).style({
                    opacity: function (d, i) {
                        return functor(defaultOpacity, d, i);
                    },
                    stroke: function (d, i) {
                        return functor(defaultStroke, d, i);
                    }
                }).on('mouseover', function (d, i) {
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
                }).on('mouseout', function (d, i) {
                    d3.select(this).style({
                        opacity: function (d, i) {
                            return functor(defaultOpacity, d, i);
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
                treemapNode.transition().duration(_this._transitionDuration).attr({
                    x: function (d) {
                        return d.x;
                    },
                    width: function (d) {
                        if (drawEmptyTreemap) {
                            return 0;
                        }
                        return Math.max(0, d.dx - 1);
                    },
                    y: function (d) {
                        return d.y;
                    },
                    height: function (d) {
                        if (drawEmptyTreemap) {
                            return 0;
                        }
                        return Math.max(0, d.dy - 1);
                    },
                    fill: function (d, i) {
                        return functor(_this._itemFill, d, i);
                    }
                }).style({
                    opacity: function (d, i) {
                        return functor(defaultOpacity, d, i);
                    },
                    stroke: function (d, i) {
                        return functor(defaultStroke, d, i);
                    }
                });
                treemapNode.exit().transition().remove();
                treemapText.enter().append('text').attr('class', 'treemap-text').attr({
                    fill: function (d, i) {
                        return functor(_this._itemTextLabelColor, d, i);
                    },
                }).style({
                    opacity: function (d, i) {
                        return functor(defaultOpacity, d, i);
                    },
                }).on('mouseover', function (d, i) {
                    d3.select(this);
                    myToolTip.show(d);
                    onMouseover(d);
                }).on('mouseout', function (d, i) {
                    d3.select(this);
                    myToolTip.hide();
                    onMouseout(d);
                }).on('click', function (d, i) {
                    onClick(d);
                });
                treemapText.transition().duration(_this._transitionDuration).attr({
                    x: function (d, i) {
                        return d.x + functor(nodeTextOffsetLeft, d, i);
                    },
                    y: function (d, i) {
                        return d.y + functor(nodeTextOffsetTop, d, i);
                    },
                    'font-size': function (d, i) {
                        if (drawEmptyTreemap) {
                            return 0;
                        }
                        return functor(fontSize, d, i);
                    }
                }).text(function (d, i) {
                    return functor(nodeText, d, i);
                });
                treemapText.exit().transition().remove();
            });
        };
        return Treemap;
    })(ninjaPixel.Chart);
    ninjaPixel.Treemap = Treemap;
})(ninjaPixel || (ninjaPixel = {}));
