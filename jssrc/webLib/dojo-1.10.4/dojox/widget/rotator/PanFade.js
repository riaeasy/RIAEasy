//>>built

define("dojox/widget/rotator/PanFade", ["dojo/_base/array", "dojo/_base/connect", "dojo/_base/lang", "dojo/_base/fx", "dojo/dom-style", "dojo/fx"], function (array, connect, lang, baseFx, domStyle, fx) {
    var DOWN = 0, RIGHT = 1, UP = 2, LEFT = 3;
    function _pan(type, args) {
        var j = {node:args.current.node, duration:args.duration, easing:args.easing}, k = {node:args.next.node, duration:args.duration, easing:args.easing}, r = args.rotatorBox, m = type % 2, a = m ? "left" : "top", s = (m ? r.w : r.h) * (type < 2 ? -1 : 1), p = {}, q = {};
        domStyle.set(k.node, {display:"", opacity:0});
        p[a] = {start:0, end:-s};
        q[a] = {start:s, end:0};
        return fx.combine([baseFx.animateProperty(lang.mixin({properties:p}, j)), baseFx.fadeOut(j), baseFx.animateProperty(lang.mixin({properties:q}, k)), baseFx.fadeIn(k)]);
    }
    function _setZindex(n, z) {
        domStyle.set(n, "zIndex", z);
    }
    var exports = {panFade:function (args) {
        var w = args.wrap, p = args.rotator.panes, len = p.length, z = len, j = args.current.idx, k = args.next.idx, nw = Math.abs(k - j), ww = Math.abs((len - Math.max(j, k)) + Math.min(j, k)) % len, _forward = j < k, _dir = LEFT, _pans = [], _nodes = [], _duration = args.duration;
        if ((!w && !_forward) || (w && (_forward && nw > ww || !_forward && nw < ww))) {
            _dir = RIGHT;
        }
        if (args.continuous) {
            if (args.quick) {
                _duration = Math.round(_duration / (w ? Math.min(ww, nw) : nw));
            }
            _setZindex(p[j].node, z--);
            var f = (_dir == LEFT);
            while (1) {
                var i = j;
                if (f) {
                    if (++j >= len) {
                        j = 0;
                    }
                } else {
                    if (--j < 0) {
                        j = len - 1;
                    }
                }
                var x = p[i], y = p[j];
                _setZindex(y.node, z--);
                _pans.push(_pan(_dir, lang.mixin({easing:function (m) {
                    return m;
                }}, args, {current:x, next:y, duration:_duration})));
                if ((f && j == k) || (!f && j == k)) {
                    break;
                }
                _nodes.push(y.node);
            }
            var _anim = fx.chain(_pans);
            var h = connect.connect(_anim, "onEnd", function () {
                connect.disconnect(h);
                array.forEach(_nodes, function (q) {
                    domStyle.set(q, {display:"none", left:0, opacity:1, top:0, zIndex:0});
                });
            });
            return _anim;
        }
        return _pan(_dir, args);
    }, panFadeDown:function (args) {
        return _pan(DOWN, args);
    }, panFadeRight:function (args) {
        return _pan(RIGHT, args);
    }, panFadeUp:function (args) {
        return _pan(UP, args);
    }, panFadeLeft:function (args) {
        return _pan(LEFT, args);
    }};
    lang.mixin(lang.getObject("dojox.widget.rotator"), exports);
    return exports;
});

