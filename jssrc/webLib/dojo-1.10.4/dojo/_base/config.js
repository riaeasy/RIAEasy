//>>built

define("dojo/_base/config", ["../has", "require"], function (has, require) {
    var result = {};
    if (1) {
        var src = require.rawConfig, p;
        for (p in src) {
            result[p] = src[p];
        }
    } else {
        var adviseHas = function (featureSet, prefix, booting) {
            for (p in featureSet) {
                p != "has" && has.add(prefix + p, featureSet[p], 0, booting);
            }
        };
        var global = (function () {
            return this;
        })();
        result = 1 ? require.rawConfig : global.dojoConfig || global.djConfig || {};
        adviseHas(result, "config", 1);
        adviseHas(result.has, "", 1);
    }
    if (!result.locale && typeof navigator != "undefined") {
        var language = (navigator.language || navigator.userLanguage);
        if (language) {
            result.locale = language.toLowerCase();
        }
    }
    return result;
});

