/// <reference path="typescript_definitions/d3.d.ts" />
/// <reference path="chart.ts" />
module ninjaPixel{
    interface barChartDataItem {
        x: string;
        y: number;        
    }

    export class BarChartSimpleExample extends ninjaPixel.Chart {        
        constructor() {             
            super(); 
        }
        
        plot(_selection) {  
            // call init to prepare the SVG
            this._init(_selection);
            var functor = this._functor;
            
            _selection.each((_data) => {
                var barW: number = this._chartWidth / _data.length; 
                var minData:any = 0;
                var maxData:any = 0;
            
                if(this._y1Max != null){
                  maxData = this._y1Max;  
                } else{
                    var d3MaxY = d3.max(_data, (d:barChartDataItem) => d.y);                
                    if(d3MaxY > 0){
                        maxData = d3MaxY;   
                    }
                }
                
                if(this._y1Min != null){
                    minData = this._y1Min;
                } else {
                    var d3MinY = d3.min(_data, (d:barChartDataItem) => d.y);
                    if(d3MinY < 0){
                        minData = d3MinY;   
                    }
                }
                
            var xScale = d3.scale.ordinal()
                .domain(_data.map(function (d, i) {
                    return d.x;
                }))
                .rangeRoundBands([0, this._chartWidth], 0);

            var yScale = d3.scale.linear()
                .domain([minData, maxData])
                .range([this._chartHeight, 0]);
                
            var barScale = d3.scale.linear()
                .domain([Math.abs(maxData - minData), 0])
                .range([this._chartHeight, 0]);

                
            // Enter, Update, Exit on bars
            var yScale0 = yScale(0);
            var bars = this._svg.select('.ninja-chartGroup')
                .selectAll('.bar')
                .data(_data);
            
            bars.enter().append('rect')
                .classed('bar', true)
                .attr({
                    x: (d, i) => { return xScale(d.x);},
                    width: barW * 0.95,
                    y: yScale0,
                    height: 0,
                    fill: (d, i) =>{ return functor(this._itemFill, d, i)},
                });
                

            bars.transition()
                .duration(this._transitionDuration)
                .delay((d,i) => {return functor(this._transitionDelay, d, i);})
                .ease(this._transitionEase)
                .style({
                    fill: (d,i) => {return functor(this._itemFill,d,i);}
                })
                .attr({
                    x: (d, i) => { return xScale(d.x);},
                    width: barW * 0.9,
                    y: (d) => {
                        if (d.y > 0) {
                            return yScale(d.y);
                        } else {
                            return yScale(0);
                        }
                    },
                    height: (d) => { return Math.abs(barScale(d.y));}
                });
                
            bars.exit()
                .transition()
                .style({
                opacity: 0
                })
                .remove();   
              
            
            // let the _Chart class take care of the plumbing.   
            this._plotLabels();
            this._plotXAxis(xScale, yScale);
            this._plotYAxis(xScale, yScale); 
            this._plotGrids(xScale, yScale);
                
            // end data loop
            });
            //end BarChart            
        }
    }
}