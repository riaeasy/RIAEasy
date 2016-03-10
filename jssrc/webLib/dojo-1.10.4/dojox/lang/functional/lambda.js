//>>built

define("dojox/lang/functional/lambda", ["../..", "dojo/_base/lang", "dojo/_base/array"], function (dojox, lang, arr) {
    var df = lang.getObject("lang.functional", true, dojox);
    var lcache = {};
    var split = "ab".split(/a*/).length > 1 ? String.prototype.split : function (sep) {
        var r = this.split.call(this, sep), m = sep.exec(this);
        if (m && m.index == 0) {
            r.unshift("");
        }
        return r;
    };
    var lambda = function (s) {
        var args = [], sects = split.call(s, /\s*->\s*/m);
        if (sects.length > 1) {
            while (sects.length) {
                s = sects.pop();
                args = sects.pop().split(/\s*,\s*|\s+/m);
                if (sects.length) {
                    sects.push("(function(" + args.join(", ") + "){ return (" + s + "); })");
                }
            }
        } else {
            if (s.match(/\b_\b/)) {
                args = ["_"];
            } else {
                var l = s.match(/^\s*(?:[+*\/%&|\^\.=<>]|!=)/m), r = s.match(/[+\-*\/%&|\^\.=<>!]\s*$/m);
                if (l || r) {
                    if (l) {
                        args.push("$1");
                        s = "$1" + s;
                    }
                    if (r) {
                        args.push("$2");
                        s = s + "$2";
                    }
                } else {
                    var vars = s.replace(/(?:\b[A-Z]|\.[a-zA-Z_$])[a-zA-Z_$\d]*|[a-zA-Z_$][a-zA-Z_$\d]*:|this|true|false|null|undefined|typeof|instanceof|in|delete|new|void|arguments|decodeURI|decodeURIComponent|encodeURI|encodeURIComponent|escape|eval|isFinite|isNaN|parseFloat|parseInt|unescape|dojo|dijit|dojox|window|document|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"/g, "").match(/([a-z_$][a-z_$\d]*)/gi) || [], t = {};
                    arr.forEach(vars, function (v) {
                        if (!t.hasOwnProperty(v)) {
                            args.push(v);
                            t[v] = 1;
                        }
                    });
                }
            }
        }
        return {args:args, body:s};
    };
    var compose = function (a) {
        return a.length ? function () {
            var i = a.length - 1, x = df.lambda(a[i]).apply(this, arguments);
            for (--i; i >= 0; --i) {
                x = df.lambda(a[i]).call(this, x);
            }
            return x;
        } : function (x) {
            return x;
        };
    };
    lang.mixin(df, {rawLambda:function (s) {
        return lambda(s);
    }, buildLambda:function (s) {
        var l = lambda(s);
        return "function(" + l.args.join(",") + "){return (" + l.body + ");}";
    }, lambda:function (s) {
        if (typeof s == "function") {
            return s;
        }
        if (s instanceof Array) {
            return compose(s);
        }
        if (lcache.hasOwnProperty(s)) {
            return lcache[s];
        }
        var l = lambda(s);
        return lcache[s] = new Function(l.args, "return (" + l.body + ");");
    }, clearLambdaCache:function () {
        lcache = {};
    }});
    return df;
});

