//>>built

define("dojox/gauges/_Gauge", ["dojo/_base/kernel", "dojo/_base/declare", "dojo/_base/lang", "dojo/_base/html", "dojo/_base/array", "dojo/_base/event", "dojo/_base/connect", "dojo/dom-construct", "dijit/_Widget", "dojox/gfx", "./Range", "dojo/fx/easing"], function (kernel, declare, lang, html, arr, event, connect, dom, Widget, gfx, Range) {
    kernel.deprecated("dojox.gauges", "Use the new extensible dojox.dgauges framework instead", "2.0");
    var _tooltipModule = 0;
    var _numberModule = 0;
    return declare("dojox.gauges._Gauge", [Widget], {width:0, height:0, background:null, image:null, useRangeStyles:0, useTooltip:true, majorTicks:null, minorTicks:null, _defaultIndicator:null, defaultColors:[[0, 84, 170, 1], [68, 119, 187, 1], [102, 153, 204, 1], [153, 187, 238, 1], [153, 204, 255, 1], [204, 238, 255, 1], [221, 238, 255, 1]], min:null, max:null, surface:null, hideValues:false, gaugeContent:undefined, _backgroundDefault:{color:"#E0E0E0"}, _rangeData:null, _indicatorData:null, _drag:null, _img:null, _overOverlay:false, _lastHover:"", startup:function () {
        if (this.image === null) {
            this.image = {};
        }
        this.connect(this.gaugeContent, "onmousedown", this.handleMouseDown);
        this.connect(this.gaugeContent, "onmousemove", this.handleMouseMove);
        this.connect(this.gaugeContent, "onmouseover", this.handleMouseOver);
        this.connect(this.gaugeContent, "onmouseout", this.handleMouseOut);
        this.connect(this.gaugeContent, "touchstart", this.handleTouchStart);
        this.connect(this.gaugeContent, "touchend", this.handleTouchEnd);
        this.connect(this.gaugeContent, "touchmove", this.handleTouchMove);
        if (!lang.isArray(this.ranges)) {
            this.ranges = [];
        }
        if (!lang.isArray(this.indicators)) {
            this.indicators = [];
        }
        var ranges = [], indicators = [];
        var i;
        if (this.hasChildren()) {
            var children = this.getChildren();
            for (i = 0; i < children.length; i++) {
                if (/.*Indicator/.test(children[i].declaredClass)) {
                    indicators.push(children[i]);
                    continue;
                }
                switch (children[i].declaredClass) {
                  case Range.prototype.declaredClass:
                    ranges.push(children[i]);
                    break;
                }
            }
            this.ranges = this.ranges.concat(ranges);
            this.indicators = this.indicators.concat(indicators);
        }
        if (!this.background) {
            this.background = this._backgroundDefault;
        }
        this.background = this.background.color || this.background;
        if (!this.surface) {
            this.createSurface();
        }
        this.addRanges(this.ranges);
        if (this.minorTicks && this.minorTicks.interval) {
            this.setMinorTicks(this.minorTicks);
        }
        if (this.majorTicks && this.majorTicks.interval) {
            this.setMajorTicks(this.majorTicks);
        }
        for (i = 0; i < this.indicators.length; i++) {
            this.addIndicator(this.indicators[i]);
        }
        this.inherited(arguments);
    }, hasChildren:function () {
        return this.getChildren().length > 0;
    }, buildRendering:function () {
        var n = this.domNode = this.srcNodeRef ? this.srcNodeRef : dom.create("div");
        this.gaugeContent = dom.create("div", {className:"dojoxGaugeContent"});
        this.containerNode = dom.create("div");
        this.mouseNode = dom.create("div");
        while (n.hasChildNodes()) {
            this.containerNode.appendChild(n.firstChild);
        }
        dom.place(this.gaugeContent, n);
        dom.place(this.containerNode, n);
        dom.place(this.mouseNode, n);
    }, _setTicks:function (oldTicks, newTicks, major) {
        var i;
        if (oldTicks && lang.isArray(oldTicks._ticks)) {
            for (i = 0; i < oldTicks._ticks.length; i++) {
                this._removeScaleTick(oldTicks._ticks[i]);
            }
        }
        var t = {length:newTicks.length, offset:newTicks.offset, noChange:true};
        if (newTicks.color) {
            t.color = newTicks.color;
        }
        if (newTicks.font) {
            t.font = newTicks.font;
        }
        if (newTicks.labelPlacement) {
            t.direction = newTicks.labelPlacement;
        }
        newTicks._ticks = [];
        for (i = this.min; i <= this.max; i += newTicks.interval) {
            if (i == this.max && this._isScaleCircular()) {
                continue;
            }
            t.value = i;
            if (major) {
                var NumberUtils = this._getNumberModule();
                if (NumberUtils) {
                    t.label = (newTicks.fixedPrecision && newTicks.precision) ? NumberUtils.format(i, {places:newTicks.precision}) : NumberUtils.format(i);
                } else {
                    t.label = (newTicks.fixedPrecision && newTicks.precision) ? i.toFixed(newTicks.precision) : i.toString();
                }
            }
            newTicks._ticks.push(this._addScaleTick(t, major));
        }
        return newTicks;
    }, _isScaleCircular:function () {
        return false;
    }, setMinorTicks:function (ticks) {
        this.minorTicks = this._setTicks(this.minorTicks, ticks, false);
    }, setMajorTicks:function (ticks) {
        this.majorTicks = this._setTicks(this.majorTicks, ticks, true);
    }, postCreate:function () {
        if (this.hideValues) {
            html.style(this.containerNode, "display", "none");
        }
        html.style(this.mouseNode, "width", "0");
        html.style(this.mouseNode, "height", "0");
        html.style(this.mouseNode, "position", "absolute");
        html.style(this.mouseNode, "z-index", "100");
        if (this.useTooltip) {
            require(["dijit/Tooltip"], dojo.hitch(this, function (Tooltip) {
                Tooltip.show("test", this.mouseNode, !this.isLeftToRight());
                Tooltip.hide(this.mouseNode);
            }));
        }
    }, _getNumberModule:function () {
        if (_numberModule == 0) {
            try {
                _numberModule = require("dojo/number");
            }
            catch (e) {
                _numberModule = null;
            }
        }
        return _numberModule;
    }, createSurface:function () {
        this.gaugeContent.style.width = this.width + "px";
        this.gaugeContent.style.height = this.height + "px";
        this.surface = gfx.createSurface(this.gaugeContent, this.width, this.height);
        this._backgroundGroup = this.surface.createGroup();
        this._rangeGroup = this.surface.createGroup();
        this._minorTicksGroup = this.surface.createGroup();
        this._majorTicksGroup = this.surface.createGroup();
        this._overlayGroup = this.surface.createGroup();
        this._indicatorsGroup = this.surface.createGroup();
        this._foregroundGroup = this.surface.createGroup();
        this._background = this._backgroundGroup.createRect({x:0, y:0, width:this.width, height:this.height});
        this._background.setFill(this.background);
        if (this.image.url) {
            var imageGroup = this._backgroundGroup;
            if (this.image.overlay) {
                imageGroup = this._overlayGroup;
            }
            this._img = imageGroup.createImage({width:this.image.width || this.width, height:this.image.height || this.height, src:this.image.url});
            if (this.image.x || this.image.y) {
                this._img.setTransform({dx:this.image.x || 0, dy:this.image.y || 0});
            }
        }
    }, draw:function () {
        var i;
        if (!this.surface) {
            return;
        }
        this.drawBackground(this._backgroundGroup);
        if (this._rangeData) {
            for (i = 0; i < this._rangeData.length; i++) {
                this.drawRange(this._rangeGroup, this._rangeData[i]);
            }
        }
        if (this._minorTicksData) {
            for (i = 0; i < this._minorTicksData.length; i++) {
                this._minorTicksData[i].draw(this._minorTicksGroup);
            }
        }
        if (this._majorTicksData) {
            for (i = 0; i < this._majorTicksData.length; i++) {
                this._majorTicksData[i].draw(this._majorTicksGroup);
            }
        }
        if (this._indicatorData) {
            for (i = 0; i < this._indicatorData.length; i++) {
                this._indicatorData[i].draw(this._indicatorsGroup);
            }
        }
        this.drawForeground(this._foregroundGroup);
    }, drawBackground:function (group) {
    }, drawForeground:function (group) {
    }, setBackground:function (background) {
        if (!background) {
            background = this._backgroundDefault;
        }
        this.background = background.color || background;
        this._background.setFill(this.background);
    }, addRange:function (range) {
        this.addRanges([range]);
    }, addRanges:function (ranges) {
        if (!this._rangeData) {
            this._rangeData = [];
        }
        var range;
        for (var i = 0; i < ranges.length; i++) {
            range = ranges[i];
            if ((this.min === null) || (range.low < this.min)) {
                this.min = range.low;
            }
            if ((this.max === null) || (range.high > this.max)) {
                this.max = range.high;
            }
            if (!range.color) {
                var colorIndex = this._rangeData.length % this.defaultColors.length;
                if (gfx.svg && this.useRangeStyles > 0) {
                    colorIndex = (this._rangeData.length % this.useRangeStyles) + 1;
                    range.color = {style:"dojoxGaugeRange" + colorIndex};
                } else {
                    colorIndex = this._rangeData.length % this.defaultColors.length;
                    range.color = this.defaultColors[colorIndex];
                }
            }
            this._rangeData[this._rangeData.length] = range;
        }
        this.draw();
    }, _addScaleTick:function (indicator, major) {
        if (!indicator.declaredClass) {
            indicator = new this._defaultIndicator(indicator);
        }
        indicator._gauge = this;
        if (major) {
            if (!this._majorTicksData) {
                this._majorTicksData = [];
            }
            this._majorTicksData[this._majorTicksData.length] = indicator;
            indicator.draw(this._majorTicksGroup);
        } else {
            if (!this._minorTicksData) {
                this._minorTicksData = [];
            }
            this._minorTicksData[this._minorTicksData.length] = indicator;
            indicator.draw(this._minorTicksGroup);
        }
        return indicator;
    }, _removeScaleTick:function (indicator) {
        var i;
        if (this._majorTicksData) {
            for (i = 0; i < this._majorTicksData.length; i++) {
                if (this._majorTicksData[i] === indicator) {
                    this._majorTicksData.splice(i, 1);
                    indicator.remove();
                    return;
                }
            }
        }
        if (this._minorTicksData) {
            for (i = 0; i < this._minorTicksData.length; i++) {
                if (this._minorTicksData[i] === indicator) {
                    this._minorTicksData.splice(i, 1);
                    indicator.remove();
                    return;
                }
            }
        }
    }, addIndicator:function (indicator) {
        if (!indicator.declaredClass) {
            indicator = new this._defaultIndicator(indicator);
        }
        indicator._gauge = this;
        if (!indicator.hideValue) {
            this.containerNode.appendChild(indicator.domNode);
        }
        if (!this._indicatorData) {
            this._indicatorData = [];
        }
        this._indicatorData[this._indicatorData.length] = indicator;
        indicator.draw(this._indicatorsGroup);
        return indicator;
    }, removeIndicator:function (indicator) {
        for (var i = 0; i < this._indicatorData.length; i++) {
            if (this._indicatorData[i] === indicator) {
                this._indicatorData.splice(i, 1);
                indicator.remove();
                break;
            }
        }
    }, moveIndicatorToFront:function (indicator) {
        if (indicator.shape) {
            indicator.shape.moveToFront();
        }
    }, drawText:function (group, txt, x, y, align, color, font) {
        var t = group.createText({x:x, y:y, text:txt, align:align});
        t.setFill(color ? color : "black");
        if (font) {
            t.setFont(font);
        }
        return t;
    }, removeText:function (t) {
        if (t.parent) {
            t.parent.remove(t);
        }
    }, updateTooltip:function (txt, e) {
        if (this.useTooltip) {
            require(["dijit/Tooltip"], dojo.hitch(this, function (Tooltip) {
                if (this._lastHover != txt) {
                    if (txt !== "") {
                        Tooltip.hide(this.mouseNode);
                        Tooltip.show(txt, this.mouseNode, !this.isLeftToRight());
                    } else {
                        Tooltip.hide(this.mouseNode);
                    }
                    this._lastHover = txt;
                }
            }));
        }
    }, handleMouseOver:function (e) {
        if (this.image && this.image.overlay) {
            if (e.target == this._img.getEventSource()) {
                var hover;
                this._overOverlay = true;
                var r = this.getRangeUnderMouse(e);
                if (r && r.hover) {
                    hover = r.hover;
                }
                if (this.useTooltip && !this._drag) {
                    if (hover) {
                        this.updateTooltip(hover, e);
                    } else {
                        this.updateTooltip("", e);
                    }
                }
            }
        }
    }, handleMouseOut:function (e) {
        this._overOverlay = false;
        this._hideTooltip();
    }, handleMouseMove:function (e) {
        if (this.useTooltip) {
            if (e) {
                html.style(this.mouseNode, "left", e.pageX + 1 + "px");
                html.style(this.mouseNode, "top", e.pageY + 1 + "px");
            }
            if (this._overOverlay) {
                var r = this.getRangeUnderMouse(e);
                if (r && r.hover) {
                    this.updateTooltip(r.hover, e);
                } else {
                    this.updateTooltip("", e);
                }
            }
        }
    }, handleMouseDown:function (e) {
        var indicator = this._getInteractiveIndicator();
        if (indicator) {
            this._handleMouseDownIndicator(indicator, e);
        }
    }, _handleDragInteractionMouseMove:function (e) {
        if (this._drag) {
            this._dragIndicator(this, e);
            event.stop(e);
        }
    }, _handleDragInteractionMouseUp:function (e) {
        this._drag = null;
        for (var i = 0; i < this._mouseListeners.length; i++) {
            connect.disconnect(this._mouseListeners[i]);
        }
        this._mouseListeners = [];
        event.stop(e);
    }, _handleMouseDownIndicator:function (indicator, e) {
        if (!indicator.noChange) {
            if (!this._mouseListeners) {
                this._mouseListeners = [];
            }
            this._drag = indicator;
            this._mouseListeners.push(connect.connect(document, "onmouseup", this, this._handleDragInteractionMouseUp));
            this._mouseListeners.push(connect.connect(document, "onmousemove", this, this._handleDragInteractionMouseMove));
            this._mouseListeners.push(connect.connect(document, "ondragstart", this, event.stop));
            this._mouseListeners.push(connect.connect(document, "onselectstart", this, event.stop));
            this._dragIndicator(this, e);
            event.stop(e);
        }
    }, _handleMouseOverIndicator:function (indicator, e) {
        if (this.useTooltip && !this._drag) {
            if (indicator.hover) {
                require(["dijit/Tooltip"], dojo.hitch(this, function (Tooltip) {
                    html.style(this.mouseNode, "left", e.pageX + 1 + "px");
                    html.style(this.mouseNode, "top", e.pageY + 1 + "px");
                    Tooltip.show(indicator.hover, this.mouseNode, !this.isLeftToRight());
                }));
            } else {
                this.updateTooltip("", e);
            }
        }
        if (indicator.onDragMove && !indicator.noChange) {
            this.gaugeContent.style.cursor = "pointer";
        }
    }, _handleMouseOutIndicator:function (indicator, e) {
        this._hideTooltip();
        this.gaugeContent.style.cursor = "pointer";
    }, _hideTooltip:function () {
        if (this.useTooltip && this.mouseNode) {
            require(["dijit/Tooltip"], dojo.hitch(this, function (Tooltip) {
                Tooltip.hide(this.mouseNode);
            }));
        }
    }, _handleMouseOutRange:function (range, e) {
        this._hideTooltip();
    }, _handleMouseOverRange:function (range, e) {
        if (this.useTooltip && !this._drag) {
            if (range.hover) {
                html.style(this.mouseNode, "left", e.pageX + 1 + "px");
                html.style(this.mouseNode, "top", e.pageY + 1 + "px");
                require(["dijit/Tooltip"], dojo.hitch(this, function (Tooltip) {
                    Tooltip.show(range.hover, this.mouseNode, !this.isLeftToRight());
                }));
            } else {
                this.updateTooltip("", e);
            }
        }
    }, handleTouchStartIndicator:function (indicator, e) {
        if (!indicator.noChange) {
            this._drag = indicator;
            event.stop(e);
        }
    }, handleTouchStart:function (e) {
        this._drag = this._getInteractiveIndicator();
        this.handleTouchMove(e);
    }, handleTouchEnd:function (e) {
        if (this._drag) {
            this._drag = null;
            event.stop(e);
        }
    }, handleTouchMove:function (e) {
        if (this._drag && !this._drag.noChange) {
            var touches = e.touches;
            var firstTouch = touches[0];
            this._dragIndicatorAt(this, firstTouch.pageX, firstTouch.pageY);
            event.stop(e);
        }
    }, _getInteractiveIndicator:function () {
        for (var i = 0; i < this._indicatorData.length; i++) {
            var indicator = this._indicatorData[i];
            if (indicator.interactionMode == "gauge" && !indicator.noChange) {
                return indicator;
            }
        }
        return null;
    }});
});

