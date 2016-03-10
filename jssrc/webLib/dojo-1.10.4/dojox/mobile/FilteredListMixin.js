//>>built

define("dojox/mobile/FilteredListMixin", ["require", "dojo/_base/array", "dojo/_base/declare", "dojo/_base/lang", "dojo/dom", "dojo/dom-class", "dojo/dom-construct", "dojo/aspect", "dijit/registry", "./SearchBox", "./ScrollableView", "./viewRegistry"], function (require, array, declare, lang, dom, domClass, domConstruct, aspect, registry, SearchBox, ScrollableView, viewRegistry) {
    return declare("dojox.mobile.FilteredListMixin", null, {filterBoxRef:null, placeHolder:"", filterBoxVisible:true, _filterBox:null, _createdFilterBox:null, _createdScrollableView:null, startup:function () {
        if (this._started) {
            return;
        }
        this.inherited(arguments);
        if (this.filterBoxRef) {
            this._filterBox = registry.byId(this.filterBoxRef);
            if (this._filterBox && this._filterBox.isInstanceOf(SearchBox)) {
                this._filterBox.set("searchAttr", this.labelProperty ? this.labelProperty : "label");
                if (!this._filterBox.placeHolder) {
                    this._filterBox.set("placeHolder", this.placeHolder);
                }
                this._filterBox.on("search", lang.hitch(this, "_onFilter"));
            } else {
                throw new Error("Cannot find a widget of type dojox/mobile/SearchBox or subclass " + "at the specified filterBoxRef: " + this.filterBoxRef);
            }
        } else {
            this._filterBox = new SearchBox({searchAttr:this.labelProperty ? this.labelProperty : "label", ignoreCase:true, incremental:true, onSearch:lang.hitch(this, "_onFilter"), selectOnClick:true, placeHolder:this.placeHolder});
            this._createdFilterBox = this._filterBox;
            this._createdScrollableView = new ScrollableView();
            var currentDomNode = this.domNode, listParentNode = this.domNode.parentNode;
            listParentNode.replaceChild(this._createdScrollableView.domNode, this.domNode);
            domConstruct.place(currentDomNode, this._createdScrollableView.containerNode);
            var searchBoxParentDiv = domConstruct.create("div");
            domConstruct.place(this._createdFilterBox.domNode, searchBoxParentDiv);
            domConstruct.place(searchBoxParentDiv, this._createdScrollableView.domNode, "before");
            if (this.filterBoxClass) {
                domClass.add(searchBoxParentDiv, this.filterBoxClass);
            }
            this._createdFilterBox.startup();
            this._createdScrollableView.startup();
            this._createdScrollableView.resize();
        }
        var sv = viewRegistry.getEnclosingScrollable(this.domNode);
        if (sv) {
            this.connect(sv, "onFlickAnimationEnd", lang.hitch(this, function () {
                if (!this._filterBox.focusNode.value) {
                    this._previousUnfilteredScrollPos = sv.getPos();
                }
            }));
        }
        if (!this.store) {
            this._createStore(this._initStore);
        } else {
            this._initStore();
        }
    }, _setFilterBoxVisibleAttr:function (visible) {
        this._set("filterBoxVisible", visible);
        if (this._filterBox && this._filterBox.domNode) {
            this._filterBox.domNode.style.display = visible ? "" : "none";
        }
    }, _setPlaceHolderAttr:function (placeHolder) {
        this._set("placeHolder", placeHolder);
        if (this._filterBox) {
            this._filterBox.set("placeHolder", placeHolder);
        }
    }, getFilterBox:function () {
        return this._filterBox;
    }, getScrollableView:function () {
        return this._createdScrollableView;
    }, _initStore:function () {
        var store = this.store;
        if (!store.get || !store.query) {
            require(["dojo/store/DataStore"], lang.hitch(this, function (DataStore) {
                store = new DataStore({store:store});
                this._filterBox.store = store;
            }));
        } else {
            this._filterBox.store = store;
        }
    }, _createStore:function (initStoreFunction) {
        require(["./_StoreListMixin", "dojo/store/Memory"], lang.hitch(this, function (module, Memory) {
            declare.safeMixin(this, new module());
            this.append = true;
            this.createListItem = function (item) {
                return item.listItem;
            };
            aspect.before(this, "generateList", function () {
                array.forEach(this.getChildren(), function (child) {
                    child.domNode.parentNode.removeChild(child.domNode);
                });
            });
            var items = [];
            var text = null;
            array.forEach(this.getChildren(), function (child) {
                text = child.label ? child.label : (child.domNode.innerText || child.domNode.textContent);
                items.push({label:text, listItem:child});
            });
            var listData = {items:items};
            var store = new Memory({idProperty:"label", data:listData});
            this.store = null;
            this.query = {};
            this.setStore(store, this.query, this.queryOptions);
            lang.hitch(this, initStoreFunction)();
        }));
    }, _onFilter:function (results, query, options) {
        if (this.onFilter(results, query, options) === false) {
            return;
        }
        this.setQuery(query);
        var sv = viewRegistry.getEnclosingScrollable(this.domNode);
        if (sv) {
            sv.scrollTo(this._filterBox.focusNode.value ? {x:0, y:0} : this._previousUnfilteredScrollPos || {x:0, y:0});
        }
    }, onFilter:function () {
    }, destroy:function (preserveDom) {
        this.inherited(arguments);
        if (this._createdFilterBox) {
            this._createdFilterBox.destroy(preserveDom);
            this._createdFilterBox = null;
        }
        if (this._createdScrollableView) {
            this._createdScrollableView.destroy(preserveDom);
            this._createdScrollableView = null;
        }
    }});
});

