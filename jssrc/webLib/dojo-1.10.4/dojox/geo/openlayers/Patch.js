//>>built

define("dojox/geo/openlayers/Patch", ["dojo/_base/kernel", "dojo/_base/lang", "dojo/_base/sniff", "dojox/gfx", "dojox/gfx/shape"], function (dojo, lang, sniff, gfx, shape) {
    var dgo = lang.getObject("geo.openlayers", true, dojox);
    dgo.Patch = {patchMethod:function (type, method, execBefore, execAfter) {
        var old = type.prototype[method];
        type.prototype[method] = function () {
            var callee = method;
            if (execBefore) {
                execBefore.call(this, callee, arguments);
            }
            var ret = old.apply(this, arguments);
            if (execAfter) {
                ret = execAfter.call(this, callee, ret, arguments) || ret;
            }
            return ret;
        };
    }, patchGFX:function () {
        var vmlFixRawNodePath = function () {
            if (!this.rawNode.path) {
                this.rawNode.path = {};
            }
        };
        var vmlFixFillColors = function () {
            if (this.rawNode.fill && !this.rawNode.fill.colors) {
                this.rawNode.fill.colors = {};
            }
        };
        if (sniff.isIE <= 8 && gfx.renderer === "vml") {
            this.patchMethod(gfx.Line, "setShape", vmlFixRawNodePath, null);
            this.patchMethod(gfx.Polyline, "setShape", vmlFixRawNodePath, null);
            this.patchMethod(gfx.Path, "setShape", vmlFixRawNodePath, null);
            this.patchMethod(shape.Shape, "setFill", vmlFixFillColors, null);
        }
    }};
    return dgo.Patch;
});

