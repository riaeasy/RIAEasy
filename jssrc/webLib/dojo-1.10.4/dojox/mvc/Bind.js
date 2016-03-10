//>>built

define("dojox/mvc/Bind", ["dojo/_base/lang", "dojo/_base/array"], function (lang, array) {
    var mvc = lang.getObject("dojox.mvc", true);
    return lang.mixin(mvc, {bind:function (source, sourceProp, target, targetProp, func, bindOnlyIfUnequal) {
        var convertedValue;
        return source.watch(sourceProp, function (prop, oldValue, newValue) {
            convertedValue = lang.isFunction(func) ? func(newValue) : newValue;
            if (!bindOnlyIfUnequal || convertedValue != target.get(targetProp)) {
                target.set(targetProp, convertedValue);
            }
        });
    }, bindInputs:function (sourceBindArray, func) {
        var watchHandles = [];
        array.forEach(sourceBindArray, function (h) {
            watchHandles.push(h.watch("value", func));
        });
        return watchHandles;
    }});
});

