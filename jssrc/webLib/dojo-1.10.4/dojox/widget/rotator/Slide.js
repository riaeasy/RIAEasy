//>>built

define("dojox/widget/rotator/Slide", ["dojo/_base/lang", "dojo/_base/fx", "dojo/dom-style"], function (lang, baseFx, domStyle) {
    var DOWN = 0, RIGHT = 1, UP = 2, LEFT = 3;
    function _slide(type, args) {
        var node = args.node = args.next.node, r = args.rotatorBox, m = type % 2, s = (m ? r.w : r.h) * (type < 2 ? -1 : 1);
        domStyle.set(node, {display:"", zIndex:(domStyle.get(args.current.node, "zIndex") || 1) + 1});
        if (!args.properties) {
            args.properties = {};
        }
        args.properties[m ? "left" : "top"] = {start:s, end:0};
        return baseFx.animateProperty(args);
    }
    var exports = {slideDown:function (args) {
        return _slide(DOWN, args);
    }, slideRight:function (args) {
        return _slide(RIGHT, args);
    }, slideUp:function (args) {
        return _slide(UP, args);
    }, slideLeft:function (args) {
        return _slide(LEFT, args);
    }};
    lang.mixin(lang.getObject("dojox.widget.rotator"), exports);
    return exports;
});

