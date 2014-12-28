/// <reference path="typescript_definitions/d3.d.ts" />
declare var d3: D3.Base;
declare module D3 {
    export interface Base{
        tip: any;
    }
}
interface marginObject {
        top: number;
        bottom: number;
        left: number;        
        right: number;
    }
interface axesOriginObject {
        x: any;
        y: any;        
    }


module ninjaPixel{
export class _Chart {
    // gettable / settable variables
    _width: number = 800;
    _height: number = 600;
    _margin: marginObject = {
        top: 10,
        bottom: 10,
        left: 40,
        right: 5
    };
    _axesOrigin: axesOriginObject;// ={
//        x: 0,
//        y: 0
//    }
    _title: string = '';
    _yAxis1Title: string = '';
    _yAxis2Title: string = '';
    _xAxisTitle: string = '';
    _transitionDuration: number = 300; 
    _transitionEase: string = 'linear';
    _transitionDelay:any = 0;// function or value
    _labelEase: string = 'linear';
    _plotHorizontalGrid: boolean = false;
    _plotHorizontalGridTopping: boolean = false;
    _plotVerticalGrid: boolean = false;
    _plotVerticalGridTopping: boolean = false;
    _showToolTip: boolean = false;
    _svg: any;
    _xAxisTextTransform: string;
    _xAxisTickFormat: any;
    _onMouseover: any = ()=>{};
    _onMouseout: any = ()=>{};
    _onClick: any = ()=>{};
    _plotBackground: boolean = false;
    _y1Max: number;
    _y2Max:number;
    _y1Min: number;
    _y2Min:number;
    _xMax:any; 
    _xMin:any;
    _mouseOverItemOpacity: any = 0.3;// function or value
    _mouseOverItemStroke: any = 'none';// function or value
    _itemOpacity: any = 1;// function or value
    _itemStroke: any = 'none'; // function or value
    _itemFill: any = '#A7EBCA'; // function or value
    _toolTip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .transitionDuration(300)
        .html(function () {
            return 'Tooltip HTML not defined';
        })
        .direction('n');

    // internal variables
    _chartHeight: number;
    _chartWidth: number;
    
    constructor() {

    }
    
