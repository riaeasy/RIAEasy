//>>built

define("dojox/mdnd/PureSource", ["dojo/_base/kernel", "dojo/_base/declare", "dojo/_base/lang", "dojo/_base/connect", "dojo/_base/array", "dojo/dom-class", "dojo/dnd/common", "dojo/dnd/Selector", "dojo/dnd/Manager"], function (dojo, declare, lang, connect, array, domClass, dnd, Selector, Manager) {
    return declare("dojox.mdnd.PureSource", Selector, {horizontal:false, copyOnly:true, skipForm:false, withHandles:false, isSource:true, targetState:"Disabled", generateText:true, constructor:function (node, params) {
        lang.mixin(this, lang.mixin({}, params));
        var type = this.accept;
        this.isDragging = false;
        this.mouseDown = false;
        this.sourceState = "";
        domClass.add(this.node, "dojoDndSource");
        if (this.horizontal) {
            domClass.add(this.node, "dojoDndHorizontal");
        }
        this.topics = [connect.subscribe("/dnd/cancel", this, "onDndCancel"), connect.subscribe("/dnd/drop", this, "onDndCancel")];
    }, onDndCancel:function () {
        this.isDragging = false;
        this.mouseDown = false;
        delete this.mouseButton;
    }, copyState:function (keyPressed) {
        return this.copyOnly || keyPressed;
    }, destroy:function () {
        dojox.mdnd.PureSource.superclass.destroy.call(this);
        array.forEach(this.topics, connect.unsubscribe);
        this.targetAnchor = null;
    }, markupFactory:function (params, node) {
        params._skipStartup = true;
        return new dojox.mdnd.PureSource(node, params);
    }, onMouseMove:function (e) {
        if (this.isDragging) {
            return;
        }
        dojox.mdnd.PureSource.superclass.onMouseMove.call(this, e);
        var m = Manager.manager();
        if (this.mouseDown && !this.isDragging && this.isSource) {
            var nodes = this.getSelectedNodes();
            if (nodes.length) {
                m.startDrag(this, nodes, this.copyState(connect.isCopyKey(e)));
                this.isDragging = true;
            }
        }
    }, onMouseDown:function (e) {
        if (this._legalMouseDown(e) && (!this.skipForm || !dnd.isFormElement(e))) {
            this.mouseDown = true;
            this.mouseButton = e.button;
            dojox.mdnd.PureSource.superclass.onMouseDown.call(this, e);
        }
    }, onMouseUp:function (e) {
        if (this.mouseDown) {
            this.mouseDown = false;
            dojox.mdnd.PureSource.superclass.onMouseUp.call(this, e);
        }
    }, onOverEvent:function () {
        dojox.mdnd.PureSource.superclass.onOverEvent.call(this);
        Manager.manager().overSource(this);
    }, onOutEvent:function () {
        dojox.mdnd.PureSource.superclass.onOutEvent.call(this);
        Manager.manager().outSource(this);
    }, _markDndStatus:function (copy) {
        this._changeState("Source", copy ? "Copied" : "Moved");
    }, _legalMouseDown:function (e) {
        if (!this.withHandles) {
            return true;
        }
        for (var node = e.target; node && !domClass.contains(node, "dojoDndItem"); node = node.parentNode) {
            if (domClass.contains(node, "dojoDndHandle")) {
                return true;
            }
        }
        return false;
    }});
});

