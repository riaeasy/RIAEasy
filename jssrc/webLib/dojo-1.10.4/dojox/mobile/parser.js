//>>built

define("dojox/mobile/parser", ["dojo/_base/kernel", "dojo/_base/array", "dojo/_base/config", "dojo/_base/lang", "dojo/_base/window", "dojo/ready"], function (dojo, array, config, lang, win, ready) {
    var dm = lang.getObject("dojox.mobile", true);
    var Parser = function () {
        var _ctorMap = {};
        var getCtor = function (type, mixins) {
            if (typeof (mixins) === "string") {
                var t = type + ":" + mixins.replace(/ /g, "");
                return _ctorMap[t] || (_ctorMap[t] = getCtor(type).createSubclass(array.map(mixins.split(/, */), getCtor)));
            }
            return _ctorMap[type] || (_ctorMap[type] = lang.getObject(type) || require(type));
        };
        var _eval = function (js) {
            return eval(js);
        };
        this.instantiate = function (nodes, mixin, options) {
            mixin = mixin || {};
            options = options || {};
            var i, ws = [];
            if (nodes) {
                for (i = 0; i < nodes.length; i++) {
                    var n = nodes[i], type = n._type, ctor = getCtor(type, n.getAttribute("data-dojo-mixins")), proto = ctor.prototype, params = {}, prop, v, t;
                    lang.mixin(params, _eval.call(options.propsThis, "({" + (n.getAttribute("data-dojo-props") || "") + "})"));
                    lang.mixin(params, options.defaults);
                    lang.mixin(params, mixin);
                    for (prop in proto) {
                        v = n.getAttributeNode(prop);
                        v = v && v.nodeValue;
                        t = typeof proto[prop];
                        if (!v && (t !== "boolean" || v !== "")) {
                            continue;
                        }
                        if (lang.isArray(proto[prop])) {
                            params[prop] = v.split(/\s*,\s*/);
                        } else {
                            if (t === "string") {
                                params[prop] = v;
                            } else {
                                if (t === "number") {
                                    params[prop] = v - 0;
                                } else {
                                    if (t === "boolean") {
                                        params[prop] = (v !== "false");
                                    } else {
                                        if (t === "object") {
                                            params[prop] = eval("(" + v + ")");
                                        } else {
                                            if (t === "function") {
                                                params[prop] = lang.getObject(v, false) || new Function(v);
                                                n.removeAttribute(prop);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    params["class"] = n.className;
                    if (!params.style) {
                        params.style = n.style.cssText;
                    }
                    v = n.getAttribute("data-dojo-attach-point");
                    if (v) {
                        params.dojoAttachPoint = v;
                    }
                    v = n.getAttribute("data-dojo-attach-event");
                    if (v) {
                        params.dojoAttachEvent = v;
                    }
                    var instance = new ctor(params, n);
                    ws.push(instance);
                    var jsId = n.getAttribute("jsId") || n.getAttribute("data-dojo-id");
                    if (jsId) {
                        lang.setObject(jsId, instance);
                    }
                }
                for (i = 0; i < ws.length; i++) {
                    var w = ws[i];
                    !options.noStart && w.startup && !w._started && w.startup();
                }
            }
            return ws;
        };
        this.parse = function (rootNode, options) {
            if (!rootNode) {
                rootNode = win.body();
            } else {
                if (!options && rootNode.rootNode) {
                    options = rootNode;
                    rootNode = rootNode.rootNode;
                }
            }
            var nodes = rootNode.getElementsByTagName("*");
            var i, j, list = [];
            for (i = 0; i < nodes.length; i++) {
                var n = nodes[i], type = (n._type = n.getAttribute("dojoType") || n.getAttribute("data-dojo-type"));
                if (type) {
                    if (n._skip) {
                        n._skip = "";
                        continue;
                    }
                    if (getCtor(type).prototype.stopParser && !(options && options.template)) {
                        var arr = n.getElementsByTagName("*");
                        for (j = 0; j < arr.length; j++) {
                            arr[j]._skip = "1";
                        }
                    }
                    list.push(n);
                }
            }
            var mixin = options && options.template ? {template:true} : null;
            return this.instantiate(list, mixin, options);
        };
    };
    var parser = new Parser();
    if (config.parseOnLoad) {
        ready(100, function () {
            try {
                if (!require("dojo/parser")) {
                    parser.parse();
                }
            }
            catch (e) {
                parser.parse();
            }
        });
    }
    dm.parser = parser;
    dojo.parser = dojo.parser || parser;
    return parser;
});

