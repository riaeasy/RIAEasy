//>>built

define("dojox/charting/bidi/Chart3D", ["dojo/_base/declare", "dojo/dom-style", "dojo/dom-attr", "./_bidiutils"], function (declare, domStyle, domAttr, utils) {
    return declare(null, {direction:"", isMirrored:false, postscript:function (node, lights, camera, theme, direction) {
        var chartDir = "ltr";
        if (domAttr.has(node, "direction")) {
            chartDir = domAttr.get(node, "direction");
        }
        this.chartBaseDirection = direction ? direction : chartDir;
    }, generate:function () {
        this.inherited(arguments);
        this.isMirrored = false;
        return this;
    }, applyMirroring:function (plot, dim, offsets) {
        if (this.isMirrored) {
            utils.reverseMatrix(plot, dim, offsets, this.dir == "rtl");
        }
        domStyle.set(this.node, "direction", "ltr");
        return this;
    }, setDir:function (dir) {
        if (dir == "rtl" || dir == "ltr") {
            if (this.dir != dir) {
                this.isMirrored = true;
            }
            this.dir = dir;
        }
        return this;
    }, isRightToLeft:function () {
        return this.dir == "rtl";
    }});
});

