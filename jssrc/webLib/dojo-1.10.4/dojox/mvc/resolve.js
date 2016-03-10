//>>built

define("dojox/mvc/resolve", ["dojo/_base/lang", "dijit/registry", "dojo/Stateful"], function (lang, registry) {
    var resolve = function (target, parent) {
        if (typeof target == "string") {
            var tokens = target.match(/^(expr|rel|widget):(.*)$/) || [];
            try {
                if (tokens[1] == "rel") {
                    target = lang.getObject(tokens[2] || "", false, parent);
                } else {
                    if (tokens[1] == "widget") {
                        target = registry.byId(tokens[2]);
                    } else {
                        target = lang.getObject(tokens[2] || target, false, parent);
                    }
                }
            }
            catch (e) {
            }
        }
        return target;
    };
    return lang.setObject("dojox.mvc.resolve", resolve);
});

