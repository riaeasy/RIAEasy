//>>built

define("dojox/math/random/Simple", ["dojo"], function (dojo) {
    return dojo.declare("dojox.math.random.Simple", null, {destroy:function () {
    }, nextBytes:function (byteArray) {
        for (var i = 0, l = byteArray.length; i < l; ++i) {
            byteArray[i] = Math.floor(256 * Math.random());
        }
    }});
});

