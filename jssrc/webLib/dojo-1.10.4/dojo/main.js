//>>built

define("dojo/main", ["./_base/kernel", "./has", "require", "./sniff", "./_base/lang", "./_base/array", "./_base/config", "./ready", "./_base/declare", "./_base/connect", "./_base/Deferred", "./_base/json", "./_base/Color", "./_firebug/firebug", "./_base/browser", "require"], function (kernel, has, require, sniff, lang, array, config, ready) {
    if (config.isDebug) {
        require(["./_firebug/firebug"]);
    }
    1 || has.add("dojo-config-require", 1);
    if (1) {
        var deps = config.require;
        if (deps) {
            deps = array.map(lang.isArray(deps) ? deps : [deps], function (item) {
                return item.replace(/\./g, "/");
            });
            if (kernel.isAsync) {
                require(deps);
            } else {
                ready(1, function () {
                    require(deps);
                });
            }
        }
    }
    return kernel;
});

