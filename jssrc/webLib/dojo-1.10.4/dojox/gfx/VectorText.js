//>>built

define("dojox/gfx/VectorText", ["dojo/_base/lang", "dojo/_base/declare", "dojo/_base/array", "dojo/_base/loader", "dojo/_base/xhr", "./_base", "dojox/xml/DomParser", "dojox/html/metrics", "./matrix"], function (lang, declare, arr, loader, xhr, gfx, xmlDomParser, HtmlMetrics, Matrix) {
    var _getText = function (url) {
        var result;
        xhr.get({url:url, sync:true, load:function (text) {
            result = text;
        }});
        return result;
    };
    lang.getObject("dojox.gfx.VectorText", true);
    lang.mixin(gfx, {vectorFontFitting:{NONE:0, FLOW:1, FIT:2}, defaultVectorText:{type:"vectortext", x:0, y:0, width:null, height:null, text:"", align:"start", decoration:"none", fitting:0, leading:1.5}, defaultVectorFont:{type:"vectorfont", size:"10pt", family:null}, _vectorFontCache:{}, _svgFontCache:{}, getVectorFont:function (url) {
        if (gfx._vectorFontCache[url]) {
            return gfx._vectorFontCache[url];
        }
        return new gfx.VectorFont(url);
    }});
    return declare("dojox.gfx.VectorFont", null, {_entityRe:/&(quot|apos|lt|gt|amp|#x[^;]+|#\d+);/g, _decodeEntitySequence:function (str) {
        if (!str.match(this._entityRe)) {
            return;
        }
        var xmlEntityMap = {amp:"&", apos:"'", quot:"\"", lt:"<", gt:">"};
        var r, tmp = "";
        while ((r = this._entityRe.exec(str)) !== null) {
            if (r[1].charAt(1) == "x") {
                tmp += String.fromCharCode(parseInt(r[1].slice(2), 16));
            } else {
                if (!isNaN(parseInt(r[1].slice(1), 10))) {
                    tmp += String.fromCharCode(parseInt(r[1].slice(1), 10));
                } else {
                    tmp += xmlEntityMap[r[1]] || "";
                }
            }
        }
        return tmp;
    }, _parse:function (svg, url) {
        var doc = gfx._svgFontCache[url] || xmlDomParser.parse(svg);
        var f = doc.documentElement.byName("font")[0], face = doc.documentElement.byName("font-face")[0];
        var unitsPerEm = parseFloat(face.getAttribute("units-per-em") || 1000, 10);
        var advance = {x:parseFloat(f.getAttribute("horiz-adv-x"), 10), y:parseFloat(f.getAttribute("vert-adv-y") || 0, 10)};
        if (!advance.y) {
            advance.y = unitsPerEm;
        }
        var origin = {horiz:{x:parseFloat(f.getAttribute("horiz-origin-x") || 0, 10), y:parseFloat(f.getAttribute("horiz-origin-y") || 0, 10)}, vert:{x:parseFloat(f.getAttribute("vert-origin-x") || 0, 10), y:parseFloat(f.getAttribute("vert-origin-y") || 0, 10)}};
        var family = face.getAttribute("font-family"), style = face.getAttribute("font-style") || "all", variant = face.getAttribute("font-variant") || "normal", weight = face.getAttribute("font-weight") || "all", stretch = face.getAttribute("font-stretch") || "normal", range = face.getAttribute("unicode-range") || "U+0-10FFFF", panose = face.getAttribute("panose-1") || "0 0 0 0 0 0 0 0 0 0", capHeight = face.getAttribute("cap-height"), ascent = parseFloat(face.getAttribute("ascent") || (unitsPerEm - origin.vert.y), 10), descent = parseFloat(face.getAttribute("descent") || origin.vert.y, 10), baseline = {};
        var name = family;
        if (face.byName("font-face-name")[0]) {
            name = face.byName("font-face-name")[0].getAttribute("name");
        }
        if (gfx._vectorFontCache[name]) {
            return;
        }
        arr.forEach(["alphabetic", "ideographic", "mathematical", "hanging"], function (attr) {
            var a = face.getAttribute(attr);
            if (a !== null) {
                baseline[attr] = parseFloat(a, 10);
            }
        });
        var missing = parseFloat(doc.documentElement.byName("missing-glyph")[0].getAttribute("horiz-adv-x") || advance.x, 10);
        var glyphs = {}, glyphsByName = {}, g = doc.documentElement.byName("glyph");
        arr.forEach(g, function (node) {
            var code = node.getAttribute("unicode"), name = node.getAttribute("glyph-name"), xAdv = parseFloat(node.getAttribute("horiz-adv-x") || advance.x, 10), path = node.getAttribute("d");
            if (code.match(this._entityRe)) {
                code = this._decodeEntitySequence(code);
            }
            var o = {code:code, name:name, xAdvance:xAdv, path:path};
            glyphs[code] = o;
            glyphsByName[name] = o;
        }, this);
        var hkern = doc.documentElement.byName("hkern");
        arr.forEach(hkern, function (node, i) {
            var k = -parseInt(node.getAttribute("k"), 10);
            var u1 = node.getAttribute("u1"), g1 = node.getAttribute("g1"), u2 = node.getAttribute("u2"), g2 = node.getAttribute("g2"), gl;
            if (u1) {
                u1 = this._decodeEntitySequence(u1);
                if (glyphs[u1]) {
                    gl = glyphs[u1];
                }
            } else {
                if (glyphsByName[g1]) {
                    gl = glyphsByName[g1];
                }
            }
            if (gl) {
                if (!gl.kern) {
                    gl.kern = {};
                }
                if (u2) {
                    u2 = this._decodeEntitySequence(u2);
                    gl.kern[u2] = {x:k};
                } else {
                    if (glyphsByName[g2]) {
                        gl.kern[glyphsByName[g2].code] = {x:k};
                    }
                }
            }
        }, this);
        lang.mixin(this, {family:family, name:name, style:style, variant:variant, weight:weight, stretch:stretch, range:range, viewbox:{width:unitsPerEm, height:unitsPerEm}, origin:origin, advance:lang.mixin(advance, {missing:{x:missing, y:missing}}), ascent:ascent, descent:descent, baseline:baseline, glyphs:glyphs});
        gfx._vectorFontCache[name] = this;
        gfx._vectorFontCache[url] = this;
        if (name != family && !gfx._vectorFontCache[family]) {
            gfx._vectorFontCache[family] = this;
        }
        if (!gfx._svgFontCache[url]) {
            gfx._svgFontCache[url] = doc;
        }
    }, _clean:function () {
        var name = this.name, family = this.family;
        arr.forEach(["family", "name", "style", "variant", "weight", "stretch", "range", "viewbox", "origin", "advance", "ascent", "descent", "baseline", "glyphs"], function (prop) {
            try {
                delete this[prop];
            }
            catch (e) {
            }
        }, this);
        if (gfx._vectorFontCache[name]) {
            delete gfx._vectorFontCache[name];
        }
        if (gfx._vectorFontCache[family]) {
            delete gfx._vectorFontCache[family];
        }
        return this;
    }, constructor:function (url) {
        this._defaultLeading = 1.5;
        if (url !== undefined) {
            this.load(url);
        }
    }, load:function (url) {
        this.onLoadBegin(url.toString());
        this._parse(gfx._svgFontCache[url.toString()] || _getText(url.toString()), url.toString());
        this.onLoad(this);
        return this;
    }, initialized:function () {
        return (this.glyphs !== null);
    }, _round:function (n) {
        return Math.round(1000 * n) / 1000;
    }, _leading:function (unit) {
        return this.viewbox.height * (unit || this._defaultLeading);
    }, _normalize:function (str) {
        return str.replace(/\s+/g, String.fromCharCode(32));
    }, _getWidth:function (glyphs) {
        var w = 0, last = 0, lastGlyph = null;
        arr.forEach(glyphs, function (glyph, i) {
            last = glyph.xAdvance;
            if (glyphs[i] && glyph.kern && glyph.kern[glyphs[i].code]) {
                last += glyph.kern[glyphs[i].code].x;
            }
            w += last;
            lastGlyph = glyph;
        });
        if (lastGlyph && lastGlyph.code == " ") {
            w -= lastGlyph.xAdvance;
        }
        return this._round(w);
    }, _getLongestLine:function (lines) {
        var maxw = 0, idx = 0;
        arr.forEach(lines, function (line, i) {
            var max = Math.max(maxw, this._getWidth(line));
            if (max > maxw) {
                maxw = max;
                idx = i;
            }
        }, this);
        return {width:maxw, index:idx, line:lines[idx]};
    }, _trim:function (lines) {
        var fn = function (arr) {
            if (!arr.length) {
                return;
            }
            if (arr[arr.length - 1].code == " ") {
                arr.splice(arr.length - 1, 1);
            }
            if (!arr.length) {
                return;
            }
            if (arr[0].code == " ") {
                arr.splice(0, 1);
            }
        };
        if (lang.isArray(lines[0])) {
            arr.forEach(lines, fn);
        } else {
            fn(lines);
        }
        return lines;
    }, _split:function (chars, nLines) {
        var w = this._getWidth(chars), limit = Math.floor(w / nLines), lines = [], cw = 0, c = [], found = false;
        for (var i = 0, l = chars.length; i < l; i++) {
            if (chars[i].code == " ") {
                found = true;
            }
            cw += chars[i].xAdvance;
            if (i + 1 < l && chars[i].kern && chars[i].kern[chars[i + 1].code]) {
                cw += chars[i].kern[chars[i + 1].code].x;
            }
            if (cw >= limit) {
                var chr = chars[i];
                while (found && chr.code != " " && i >= 0) {
                    chr = c.pop();
                    i--;
                }
                lines.push(c);
                c = [];
                cw = 0;
                found = false;
            }
            c.push(chars[i]);
        }
        if (c.length) {
            lines.push(c);
        }
        return this._trim(lines);
    }, _getSizeFactor:function (size) {
        size += "";
        var metrics = HtmlMetrics.getCachedFontMeasurements(), height = this.viewbox.height, f = metrics["1em"], unit = parseFloat(size, 10);
        if (size.indexOf("em") > -1) {
            return this._round((metrics["1em"] * unit) / height);
        } else {
            if (size.indexOf("ex") > -1) {
                return this._round((metrics["1ex"] * unit) / height);
            } else {
                if (size.indexOf("pt") > -1) {
                    return this._round(((metrics["12pt"] / 12) * unit) / height);
                } else {
                    if (size.indexOf("px") > -1) {
                        return this._round(((metrics["16px"] / 16) * unit) / height);
                    } else {
                        if (size.indexOf("%") > -1) {
                            return this._round((metrics["1em"] * (unit / 100)) / height);
                        } else {
                            f = metrics[size] || metrics.medium;
                            return this._round(f / height);
                        }
                    }
                }
            }
        }
    }, _getFitFactor:function (lines, w, h, l) {
        if (!h) {
            return this._round(w / this._getWidth(lines));
        } else {
            var maxw = this._getLongestLine(lines).width, maxh = (lines.length * (this.viewbox.height * l)) - ((this.viewbox.height * l) - this.viewbox.height);
            return this._round(Math.min(w / maxw, h / maxh));
        }
    }, _getBestFit:function (chars, w, h, ldng) {
        var limit = 32, factor = 0, lines = limit;
        while (limit > 0) {
            var f = this._getFitFactor(this._split(chars, limit), w, h, ldng);
            if (f > factor) {
                factor = f;
                lines = limit;
            }
            limit--;
        }
        return {scale:factor, lines:this._split(chars, lines)};
    }, _getBestFlow:function (chars, w, scale) {
        var lines = [], cw = 0, c = [], found = false;
        for (var i = 0, l = chars.length; i < l; i++) {
            if (chars[i].code == " ") {
                found = true;
            }
            var tw = chars[i].xAdvance;
            if (i + 1 < l && chars[i].kern && chars[i].kern[chars[i + 1].code]) {
                tw += chars[i].kern[chars[i + 1].code].x;
            }
            cw += scale * tw;
            if (cw >= w) {
                var chr = chars[i];
                while (found && chr.code != " " && i >= 0) {
                    chr = c.pop();
                    i--;
                }
                lines.push(c);
                c = [];
                cw = 0;
                found = false;
            }
            c.push(chars[i]);
        }
        if (c.length) {
            lines.push(c);
        }
        return this._trim(lines);
    }, getWidth:function (text, scale) {
        return this._getWidth(arr.map(this._normalize(text).split(""), function (chr) {
            return this.glyphs[chr] || {xAdvance:this.advance.missing.x};
        }, this)) * (scale || 1);
    }, getLineHeight:function (scale) {
        return this.viewbox.height * (scale || 1);
    }, getCenterline:function (scale) {
        return (scale || 1) * (this.viewbox.height / 2);
    }, getBaseline:function (scale) {
        return (scale || 1) * (this.viewbox.height + this.descent);
    }, draw:function (group, textArgs, fontArgs, fillArgs, strokeArgs) {
        if (!this.initialized()) {
            throw new Error("dojox.gfx.VectorFont.draw(): we have not been initialized yet.");
        }
        var g = group.createGroup();
        if (textArgs.x || textArgs.y) {
            group.applyTransform({dx:textArgs.x || 0, dy:textArgs.y || 0});
        }
        var text = arr.map(this._normalize(textArgs.text).split(""), function (chr) {
            return this.glyphs[chr] || {path:null, xAdvance:this.advance.missing.x};
        }, this);
        var size = fontArgs.size, fitting = textArgs.fitting, width = textArgs.width, height = textArgs.height, align = textArgs.align, leading = textArgs.leading || this._defaultLeading;
        if (fitting) {
            if ((fitting == gfx.vectorFontFitting.FLOW && !width) || (fitting == gfx.vectorFontFitting.FIT && (!width || !height))) {
                fitting = gfx.vectorFontFitting.NONE;
            }
        }
        var lines, scale;
        switch (fitting) {
          case gfx.vectorFontFitting.FIT:
            var o = this._getBestFit(text, width, height, leading);
            scale = o.scale;
            lines = o.lines;
            break;
          case gfx.vectorFontFitting.FLOW:
            scale = this._getSizeFactor(size);
            lines = this._getBestFlow(text, width, scale);
            break;
          default:
            scale = this._getSizeFactor(size);
            lines = [text];
        }
        lines = arr.filter(lines, function (item) {
            return item.length > 0;
        });
        var cy = 0, maxw = this._getLongestLine(lines).width;
        for (var i = 0, l = lines.length; i < l; i++) {
            var cx = 0, line = lines[i], linew = this._getWidth(line), lg = g.createGroup();
            for (var j = 0; j < line.length; j++) {
                var glyph = line[j];
                if (glyph.path !== null) {
                    var p = lg.createPath(glyph.path).setFill(fillArgs);
                    if (strokeArgs) {
                        p.setStroke(strokeArgs);
                    }
                    p.setTransform([Matrix.flipY, Matrix.translate(cx, -this.viewbox.height - this.descent)]);
                }
                cx += glyph.xAdvance;
                if (j + 1 < line.length && glyph.kern && glyph.kern[line[j + 1].code]) {
                    cx += glyph.kern[line[j + 1].code].x;
                }
            }
            var dx = 0;
            if (align == "middle") {
                dx = maxw / 2 - linew / 2;
            } else {
                if (align == "end") {
                    dx = maxw - linew;
                }
            }
            lg.setTransform({dx:dx, dy:cy});
            cy += this.viewbox.height * leading;
        }
        g.setTransform(Matrix.scale(scale));
        return g;
    }, onLoadBegin:function (url) {
    }, onLoad:function (font) {
    }});
});

