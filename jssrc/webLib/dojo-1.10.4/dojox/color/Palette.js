//>>built

define("dojox/color/Palette", ["dojo/_base/lang", "dojo/_base/array", "./_base"], function (lang, arr, dxc) {
    dxc.Palette = function (base) {
        this.colors = [];
        if (base instanceof dxc.Palette) {
            this.colors = base.colors.slice(0);
        } else {
            if (base instanceof dxc.Color) {
                this.colors = [null, null, base, null, null];
            } else {
                if (lang.isArray(base)) {
                    this.colors = arr.map(base.slice(0), function (item) {
                        if (lang.isString(item)) {
                            return new dxc.Color(item);
                        }
                        return item;
                    });
                } else {
                    if (lang.isString(base)) {
                        this.colors = [null, null, new dxc.Color(base), null, null];
                    }
                }
            }
        }
    };
    function tRGBA(p, param, val) {
        var ret = new dxc.Palette();
        ret.colors = [];
        arr.forEach(p.colors, function (item) {
            var r = (param == "dr") ? item.r + val : item.r, g = (param == "dg") ? item.g + val : item.g, b = (param == "db") ? item.b + val : item.b, a = (param == "da") ? item.a + val : item.a;
            ret.colors.push(new dxc.Color({r:Math.min(255, Math.max(0, r)), g:Math.min(255, Math.max(0, g)), b:Math.min(255, Math.max(0, b)), a:Math.min(1, Math.max(0, a))}));
        });
        return ret;
    }
    function tCMY(p, param, val) {
        var ret = new dxc.Palette();
        ret.colors = [];
        arr.forEach(p.colors, function (item) {
            var o = item.toCmy(), c = (param == "dc") ? o.c + val : o.c, m = (param == "dm") ? o.m + val : o.m, y = (param == "dy") ? o.y + val : o.y;
            ret.colors.push(dxc.fromCmy(Math.min(100, Math.max(0, c)), Math.min(100, Math.max(0, m)), Math.min(100, Math.max(0, y))));
        });
        return ret;
    }
    function tCMYK(p, param, val) {
        var ret = new dxc.Palette();
        ret.colors = [];
        arr.forEach(p.colors, function (item) {
            var o = item.toCmyk(), c = (param == "dc") ? o.c + val : o.c, m = (param == "dm") ? o.m + val : o.m, y = (param == "dy") ? o.y + val : o.y, k = (param == "dk") ? o.b + val : o.b;
            ret.colors.push(dxc.fromCmyk(Math.min(100, Math.max(0, c)), Math.min(100, Math.max(0, m)), Math.min(100, Math.max(0, y)), Math.min(100, Math.max(0, k))));
        });
        return ret;
    }
    function tHSL(p, param, val) {
        var ret = new dxc.Palette();
        ret.colors = [];
        arr.forEach(p.colors, function (item) {
            var o = item.toHsl(), h = (param == "dh") ? o.h + val : o.h, s = (param == "ds") ? o.s + val : o.s, l = (param == "dl") ? o.l + val : o.l;
            ret.colors.push(dxc.fromHsl(h % 360, Math.min(100, Math.max(0, s)), Math.min(100, Math.max(0, l))));
        });
        return ret;
    }
    function tHSV(p, param, val) {
        var ret = new dxc.Palette();
        ret.colors = [];
        arr.forEach(p.colors, function (item) {
            var o = item.toHsv(), h = (param == "dh") ? o.h + val : o.h, s = (param == "ds") ? o.s + val : o.s, v = (param == "dv") ? o.v + val : o.v;
            ret.colors.push(dxc.fromHsv(h % 360, Math.min(100, Math.max(0, s)), Math.min(100, Math.max(0, v))));
        });
        return ret;
    }
    function rangeDiff(val, low, high) {
        return high - ((high - val) * ((high - low) / high));
    }
    lang.extend(dxc.Palette, {transform:function (kwArgs) {
        var fn = tRGBA;
        if (kwArgs.use) {
            var use = kwArgs.use.toLowerCase();
            if (use.indexOf("hs") == 0) {
                if (use.charAt(2) == "l") {
                    fn = tHSL;
                } else {
                    fn = tHSV;
                }
            } else {
                if (use.indexOf("cmy") == 0) {
                    if (use.charAt(3) == "k") {
                        fn = tCMYK;
                    } else {
                        fn = tCMY;
                    }
                }
            }
        } else {
            if ("dc" in kwArgs || "dm" in kwArgs || "dy" in kwArgs) {
                if ("dk" in kwArgs) {
                    fn = tCMYK;
                } else {
                    fn = tCMY;
                }
            } else {
                if ("dh" in kwArgs || "ds" in kwArgs) {
                    if ("dv" in kwArgs) {
                        fn = tHSV;
                    } else {
                        fn = tHSL;
                    }
                }
            }
        }
        var palette = this;
        for (var p in kwArgs) {
            if (p == "use") {
                continue;
            }
            palette = fn(palette, p, kwArgs[p]);
        }
        return palette;
    }, clone:function () {
        return new dxc.Palette(this);
    }});
    lang.mixin(dxc.Palette, {generators:{analogous:function (args) {
        var high = args.high || 60, low = args.low || 18, base = lang.isString(args.base) ? new dxc.Color(args.base) : args.base, hsv = base.toHsv();
        var h = [(hsv.h + low + 360) % 360, (hsv.h + Math.round(low / 2) + 360) % 360, hsv.h, (hsv.h - Math.round(high / 2) + 360) % 360, (hsv.h - high + 360) % 360];
        var s1 = Math.max(10, (hsv.s <= 95) ? hsv.s + 5 : (100 - (hsv.s - 95))), s2 = (hsv.s > 1) ? hsv.s - 1 : 21 - hsv.s, v1 = (hsv.v >= 92) ? hsv.v - 9 : Math.max(hsv.v + 9, 20), v2 = (hsv.v <= 90) ? Math.max(hsv.v + 5, 20) : (95 + Math.ceil((hsv.v - 90) / 2)), s = [s1, s2, hsv.s, s1, s1], v = [v1, v2, hsv.v, v1, v2];
        return new dxc.Palette(arr.map(h, function (hue, i) {
            return dxc.fromHsv(hue, s[i], v[i]);
        }));
    }, monochromatic:function (args) {
        var base = lang.isString(args.base) ? new dxc.Color(args.base) : args.base, hsv = base.toHsv();
        var s1 = (hsv.s - 30 > 9) ? hsv.s - 30 : hsv.s + 30, s2 = hsv.s, v1 = rangeDiff(hsv.v, 20, 100), v2 = (hsv.v - 20 > 20) ? hsv.v - 20 : hsv.v + 60, v3 = (hsv.v - 50 > 20) ? hsv.v - 50 : hsv.v + 30;
        return new dxc.Palette([dxc.fromHsv(hsv.h, s1, v1), dxc.fromHsv(hsv.h, s2, v3), base, dxc.fromHsv(hsv.h, s1, v3), dxc.fromHsv(hsv.h, s2, v2)]);
    }, triadic:function (args) {
        var base = lang.isString(args.base) ? new dxc.Color(args.base) : args.base, hsv = base.toHsv();
        var h1 = (hsv.h + 57 + 360) % 360, h2 = (hsv.h - 157 + 360) % 360, s1 = (hsv.s > 20) ? hsv.s - 10 : hsv.s + 10, s2 = (hsv.s > 90) ? hsv.s - 10 : hsv.s + 10, s3 = (hsv.s > 95) ? hsv.s - 5 : hsv.s + 5, v1 = (hsv.v - 20 > 20) ? hsv.v - 20 : hsv.v + 20, v2 = (hsv.v - 30 > 20) ? hsv.v - 30 : hsv.v + 30, v3 = (hsv.v - 30 > 70) ? hsv.v - 30 : hsv.v + 30;
        return new dxc.Palette([dxc.fromHsv(h1, s1, hsv.v), dxc.fromHsv(hsv.h, s2, v2), base, dxc.fromHsv(h2, s2, v1), dxc.fromHsv(h2, s3, v3)]);
    }, complementary:function (args) {
        var base = lang.isString(args.base) ? new dxc.Color(args.base) : args.base, hsv = base.toHsv();
        var h1 = ((hsv.h * 2) + 137 < 360) ? (hsv.h * 2) + 137 : Math.floor(hsv.h / 2) - 137, s1 = Math.max(hsv.s - 10, 0), s2 = rangeDiff(hsv.s, 10, 100), s3 = Math.min(100, hsv.s + 20), v1 = Math.min(100, hsv.v + 30), v2 = (hsv.v > 20) ? hsv.v - 30 : hsv.v + 30;
        return new dxc.Palette([dxc.fromHsv(hsv.h, s1, v1), dxc.fromHsv(hsv.h, s2, v2), base, dxc.fromHsv(h1, s3, v2), dxc.fromHsv(h1, hsv.s, hsv.v)]);
    }, splitComplementary:function (args) {
        var base = lang.isString(args.base) ? new dxc.Color(args.base) : args.base, dangle = args.da || 30, hsv = base.toHsv();
        var baseh = ((hsv.h * 2) + 137 < 360) ? (hsv.h * 2) + 137 : Math.floor(hsv.h / 2) - 137, h1 = (baseh - dangle + 360) % 360, h2 = (baseh + dangle) % 360, s1 = Math.max(hsv.s - 10, 0), s2 = rangeDiff(hsv.s, 10, 100), s3 = Math.min(100, hsv.s + 20), v1 = Math.min(100, hsv.v + 30), v2 = (hsv.v > 20) ? hsv.v - 30 : hsv.v + 30;
        return new dxc.Palette([dxc.fromHsv(h1, s1, v1), dxc.fromHsv(h1, s2, v2), base, dxc.fromHsv(h2, s3, v2), dxc.fromHsv(h2, hsv.s, hsv.v)]);
    }, compound:function (args) {
        var base = lang.isString(args.base) ? new dxc.Color(args.base) : args.base, hsv = base.toHsv();
        var h1 = ((hsv.h * 2) + 18 < 360) ? (hsv.h * 2) + 18 : Math.floor(hsv.h / 2) - 18, h2 = ((hsv.h * 2) + 120 < 360) ? (hsv.h * 2) + 120 : Math.floor(hsv.h / 2) - 120, h3 = ((hsv.h * 2) + 99 < 360) ? (hsv.h * 2) + 99 : Math.floor(hsv.h / 2) - 99, s1 = (hsv.s - 40 > 10) ? hsv.s - 40 : hsv.s + 40, s2 = (hsv.s - 10 > 80) ? hsv.s - 10 : hsv.s + 10, s3 = (hsv.s - 25 > 10) ? hsv.s - 25 : hsv.s + 25, v1 = (hsv.v - 40 > 10) ? hsv.v - 40 : hsv.v + 40, v2 = (hsv.v - 20 > 80) ? hsv.v - 20 : hsv.v + 20, v3 = Math.max(hsv.v, 20);
        return new dxc.Palette([dxc.fromHsv(h1, s1, v1), dxc.fromHsv(h1, s2, v2), base, dxc.fromHsv(h2, s3, v3), dxc.fromHsv(h3, s2, v2)]);
    }, shades:function (args) {
        var base = lang.isString(args.base) ? new dxc.Color(args.base) : args.base, hsv = base.toHsv();
        var s = (hsv.s == 100 && hsv.v == 0) ? 0 : hsv.s, v1 = (hsv.v - 50 > 20) ? hsv.v - 50 : hsv.v + 30, v2 = (hsv.v - 25 >= 20) ? hsv.v - 25 : hsv.v + 55, v3 = (hsv.v - 75 >= 20) ? hsv.v - 75 : hsv.v + 5, v4 = Math.max(hsv.v - 10, 20);
        return new dxc.Palette([new dxc.fromHsv(hsv.h, s, v1), new dxc.fromHsv(hsv.h, s, v2), base, new dxc.fromHsv(hsv.h, s, v3), new dxc.fromHsv(hsv.h, s, v4)]);
    }}, generate:function (base, type) {
        if (lang.isFunction(type)) {
            return type({base:base});
        } else {
            if (dxc.Palette.generators[type]) {
                return dxc.Palette.generators[type]({base:base});
            }
        }
        throw new Error("dojox.color.Palette.generate: the specified generator ('" + type + "') does not exist.");
    }});
    return dxc.Palette;
});

