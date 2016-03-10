//>>built

define("dojox/charting/action2d/Highlight", ["dojo/_base/lang", "dojo/_base/declare", "dojo/_base/Color", "dojo/_base/connect", "dojox/color/_base", "./PlotAction", "dojo/fx/easing", "dojox/gfx/fx"], function (lang, declare, Color, hub, c, PlotAction, dfe, dgf) {
    var DEFAULT_SATURATION = 100, DEFAULT_LUMINOSITY1 = 75, DEFAULT_LUMINOSITY2 = 50, cc = function (color) {
        return function () {
            return color;
        };
    }, hl = function (color) {
        var a = new c.Color(color), x = a.toHsl();
        if (x.s == 0) {
            x.l = x.l < 50 ? 100 : 0;
        } else {
            x.s = DEFAULT_SATURATION;
            if (x.l < DEFAULT_LUMINOSITY2) {
                x.l = DEFAULT_LUMINOSITY1;
            } else {
                if (x.l > DEFAULT_LUMINOSITY1) {
                    x.l = DEFAULT_LUMINOSITY2;
                } else {
                    x.l = x.l - DEFAULT_LUMINOSITY2 > DEFAULT_LUMINOSITY1 - x.l ? DEFAULT_LUMINOSITY2 : DEFAULT_LUMINOSITY1;
                }
            }
        }
        var rcolor = c.fromHsl(x);
        rcolor.a = a.a;
        return rcolor;
    }, spiderhl = function (color) {
        var r = hl(color);
        r.a = 0.7;
        return r;
    };
    return declare("dojox.charting.action2d.Highlight", PlotAction, {defaultParams:{duration:400, easing:dfe.backOut}, optionalParams:{highlight:"red"}, constructor:function (chart, plot, kwArgs) {
        var a = kwArgs && kwArgs.highlight;
        this.colorFunc = a ? (lang.isFunction(a) ? a : cc(a)) : hl;
        this.connect();
    }, process:function (o) {
        if (!o.shape || !(o.type in this.overOutEvents)) {
            return;
        }
        if (o.element == "spider_circle" || o.element == "spider_plot") {
            return;
        } else {
            if (o.element == "spider_poly" && this.colorFunc == hl) {
                this.colorFunc = spiderhl;
            }
        }
        var runName = o.run.name, index = o.index, anim;
        if (runName in this.anim) {
            anim = this.anim[runName][index];
        } else {
            this.anim[runName] = {};
        }
        if (anim) {
            anim.action.stop(true);
        } else {
            var color = o.shape.getFill();
            if (!color || !(color instanceof Color)) {
                return;
            }
            this.anim[runName][index] = anim = {start:color, end:this.colorFunc(color)};
        }
        var start = anim.start, end = anim.end;
        if (o.type == "onmouseout") {
            var t = start;
            start = end;
            end = t;
        }
        anim.action = dgf.animateFill({shape:o.shape, duration:this.duration, easing:this.easing, color:{start:start, end:end}});
        if (o.type == "onmouseout") {
            hub.connect(anim.action, "onEnd", this, function () {
                if (this.anim[runName]) {
                    delete this.anim[runName][index];
                }
            });
        }
        anim.action.play();
    }});
});

