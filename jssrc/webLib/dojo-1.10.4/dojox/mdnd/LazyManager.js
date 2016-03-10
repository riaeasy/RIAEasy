//>>built

define("dojox/mdnd/LazyManager", ["dojo/_base/kernel", "dojo/_base/declare", "dojo/_base/lang", "dojo/dom-class", "dojo/dom-construct", "dojo/dom-attr", "dojo/dnd/common", "dojo/dnd/Manager", "./PureSource", "dojo/_base/unload"], function (dojo, declare, lang, domClass, domConstruct, domAttr, dnd, Manager, PureSource) {
    return declare("dojox.mdnd.LazyManager", null, {constructor:function () {
        this._registry = {};
        this._fakeSource = new PureSource(domConstruct.create("div"), {"copyOnly":false});
        this._fakeSource.startup();
        dojo.addOnUnload(lang.hitch(this, "destroy"));
        this.manager = Manager.manager();
    }, getItem:function (draggedNode) {
        var type = draggedNode.getAttribute("dndType");
        return {"data":draggedNode.getAttribute("dndData") || draggedNode.innerHTML, "type":type ? type.split(/\s*,\s*/) : ["text"]};
    }, startDrag:function (e, draggedNode) {
        draggedNode = draggedNode || e.target;
        if (draggedNode) {
            var m = this.manager, object = this.getItem(draggedNode);
            if (draggedNode.id == "") {
                domAttr.set(draggedNode, "id", dnd.getUniqueId());
            }
            domClass.add(draggedNode, "dojoDndItem");
            this._fakeSource.setItem(draggedNode.id, object);
            m.startDrag(this._fakeSource, [draggedNode], false);
            m.onMouseMove(e);
        }
    }, cancelDrag:function () {
        var m = this.manager;
        m.target = null;
        m.onMouseUp();
    }, destroy:function () {
        this._fakeSource.destroy();
    }});
});

