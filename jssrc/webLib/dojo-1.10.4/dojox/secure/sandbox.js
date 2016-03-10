//>>built

define("dojox/secure/sandbox", ["dijit", "dojo", "dojox", "dojo/require!dojox/secure/DOM,dojox/secure/capability,dojo/NodeList-fx,dojo/_base/url"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.secure.sandbox");
    dojo.require("dojox.secure.DOM");
    dojo.require("dojox.secure.capability");
    dojo.require("dojo.NodeList-fx");
    dojo.require("dojo._base.url");
    (function () {
        var oldTimeout = setTimeout;
        var oldInterval = setInterval;
        if ({}.__proto__) {
            var fixMozArrayFunction = function (name) {
                var method = Array.prototype[name];
                if (method && !method.fixed) {
                    (Array.prototype[name] = function () {
                        if (this == window) {
                            throw new TypeError("Called with wrong this");
                        }
                        return method.apply(this, arguments);
                    }).fixed = true;
                }
            };
            fixMozArrayFunction("concat");
            fixMozArrayFunction("reverse");
            fixMozArrayFunction("sort");
            fixMozArrayFunction("slice");
            fixMozArrayFunction("forEach");
            fixMozArrayFunction("filter");
            fixMozArrayFunction("reduce");
            fixMozArrayFunction("reduceRight");
            fixMozArrayFunction("every");
            fixMozArrayFunction("map");
            fixMozArrayFunction("some");
        }
        var xhrGet = function () {
            return dojo.xhrGet.apply(dojo, arguments);
        };
        dojox.secure.sandbox = function (element) {
            var wrap = dojox.secure.DOM(element);
            element = wrap(element);
            var document = element.ownerDocument;
            var mixin, dojo = dojox.secure._safeDojoFunctions(element, wrap);
            var imports = [];
            var safeCalls = ["isNaN", "isFinite", "parseInt", "parseFloat", "escape", "unescape", "encodeURI", "encodeURIComponent", "decodeURI", "decodeURIComponent", "alert", "confirm", "prompt", "Error", "EvalError", "RangeError", "ReferenceError", "SyntaxError", "TypeError", "Date", "RegExp", "Number", "Object", "Array", "String", "Math", "setTimeout", "setInterval", "clearTimeout", "clearInterval", "dojo", "get", "set", "forEach", "load", "evaluate"];
            for (var i in dojo) {
                safeCalls.push(i);
                imports.push("var " + i + "=dojo." + i);
            }
            eval(imports.join(";"));
            function get(obj, prop) {
                prop = "" + prop;
                if (dojox.secure.badProps.test(prop)) {
                    throw new Error("bad property access");
                }
                if (obj.__get__) {
                    return obj.__get__(prop);
                }
                return obj[prop];
            }
            function set(obj, prop, value) {
                prop = "" + prop;
                get(obj, prop);
                if (obj.__set) {
                    return obj.__set(prop);
                }
                obj[prop] = value;
                return value;
            }
            function forEach(obj, fun) {
                if (typeof fun != "function") {
                    throw new TypeError();
                }
                if ("length" in obj) {
                    if (obj.__get__) {
                        var len = obj.__get__("length");
                        for (var i = 0; i < len; i++) {
                            if (i in obj) {
                                fun.call(obj, obj.__get__(i), i, obj);
                            }
                        }
                    } else {
                        len = obj.length;
                        for (i = 0; i < len; i++) {
                            if (i in obj) {
                                fun.call(obj, obj[i], i, obj);
                            }
                        }
                    }
                } else {
                    for (i in obj) {
                        fun.call(obj, get(obj, i), i, obj);
                    }
                }
            }
            function Class(superclass, properties, classProperties) {
                var proto, superConstructor, ourConstructor;
                var arg;
                for (var i = 0, l = arguments.length; typeof (arg = arguments[i]) == "function" && i < l; i++) {
                    if (proto) {
                        mixin(proto, arg.prototype);
                    } else {
                        superConstructor = arg;
                        var F = function () {
                        };
                        F.prototype = arg.prototype;
                        proto = new F;
                    }
                }
                if (arg) {
                    for (var j in arg) {
                        var value = arg[j];
                        if (typeof value == "function") {
                            arg[j] = function () {
                                if (this instanceof Class) {
                                    return arguments.callee.__rawMethod__.apply(this, arguments);
                                }
                                throw new Error("Method called on wrong object");
                            };
                            arg[j].__rawMethod__ = value;
                        }
                    }
                    if (arg.hasOwnProperty("constructor")) {
                        ourConstructor = arg.constructor;
                    }
                }
                proto = proto ? mixin(proto, arg) : arg;
                function Class() {
                    if (superConstructor) {
                        superConstructor.apply(this, arguments);
                    }
                    if (ourConstructor) {
                        ourConstructor.apply(this, arguments);
                    }
                }
                mixin(Class, arguments[i]);
                proto.constructor = Class;
                Class.prototype = proto;
                return Class;
            }
            function checkString(func) {
                if (typeof func != "function") {
                    throw new Error("String is not allowed in setTimeout/setInterval");
                }
            }
            function setTimeout(func, time) {
                checkString(func);
                return oldTimeout(func, time);
            }
            function setInterval(func, time) {
                checkString(func);
                return oldInterval(func, time);
            }
            function evaluate(script) {
                return wrap.evaluate(script);
            }
            var load = wrap.load = function (url) {
                if (url.match(/^[\w\s]*:/)) {
                    throw new Error("Access denied to cross-site requests");
                }
                return xhrGet({url:(new dojo._Url(wrap.rootUrl, url)) + "", secure:true});
            };
            wrap.evaluate = function (script) {
                dojox.secure.capability.validate(script, safeCalls, {document:1, element:1});
                if (script.match(/^\s*[\[\{]/)) {
                    var result = eval("(" + script + ")");
                } else {
                    eval(script);
                }
            };
            return {loadJS:function (url) {
                wrap.rootUrl = url;
                return xhrGet({url:url, secure:true}).addCallback(function (result) {
                    evaluate(result, element);
                });
            }, loadHTML:function (url) {
                wrap.rootUrl = url;
                return xhrGet({url:url, secure:true}).addCallback(function (result) {
                    element.innerHTML = result;
                });
            }, evaluate:function (script) {
                return wrap.evaluate(script);
            }};
        };
    })();
    dojox.secure._safeDojoFunctions = function (element, wrap) {
        var safeFunctions = ["mixin", "require", "isString", "isArray", "isFunction", "isObject", "isArrayLike", "isAlien", "hitch", "delegate", "partial", "trim", "disconnect", "subscribe", "unsubscribe", "Deferred", "toJson", "style", "attr"];
        var doc = element.ownerDocument;
        var unwrap = dojox.secure.unwrap;
        dojo.NodeList.prototype.addContent.safetyCheck = function (content) {
            wrap.safeHTML(content);
        };
        dojo.NodeList.prototype.style.safetyCheck = function (name, value) {
            if (name == "behavior") {
                throw new Error("Can not set behavior");
            }
            wrap.safeCSS(value);
        };
        dojo.NodeList.prototype.attr.safetyCheck = function (name, value) {
            if (value && (name == "src" || name == "href" || name == "style")) {
                throw new Error("Illegal to set " + name);
            }
        };
        var safe = {query:function (query, root) {
            return wrap(dojo.query(query, unwrap(root || element)));
        }, connect:function (el, event) {
            var obj = el;
            arguments[0] = unwrap(el);
            if (obj != arguments[0] && event.substring(0, 2) != "on") {
                throw new Error("Invalid event name for element");
            }
            return dojo.connect.apply(dojo, arguments);
        }, body:function () {
            return element;
        }, byId:function (id) {
            return element.ownerDocument.getElementById(id);
        }, fromJson:function (str) {
            dojox.secure.capability.validate(str, [], {});
            return dojo.fromJson(str);
        }};
        for (var i = 0; i < safeFunctions.length; i++) {
            safe[safeFunctions[i]] = dojo[safeFunctions[i]];
        }
        return safe;
    };
});

