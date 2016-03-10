//>>built

define("dojo/query", ["./_base/kernel", "./has", "./dom", "./on", "./_base/array", "./_base/lang", "./selector/_loader", "./selector/_loader!default"], function (dojo, has, dom, on, array, lang, loader, defaultEngine) {
    "use strict";
    has.add("array-extensible", function () {
        return lang.delegate([], {length:1}).length == 1 && !has("bug-for-in-skips-shadowed");
    });
    var ap = Array.prototype, aps = ap.slice, apc = ap.concat, forEach = array.forEach;
    var tnl = function (a, parent, NodeListCtor) {
        var nodeList = new (NodeListCtor || this._NodeListCtor || nl)(a);
        return parent ? nodeList._stash(parent) : nodeList;
    };
    var loopBody = function (f, a, o) {
        a = [0].concat(aps.call(a, 0));
        o = o || dojo.global;
        return function (node) {
            a[0] = node;
            return f.apply(o, a);
        };
    };
    var adaptAsForEach = function (f, o) {
        return function () {
            this.forEach(loopBody(f, arguments, o));
            return this;
        };
    };
    var adaptAsMap = function (f, o) {
        return function () {
            return this.map(loopBody(f, arguments, o));
        };
    };
    var adaptAsFilter = function (f, o) {
        return function () {
            return this.filter(loopBody(f, arguments, o));
        };
    };
    var adaptWithCondition = function (f, g, o) {
        return function () {
            var a = arguments, body = loopBody(f, a, o);
            if (g.call(o || dojo.global, a)) {
                return this.map(body);
            }
            this.forEach(body);
            return this;
        };
    };
    var NodeList = function (array) {
        var isNew = this instanceof nl && has("array-extensible");
        if (typeof array == "number") {
            array = Array(array);
        }
        var nodeArray = (array && "length" in array) ? array : arguments;
        if (isNew || !nodeArray.sort) {
            var target = isNew ? this : [], l = target.length = nodeArray.length;
            for (var i = 0; i < l; i++) {
                target[i] = nodeArray[i];
            }
            if (isNew) {
                return target;
            }
            nodeArray = target;
        }
        lang._mixin(nodeArray, nlp);
        nodeArray._NodeListCtor = function (array) {
            return nl(array);
        };
        return nodeArray;
    };
    var nl = NodeList, nlp = nl.prototype = has("array-extensible") ? [] : {};
    nl._wrap = nlp._wrap = tnl;
    nl._adaptAsMap = adaptAsMap;
    nl._adaptAsForEach = adaptAsForEach;
    nl._adaptAsFilter = adaptAsFilter;
    nl._adaptWithCondition = adaptWithCondition;
    forEach(["slice", "splice"], function (name) {
        var f = ap[name];
        nlp[name] = function () {
            return this._wrap(f.apply(this, arguments), name == "slice" ? this : null);
        };
    });
    forEach(["indexOf", "lastIndexOf", "every", "some"], function (name) {
        var f = array[name];
        nlp[name] = function () {
            return f.apply(dojo, [this].concat(aps.call(arguments, 0)));
        };
    });
    lang.extend(NodeList, {constructor:nl, _NodeListCtor:nl, toString:function () {
        return this.join(",");
    }, _stash:function (parent) {
        this._parent = parent;
        return this;
    }, on:function (eventName, listener) {
        var handles = this.map(function (node) {
            return on(node, eventName, listener);
        });
        handles.remove = function () {
            for (var i = 0; i < handles.length; i++) {
                handles[i].remove();
            }
        };
        return handles;
    }, end:function () {
        if (this._parent) {
            return this._parent;
        } else {
            return new this._NodeListCtor(0);
        }
    }, concat:function (item) {
        var t = aps.call(this, 0), m = array.map(arguments, function (a) {
            return aps.call(a, 0);
        });
        return this._wrap(apc.apply(t, m), this);
    }, map:function (func, obj) {
        return this._wrap(array.map(this, func, obj), this);
    }, forEach:function (callback, thisObj) {
        forEach(this, callback, thisObj);
        return this;
    }, filter:function (filter) {
        var a = arguments, items = this, start = 0;
        if (typeof filter == "string") {
            items = query._filterResult(this, a[0]);
            if (a.length == 1) {
                return items._stash(this);
            }
            start = 1;
        }
        return this._wrap(array.filter(items, a[start], a[start + 1]), this);
    }, instantiate:function (declaredClass, properties) {
        var c = lang.isFunction(declaredClass) ? declaredClass : lang.getObject(declaredClass);
        properties = properties || {};
        return this.forEach(function (node) {
            new c(properties, node);
        });
    }, at:function () {
        var t = new this._NodeListCtor(0);
        forEach(arguments, function (i) {
            if (i < 0) {
                i = this.length + i;
            }
            if (this[i]) {
                t.push(this[i]);
            }
        }, this);
        return t._stash(this);
    }});
    function queryForEngine(engine, NodeList) {
        var query = function (query, root) {
            if (typeof root == "string") {
                root = dom.byId(root);
                if (!root) {
                    return new NodeList([]);
                }
            }
            var results = typeof query == "string" ? engine(query, root) : query ? (query.end && query.on) ? query : [query] : [];
            if (results.end && results.on) {
                return results;
            }
            return new NodeList(results);
        };
        query.matches = engine.match || function (node, selector, root) {
            return query.filter([node], selector, root).length > 0;
        };
        query.filter = engine.filter || function (nodes, selector, root) {
            return query(selector, root).filter(function (node) {
                return array.indexOf(nodes, node) > -1;
            });
        };
        if (typeof engine != "function") {
            var search = engine.search;
            engine = function (selector, root) {
                return search(root || document, selector);
            };
        }
        return query;
    }
    var query = queryForEngine(defaultEngine, NodeList);
    dojo.query = queryForEngine(defaultEngine, function (array) {
        return NodeList(array);
    });
    query.load = function (id, parentRequire, loaded) {
        loader.load(id, parentRequire, function (engine) {
            loaded(queryForEngine(engine, NodeList));
        });
    };
    dojo._filterQueryResult = query._filterResult = function (nodes, selector, root) {
        return new NodeList(query.filter(nodes, selector, root));
    };
    dojo.NodeList = query.NodeList = NodeList;
    return query;
});

