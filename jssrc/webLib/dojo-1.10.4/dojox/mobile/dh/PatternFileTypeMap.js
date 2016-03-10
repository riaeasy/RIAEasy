//>>built

define("dojox/mobile/dh/PatternFileTypeMap", ["dojo/_base/lang"], function (lang) {
    var o = {};
    lang.setObject("dojox.mobile.dh.PatternFileTypeMap", o);
    o.map = {".*.html":"html", ".*.json":"json"};
    o.add = function (key, contentType) {
        this.map[key] = contentType;
    };
    o.getContentType = function (fileName) {
        for (var key in this.map) {
            if ((new RegExp(key)).test(fileName)) {
                return this.map[key];
            }
        }
        return null;
    };
    return o;
});

