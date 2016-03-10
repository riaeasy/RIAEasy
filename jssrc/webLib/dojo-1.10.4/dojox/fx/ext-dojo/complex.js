//>>built

define("dojox/fx/ext-dojo/complex", ["dojo/_base/kernel", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/declare", "dojo/_base/connect", "dojo/_base/Color", "dojo/_base/fx", "dojo/fx"], function (dojo, lang, arrayUtil, declare, connectUtil, Color, baseFx, coreFx) {
    lang.getObject("dojox.fx.ext-dojo.complex", true);
    var da = baseFx.animateProperty;
    dojo.animateProperty = baseFx.animateProperty = function (options) {
        var ani = da(options);
        connectUtil.connect(ani, "beforeBegin", function () {
            ani.curve.getValue = function (r) {
                var ret = {};
                for (var p in this._properties) {
                    var prop = this._properties[p], start = prop.start;
                    if (start instanceof dojo.Color) {
                        ret[p] = dojo.blendColors(start, prop.end, r, prop.tempColor).toCss();
                    } else {
                        if (start instanceof dojox.fx._Complex) {
                            ret[p] = start.getValue(r);
                        } else {
                            if (!dojo.isArray(start)) {
                                ret[p] = ((prop.end - start) * r) + start + (p != "opacity" ? prop.units || "px" : 0);
                            }
                        }
                    }
                }
                return ret;
            };
            var pm = {};
            for (var p in this.properties) {
                var o = this.properties[p];
                if (typeof (o.start) == "string" && /\(/.test(o.start)) {
                    this.curve._properties[p].start = new dojox.fx._Complex(o);
                }
            }
        });
        return ani;
    };
    return declare("dojox.fx._Complex", null, {PROP:/\([\w|,|+|\-|#|\.|\s]*\)/g, constructor:function (options) {
        var beg = options.start.match(this.PROP);
        var end = options.end.match(this.PROP);
        var begProps = arrayUtil.map(beg, this.getProps, this);
        var endProps = arrayUtil.map(end, this.getProps, this);
        this._properties = {};
        this.strProp = options.start;
        arrayUtil.forEach(begProps, function (prop, i) {
            arrayUtil.forEach(prop, function (p, j) {
                this.strProp = this.strProp.replace(p, "PROP_" + i + "" + j);
                this._properties["PROP_" + i + "" + j] = this.makePropObject(p, endProps[i][j]);
            }, this);
        }, this);
    }, getValue:function (r) {
        var str = this.strProp, u;
        for (var nm in this._properties) {
            var v, o = this._properties[nm];
            if (o.units == "isColor") {
                v = Color.blendColors(o.beg, o.end, r).toCss(false);
                u = "";
            } else {
                v = ((o.end - o.beg) * r) + o.beg;
                u = o.units;
            }
            str = str.replace(nm, v + u);
        }
        return str;
    }, makePropObject:function (beg, end) {
        var b = this.getNumAndUnits(beg);
        var e = this.getNumAndUnits(end);
        return {beg:b.num, end:e.num, units:b.units};
    }, getProps:function (str) {
        str = str.substring(1, str.length - 1);
        var s;
        if (/,/.test(str)) {
            str = str.replace(/\s/g, "");
            s = str.split(",");
        } else {
            str = str.replace(/\s{2,}/g, " ");
            s = str.split(" ");
        }
        return s;
    }, getNumAndUnits:function (prop) {
        if (!prop) {
            return {};
        }
        if (/#/.test(prop)) {
            return {num:new Color(prop), units:"isColor"};
        }
        var o = {num:parseFloat(/-*[\d\.\d|\d]{1,}/.exec(prop).join(""))};
        o.units = /[a-z]{1,}/.exec(prop);
        o.units = o.units && o.units.length ? o.units.join("") : "";
        return o;
    }});
});

