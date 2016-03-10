//>>built

define("dojox/charting/action2d/Shake", ["dojo/_base/connect", "dojo/_base/declare", "./PlotAction", "dojo/fx", "dojo/fx/easing", "dojox/gfx/matrix", "dojox/gfx/fx"], function (hub, declare, PlotAction, df, dfe, m, gf) {
    var DEFAULT_SHIFT = 3;
    return declare("dojox.charting.action2d.Shake", PlotAction, {defaultParams:{duration:400, easing:dfe.backOut, shiftX:DEFAULT_SHIFT, shiftY:DEFAULT_SHIFT}, optionalParams:{}, constructor:function (chart, plot, kwArgs) {
        if (!kwArgs) {
            kwArgs = {};
        }
        this.shiftX = typeof kwArgs.shiftX == "number" ? kwArgs.shiftX : DEFAULT_SHIFT;
        this.shiftY = typeof kwArgs.shiftY == "number" ? kwArgs.shiftY : DEFAULT_SHIFT;
        this.connect();
    }, process:function (o) {
        if (!o.shape || !(o.type in this.overOutEvents)) {
            return;
        }
        var runName = o.run.name, index = o.index, vector = [], anim;
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
        var kwArgs = {shape:o.shape, duration:this.duration, easing:this.easing, transform:[{name:"translate", start:[this.shiftX, this.shiftY], end:[0, 0]}, m.identity]};
        if (o.shape) {
            vector.push(gf.animateTransform(kwArgs));
        }
        if (o.oultine) {
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
            hub.connect(anim.action, "onEnd", this, function () {
                if (this.anim[runName]) {
                    delete this.anim[runName][index];
                }
            });
        }
        anim.action.play();
    }});
});

