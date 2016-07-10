//>>built
define("dojox/calendar/StoreManager","dojo/_base/declare dojo/_base/array dojo/_base/html dojo/_base/lang dojo/dom-class dojo/Stateful dojo/Evented dojo/when".split(" "),function(h,k,p,g,q,l,m,n){return h("dojox.calendar.StoreManager",[l,m],{owner:null,store:null,_ownerItemsProperty:null,_getParentStoreManager:function(){return this.owner&&this.owner.owner?this.owner.owner.get("storeManager"):null},_initItems:function(b){this.set("items",b);return b},_itemsSetter:function(b){this.items=b;this.emit("dataLoaded",
b)},_computeVisibleItems:function(b){var a=b.startTime,c=b.endTime,f=null,e=this.owner[this._ownerItemsProperty];e&&(f=k.filter(e,function(d){return this.owner.isOverlapping(b,d.startTime,d.endTime,a,c)},this));return f},_updateItems:function(b,a,c){var f=!0,e=null,d=this.owner.itemToRenderItem(b,this.store);d._item=b;this.items=this.owner[this._ownerItemsProperty];if(-1!==a)c!==a?(this.items.splice(a,1),this.owner.setItemSelected&&this.owner.isItemSelected(d)&&(this.owner.setItemSelected(d,!1),this.owner.dispatchChange(d,
this.get("selectedItem"),null,null))):(e=this.items[a],c=this.owner.dateModule,f=0!==c.compare(d.startTime,e.startTime)||0!==c.compare(d.endTime,e.endTime),g.mixin(e,d));else if(-1!==c){if(b=b.temporaryId){a=this.items?this.items.length:0;for(a-=1;0<=a;a--)if(this.items[a].id===b){this.items[a]=d;break}a=this._getItemStoreStateObj({id:b});this._cleanItemStoreState(b);this._setItemStoreState(d,a?a.state:null)}if((b=this._getItemStoreStateObj(d))&&"storing"===b.state){if(this.items&&this.items[c]&&
this.items[c].id!==d.id){a=this.items.length;for(a-=1;0<=a;a--)if(this.items[a].id===d.id){this.items.splice(a,1);break}this.items.splice(c,0,d)}g.mixin(b.renderItem,d)}else this.items.splice(c,0,d);this.set("items",this.items)}this._setItemStoreState(d,"stored");this.owner._isEditing||(f?this.emit("layoutInvalidated"):this.emit("renderersInvalidated",e))},_storeSetter:function(b){var a,c=this.owner;this._observeHandler&&(this._observeHandler.remove(),this._observeHandler=null);b?(a=b.query(c.query,
c.queryOptions),a.observe&&(this._observeHandler=a.observe(g.hitch(this,this._updateItems),!0)),a=a.map(g.hitch(this,function(a){var e=c.itemToRenderItem(a,b);null==e.id&&console.err("The data item "+a.summary+" must have an unique identifier from the store.getIdentity(). The calendar will NOT work properly.");e._item=a;return e})),a=n(a,g.hitch(this,this._initItems))):a=this._initItems([]);this.store=b;return a},_getItemStoreStateObj:function(b){var a=this._getParentStoreManager();if(a)return a._getItemStoreStateObj(b);
a=this.get("store");return null!=a&&null!=this._itemStoreState?(b=void 0===b.id?a.getIdentity(b):b.id,this._itemStoreState[b]):null},getItemStoreState:function(b){var a=this._getParentStoreManager();if(a)return a.getItemStoreState(b);if(null==this._itemStoreState)return"stored";a=this.get("store");b=void 0===b.id?a.getIdentity(b):b.id;b=this._itemStoreState[b];return null!=a&&void 0!==b?b.state:"stored"},_cleanItemStoreState:function(b){var a=this._getParentStoreManager();if(a)return a._cleanItemStoreState(b);
if(this._itemStoreState)return this._itemStoreState[b]?(delete this._itemStoreState[b],!0):!1},_setItemStoreState:function(b,a){var c=this._getParentStoreManager();if(c)c._setItemStoreState(b,a);else{void 0===this._itemStoreState&&(this._itemStoreState={});var c=this.get("store"),f=void 0===b.id?c.getIdentity(b):b.id,e=this._itemStoreState[f];"stored"===a||null==a?void 0!==e&&delete this._itemStoreState[f]:c&&(this._itemStoreState[f]={id:f,item:b,renderItem:this.owner.itemToRenderItem(b,c),state:a})}}})});
/// StoreManager.js.map