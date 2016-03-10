//>>built

define("dojox/math/round", ["dojo", "dojox"], function (dojo, dojox) {
    dojo.getObject("math.round", true, dojox);
    dojo.experimental("dojox.math.round");
    dojox.math.round = function (value, places, increment) {
        var wholeFigs = Math.log(Math.abs(value)) / Math.log(10);
        var factor = 10 / (increment || 10);
        var delta = Math.pow(10, -15 + wholeFigs);
        return (factor * (+value + (value > 0 ? delta : -delta))).toFixed(places) / factor;
    };
    if ((0.9).toFixed() == 0) {
        var round = dojox.math.round;
        dojox.math.round = function (v, p, m) {
            var d = Math.pow(10, -p || 0), a = Math.abs(v);
            if (!v || a >= d) {
                d = 0;
            } else {
                a /= d;
                if (a < 0.5 || a >= 0.95) {
                    d = 0;
                }
            }
            return round(v, p, m) + (v > 0 ? d : -d);
        };
    }
    return dojox.math.round;
});

