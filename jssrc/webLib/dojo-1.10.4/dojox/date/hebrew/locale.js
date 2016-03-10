//>>built

define("dojox/date/hebrew/locale", ["../..", "dojo/_base/lang", "dojo/_base/array", "dojo/date", "dojo/i18n", "dojo/regexp", "dojo/string", "./Date", "./numerals", "dojo/i18n!dojo/cldr/nls/hebrew"], function (dojox, lang, arr, dd, i18n, regexp, string, HDate, numerals) {
    var hlocale = lang.getObject("date.hebrew.locale", true, dojox);
    i18n.getLocalization("dojo.cldr", "hebrew");
    function formatPattern(dateObject, bundle, locale, fullYear, pattern) {
        return pattern.replace(/([a-z])\1*/ig, function (match) {
            var s, pad;
            var c = match.charAt(0);
            var l = match.length;
            var widthList = ["abbr", "wide", "narrow"];
            switch (c) {
              case "G":
                s = bundle[(l < 4) ? "eraAbbr" : "eraNames"][0];
                break;
              case "y":
                if (locale.match(/^he(?:-.+)?$/)) {
                    s = numerals.getYearHebrewLetters(dateObject.getFullYear());
                } else {
                    s = String(dateObject.getFullYear());
                }
                break;
              case "M":
                var m = dateObject.getMonth();
                if (l < 3) {
                    if (!dateObject.isLeapYear(dateObject.getFullYear()) && m > 5) {
                        m--;
                    }
                    if (locale.match(/^he(?:-.+)?$/)) {
                        s = numerals.getMonthHebrewLetters(m);
                    } else {
                        s = m + 1;
                        pad = true;
                    }
                } else {
                    var monthNames = hlocale.getNames("months", widthList[l - 3], "format", locale, dateObject);
                    s = monthNames[m];
                }
                break;
              case "d":
                if (locale.match(/^he(?:-.+)?$/)) {
                    s = dateObject.getDateLocalized(locale);
                } else {
                    s = dateObject.getDate();
                    pad = true;
                }
                break;
              case "E":
                var d = dateObject.getDay();
                if (l < 3) {
                    s = d + 1;
                    pad = true;
                } else {
                    var propD = ["days", "format", widthList[l - 3]].join("-");
                    s = bundle[propD][d];
                }
                break;
              case "a":
                var timePeriod = (dateObject.getHours() < 12) ? "am" : "pm";
                s = bundle["dayPeriods-format-wide-" + timePeriod];
                break;
              case "h":
              case "H":
              case "K":
              case "k":
                var h = dateObject.getHours();
                switch (c) {
                  case "h":
                    s = (h % 12) || 12;
                    break;
                  case "H":
                    s = h;
                    break;
                  case "K":
                    s = (h % 12);
                    break;
                  case "k":
                    s = h || 24;
                    break;
                }
                pad = true;
                break;
              case "m":
                s = dateObject.getMinutes();
                pad = true;
                break;
              case "s":
                s = dateObject.getSeconds();
                pad = true;
                break;
              case "S":
                s = Math.round(dateObject.getMilliseconds() * Math.pow(10, l - 3));
                pad = true;
                break;
              case "z":
                s = "";
                break;
              default:
                throw new Error("dojox.date.hebrew.locale.formatPattern: invalid pattern char: " + pattern);
            }
            if (pad) {
                s = string.pad(s, l);
            }
            return s;
        });
    }
    hlocale.format = function (dateObject, options) {
        options = options || {};
        var locale = i18n.normalizeLocale(options.locale);
        var formatLength = options.formatLength || "short";
        var bundle = hlocale._getHebrewBundle(locale);
        var str = [];
        var sauce = lang.hitch(this, formatPattern, dateObject, bundle, locale, options.fullYear);
        if (options.selector == "year") {
            var year = dateObject.getFullYear();
            return locale.match(/^he(?:-.+)?$/) ? numerals.getYearHebrewLetters(year) : year;
        }
        if (options.selector != "time") {
            var datePattern = options.datePattern || bundle["dateFormat-" + formatLength];
            if (datePattern) {
                str.push(_processPattern(datePattern, sauce));
            }
        }
        if (options.selector != "date") {
            var timePattern = options.timePattern || bundle["timeFormat-" + formatLength];
            if (timePattern) {
                str.push(_processPattern(timePattern, sauce));
            }
        }
        var result = str.join(" ");
        return result;
    };
    hlocale.regexp = function (options) {
        return hlocale._parseInfo(options).regexp;
    };
    hlocale._parseInfo = function (options) {
        options = options || {};
        var locale = i18n.normalizeLocale(options.locale);
        var bundle = hlocale._getHebrewBundle(locale);
        var formatLength = options.formatLength || "short";
        var datePattern = options.datePattern || bundle["dateFormat-" + formatLength];
        var timePattern = options.timePattern || bundle["timeFormat-" + formatLength];
        var pattern;
        if (options.selector == "date") {
            pattern = datePattern;
        } else {
            if (options.selector == "time") {
                pattern = timePattern;
            } else {
                pattern = (timePattern === undefined) ? datePattern : datePattern + " " + timePattern;
            }
        }
        var tokens = [];
        var re = _processPattern(pattern, lang.hitch(this, _buildDateTimeRE, tokens, bundle, options));
        return {regexp:re, tokens:tokens, bundle:bundle};
    };
    hlocale.parse = function (value, options) {
        value = value.replace(/[\u200E\u200F\u202A-\u202E]/g, "");
        if (!options) {
            options = {};
        }
        var info = hlocale._parseInfo(options);
        var tokens = info.tokens, bundle = info.bundle;
        var re = new RegExp("^" + info.regexp + "$");
        var match = re.exec(value);
        var locale = i18n.normalizeLocale(options.locale);
        if (!match) {
            return null;
        }
        var date, date1;
        var result = [5730, 3, 23, 0, 0, 0, 0];
        var amPm = "";
        var mLength = 0;
        var widthList = ["abbr", "wide", "narrow"];
        var valid = arr.every(match, function (v, i) {
            if (!i) {
                return true;
            }
            var token = tokens[i - 1];
            var l = token.length;
            switch (token.charAt(0)) {
              case "y":
                if (locale.match(/^he(?:-.+)?$/)) {
                    result[0] = numerals.parseYearHebrewLetters(v);
                } else {
                    result[0] = Number(v);
                }
                break;
              case "M":
                if (l > 2) {
                    var months = hlocale.getNames("months", widthList[l - 3], "format", locale, new HDate(5769, 1, 1)), leapmonths = hlocale.getNames("months", widthList[l - 3], "format", locale, new HDate(5768, 1, 1));
                    if (!options.strict) {
                        v = v.replace(".", "").toLowerCase();
                        months = arr.map(months, function (s) {
                            return s ? s.replace(".", "").toLowerCase() : s;
                        });
                        leapmonths = arr.map(leapmonths, function (s) {
                            return s ? s.replace(".", "").toLowerCase() : s;
                        });
                    }
                    var monthName = v;
                    v = arr.indexOf(months, monthName);
                    if (v == -1) {
                        v = arr.indexOf(leapmonths, monthName);
                        if (v == -1) {
                            return false;
                        }
                    }
                    mLength = l;
                } else {
                    if (locale.match(/^he(?:-.+)?$/)) {
                        v = numerals.parseMonthHebrewLetters(v);
                    } else {
                        v--;
                    }
                }
                result[1] = Number(v);
                break;
              case "D":
                result[1] = 0;
              case "d":
                if (locale.match(/^he(?:-.+)?$/)) {
                    result[2] = numerals.parseDayHebrewLetters(v);
                } else {
                    result[2] = Number(v);
                }
                break;
              case "a":
                var am = options.am || bundle["dayPeriods-format-wide-am"], pm = options.pm || bundle["dayPeriods-format-wide-pm"];
                if (!options.strict) {
                    var period = /\./g;
                    v = v.replace(period, "").toLowerCase();
                    am = am.replace(period, "").toLowerCase();
                    pm = pm.replace(period, "").toLowerCase();
                }
                if (options.strict && v != am && v != pm) {
                    return false;
                }
                amPm = (v == pm) ? "p" : (v == am) ? "a" : "";
                break;
              case "K":
                if (v == 24) {
                    v = 0;
                }
              case "h":
              case "H":
              case "k":
                result[3] = Number(v);
                break;
              case "m":
                result[4] = Number(v);
                break;
              case "s":
                result[5] = Number(v);
                break;
              case "S":
                result[6] = Number(v);
            }
            return true;
        });
        var hours = +result[3];
        if (amPm === "p" && hours < 12) {
            result[3] = hours + 12;
        } else {
            if (amPm === "a" && hours == 12) {
                result[3] = 0;
            }
        }
        var dateObject = new HDate(result[0], result[1], result[2], result[3], result[4], result[5], result[6]);
        if (mLength < 3 && result[1] >= 5 && !dateObject.isLeapYear(dateObject.getFullYear())) {
            dateObject.setMonth(result[1] + 1);
        }
        return dateObject;
    };
    function _processPattern(pattern, applyPattern, applyLiteral, applyAll) {
        var identity = function (x) {
            return x;
        };
        applyPattern = applyPattern || identity;
        applyLiteral = applyLiteral || identity;
        applyAll = applyAll || identity;
        var chunks = pattern.match(/(''|[^'])+/g);
        var literal = pattern.charAt(0) == "'";
        arr.forEach(chunks, function (chunk, i) {
            if (!chunk) {
                chunks[i] = "";
            } else {
                chunks[i] = (literal ? applyLiteral : applyPattern)(chunk);
                literal = !literal;
            }
        });
        return applyAll(chunks.join(""));
    }
    function _buildDateTimeRE(tokens, bundle, options, pattern) {
        pattern = regexp.escapeString(pattern);
        var locale = i18n.normalizeLocale(options.locale);
        return pattern.replace(/([a-z])\1*/ig, function (match) {
            var s;
            var c = match.charAt(0);
            var l = match.length;
            var p2 = "", p3 = "";
            if (options.strict) {
                if (l > 1) {
                    p2 = "0" + "{" + (l - 1) + "}";
                }
                if (l > 2) {
                    p3 = "0" + "{" + (l - 2) + "}";
                }
            } else {
                p2 = "0?";
                p3 = "0{0,2}";
            }
            switch (c) {
              case "y":
                s = "\\S+";
                break;
              case "M":
                if (locale.match("^he(?:-.+)?$")) {
                    s = (l > 2) ? "\\S+ ?\\S+" : "\\S{1,4}";
                } else {
                    s = (l > 2) ? "\\S+ ?\\S+" : p2 + "[1-9]|1[0-3]";
                }
                break;
              case "d":
                if (locale.match("^he(?:-.+)?$")) {
                    s = "\\S['\"'\u05f3]{1,2}\\S?";
                } else {
                    s = "[12]\\d|" + p2 + "[1-9]|30";
                }
                break;
              case "E":
                if (locale.match("^he(?:-.+)?$")) {
                    s = (l > 3) ? "\\S+ ?\\S+" : "\\S";
                } else {
                    s = "\\S+";
                }
                break;
              case "h":
                s = p2 + "[1-9]|1[0-2]";
                break;
              case "k":
                s = p2 + "\\d|1[01]";
                break;
              case "H":
                s = p2 + "\\d|1\\d|2[0-3]";
                break;
              case "K":
                s = p2 + "[1-9]|1\\d|2[0-4]";
                break;
              case "m":
              case "s":
                s = p2 + "\\d|[0-5]\\d";
                break;
              case "S":
                s = "\\d{" + l + "}";
                break;
              case "a":
                var am = options.am || bundle["dayPeriods-format-wide-am"], pm = options.pm || bundle["dayPeriods-format-wide-pm"];
                if (options.strict) {
                    s = am + "|" + pm;
                } else {
                    s = am + "|" + pm;
                    if (am != am.toLowerCase()) {
                        s += "|" + am.toLowerCase();
                    }
                    if (pm != pm.toLowerCase()) {
                        s += "|" + pm.toLowerCase();
                    }
                }
                break;
              default:
                s = ".*";
            }
            if (tokens) {
                tokens.push(match);
            }
            return "(" + s + ")";
        }).replace(/[\xa0 ]/g, "[\\s\\xa0]");
    }
    var _customFormats = [];
    hlocale.addCustomFormats = function (packageName, bundleName) {
        _customFormats.push({pkg:packageName, name:bundleName});
    };
    hlocale._getHebrewBundle = function (locale) {
        var hebrew = {};
        arr.forEach(_customFormats, function (desc) {
            var bundle = i18n.getLocalization(desc.pkg, desc.name, locale);
            hebrew = lang.mixin(hebrew, bundle);
        }, this);
        return hebrew;
    };
    hlocale.addCustomFormats("dojo.cldr", "hebrew");
    hlocale.getNames = function (item, type, context, locale, date) {
        var label, lookup = hlocale._getHebrewBundle(locale), props = [item, context, type];
        if (context == "standAlone") {
            var key = props.join("-");
            label = lookup[key];
            if (label[0] == 1) {
                label = undefined;
            }
        }
        props[1] = "format";
        var result = (label || lookup[props.join("-")]).concat();
        if (item == "months") {
            if (date.isLeapYear(date.getFullYear())) {
                props.push("leap");
                result[6] = lookup[props.join("-")];
            } else {
                delete result[5];
            }
        }
        return result;
    };
    return hlocale;
});

