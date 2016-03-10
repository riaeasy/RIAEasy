//>>built

define("dojox/widget/rotator/Wipe", ["dojo/_base/lang", "dojo/_base/fx", "dojo/dom-style"], function (lang, fx, domStyle) {
    var DOWN = 2, RIGHT = 3, UP = 0, LEFT = 1;
    function _clipArray(type, w, h, x) {
        var a = [0, w, 0, 0];
        if (type == RIGHT) {
            a = [0, w, h, w];
        } else {
            if (type == UP) {
                a = [h, w, h, 0];
            } else {
                if (type == LEFT) {
                    a = [0, 0, h, 0];
                }
            }
        }
        if (x != null) {
            a[type] = type == DOWN || type == LEFT ? x : (type % 2 ? w : h) - x;
        }
        return a;
    }
    function _setClip(n, type, w, h, x) {
        domStyle.set(n, "clip", type == null ? "auto" : "rect(" + _clipArray(type, w, h, x).join("px,") + "px)");
    }
    function _wipe(type, args) {
        var node = args.next.node, w = args.rotatorBox.w, h = args.rotatorBox.h;
        domStyle.set(node, {display:"", zIndex:(domStyle.get(args.current.node, "zIndex") || 1) + 1});
        _setClip(node, type, w, h);
        return new fx.Animation(lang.mixin({node:node, curve:[0, type % 2 ? w : h], onAnimate:function (x) {
            _setClip(node, type, w, h, parseInt(x));
        }}, args));
    }
    var exports = {wipeDown:function (args) {
        return _wipe(DOWN, args);
    }, wipeRight:function (args) {
        return _wipe(RIGHT, args);
    }, wipeUp:function (args) {
        return _wipe(UP, args);
    }, wipeLeft:function (args) {
        return _wipe(LEFT, args);
    }};
    lang.mixin(lang.getObject("dojox.widget.rotator"), exports);
    return exports;
});

