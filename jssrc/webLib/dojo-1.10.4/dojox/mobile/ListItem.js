//>>built

define("dojox/mobile/ListItem", ["dojo/_base/array", "dojo/_base/declare", "dojo/_base/lang", "dojo/dom-class", "dojo/dom-construct", "dojo/dom-style", "dojo/dom-attr", "dijit/registry", "dijit/_WidgetBase", "./iconUtils", "./_ItemBase", "./ProgressIndicator", "dojo/has", "require"], function (array, declare, lang, domClass, domConstruct, domStyle, domAttr, registry, WidgetBase, iconUtils, ItemBase, ProgressIndicator, has, BidiListItem) {
    var ListItem = declare(0 ? "dojox.mobile.NonBidiListItem" : "dojox.mobile.ListItem", ItemBase, {rightText:"", rightIcon:"", rightIcon2:"", deleteIcon:"", anchorLabel:false, noArrow:false, checked:false, arrowClass:"", checkClass:"", uncheckClass:"", variableHeight:false, rightIconTitle:"", rightIcon2Title:"", header:false, tag:"li", busy:false, progStyle:"", layoutOnResize:false, paramsToInherit:"variableHeight,transition,deleteIcon,icon,rightIcon,rightIcon2,uncheckIcon,arrowClass,checkClass,uncheckClass,deleteIconTitle,deleteIconRole", baseClass:"mblListItem", _selStartMethod:"touch", _selEndMethod:"timer", _delayedSelection:true, _selClass:"mblListItemSelected", buildRendering:function () {
        this._templated = !!this.templateString;
        if (!this._templated) {
            this.domNode = this.containerNode = this.srcNodeRef || domConstruct.create(this.tag);
        }
        this.inherited(arguments);
        if (this.selected) {
            domClass.add(this.domNode, this._selClass);
        }
        if (this.header) {
            domClass.replace(this.domNode, "mblEdgeToEdgeCategory", this.baseClass);
        }
        if (!this._templated) {
            this.labelNode = domConstruct.create("div", {className:"mblListItemLabel"});
            var ref = this.srcNodeRef;
            if (ref && ref.childNodes.length === 1 && ref.firstChild.nodeType === 3) {
                this.labelNode.appendChild(ref.firstChild);
            }
            this.domNode.appendChild(this.labelNode);
        }
        this._layoutChildren = [];
    }, startup:function () {
        if (this._started) {
            return;
        }
        var parent = this.getParent();
        var opts = this.getTransOpts();
        if ((!this._templated || this.labelNode) && this.anchorLabel) {
            this.labelNode.style.display = "inline";
            this.labelNode.style.cursor = "pointer";
            this.connect(this.labelNode, "onclick", "_onClick");
            this.onTouchStart = function (e) {
                return (e.target !== this.labelNode);
            };
        }
        this.inherited(arguments);
        if (domClass.contains(this.domNode, "mblVariableHeight")) {
            this.variableHeight = true;
        }
        if (this.variableHeight) {
            domClass.add(this.domNode, "mblVariableHeight");
            this.defer("layoutVariableHeight");
        }
        if (!this._isOnLine) {
            this._isOnLine = true;
            this.set({icon:this._pending_icon !== undefined ? this._pending_icon : this.icon, deleteIcon:this._pending_deleteIcon !== undefined ? this._pending_deleteIcon : this.deleteIcon, rightIcon:this._pending_rightIcon !== undefined ? this._pending_rightIcon : this.rightIcon, rightIcon2:this._pending_rightIcon2 !== undefined ? this._pending_rightIcon2 : this.rightIcon2, uncheckIcon:this._pending_uncheckIcon !== undefined ? this._pending_uncheckIcon : this.uncheckIcon});
            delete this._pending_icon;
            delete this._pending_deleteIcon;
            delete this._pending_rightIcon;
            delete this._pending_rightIcon2;
            delete this._pending_uncheckIcon;
        }
        if (parent && parent.select) {
            this.set("checked", this._pendingChecked !== undefined ? this._pendingChecked : this.checked);
            domAttr.set(this.domNode, "role", "option");
            if (this._pendingChecked || this.checked) {
                domAttr.set(this.domNode, "aria-selected", "true");
            }
            delete this._pendingChecked;
        }
        this.setArrow();
        this.layoutChildren();
    }, _updateHandles:function () {
        var parent = this.getParent();
        var opts = this.getTransOpts();
        if (opts.moveTo || opts.href || opts.url || this.clickable || (parent && parent.select)) {
            if (!this._keydownHandle) {
                this._keydownHandle = this.connect(this.domNode, "onkeydown", "_onClick");
            }
            this._handleClick = true;
        } else {
            if (this._keydownHandle) {
                this.disconnect(this._keydownHandle);
                this._keydownHandle = null;
            }
            this._handleClick = false;
        }
        this.inherited(arguments);
    }, layoutChildren:function () {
        var centerNode;
        array.forEach(this.domNode.childNodes, function (n) {
            if (n.nodeType !== 1) {
                return;
            }
            var layout = n.getAttribute("layout") || n.getAttribute("data-mobile-layout") || (registry.byNode(n) || {}).layout;
            if (layout) {
                domClass.add(n, "mblListItemLayout" + layout.charAt(0).toUpperCase() + layout.substring(1));
                this._layoutChildren.push(n);
                if (layout === "center") {
                    centerNode = n;
                }
            }
        }, this);
        if (centerNode) {
            this.domNode.insertBefore(centerNode, this.domNode.firstChild);
        }
    }, resize:function () {
        if (this.layoutOnResize && this.variableHeight) {
            this.layoutVariableHeight();
        }
        if (!this._templated || this.labelNode) {
            this.labelNode.style.display = this.labelNode.firstChild ? "block" : "inline";
        }
    }, _onTouchStart:function (e) {
        if (e.target.getAttribute("preventTouch") || e.target.getAttribute("data-mobile-prevent-touch") || (registry.getEnclosingWidget(e.target) || {}).preventTouch) {
            return;
        }
        this.inherited(arguments);
    }, _onClick:function (e) {
        if (this.getParent().isEditing || e && e.type === "keydown" && e.keyCode !== 13) {
            return;
        }
        if (this.onClick(e) === false) {
            return;
        }
        var n = this.labelNode;
        if ((this._templated || n) && this.anchorLabel && e.currentTarget === n) {
            domClass.add(n, "mblListItemLabelSelected");
            this.defer(function () {
                domClass.remove(n, "mblListItemLabelSelected");
            }, this._duration);
            this.onAnchorLabelClicked(e);
            return;
        }
        var parent = this.getParent();
        if (parent.select) {
            if (parent.select === "single") {
                if (!this.checked) {
                    this.set("checked", true);
                }
            } else {
                if (parent.select === "multiple") {
                    this.set("checked", !this.checked);
                }
            }
        }
        this.defaultClickAction(e);
    }, onClick:function () {
    }, onAnchorLabelClicked:function (e) {
    }, layoutVariableHeight:function () {
        var h = this.domNode.offsetHeight;
        if (h === this.domNodeHeight) {
            return;
        }
        this.domNodeHeight = h;
        array.forEach(this._layoutChildren.concat([this.rightTextNode, this.rightIcon2Node, this.rightIconNode, this.uncheckIconNode, this.iconNode, this.deleteIconNode, this.knobIconNode]), function (n) {
            if (n) {
                var domNode = this.domNode;
                var f = function () {
                    var t = Math.round((domNode.offsetHeight - n.offsetHeight) / 2) - domStyle.get(domNode, "paddingTop");
                    n.style.marginTop = t + "px";
                };
                if (n.offsetHeight === 0 && n.tagName === "IMG") {
                    n.onload = f;
                } else {
                    f();
                }
            }
        }, this);
    }, setArrow:function () {
        if (this.checked) {
            return;
        }
        var c = "";
        var parent = this.getParent();
        var opts = this.getTransOpts();
        if (opts.moveTo || opts.href || opts.url || this.clickable) {
            if (!this.noArrow && !(parent && parent.selectOne)) {
                c = this.arrowClass || "mblDomButtonArrow";
                domAttr.set(this.domNode, "role", "button");
            }
        }
        if (c) {
            this._setRightIconAttr(c);
        }
    }, _findRef:function (type) {
        var i, node, list = ["deleteIcon", "icon", "rightIcon", "uncheckIcon", "rightIcon2", "rightText"];
        for (i = array.indexOf(list, type) + 1; i < list.length; i++) {
            node = this[list[i] + "Node"];
            if (node) {
                return node;
            }
        }
        for (i = list.length - 1; i >= 0; i--) {
            node = this[list[i] + "Node"];
            if (node) {
                return node.nextSibling;
            }
        }
        return this.domNode.firstChild;
    }, _setIcon:function (icon, type) {
        if (!this._isOnLine) {
            this["_pending_" + type] = icon;
            return;
        }
        this._set(type, icon);
        this[type + "Node"] = iconUtils.setIcon(icon, this[type + "Pos"], this[type + "Node"], this[type + "Title"] || this.alt, this.domNode, this._findRef(type), "before");
        if (this[type + "Node"]) {
            var cap = type.charAt(0).toUpperCase() + type.substring(1);
            domClass.add(this[type + "Node"], "mblListItem" + cap);
        }
        var role = this[type + "Role"];
        if (role) {
            this[type + "Node"].setAttribute("role", role);
        }
    }, _setDeleteIconAttr:function (icon) {
        this._setIcon(icon, "deleteIcon");
    }, _setIconAttr:function (icon) {
        this._setIcon(icon, "icon");
    }, _setRightTextAttr:function (text) {
        if (!this._templated && !this.rightTextNode) {
            this.rightTextNode = domConstruct.create("div", {className:"mblListItemRightText"}, this.labelNode, "before");
        }
        this.rightText = text;
        this.rightTextNode.innerHTML = this._cv ? this._cv(text) : text;
    }, _setRightIconAttr:function (icon) {
        this._setIcon(icon, "rightIcon");
    }, _setUncheckIconAttr:function (icon) {
        this._setIcon(icon, "uncheckIcon");
    }, _setRightIcon2Attr:function (icon) {
        this._setIcon(icon, "rightIcon2");
    }, _setCheckedAttr:function (checked) {
        if (!this._isOnLine) {
            this._pendingChecked = checked;
            return;
        }
        var parent = this.getParent();
        if (parent && parent.select === "single" && checked) {
            array.forEach(parent.getChildren(), function (child) {
                child !== this && child.checked && child.set("checked", false) && domAttr.set(child.domNode, "aria-selected", "false");
            }, this);
        }
        this._setRightIconAttr(this.checkClass || "mblDomButtonCheck");
        this._setUncheckIconAttr(this.uncheckClass);
        domClass.toggle(this.domNode, "mblListItemChecked", checked);
        domClass.toggle(this.domNode, "mblListItemUnchecked", !checked);
        domClass.toggle(this.domNode, "mblListItemHasUncheck", !!this.uncheckIconNode);
        this.rightIconNode.style.position = (this.uncheckIconNode && !checked) ? "absolute" : "";
        if (parent && this.checked !== checked) {
            parent.onCheckStateChanged(this, checked);
        }
        this._set("checked", checked);
        domAttr.set(this.domNode, "aria-selected", checked ? "true" : "false");
    }, _setBusyAttr:function (busy) {
        var prog = this._prog;
        if (busy) {
            if (!this._progNode) {
                this._progNode = domConstruct.create("div", {className:"mblListItemIcon"});
                prog = this._prog = new ProgressIndicator({size:25, center:false, removeOnStop:false});
                domClass.add(prog.domNode, this.progStyle);
                this._progNode.appendChild(prog.domNode);
            }
            if (this.iconNode) {
                this.domNode.replaceChild(this._progNode, this.iconNode);
            } else {
                domConstruct.place(this._progNode, this._findRef("icon"), "before");
            }
            prog.start();
        } else {
            if (this._progNode) {
                if (this.iconNode) {
                    this.domNode.replaceChild(this.iconNode, this._progNode);
                } else {
                    this.domNode.removeChild(this._progNode);
                }
                prog.stop();
            }
        }
        this._set("busy", busy);
    }, _setSelectedAttr:function (selected) {
        this.inherited(arguments);
        domClass.toggle(this.domNode, this._selClass, selected);
    }, _setClickableAttr:function (clickable) {
        this._set("clickable", clickable);
        this._updateHandles();
    }, _setMoveToAttr:function (moveTo) {
        this._set("moveTo", moveTo);
        this._updateHandles();
    }, _setHrefAttr:function (href) {
        this._set("href", href);
        this._updateHandles();
    }, _setUrlAttr:function (url) {
        this._set("url", url);
        this._updateHandles();
    }});
    ListItem.ChildWidgetProperties = {layout:"", preventTouch:false};
    lang.extend(WidgetBase, ListItem.ChildWidgetProperties);
    return 0 ? declare("dojox.mobile.ListItem", [ListItem, BidiListItem]) : ListItem;
});

