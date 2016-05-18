//>>built

define("dojo/_base/Color", ["./kernel", "./lang", "./array", "./config"], function (dojo, lang, ArrayUtil, config) {
    var Color = dojo.Color = function (color) {
        if (color) {
            this.setColor(color);
        }
    };
    Color.named = {"black":[0, 0, 0], "silver":[192, 192, 192], "gray":[128, 128, 128], "white":[255, 255, 255], "maroon":[128, 0, 0], "red":[255, 0, 0], "purple":[128, 0, 128], "fuchsia":[255, 0, 255], "green":[0, 128, 0], "lime":[0, 255, 0], "olive":[128, 128, 0], "yellow":[255, 255, 0], "navy":[0, 0, 128], "blue":[0, 0, 255], "teal":[0, 128, 128], "aqua":[0, 255, 255], "transparent":config.transparentColor || [0, 0, 0, 0]};
    lang.extend(Color, {r:255, g:255, b:255, a:1, _set:function (r, g, b, a) {
        var t = this;
        t.r = r;
        t.g = g;
        t.b = b;
        t.a = a;
    }, setColor:function (color) {
        if (lang.isString(color)) {
            Color.fromString(color, this);
        } else {
            if (lang.isArray(color)) {
                Color.fromArray(color, this);
            } else {
                this._set(color.r, color.g, color.b, color.a);
                if (!(color instanceof Color)) {
                    this.sanitize();
                }
            }
        }
        return this;
    }, sanitize:function () {
        return this;
    }, toRgb:function () {
        var t = this;
        return [t.r, t.g, t.b];
    }, toRgba:function () {
        var t = this;
        return [t.r, t.g, t.b, t.a];
    }, toHex:function () {
        var arr = ArrayUtil.map(["r", "g", "b"], function (x) {
            var s = this[x].toString(16);
            return s.length < 2 ? "0" + s : s;
        }, this);
        return "#" + arr.join("");
    }, toCss:function (includeAlpha) {
        var t = this, rgb = t.r + ", " + t.g + ", " + t.b;
        return (includeAlpha ? "rgba(" + rgb + ", " + t.a : "rgb(" + rgb) + ")";
    }, toString:function () {
        return this.toCss(true);
    }});
    Color.blendColors = dojo.blendColors = function (start, end, weight, obj) {
        var t = obj || new Color();
        ArrayUtil.forEach(["r", "g", "b", "a"], function (x) {
            t[x] = start[x] + (end[x] - start[x]) * weight;
            if (x != "a") {
                t[x] = Math.round(t[x]);
            }
        });
        return t.sanitize();
    };
    Color.fromRgb = dojo.colorFromRgb = function (color, obj) {
        var m = color.toLowerCase().match(/^rgba?\(([\s\.,0-9]+)\)/);
        return m && Color.fromArray(m[1].split(/\s*,\s*/), obj);
    };
    Color.fromHex = dojo.colorFromHex = function (color, obj) {
        var t = obj || new Color(), bits = (color.length == 4) ? 4 : 8, mask = (1 << bits) - 1;
        color = Number("0x" + color.substr(1));
        if (isNaN(color)) {
            return null;
        }
        ArrayUtil.forEach(["b", "g", "r"], function (x) {
            var c = color & mask;
            color >>= bits;
            t[x] = bits == 4 ? 17 * c : c;
        });
        t.a = 1;
        return t;
    };
    Color.fromArray = dojo.colorFromArray = function (a, obj) {
        var t = obj || new Color();
        t._set(Number(a[0]), Number(a[1]), Number(a[2]), Number(a[3]));
        if (isNaN(t.a)) {
            t.a = 1;
        }
        return t.sanitize();
    };
    Color.fromString = dojo.colorFromString = function (str, obj) {
        var a = Color.named[str];
        return a && Color.fromArray(a, obj) || Color.fromRgb(str, obj) || Color.fromHex(str, obj);
    };
    return Color;
});

