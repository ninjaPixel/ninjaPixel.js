/// <reference path="typescript_definitions/d3.d.ts" />
/// <reference path="chart.ts" />
// declare var d3: D3.Base;
module ninjaPixel{
     
    export class Treemap extends ninjaPixel.Chart{
        constructor(){
            super();
        }
        
        private _nodeText: any = '';
        nodeText(_x): any{
            if (!arguments.length) return this._nodeText;
            this._nodeText = _x;
            return this;
        }    
        
        private _itemFontSize: any = '8px';
        itemFontSize(_x): any{
            if (!arguments.length) return this._itemFontSize;
            this._itemFontSize = _x;
            return this;
        } 
        
        private _itemTextOffsetLeft: any = 1;
        itemTextOffsetLeft(_x): any{
            if (!arguments.length) return this._itemTextOffsetLeft;
            this._itemTextOffsetLeft = _x;
            return this;
        } 
        private _itemTextOffsetTop:any = 10;
        itemTextOffsetTop(_x): any{
            if (!arguments.length) return this._itemTextOffsetTop;
            this._itemTextOffsetTop = _x;
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

            

            _selection.each((_data) => {
                
                
                var treemapLayout = d3.layout.treemap()
                    .size([this._chartWidth, this._chartHeight])
                    .sticky(true)
                    .value(function(d) {
                        return d.size;
                    });
                
                var treemapNode = this._svg.select('.ninja-chartGroup')
                    .call(myToolTip)
                    .datum(_data)
                    .selectAll('.treemap-node')                        
                    .data(treemapLayout.nodes);
                
        
                treemapNode.enter().append('rect')
                    .attr('class', 'treemap-node')
                    .attr({
                        x: (d) => { return d.x;},
                        width: (d) => { return Math.max(0, d.dx - 1);},
                        y: (d) => { return d.y;},
                        height: 0,
                        fill: (d, i) => {return functor(nodeFill, d, i);}
                    })
                    .style({
                        opacity: (d, i) => {return functor(defaultOpacity,d, i);}, // Re-sets the opacity
                        stroke:  (d,i) => {return functor(defaultStroke, d, i);}
                    })
                    .on('mouseover', function (d, i) {
                        d3.select(this)
                            .style({
                                opacity: (d, i) => { return functor(mouseOverOpacity, d, i);},
                                stroke:  (d,i) => {return functor(mouseOverStroke, d, i);}
                            });
                        myToolTip.show(d); 
                        onMouseover(d);
                    })
                    .on('mouseout', function (d, i) {
                        d3.select(this)
                            .style({
                                opacity: (d, i) => {return functor(defaultOpacity,d, i);}, // Re-sets the opacity
                                stroke:  (d,i) => {return functor(defaultStroke, d, i);}
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
                        x: (d) => { return d.x;},
                        width: (d) => { return Math.max(0, d.dx - 1);},
                        y: (d) => { return d.y;},
                        height: (d) => { return Math.max(0, d.dy - 1);},
                        fill: (d, i) => {return functor(this._itemFill, d, i);}
                    })
                    .style({
                        opacity: (d, i) => {return functor(defaultOpacity,d, i);}, // Re-sets the opacity
                        stroke:  (d,i) => {return functor(defaultStroke, d, i);}
                    });                
                
                
                treemapNode.exit().transition().remove();
                
        
                
                var treemapText = this._svg.select('.ninja-chartGroup')
                    .call(myToolTip)
                    .datum(_data)
                    .selectAll('.treemap-text')                        
                    .data(treemapLayout.nodes);
                
                treemapText.enter().append('text')
                    .attr('class', 'treemap-text')
                    .attr({
                        fill: (d, i) => {return functor(this._itemTextLabelColor, d, i);},
                    })
                    .style({
                        opacity: (d, i) => {return functor(defaultOpacity,d, i);}, // Re-sets the opacity
                    })
                    .on('mouseover', function (d, i) {
                        d3.select(this)
                        myToolTip.show(d); 
                        onMouseover(d);
                    })
                    .on('mouseout', function (d, i) {
                        d3.select(this)
                        myToolTip.hide();
                        onMouseout(d);
                    })
                    .on('click', function (d, i) {
                        onClick(d);
                    });

                treemapText.transition()
                    .duration(this._transitionDuration)
                    .attr({
                        x: (d, i) => { return d.x + functor(nodeTextOffsetLeft, d, i);},
                        y: (d, i) => { return d.y + functor(nodeTextOffsetTop, d, i);},
                        'font-size': (d, i) => { return functor(fontSize, d, i);}
                    })
                    .text(function(d, i) {
                        return functor(nodeText, d, i);
                    }); 
                
                treemapText.exit().transition().remove();
            });
        }
    }
}