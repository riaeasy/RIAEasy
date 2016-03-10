//>>built

define("dojox/gfx/_gfxBidiSupport", ["./_base", "dojo/_base/lang", "dojo/_base/sniff", "dojo/dom", "dojo/_base/html", "dojo/_base/array", "./utils", "./shape", "./path", "dojox/string/BidiEngine"], function (g, lang, has, dom, html, arr, utils, shapeLib, pathLib, BidiEngine) {
    lang.getObject("dojox.gfx._gfxBidiSupport", true);
    switch (g.renderer) {
      case "vml":
        g.isVml = true;
        break;
      case "svg":
        g.isSvg = true;
        if (g.svg.useSvgWeb) {
            g.isSvgWeb = true;
        }
        break;
      case "silverlight":
        g.isSilverlight = true;
        break;
      case "canvas":
      case "canvasWithEvents":
        g.isCanvas = true;
        break;
    }
    var bidi_const = {LRM:"\u200e", LRE:"\u202a", PDF:"\u202c", RLM:"\u200f", RLE:"\u202b"};
    var bidiEngine = new BidiEngine();
    lang.extend(g.shape.Surface, {textDir:"", setTextDir:function (newTextDir) {
        setTextDir(this, newTextDir);
    }, getTextDir:function () {
        return this.textDir;
    }});
    lang.extend(g.Group, {textDir:"", setTextDir:function (newTextDir) {
        setTextDir(this, newTextDir);
    }, getTextDir:function () {
        return this.textDir;
    }});
    lang.extend(g.Text, {textDir:"", formatText:function (text, textDir) {
        if (textDir && text && text.length > 1) {
            var sourceDir = "ltr", targetDir = textDir;
            if (targetDir == "auto") {
                if (g.isVml) {
                    return text;
                }
                targetDir = bidiEngine.checkContextual(text);
            }
            if (g.isVml) {
                sourceDir = bidiEngine.checkContextual(text);
                if (targetDir != sourceDir) {
                    if (targetDir == "rtl") {
                        return !bidiEngine.hasBidiChar(text) ? bidiEngine.bidiTransform(text, "IRNNN", "ILNNN") : bidi_const.RLM + bidi_const.RLM + text;
                    } else {
                        return bidi_const.LRM + text;
                    }
                }
                return text;
            }
            if (g.isSvgWeb) {
                if (targetDir == "rtl") {
                    return bidiEngine.bidiTransform(text, "IRNNN", "ILNNN");
                }
                return text;
            }
            if (g.isSilverlight) {
                return (targetDir == "rtl") ? bidiEngine.bidiTransform(text, "IRNNN", "VLYNN") : bidiEngine.bidiTransform(text, "ILNNN", "VLYNN");
            }
            if (g.isCanvas) {
                return (targetDir == "rtl") ? bidi_const.RLE + text + bidi_const.PDF : bidi_const.LRE + text + bidi_const.PDF;
            }
            if (g.isSvg) {
                if (has("ff") < 4) {
                    return (targetDir == "rtl") ? bidiEngine.bidiTransform(text, "IRYNN", "VLNNN") : bidiEngine.bidiTransform(text, "ILYNN", "VLNNN");
                } else {
                    return bidi_const.LRM + (targetDir == "rtl" ? bidi_const.RLE : bidi_const.LRE) + text + bidi_const.PDF;
                }
            }
        }
        return text;
    }, bidiPreprocess:function (newShape) {
        return newShape;
    }});
    lang.extend(g.TextPath, {textDir:"", formatText:function (text, textDir) {
        if (textDir && text && text.length > 1) {
            var sourceDir = "ltr", targetDir = textDir;
            if (targetDir == "auto") {
                if (g.isVml) {
                    return text;
                }
                targetDir = bidiEngine.checkContextual(text);
            }
            if (g.isVml) {
                sourceDir = bidiEngine.checkContextual(text);
                if (targetDir != sourceDir) {
                    if (targetDir == "rtl") {
                        return !bidiEngine.hasBidiChar(text) ? bidiEngine.bidiTransform(text, "IRNNN", "ILNNN") : bidi_const.RLM + bidi_const.RLM + text;
                    } else {
                        return bidi_const.LRM + text;
                    }
                }
                return text;
            }
            if (g.isSvgWeb) {
                if (targetDir == "rtl") {
                    return bidiEngine.bidiTransform(text, "IRNNN", "ILNNN");
                }
                return text;
            }
            if (g.isSvg) {
                if (has("opera") || has("ff") >= 4) {
                    text = bidi_const.LRM + (targetDir == "rtl" ? bidi_const.RLE : bidi_const.LRE) + text + bidi_const.PDF;
                } else {
                    text = (targetDir == "rtl") ? bidiEngine.bidiTransform(text, "IRYNN", "VLNNN") : bidiEngine.bidiTransform(text, "ILYNN", "VLNNN");
                }
            }
        }
        return text;
    }, bidiPreprocess:function (newText) {
        if (newText && (typeof newText == "string")) {
            this.origText = newText;
            newText = this.formatText(newText, this.textDir);
        }
        return newText;
    }});
    var extendMethod = function (shape, method, before, after) {
        var old = shape.prototype[method];
        shape.prototype[method] = function () {
            var rBefore;
            if (before) {
                rBefore = before.apply(this, arguments);
            }
            var r = old.call(this, rBefore);
            if (after) {
                r = after.call(this, r, arguments);
            }
            return r;
        };
    };
    var bidiPreprocess = function (newText) {
        if (newText) {
            if (newText.textDir) {
                newText.textDir = validateTextDir(newText.textDir);
            }
            if (newText.text && (newText.text instanceof Array)) {
                newText.text = newText.text.join(",");
            }
        }
        if (newText && (newText.text != undefined || newText.textDir) && (this.textDir != newText.textDir || newText.text != this.origText)) {
            this.origText = (newText.text != undefined) ? newText.text : this.origText;
            if (newText.textDir) {
                this.textDir = newText.textDir;
            }
            newText.text = this.formatText(this.origText, this.textDir);
        }
        return this.bidiPreprocess(newText);
    };
    extendMethod(g.Text, "setShape", bidiPreprocess, null);
    extendMethod(g.TextPath, "setText", bidiPreprocess, null);
    var restoreText = function (origObj) {
        var obj = lang.clone(origObj);
        if (obj && this.origText) {
            obj.text = this.origText;
        }
        return obj;
    };
    extendMethod(g.Text, "getShape", null, restoreText);
    extendMethod(g.TextPath, "getText", null, restoreText);
    var groupTextDir = function (group, args) {
        var textDir;
        if (args && args[0]) {
            textDir = validateTextDir(args[0]);
        }
        group.setTextDir(textDir ? textDir : this.textDir);
        return group;
    };
    extendMethod(g.Surface, "createGroup", null, groupTextDir);
    extendMethod(g.Group, "createGroup", null, groupTextDir);
    var textDirPreprocess = function (text) {
        if (text) {
            var textDir = text.textDir ? validateTextDir(text.textDir) : this.textDir;
            if (textDir) {
                text.textDir = textDir;
            }
        }
        return text;
    };
    extendMethod(g.Surface, "createText", textDirPreprocess, null);
    extendMethod(g.Surface, "createTextPath", textDirPreprocess, null);
    extendMethod(g.Group, "createText", textDirPreprocess, null);
    extendMethod(g.Group, "createTextPath", textDirPreprocess, null);
    g.createSurface = function (parentNode, width, height, textDir) {
        var s = g[g.renderer].createSurface(parentNode, width, height);
        var tDir = validateTextDir(textDir);
        if (g.isSvgWeb) {
            s.textDir = tDir ? tDir : html.style(dom.byId(parentNode), "direction");
            return s;
        }
        if (g.isVml || g.isSvg || g.isCanvas) {
            s.textDir = tDir ? tDir : html.style(s.rawNode, "direction");
        }
        if (g.isSilverlight) {
            s.textDir = tDir ? tDir : html.style(s._nodes[1], "direction");
        }
        return s;
    };
    function setTextDir(obj, newTextDir) {
        var tDir = validateTextDir(newTextDir);
        if (tDir) {
            g.utils.forEach(obj, function (e) {
                if (e instanceof g.Surface || e instanceof g.Group) {
                    e.textDir = tDir;
                }
                if (e instanceof g.Text) {
                    e.setShape({textDir:tDir});
                }
                if (e instanceof g.TextPath) {
                    e.setText({textDir:tDir});
                }
            }, obj);
        }
        return obj;
    }
    function validateTextDir(textDir) {
        var validValues = ["ltr", "rtl", "auto"];
        if (textDir) {
            textDir = textDir.toLowerCase();
            if (arr.indexOf(validValues, textDir) < 0) {
                return null;
            }
        }
        return textDir;
    }
    return g;
});

