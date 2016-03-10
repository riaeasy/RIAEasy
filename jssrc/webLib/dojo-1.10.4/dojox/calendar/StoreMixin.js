//>>built

define("dojox/calendar/StoreMixin", ["dojo/_base/declare", "dojo/_base/array", "dojo/_base/html", "dojo/_base/lang", "dojo/dom-class", "dojo/Stateful", "dojo/when"], function (declare, arr, html, lang, domClass, Stateful, when) {
    return declare("dojox.calendar.StoreMixin", Stateful, {store:null, query:{}, queryOptions:null, startTimeAttr:"startTime", endTimeAttr:"endTime", summaryAttr:"summary", allDayAttr:"allDay", subColumnAttr:"calendar", cssClassFunc:null, decodeDate:null, encodeDate:null, displayedItemsInvalidated:false, itemToRenderItem:function (item, store) {
        if (this.owner) {
            return this.owner.itemToRenderItem(item, store);
        }
        return {id:store.getIdentity(item), summary:item[this.summaryAttr], startTime:(this.decodeDate && this.decodeDate(item[this.startTimeAttr])) || this.newDate(item[this.startTimeAttr], this.dateClassObj), endTime:(this.decodeDate && this.decodeDate(item[this.endTimeAttr])) || this.newDate(item[this.endTimeAttr], this.dateClassObj), allDay:item[this.allDayAttr] != null ? item[this.allDayAttr] : false, subColumn:item[this.subColumnAttr], cssClass:this.cssClassFunc ? this.cssClassFunc(item) : null};
    }, renderItemToItem:function (renderItem, store) {
        if (this.owner) {
            return this.owner.renderItemToItem(renderItem, store);
        }
        var item = {};
        item[store.idProperty] = renderItem.id;
        item[this.summaryAttr] = renderItem.summary;
        item[this.startTimeAttr] = (this.encodeDate && this.encodeDate(renderItem.startTime)) || renderItem.startTime;
        item[this.endTimeAttr] = (this.encodeDate && this.encodeDate(renderItem.endTime)) || renderItem.endTime;
        if (renderItem.subColumn) {
            item[this.subColumnAttr] = renderItem.subColumn;
        }
        return this.getItemStoreState(renderItem) === "unstored" ? item : lang.mixin(renderItem._item, item);
    }, _computeVisibleItems:function (renderData) {
        if (this.owner) {
            return this.owner._computeVisibleItems(renderData);
        }
        renderData.items = this.storeManager._computeVisibleItems(renderData);
    }, _initItems:function (items) {
        this.set("items", items);
        return items;
    }, _refreshItemsRendering:function (renderData) {
    }, _setStoreAttr:function (value) {
        this.store = value;
        return this.storeManager.set("store", value);
    }, _getItemStoreStateObj:function (item) {
        return this.storeManager._getItemStoreStateObj(item);
    }, getItemStoreState:function (item) {
        return this.storeManager.getItemStoreState(item);
    }, _cleanItemStoreState:function (id) {
        this.storeManager._cleanItemStoreState(id);
    }, _setItemStoreState:function (item, state) {
        this.storeManager._setItemStoreState(item, state);
    }});
});

