//>>built

define("dojox/charting/action2d/Tooltip", ["dijit/Tooltip", "dojo/_base/lang", "dojo/_base/declare", "dojo/_base/window", "dojo/_base/connect", "dojo/dom-style", "./PlotAction", "dojox/gfx/matrix", "dojo/has", "require", "dojox/lang/functional", "dojox/lang/functional/scan", "dojox/lang/functional/fold"], function (DijitTooltip, lang, declare, win, hub, domStyle, PlotAction, m, has, BidiTooltip, df) {
    var DEFAULT_TEXT = function (o, plot) {
        var t = o.run && o.run.data && o.run.data[o.index];
        if (t && typeof t != "number" && (t.tooltip || t.text)) {
            return t.tooltip || t.text;
        }
        if (plot.tooltipFunc) {
            return plot.tooltipFunc(o);
        } else {
            return o.y;
        }
    };
    var pi4 = Math.PI / 4, pi2 = Math.PI / 2;
    var Tooltip = declare(0 ? "dojox.charting.action2d.NonBidiTooltip" : "dojox.charting.action2d.Tooltip", PlotAction, {defaultParams:{text:DEFAULT_TEXT, mouseOver:true}, optionalParams:{}, constructor:function (chart, plot, kwArgs) {
        this.text = kwArgs && kwArgs.text ? kwArgs.text : DEFAULT_TEXT;
        this.mouseOver = kwArgs && kwArgs.mouseOver != undefined ? kwArgs.mouseOver : true;
        this.connect();
    }, process:function (o) {
        if (o.type === "onplotreset" || o.type === "onmouseout") {
            DijitTooltip.hide(this.aroundRect);
            this.aroundRect = null;
            if (o.type === "onplotreset") {
                delete this.angles;
            }
            return;
        }
        if (!o.shape || (this.mouseOver && o.type !== "onmouseover") || (!this.mouseOver && o.type !== "onclick")) {
            return;
        }
        var aroundRect = {type:"rect"}, position = ["after-centered", "before-centered"];
        switch (o.element) {
          case "marker":
            aroundRect.x = o.cx;
            aroundRect.y = o.cy;
            aroundRect.w = aroundRect.h = 1;
            break;
          case "circle":
            aroundRect.x = o.cx - o.cr;
            aroundRect.y = o.cy - o.cr;
            aroundRect.w = aroundRect.h = 2 * o.cr;
            break;
          case "spider_circle":
            aroundRect.x = o.cx;
            aroundRect.y = o.cy;
            aroundRect.w = aroundRect.h = 1;
            break;
          case "spider_plot":
            return;
          case "column":
            position = ["above-centered", "below-centered"];
          case "bar":
            aroundRect = lang.clone(o.shape.getShape());
            aroundRect.w = aroundRect.width;
            aroundRect.h = aroundRect.height;
            break;
          case "candlestick":
            aroundRect.x = o.x;
            aroundRect.y = o.y;
            aroundRect.w = o.width;
            aroundRect.h = o.height;
            break;
          default:
            if (!this.angles) {
                var filteredRun = typeof o.run.data[0] == "number" ? df.map(o.run.data, "x ? Math.max(x, 0) : 0") : df.map(o.run.data, "x ? Math.max(x.y, 0) : 0");
                this.angles = df.map(df.scanl(filteredRun, "+", 0), "* 2 * Math.PI / this", df.foldl(filteredRun, "+", 0));
            }
            var startAngle = m._degToRad(o.plot.opt.startAngle), angle = (this.angles[o.index] + this.angles[o.index + 1]) / 2 + startAngle;
            aroundRect.x = o.cx + o.cr * Math.cos(angle);
            aroundRect.y = o.cy + o.cr * Math.sin(angle);
            aroundRect.w = aroundRect.h = 1;
            if (startAngle && (angle < 0 || angle > 2 * Math.PI)) {
                angle = Math.abs(2 * Math.PI - Math.abs(angle));
            }
            if (angle < pi4) {
            } else {
                if (angle < pi2 + pi4) {
                    position = ["below-centered", "above-centered"];
                } else {
                    if (angle < Math.PI + pi4) {
                        position = ["before-centered", "after-centered"];
                    } else {
                        if (angle < 2 * Math.PI - pi4) {
                            position = ["above-centered", "below-centered"];
                        }
                    }
                }
            }
            break;
        }
        if (0) {
            this._recheckPosition(o, aroundRect, position);
        }
        var lt = this.chart.getCoords();
        aroundRect.x += lt.x;
        aroundRect.y += lt.y;
        aroundRect.x = Math.round(aroundRect.x);
        aroundRect.y = Math.round(aroundRect.y);
        aroundRect.w = Math.ceil(aroundRect.w);
        aroundRect.h = Math.ceil(aroundRect.h);
        this.aroundRect = aroundRect;
        var tooltipText = this.text(o, this.plot);
        if (tooltipText) {
            DijitTooltip.show(this._format(tooltipText), this.aroundRect, position);
        }
        if (!this.mouseOver) {
            this._handle = hub.connect(win.doc, "onclick", this, "onClick");
        }
    }, onClick:function () {
        this.process({type:"onmouseout"});
    }, _recheckPosition:function (obj, rect, position) {
    }, _format:function (tooltipText) {
        return tooltipText;
    }});
    return 0 ? declare("dojox.charting.action2d.Tooltip", [Tooltip, BidiTooltip]) : Tooltip;
});

