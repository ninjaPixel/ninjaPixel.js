/// <reference path="typescript_definitions/d3.d.ts" />
/// <reference path="chart.ts" />
/// <reference path="barChart.ts" />
//declare var d3: D3.Base;
module ninjaPixel{
    interface barChartDataItem {
        color?: string;
        x: string;
        y: number;        
    }
    
    export class StackedBarChart extends ninjaPixel.BarChart{
        constructor(){
            super();
        }
        
        plot(_selection){
            this._init(_selection);
            
            var functor = this._functor;
            var myToolTip = this._toolTip; //need to reference this variable in local scope as when I come to call the tooltip, it is within a function that is referencing a differnt 'this'
            var onMouseover = this._onMouseover;
            var onMouseout = this._onMouseout;
            var onClick = this._onClick;
            var mouseOverBarOpacity: any = this._mouseOverItemOpacity;
            var defaultBarOpacity: any = this._itemOpacity;
            var mouseOverBarStroke = this._mouseOverItemStroke;
            var defaultStroke = this._itemStroke;
            var barFill = this._itemFill;
            
            _selection.each((_data) => {
             
                var stack = d3.layout.stack();
                    stack(_data.data);
                
                console.log('this is the stack', _data);
                                
                var minData:any = 0;
                var maxData:any = 0;
            
                if(this._y1Max != null){
                  maxData = this._y1Max;  
                } else{
                    
                }
                
                if(this._y1Min != null){
                    minData = this._y1Min;
                } else {
                    
                }
                
                console.log('maxData',maxData,'minData',minData);
                
            var xScale = d3.scale.ordinal()
                .domain(_data.data[0].map(function (d, i) {
                    return d.x;
                }))
                .rangeRoundBands([0, this._chartWidth], 0);
            var barWidth = xScale.rangeBand();

            var yScale = d3.scale.linear()
                .domain([minData, maxData])
                .range([this._chartHeight, 0]);
                
            var barScale = d3.scale.linear()
                .domain([Math.abs(maxData - minData), 0])
                .range([this._chartHeight, 0]);
            
                
            // Enter, Update, Exit on bars
            var yScale0 = yScale(0);
            var bars = this._svg.select('.ninja-chartGroup')
                .call(myToolTip)
                .selectAll('.bar')
                .data(_data);
            
            bars.enter().append('rect')
                .classed('bar', true)
                .attr({
                    x: function (d, i) {
                        return xScale(d.data.x);
                    },
                    width: barWidth,
                    y: yScale0,
                    height: 0,
                    fill: (d, i) => {return functor(this._itemFill, d, i)},
                    rx: this._cornerRounding,
                    ry: this._cornerRounding
                })
                .on('mouseover', function (d, i) {
                    d3.select(this)
                        .style({
                            opacity: (d, i) => { return functor(mouseOverBarOpacity, d, i);},
                            stroke:  (d,i) => {return functor(mouseOverBarStroke, d, i);}
                        });
                    myToolTip.show(d); 
                    onMouseover(d);
                })
                .on('mouseout', function (d, i) {
                    d3.select(this)
                        .style({
                            opacity: (d, i) => {return functor(defaultBarOpacity,d, i);}, // Re-sets the opacity
                            stroke:  (d,i) => {return functor(defaultStroke, d, i);}
                        });
                    myToolTip.hide();
                    onMouseout(d);
                })
                .on('click', function (d, i) {
                    onClick(d);
                });

            bars.transition()
                .duration(this._transitionDuration)
                .delay((d,i) => {return functor(this._transitionDelay, d, i);})
                .ease(this._transitionEase)
                .style({
                    opacity:    (d,i) => {return functor(defaultBarOpacity, d, i);} ,
                    stroke:     (d,i) => {return functor(defaultStroke, d, i);},
                    fill:       (d,i) => {return functor(barFill,d,i);}
                })
                .attr({
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
                        barScale(5);//return Math.abs(barScale(d.y));
                    },
                });
                
            bars.exit()
                .transition()
                .style({
                opacity: 0
                })
                .remove();   
                                
            this._plotLabels();
            this._plotXAxis(xScale, yScale);
            this._plotYAxis(xScale, yScale); 
            this._plotGrids(xScale, yScale);    
                // end _data loop
            });
            
        }
    }
    
}