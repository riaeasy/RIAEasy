//>>built

define("dojox/mvc/sync", ["dojo/_base/lang", "dojo/_base/config", "dojo/_base/array", "dojo/has"], function (lang, config, array, has) {
    var mvc = lang.getObject("dojox.mvc", true);
    has.add("mvc-bindings-log-api", (config["mvc"] || {}).debugBindings);
    var sync;
    if (has("mvc-bindings-log-api")) {
        function getLogContent(source, sourceProp, target, targetProp) {
            return [[target.canConvertToLoggable || !target.declaredClass ? target : target.declaredClass, targetProp].join(":"), [source.canConvertToLoggable || !source.declaredClass ? source : source.declaredClass, sourceProp].join(":")];
        }
    }
    function equals(dst, src) {
        return dst === src || typeof dst == "number" && isNaN(dst) && typeof src == "number" && isNaN(src) || lang.isFunction((dst || {}).getTime) && lang.isFunction((src || {}).getTime) && dst.getTime() == src.getTime() || (lang.isFunction((dst || {}).equals) ? dst.equals(src) : lang.isFunction((src || {}).equals) ? src.equals(dst) : false);
    }
    function copy(convertFunc, constraints, equals, source, sourceProp, target, targetProp, old, current, excludes) {
        if (equals(current, old) || sourceProp == "*" && array.indexOf(source.get("properties") || [targetProp], targetProp) < 0 || sourceProp == "*" && targetProp in (excludes || {})) {
            return;
        }
        var prop = sourceProp == "*" ? targetProp : sourceProp;
        if (has("mvc-bindings-log-api")) {
            var logContent = getLogContent(source, prop, target, targetProp);
        }
        try {
            current = convertFunc ? convertFunc(current, constraints) : current;
        }
        catch (e) {
            if (has("mvc-bindings-log-api")) {
                console.log("Copy from" + logContent.join(" to ") + " was not done as an error is thrown in the converter.");
            }
            return;
        }
        if (has("mvc-bindings-log-api")) {
            console.log(logContent.reverse().join(" is being copied from: ") + " (Value: " + current + " from " + old + ")");
        }
        lang.isFunction(source.set) ? source.set(prop, current) : (source[prop] = current);
    }
    var directions = {from:1, to:2, both:3}, undef;
    sync = function (source, sourceProp, target, targetProp, options) {
        var converter = (options || {}).converter, converterInstance, formatFunc, parseFunc;
        if (converter) {
            converterInstance = {source:source, target:target};
            formatFunc = converter.format && lang.hitch(converterInstance, converter.format);
            parseFunc = converter.parse && lang.hitch(converterInstance, converter.parse);
        }
        var _watchHandles = [], excludes = [], list, constraints = lang.mixin({}, source.constraints, target.constraints), bindDirection = (options || {}).bindDirection || mvc.both, equals = (options || {}).equals || sync.equals;
        if (has("mvc-bindings-log-api")) {
            var logContent = getLogContent(source, sourceProp, target, targetProp);
        }
        if (targetProp == "*") {
            if (sourceProp != "*") {
                throw new Error("Unmatched wildcard is specified between source and target.");
            }
            list = target.get("properties");
            if (!list) {
                list = [];
                for (var s in target) {
                    if (target.hasOwnProperty(s) && s != "_watchCallbacks") {
                        list.push(s);
                    }
                }
            }
            excludes = target.get("excludes");
        } else {
            list = [sourceProp];
        }
        if (bindDirection & mvc.from) {
            if (lang.isFunction(source.set) && lang.isFunction(source.watch)) {
                _watchHandles.push(source.watch.apply(source, ((sourceProp != "*") ? [sourceProp] : []).concat([function (name, old, current) {
                    copy(formatFunc, constraints, equals, target, targetProp, source, name, old, current, excludes);
                }])));
            } else {
                if (has("mvc-bindings-log-api")) {
                    console.log(logContent.reverse().join(" is not a stateful property. Its change is not reflected to ") + ".");
                }
            }
            array.forEach(list, function (prop) {
                if (targetProp != "*" || !(prop in (excludes || {}))) {
                    var value = lang.isFunction(source.get) ? source.get(prop) : source[prop];
                    copy(formatFunc, constraints, equals, target, targetProp == "*" ? prop : targetProp, source, prop, undef, value);
                }
            });
        }
        if (bindDirection & mvc.to) {
            if (!(bindDirection & mvc.from)) {
                array.forEach(list, function (prop) {
                    if (targetProp != "*" || !(prop in (excludes || {}))) {
                        var value = lang.isFunction(target.get) ? target.get(targetProp) : target[targetProp];
                        copy(parseFunc, constraints, equals, source, prop, target, targetProp == "*" ? prop : targetProp, undef, value);
                    }
                });
            }
            if (lang.isFunction(target.set) && lang.isFunction(target.watch)) {
                _watchHandles.push(target.watch.apply(target, ((targetProp != "*") ? [targetProp] : []).concat([function (name, old, current) {
                    copy(parseFunc, constraints, equals, source, sourceProp, target, name, old, current, excludes);
                }])));
            } else {
                if (has("mvc-bindings-log-api")) {
                    console.log(logContent.join(" is not a stateful property. Its change is not reflected to ") + ".");
                }
            }
        }
        if (has("mvc-bindings-log-api")) {
            console.log(logContent.join(" is bound to: "));
        }
        var handle = {};
        handle.unwatch = handle.remove = function () {
            for (var h = null; h = _watchHandles.pop(); ) {
                h.unwatch();
            }
            if (has("mvc-bindings-log-api")) {
                console.log(logContent.join(" is unbound from: "));
            }
        };
        return handle;
    };
    lang.mixin(mvc, directions);
    return lang.setObject("dojox.mvc.sync", lang.mixin(sync, {equals:equals}, directions));
});

