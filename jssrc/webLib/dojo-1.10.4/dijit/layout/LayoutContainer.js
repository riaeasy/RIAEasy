//>>built

define("dijit/layout/LayoutContainer", ["dojo/_base/array", "dojo/_base/declare", "dojo/dom-class", "dojo/dom-style", "dojo/_base/lang", "../_WidgetBase", "./_LayoutWidget", "./utils"], function (array, declare, domClass, domStyle, lang, _WidgetBase, _LayoutWidget, layoutUtils) {
    var LayoutContainer = declare("dijit.layout.LayoutContainer", _LayoutWidget, {design:"headline", baseClass:"dijitLayoutContainer", startup:function () {
        if (this._started) {
            return;
        }
        array.forEach(this.getChildren(), this._setupChild, this);
        this.inherited(arguments);
    }, _setupChild:function (child) {
        this.inherited(arguments);
        var region = child.region;
        if (region) {
            domClass.add(child.domNode, this.baseClass + "Pane");
        }
    }, _getOrderedChildren:function () {
        var wrappers = array.map(this.getChildren(), function (child, idx) {
            return {pane:child, weight:[child.region == "center" ? Infinity : 0, child.layoutPriority, (this.design == "sidebar" ? 1 : -1) * (/top|bottom/.test(child.region) ? 1 : -1), idx]};
        }, this);
        wrappers.sort(function (a, b) {
            var aw = a.weight, bw = b.weight;
            for (var i = 0; i < aw.length; i++) {
                if (aw[i] != bw[i]) {
                    return aw[i] - bw[i];
                }
            }
            return 0;
        });
        return array.map(wrappers, function (w) {
            return w.pane;
        });
    }, layout:function () {
        layoutUtils.layoutChildren(this.domNode, this._contentBox, this._getOrderedChildren());
    }, addChild:function (child, insertIndex) {
        this.inherited(arguments);
        if (this._started) {
            this.layout();
        }
    }, removeChild:function (child) {
        this.inherited(arguments);
        if (this._started) {
            this.layout();
        }
        domClass.remove(child.domNode, this.baseClass + "Pane");
        domStyle.set(child.domNode, {top:"auto", bottom:"auto", left:"auto", right:"auto", position:"static"});
        domStyle.set(child.domNode, /top|bottom/.test(child.region) ? "width" : "height", "auto");
    }});
    LayoutContainer.ChildWidgetProperties = {region:"", layoutAlign:"", layoutPriority:0};
    lang.extend(_WidgetBase, LayoutContainer.ChildWidgetProperties);
    return LayoutContainer;
});

