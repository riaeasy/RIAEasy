//>>built

define("dojox/mobile/Accordion", ["dojo/_base/array", "dojo/_base/declare", "dojo/_base/lang", "dojo/sniff", "dojo/dom-class", "dojo/dom-construct", "dojo/dom-attr", "dijit/_Contained", "dijit/_Container", "dijit/_WidgetBase", "./iconUtils", "./lazyLoadUtils", "./_css3", "./common", "require", "require"], function (array, declare, lang, has, domClass, domConstruct, domAttr, Contained, Container, WidgetBase, iconUtils, lazyLoadUtils, css3, common, require, BidiAccordion) {
    var _AccordionTitle = declare([WidgetBase, Contained], {label:"Label", icon1:"", icon2:"", iconPos1:"", iconPos2:"", selected:false, baseClass:"mblAccordionTitle", buildRendering:function () {
        this.inherited(arguments);
        var a = this.anchorNode = domConstruct.create("a", {className:"mblAccordionTitleAnchor", role:"presentation"}, this.domNode);
        this.textBoxNode = domConstruct.create("div", {className:"mblAccordionTitleTextBox"}, a);
        this.labelNode = domConstruct.create("span", {className:"mblAccordionTitleLabel", innerHTML:this._cv ? this._cv(this.label) : this.label}, this.textBoxNode);
        this._isOnLine = this.inheritParams();
        domAttr.set(this.textBoxNode, "role", "tab");
        domAttr.set(this.textBoxNode, "tabindex", "0");
    }, postCreate:function () {
        this.connect(this.domNode, "onclick", "_onClick");
        common.setSelectable(this.domNode, false);
    }, inheritParams:function () {
        var parent = this.getParent();
        if (parent) {
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
        }
        return !!parent;
    }, _setIcon:function (icon, n) {
        if (!this.getParent()) {
            return;
        }
        this._set("icon" + n, icon);
        if (!this["iconParentNode" + n]) {
            this["iconParentNode" + n] = domConstruct.create("div", {className:"mblAccordionIconParent mblAccordionIconParent" + n}, this.anchorNode, "first");
        }
        this["iconNode" + n] = iconUtils.setIcon(icon, this["iconPos" + n], this["iconNode" + n], this.alt, this["iconParentNode" + n]);
        this["icon" + n] = icon;
        domClass.toggle(this.domNode, "mblAccordionHasIcon", icon && icon !== "none");
        if (0 && !this.getParent().isLeftToRight()) {
            this.getParent()._setIconDir(this["iconParentNode" + n]);
        }
    }, _setIcon1Attr:function (icon) {
        this._setIcon(icon, 1);
    }, _setIcon2Attr:function (icon) {
        this._setIcon(icon, 2);
    }, startup:function () {
        if (this._started) {
            return;
        }
        if (!this._isOnLine) {
            this.inheritParams();
        }
        if (!this._isOnLine) {
            this.set({icon1:this.icon1, icon2:this.icon2});
        }
        this.inherited(arguments);
    }, _onClick:function (e) {
        if (this.onClick(e) === false) {
            return;
        }
        var p = this.getParent();
        if (!p.fixedHeight && this.contentWidget.domNode.style.display !== "none") {
            p.collapse(this.contentWidget, !p.animation);
        } else {
            p.expand(this.contentWidget, !p.animation);
        }
    }, onClick:function () {
    }, _setSelectedAttr:function (selected) {
        domClass.toggle(this.domNode, "mblAccordionTitleSelected", selected);
        this._set("selected", selected);
    }});
    var Accordion = declare(0 ? "dojox.mobile.NonBidiAccordion" : "dojox.mobile.Accordion", [WidgetBase, Container, Contained], {iconBase:"", iconPos:"", fixedHeight:false, singleOpen:false, animation:true, roundRect:false, duration:0.3, baseClass:"mblAccordion", _openSpace:1, buildRendering:function () {
        this.inherited(arguments);
        domAttr.set(this.domNode, "role", "tablist");
        domAttr.set(this.domNode, "aria-multiselectable", !this.singleOpen);
    }, startup:function () {
        if (this._started) {
            return;
        }
        if (domClass.contains(this.domNode, "mblAccordionRoundRect")) {
            this.roundRect = true;
        } else {
            if (this.roundRect) {
                domClass.add(this.domNode, "mblAccordionRoundRect");
            }
        }
        if (this.fixedHeight) {
            this.singleOpen = true;
        }
        var children = this.getChildren();
        array.forEach(children, this._setupChild, this);
        var sel;
        var posinset = 1;
        array.forEach(children, function (child) {
            child.startup();
            child._at.startup();
            this.collapse(child, true);
            domAttr.set(child._at.textBoxNode, "aria-setsize", children.length);
            domAttr.set(child._at.textBoxNode, "aria-posinset", posinset++);
            if (child.selected) {
                sel = child;
            }
        }, this);
        if (!sel && this.fixedHeight) {
            sel = children[children.length - 1];
        }
        if (sel) {
            this.expand(sel, true);
        } else {
            this._updateLast();
        }
        this.defer(function () {
            this.resize();
        });
        this._started = true;
    }, _setupChild:function (child) {
        if (child.domNode.style.overflow != "hidden") {
            child.domNode.style.overflow = this.fixedHeight ? "auto" : "hidden";
        }
        child._at = new _AccordionTitle({label:child.label, alt:child.alt, icon1:child.icon1, icon2:child.icon2, iconPos1:child.iconPos1, iconPos2:child.iconPos2, contentWidget:child});
        domConstruct.place(child._at.domNode, child.domNode, "before");
        domClass.add(child.domNode, "mblAccordionPane");
        domAttr.set(child._at.textBoxNode, "aria-controls", child.domNode.id);
        domAttr.set(child.domNode, "role", "tabpanel");
        domAttr.set(child.domNode, "aria-labelledby", child._at.id);
    }, addChild:function (widget, insertIndex) {
        this.inherited(arguments);
        if (this._started) {
            this._setupChild(widget);
            widget._at.startup();
            if (widget.selected) {
                this.expand(widget, true);
                this.defer(function () {
                    widget.domNode.style.height = "";
                });
            } else {
                this.collapse(widget);
            }
            this._addChildAriaAttrs();
        }
    }, removeChild:function (widget) {
        if (typeof widget == "number") {
            widget = this.getChildren()[widget];
        }
        if (widget) {
            widget._at.destroy();
        }
        this.inherited(arguments);
        this._addChildAriaAttrs();
    }, _addChildAriaAttrs:function () {
        var posinset = 1;
        var children = this.getChildren();
        array.forEach(children, function (child) {
            domAttr.set(child._at.textBoxNode, "aria-posinset", posinset++);
            domAttr.set(child._at.textBoxNode, "aria-setsize", children.length);
        });
    }, getChildren:function () {
        return array.filter(this.inherited(arguments), function (child) {
            return !(child instanceof _AccordionTitle);
        });
    }, getSelectedPanes:function () {
        return array.filter(this.getChildren(), function (pane) {
            return pane.domNode.style.display != "none";
        });
    }, resize:function () {
        if (this.fixedHeight) {
            var panes = array.filter(this.getChildren(), function (child) {
                return child._at.domNode.style.display != "none";
            });
            var openSpace = this.domNode.clientHeight;
            array.forEach(panes, function (child) {
                openSpace -= child._at.domNode.offsetHeight;
            });
            this._openSpace = openSpace > 0 ? openSpace : 0;
            var sel = this.getSelectedPanes()[0];
            sel.domNode.style[css3.name("transition")] = "";
            sel.domNode.style.height = this._openSpace + "px";
        }
    }, _updateLast:function () {
        var children = this.getChildren();
        array.forEach(children, function (c, i) {
            domClass.toggle(c._at.domNode, "mblAccordionTitleLast", i === children.length - 1 && !domClass.contains(c._at.domNode, "mblAccordionTitleSelected"));
        }, this);
    }, expand:function (pane, noAnimation) {
        if (pane.lazy) {
            lazyLoadUtils.instantiateLazyWidgets(pane.containerNode, pane.requires);
            pane.lazy = false;
        }
        var children = this.getChildren();
        array.forEach(children, function (c, i) {
            c.domNode.style[css3.name("transition")] = noAnimation ? "" : "height " + this.duration + "s linear";
            if (c === pane) {
                c.domNode.style.display = "";
                var h;
                if (this.fixedHeight) {
                    h = this._openSpace;
                } else {
                    h = parseInt(c.height || c.domNode.getAttribute("height"));
                    if (!h) {
                        c.domNode.style.height = "";
                        h = c.domNode.offsetHeight;
                        c.domNode.style.height = "0px";
                    }
                }
                this.defer(function () {
                    c.domNode.style.height = h + "px";
                });
                this.select(pane);
            } else {
                if (this.singleOpen) {
                    this.collapse(c, noAnimation);
                }
            }
        }, this);
        this._updateLast();
        domAttr.set(pane.domNode, "aria-expanded", "true");
        domAttr.set(pane.domNode, "aria-hidden", "false");
    }, collapse:function (pane, noAnimation) {
        if (pane.domNode.style.display === "none") {
            return;
        }
        pane.domNode.style[css3.name("transition")] = noAnimation ? "" : "height " + this.duration + "s linear";
        pane.domNode.style.height = "0px";
        if (!has("css3-animations") || noAnimation) {
            pane.domNode.style.display = "none";
            this._updateLast();
        } else {
            var _this = this;
            _this.defer(function () {
                pane.domNode.style.display = "none";
                _this._updateLast();
                if (!_this.fixedHeight && _this.singleOpen) {
                    for (var v = _this.getParent(); v; v = v.getParent()) {
                        if (domClass.contains(v.domNode, "mblView")) {
                            if (v && v.resize) {
                                v.resize();
                            }
                            break;
                        }
                    }
                }
            }, this.duration * 1000);
        }
        this.deselect(pane);
        domAttr.set(pane.domNode, "aria-expanded", "false");
        domAttr.set(pane.domNode, "aria-hidden", "true");
    }, select:function (pane) {
        pane._at.set("selected", true);
        domAttr.set(pane._at.textBoxNode, "aria-selected", "true");
    }, deselect:function (pane) {
        pane._at.set("selected", false);
        domAttr.set(pane._at.textBoxNode, "aria-selected", "false");
    }});
    Accordion.ChildWidgetProperties = {alt:"", label:"", icon1:"", icon2:"", iconPos1:"", iconPos2:"", selected:false, lazy:false};
    lang.extend(WidgetBase, Accordion.ChildWidgetProperties);
    return 0 ? declare("dojox.mobile.Accordion", [Accordion, BidiAccordion]) : Accordion;
});

