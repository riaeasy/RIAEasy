//>>built

define("dojox/charting/axis2d/Base", ["dojo/_base/declare", "../Element"], function (declare, Element) {
    return declare("dojox.charting.axis2d.Base", Element, {constructor:function (chart, kwArgs) {
        this.vertical = kwArgs && kwArgs.vertical;
        this.opt = {};
        this.opt.min = kwArgs && kwArgs.min;
        this.opt.max = kwArgs && kwArgs.max;
    }, clear:function () {
        return this;
    }, initialized:function () {
        return false;
    }, calculate:function (min, max, span) {
        return this;
    }, getScaler:function () {
        return null;
    }, getTicks:function () {
        return null;
    }, getOffsets:function () {
        return {l:0, r:0, t:0, b:0};
    }, render:function (dim, offsets) {
        this.dirty = false;
        return this;
    }});
});

