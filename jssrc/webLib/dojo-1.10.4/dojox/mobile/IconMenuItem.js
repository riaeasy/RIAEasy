//>>built

define("dojox/mobile/IconMenuItem", ["dojo/_base/declare", "dojo/_base/lang", "dojo/dom-class", "dojo/dom-construct", "dojo/dom-attr", "./iconUtils", "./_ItemBase"], function (declare, lang, domClass, domConstruct, domAttr, iconUtils, ItemBase) {
    return declare("dojox.mobile.IconMenuItem", ItemBase, {closeOnAction:false, tag:"li", baseClass:"mblIconMenuItem", selColor:"mblIconMenuItemSel", _selStartMethod:"touch", _selEndMethod:"touch", buildRendering:function () {
        this.domNode = this.srcNodeRef || domConstruct.create(this.tag);
        domAttr.set(this.domNode, "role", "menuitemcheckbox");
        domAttr.set(this.domNode, "aria-checked", "false");
        this.inherited(arguments);
        if (this.selected) {
            domClass.add(this.domNode, this.selColor);
        }
        if (this.srcNodeRef) {
            if (!this.label) {
                this.label = lang.trim(this.srcNodeRef.innerHTML);
            }
            this.srcNodeRef.innerHTML = "";
        }
        var a = this.anchorNode = this.containerNode = domConstruct.create("a", {className:"mblIconMenuItemAnchor", role:"presentation"});
        var tbl = domConstruct.create("table", {className:"mblIconMenuItemTable", role:"presentation"}, a);
        var cell = this.iconParentNode = tbl.insertRow(-1).insertCell(-1);
        this.iconNode = domConstruct.create("div", {className:"mblIconMenuItemIcon"}, cell);
        this.labelNode = this.refNode = domConstruct.create("div", {className:"mblIconMenuItemLabel"}, cell);
        this.position = "before";
        this.domNode.appendChild(a);
    }, startup:function () {
        if (this._started) {
            return;
        }
        this.connect(this.domNode, "onkeydown", "_onClick");
        this.inherited(arguments);
        if (!this._isOnLine) {
            this._isOnLine = true;
            this.set("icon", this._pendingIcon !== undefined ? this._pendingIcon : this.icon);
            delete this._pendingIcon;
        }
    }, _onClick:function (e) {
        if (e && e.type === "keydown" && e.keyCode !== 13) {
            return;
        }
        if (this.onClick(e) === false) {
            return;
        }
        if (this.closeOnAction) {
            var p = this.getParent();
            if (p && p.hide) {
                p.hide();
            }
        }
        this.defaultClickAction(e);
    }, onClick:function () {
    }, _setSelectedAttr:function (selected) {
        this.inherited(arguments);
        domClass.toggle(this.domNode, this.selColor, selected);
        domAttr.set(this.domNode, "aria-checked", selected ? "true" : "false");
    }});
});

