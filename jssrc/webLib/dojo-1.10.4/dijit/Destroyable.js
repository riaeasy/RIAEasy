//>>built

define("dijit/Destroyable", ["dojo/_base/array", "dojo/aspect", "dojo/_base/declare"], function (array, aspect, declare) {
    return declare("dijit.Destroyable", null, {destroy:function (preserveDom) {
        this._destroyed = true;
    }, own:function () {
        var cleanupMethods = ["destroyRecursive", "destroy", "remove"];
        array.forEach(arguments, function (handle) {
            var destroyMethodName;
            var odh = aspect.before(this, "destroy", function (preserveDom) {
                handle[destroyMethodName](preserveDom);
            });
            var hdhs = [];
            function onManualDestroy() {
                odh.remove();
                array.forEach(hdhs, function (hdh) {
                    hdh.remove();
                });
            }
            if (handle.then) {
                destroyMethodName = "cancel";
                handle.then(onManualDestroy, onManualDestroy);
            } else {
                array.forEach(cleanupMethods, function (cleanupMethod) {
                    if (typeof handle[cleanupMethod] === "function") {
                        if (!destroyMethodName) {
                            destroyMethodName = cleanupMethod;
                        }
                        hdhs.push(aspect.after(handle, cleanupMethod, onManualDestroy, true));
                    }
                });
            }
        }, this);
        return arguments;
    }});
});

