//>>built

define("dojox/charting/Element", ["dojo/_base/array", "dojo/dom-construct", "dojo/_base/declare", "dojox/gfx", "dojox/gfx/shape"], function (arr, domConstruct, declare, gfx, shape) {
    return declare("dojox.charting.Element", null, {chart:null, group:null, htmlElements:null, dirty:true, renderingOptions:null, constructor:function (chart, kwArgs) {
        this.chart = chart;
        this.group = null;
        this.htmlElements = [];
        this.dirty = true;
        this.trailingSymbol = "...";
        this._events = [];
        if (kwArgs && kwArgs.renderingOptions) {
            this.renderingOptions = kwArgs.renderingOptions;
        }
    }, purgeGroup:function () {
        this.destroyHtmlElements();
        if (this.group) {
            this.getGroup().removeShape();
            var children = this.getGroup().children;
            if (shape.dispose) {
                for (var i = 0; i < children.length; ++i) {
                    shape.dispose(children[i], true);
                }
            }
            if (this.getGroup().rawNode) {
                domConstruct.empty(this.getGroup().rawNode);
            }
            this.getGroup().clear();
            if (shape.dispose) {
                shape.dispose(this.getGroup(), true);
            }
            if (this.getGroup() != this.group) {
                if (this.group.rawNode) {
                    domConstruct.empty(this.group.rawNode);
                }
                this.group.clear();
                if (shape.dispose) {
                    shape.dispose(this.group, true);
                }
            }
            this.group = null;
        }
        this.dirty = true;
        if (this._events.length) {
            arr.forEach(this._events, function (item) {
                item.shape.disconnect(item.handle);
            });
            this._events = [];
        }
        return this;
    }, cleanGroup:function (creator) {
        this.destroyHtmlElements();
        if (!creator) {
            creator = this.chart.surface;
        }
        if (this.group) {
            var bgnode;
            var children = this.getGroup().children;
            if (shape.dispose) {
                for (var i = 0; i < children.length; ++i) {
                    shape.dispose(children[i], true);
                }
            }
            if (this.getGroup().rawNode) {
                bgnode = this.getGroup().bgNode;
                domConstruct.empty(this.getGroup().rawNode);
            }
            this.getGroup().clear();
            if (bgnode) {
                this.getGroup().rawNode.appendChild(bgnode);
            }
        } else {
            this.group = creator.createGroup();
            if (this.renderingOptions && this.group.rawNode && this.group.rawNode.namespaceURI == "http://www.w3.org/2000/svg") {
                for (var key in this.renderingOptions) {
                    this.group.rawNode.setAttribute(key, this.renderingOptions[key]);
                }
            }
        }
        this.dirty = true;
        return this;
    }, getGroup:function () {
        return this.group;
    }, destroyHtmlElements:function () {
        if (this.htmlElements.length) {
            arr.forEach(this.htmlElements, domConstruct.destroy);
            this.htmlElements = [];
        }
    }, destroy:function () {
        this.purgeGroup();
    }, getTextWidth:function (s, font) {
        return gfx._base._getTextBox(s, {font:font}).w || 0;
    }, getTextWithLimitLength:function (s, font, limitWidth, truncated) {
        if (!s || s.length <= 0) {
            return {text:"", truncated:truncated || false};
        }
        if (!limitWidth || limitWidth <= 0) {
            return {text:s, truncated:truncated || false};
        }
        var delta = 2, trucPercentage = 0.618, minStr = s.substring(0, 1) + this.trailingSymbol, minWidth = this.getTextWidth(minStr, font);
        if (limitWidth <= minWidth) {
            return {text:minStr, truncated:true};
        }
        var width = this.getTextWidth(s, font);
        if (width <= limitWidth) {
            return {text:s, truncated:truncated || false};
        } else {
            var begin = 0, end = s.length;
            while (begin < end) {
                if (end - begin <= delta) {
                    while (this.getTextWidth(s.substring(0, begin) + this.trailingSymbol, font) > limitWidth) {
                        begin -= 1;
                    }
                    return {text:(s.substring(0, begin) + this.trailingSymbol), truncated:true};
                }
                var index = begin + Math.round((end - begin) * trucPercentage), widthIntercepted = this.getTextWidth(s.substring(0, index), font);
                if (widthIntercepted < limitWidth) {
                    begin = index;
                    end = end;
                } else {
                    begin = begin;
                    end = index;
                }
            }
        }
    }, getTextWithLimitCharCount:function (s, font, wcLimit, truncated) {
        if (!s || s.length <= 0) {
            return {text:"", truncated:truncated || false};
        }
        if (!wcLimit || wcLimit <= 0 || s.length <= wcLimit) {
            return {text:s, truncated:truncated || false};
        }
        return {text:s.substring(0, wcLimit) + this.trailingSymbol, truncated:true};
    }, _plotFill:function (fill, dim, offsets) {
        if (!fill || !fill.type || !fill.space) {
            return fill;
        }
        var space = fill.space, span;
        switch (fill.type) {
          case "linear":
            if (space === "plot" || space === "shapeX" || space === "shapeY") {
                fill = gfx.makeParameters(gfx.defaultLinearGradient, fill);
                fill.space = space;
                if (space === "plot" || space === "shapeX") {
                    span = dim.height - offsets.t - offsets.b;
                    fill.y1 = offsets.t + span * fill.y1 / 100;
                    fill.y2 = offsets.t + span * fill.y2 / 100;
                }
                if (space === "plot" || space === "shapeY") {
                    span = dim.width - offsets.l - offsets.r;
                    fill.x1 = offsets.l + span * fill.x1 / 100;
                    fill.x2 = offsets.l + span * fill.x2 / 100;
                }
            }
            break;
          case "radial":
            if (space === "plot") {
                fill = gfx.makeParameters(gfx.defaultRadialGradient, fill);
                fill.space = space;
                var spanX = dim.width - offsets.l - offsets.r, spanY = dim.height - offsets.t - offsets.b;
                fill.cx = offsets.l + spanX * fill.cx / 100;
                fill.cy = offsets.t + spanY * fill.cy / 100;
                fill.r = fill.r * Math.sqrt(spanX * spanX + spanY * spanY) / 200;
            }
            break;
          case "pattern":
            if (space === "plot" || space === "shapeX" || space === "shapeY") {
                fill = gfx.makeParameters(gfx.defaultPattern, fill);
                fill.space = space;
                if (space === "plot" || space === "shapeX") {
                    span = dim.height - offsets.t - offsets.b;
                    fill.y = offsets.t + span * fill.y / 100;
                    fill.height = span * fill.height / 100;
                }
                if (space === "plot" || space === "shapeY") {
                    span = dim.width - offsets.l - offsets.r;
                    fill.x = offsets.l + span * fill.x / 100;
                    fill.width = span * fill.width / 100;
                }
            }
            break;
        }
        return fill;
    }, _shapeFill:function (fill, bbox) {
        if (!fill || !fill.space) {
            return fill;
        }
        var space = fill.space, span;
        switch (fill.type) {
          case "linear":
            if (space === "shape" || space === "shapeX" || space === "shapeY") {
                fill = gfx.makeParameters(gfx.defaultLinearGradient, fill);
                fill.space = space;
                if (space === "shape" || space === "shapeX") {
                    span = bbox.width;
                    fill.x1 = bbox.x + span * fill.x1 / 100;
                    fill.x2 = bbox.x + span * fill.x2 / 100;
                }
                if (space === "shape" || space === "shapeY") {
                    span = bbox.height;
                    fill.y1 = bbox.y + span * fill.y1 / 100;
                    fill.y2 = bbox.y + span * fill.y2 / 100;
                }
            }
            break;
          case "radial":
            if (space === "shape") {
                fill = gfx.makeParameters(gfx.defaultRadialGradient, fill);
                fill.space = space;
                fill.cx = bbox.x + bbox.width / 2;
                fill.cy = bbox.y + bbox.height / 2;
                fill.r = fill.r * bbox.width / 200;
            }
            break;
          case "pattern":
            if (space === "shape" || space === "shapeX" || space === "shapeY") {
                fill = gfx.makeParameters(gfx.defaultPattern, fill);
                fill.space = space;
                if (space === "shape" || space === "shapeX") {
                    span = bbox.width;
                    fill.x = bbox.x + span * fill.x / 100;
                    fill.width = span * fill.width / 100;
                }
                if (space === "shape" || space === "shapeY") {
                    span = bbox.height;
                    fill.y = bbox.y + span * fill.y / 100;
                    fill.height = span * fill.height / 100;
                }
            }
            break;
        }
        return fill;
    }, _pseudoRadialFill:function (fill, center, radius, start, end) {
        if (!fill || fill.type !== "radial" || fill.space !== "shape") {
            return fill;
        }
        var space = fill.space;
        fill = gfx.makeParameters(gfx.defaultRadialGradient, fill);
        fill.space = space;
        if (arguments.length < 4) {
            fill.cx = center.x;
            fill.cy = center.y;
            fill.r = fill.r * radius / 100;
            return fill;
        }
        var angle = arguments.length < 5 ? start : (end + start) / 2;
        return {type:"linear", x1:center.x, y1:center.y, x2:center.x + fill.r * radius * Math.cos(angle) / 100, y2:center.y + fill.r * radius * Math.sin(angle) / 100, colors:fill.colors};
    }});
});

