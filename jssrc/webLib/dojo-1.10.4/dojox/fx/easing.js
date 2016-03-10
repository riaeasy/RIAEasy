//>>built

define("dojox/fx/easing", ["dojo/_base/lang", "dojo/_base/kernel", "dojo/fx/easing"], function (lang, kernel, easing) {
    kernel.deprecated("dojox.fx.easing", "Upgraded to Core, use dojo.fx.easing instead", "2.0");
    var fxExt = lang.getObject("dojox.fx", true);
    fxExt.easing = easing;
    return easing;
});

