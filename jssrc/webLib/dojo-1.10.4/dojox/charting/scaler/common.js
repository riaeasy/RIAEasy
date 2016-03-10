//>>built

define("dojox/charting/scaler/common", ["dojo/_base/lang"], function (lang) {
    var eq = function (a, b) {
        return Math.abs(a - b) <= 0.000001 * (Math.abs(a) + Math.abs(b));
    };
    var common = lang.getObject("dojox.charting.scaler.common", true);
    var testedModules = {};
    return lang.mixin(common, {doIfLoaded:function (moduleName, ifloaded, ifnotloaded) {
        if (testedModules[moduleName] == undefined) {
            try {
                testedModules[moduleName] = require(moduleName);
            }
            catch (e) {
                testedModules[moduleName] = null;
            }
        }
        if (testedModules[moduleName]) {
            return ifloaded(testedModules[moduleName]);
        } else {
            return ifnotloaded();
        }
    }, getNumericLabel:function (number, precision, kwArgs) {
        var def = "";
        common.doIfLoaded("dojo/number", function (numberLib) {
            def = (kwArgs.fixed ? numberLib.format(number, {places:precision < 0 ? -precision : 0}) : numberLib.format(number)) || "";
        }, function () {
            def = kwArgs.fixed ? number.toFixed(precision < 0 ? -precision : 0) : number.toString();
        });
        if (kwArgs.labelFunc) {
            var r = kwArgs.labelFunc(def, number, precision);
            if (r) {
                return r;
            }
        }
        if (kwArgs.labels) {
            var l = kwArgs.labels, lo = 0, hi = l.length;
            while (lo < hi) {
                var mid = Math.floor((lo + hi) / 2), val = l[mid].value;
                if (val < number) {
                    lo = mid + 1;
                } else {
                    hi = mid;
                }
            }
            if (lo < l.length && eq(l[lo].value, number)) {
                return l[lo].text;
            }
            --lo;
            if (lo >= 0 && lo < l.length && eq(l[lo].value, number)) {
                return l[lo].text;
            }
            lo += 2;
            if (lo < l.length && eq(l[lo].value, number)) {
                return l[lo].text;
            }
        }
        return def;
    }});
});

