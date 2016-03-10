//>>built

define("dojox/mobile/dh/JsonContentHandler", ["dojo/_base/kernel", "dojo/_base/array", "dojo/_base/declare", "dojo/_base/lang", "dojo/_base/Deferred", "dojo/json", "dojo/dom-construct"], function (dojo, array, declare, lang, Deferred, json, domConstruct) {
    return declare("dojox.mobile.dh.JsonContentHandler", null, {parse:function (content, target, refNode) {
        var view, container = domConstruct.create("DIV");
        target.insertBefore(container, refNode);
        this._ws = [];
        this._req = [];
        var root = json.parse(content);
        return Deferred.when(this._loadPrereqs(root), lang.hitch(this, function () {
            view = this._instantiate(root, container);
            view.style.visibility = "hidden";
            array.forEach(this._ws, function (w) {
                if (!w._started && w.startup) {
                    w.startup();
                }
            });
            this._ws = null;
            return view.id;
        }));
    }, _loadPrereqs:function (root) {
        var d = new Deferred();
        var req = this._collectRequires(root);
        if (req.length === 0) {
            return true;
        }
        if (dojo.require) {
            array.forEach(req, function (c) {
                dojo["require"](c);
            });
            return true;
        } else {
            req = array.map(req, function (s) {
                return s.replace(/\./g, "/");
            });
            require(req, function () {
                d.resolve(true);
            });
        }
        return d;
    }, _collectRequires:function (obj) {
        var className = obj["class"];
        for (var key in obj) {
            if (key.charAt(0) == "@" || key === "children") {
                continue;
            }
            var cls = className || key.replace(/:.*/, "");
            this._req.push(cls);
            if (!cls) {
                continue;
            }
            var objs = className ? [obj] : (lang.isArray(obj[key]) ? obj[key] : [obj[key]]);
            for (var i = 0; i < objs.length; i++) {
                if (!className) {
                    this._collectRequires(objs[i]);
                } else {
                    if (objs[i].children) {
                        for (var j = 0; j < objs[i].children.length; j++) {
                            this._collectRequires(objs[i].children[j]);
                        }
                    }
                }
            }
        }
        return this._req;
    }, _instantiate:function (obj, node, parent) {
        var widget;
        var className = obj["class"];
        for (var key in obj) {
            if (key.charAt(0) == "@" || key === "children") {
                continue;
            }
            var cls = lang.getObject(className || key.replace(/:.*/, ""));
            if (!cls) {
                continue;
            }
            var proto = cls.prototype, objs = className ? [obj] : (lang.isArray(obj[key]) ? obj[key] : [obj[key]]);
            for (var i = 0; i < objs.length; i++) {
                var params = {};
                for (var prop in objs[i]) {
                    if (prop.charAt(0) == "@") {
                        var v = objs[i][prop];
                        prop = prop.substring(1);
                        var t = typeof proto[prop];
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
                                            params[prop] = json.parse(v);
                                        } else {
                                            if (t === "function") {
                                                params[prop] = lang.getObject(v, false) || new Function(v);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                widget = new cls(params, node);
                if (node) {
                    this._ws.push(widget);
                }
                if (parent) {
                    widget.placeAt(parent.containerNode || parent.domNode);
                }
                if (!className) {
                    this._instantiate(objs[i], null, widget);
                } else {
                    if (objs[i].children) {
                        for (var j = 0; j < objs[i].children.length; j++) {
                            this._instantiate(objs[i].children[j], null, widget);
                        }
                    }
                }
            }
        }
        return widget && widget.domNode;
    }});
});

