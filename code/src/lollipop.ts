/// <reference path="typescript_definitions/d3.d.ts" />
/// <reference path="chart.ts" />
/// <reference path="barChart.ts" />
//declare var d3: D3.Base;
module ninjaPixel{

    export class Lollipop extends ninjaPixel.BarChart{
        constructor(){ super();}
        
        _stickWidth: number = 6;
        stickWidth(_x: number):any {
            if (!arguments.length) return this._stickWidth;
            this._stickWidth = _x;
            return this;
        }
        
        _headRadius: number = 20;
        headRadius(_x: number):any {
            if (!arguments.length) return this._headRadius;
            this._headRadius = _x;
            return this;
        }
        
        plot(_selection){
            
            _selection.each((_data) => {
            super.plot(_selection, this._stickWidth);
            console.log('yScale(3)', this._yScale(3));
                console.log('xScale(Strawberry)', this._xScale('Strawberry'));
            var functor = this._functor;
//            var rScale0 = rScale(0);
            var mouseOverOpacity = this._mouseOverItemOpacity;
            var mouseOverStroke = this._mouseOverItemStroke;
            var itemOpacity = this._itemOpacity;
            var onMouseover = this._onMouseover;
            var onMouseout = this._onMouseout;
            var onClick = this._onClick;
            var itemStroke: any = this._itemStroke;
            var myToolTip = this._toolTip; //need to reference this variable in local scope as when I come to call the tooltip, it is within a function that is referencing a differnt 'this'

            var superXScale = this._xScaleAdjusted;
            var nudge = this._stickWidth/2;
            function xScale(x)  { return superXScale(x) + nudge;}
            var yScale = this._yScale;
            var barScale = this._barScale;
                
            // Enter, Update, Exit on lollipop heads
            var yScale0 = yScale(0);
            var bubbles = this._svg.select('.ninja-chartGroup')
                .call(myToolTip)
                .selectAll('.bubble')
                .data(_data);
            
            // enter
            bubbles.enter().append('circle')
                .classed('bubble', true)
                .attr({
                    r: this._headRadius
                })
                .on('mouseover', function (d) {
                    d3.select(this)
                        .style({
                            opacity: (d, i) => {return functor(mouseOverOpacity, d, i);}, // Re-sets the opacity of the circle
                            stroke: (d, i) => {return functor(mouseOverStroke, d, i);}
                        });
                    myToolTip.show(d); 
                    onMouseover(d);
                })
                .on('mouseout', function (d) {
                    d3.select(this)
                        .style({
                            opacity: (d, i) => {return functor(itemOpacity, d, i);}, // Re-sets the opacity of the circle
                            stroke: (d, i) => {return functor(itemStroke, d, i);}
                        });
                    myToolTip.hide(d);
                    onMouseout(d);
                })
                .on('click', function (d) {
                    onClick(d);
                })
                .attr({
                    cx: (d) => {
                        return xScale(d.x);// + this._stickWidth/2;
                    },
                    cy: (d) => {
                        return yScale(0);
                    },
                    r:  this._headRadius
                    
                });;

            bubbles.transition()
                .duration(this._transitionDuration)
                .delay((d,i) => {return functor(this._transitionDelay, d, i);})
                .ease(this._transitionEase)
                .style({
                        opacity:    (d, i) => {return functor(itemOpacity, d, i);}, // Re-sets the opacity of the circle
                        stroke:     (d, i) => {return functor(itemStroke, d, i);},
                        fill:       (d, i) => {return functor(this._itemFill, d, i);}
                    })
                .attr({
                    cx: (d) => {
//                        return xScale(d.x) + this._stickWidth/2;
                        return xScale(d.x);
                    },
                    cy: (d) => {
                        return yScale(d.y);
                    },
                    r:  this._headRadius
                    
                });

            bubbles.exit()
                .transition()
                .style({
                opacity: 0
                })
                .remove(); 
            
            
                // end _data loop
            });
            // end plot funtion
        }
    }
}