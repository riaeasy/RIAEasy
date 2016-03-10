//>>built

define("dojox/lang/observable", ["dijit", "dojo", "dojox"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.lang.observable");
    dojo.experimental("dojox.lang.observable");
    dojox.lang.observable = function (wrapped, onRead, onWrite, onInvoke) {
        return dojox.lang.makeObservable(onRead, onWrite, onInvoke)(wrapped);
    };
    dojox.lang.makeObservable = function (onRead, onWrite, onInvoke, hiddenFunctions) {
        hiddenFunctions = hiddenFunctions || {};
        onInvoke = onInvoke || function (scope, obj, method, args) {
            return obj[method].apply(scope, args);
        };
        function makeInvoker(scope, wrapped, i) {
            return function () {
                return onInvoke(scope, wrapped, i, arguments);
            };
        }
        if (dojox.lang.lettableWin) {
            var factory = dojox.lang.makeObservable;
            factory.inc = (factory.inc || 0) + 1;
            var getName = "gettable_" + factory.inc;
            dojox.lang.lettableWin[getName] = onRead;
            var setName = "settable_" + factory.inc;
            dojox.lang.lettableWin[setName] = onWrite;
            var cache = {};
            return function (wrapped) {
                if (wrapped.__observable) {
                    return wrapped.__observable;
                }
                if (wrapped.data__) {
                    throw new Error("Can wrap an object that is already wrapped");
                }
                var props = [], i, l;
                for (i in hiddenFunctions) {
                    props.push(i);
                }
                var vbReservedWords = {type:1, event:1};
                for (i in wrapped) {
                    if (i.match(/^[a-zA-Z][\w\$_]*$/) && !(i in hiddenFunctions) && !(i in vbReservedWords)) {
                        props.push(i);
                    }
                }
                var signature = props.join(",");
                var prop, clazz = cache[signature];
                if (!clazz) {
                    var tname = "dj_lettable_" + (factory.inc++);
                    var gtname = tname + "_dj_getter";
                    var cParts = ["Class " + tname, "\tPublic data__"];
                    for (i = 0, l = props.length; i < l; i++) {
                        prop = props[i];
                        var type = typeof wrapped[prop];
                        if (type == "function" || hiddenFunctions[prop]) {
                            cParts.push("  Public " + prop);
                        } else {
                            if (type != "object") {
                                cParts.push("\tPublic Property Let " + prop + "(val)", "\t\tCall " + setName + "(me.data__,\"" + prop + "\",val)", "\tEnd Property", "\tPublic Property Get " + prop, "\t\t" + prop + " = " + getName + "(me.data__,\"" + prop + "\")", "\tEnd Property");
                            }
                        }
                    }
                    cParts.push("End Class");
                    cParts.push("Function " + gtname + "()", "\tDim tmp", "\tSet tmp = New " + tname, "\tSet " + gtname + " = tmp", "End Function");
                    dojox.lang.lettableWin.vbEval(cParts.join("\n"));
                    cache[signature] = clazz = function () {
                        return dojox.lang.lettableWin.construct(gtname);
                    };
                }
                console.log("starting5");
                var newObj = clazz();
                newObj.data__ = wrapped;
                console.log("starting6");
                try {
                    wrapped.__observable = newObj;
                }
                catch (e) {
                }
                for (i = 0, l = props.length; i < l; i++) {
                    prop = props[i];
                    try {
                        var val = wrapped[prop];
                    }
                    catch (e) {
                        console.log("error ", prop, e);
                    }
                    if (typeof val == "function" || hiddenFunctions[prop]) {
                        newObj[prop] = makeInvoker(newObj, wrapped, prop);
                    }
                }
                return newObj;
            };
        } else {
            return function (wrapped) {
                if (wrapped.__observable) {
                    return wrapped.__observable;
                }
                var newObj = wrapped instanceof Array ? [] : {};
                newObj.data__ = wrapped;
                for (var i in wrapped) {
                    if (i.charAt(0) != "_") {
                        if (typeof wrapped[i] == "function") {
                            newObj[i] = makeInvoker(newObj, wrapped, i);
                        } else {
                            if (typeof wrapped[i] != "object") {
                                (function (i) {
                                    newObj.__defineGetter__(i, function () {
                                        return onRead(wrapped, i);
                                    });
                                    newObj.__defineSetter__(i, function (value) {
                                        return onWrite(wrapped, i, value);
                                    });
                                })(i);
                            }
                        }
                    }
                }
                for (i in hiddenFunctions) {
                    newObj[i] = makeInvoker(newObj, wrapped, i);
                }
                wrapped.__observable = newObj;
                return newObj;
            };
        }
    };
    if (!{}.__defineGetter__) {
        if (dojo.isIE) {
            var frame;
            if (document.body) {
                frame = document.createElement("iframe");
                document.body.appendChild(frame);
            } else {
                document.write("<iframe id='dj_vb_eval_frame'></iframe>");
                frame = document.getElementById("dj_vb_eval_frame");
            }
            frame.style.display = "none";
            var doc = frame.contentWindow.document;
            dojox.lang.lettableWin = frame.contentWindow;
            doc.write("<html><head><script language=\"VBScript\" type=\"text/VBScript\">" + "Function vb_global_eval(code)" + "ExecuteGlobal(code)" + "End Function" + "</script>" + "<script type=\"text/javascript\">" + "function vbEval(code){ \n" + "return vb_global_eval(code);" + "}" + "function construct(name){ \n" + "return window[name]();" + "}" + "</script>" + "</head><body>vb-eval</body></html>");
            doc.close();
        } else {
            throw new Error("This browser does not support getters and setters");
        }
    }
    dojox.lang.ReadOnlyProxy = dojox.lang.makeObservable(function (obj, i) {
        return obj[i];
    }, function (obj, i, value) {
    });
});

