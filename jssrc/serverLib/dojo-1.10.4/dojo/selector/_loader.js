//>>built

define("dojo/selector/_loader", ["../has", "require"], function (has, require) {
    "use strict";
    var testDiv = document.createElement("div");
    has.add("dom-qsa2.1", !!testDiv.querySelectorAll);
    has.add("dom-qsa3", function () {
        try {
            testDiv.innerHTML = "<p class='TEST'></p>";
            return testDiv.querySelectorAll(".TEST:empty").length == 1;
        }
        catch (e) {
        }
    });
    var fullEngine;
    var acme = "./acme", lite = "./lite";
    return {load:function (id, parentRequire, loaded, config) {
        var req = require;
        id = id == "default" ? has("config-selectorEngine") || "css3" : id;
        id = id == "css2" || id == "lite" ? lite : id == "css2.1" ? has("dom-qsa2.1") ? lite : acme : id == "css3" ? has("dom-qsa3") ? lite : acme : id == "acme" ? acme : (req = parentRequire) && id;
        if (id.charAt(id.length - 1) == "?") {
            id = id.substring(0, id.length - 1);
            var optionalLoad = true;
        }
        if (optionalLoad && (has("dom-compliant-qsa") || fullEngine)) {
            return loaded(fullEngine);
        }
        req([id], function (engine) {
            if (id != "./lite") {
                fullEngine = engine;
            }
            loaded(engine);
        });
    }};
});

