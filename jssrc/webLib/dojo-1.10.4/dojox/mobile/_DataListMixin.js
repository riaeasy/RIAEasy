//>>built

define("dojox/mobile/_DataListMixin", ["dojo/_base/array", "dojo/_base/declare", "dijit/registry", "./_DataMixin", "./ListItem", "dojo/has", "require"], function (array, declare, registry, DataMixin, ListItem, has, BidiDataListMixin) {
    var _DataListMixin = declare(0 ? "dojox.mobile._NonBidiDataListMixin" : "dojox.mobile._DataListMixin", DataMixin, {append:false, itemMap:null, itemRenderer:ListItem, buildRendering:function () {
        this.inherited(arguments);
        if (!this.store) {
            return;
        }
        var store = this.store;
        this.store = null;
        this.setStore(store, this.query, this.queryOptions);
    }, createListItem:function (item) {
        var attr = {};
        var arr = this.store.getLabelAttributes(item);
        var labelAttr = arr ? arr[0] : null;
        array.forEach(this.store.getAttributes(item), function (name) {
            if (name === labelAttr) {
                attr["label"] = this.store.getLabel(item);
            } else {
                attr[(this.itemMap && this.itemMap[name]) || name] = this.store.getValue(item, name);
            }
        }, this);
        if (0 && typeof attr["dir"] == "undefined") {
            attr["dir"] = this.isLeftToRight() ? "ltr" : "rtl";
        }
        var w = new this.itemRenderer(attr);
        item._widgetId = w.id;
        return w;
    }, generateList:function (items, dataObject) {
        if (!this.append) {
            array.forEach(this.getChildren(), function (child) {
                child.destroyRecursive();
            });
        }
        array.forEach(items, function (item, index) {
            this.addChild(this.createListItem(item));
        }, this);
    }, onComplete:function (items, request) {
        this.generateList(items, request);
    }, onError:function (errorData, request) {
    }, onSet:function (item, attribute, oldValue, newValue) {
    }, onNew:function (newItem, parentInfo) {
        this.addChild(this.createListItem(newItem));
    }, onDelete:function (deletedItem) {
        registry.byId(deletedItem._widgetId).destroyRecursive();
    }, onStoreClose:function (request) {
        if (this.store.clearOnClose) {
            this.refresh();
        }
    }});
    return 0 ? declare("dojox.mobile._DataListMixin", [_DataListMixin, BidiDataListMixin]) : _DataListMixin;
});

