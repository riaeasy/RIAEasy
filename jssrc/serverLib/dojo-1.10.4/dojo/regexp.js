//>>built

define("dojo/regexp", ["./_base/kernel", "./_base/lang"], function (dojo, lang) {
    var regexp = {};
    lang.setObject("dojo.regexp", regexp);
    regexp.escapeString = function (str, except) {
        return str.replace(/([\.$?*|{}\(\)\[\]\\\/\+\-^])/g, function (ch) {
            if (except && except.indexOf(ch) != -1) {
                return ch;
            }
            return "\\" + ch;
        });
    };
    regexp.buildGroupRE = function (arr, re, nonCapture) {
        if (!(arr instanceof Array)) {
            return re(arr);
        }
        var b = [];
        for (var i = 0; i < arr.length; i++) {
            b.push(re(arr[i]));
        }
        return regexp.group(b.join("|"), nonCapture);
    };
    regexp.group = function (expression, nonCapture) {
        return "(" + (nonCapture ? "?:" : "") + expression + ")";
    };
    return regexp;
});

