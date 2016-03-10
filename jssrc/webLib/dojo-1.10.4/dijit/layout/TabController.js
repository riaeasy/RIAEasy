//>>built

require({cache:{"url:dijit/layout/templates/_TabButton.html":"<div role=\"presentation\" data-dojo-attach-point=\"titleNode,innerDiv,tabContent\" class=\"dijitTabInner dijitTabContent\">\n\t<span role=\"presentation\" class=\"dijitInline dijitIcon dijitTabButtonIcon\" data-dojo-attach-point=\"iconNode\"></span>\n\t<span data-dojo-attach-point='containerNode,focusNode' class='tabLabel'></span>\n\t<span class=\"dijitInline dijitTabCloseButton dijitTabCloseIcon\" data-dojo-attach-point='closeNode'\n\t\t  role=\"presentation\">\n\t\t<span data-dojo-attach-point='closeText' class='dijitTabCloseText'>[x]</span\n\t\t\t\t></span>\n</div>\n"}});
define("dijit/layout/TabController", ["dojo/_base/declare", "dojo/dom", "dojo/dom-attr", "dojo/dom-class", "dojo/has", "dojo/i18n", "dojo/_base/lang", "./StackController", "../registry", "../Menu", "../MenuItem", "dojo/text!./templates/_TabButton.html", "dojo/i18n!../nls/common"], function (declare, dom, domAttr, domClass, has, i18n, lang, StackController, registry, Menu, MenuItem, template) {
    var TabButton = declare("dijit.layout._TabButton" + (0 ? "_NoBidi" : ""), StackController.StackButton, {baseClass:"dijitTab", cssStateNodes:{closeNode:"dijitTabCloseButton"}, templateString:template, _setNameAttr:"focusNode", scrollOnFocus:false, buildRendering:function () {
        this.inherited(arguments);
        dom.setSelectable(this.containerNode, false);
    }, startup:function () {
        this.inherited(arguments);
        var n = this.domNode;
        this.defer(function () {
            n.className = n.className;
        }, 1);
    }, _setCloseButtonAttr:function (disp) {
        this._set("closeButton", disp);
        domClass.toggle(this.domNode, "dijitClosable", disp);
        this.closeNode.style.display = disp ? "" : "none";
        if (disp) {
            var _nlsResources = i18n.getLocalization("dijit", "common");
            if (this.closeNode) {
                domAttr.set(this.closeNode, "title", _nlsResources.itemClose);
            }
        }
    }, _setDisabledAttr:function (disabled) {
        this.inherited(arguments);
        if (this.closeNode) {
            if (disabled) {
                domAttr.remove(this.closeNode, "title");
            } else {
                var _nlsResources = i18n.getLocalization("dijit", "common");
                domAttr.set(this.closeNode, "title", _nlsResources.itemClose);
            }
        }
    }, _setLabelAttr:function (content) {
        this.inherited(arguments);
        if (!this.showLabel && !this.params.title) {
            this.iconNode.alt = lang.trim(this.containerNode.innerText || this.containerNode.textContent || "");
        }
    }});
    if (0) {
        TabButton = declare("dijit.layout._TabButton", TabButton, {_setLabelAttr:function (content) {
            this.inherited(arguments);
            this.applyTextDir(this.iconNode, this.iconNode.alt);
        }});
    }
    var TabController = declare("dijit.layout.TabController", StackController, {baseClass:"dijitTabController", templateString:"<div role='tablist' data-dojo-attach-event='onkeydown:onkeydown'></div>", tabPosition:"top", buttonWidget:TabButton, buttonWidgetCloseClass:"dijitTabCloseButton", postCreate:function () {
        this.inherited(arguments);
        var closeMenu = new Menu({id:this.id + "_Menu", ownerDocument:this.ownerDocument, dir:this.dir, lang:this.lang, textDir:this.textDir, targetNodeIds:[this.domNode], selector:function (node) {
            return domClass.contains(node, "dijitClosable") && !domClass.contains(node, "dijitTabDisabled");
        }});
        this.own(closeMenu);
        var _nlsResources = i18n.getLocalization("dijit", "common"), controller = this;
        closeMenu.addChild(new MenuItem({label:_nlsResources.itemClose, ownerDocument:this.ownerDocument, dir:this.dir, lang:this.lang, textDir:this.textDir, onClick:function (evt) {
            var button = registry.byNode(this.getParent().currentTarget);
            controller.onCloseButtonClick(button.page);
        }}));
    }});
    TabController.TabButton = TabButton;
    return TabController;
});

