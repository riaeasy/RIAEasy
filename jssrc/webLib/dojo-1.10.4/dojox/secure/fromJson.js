//>>built

define("dojox/secure/fromJson", ["dijit", "dojo", "dojox"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.secure.fromJson");
    dojox.secure.fromJson = typeof JSON != "undefined" ? JSON.parse : (function () {
        var number = "(?:-?\\b(?:0|[1-9][0-9]*)(?:\\.[0-9]+)?(?:[eE][+-]?[0-9]+)?\\b)";
        var oneChar = "(?:[^\\0-\\x08\\x0a-\\x1f\"\\\\]" + "|\\\\(?:[\"/\\\\bfnrt]|u[0-9A-Fa-f]{4}))";
        var string = "(?:\"" + oneChar + "*\")";
        var jsonToken = new RegExp("(?:false|true|null|[\\{\\}\\[\\]]" + "|" + number + "|" + string + ")", "g");
        var escapeSequence = new RegExp("\\\\(?:([^u])|u(.{4}))", "g");
        var escapes = {"\"":"\"", "/":"/", "\\":"\\", "b":"\b", "f":"\f", "n":"\n", "r":"\r", "t":"\t"};
        function unescapeOne(_, ch, hex) {
            return ch ? escapes[ch] : String.fromCharCode(parseInt(hex, 16));
        }
        var EMPTY_STRING = new String("");
        var SLASH = "\\";
        var firstTokenCtors = {"{":Object, "[":Array};
        var hop = Object.hasOwnProperty;
        return function (json, opt_reviver) {
            var toks = json.match(jsonToken);
            var result;
            var tok = toks[0];
            var topLevelPrimitive = false;
            if ("{" === tok) {
                result = {};
            } else {
                if ("[" === tok) {
                    result = [];
                } else {
                    result = [];
                    topLevelPrimitive = true;
                }
            }
            var key;
            var stack = [result];
            for (var i = 1 - topLevelPrimitive, n = toks.length; i < n; ++i) {
                tok = toks[i];
                var cont;
                switch (tok.charCodeAt(0)) {
                  default:
                    cont = stack[0];
                    cont[key || cont.length] = +(tok);
                    key = void 0;
                    break;
                  case 34:
                    tok = tok.substring(1, tok.length - 1);
                    if (tok.indexOf(SLASH) !== -1) {
                        tok = tok.replace(escapeSequence, unescapeOne);
                    }
                    cont = stack[0];
                    if (!key) {
                        if (cont instanceof Array) {
                            key = cont.length;
                        } else {
                            key = tok || EMPTY_STRING;
                            break;
                        }
                    }
                    cont[key] = tok;
                    key = void 0;
                    break;
                  case 91:
                    cont = stack[0];
                    stack.unshift(cont[key || cont.length] = []);
                    key = void 0;
                    break;
                  case 93:
                    stack.shift();
                    break;
                  case 102:
                    cont = stack[0];
                    cont[key || cont.length] = false;
                    key = void 0;
                    break;
                  case 110:
                    cont = stack[0];
                    cont[key || cont.length] = null;
                    key = void 0;
                    break;
                  case 116:
                    cont = stack[0];
                    cont[key || cont.length] = true;
                    key = void 0;
                    break;
                  case 123:
                    cont = stack[0];
                    stack.unshift(cont[key || cont.length] = {});
                    key = void 0;
                    break;
                  case 125:
                    stack.shift();
                    break;
                }
            }
            if (topLevelPrimitive) {
                if (stack.length !== 1) {
                    throw new Error();
                }
                result = result[0];
            } else {
                if (stack.length) {
                    throw new Error();
                }
            }
            if (opt_reviver) {
                var walk = function (holder, key) {
                    var value = holder[key];
                    if (value && typeof value === "object") {
                        var toDelete = null;
                        for (var k in value) {
                            if (hop.call(value, k) && value !== holder) {
                                var v = walk(value, k);
                                if (v !== void 0) {
                                    value[k] = v;
                                } else {
                                    if (!toDelete) {
                                        toDelete = [];
                                    }
                                    toDelete.push(k);
                                }
                            }
                        }
                        if (toDelete) {
                            for (var i = toDelete.length; --i >= 0; ) {
                                delete value[toDelete[i]];
                            }
                        }
                    }
                    return opt_reviver.call(holder, key, value);
                };
                result = walk({"":result}, "");
            }
            return result;
        };
    })();
});

