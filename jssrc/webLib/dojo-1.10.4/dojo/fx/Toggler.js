//>>built

define("dojo/fx/Toggler", ["../_base/lang", "../_base/declare", "../_base/fx", "../aspect"], function (lang, declare, baseFx, aspect) {
    return declare("dojo.fx.Toggler", null, {node:null, showFunc:baseFx.fadeIn, hideFunc:baseFx.fadeOut, showDuration:200, hideDuration:200, constructor:function (args) {
        var _t = this;
        lang.mixin(_t, args);
        _t.node = args.node;
        _t._showArgs = lang.mixin({}, args);
        _t._showArgs.node = _t.node;
        _t._showArgs.duration = _t.showDuration;
        _t.showAnim = _t.showFunc(_t._showArgs);
        _t._hideArgs = lang.mixin({}, args);
        _t._hideArgs.node = _t.node;
        _t._hideArgs.duration = _t.hideDuration;
        _t.hideAnim = _t.hideFunc(_t._hideArgs);
        aspect.after(_t.showAnim, "beforeBegin", lang.hitch(_t.hideAnim, "stop", true), true);
        aspect.after(_t.hideAnim, "beforeBegin", lang.hitch(_t.showAnim, "stop", true), true);
    }, show:function (delay) {
        return this.showAnim.play(delay || 0);
    }, hide:function (delay) {
        return this.hideAnim.play(delay || 0);
    }});
});

