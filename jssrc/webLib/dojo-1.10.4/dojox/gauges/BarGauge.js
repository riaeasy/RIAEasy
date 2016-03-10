//>>built

define("dojox/gauges/BarGauge", ["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/html", "dojo/_base/event", "dojox/gfx", "./_Gauge", "./BarLineIndicator", "dojo/dom-geometry"], function (declare, lang, arr, html, event, gfx, Gauge, BarLineIndicator, domGeometry) {
    return declare("dojox.gauges.BarGauge", Gauge, {dataX:5, dataY:5, dataWidth:0, dataHeight:0, _defaultIndicator:BarLineIndicator, startup:function () {
        if (this.getChildren) {
            arr.forEach(this.getChildren(), function (child) {
                child.startup();
            });
        }
        if (!this.dataWidth) {
            this.dataWidth = this.gaugeWidth - 10;
        }
        if (!this.dataHeight) {
            this.dataHeight = this.gaugeHeight - 10;
        }
        this.inherited(arguments);
    }, _getPosition:function (value) {
        return this.dataX + Math.floor((value - this.min) / (this.max - this.min) * this.dataWidth);
    }, _getValueForPosition:function (pos) {
        return (pos - this.dataX) * (this.max - this.min) / this.dataWidth + this.min;
    }, drawRange:function (group, range) {
        if (range.shape) {
            range.shape.parent.remove(range.shape);
            range.shape = null;
        }
        var x1 = this._getPosition(range.low);
        var x2 = this._getPosition(range.high);
        var path = group.createRect({x:x1, y:this.dataY, width:x2 - x1, height:this.dataHeight});
        if (lang.isArray(range.color) || lang.isString(range.color)) {
            path.setStroke({color:range.color});
            path.setFill(range.color);
        } else {
            if (range.color.type) {
                var y = this.dataY + this.dataHeight / 2;
                range.color.x1 = x1;
                range.color.x2 = x2;
                range.color.y1 = y;
                range.color.y2 = y;
                path.setFill(range.color);
                path.setStroke({color:range.color.colors[0].color});
            } else {
                if (gfx.svg) {
                    path.setStroke({color:"green"});
                    path.setFill("green");
                    path.getEventSource().setAttribute("class", range.color.style);
                }
            }
        }
        path.connect("onmouseover", lang.hitch(this, this._handleMouseOverRange, range));
        path.connect("onmouseout", lang.hitch(this, this._handleMouseOutRange, range));
        range.shape = path;
    }, getRangeUnderMouse:function (e) {
        var range = null;
        var pos = domGeometry.getContentBox(this.gaugeContent);
        var x = e.clientX - pos.x;
        var value = this._getValueForPosition(x);
        if (this._rangeData) {
            for (var i = 0; (i < this._rangeData.length) && !range; i++) {
                if ((Number(this._rangeData[i].low) <= value) && (Number(this._rangeData[i].high) >= value)) {
                    range = this._rangeData[i];
                }
            }
        }
        return range;
    }, _dragIndicator:function (widget, e) {
        this._dragIndicatorAt(widget, e.pageX, e.pageY);
        event.stop(e);
    }, _dragIndicatorAt:function (widget, x, y) {
        var pos = domGeometry.position(widget.gaugeContent, true);
        var xl = x - pos.x;
        var value = widget._getValueForPosition(xl);
        if (value < widget.min) {
            value = widget.min;
        }
        if (value > widget.max) {
            value = widget.max;
        }
        widget._drag.value = value;
        widget._drag.onDragMove(widget._drag);
        widget._drag.draw(this._indicatorsGroup, true);
        widget._drag.valueChanged();
    }});
});

