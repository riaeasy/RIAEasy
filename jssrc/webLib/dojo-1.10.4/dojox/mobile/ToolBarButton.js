//>>built

define("dojox/mobile/ToolBarButton", ["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/window", "dojo/dom-class", "dojo/dom-construct", "dojo/dom-style", "dojo/dom-attr", "./sniff", "./_ItemBase", "require"], function (declare, lang, win, domClass, domConstruct, domStyle, domAttr, has, ItemBase, BidiToolBarButton) {
    var ToolBarButton = declare(0 ? "dojox.mobile.NonBidiToolBarButton" : "dojox.mobile.ToolBarButton", ItemBase, {selected:false, arrow:"", light:true, defaultColor:"mblColorDefault", selColor:"mblColorDefaultSel", baseClass:"mblToolBarButton", _selStartMethod:"touch", _selEndMethod:"touch", buildRendering:function () {
        if (!this.label && this.srcNodeRef) {
            this.label = this.srcNodeRef.innerHTML;
        }
        this.label = lang.trim(this.label);
        this.domNode = (this.srcNodeRef && this.srcNodeRef.tagName === "SPAN") ? this.srcNodeRef : domConstruct.create("span");
        domAttr.set(this.domNode, "role", "button");
        this.inherited(arguments);
        if (this.light && !this.arrow && (!this.icon || !this.label)) {
            this.labelNode = this.tableNode = this.bodyNode = this.iconParentNode = this.domNode;
            domClass.add(this.domNode, this.defaultColor + " mblToolBarButtonBody" + (this.icon ? " mblToolBarButtonLightIcon" : " mblToolBarButtonLightText"));
            return;
        }
        this.domNode.innerHTML = "";
        if (this.arrow === "left" || this.arrow === "right") {
            this.arrowNode = domConstruct.create("span", {className:"mblToolBarButtonArrow mblToolBarButton" + (this.arrow === "left" ? "Left" : "Right") + "Arrow " + (has("ie") < 10 ? "" : (this.defaultColor + " " + this.defaultColor + "45"))}, this.domNode);
            domClass.add(this.domNode, "mblToolBarButtonHas" + (this.arrow === "left" ? "Left" : "Right") + "Arrow");
        }
        this.bodyNode = domConstruct.create("span", {className:"mblToolBarButtonBody"}, this.domNode);
        this.tableNode = domConstruct.create("table", {cellPadding:"0", cellSpacing:"0", border:"0", role:"presentation"}, this.bodyNode);
        if (!this.label && this.arrow) {
            this.tableNode.className = "mblToolBarButtonText";
        }
        var row = this.tableNode.insertRow(-1);
        this.iconParentNode = row.insertCell(-1);
        this.labelNode = row.insertCell(-1);
        this.iconParentNode.className = "mblToolBarButtonIcon";
        this.labelNode.className = "mblToolBarButtonLabel";
        if (this.icon && this.icon !== "none" && this.label) {
            domClass.add(this.domNode, "mblToolBarButtonHasIcon");
            domClass.add(this.bodyNode, "mblToolBarButtonLabeledIcon");
        }
        domClass.add(this.bodyNode, this.defaultColor);
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
        this.defaultClickAction(e);
    }, onClick:function () {
    }, _setLabelAttr:function (text) {
        this.inherited(arguments);
        domClass.toggle(this.tableNode, "mblToolBarButtonText", text || this.arrow);
    }, _setSelectedAttr:function (selected) {
        var replace = function (node, a, b) {
            domClass.replace(node, a + " " + a + "45", b + " " + b + "45");
        };
        this.inherited(arguments);
        if (selected) {
            domClass.replace(this.bodyNode, this.selColor, this.defaultColor);
            if (!(has("ie") < 10) && this.arrowNode) {
                replace(this.arrowNode, this.selColor, this.defaultColor);
            }
        } else {
            domClass.replace(this.bodyNode, this.defaultColor, this.selColor);
            if (!(has("ie") < 10) && this.arrowNode) {
                replace(this.arrowNode, this.defaultColor, this.selColor);
            }
        }
        domClass.toggle(this.domNode, "mblToolBarButtonSelected", selected);
        domClass.toggle(this.bodyNode, "mblToolBarButtonBodySelected", selected);
    }});
    return 0 ? declare("dojox.mobile.ToolBarButton", [ToolBarButton, BidiToolBarButton]) : ToolBarButton;
});

