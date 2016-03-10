//>>built

define("dijit/layout/TabContainer", ["dojo/_base/lang", "dojo/_base/declare", "./_TabContainerBase", "./TabController", "./ScrollingTabController"], function (lang, declare, _TabContainerBase, TabController, ScrollingTabController) {
    return declare("dijit.layout.TabContainer", _TabContainerBase, {useMenu:true, useSlider:true, controllerWidget:"", _makeController:function (srcNode) {
        var cls = this.baseClass + "-tabs" + (this.doLayout ? "" : " dijitTabNoLayout"), TabController = typeof this.controllerWidget == "string" ? lang.getObject(this.controllerWidget) : this.controllerWidget;
        return new TabController({id:this.id + "_tablist", ownerDocument:this.ownerDocument, dir:this.dir, lang:this.lang, textDir:this.textDir, tabPosition:this.tabPosition, doLayout:this.doLayout, containerId:this.id, "class":cls, nested:this.nested, useMenu:this.useMenu, useSlider:this.useSlider, tabStripClass:this.tabStrip ? this.baseClass + (this.tabStrip ? "" : "No") + "Strip" : null}, srcNode);
    }, postMixInProperties:function () {
        this.inherited(arguments);
        if (!this.controllerWidget) {
            this.controllerWidget = (this.tabPosition == "top" || this.tabPosition == "bottom") && !this.nested ? ScrollingTabController : TabController;
        }
    }});
});

