//>>built

define("dojox/layout/dnd/Avatar", ["dijit", "dojo", "dojox", "dojo/require!dojo/dnd/Avatar,dojo/dnd/common"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.layout.dnd.Avatar");
    dojo.require("dojo.dnd.Avatar");
    dojo.require("dojo.dnd.common");
    dojo.declare("dojox.layout.dnd.Avatar", dojo.dnd.Avatar, {constructor:function (manager, opacity) {
        this.opacity = opacity || 0.9;
    }, construct:function () {
        var source = this.manager.source, node = source.creator ? source._normalizedCreator(source.getItem(this.manager.nodes[0].id).data, "avatar").node : this.manager.nodes[0].cloneNode(true);
        dojo.addClass(node, "dojoDndAvatar");
        node.id = dojo.dnd.getUniqueId();
        node.style.position = "absolute";
        node.style.zIndex = 1999;
        node.style.margin = "0px";
        node.style.width = dojo.marginBox(source.node).w + "px";
        dojo.style(node, "opacity", this.opacity);
        this.node = node;
    }, update:function () {
        dojo.toggleClass(this.node, "dojoDndAvatarCanDrop", this.manager.canDropFlag);
    }, _generateText:function () {
    }});
});

