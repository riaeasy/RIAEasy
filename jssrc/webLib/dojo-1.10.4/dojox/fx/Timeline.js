//>>built

define("dojox/fx/Timeline", ["dojo/_base/lang", "dojo/fx/easing", "dojo/_base/fx", "dojo/dom", "./_base", "dojo/_base/connect", "dojo/_base/html", "dojo/_base/array", "dojo/_base/Color"], function (lang, easingUtil, baseFx, dom, dojoxFx, connectUtil, htmlUtil, arrayUtil, Color) {
    dojoxFx.animateTimeline = function (options, node) {
        var _curve = new Timeline(options.keys);
        var ani = baseFx.animateProperty({node:dom.byId(node || options.node), duration:options.duration || 1000, properties:_curve._properties, easing:easingUtil.linear, onAnimate:function (v) {
        }});
        connectUtil.connect(ani, "onEnd", function (node) {
            var sty = ani.curve.getValue(ani.reversed ? 0 : 1);
            htmlUtil.style(node, sty);
        });
        connectUtil.connect(ani, "beforeBegin", function () {
            if (ani.curve) {
                delete ani.curve;
            }
            ani.curve = _curve;
            _curve.ani = ani;
        });
        return ani;
    };
    var Timeline = function (keys) {
        this.keys = lang.isArray(keys) ? this.flatten(keys) : keys;
    };
    Timeline.prototype.flatten = function (keys) {
        var getPercent = function (str, idx) {
            if (str == "from") {
                return 0;
            }
            if (str == "to") {
                return 1;
            }
            if (str === undefined) {
                return idx == 0 ? 0 : idx / (keys.length - 1);
            }
            return parseInt(str, 10) * 0.01;
        };
        var p = {}, o = {};
        arrayUtil.forEach(keys, function (k, i) {
            var step = getPercent(k.step, i);
            var ease = easingUtil[k.ease] || easingUtil.linear;
            for (var nm in k) {
                if (nm == "step" || nm == "ease" || nm == "from" || nm == "to") {
                    continue;
                }
                if (!o[nm]) {
                    o[nm] = {steps:[], values:[], eases:[], ease:ease};
                    p[nm] = {};
                    if (!/#/.test(k[nm])) {
                        p[nm].units = o[nm].units = /\D{1,}/.exec(k[nm]).join("");
                    } else {
                        p[nm].units = o[nm].units = "isColor";
                    }
                }
                o[nm].eases.push(easingUtil[k.ease || "linear"]);
                o[nm].steps.push(step);
                if (p[nm].units == "isColor") {
                    o[nm].values.push(new Color(k[nm]));
                } else {
                    o[nm].values.push(parseInt(/\d{1,}/.exec(k[nm]).join("")));
                }
                if (p[nm].start === undefined) {
                    p[nm].start = o[nm].values[o[nm].values.length - 1];
                } else {
                    p[nm].end = o[nm].values[o[nm].values.length - 1];
                }
            }
        });
        this._properties = p;
        return o;
    };
    Timeline.prototype.getValue = function (p) {
        p = this.ani._reversed ? 1 - p : p;
        var o = {}, self = this;
        var getProp = function (nm, i) {
            return self._properties[nm].units != "isColor" ? self.keys[nm].values[i] + self._properties[nm].units : self.keys[nm].values[i].toCss();
        };
        for (var nm in this.keys) {
            var k = this.keys[nm];
            for (var i = 0; i < k.steps.length; i++) {
                var step = k.steps[i];
                var ns = k.steps[i + 1];
                var next = i < k.steps.length ? true : false;
                var ease = k.eases[i] || function (n) {
                    return n;
                };
                if (p == step) {
                    o[nm] = getProp(nm, i);
                    if (!next || (next && this.ani._reversed)) {
                        break;
                    }
                } else {
                    if (p > step) {
                        if (next && p < k.steps[i + 1]) {
                            var end = k.values[i + 1];
                            var beg = k.values[i];
                            var seg = (1 / (ns - step)) * (p - step);
                            seg = ease(seg);
                            if (beg instanceof Color) {
                                o[nm] = Color.blendColors(beg, end, seg).toCss(false);
                            } else {
                                var df = end - beg;
                                o[nm] = beg + seg * df + this._properties[nm].units;
                            }
                            break;
                        } else {
                            o[nm] = getProp(nm, i);
                        }
                    } else {
                        if ((next && !this.ani._reversed) || (!next && this.ani._reversed)) {
                            o[nm] = getProp(nm, i);
                        }
                    }
                }
            }
        }
        return o;
    };
    dojoxFx._Timeline = Timeline;
    return dojoxFx;
});

