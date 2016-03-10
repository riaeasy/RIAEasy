//>>built

define("dojo/has", ["require", "module"], function (require, module) {
    var has = require.has || function () {
    };
    if (!1) {
        var isBrowser = typeof window != "undefined" && typeof location != "undefined" && typeof document != "undefined" && window.location == location && window.document == document, global = (function () {
            return this;
        })(), doc = isBrowser && document, element = doc && doc.createElement("DiV"), cache = (module.config && module.config()) || {};
        has = function (name) {
            return typeof cache[name] == "function" ? (cache[name] = cache[name](global, doc, element)) : cache[name];
        };
        has.cache = cache;
        has.add = function (name, test, now, force) {
            (typeof cache[name] == "undefined" || force) && (cache[name] = test);
            return now && has(name);
        };
        1 || has.add("host-browser", isBrowser);
        0 && has.add("host-node", (typeof process == "object" && process.versions && process.versions.node && process.versions.v8));
        0 && has.add("host-rhino", (typeof load == "function" && (typeof Packages == "function" || typeof Packages == "object")));
        1 || has.add("dom", isBrowser);
        1 || has.add("dojo-dom-ready-api", 1);
        1 || has.add("dojo-sniff", 1);
    }
    if (1) {
        has.add("dom-addeventlistener", !!document.addEventListener);
        1 || has.add("touch", "ontouchstart" in document || ("onpointerdown" in document && navigator.maxTouchPoints > 0) || window.navigator.msMaxTouchPoints);
        has.add("touch-events", "ontouchstart" in document);
        has.add("pointer-events", "onpointerdown" in document);
        has.add("MSPointer", "msMaxTouchPoints" in navigator);
        has.add("device-width", screen.availWidth || innerWidth);
        var form = document.createElement("form");
        has.add("dom-attributes-explicit", form.attributes.length == 0);
        has.add("dom-attributes-specified-flag", form.attributes.length > 0 && form.attributes.length < 40);
    }
    has.clearElement = function (element) {
        element.innerHTML = "";
        return element;
    };
    has.normalize = function (id, toAbsMid) {
        var tokens = id.match(/[\?:]|[^:\?]*/g), i = 0, get = function (skip) {
            var term = tokens[i++];
            if (term == ":") {
                return 0;
            } else {
                if (tokens[i++] == "?") {
                    if (!skip && has(term)) {
                        return get();
                    } else {
                        get(true);
                        return get(skip);
                    }
                }
                return term || 0;
            }
        };
        id = get();
        return id && toAbsMid(id);
    };
    has.load = function (id, parentRequire, loaded) {
        if (id) {
            parentRequire([id], loaded);
        } else {
            loaded();
        }
    };
    return has;
});

