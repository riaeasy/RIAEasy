//>>built

define("dojo/json", ["./has"], function (has) {
    "use strict";
    var hasJSON = typeof JSON != "undefined";
    has.add("json-parse", hasJSON);
    has.add("json-stringify", hasJSON && JSON.stringify({a:0}, function (k, v) {
        return v || 1;
    }) == "{\"a\":1}");
    if (has("json-stringify")) {
        return JSON;
    } else {
        var escapeString = function (str) {
            return ("\"" + str.replace(/(["\\])/g, "\\$1") + "\"").replace(/[\f]/g, "\\f").replace(/[\b]/g, "\\b").replace(/[\n]/g, "\\n").replace(/[\t]/g, "\\t").replace(/[\r]/g, "\\r");
        };
        return {parse:has("json-parse") ? JSON.parse : function (str, strict) {
            if (strict && !/^([\s\[\{]*(?:"(?:\\.|[^"])*"|-?\d[\d\.]*(?:[Ee][+-]?\d+)?|null|true|false|)[\s\]\}]*(?:,|:|$))+$/.test(str)) {
                throw new SyntaxError("Invalid characters in JSON");
            }
            return eval("(" + str + ")");
        }, stringify:function (value, replacer, spacer) {
            var undef;
            if (typeof replacer == "string") {
                spacer = replacer;
                replacer = null;
            }
            function stringify(it, indent, key) {
                if (replacer) {
                    it = replacer(key, it);
                }
                var val, objtype = typeof it;
                if (objtype == "number") {
                    return isFinite(it) ? it + "" : "null";
                }
                if (objtype == "boolean") {
                    return it + "";
                }
                if (it === null) {
                    return "null";
                }
                if (typeof it == "string") {
                    return escapeString(it);
                }
                if (objtype == "function" || objtype == "undefined") {
                    return undef;
                }
                if (typeof it.toJSON == "function") {
                    return stringify(it.toJSON(key), indent, key);
                }
                if (it instanceof Date) {
                    return "\"{FullYear}-{Month+}-{Date}T{Hours}:{Minutes}:{Seconds}Z\"".replace(/\{(\w+)(\+)?\}/g, function (t, prop, plus) {
                        var num = it["getUTC" + prop]() + (plus ? 1 : 0);
                        return num < 10 ? "0" + num : num;
                    });
                }
                if (it.valueOf() !== it) {
                    return stringify(it.valueOf(), indent, key);
                }
                var nextIndent = spacer ? (indent + spacer) : "";
                var sep = spacer ? " " : "";
                var newLine = spacer ? "\n" : "";
                if (it instanceof Array) {
                    var itl = it.length, res = [];
                    for (key = 0; key < itl; key++) {
                        var obj = it[key];
                        val = stringify(obj, nextIndent, key);
                        if (typeof val != "string") {
                            val = "null";
                        }
                        res.push(newLine + nextIndent + val);
                    }
                    return "[" + res.join(",") + newLine + indent + "]";
                }
                var output = [];
                for (key in it) {
                    var keyStr;
                    if (it.hasOwnProperty(key)) {
                        if (typeof key == "number") {
                            keyStr = "\"" + key + "\"";
                        } else {
                            if (typeof key == "string") {
                                keyStr = escapeString(key);
                            } else {
                                continue;
                            }
                        }
                        val = stringify(it[key], nextIndent, key);
                        if (typeof val != "string") {
                            continue;
                        }
                        output.push(newLine + nextIndent + keyStr + ":" + sep + val);
                    }
                }
                return "{" + output.join(",") + newLine + indent + "}";
            }
            return stringify(value, "", "");
        }};
    }
});

