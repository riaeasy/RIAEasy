//>>built

define("dojox/fx/_arg", ["dojo/_base/lang"], function (lang) {
    var fxArg = lang.getObject("dojox.fx._arg", true);
    fxArg.StyleArgs = function (args) {
        this.node = args.node;
        this.cssClass = args.cssClass;
    };
    fxArg.ShadowResizeArgs = function (args) {
        this.x = args.x;
        this.y = args.y;
    };
    return fxArg;
});

