//>>built

define("dojox/encoding/base64", ["dojo/_base/lang"], function (lang) {
    var base64 = lang.getObject("dojox.encoding.base64", true);
    var p = "=";
    var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    base64.encode = function (ba) {
        var s = [], l = ba.length;
        var rm = l % 3;
        var x = l - rm;
        for (var i = 0; i < x; ) {
            var t = ba[i++] << 16 | ba[i++] << 8 | ba[i++];
            s.push(tab.charAt((t >>> 18) & 63));
            s.push(tab.charAt((t >>> 12) & 63));
            s.push(tab.charAt((t >>> 6) & 63));
            s.push(tab.charAt(t & 63));
        }
        switch (rm) {
          case 2:
            var t = ba[i++] << 16 | ba[i++] << 8;
            s.push(tab.charAt((t >>> 18) & 63));
            s.push(tab.charAt((t >>> 12) & 63));
            s.push(tab.charAt((t >>> 6) & 63));
            s.push(p);
            break;
          case 1:
            var t = ba[i++] << 16;
            s.push(tab.charAt((t >>> 18) & 63));
            s.push(tab.charAt((t >>> 12) & 63));
            s.push(p);
            s.push(p);
            break;
        }
        return s.join("");
    };
    base64.decode = function (str) {
        var s = str.split(""), out = [];
        var l = s.length;
        while (s[--l] == p) {
        }
        for (var i = 0; i < l; ) {
            var t = tab.indexOf(s[i++]) << 18;
            if (i <= l) {
                t |= tab.indexOf(s[i++]) << 12;
            }
            if (i <= l) {
                t |= tab.indexOf(s[i++]) << 6;
            }
            if (i <= l) {
                t |= tab.indexOf(s[i++]);
            }
            out.push((t >>> 16) & 255);
            out.push((t >>> 8) & 255);
            out.push(t & 255);
        }
        while (out[out.length - 1] == 0) {
            out.pop();
        }
        return out;
    };
    return base64;
});

