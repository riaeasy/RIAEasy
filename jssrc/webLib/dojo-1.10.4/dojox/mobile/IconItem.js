//>>built

define("dojox/mobile/IconItem", ["dojo/_base/declare", "dojo/_base/event", "dojo/_base/lang", "dojo/sniff", "dojo/_base/window", "dojo/dom-class", "dojo/dom-construct", "dojo/dom-geometry", "dojo/dom-style", "./_ItemBase", "./Badge", "./TransitionEvent", "./iconUtils", "./lazyLoadUtils", "./viewRegistry", "./_css3", "require"], function (declare, event, lang, has, win, domClass, domConstruct, domGeometry, domStyle, ItemBase, Badge, TransitionEvent, iconUtils, lazyLoadUtils, viewRegistry, css3, BidiIconItem) {
    var IconItem = declare(0 ? "dojox.mobile.NonBidiIconItem" : "dojox.mobile.IconItem", ItemBase, {lazy:false, requires:"", timeout:10, content:"", badge:"", badgeClass:"mblDomButtonRedBadge", deletable:true, deleteIcon:"", tag:"li", paramsToInherit:"transition,icon,deleteIcon,badgeClass,deleteIconTitle,deleteIconRole", baseClass:"mblIconItem", _selStartMethod:"touch", _selEndMethod:"none", destroy:function () {
        if (this.badgeObj) {
            delete this.badgeObj;
        }
        this.inherited(arguments);
    }, buildRendering:function () {
        this.domNode = this.srcNodeRef || domConstruct.create(this.tag);
        if (this.srcNodeRef) {
            this._tmpNode = domConstruct.create("div");
            for (var i = 0, len = this.srcNodeRef.childNodes.length; i < len; i++) {
                this._tmpNode.appendChild(this.srcNodeRef.firstChild);
            }
        }
        this.iconDivNode = domConstruct.create("div", {className:"mblIconArea"}, this.domNode);
        this.iconParentNode = domConstruct.create("div", {className:"mblIconAreaInner"}, this.iconDivNode);
        this.labelNode = domConstruct.create("span", {className:"mblIconAreaTitle"}, this.iconDivNode);
        this.inherited(arguments);
    }, startup:function () {
        if (this._started) {
            return;
        }
        var p = this.getParent();
        require([p.iconItemPaneClass], lang.hitch(this, function (module) {
            var w = this.paneWidget = new module(p.iconItemPaneProps);
            this.containerNode = w.containerNode;
            if (this._tmpNode) {
                for (var i = 0, len = this._tmpNode.childNodes.length; i < len; i++) {
                    w.containerNode.appendChild(this._tmpNode.firstChild);
                }
                this._tmpNode = null;
            }
            p.paneContainerWidget.addChild(w, this.getIndexInParent());
            w.set("label", this.label);
            this._clickCloseHandle = this.connect(w.closeIconNode, "onclick", "_closeIconClicked");
            this._keydownCloseHandle = this.connect(w.closeIconNode, "onkeydown", "_closeIconClicked");
        }));
        this.inherited(arguments);
        if (!this._isOnLine) {
            this._isOnLine = true;
            this.set("icon", this._pendingIcon !== undefined ? this._pendingIcon : this.icon);
            delete this._pendingIcon;
        }
        if (!this.icon && p.defaultIcon) {
            this.set("icon", p.defaultIcon);
        }
        this._dragstartHandle = this.connect(this.domNode, "ondragstart", event.stop);
        this.connect(this.domNode, "onkeydown", "_onClick");
    }, highlight:function (timeout) {
        domClass.add(this.iconDivNode, "mblVibrate");
        timeout = (timeout !== undefined) ? timeout : this.timeout;
        if (timeout > 0) {
            var _this = this;
            _this.defer(function () {
                _this.unhighlight();
            }, timeout * 1000);
        }
    }, unhighlight:function () {
        if (!has("ie") && has("trident") === 7) {
            domStyle.set(this.iconDivNode, "animation-name", "");
        }
        domClass.remove(this.iconDivNode, "mblVibrate");
    }, isOpen:function (e) {
        return this.paneWidget.isOpen();
    }, _onClick:function (e) {
        if (this.getParent().isEditing || e && e.type === "keydown" && e.keyCode !== 13) {
            return;
        }
        if (this.onClick(e) === false) {
            return;
        }
        this.defaultClickAction(e);
    }, onClick:function () {
    }, _onNewWindowOpened:function (e) {
        this.set("selected", false);
    }, _prepareForTransition:function (e, transOpts) {
        if (transOpts) {
            this.defer(function (d) {
                this.set("selected", false);
            }, 1500);
            return true;
        } else {
            if (this.getParent().transition === "below" && this.isOpen()) {
                this.close();
            } else {
                this.open(e);
            }
            return false;
        }
    }, _closeIconClicked:function (e) {
        if (e) {
            if (e.type === "keydown" && e.keyCode !== 13) {
                return;
            }
            if (this.closeIconClicked(e) === false) {
                return;
            }
            this.defer(function (d) {
                this._closeIconClicked();
            });
            return;
        }
        this.close();
    }, closeIconClicked:function () {
    }, open:function (e) {
        var parent = this.getParent();
        if (this.transition === "below") {
            if (parent.single) {
                parent.closeAll();
            }
            this._open_1();
        } else {
            parent._opening = this;
            if (parent.single) {
                this.paneWidget.closeHeaderNode.style.display = "none";
                if (!this.isOpen()) {
                    parent.closeAll();
                }
                parent.appView._heading.set("label", this.label);
            }
            this.moveTo = parent.id + "_mblApplView";
            new TransitionEvent(this.domNode, this.getTransOpts(), e).dispatch();
        }
    }, _open_1:function () {
        this.paneWidget.show();
        this.unhighlight();
        if (this.lazy) {
            lazyLoadUtils.instantiateLazyWidgets(this.containerNode, this.requires);
            this.lazy = false;
        }
        this.scrollIntoView(this.paneWidget.domNode);
        this.onOpen();
    }, scrollIntoView:function (node) {
        var s = viewRegistry.getEnclosingScrollable(node);
        if (s) {
            var dim = s.getDim();
            if (dim.c.h >= dim.d.h) {
                s.scrollIntoView(node, true);
            }
        } else {
            win.global.scrollBy(0, domGeometry.position(node, false).y);
        }
    }, close:function (noAnimation) {
        if (!this.isOpen()) {
            return;
        }
        this.set("selected", false);
        if (has("css3-animations") && !noAnimation) {
            var contentNode = this.paneWidget.domNode;
            if (this.getParent().transition == "below") {
                domClass.add(contentNode, "mblCloseContent mblShrink");
                var nodePos = domGeometry.position(contentNode, true);
                var targetPos = domGeometry.position(this.domNode, true);
                var origin = (targetPos.x + targetPos.w / 2 - nodePos.x) + "px " + (targetPos.y + targetPos.h / 2 - nodePos.y) + "px";
                domStyle.set(contentNode, css3.add({}, {transformOrigin:origin}));
            } else {
                domClass.add(contentNode, "mblCloseContent mblShrink0");
            }
        } else {
            this.paneWidget.hide();
        }
        this.onClose();
    }, onOpen:function () {
    }, onClose:function () {
    }, _setLabelAttr:function (text) {
        this.label = text;
        var s = this._cv ? this._cv(text) : text;
        this.labelNode.innerHTML = s;
        if (this.paneWidget) {
            this.paneWidget.set("label", text);
        }
    }, _getBadgeAttr:function () {
        return this.badgeObj ? this.badgeObj.getValue() : null;
    }, _setBadgeAttr:function (value) {
        if (!this.badgeObj) {
            this.badgeObj = new Badge({fontSize:14, className:this.badgeClass});
            domStyle.set(this.badgeObj.domNode, {position:"absolute", top:"-2px", right:"2px"});
        }
        this.badgeObj.setValue(value);
        if (value) {
            this.iconDivNode.appendChild(this.badgeObj.domNode);
        } else {
            this.iconDivNode.removeChild(this.badgeObj.domNode);
        }
    }, _setDeleteIconAttr:function (icon) {
        if (!this.getParent()) {
            return;
        }
        this._set("deleteIcon", icon);
        icon = this.deletable ? icon : "";
        this.deleteIconNode = iconUtils.setIcon(icon, this.deleteIconPos, this.deleteIconNode, this.deleteIconTitle || this.alt, this.iconDivNode);
        if (this.deleteIconNode) {
            domClass.add(this.deleteIconNode, "mblIconItemDeleteIcon");
            if (this.deleteIconRole) {
                this.deleteIconNode.setAttribute("role", this.deleteIconRole);
            }
        }
    }, _setContentAttr:function (data) {
        var root;
        if (!this.paneWidget) {
            if (!this._tmpNode) {
                this._tmpNode = domConstruct.create("div");
            }
            root = this._tmpNode;
        } else {
            root = this.paneWidget.containerNode;
        }
        if (typeof data === "object") {
            domConstruct.empty(root);
            root.appendChild(data);
        } else {
            root.innerHTML = data;
        }
    }, _setSelectedAttr:function (selected) {
        this.inherited(arguments);
        this.iconNode && domStyle.set(this.iconNode, "opacity", selected ? this.getParent().pressedIconOpacity : 1);
    }});
    return 0 ? declare("dojox.mobile.IconItem", [IconItem, BidiIconItem]) : IconItem;
});

