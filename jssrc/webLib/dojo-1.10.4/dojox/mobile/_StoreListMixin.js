//>>built

define("dojox/mobile/_StoreListMixin", ["dojo/_base/array", "dojo/_base/declare", "./_StoreMixin", "./ListItem", "dojo/has", "require"], function (array, declare, StoreMixin, ListItem, has, BidiStoreListMixin) {
    var _StoreListMixin = declare(0 ? "dojox.mobile._NonBidiStoreListMixin" : "dojox.mobile._StoreListMixin", StoreMixin, {append:false, itemMap:null, itemRenderer:ListItem, buildRendering:function () {
        this.inherited(arguments);
        if (!this.store) {
            return;
        }
        var store = this.store;
        this.store = null;
        this.setStore(store, this.query, this.queryOptions);
    }, createListItem:function (item) {
        return new this.itemRenderer(this._createItemProperties(item));
    }, _createItemProperties:function (item) {
        var props = {};
        if (!item["label"]) {
            props["label"] = item[this.labelProperty];
        }
        if (0 && typeof props["dir"] == "undefined") {
            props["dir"] = this.isLeftToRight() ? "ltr" : "rtl";
        }
        for (var name in item) {
            props[(this.itemMap && this.itemMap[name]) || name] = item[name];
        }
        return props;
    }, _setDirAttr:function (props) {
        return props;
    }, generateList:function (items) {
        if (!this.append) {
            array.forEach(this.getChildren(), function (child) {
                child.destroyRecursive();
            });
        }
        array.forEach(items, function (item, index) {
            this.addChild(this.createListItem(item));
            if (item[this.childrenProperty]) {
                array.forEach(item[this.childrenProperty], function (child, index) {
                    this.addChild(this.createListItem(child));
                }, this);
            }
        }, this);
    }, onComplete:function (items) {
        this.generateList(items);
    }, onError:function () {
    }, onAdd:function (item, insertedInto) {
        this.addChild(this.createListItem(item), insertedInto);
    }, onUpdate:function (item, insertedInto) {
        this.getChildren()[insertedInto].set(this._createItemProperties(item));
    }, onDelete:function (item, removedFrom) {
        this.getChildren()[removedFrom].destroyRecursive();
    }});
    return 0 ? declare("dojox.mobile._StoreListMixin", [_StoreListMixin, BidiStoreListMixin]) : _StoreListMixin;
});

