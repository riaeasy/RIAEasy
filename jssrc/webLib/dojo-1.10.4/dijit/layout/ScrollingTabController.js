//>>built

require({cache:{"url:dijit/layout/templates/ScrollingTabController.html":"<div class=\"dijitTabListContainer-${tabPosition}\" style=\"visibility:hidden\">\n\t<div data-dojo-type=\"dijit.layout._ScrollingTabControllerMenuButton\"\n\t\t class=\"tabStripButton-${tabPosition}\"\n\t\t id=\"${id}_menuBtn\"\n\t\t data-dojo-props=\"containerId: '${containerId}', iconClass: 'dijitTabStripMenuIcon',\n\t\t\t\t\tdropDownPosition: ['below-alt', 'above-alt']\"\n\t\t data-dojo-attach-point=\"_menuBtn\" showLabel=\"false\" title=\"\">&#9660;</div>\n\t<div data-dojo-type=\"dijit.layout._ScrollingTabControllerButton\"\n\t\t class=\"tabStripButton-${tabPosition}\"\n\t\t id=\"${id}_leftBtn\"\n\t\t data-dojo-props=\"iconClass:'dijitTabStripSlideLeftIcon', showLabel:false, title:''\"\n\t\t data-dojo-attach-point=\"_leftBtn\" data-dojo-attach-event=\"onClick: doSlideLeft\">&#9664;</div>\n\t<div data-dojo-type=\"dijit.layout._ScrollingTabControllerButton\"\n\t\t class=\"tabStripButton-${tabPosition}\"\n\t\t id=\"${id}_rightBtn\"\n\t\t data-dojo-props=\"iconClass:'dijitTabStripSlideRightIcon', showLabel:false, title:''\"\n\t\t data-dojo-attach-point=\"_rightBtn\" data-dojo-attach-event=\"onClick: doSlideRight\">&#9654;</div>\n\t<div class='dijitTabListWrapper' data-dojo-attach-point='tablistWrapper'>\n\t\t<div role='tablist' data-dojo-attach-event='onkeydown:onkeydown'\n\t\t\t data-dojo-attach-point='containerNode' class='nowrapTabStrip'></div>\n\t</div>\n</div>", "url:dijit/layout/templates/_ScrollingTabControllerButton.html":"<div data-dojo-attach-event=\"ondijitclick:_onClick\" class=\"dijitTabInnerDiv dijitTabContent dijitButtonContents\"  data-dojo-attach-point=\"focusNode\" role=\"button\">\n\t<span role=\"presentation\" class=\"dijitInline dijitTabStripIcon\" data-dojo-attach-point=\"iconNode\"></span>\n\t<span data-dojo-attach-point=\"containerNode,titleNode\" class=\"dijitButtonText\"></span>\n</div>"}});
define("dijit/layout/ScrollingTabController", ["dojo/_base/array", "dojo/_base/declare", "dojo/dom-class", "dojo/dom-geometry", "dojo/dom-style", "dojo/_base/fx", "dojo/_base/lang", "dojo/on", "dojo/query", "dojo/sniff", "../registry", "dojo/text!./templates/ScrollingTabController.html", "dojo/text!./templates/_ScrollingTabControllerButton.html", "./TabController", "./utils", "../_WidgetsInTemplateMixin", "../Menu", "../MenuItem", "../form/Button", "../_HasDropDown", "dojo/NodeList-dom", "../a11yclick"], function (array, declare, domClass, domGeometry, domStyle, fx, lang, on, query, has, registry, tabControllerTemplate, buttonTemplate, TabController, layoutUtils, _WidgetsInTemplateMixin, Menu, MenuItem, Button, _HasDropDown) {
    var ScrollingTabController = declare("dijit.layout.ScrollingTabController", [TabController, _WidgetsInTemplateMixin], {baseClass:"dijitTabController dijitScrollingTabController", templateString:tabControllerTemplate, useMenu:true, useSlider:true, tabStripClass:"", _minScroll:5, _setClassAttr:{node:"containerNode", type:"class"}, buildRendering:function () {
        this.inherited(arguments);
        var n = this.domNode;
        this.scrollNode = this.tablistWrapper;
        this._initButtons();
        if (!this.tabStripClass) {
            this.tabStripClass = "dijitTabContainer" + this.tabPosition.charAt(0).toUpperCase() + this.tabPosition.substr(1).replace(/-.*/, "") + "None";
            domClass.add(n, "tabStrip-disabled");
        }
        domClass.add(this.tablistWrapper, this.tabStripClass);
    }, onStartup:function () {
        this.inherited(arguments);
        domStyle.set(this.domNode, "visibility", "");
        this._postStartup = true;
        this.own(on(this.containerNode, "attrmodified-label, attrmodified-iconclass", lang.hitch(this, function (evt) {
            if (this._dim) {
                this.resize(this._dim);
            }
        })));
    }, onAddChild:function (page, insertIndex) {
        this.inherited(arguments);
        domStyle.set(this.containerNode, "width", (domStyle.get(this.containerNode, "width") + 200) + "px");
    }, onRemoveChild:function (page, insertIndex) {
        var button = this.pane2button(page.id);
        if (this._selectedTab === button.domNode) {
            this._selectedTab = null;
        }
        this.inherited(arguments);
    }, _initButtons:function () {
        this._btnWidth = 0;
        this._buttons = query("> .tabStripButton", this.domNode).filter(function (btn) {
            if ((this.useMenu && btn == this._menuBtn.domNode) || (this.useSlider && (btn == this._rightBtn.domNode || btn == this._leftBtn.domNode))) {
                this._btnWidth += domGeometry.getMarginSize(btn).w;
                return true;
            } else {
                domStyle.set(btn, "display", "none");
                return false;
            }
        }, this);
    }, _getTabsWidth:function () {
        var children = this.getChildren();
        if (children.length) {
            var leftTab = children[this.isLeftToRight() ? 0 : children.length - 1].domNode, rightTab = children[this.isLeftToRight() ? children.length - 1 : 0].domNode;
            return rightTab.offsetLeft + rightTab.offsetWidth - leftTab.offsetLeft;
        } else {
            return 0;
        }
    }, _enableBtn:function (width) {
        var tabsWidth = this._getTabsWidth();
        width = width || domStyle.get(this.scrollNode, "width");
        return tabsWidth > 0 && width < tabsWidth;
    }, resize:function (dim) {
        this._dim = dim;
        this.scrollNode.style.height = "auto";
        var cb = this._contentBox = layoutUtils.marginBox2contentBox(this.domNode, {h:0, w:dim.w});
        cb.h = this.scrollNode.offsetHeight;
        domGeometry.setContentSize(this.domNode, cb);
        var enable = this._enableBtn(this._contentBox.w);
        this._buttons.style("display", enable ? "" : "none");
        this._leftBtn.region = "left";
        this._rightBtn.region = "right";
        this._menuBtn.region = this.isLeftToRight() ? "right" : "left";
        layoutUtils.layoutChildren(this.domNode, this._contentBox, [this._menuBtn, this._leftBtn, this._rightBtn, {domNode:this.scrollNode, region:"center"}]);
        if (this._selectedTab) {
            if (this._anim && this._anim.status() == "playing") {
                this._anim.stop();
            }
            this.scrollNode.scrollLeft = this._convertToScrollLeft(this._getScrollForSelectedTab());
        }
        this._setButtonClass(this._getScroll());
        this._postResize = true;
        return {h:this._contentBox.h, w:dim.w};
    }, _getScroll:function () {
        return (this.isLeftToRight() || has("ie") < 8 || (has("ie") && has("quirks")) || has("webkit")) ? this.scrollNode.scrollLeft : domStyle.get(this.containerNode, "width") - domStyle.get(this.scrollNode, "width") + (has("ie") >= 8 ? -1 : 1) * this.scrollNode.scrollLeft;
    }, _convertToScrollLeft:function (val) {
        if (this.isLeftToRight() || has("ie") < 8 || (has("ie") && has("quirks")) || has("webkit")) {
            return val;
        } else {
            var maxScroll = domStyle.get(this.containerNode, "width") - domStyle.get(this.scrollNode, "width");
            return (has("ie") >= 8 ? -1 : 1) * (val - maxScroll);
        }
    }, onSelectChild:function (page) {
        var tab = this.pane2button(page.id);
        if (!tab) {
            return;
        }
        var node = tab.domNode;
        if (node != this._selectedTab) {
            this._selectedTab = node;
            if (this._postResize) {
                var sl = this._getScroll();
                if (sl > node.offsetLeft || sl + domStyle.get(this.scrollNode, "width") < node.offsetLeft + domStyle.get(node, "width")) {
                    this.createSmoothScroll().play();
                }
            }
        }
        this.inherited(arguments);
    }, _getScrollBounds:function () {
        var children = this.getChildren(), scrollNodeWidth = domStyle.get(this.scrollNode, "width"), containerWidth = domStyle.get(this.containerNode, "width"), maxPossibleScroll = containerWidth - scrollNodeWidth, tabsWidth = this._getTabsWidth();
        if (children.length && tabsWidth > scrollNodeWidth) {
            return {min:this.isLeftToRight() ? 0 : children[children.length - 1].domNode.offsetLeft, max:this.isLeftToRight() ? (children[children.length - 1].domNode.offsetLeft + children[children.length - 1].domNode.offsetWidth) - scrollNodeWidth : maxPossibleScroll};
        } else {
            var onlyScrollPosition = this.isLeftToRight() ? 0 : maxPossibleScroll;
            return {min:onlyScrollPosition, max:onlyScrollPosition};
        }
    }, _getScrollForSelectedTab:function () {
        var w = this.scrollNode, n = this._selectedTab, scrollNodeWidth = domStyle.get(this.scrollNode, "width"), scrollBounds = this._getScrollBounds();
        var pos = (n.offsetLeft + domStyle.get(n, "width") / 2) - scrollNodeWidth / 2;
        pos = Math.min(Math.max(pos, scrollBounds.min), scrollBounds.max);
        return pos;
    }, createSmoothScroll:function (x) {
        if (arguments.length > 0) {
            var scrollBounds = this._getScrollBounds();
            x = Math.min(Math.max(x, scrollBounds.min), scrollBounds.max);
        } else {
            x = this._getScrollForSelectedTab();
        }
        if (this._anim && this._anim.status() == "playing") {
            this._anim.stop();
        }
        var self = this, w = this.scrollNode, anim = new fx.Animation({beforeBegin:function () {
            if (this.curve) {
                delete this.curve;
            }
            var oldS = w.scrollLeft, newS = self._convertToScrollLeft(x);
            anim.curve = new fx._Line(oldS, newS);
        }, onAnimate:function (val) {
            w.scrollLeft = val;
        }});
        this._anim = anim;
        this._setButtonClass(x);
        return anim;
    }, _getBtnNode:function (e) {
        var n = e.target;
        while (n && !domClass.contains(n, "tabStripButton")) {
            n = n.parentNode;
        }
        return n;
    }, doSlideRight:function (e) {
        this.doSlide(1, this._getBtnNode(e));
    }, doSlideLeft:function (e) {
        this.doSlide(-1, this._getBtnNode(e));
    }, doSlide:function (direction, node) {
        if (node && domClass.contains(node, "dijitTabDisabled")) {
            return;
        }
        var sWidth = domStyle.get(this.scrollNode, "width");
        var d = (sWidth * 0.75) * direction;
        var to = this._getScroll() + d;
        this._setButtonClass(to);
        this.createSmoothScroll(to).play();
    }, _setButtonClass:function (scroll) {
        var scrollBounds = this._getScrollBounds();
        this._leftBtn.set("disabled", scroll <= scrollBounds.min);
        this._rightBtn.set("disabled", scroll >= scrollBounds.max);
    }});
    var ScrollingTabControllerButtonMixin = declare("dijit.layout._ScrollingTabControllerButtonMixin", null, {baseClass:"dijitTab tabStripButton", templateString:buttonTemplate, tabIndex:"", isFocusable:function () {
        return false;
    }});
    declare("dijit.layout._ScrollingTabControllerButton", [Button, ScrollingTabControllerButtonMixin]);
    declare("dijit.layout._ScrollingTabControllerMenuButton", [Button, _HasDropDown, ScrollingTabControllerButtonMixin], {containerId:"", tabIndex:"-1", isLoaded:function () {
        return false;
    }, loadDropDown:function (callback) {
        this.dropDown = new Menu({id:this.containerId + "_menu", ownerDocument:this.ownerDocument, dir:this.dir, lang:this.lang, textDir:this.textDir});
        var container = registry.byId(this.containerId);
        array.forEach(container.getChildren(), function (page) {
            var menuItem = new MenuItem({id:page.id + "_stcMi", label:page.title, iconClass:page.iconClass, disabled:page.disabled, ownerDocument:this.ownerDocument, dir:page.dir, lang:page.lang, textDir:page.textDir || container.textDir, onClick:function () {
                container.selectChild(page);
            }});
            this.dropDown.addChild(menuItem);
        }, this);
        callback();
    }, closeDropDown:function (focus) {
        this.inherited(arguments);
        if (this.dropDown) {
            this._popupStateNode.removeAttribute("aria-owns");
            this.dropDown.destroyRecursive();
            delete this.dropDown;
        }
    }});
    return ScrollingTabController;
});

