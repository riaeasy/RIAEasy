//>>built

define("dojo/NodeList-fx", ["./query", "./_base/lang", "./aspect", "./_base/fx", "./fx"], function (query, lang, aspect, baseFx, coreFx) {
    var NodeList = query.NodeList;
    lang.extend(NodeList, {_anim:function (obj, method, args) {
        args = args || {};
        var a = coreFx.combine(this.map(function (item) {
            var tmpArgs = {node:item};
            lang.mixin(tmpArgs, args);
            return obj[method](tmpArgs);
        }));
        return args.auto ? a.play() && this : a;
    }, wipeIn:function (args) {
        return this._anim(coreFx, "wipeIn", args);
    }, wipeOut:function (args) {
        return this._anim(coreFx, "wipeOut", args);
    }, slideTo:function (args) {
        return this._anim(coreFx, "slideTo", args);
    }, fadeIn:function (args) {
        return this._anim(baseFx, "fadeIn", args);
    }, fadeOut:function (args) {
        return this._anim(baseFx, "fadeOut", args);
    }, animateProperty:function (args) {
        return this._anim(baseFx, "animateProperty", args);
    }, anim:function (properties, duration, easing, onEnd, delay) {
        var canim = coreFx.combine(this.map(function (item) {
            return baseFx.animateProperty({node:item, properties:properties, duration:duration || 350, easing:easing});
        }));
        if (onEnd) {
            aspect.after(canim, "onEnd", onEnd, true);
        }
        return canim.play(delay || 0);
    }});
    return NodeList;
});

