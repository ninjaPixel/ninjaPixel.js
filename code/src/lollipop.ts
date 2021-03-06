namespace ninjaPixel {

    export class Lollipop extends ninjaPixel.BarChart {
        constructor() {
            super();
        }


        _stickWidth: number = 6;

        stickWidth(_x: number): any {
            if (!arguments.length) return this._stickWidth;
            this._stickWidth = _x;
            return this;
        }

        _headRadius: number = 20;

        headRadius(_x: number): any {
            if (!arguments.length) return this._headRadius;
            this._headRadius = _x;
            return this;
        }

        _headFill: any = 'white';

        headFill(_x): any {
            if (!arguments.length) return this._headFill;
            this._headFill = _x;
            return this;
        }

        _headStroke: any = 'none';

        headStroke(_x): any {
            if (!arguments.length) return this._headStroke;
            this._headStroke = _x;
            return this;
        }

        _headOpacity: any = 1;

        headOpacity(_x): any {
            if (!arguments.length) return this._headOpacity;
            this._headOpacity = _x;
            return this;
        }

        _headMouseOverItemOpacity: any;

        headMouseOverItemOpacity(_x): any {
            if (!arguments.length) return this._itemFill;
            this._headMouseOverItemOpacity = _x;
            return this;
        }

        _headMouseOverStroke: any;

        headMouseOverStroke(_x): any {
            if (!arguments.length) return this._headMouseOverStroke;
            this._headMouseOverStroke = _x;
            return this;
        }

        _headToolTip: any = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            // .transitionDuration(300)
            .html(function() {
                return 'Tooltip HTML not defined';
            })
            .direction('n');

        headToolTip(_x): any {
            if (!arguments.length) return this._headToolTip;
            this._headToolTip = _x;
            return this;
        }

        plot(_selection) {

            _selection.each((_data) => {
                super.plot(_selection, this._stickWidth);

                let functor = this._functor;
                let mouseOverOpacity = this._headMouseOverItemOpacity;
                let mouseOverStroke = this._headMouseOverStroke;
                let itemOpacity = this._headOpacity
                let onMouseover = this._onMouseover;
                let onMouseout = this._onMouseout;
                let onClick = this._onClick;
                let itemStroke: any = this._headStroke;
                let myToolTip = this._headToolTip; //need to reference this variable in local scope as when I come to call the tooltip, it is within a function that is referencing a differnt 'this'
                const genericMouseoverBehaviour = this._genericMouseoverBehaviour.bind(this);
                const genericMouseoutBehaviour = this._genericMouseoutBehaviour.bind(this);

                const superXScale = this._xScaleAdjusted;

                let dx = this._stickWidth / 2;

                function xScale(x) {
                    return superXScale(x) + dx;
                }

                var yScale = this._yScale;
                var barScale = this._barScale;

                // Enter, Update, Exit on lollipop heads
                var yScale0 = yScale(0);
                var bubbles = this._svg.select('.ninja-chartGroup')
                    .call(myToolTip)
                    .selectAll('.lollipop-head')
                    .data(_data);

                // enter
                const enterBubbles = bubbles.enter().append('circle')
                    .classed('lollipop-head', true)
                    .on('mouseover', function(d, i) {
                        genericMouseoverBehaviour(this, d, i, mouseOverOpacity, mouseOverStroke)
                    })
                    .on('mouseout', function(d, i) {
                        genericMouseoutBehaviour(this, d, i, itemOpacity,itemStroke);
                    })
                    .on('click', function(d) {
                        onClick(d);
                    })
                    .attrs({
                        cx: (d) => {
                            return xScale(d.x);
                        },
                        cy: (d) => {
                            return yScale(0);
                        },
                        r: 1

                    });


                bubbles.merge(enterBubbles).transition()
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
                            return functor(this._headFill, d, i);
                        }
                    })
                    .attrs({
                        cx: (d) => {
                            return xScale(d.x);
                        },
                        cy: (d) => {
                            return yScale(d.y);
                        },
                        r: this._headRadius

                    });

                bubbles.exit()
                    .transition()
                    .styles({
                        opacity: 0
                    })
                    .remove();


                // end _data loop
            });
            // end plot funtion
        }
    }
}
