//>>built

define("dojox/validate/_base", ["dojo/_base/lang", "dojo/regexp", "dojo/number", "./regexp"], function (lang, regexp, number, xregexp) {
    var validate = lang.getObject("dojox.validate", true);
    validate.isText = function (value, flags) {
        flags = (typeof flags == "object") ? flags : {};
        if (/^\s*$/.test(value)) {
            return false;
        }
        if (typeof flags.length == "number" && flags.length != value.length) {
            return false;
        }
        if (typeof flags.minlength == "number" && flags.minlength > value.length) {
            return false;
        }
        if (typeof flags.maxlength == "number" && flags.maxlength < value.length) {
            return false;
        }
        return true;
    };
    validate._isInRangeCache = {};
    validate.isInRange = function (value, flags) {
        value = number.parse(value, flags);
        if (isNaN(value)) {
            return false;
        }
        flags = (typeof flags == "object") ? flags : {};
        var max = (typeof flags.max == "number") ? flags.max : Infinity, min = (typeof flags.min == "number") ? flags.min : -Infinity, dec = (typeof flags.decimal == "string") ? flags.decimal : ".", cache = validate._isInRangeCache, cacheIdx = value + "max" + max + "min" + min + "dec" + dec;
        if (typeof cache[cacheIdx] != "undefined") {
            return cache[cacheIdx];
        }
        cache[cacheIdx] = !(value < min || value > max);
        return cache[cacheIdx];
    };
    validate.isNumberFormat = function (value, flags) {
        var re = new RegExp("^" + xregexp.numberFormat(flags) + "$", "i");
        return re.test(value);
    };
    validate.isValidLuhn = function (value) {
        var sum = 0, parity, curDigit;
        if (!lang.isString(value)) {
            value = String(value);
        }
        value = value.replace(/[- ]/g, "");
        parity = value.length % 2;
        for (var i = 0; i < value.length; i++) {
            curDigit = parseInt(value.charAt(i));
            if (i % 2 == parity) {
                curDigit *= 2;
            }
            if (curDigit > 9) {
                curDigit -= 9;
            }
            sum += curDigit;
        }
        return !(sum % 10);
    };
    return validate;
});

