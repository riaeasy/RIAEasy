//>>built

define("dojox/fx/ext-dojo/NodeList", ["dojo/_base/kernel", "dojo/_base/lang", "dojo/_base/fx", "dojox/fx", "dojo/NodeList-fx"], function (kernel, lang, baseFx, CoreFx, NodeList) {
    kernel.experimental("dojox.fx.ext-dojo.NodeList");
    lang.extend(NodeList, {sizeTo:function (args) {
        return this._anim(CoreFx, "sizeTo", args);
    }, slideBy:function (args) {
        return this._anim(CoreFx, "slideBy", args);
    }, highlight:function (args) {
        return this._anim(CoreFx, "highlight", args);
    }, fadeTo:function (args) {
        return this._anim(baseFx, "_fade", args);
    }, wipeTo:function (args) {
        return this._anim(CoreFx, "wipeTo", args);
    }});
    return NodeList;
});

