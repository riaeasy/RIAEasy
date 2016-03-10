//>>built

require({cache:{"url:dijit/layout/templates/TabContainer.html":"<div class=\"dijitTabContainer\">\n\t<div class=\"dijitTabListWrapper\" data-dojo-attach-point=\"tablistNode\"></div>\n\t<div data-dojo-attach-point=\"tablistSpacer\" class=\"dijitTabSpacer ${baseClass}-spacer\"></div>\n\t<div class=\"dijitTabPaneWrapper ${baseClass}-container\" data-dojo-attach-point=\"containerNode\"></div>\n</div>\n"}});
define("dijit/layout/_TabContainerBase", ["dojo/_base/declare", "dojo/dom-class", "dojo/dom-geometry", "dojo/dom-style", "./StackContainer", "./utils", "../registry", "../_TemplatedMixin", "dojo/text!./templates/TabContainer.html"], function (declare, domClass, domGeometry, domStyle, StackContainer, layoutUtils, registry, _TemplatedMixin, template) {
    return declare("dijit.layout._TabContainerBase", [StackContainer, _TemplatedMixin], {tabPosition:"top", baseClass:"dijitTabContainer", tabStrip:false, nested:false, templateString:template, postMixInProperties:function () {
        this.baseClass += this.tabPosition.charAt(0).toUpperCase() + this.tabPosition.substr(1).replace(/-.*/, "");
        this.srcNodeRef && domStyle.set(this.srcNodeRef, "visibility", "hidden");
        this.inherited(arguments);
    }, buildRendering:function () {
        this.inherited(arguments);
        this.tablist = this._makeController(this.tablistNode);
        if (!this.doLayout) {
            domClass.add(this.domNode, "dijitTabContainerNoLayout");
        }
        if (this.nested) {
            domClass.add(this.domNode, "dijitTabContainerNested");
            domClass.add(this.tablist.containerNode, "dijitTabContainerTabListNested");
            domClass.add(this.tablistSpacer, "dijitTabContainerSpacerNested");
            domClass.add(this.containerNode, "dijitTabPaneWrapperNested");
        } else {
            domClass.add(this.domNode, "tabStrip-" + (this.tabStrip ? "enabled" : "disabled"));
        }
    }, _setupChild:function (tab) {
        domClass.add(tab.domNode, "dijitTabPane");
        this.inherited(arguments);
    }, startup:function () {
        if (this._started) {
            return;
        }
        this.tablist.startup();
        this.inherited(arguments);
    }, layout:function () {
        if (!this._contentBox || typeof (this._contentBox.l) == "undefined") {
            return;
        }
        var sc = this.selectedChildWidget;
        if (this.doLayout) {
            var titleAlign = this.tabPosition.replace(/-h/, "");
            this.tablist.region = titleAlign;
            var children = [this.tablist, {domNode:this.tablistSpacer, region:titleAlign}, {domNode:this.containerNode, region:"center"}];
            layoutUtils.layoutChildren(this.domNode, this._contentBox, children);
            this._containerContentBox = layoutUtils.marginBox2contentBox(this.containerNode, children[2]);
            if (sc && sc.resize) {
                sc.resize(this._containerContentBox);
            }
        } else {
            if (this.tablist.resize) {
                var s = this.tablist.domNode.style;
                s.width = "0";
                var width = domGeometry.getContentBox(this.domNode).w;
                s.width = "";
                this.tablist.resize({w:width});
            }
            if (sc && sc.resize) {
                sc.resize();
            }
        }
    }, destroy:function (preserveDom) {
        if (this.tablist) {
            this.tablist.destroy(preserveDom);
        }
        this.inherited(arguments);
    }, selectChild:function (page, animate) {
        if (this._focused) {
            page = registry.byId(page);
            this.tablist.pane2button(page.id).focus();
        }
        return this.inherited(arguments);
    }});
});

