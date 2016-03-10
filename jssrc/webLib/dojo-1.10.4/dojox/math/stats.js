//>>built

define("dojox/math/stats", ["dojo", "../main"], function (dojo, dojox) {
    dojo.getObject("math.stats", true, dojox);
    var st = dojox.math.stats;
    dojo.mixin(st, {sd:function (a) {
        return Math.sqrt(st.variance(a));
    }, variance:function (a) {
        var mean = 0, squares = 0;
        dojo.forEach(a, function (item) {
            mean += item;
            squares += Math.pow(item, 2);
        });
        return (squares / a.length) - Math.pow(mean / a.length, 2);
    }, bestFit:function (a, xProp, yProp) {
        xProp = xProp || "x", yProp = yProp || "y";
        if (a[0] !== undefined && typeof (a[0]) == "number") {
            a = dojo.map(a, function (item, idx) {
                return {x:idx, y:item};
            });
        }
        var sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0, stt = 0, sts = 0, n = a.length, t;
        for (var i = 0; i < n; i++) {
            sx += a[i][xProp];
            sy += a[i][yProp];
            sxx += Math.pow(a[i][xProp], 2);
            syy += Math.pow(a[i][yProp], 2);
            sxy += a[i][xProp] * a[i][yProp];
        }
        for (i = 0; i < n; i++) {
            t = a[i][xProp] - sx / n;
            stt += t * t;
            sts += t * a[i][yProp];
        }
        var slope = sts / (stt || 1);
        var d = Math.sqrt((sxx - Math.pow(sx, 2) / n) * (syy - Math.pow(sy, 2) / n));
        if (d === 0) {
            throw new Error("dojox.math.stats.bestFit: the denominator for Pearson's R is 0.");
        }
        var r = (sxy - (sx * sy / n)) / d;
        var r2 = Math.pow(r, 2);
        if (slope < 0) {
            r = -r;
        }
        return {slope:slope, intercept:(sy - sx * slope) / (n || 1), r:r, r2:r2};
    }, forecast:function (a, x, xProp, yProp) {
        var fit = st.bestFit(a, xProp, yProp);
        return (fit.slope * x) + fit.intercept;
    }, mean:function (a) {
        var t = 0;
        dojo.forEach(a, function (v) {
            t += v;
        });
        return t / Math.max(a.length, 1);
    }, min:function (a) {
        return Math.min.apply(null, a);
    }, max:function (a) {
        return Math.max.apply(null, a);
    }, median:function (a) {
        var t = a.slice(0).sort(function (a, b) {
            return a - b;
        });
        return (t[Math.floor(a.length / 2)] + t[Math.ceil(a.length / 2)]) / 2;
    }, mode:function (a) {
        var o = {}, r = 0, m = Number.MIN_VALUE;
        dojo.forEach(a, function (v) {
            (o[v] !== undefined) ? o[v]++ : o[v] = 1;
        });
        for (var p in o) {
            if (m < o[p]) {
                m = o[p], r = p;
            }
        }
        return r;
    }, sum:function (a) {
        var sum = 0;
        dojo.forEach(a, function (n) {
            sum += n;
        });
        return sum;
    }, approxLin:function (a, pos) {
        var p = pos * (a.length - 1), t = Math.ceil(p), f = t - 1;
        if (f < 0) {
            return a[0];
        }
        if (t >= a.length) {
            return a[a.length - 1];
        }
        return a[f] * (t - p) + a[t] * (p - f);
    }, summary:function (a, alreadySorted) {
        if (!alreadySorted) {
            a = a.slice(0);
            a.sort(function (a, b) {
                return a - b;
            });
        }
        var l = st.approxLin, result = {min:a[0], p25:l(a, 0.25), med:l(a, 0.5), p75:l(a, 0.75), max:a[a.length - 1], p10:l(a, 0.1), p90:l(a, 0.9)};
        return result;
    }});
    return dojox.math.stats;
});

