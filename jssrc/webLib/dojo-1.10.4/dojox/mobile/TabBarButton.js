//>>built

define("dojox/mobile/TabBarButton", ["dojo/_base/connect", "dojo/_base/declare", "dojo/_base/event", "dojo/_base/lang", "dojo/dom", "dojo/dom-class", "dojo/dom-construct", "dojo/dom-style", "dojo/dom-attr", "./common", "./View", "./iconUtils", "./_ItemBase", "./Badge", "./sniff", "require"], function (connect, declare, event, lang, dom, domClass, domConstruct, domStyle, domAttr, common, View, iconUtils, ItemBase, Badge, has, BidiTabBarButton) {
    var TabBarButton = declare(0 ? "dojox.mobile.NonBidiTabBarButton" : "dojox.mobile.TabBarButton", ItemBase, {icon1:"", icon2:"", iconPos1:"", iconPos2:"", selected:false, transition:"none", tag:"li", badge:"", badgeClass:"mblDomButtonRedBadge", baseClass:"mblTabBarButton", closeIcon:"mblDomButtonWhiteCross", _selStartMethod:"touch", _selEndMethod:"touch", _moveTo:"", destroy:function () {
        if (this.badgeObj) {
            delete this.badgeObj;
        }
        this.inherited(arguments);
    }, inheritParams:function () {
        if (this.icon && !this.icon1) {
            this.icon1 = this.icon;
        }
        var parent = this.getParent();
        if (parent) {
            if (!this.transition) {
                this.transition = parent.transition;
            }
            if (this.icon1 && parent.iconBase && parent.iconBase.charAt(parent.iconBase.length - 1) === "/") {
                this.icon1 = parent.iconBase + this.icon1;
            }
            if (!this.icon1) {
                this.icon1 = parent.iconBase;
            }
            if (!this.iconPos1) {
                this.iconPos1 = parent.iconPos;
            }
            if (this.icon2 && parent.iconBase && parent.iconBase.charAt(parent.iconBase.length - 1) === "/") {
                this.icon2 = parent.iconBase + this.icon2;
            }
            if (!this.icon2) {
                this.icon2 = parent.iconBase || this.icon1;
            }
            if (!this.iconPos2) {
                this.iconPos2 = parent.iconPos || this.iconPos1;
            }
            if (parent.closable) {
                if (!this.icon1) {
                    this.icon1 = this.closeIcon;
                }
                if (!this.icon2) {
                    this.icon2 = this.closeIcon;
                }
                domClass.add(this.domNode, "mblTabBarButtonClosable");
            }
        }
    }, buildRendering:function () {
        this.domNode = this.srcNodeRef || domConstruct.create(this.tag);
        if (this.srcNodeRef) {
            if (!this.label) {
                this.label = lang.trim(this.srcNodeRef.innerHTML);
            }
            this.srcNodeRef.innerHTML = "";
        }
        this.labelNode = this.box = domConstruct.create("div", {className:"mblTabBarButtonLabel"}, this.domNode);
        domAttr.set(this.domNode, "role", "tab");
        domAttr.set(this.domNode, "aria-selected", "false");
        this._moveTo = this._getMoveToId();
        if (this._moveTo) {
            var tabPanelNode = dom.byId(this._moveTo);
            if (tabPanelNode) {
                domAttr.set(this.domNode, "aria-controls", this._moveTo);
                domAttr.set(tabPanelNode, "role", "tabpanel");
                domAttr.set(tabPanelNode, "aria-labelledby", this.id);
            }
        }
        this.inherited(arguments);
    }, startup:function () {
        if (this._started) {
            return;
        }
        this._dragstartHandle = this.connect(this.domNode, "ondragstart", event.stop);
        this.connect(this.domNode, "onkeydown", "_onClick");
        var parent = this.getParent();
        if (parent && parent.closable) {
            this._clickCloseHandler = this.connect(this.iconDivNode, "onclick", "_onCloseButtonClick");
            this._keydownCloseHandler = this.connect(this.iconDivNode, "onkeydown", "_onCloseButtonClick");
            this.iconDivNode.tabIndex = "0";
        }
        this.inherited(arguments);
        if (!this._isOnLine) {
            this._isOnLine = true;
            this.set({icon:this._pendingIcon !== undefined ? this._pendingIcon : this.icon, icon1:this.icon1, icon2:this.icon2});
            delete this._pendingIcon;
        }
        common.setSelectable(this.domNode, false);
    }, onClose:function (e) {
        connect.publish("/dojox/mobile/tabClose", [this]);
        return this.getParent().onCloseButtonClick(this);
    }, _onCloseButtonClick:function (e) {
        if (e && e.type === "keydown" && e.keyCode !== 13) {
            return;
        }
        if (this.onCloseButtonClick(e) === false) {
            return;
        }
        if (this.onClose()) {
            this.destroy();
        }
    }, onCloseButtonClick:function () {
    }, _onClick:function (e) {
        if (e && e.type === "keydown" && e.keyCode !== 13) {
            return;
        }
        if (this.onClick(e) === false) {
            return;
        }
        this.defaultClickAction(e);
    }, onClick:function () {
    }, _setIcon:function (icon, n) {
        if (!this.getParent()) {
            return;
        }
        this._set("icon" + n, icon);
        if (!this.iconDivNode) {
            this.iconDivNode = domConstruct.create("div", {className:"mblTabBarButtonIconArea"}, this.domNode, "first");
        }
        if (!this["iconParentNode" + n]) {
            this["iconParentNode" + n] = domConstruct.create("div", {className:"mblTabBarButtonIconParent mblTabBarButtonIconParent" + n}, this.iconDivNode);
        }
        this["iconNode" + n] = iconUtils.setIcon(icon, this["iconPos" + n], this["iconNode" + n], this.alt, this["iconParentNode" + n]);
        this["icon" + n] = icon;
        domClass.toggle(this.domNode, "mblTabBarButtonHasIcon", icon && icon !== "none");
    }, _getMoveToId:function () {
        if (this.moveTo) {
            if (this.moveTo === "#") {
                return "";
            }
            var toId = "";
            if (typeof (this.moveTo) === "object" && this.moveTo.moveTo) {
                toId = this.moveTo.moveTo;
            } else {
                toId = this.moveTo;
            }
            if (toId) {
                toId = View.prototype.convertToId(toId);
            }
            return toId;
        }
    }, _setIcon1Attr:function (icon) {
        this._setIcon(icon, 1);
    }, _setIcon2Attr:function (icon) {
        this._setIcon(icon, 2);
    }, _getBadgeAttr:function () {
        return this.badgeObj && this.badgeObj.domNode.parentNode && this.badgeObj.domNode.parentNode.nodeType == 1 ? this.badgeObj.getValue() : null;
    }, _setBadgeAttr:function (value) {
        if (!this.badgeObj) {
            this.badgeObj = new Badge({fontSize:11, className:this.badgeClass});
            domStyle.set(this.badgeObj.domNode, {position:"absolute", top:"0px", right:"0px"});
        }
        this.badgeObj.setValue(value);
        if (value) {
            this.domNode.appendChild(this.badgeObj.domNode);
        } else {
            if (this.domNode === this.badgeObj.domNode.parentNode) {
                this.domNode.removeChild(this.badgeObj.domNode);
            }
        }
    }, _setSelectedAttr:function (selected) {
        this.inherited(arguments);
        domClass.toggle(this.domNode, "mblTabBarButtonSelected", selected);
        domAttr.set(this.domNode, "aria-selected", selected ? "true" : "false");
        if (this._moveTo) {
            var tabPanelNode = dom.byId(this._moveTo);
            if (tabPanelNode) {
                domAttr.set(tabPanelNode, "aria-hidden", selected ? "false" : "true");
            }
        }
    }});
    return 0 ? declare("dojox.mobile.TabBarButton", [TabBarButton, BidiTabBarButton]) : TabBarButton;
});

