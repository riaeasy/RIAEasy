//>>built

define("dojo/gears", ["./_base/lang", "./sniff"], function (lang, has) {
    var gears = {};
    lang.setObject("dojo.gears", gears);
    gears._gearsObject = function () {
        var factory;
        var gearsObj = lang.getObject("google.gears");
        if (gearsObj) {
            return gearsObj;
        }
        if (typeof GearsFactory != "undefined") {
            factory = new GearsFactory();
        } else {
            if (has("ie")) {
                try {
                    factory = new ActiveXObject("Gears.Factory");
                }
                catch (e) {
                }
            } else {
                if (navigator.mimeTypes["application/x-googlegears"]) {
                    factory = document.createElement("object");
                    factory.setAttribute("type", "application/x-googlegears");
                    factory.setAttribute("width", 0);
                    factory.setAttribute("height", 0);
                    factory.style.display = "none";
                    document.documentElement.appendChild(factory);
                }
            }
        }
        if (!factory) {
            return null;
        }
        lang.setObject("google.gears.factory", factory);
        return lang.getObject("google.gears");
    };
    gears.available = (!!gears._gearsObject()) || 0;
    return gears;
});

