//>>built

define("dojox/json/query", ["dojo/_base/kernel", "dojo/_base/lang", "dojox", "dojo/_base/array"], function (dojo, lang, dojox) {
    lang.getObject("json", true, dojox);
    dojox.json._slice = function (obj, start, end, step) {
        var len = obj.length, results = [];
        end = end || len;
        start = (start < 0) ? Math.max(0, start + len) : Math.min(len, start);
        end = (end < 0) ? Math.max(0, end + len) : Math.min(len, end);
        for (var i = start; i < end; i += step) {
            results.push(obj[i]);
        }
        return results;
    };
    dojox.json._find = function e(obj, name) {
        var results = [];
        function walk(obj) {
            if (name) {
                if (name === true && !(obj instanceof Array)) {
                    results.push(obj);
                } else {
                    if (obj[name]) {
                        results.push(obj[name]);
                    }
                }
            }
            for (var i in obj) {
                var val = obj[i];
                if (!name) {
                    results.push(val);
                } else {
                    if (val && typeof val == "object") {
                        walk(val);
                    }
                }
            }
        }
        if (name instanceof Array) {
            if (name.length == 1) {
                return obj[name[0]];
            }
            for (var i = 0; i < name.length; i++) {
                results.push(obj[name[i]]);
            }
        } else {
            walk(obj);
        }
        return results;
    };
    dojox.json._distinctFilter = function (array, callback) {
        var outArr = [];
        var primitives = {};
        for (var i = 0, l = array.length; i < l; ++i) {
            var value = array[i];
            if (callback(value, i, array)) {
                if ((typeof value == "object") && value) {
                    if (!value.__included) {
                        value.__included = true;
                        outArr.push(value);
                    }
                } else {
                    if (!primitives[value + typeof value]) {
                        primitives[value + typeof value] = true;
                        outArr.push(value);
                    }
                }
            }
        }
        for (i = 0, l = outArr.length; i < l; ++i) {
            if (outArr[i]) {
                delete outArr[i].__included;
            }
        }
        return outArr;
    };
    return dojox.json.query = function (query, obj) {
        var depth = 0;
        var str = [];
        query = query.replace(/"(\\.|[^"\\])*"|'(\\.|[^'\\])*'|[\[\]]/g, function (t) {
            depth += t == "[" ? 1 : t == "]" ? -1 : 0;
            return (t == "]" && depth > 0) ? "`]" : (t.charAt(0) == "\"" || t.charAt(0) == "'") ? "`" + (str.push(t) - 1) : t;
        });
        var prefix = "";
        function call(name) {
            prefix = name + "(" + prefix;
        }
        function makeRegex(t, a, b, c, d, e, f, g) {
            return str[g].match(/[\*\?]/) || f == "~" ? "/^" + str[g].substring(1, str[g].length - 1).replace(/\\([btnfr\\"'])|([^\w\*\?])/g, "\\$1$2").replace(/([\*\?])/g, "[\\w\\W]$1") + (f == "~" ? "$/i" : "$/") + ".test(" + a + ")" : t;
        }
        query.replace(/(\]|\)|push|pop|shift|splice|sort|reverse)\s*\(/, function () {
            throw new Error("Unsafe function call");
        });
        query = query.replace(/([^<>=]=)([^=])/g, "$1=$2").replace(/@|(\.\s*)?[a-zA-Z\$_]+(\s*:)?/g, function (t) {
            return t.charAt(0) == "." ? t : t == "@" ? "$obj" : (t.match(/:|^(\$|Math|true|false|null)$/) ? "" : "$obj.") + t;
        }).replace(/\.?\.?\[(`\]|[^\]])*\]|\?.*|\.\.([\w\$_]+)|\.\*/g, function (t, a, b) {
            var oper = t.match(/^\.?\.?(\[\s*\^?\?|\^?\?|\[\s*==)(.*?)\]?$/);
            if (oper) {
                var prefix = "";
                if (t.match(/^\./)) {
                    call("dojox.json._find");
                    prefix = ",true)";
                }
                call(oper[1].match(/\=/) ? "dojo.map" : oper[1].match(/\^/) ? "dojox.json._distinctFilter" : "dojo.filter");
                return prefix + ",function($obj){return " + oper[2] + "})";
            }
            oper = t.match(/^\[\s*([\/\\].*)\]/);
            if (oper) {
                return ".concat().sort(function(a,b){" + oper[1].replace(/\s*,?\s*([\/\\])\s*([^,\\\/]+)/g, function (t, a, b) {
                    return "var av= " + b.replace(/\$obj/, "a") + ",bv= " + b.replace(/\$obj/, "b") + ";if(av>bv||bv==null){return " + (a == "/" ? 1 : -1) + ";}\n" + "if(bv>av||av==null){return " + (a == "/" ? -1 : 1) + ";}\n";
                }) + "return 0;})";
            }
            oper = t.match(/^\[(-?[0-9]*):(-?[0-9]*):?(-?[0-9]*)\]/);
            if (oper) {
                call("dojox.json._slice");
                return "," + (oper[1] || 0) + "," + (oper[2] || 0) + "," + (oper[3] || 1) + ")";
            }
            if (t.match(/^\.\.|\.\*|\[\s*\*\s*\]|,/)) {
                call("dojox.json._find");
                return (t.charAt(1) == "." ? ",'" + b + "'" : t.match(/,/) ? "," + t : "") + ")";
            }
            return t;
        }).replace(/(\$obj\s*((\.\s*[\w_$]+\s*)|(\[\s*`([0-9]+)\s*`\]))*)(==|~)\s*`([0-9]+)/g, makeRegex).replace(/`([0-9]+)\s*(==|~)\s*(\$obj\s*((\.\s*[\w_$]+)|(\[\s*`([0-9]+)\s*`\]))*)/g, function (t, a, b, c, d, e, f, g) {
            return makeRegex(t, c, d, e, f, g, b, a);
        });
        query = prefix + (query.charAt(0) == "$" ? "" : "$") + query.replace(/`([0-9]+|\])/g, function (t, a) {
            return a == "]" ? "]" : str[a];
        });
        var executor = eval("1&&function($,$1,$2,$3,$4,$5,$6,$7,$8,$9){var $obj=$;return " + query + "}");
        for (var i = 0; i < arguments.length - 1; i++) {
            arguments[i] = arguments[i + 1];
        }
        return obj ? executor.apply(this, arguments) : executor;
    };
});

