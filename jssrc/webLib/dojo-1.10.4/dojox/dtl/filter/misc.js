//>>built

define("dojox/dtl/filter/misc", ["dojo/_base/lang", "dojo/_base/json", "../_base"], function (lang, json, dd) {
    var misc = lang.getObject("filter.misc", true, dd);
    lang.mixin(misc, {filesizeformat:function (value) {
        value = parseFloat(value);
        if (value < 1024) {
            return (value == 1) ? value + " byte" : value + " bytes";
        } else {
            if (value < 1024 * 1024) {
                return (value / 1024).toFixed(1) + " KB";
            } else {
                if (value < 1024 * 1024 * 1024) {
                    return (value / 1024 / 1024).toFixed(1) + " MB";
                }
            }
        }
        return (value / 1024 / 1024 / 1024).toFixed(1) + " GB";
    }, pluralize:function (value, arg) {
        arg = arg || "s";
        if (arg.indexOf(",") == -1) {
            arg = "," + arg;
        }
        var parts = arg.split(",");
        if (parts.length > 2) {
            return "";
        }
        var singular = parts[0];
        var plural = parts[1];
        if (parseInt(value, 10) != 1) {
            return plural;
        }
        return singular;
    }, _phone2numeric:{a:2, b:2, c:2, d:3, e:3, f:3, g:4, h:4, i:4, j:5, k:5, l:5, m:6, n:6, o:6, p:7, r:7, s:7, t:8, u:8, v:8, w:9, x:9, y:9}, phone2numeric:function (value) {
        var dm = dd.filter.misc;
        value = value + "";
        var output = "";
        for (var i = 0; i < value.length; i++) {
            var chr = value.charAt(i).toLowerCase();
            (dm._phone2numeric[chr]) ? output += dm._phone2numeric[chr] : output += value.charAt(i);
        }
        return output;
    }, pprint:function (value) {
        return json.toJson(value);
    }});
    return misc;
});

