//>>built

define("dojox/mobile/_IconItemPane", ["dojo/_base/declare", "dojo/dom-construct", "./Pane", "./iconUtils", "./sniff"], function (declare, domConstruct, Pane, iconUtils, has) {
    return declare("dojox.mobile._IconItemPane", Pane, {iconPos:"", closeIconRole:"", closeIconTitle:"", label:"", closeIcon:"mblDomButtonBlueMinus", baseClass:"mblIconItemPane", tabIndex:"0", _setTabIndexAttr:"closeIconNode", buildRendering:function () {
        this.inherited(arguments);
        this.hide();
        this.closeHeaderNode = domConstruct.create("h2", {className:"mblIconItemPaneHeading"}, this.domNode);
        this.closeIconNode = domConstruct.create("div", {className:"mblIconItemPaneIcon", role:this.closeIconRole, title:this.closeIconTitle}, this.closeHeaderNode);
        this.labelNode = domConstruct.create("span", {className:"mblIconItemPaneTitle"}, this.closeHeaderNode);
        this.containerNode = domConstruct.create("div", {className:"mblContent"}, this.domNode);
    }, show:function () {
        this.domNode.style.display = "";
    }, hide:function () {
        this.domNode.style.display = "none";
    }, isOpen:function (e) {
        return this.domNode.style.display !== "none";
    }, _setLabelAttr:function (text) {
        this._set("label", text);
        this.labelNode.innerHTML = this._cv ? this._cv(text) : text;
    }, _setCloseIconAttr:function (icon) {
        this._set("closeIcon", icon);
        this.closeIconNode = iconUtils.setIcon(icon, this.iconPos, this.closeIconNode, null, this.closeHeaderNode);
        if (has("windows-theme") && this.closeIconTitle !== "") {
            this.closeButtonNode = domConstruct.create("span", {className:"mblButton mblCloseButton", innerHTML:this.closeIconTitle, style:{display:"none"}}, this.closeIconNode);
        }
    }});
});

