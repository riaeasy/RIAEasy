//>>built

define("dojox/fx/_core", ["dojo/_base/lang", "dojo/_base/array", "./_base"], function (lang, arrayUtil, dojoxFx) {
    var line = function (start, end) {
        this.start = start;
        this.end = end;
        var isArray = lang.isArray(start), d = (isArray ? [] : end - start);
        if (isArray) {
            arrayUtil.forEach(this.start, function (s, i) {
                d[i] = this.end[i] - s;
            }, this);
            this.getValue = function (n) {
                var res = [];
                arrayUtil.forEach(this.start, function (s, i) {
                    res[i] = (d[i] * n) + s;
                }, this);
                return res;
            };
        } else {
            this.getValue = function (n) {
                return (d * n) + this.start;
            };
        }
    };
    dojoxFx._Line = line;
    return line;
});

