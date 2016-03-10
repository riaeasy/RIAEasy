//>>built

define("dojox/date/persian/locale", ["../..", "dojo/_base/lang", "dojo/_base/array", "dojo/date", "dojo/i18n", "dojo/regexp", "dojo/string", "./Date", "dojo/i18n!dojo/cldr/nls/persian"], function (dojox, lang, arr, dd, i18n, regexp, string, IDate, bundle) {
    var ilocale = lang.getObject("date.persian.locale", true, dojox);
    function formatPattern(dateObject, bundle, locale, fullYear, pattern) {
        return pattern.replace(/([a-z])\1*/ig, function (match) {
            var s, pad;
            var c = match.charAt(0);
            var l = match.length;
            var widthList = ["abbr", "wide", "narrow"];
            switch (c) {
              case "G":
                s = bundle["eraAbbr"][0];
                break;
              case "y":
                s = String(dateObject.getFullYear());
                break;
              case "M":
                var m = dateObject.getMonth();
                if (l < 3) {
                    s = m + 1;
                    pad = true;
                } else {
                    var propM = ["months", "format", widthList[l - 3]].join("-");
                    s = bundle[propM][m];
                }
                break;
              case "d":
                s = dateObject.getDate(true);
                pad = true;
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
                s = dd.getTimezoneName(dateObject.toGregorian());
                if (s) {
                    break;
                }
                l = 4;
              case "Z":
                var offset = dateObject.toGregorian().getTimezoneOffset();
                var tz = [(offset <= 0 ? "+" : "-"), string.pad(Math.floor(Math.abs(offset) / 60), 2), string.pad(Math.abs(offset) % 60, 2)];
                if (l == 4) {
                    tz.splice(0, 0, "GMT");
                    tz.splice(3, 0, ":");
                }
                s = tz.join("");
                break;
              default:
                throw new Error("dojox.date.persian.locale.formatPattern: invalid pattern char: " + pattern);
            }
            if (pad) {
                s = string.pad(s, l);
            }
            return s;
        });
    }
    ilocale.format = function (dateObject, options) {
        options = options || {};
        var locale = i18n.normalizeLocale(options.locale);
        var formatLength = options.formatLength || "short";
        var bundle = ilocale._getPersianBundle(locale);
        var str = [];
        var sauce = lang.hitch(this, formatPattern, dateObject, bundle, locale, options.fullYear);
        if (options.selector == "year") {
            var year = dateObject.getFullYear();
            return year;
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
    ilocale.regexp = function (options) {
        return ilocale._parseInfo(options).regexp;
    };
    ilocale._parseInfo = function (options) {
        options = options || {};
        var locale = i18n.normalizeLocale(options.locale);
        var bundle = ilocale._getPersianBundle(locale);
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
                pattern = (typeof (timePattern) == "undefined") ? datePattern : datePattern + " " + timePattern;
            }
        }
        var tokens = [];
        var re = _processPattern(pattern, lang.hitch(this, _buildDateTimeRE, tokens, bundle, options));
        return {regexp:re, tokens:tokens, bundle:bundle};
    };
    ilocale.parse = function (value, options) {
        value = value.replace(/[\u200E\u200F\u202A\u202E]/g, "");
        if (!options) {
            options = {};
        }
        var info = ilocale._parseInfo(options);
        var tokens = info.tokens, bundle = info.bundle;
        var regexp = info.regexp.replace(/[\u200E\u200F\u202A\u202E]/g, "");
        var re = new RegExp("^" + regexp + "$");
        var match = re.exec(value);
        var locale = i18n.normalizeLocale(options.locale);
        if (!match) {
            return null;
        }
        var date, date1;
        var result = [1389, 0, 1, 0, 0, 0, 0];
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
                result[0] = Number(v);
                break;
              case "M":
                if (l > 2) {
                    var months = bundle["months-format-" + widthList[l - 3]].concat();
                    if (!options.strict) {
                        v = v.replace(".", "").toLowerCase();
                        months = arr.map(months, function (s) {
                            return s ? s.replace(".", "").toLowerCase() : s;
                        });
                    }
                    v = arr.indexOf(months, v);
                    if (v == -1) {
                        return false;
                    }
                    mLength = l;
                } else {
                    v--;
                }
                result[1] = Number(v);
                break;
              case "D":
                result[1] = 0;
              case "d":
                result[2] = Number(v);
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
        var dateObject = new IDate(result[0], result[1], result[2], result[3], result[4], result[5], result[6]);
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
                s = "\\d+";
                break;
              case "M":
                s = (l > 2) ? "\\S+ ?\\S+" : p2 + "[1-9]|1[0-2]";
                break;
              case "d":
                s = "[12]\\d|" + p2 + "[1-9]|3[01]";
                break;
              case "E":
                s = "\\S+";
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
    ilocale.addCustomFormats = function (packageName, bundleName) {
        _customFormats.push({pkg:packageName, name:bundleName});
    };
    ilocale._getPersianBundle = function (locale) {
        var persian = {};
        arr.forEach(_customFormats, function (desc) {
            var bundle = i18n.getLocalization(desc.pkg, desc.name, locale);
            persian = lang.mixin(persian, bundle);
        }, this);
        return persian;
    };
    ilocale.addCustomFormats("dojo.cldr", "persian");
    ilocale.getNames = function (item, type, context, locale, date) {
        var label;
        var lookup = ilocale._getPersianBundle(locale);
        var props = [item, context, type];
        if (context == "standAlone") {
            var key = props.join("-");
            label = lookup[key];
            if (label[0] == 1) {
                label = undefined;
            }
        }
        props[1] = "format";
        return (label || lookup[props.join("-")]).concat();
    };
    ilocale.weekDays = ilocale.getNames("days", "wide", "format");
    ilocale.months = ilocale.getNames("months", "wide", "format");
    return ilocale;
});

