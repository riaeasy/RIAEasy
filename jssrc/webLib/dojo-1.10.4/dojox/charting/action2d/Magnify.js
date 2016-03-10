//>>built

define("dojox/charting/action2d/Magnify", ["dojo/_base/connect", "dojo/_base/declare", "./PlotAction", "dojox/gfx/matrix", "dojox/gfx/fx", "dojo/fx", "dojo/fx/easing"], function (Hub, declare, PlotAction, m, gf, df, dfe) {
    var DEFAULT_SCALE = 2;
    return declare("dojox.charting.action2d.Magnify", PlotAction, {defaultParams:{duration:400, easing:dfe.backOut, scale:DEFAULT_SCALE}, optionalParams:{}, constructor:function (chart, plot, kwArgs) {
        this.scale = kwArgs && typeof kwArgs.scale == "number" ? kwArgs.scale : DEFAULT_SCALE;
        this.connect();
    }, process:function (o) {
        if (!o.shape || !(o.type in this.overOutEvents) || !("cx" in o) || !("cy" in o)) {
            return;
        }
        if (o.element == "spider_plot" || o.element == "spider_poly") {
            return;
        }
        var runName = o.run.name, index = o.index, vector = [], anim, init, scale;
        if (runName in this.anim) {
            anim = this.anim[runName][index];
        } else {
            this.anim[runName] = {};
        }
        if (anim) {
            anim.action.stop(true);
        } else {
            this.anim[runName][index] = anim = {};
        }
        if (o.type == "onmouseover") {
            init = m.identity;
            scale = this.scale;
        } else {
            init = m.scaleAt(this.scale, o.cx, o.cy);
            scale = 1 / this.scale;
        }
        var kwArgs = {shape:o.shape, duration:this.duration, easing:this.easing, transform:[{name:"scaleAt", start:[1, o.cx, o.cy], end:[scale, o.cx, o.cy]}, init]};
        if (o.shape) {
            vector.push(gf.animateTransform(kwArgs));
        }
        if (o.outline) {
            kwArgs.shape = o.outline;
            vector.push(gf.animateTransform(kwArgs));
        }
        if (o.shadow) {
            kwArgs.shape = o.shadow;
            vector.push(gf.animateTransform(kwArgs));
        }
        if (!vector.length) {
            delete this.anim[runName][index];
            return;
        }
        anim.action = df.combine(vector);
        if (o.type == "onmouseout") {
            Hub.connect(anim.action, "onEnd", this, function () {
                if (this.anim[runName]) {
                    delete this.anim[runName][index];
                }
            });
        }
        anim.action.play();
    }});
});

