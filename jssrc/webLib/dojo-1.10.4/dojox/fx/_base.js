//>>built

define("dojox/fx/_base", ["dojo/_base/array", "dojo/_base/lang", "dojo/_base/fx", "dojo/fx", "dojo/dom", "dojo/dom-style", "dojo/dom-geometry", "dojo/_base/connect", "dojo/_base/html"], function (arrayUtil, lang, baseFx, coreFx, dom, domStyle, domGeom, connectUtil, htmlUtil) {
    var dojoxFx = lang.getObject("dojox.fx", true);
    lang.mixin(dojoxFx, {anim:baseFx.anim, animateProperty:baseFx.animateProperty, fadeTo:baseFx._fade, fadeIn:baseFx.fadeIn, fadeOut:baseFx.fadeOut, combine:coreFx.combine, chain:coreFx.chain, slideTo:coreFx.slideTo, wipeIn:coreFx.wipeIn, wipeOut:coreFx.wipeOut});
    dojoxFx.sizeTo = function (args) {
        var node = args.node = dom.byId(args.node), abs = "absolute";
        var method = args.method || "chain";
        if (!args.duration) {
            args.duration = 500;
        }
        if (method == "chain") {
            args.duration = Math.floor(args.duration / 2);
        }
        var top, newTop, left, newLeft, width, height = null;
        var init = (function (n) {
            return function () {
                var cs = domStyle.getComputedStyle(n), pos = cs.position, w = cs.width, h = cs.height;
                top = (pos == abs ? n.offsetTop : parseInt(cs.top) || 0);
                left = (pos == abs ? n.offsetLeft : parseInt(cs.left) || 0);
                width = (w == "auto" ? 0 : parseInt(w));
                height = (h == "auto" ? 0 : parseInt(h));
                newLeft = left - Math.floor((args.width - width) / 2);
                newTop = top - Math.floor((args.height - height) / 2);
                if (pos != abs && pos != "relative") {
                    var ret = domStyle.coords(n, true);
                    top = ret.y;
                    left = ret.x;
                    n.style.position = abs;
                    n.style.top = top + "px";
                    n.style.left = left + "px";
                }
            };
        })(node);
        var anim1 = baseFx.animateProperty(lang.mixin({properties:{height:function () {
            init();
            return {end:args.height || 0, start:height};
        }, top:function () {
            return {start:top, end:newTop};
        }}}, args));
        var anim2 = baseFx.animateProperty(lang.mixin({properties:{width:function () {
            return {start:width, end:args.width || 0};
        }, left:function () {
            return {start:left, end:newLeft};
        }}}, args));
        var anim = coreFx[(args.method == "combine" ? "combine" : "chain")]([anim1, anim2]);
        return anim;
    };
    dojoxFx.slideBy = function (args) {
        var node = args.node = dom.byId(args.node), top, left;
        var init = (function (n) {
            return function () {
                var cs = domStyle.getComputedStyle(n);
                var pos = cs.position;
                top = (pos == "absolute" ? n.offsetTop : parseInt(cs.top) || 0);
                left = (pos == "absolute" ? n.offsetLeft : parseInt(cs.left) || 0);
                if (pos != "absolute" && pos != "relative") {
                    var ret = domGeom.coords(n, true);
                    top = ret.y;
                    left = ret.x;
                    n.style.position = "absolute";
                    n.style.top = top + "px";
                    n.style.left = left + "px";
                }
            };
        })(node);
        init();
        var _anim = baseFx.animateProperty(lang.mixin({properties:{top:top + (args.top || 0), left:left + (args.left || 0)}}, args));
        connectUtil.connect(_anim, "beforeBegin", _anim, init);
        return _anim;
    };
    dojoxFx.crossFade = function (args) {
        var node1 = args.nodes[0] = dom.byId(args.nodes[0]), op1 = htmlUtil.style(node1, "opacity"), node2 = args.nodes[1] = dom.byId(args.nodes[1]), op2 = htmlUtil.style(node2, "opacity");
        var _anim = coreFx.combine([baseFx[(op1 == 0 ? "fadeIn" : "fadeOut")](lang.mixin({node:node1}, args)), baseFx[(op1 == 0 ? "fadeOut" : "fadeIn")](lang.mixin({node:node2}, args))]);
        return _anim;
    };
    dojoxFx.highlight = function (args) {
        var node = args.node = dom.byId(args.node);
        args.duration = args.duration || 400;
        var startColor = args.color || "#ffff99", endColor = htmlUtil.style(node, "backgroundColor");
        if (endColor == "rgba(0, 0, 0, 0)") {
            endColor = "transparent";
        }
        var anim = baseFx.animateProperty(lang.mixin({properties:{backgroundColor:{start:startColor, end:endColor}}}, args));
        if (endColor == "transparent") {
            connectUtil.connect(anim, "onEnd", anim, function () {
                node.style.backgroundColor = endColor;
            });
        }
        return anim;
    };
    dojoxFx.wipeTo = function (args) {
        args.node = dom.byId(args.node);
        var node = args.node, s = node.style;
        var dir = (args.width ? "width" : "height"), endVal = args[dir], props = {};
        props[dir] = {start:function () {
            s.overflow = "hidden";
            if (s.visibility == "hidden" || s.display == "none") {
                s[dir] = "1px";
                s.display = "";
                s.visibility = "";
                return 1;
            } else {
                var now = htmlUtil.style(node, dir);
                return Math.max(now, 1);
            }
        }, end:endVal};
        var anim = baseFx.animateProperty(lang.mixin({properties:props}, args));
        return anim;
    };
    return dojoxFx;
});

