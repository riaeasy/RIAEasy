//>>built

define("dojox/widget/rotator/Fade", ["dojo/_base/lang", "dojo/_base/fx", "dojo/dom-style", "dojo/fx"], function (lang, baseFx, domStyle, fx) {
    function _fade(args, action) {
        var n = args.next.node;
        domStyle.set(n, {display:"", opacity:0});
        args.node = args.current.node;
        return fx[action]([baseFx.fadeOut(args), baseFx.fadeIn(lang.mixin(args, {node:n}))]);
    }
    var exports = {fade:function (args) {
        return _fade(args, "chain");
    }, crossFade:function (args) {
        return _fade(args, "combine");
    }};
    lang.mixin(lang.getObject("dojox.widget.rotator"), exports);
    return exports;
});

