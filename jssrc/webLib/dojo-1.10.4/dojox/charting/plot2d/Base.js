//>>built

define("dojox/charting/plot2d/Base", ["dojo/_base/declare", "dojo/_base/array", "dojox/gfx", "../Element", "./common", "../axis2d/common", "dojo/has"], function (declare, arr, gfx, Element, common, ac, has) {
    var Base = declare("dojox.charting.plot2d.Base", Element, {constructor:function (chart, kwArgs) {
        if (kwArgs && kwArgs.tooltipFunc) {
            this.tooltipFunc = kwArgs.tooltipFunc;
        }
    }, clear:function () {
        this.series = [];
        this.dirty = true;
        return this;
    }, setAxis:function (axis) {
        return this;
    }, assignAxes:function (axes) {
        arr.forEach(this.axes, function (axis) {
            if (this[axis]) {
                this.setAxis(axes[this[axis]]);
            }
        }, this);
    }, addSeries:function (run) {
        this.series.push(run);
        return this;
    }, getSeriesStats:function () {
        return common.collectSimpleStats(this.series);
    }, calculateAxes:function (dim) {
        this.initializeScalers(dim, this.getSeriesStats());
        return this;
    }, initializeScalers:function () {
        return this;
    }, isDataDirty:function () {
        return arr.some(this.series, function (item) {
            return item.dirty;
        });
    }, render:function (dim, offsets) {
        return this;
    }, renderLabel:function (group, x, y, label, theme, block, align) {
        var elem = ac.createText[this.opt.htmlLabels && gfx.renderer != "vml" ? "html" : "gfx"](this.chart, group, x, y, align ? align : "middle", label, theme.series.font, theme.series.fontColor);
        if (block) {
            if (this.opt.htmlLabels && gfx.renderer != "vml") {
                elem.style.pointerEvents = "none";
            } else {
                if (elem.rawNode) {
                    elem.rawNode.style.pointerEvents = "none";
                }
            }
        }
        if (this.opt.htmlLabels && gfx.renderer != "vml") {
            this.htmlElements.push(elem);
        }
        return elem;
    }, getRequiredColors:function () {
        return this.series.length;
    }, _getLabel:function (number) {
        return common.getLabel(number, this.opt.fixed, this.opt.precision);
    }});
    if (0) {
        Base.extend({_checkOrientation:function (group, dim, offsets) {
            this.chart.applyMirroring(this.group, dim, offsets);
        }});
    }
    return Base;
});