    _init(_selection: any){
        this._chartHeight = this._getChartHeight();
        this._chartWidth = this._getChartWidth();
        
         if(!this._svg){           
            this._svg = _selection //d3.select(selection)
                .append('svg')
                .classed('ninja-chart', true);
            var container = this._svg.append('g').classed('ninja-containerGroup', true);
            container.append('g').classed('ninja-backgroundGroup', true);
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

        this._svg.select('.ninja-containerGroup')
            .attr({
                transform: 'translate(' + this._margin.left + ',' + this._margin.top + ')'
        });
        
        this._plotTheBackground();
    }
    
    _plotXAxis(xScale: any, yScale: any){
        var xAxis = d3.svg.axis()
            .scale(xScale)
            .orient('bottom')
            .outerTickSize(0); // remove that presky final tick
        
        if(this._xAxisTickFormat != null){
            xAxis.tickFormat(this._xAxisTickFormat); 
        }
        
        this._svg.select('.ninja-xAxisGroup.ninja-axis')
//            .transition()
//            .ease(this._labelEase)
            .attr({
                transform: ()=>{
                    if(this._axesOrigin!=null){ 
                        return 'translate(0,' + yScale(this._axesOrigin.y) + ')';
                    }else{
                        return 'translate(0,' + (this._chartHeight) + ')';
                    }
                }
            })
            .call(xAxis);   
        
        if (this._xAxisTextTransform != null) {
            this._svg.selectAll('.tick text')
                .text(function (d) {
                    return d;
                })
                .style('text-anchor', 'end')
                .attr('transform', this._xAxisTextTransform);
            }
    }
    
    _plotYAxis(xScale:any, yScale: any){
            var yAxis = d3.svg.axis()
                .scale(yScale)
                .orient('left')
                .outerTickSize(0); // remove that presky final tick;
                
             this._svg.select('.ninja-yAxisGroup.ninja-axis')
                .transition()
                .ease(this._labelEase)
                .attr({
                    transform: ()=>{
                        if(this._axesOrigin!=null){ 
                            return 'translate(' + xScale(this._axesOrigin.x) + ',0)';
                        }
                    }
                })
                .call(yAxis);
    }
    
    _plotLabels(){
        if (this._svg.select('.ninja-chartTitle')[0][0] == null) {
            // first call, so we'll append the extra title elements.
            this._svg.append("g").classed("ninja-chartTitle", true);
            this._svg.append("g").classed("ninja-y1Title", true);
            this._svg.append("g").classed("ninja-y2Title", true);
            this._svg.append("g").classed("ninja-xTitle", true);
        } 
      
        var arr = [0];
        
        // main chart title
        var titleSvg = this._svg.select(".ninja-chartTitle")
            .selectAll("text.ninja-chartTitle")
            .data(arr);
        // enter
        titleSvg.enter().append("text")
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
        titleSvg.transition()
            .duration(this._transitionDuration)
            .text(this._title);

        
        // y title
        var yTitleSvg1 = this._svg.select(".ninja-y1Title")
            .selectAll("text.ninja-y1Title")
            .data(arr);
        // enter
        yTitleSvg1.enter().append("text")
            .attr("class", "ninja-y1Title")
            .attr('transform', 'rotate(-90)')
            .style('text-anchor', 'middle');
        // exit
        yTitleSvg1.exit().transition()
            .duration(this._transitionDuration)
            .remove();
        // transition
        yTitleSvg1.transition()
            .duration(this._transitionDuration)
            .text(this._yAxis1Title)
            .attr('x', -(this._chartHeight / 2)-this._margin.top)
            .attr('y', (this._margin.left * 0.4));
        
        // x title
        var xTitleSvg = this._svg.select(".ninja-xTitle")
            .selectAll("text.ninja-xTitle").data(arr);
        // enter
        xTitleSvg.enter().append("text")
            .attr("class", "ninja-xTitle")
            .style('text-anchor', 'middle');
        // exit
        xTitleSvg.exit().transition()
            .duration(this._transitionDuration)
            .remove();
        // transition
        xTitleSvg.transition()
            .duration(this._transitionDuration)
            .text(this._xAxisTitle)
            .attr('y', this._chartHeight + this._margin.top + this._margin.bottom/2)
            .attr('x', (this._chartWidth / 2) + this._margin.left);
    }
    
    _getChartWidth(): number{
        return this._width - this._margin.left - this._margin.right;
    }
    _getChartHeight(): number{
        return this._height - this._margin.bottom - this._margin.top;   
    }

    _plotGrids(xScale, yScale){
        // 'this' won't work inside plotHGrid, so extract the values here.
        var svg = this._svg;
        var chartWidth = this._chartWidth;
        var chartHeight = this._chartHeight;
        var ease = this._labelEase;
        
        function plotHGrid(yScale,className) {
                var horizontalLines = svg.select('.'+className)
                     .selectAll('hLines')
                     .data(yScale.ticks());

                horizontalLines.enter()
                    .append('line')
                    .classed('hLines', true);

                horizontalLines.transition()
                    .ease(ease)
                    .attr({
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
             
        };
        
        function plotVGrid(xScale,className) {
            var verticalLines = svg.select('.'+className)
                 .selectAll('hLines')
                 .data(xScale.ticks());

            verticalLines.enter()
                .append('line')
                .classed('hLines', true);

            verticalLines.transition()
                .ease(ease)
                .attr({
                    "x1": (d) => {return xScale(d);},
                    "x2": (d) => {return xScale(d);},
                    "y1": 0,
                    "y2": chartHeight
                });

             verticalLines.exit()
                .remove();
             
        };
        
        if(this._plotHorizontalGrid){
            plotHGrid(yScale,'ninja-horizontalGrid');
        }
        if(this._plotHorizontalGridTopping){
            plotHGrid(yScale,'ninja-horizontalGridTopping');
        }
        if(this._plotVerticalGrid){
         plotVGrid(xScale, 'ninja-verticalGrid');
        }
        if(this._plotVerticalGridTopping){
         plotVGrid(xScale, 'ninja-verticalGridTopping');
        }
    }
    
    _plotTheBackground(){
        if(this._plotBackground == true){
            var background = this._svg.select('.ninja-backgroundGroup')
                .selectAll('.ninja-background')
                .data([1]);
                
            background.enter().append('rect')
                .classed('ninja-background',true)
                .attr({
                x:0,
                y:0,
                height: this._chartHeight,
                width: this._chartWidth});

               
            background.transition()
                .attr({
                x:0,
                y:0,
                height: this._chartHeight,
                width: this._chartWidth}); 

            background.exit()
                .remove();
        }
    }
    
    _functor(variable, d, i){
    // if variable is a function, then execute it. Otherwise just return the variable.
        function isFunction(functionToCheck) {
            //                    var getType = {};
            //                    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
            return !!(functionToCheck && functionToCheck.constructor && functionToCheck.call && functionToCheck.apply); // this is how underscore does it.
        }

        if(isFunction(variable)){
         return variable(d, i);   
        } else {
            return variable;
        }
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
    itemStroke(_x): any {
        if (!arguments.length) return this._itemStroke;
        this._itemStroke = _x;
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
    showToolTip(_x): any {
        if (!arguments.length) return this._showToolTip;
        this._showToolTip = _x;
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
    xAxisTextTransform(_x): any{
       if (!arguments.length) return this._xAxisTextTransform;
        this._xAxisTextTransform = _x;
        return this; 
    }
    xAxisTickFormat(_x): any{
       if (!arguments.length) return this._xAxisTickFormat;
        this._xAxisTickFormat = _x;
        return this; 
    }
    
}
}


