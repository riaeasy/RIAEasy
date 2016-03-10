//>>built

define("dojox/charting/axis2d/Invisible", ["dojo/_base/lang", "dojo/_base/declare", "./Base", "../scaler/linear", "dojox/lang/utils"], function (lang, declare, Base, lin, du) {
    return declare("dojox.charting.axis2d.Invisible", Base, {defaultParams:{vertical:false, fixUpper:"none", fixLower:"none", natural:false, leftBottom:true, includeZero:false, fixed:true}, optionalParams:{min:0, max:1, from:0, to:1, majorTickStep:4, minorTickStep:2, microTickStep:1}, constructor:function (chart, kwArgs) {
        this.opt = lang.clone(this.defaultParams);
        du.updateWithObject(this.opt, kwArgs);
        du.updateWithPattern(this.opt, kwArgs, this.optionalParams);
    }, dependOnData:function () {
        return !("min" in this.opt) || !("max" in this.opt);
    }, clear:function () {
        delete this.scaler;
        delete this.ticks;
        this.dirty = true;
        return this;
    }, initialized:function () {
        return "scaler" in this && !(this.dirty && this.dependOnData());
    }, setWindow:function (scale, offset) {
        this.scale = scale;
        this.offset = offset;
        return this.clear();
    }, getWindowScale:function () {
        return "scale" in this ? this.scale : 1;
    }, getWindowOffset:function () {
        return "offset" in this ? this.offset : 0;
    }, calculate:function (min, max, span) {
        if (this.initialized()) {
            return this;
        }
        var o = this.opt;
        this.labels = o.labels;
        this.scaler = lin.buildScaler(min, max, span, o);
        var tsb = this.scaler.bounds;
        if ("scale" in this) {
            o.from = tsb.lower + this.offset;
            o.to = (tsb.upper - tsb.lower) / this.scale + o.from;
            if (!isFinite(o.from) || isNaN(o.from) || !isFinite(o.to) || isNaN(o.to) || o.to - o.from >= tsb.upper - tsb.lower) {
                delete o.from;
                delete o.to;
                delete this.scale;
                delete this.offset;
            } else {
                if (o.from < tsb.lower) {
                    o.to += tsb.lower - o.from;
                    o.from = tsb.lower;
                } else {
                    if (o.to > tsb.upper) {
                        o.from += tsb.upper - o.to;
                        o.to = tsb.upper;
                    }
                }
                this.offset = o.from - tsb.lower;
            }
            this.scaler = lin.buildScaler(min, max, span, o);
            tsb = this.scaler.bounds;
            if (this.scale == 1 && this.offset == 0) {
                delete this.scale;
                delete this.offset;
            }
        }
        return this;
    }, getScaler:function () {
        return this.scaler;
    }, getTicks:function () {
        return this.ticks;
    }});
});

