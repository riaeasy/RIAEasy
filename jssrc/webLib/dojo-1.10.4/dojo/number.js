//>>built

define("dojo/number", ["./_base/lang", "./i18n", "./i18n!./cldr/nls/number", "./string", "./regexp"], function (lang, i18n, nlsNumber, dstring, dregexp) {
    var number = {};
    lang.setObject("dojo.number", number);
    number.format = function (value, options) {
        options = lang.mixin({}, options || {});
        var locale = i18n.normalizeLocale(options.locale), bundle = i18n.getLocalization("dojo.cldr", "number", locale);
        options.customs = bundle;
        var pattern = options.pattern || bundle[(options.type || "decimal") + "Format"];
        if (isNaN(value) || Math.abs(value) == Infinity) {
            return null;
        }
        return number._applyPattern(value, pattern, options);
    };
    number._numberPatternRE = /[#0,]*[#0](?:\.0*#*)?/;
    number._applyPattern = function (value, pattern, options) {
        options = options || {};
        var group = options.customs.group, decimal = options.customs.decimal, patternList = pattern.split(";"), positivePattern = patternList[0];
        pattern = patternList[(value < 0) ? 1 : 0] || ("-" + positivePattern);
        if (pattern.indexOf("%") != -1) {
            value *= 100;
        } else {
            if (pattern.indexOf("\u2030") != -1) {
                value *= 1000;
            } else {
                if (pattern.indexOf("\xa4") != -1) {
                    group = options.customs.currencyGroup || group;
                    decimal = options.customs.currencyDecimal || decimal;
                    pattern = pattern.replace(/\u00a4{1,3}/, function (match) {
                        var prop = ["symbol", "currency", "displayName"][match.length - 1];
                        return options[prop] || options.currency || "";
                    });
                } else {
                    if (pattern.indexOf("E") != -1) {
                        throw new Error("exponential notation not supported");
                    }
                }
            }
        }
        var numberPatternRE = number._numberPatternRE;
        var numberPattern = positivePattern.match(numberPatternRE);
        if (!numberPattern) {
            throw new Error("unable to find a number expression in pattern: " + pattern);
        }
        if (options.fractional === false) {
            options.places = 0;
        }
        return pattern.replace(numberPatternRE, number._formatAbsolute(value, numberPattern[0], {decimal:decimal, group:group, places:options.places, round:options.round}));
    };
    number.round = function (value, places, increment) {
        var factor = 10 / (increment || 10);
        return (factor * +value).toFixed(places) / factor;
    };
    if ((0.9).toFixed() == 0) {
        var round = number.round;
        number.round = function (v, p, m) {
            var d = Math.pow(10, -p || 0), a = Math.abs(v);
            if (!v || a >= d) {
                d = 0;
            } else {
                a /= d;
                if (a < 0.5 || a >= 0.95) {
                    d = 0;
                }
            }
            return round(v, p, m) + (v > 0 ? d : -d);
        };
    }
    number._formatAbsolute = function (value, pattern, options) {
        options = options || {};
        if (options.places === true) {
            options.places = 0;
        }
        if (options.places === Infinity) {
            options.places = 6;
        }
        var patternParts = pattern.split("."), comma = typeof options.places == "string" && options.places.indexOf(","), maxPlaces = options.places;
        if (comma) {
            maxPlaces = options.places.substring(comma + 1);
        } else {
            if (!(maxPlaces >= 0)) {
                maxPlaces = (patternParts[1] || []).length;
            }
        }
        if (!(options.round < 0)) {
            value = number.round(value, maxPlaces, options.round);
        }
        var valueParts = String(Math.abs(value)).split("."), fractional = valueParts[1] || "";
        if (patternParts[1] || options.places) {
            if (comma) {
                options.places = options.places.substring(0, comma);
            }
            var pad = options.places !== undefined ? options.places : (patternParts[1] && patternParts[1].lastIndexOf("0") + 1);
            if (pad > fractional.length) {
                valueParts[1] = dstring.pad(fractional, pad, "0", true);
            }
            if (maxPlaces < fractional.length) {
                valueParts[1] = fractional.substr(0, maxPlaces);
            }
        } else {
            if (valueParts[1]) {
                valueParts.pop();
            }
        }
        var patternDigits = patternParts[0].replace(",", "");
        pad = patternDigits.indexOf("0");
        if (pad != -1) {
            pad = patternDigits.length - pad;
            if (pad > valueParts[0].length) {
                valueParts[0] = dstring.pad(valueParts[0], pad);
            }
            if (patternDigits.indexOf("#") == -1) {
                valueParts[0] = valueParts[0].substr(valueParts[0].length - pad);
            }
        }
        var index = patternParts[0].lastIndexOf(","), groupSize, groupSize2;
        if (index != -1) {
            groupSize = patternParts[0].length - index - 1;
            var remainder = patternParts[0].substr(0, index);
            index = remainder.lastIndexOf(",");
            if (index != -1) {
                groupSize2 = remainder.length - index - 1;
            }
        }
        var pieces = [];
        for (var whole = valueParts[0]; whole; ) {
            var off = whole.length - groupSize;
            pieces.push((off > 0) ? whole.substr(off) : whole);
            whole = (off > 0) ? whole.slice(0, off) : "";
            if (groupSize2) {
                groupSize = groupSize2;
                delete groupSize2;
            }
        }
        valueParts[0] = pieces.reverse().join(options.group || ",");
        return valueParts.join(options.decimal || ".");
    };
    number.regexp = function (options) {
        return number._parseInfo(options).regexp;
    };
    number._parseInfo = function (options) {
        options = options || {};
        var locale = i18n.normalizeLocale(options.locale), bundle = i18n.getLocalization("dojo.cldr", "number", locale), pattern = options.pattern || bundle[(options.type || "decimal") + "Format"], group = bundle.group, decimal = bundle.decimal, factor = 1;
        if (pattern.indexOf("%") != -1) {
            factor /= 100;
        } else {
            if (pattern.indexOf("\u2030") != -1) {
                factor /= 1000;
            } else {
                var isCurrency = pattern.indexOf("\xa4") != -1;
                if (isCurrency) {
                    group = bundle.currencyGroup || group;
                    decimal = bundle.currencyDecimal || decimal;
                }
            }
        }
        var patternList = pattern.split(";");
        if (patternList.length == 1) {
            patternList.push("-" + patternList[0]);
        }
        var re = dregexp.buildGroupRE(patternList, function (pattern) {
            pattern = "(?:" + dregexp.escapeString(pattern, ".") + ")";
            return pattern.replace(number._numberPatternRE, function (format) {
                var flags = {signed:false, separator:options.strict ? group : [group, ""], fractional:options.fractional, decimal:decimal, exponent:false}, parts = format.split("."), places = options.places;
                if (parts.length == 1 && factor != 1) {
                    parts[1] = "###";
                }
                if (parts.length == 1 || places === 0) {
                    flags.fractional = false;
                } else {
                    if (places === undefined) {
                        places = options.pattern ? parts[1].lastIndexOf("0") + 1 : Infinity;
                    }
                    if (places && options.fractional == undefined) {
                        flags.fractional = true;
                    }
                    if (!options.places && (places < parts[1].length)) {
                        places += "," + parts[1].length;
                    }
                    flags.places = places;
                }
                var groups = parts[0].split(",");
                if (groups.length > 1) {
                    flags.groupSize = groups.pop().length;
                    if (groups.length > 1) {
                        flags.groupSize2 = groups.pop().length;
                    }
                }
                return "(" + number._realNumberRegexp(flags) + ")";
            });
        }, true);
        if (isCurrency) {
            re = re.replace(/([\s\xa0]*)(\u00a4{1,3})([\s\xa0]*)/g, function (match, before, target, after) {
                var prop = ["symbol", "currency", "displayName"][target.length - 1], symbol = dregexp.escapeString(options[prop] || options.currency || "");
                before = before ? "[\\s\\xa0]" : "";
                after = after ? "[\\s\\xa0]" : "";
                if (!options.strict) {
                    if (before) {
                        before += "*";
                    }
                    if (after) {
                        after += "*";
                    }
                    return "(?:" + before + symbol + after + ")?";
                }
                return before + symbol + after;
            });
        }
        return {regexp:re.replace(/[\xa0 ]/g, "[\\s\\xa0]"), group:group, decimal:decimal, factor:factor};
    };
    number.parse = function (expression, options) {
        var info = number._parseInfo(options), results = (new RegExp("^" + info.regexp + "$")).exec(expression);
        if (!results) {
            return NaN;
        }
        var absoluteMatch = results[1];
        if (!results[1]) {
            if (!results[2]) {
                return NaN;
            }
            absoluteMatch = results[2];
            info.factor *= -1;
        }
        absoluteMatch = absoluteMatch.replace(new RegExp("[" + info.group + "\\s\\xa0" + "]", "g"), "").replace(info.decimal, ".");
        return absoluteMatch * info.factor;
    };
    number._realNumberRegexp = function (flags) {
        flags = flags || {};
        if (!("places" in flags)) {
            flags.places = Infinity;
        }
        if (typeof flags.decimal != "string") {
            flags.decimal = ".";
        }
        if (!("fractional" in flags) || /^0/.test(flags.places)) {
            flags.fractional = [true, false];
        }
        if (!("exponent" in flags)) {
            flags.exponent = [true, false];
        }
        if (!("eSigned" in flags)) {
            flags.eSigned = [true, false];
        }
        var integerRE = number._integerRegexp(flags), decimalRE = dregexp.buildGroupRE(flags.fractional, function (q) {
            var re = "";
            if (q && (flags.places !== 0)) {
                re = "\\" + flags.decimal;
                if (flags.places == Infinity) {
                    re = "(?:" + re + "\\d+)?";
                } else {
                    re += "\\d{" + flags.places + "}";
                }
            }
            return re;
        }, true);
        var exponentRE = dregexp.buildGroupRE(flags.exponent, function (q) {
            if (q) {
                return "([eE]" + number._integerRegexp({signed:flags.eSigned}) + ")";
            }
            return "";
        });
        var realRE = integerRE + decimalRE;
        if (decimalRE) {
            realRE = "(?:(?:" + realRE + ")|(?:" + decimalRE + "))";
        }
        return realRE + exponentRE;
    };
    number._integerRegexp = function (flags) {
        flags = flags || {};
        if (!("signed" in flags)) {
            flags.signed = [true, false];
        }
        if (!("separator" in flags)) {
            flags.separator = "";
        } else {
            if (!("groupSize" in flags)) {
                flags.groupSize = 3;
            }
        }
        var signRE = dregexp.buildGroupRE(flags.signed, function (q) {
            return q ? "[-+]" : "";
        }, true);
        var numberRE = dregexp.buildGroupRE(flags.separator, function (sep) {
            if (!sep) {
                return "(?:\\d+)";
            }
            sep = dregexp.escapeString(sep);
            if (sep == " ") {
                sep = "\\s";
            } else {
                if (sep == "\xa0") {
                    sep = "\\s\\xa0";
                }
            }
            var grp = flags.groupSize, grp2 = flags.groupSize2;
            if (grp2) {
                var grp2RE = "(?:0|[1-9]\\d{0," + (grp2 - 1) + "}(?:[" + sep + "]\\d{" + grp2 + "})*[" + sep + "]\\d{" + grp + "})";
                return ((grp - grp2) > 0) ? "(?:" + grp2RE + "|(?:0|[1-9]\\d{0," + (grp - 1) + "}))" : grp2RE;
            }
            return "(?:0|[1-9]\\d{0," + (grp - 1) + "}(?:[" + sep + "]\\d{" + grp + "})*)";
        }, true);
        return signRE + numberRE;
    };
    return number;
});

