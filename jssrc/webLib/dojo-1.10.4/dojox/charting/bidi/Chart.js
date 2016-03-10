//>>built

define("dojox/charting/bidi/Chart", ["dojox/main", "dojo/_base/declare", "dojo/_base/lang", "dojo/dom-style", "dojo/_base/array", "dojo/sniff", "dojo/dom", "dojo/dom-construct", "dojox/gfx", "dojox/gfx/_gfxBidiSupport", "../axis2d/common", "dojox/string/BidiEngine", "dojox/lang/functional", "dojo/dom-attr", "./_bidiutils"], function (dojox, declare, lang, domStyle, arr, has, dom, domConstruct, g, gBidi, da, BidiEngine, df, domAttr, utils) {
    var bidiEngine = new BidiEngine();
    var dc = lang.getObject("charting", true, dojox);
    function validateTextDir(textDir) {
        return /^(ltr|rtl|auto)$/.test(textDir) ? textDir : null;
    }
    return declare(null, {textDir:"", dir:"", isMirrored:false, getTextDir:function (text) {
        var textDir = this.textDir == "auto" ? bidiEngine.checkContextual(text) : this.textDir;
        if (!textDir) {
            textDir = domStyle.get(this.node, "direction");
        }
        return textDir;
    }, postscript:function (node, args) {
        var textDir = args ? (args["textDir"] ? validateTextDir(args["textDir"]) : "") : "";
        textDir = textDir ? textDir : domStyle.get(this.node, "direction");
        this.textDir = textDir;
        this.surface.textDir = textDir;
        this.htmlElementsRegistry = [];
        this.truncatedLabelsRegistry = [];
        var chartDir = "ltr";
        if (domAttr.has(node, "direction")) {
            chartDir = domAttr.get(node, "direction");
        }
        this.setDir(args ? (args.dir ? args.dir : chartDir) : chartDir);
    }, setTextDir:function (newTextDir, obj) {
        if (newTextDir == this.textDir) {
            return this;
        }
        if (validateTextDir(newTextDir) != null) {
            this.textDir = newTextDir;
            this.surface.setTextDir(newTextDir);
            if (this.truncatedLabelsRegistry && newTextDir == "auto") {
                arr.forEach(this.truncatedLabelsRegistry, function (elem) {
                    var tDir = this.getTextDir(elem["label"]);
                    if (elem["element"].textDir != tDir) {
                        elem["element"].setShape({textDir:tDir});
                    }
                }, this);
            }
            var axesKeyArr = df.keys(this.axes);
            if (axesKeyArr.length > 0) {
                arr.forEach(axesKeyArr, function (key, index, arr) {
                    var axis = this.axes[key];
                    if (axis.htmlElements[0]) {
                        axis.dirty = true;
                        axis.render(this.dim, this.offsets);
                    }
                }, this);
                if (this.title) {
                    var forceHtmlLabels = (g.renderer == "canvas"), labelType = forceHtmlLabels || !has("ie") && !has("opera") ? "html" : "gfx", tsize = g.normalizedLength(g.splitFontString(this.titleFont).size);
                    domConstruct.destroy(this.chartTitle);
                    this.chartTitle = null;
                    this.chartTitle = da.createText[labelType](this, this.surface, this.dim.width / 2, this.titlePos == "top" ? tsize + this.margins.t : this.dim.height - this.margins.b, "middle", this.title, this.titleFont, this.titleFontColor);
                }
            } else {
                arr.forEach(this.htmlElementsRegistry, function (elem, index, arr) {
                    var tDir = newTextDir == "auto" ? this.getTextDir(elem[4]) : newTextDir;
                    if (elem[0].children[0] && elem[0].children[0].dir != tDir) {
                        domConstruct.destroy(elem[0].children[0]);
                        elem[0].children[0] = da.createText["html"](this, this.surface, elem[1], elem[2], elem[3], elem[4], elem[5], elem[6]).children[0];
                    }
                }, this);
            }
        }
        return this;
    }, setDir:function (dir) {
        if (dir == "rtl" || dir == "ltr") {
            if (this.dir != dir) {
                this.isMirrored = true;
                this.dirty = true;
            }
            this.dir = dir;
        }
        return this;
    }, isRightToLeft:function () {
        return this.dir == "rtl";
    }, applyMirroring:function (plot, dim, offsets) {
        utils.reverseMatrix(plot, dim, offsets, this.dir == "rtl");
        domStyle.set(this.node, "direction", "ltr");
        return this;
    }, formatTruncatedLabel:function (element, label, labelType) {
        this.truncateBidi(element, label, labelType);
    }, truncateBidi:function (elem, label, labelType) {
        if (labelType == "gfx") {
            this.truncatedLabelsRegistry.push({element:elem, label:label});
            if (this.textDir == "auto") {
                elem.setShape({textDir:this.getTextDir(label)});
            }
        }
        if (labelType == "html" && this.textDir == "auto") {
            elem.children[0].dir = this.getTextDir(label);
        }
    }, render:function () {
        this.inherited(arguments);
        this.isMirrored = false;
        return this;
    }, _resetLeftBottom:function (axis) {
        if (axis.vertical && this.isMirrored) {
            axis.opt.leftBottom = !axis.opt.leftBottom;
        }
    }});
});

