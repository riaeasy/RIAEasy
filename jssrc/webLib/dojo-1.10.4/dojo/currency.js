//>>built

define("dojo/currency", ["./_base/array", "./_base/lang", "./number", "./i18n", "./i18n!./cldr/nls/currency", "./cldr/monetary"], function (darray, lang, dnumber, i18n, nlsCurrency, cldrMonetary) {
    var currency = {};
    lang.setObject("dojo.currency", currency);
    currency._mixInDefaults = function (options) {
        options = options || {};
        options.type = "currency";
        var bundle = i18n.getLocalization("dojo.cldr", "currency", options.locale) || {};
        var iso = options.currency;
        var data = cldrMonetary.getData(iso);
        darray.forEach(["displayName", "symbol", "group", "decimal"], function (prop) {
            data[prop] = bundle[iso + "_" + prop];
        });
        data.fractional = [true, false];
        return lang.mixin(data, options);
    };
    currency.format = function (value, options) {
        return dnumber.format(value, currency._mixInDefaults(options));
    };
    currency.regexp = function (options) {
        return dnumber.regexp(currency._mixInDefaults(options));
    };
    currency.parse = function (expression, options) {
        return dnumber.parse(expression, currency._mixInDefaults(options));
    };
    return currency;
});

