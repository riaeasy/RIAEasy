//>>built

define("dojox/calendar/StoreManager", ["dojo/_base/declare", "dojo/_base/array", "dojo/_base/html", "dojo/_base/lang", "dojo/dom-class", "dojo/Stateful", "dojo/Evented", "dojo/when"], function (declare, arr, html, lang, domClass, Stateful, Evented, when) {
    return declare("dojox.calendar.StoreManager", [Stateful, Evented], {owner:null, store:null, _ownerItemsProperty:null, _getParentStoreManager:function () {
        if (this.owner && this.owner.owner) {
            return this.owner.owner.get("storeManager");
        }
        return null;
    }, _initItems:function (items) {
        this.set("items", items);
        return items;
    }, _itemsSetter:function (value) {
        this.items = value;
        this.emit("dataLoaded", value);
    }, _computeVisibleItems:function (renderData) {
        var startTime = renderData.startTime;
        var endTime = renderData.endTime;
        var res = null;
        var items = this.owner[this._ownerItemsProperty];
        if (items) {
            res = arr.filter(items, function (item) {
                return this.owner.isOverlapping(renderData, item.startTime, item.endTime, startTime, endTime);
            }, this);
        }
        return res;
    }, _updateItems:function (object, previousIndex, newIndex) {
        var layoutCanChange = true;
        var oldItem = null;
        var newItem = this.owner.itemToRenderItem(object, this.store);
        newItem._item = object;
        this.items = this.owner[this._ownerItemsProperty];
        if (previousIndex !== -1) {
            if (newIndex !== previousIndex) {
                this.items.splice(previousIndex, 1);
                if (this.owner.setItemSelected && this.owner.isItemSelected(newItem)) {
                    this.owner.setItemSelected(newItem, false);
                    this.owner.dispatchChange(newItem, this.get("selectedItem"), null, null);
                }
            } else {
                oldItem = this.items[previousIndex];
                var cal = this.owner.dateModule;
                layoutCanChange = cal.compare(newItem.startTime, oldItem.startTime) !== 0 || cal.compare(newItem.endTime, oldItem.endTime) !== 0;
                lang.mixin(oldItem, newItem);
            }
        } else {
            if (newIndex !== -1) {
                var l, i;
                var tempId = object.temporaryId;
                if (tempId) {
                    l = this.items ? this.items.length : 0;
                    for (i = l - 1; i >= 0; i--) {
                        if (this.items[i].id === tempId) {
                            this.items[i] = newItem;
                            break;
                        }
                    }
                    var stateObj = this._getItemStoreStateObj({id:tempId});
                    this._cleanItemStoreState(tempId);
                    this._setItemStoreState(newItem, stateObj ? stateObj.state : null);
                }
                var s = this._getItemStoreStateObj(newItem);
                if (s && s.state === "storing") {
                    if (this.items && this.items[newIndex] && this.items[newIndex].id !== newItem.id) {
                        l = this.items.length;
                        for (i = l - 1; i >= 0; i--) {
                            if (this.items[i].id === newItem.id) {
                                this.items.splice(i, 1);
                                break;
                            }
                        }
                        this.items.splice(newIndex, 0, newItem);
                    }
                    lang.mixin(s.renderItem, newItem);
                } else {
                    this.items.splice(newIndex, 0, newItem);
                }
                this.set("items", this.items);
            }
        }
        this._setItemStoreState(newItem, "stored");
        if (!this.owner._isEditing) {
            if (layoutCanChange) {
                this.emit("layoutInvalidated");
            } else {
                this.emit("renderersInvalidated", oldItem);
            }
        }
    }, _storeSetter:function (value) {
        var r;
        var owner = this.owner;
        if (this._observeHandler) {
            this._observeHandler.remove();
            this._observeHandler = null;
        }
        if (value) {
            var results = value.query(owner.query, owner.queryOptions);
            if (results.observe) {
                this._observeHandler = results.observe(lang.hitch(this, this._updateItems), true);
            }
            results = results.map(lang.hitch(this, function (item) {
                var renderItem = owner.itemToRenderItem(item, value);
                renderItem._item = item;
                return renderItem;
            }));
            r = when(results, lang.hitch(this, this._initItems));
        } else {
            r = this._initItems([]);
        }
        this.store = value;
        return r;
    }, _getItemStoreStateObj:function (item) {
        var parentManager = this._getParentStoreManager();
        if (parentManager) {
            return parentManager._getItemStoreStateObj(item);
        }
        var store = this.get("store");
        if (store != null && this._itemStoreState != null) {
            var id = item.id === undefined ? store.getIdentity(item) : item.id;
            return this._itemStoreState[id];
        }
        return null;
    }, getItemStoreState:function (item) {
        var parentManager = this._getParentStoreManager();
        if (parentManager) {
            return parentManager.getItemStoreState(item);
        }
        if (this._itemStoreState == null) {
            return "stored";
        }
        var store = this.get("store");
        var id = item.id === undefined ? store.getIdentity(item) : item.id;
        var s = this._itemStoreState[id];
        if (store != null && s !== undefined) {
            return s.state;
        }
        return "stored";
    }, _cleanItemStoreState:function (id) {
        var parentManager = this._getParentStoreManager();
        if (parentManager) {
            return parentManager._cleanItemStoreState(id);
        }
        if (!this._itemStoreState) {
            return;
        }
        var s = this._itemStoreState[id];
        if (s) {
            delete this._itemStoreState[id];
            return true;
        }
        return false;
    }, _setItemStoreState:function (item, state) {
        var parentManager = this._getParentStoreManager();
        if (parentManager) {
            parentManager._setItemStoreState(item, state);
            return;
        }
        if (this._itemStoreState === undefined) {
            this._itemStoreState = {};
        }
        var store = this.get("store");
        var id = item.id === undefined ? store.getIdentity(item) : item.id;
        var s = this._itemStoreState[id];
        if (state === "stored" || state == null) {
            if (s !== undefined) {
                delete this._itemStoreState[id];
            }
            return;
        }
        if (store) {
            this._itemStoreState[id] = {id:id, item:item, renderItem:this.owner.itemToRenderItem(item, store), state:state};
        }
    }});
});

