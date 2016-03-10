//>>built

define("dojox/mobile/RoundRectList", ["dojo/_base/array", "dojo/_base/declare", "dojo/_base/event", "dojo/_base/lang", "dojo/_base/window", "dojo/dom-construct", "dojo/dom-attr", "dijit/_Contained", "dijit/_Container", "dijit/_WidgetBase"], function (array, declare, event, lang, win, domConstruct, domAttr, Contained, Container, WidgetBase) {
    return declare("dojox.mobile.RoundRectList", [WidgetBase, Container, Contained], {transition:"slide", iconBase:"", iconPos:"", select:"", stateful:false, syncWithViews:false, editable:false, tag:"ul", editableMixinClass:"dojox/mobile/_EditableListMixin", baseClass:"mblRoundRectList", filterBoxClass:"mblFilteredRoundRectListSearchBox", buildRendering:function () {
        this.domNode = this.srcNodeRef || domConstruct.create(this.tag);
        if (this.select) {
            domAttr.set(this.domNode, "role", "listbox");
            if (this.select === "multiple") {
                domAttr.set(this.domNode, "aria-multiselectable", "true");
            }
        }
        this.inherited(arguments);
    }, postCreate:function () {
        if (this.editable) {
            require([this.editableMixinClass], lang.hitch(this, function (module) {
                declare.safeMixin(this, new module());
            }));
        }
        this.connect(this.domNode, "onselectstart", event.stop);
        if (this.syncWithViews) {
            var f = function (view, moveTo, dir, transition, context, method) {
                var child = array.filter(this.getChildren(), function (w) {
                    return w.moveTo === "#" + view.id || w.moveTo === view.id;
                })[0];
                if (child) {
                    child.set("selected", true);
                }
            };
            this.subscribe("/dojox/mobile/afterTransitionIn", f);
            this.subscribe("/dojox/mobile/startView", f);
        }
    }, resize:function () {
        array.forEach(this.getChildren(), function (child) {
            if (child.resize) {
                child.resize();
            }
        });
    }, onCheckStateChanged:function () {
    }, _setStatefulAttr:function (stateful) {
        this._set("stateful", stateful);
        this.selectOne = stateful;
        array.forEach(this.getChildren(), function (child) {
            child.setArrow && child.setArrow();
        });
    }, deselectItem:function (item) {
        item.set("selected", false);
    }, deselectAll:function () {
        array.forEach(this.getChildren(), function (child) {
            child.set("selected", false);
        });
    }, selectItem:function (item) {
        item.set("selected", true);
    }});
});

