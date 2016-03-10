//>>built

define("dojox/embed/flashVars", ["dojo"], function (dojo) {
    dojo.deprecated("dojox.embed.flashVars", "Will be removed in 2.0", "2.0");
    var flashVars = {serialize:function (n, o) {
        var esc = function (val) {
            if (typeof val == "string") {
                val = val.replace(/;/g, "_sc_");
                val = val.replace(/\./g, "_pr_");
                val = val.replace(/\:/g, "_cl_");
            }
            return val;
        };
        var df = dojox.embed.flashVars.serialize;
        var txt = "";
        if (dojo.isArray(o)) {
            for (var i = 0; i < o.length; i++) {
                txt += df(n + "." + i, esc(o[i])) + ";";
            }
            return txt.replace(/;{2,}/g, ";");
        } else {
            if (dojo.isObject(o)) {
                for (var nm in o) {
                    txt += df(n + "." + nm, esc(o[nm])) + ";";
                }
                return txt.replace(/;{2,}/g, ";");
            }
        }
        return n + ":" + o;
    }};
    dojo.setObject("dojox.embed.flashVars", flashVars);
    return flashVars;
});

