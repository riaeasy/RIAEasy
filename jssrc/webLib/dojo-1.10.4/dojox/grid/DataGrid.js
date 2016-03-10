//>>built

define("dojox/grid/DataGrid", ["../main", "dojo/_base/array", "dojo/_base/lang", "dojo/_base/json", "dojo/_base/sniff", "dojo/_base/declare", "./_Grid", "./DataSelection", "dojo/_base/html", "dojo/has", "require"], function (dojox, array, lang, json, has, declare, _Grid, DataSelection, html) {
    var DataGrid = declare("dojox.grid.DataGrid", _Grid, {store:null, query:null, queryOptions:null, fetchText:"...", sortFields:null, updateDelay:1, items:null, _store_connects:null, _by_idty:null, _by_idx:null, _cache:null, _pages:null, _pending_requests:null, _bop:-1, _eop:-1, _requests:0, rowCount:0, _isLoaded:false, _isLoading:false, keepSelection:false, postCreate:function () {
        this._pages = [];
        this._store_connects = [];
        this._by_idty = {};
        this._by_idx = [];
        this._cache = [];
        this._pending_requests = {};
        this._setStore(this.store);
        this.inherited(arguments);
    }, destroy:function () {
        this.selection.destroy();
        this.inherited(arguments);
    }, createSelection:function () {
        this.selection = new DataSelection(this);
    }, get:function (inRowIndex, inItem) {
        if (inItem && this.field == "_item" && !this.fields) {
            return inItem;
        } else {
            if (inItem && this.fields) {
                var ret = [];
                var s = this.grid.store;
                array.forEach(this.fields, function (f) {
                    ret = ret.concat(s.getValues(inItem, f));
                });
                return ret;
            } else {
                if (!inItem && typeof inRowIndex === "string") {
                    return this.inherited(arguments);
                }
            }
        }
        return (!inItem ? this.defaultValue : (!this.field ? this.value : (this.field == "_item" ? inItem : this.grid.store.getValue(inItem, this.field))));
    }, _checkUpdateStatus:function () {
        if (this.updateDelay > 0) {
            var iStarted = false;
            if (this._endUpdateDelay) {
                clearTimeout(this._endUpdateDelay);
                delete this._endUpdateDelay;
                iStarted = true;
            }
            if (!this.updating) {
                this.beginUpdate();
                iStarted = true;
            }
            if (iStarted) {
                var _this = this;
                this._endUpdateDelay = setTimeout(function () {
                    delete _this._endUpdateDelay;
                    _this.endUpdate();
                }, this.updateDelay);
            }
        }
    }, _onSet:function (item, attribute, oldValue, newValue) {
        this._checkUpdateStatus();
        var idx = this.getItemIndex(item);
        if (idx > -1) {
            this.updateRow(idx);
        }
    }, _createItem:function (item, index) {
        var idty = this._hasIdentity ? this.store.getIdentity(item) : json.toJson(this.query) + ":idx:" + index + ":sort:" + json.toJson(this.getSortProps());
        var o = this._by_idty[idty] = {idty:idty, item:item};
        return o;
    }, _addItem:function (item, index, noUpdate) {
        this._by_idx[index] = this._createItem(item, index);
        if (!noUpdate) {
            this.updateRow(index);
        }
    }, _onNew:function (item, parentInfo) {
        this._checkUpdateStatus();
        var rowCount = this.get("rowCount");
        this._addingItem = true;
        this.updateRowCount(rowCount + 1);
        this._addingItem = false;
        this._addItem(item, rowCount);
        this.showMessage();
    }, _onDelete:function (item) {
        this._checkUpdateStatus();
        var idx = this._getItemIndex(item, true);
        if (idx >= 0) {
            this._pages = [];
            this._bop = -1;
            this._eop = -1;
            var o = this._by_idx[idx];
            this._by_idx.splice(idx, 1);
            delete this._by_idty[o.idty];
            this.updateRowCount(this.get("rowCount") - 1);
            if (this.get("rowCount") === 0) {
                this.showMessage(this.noDataMessage);
            }
        }
        if (this.selection.isSelected(idx)) {
            this.selection.deselect(idx);
            this.selection.selected.splice(idx, 1);
        }
    }, _onRevert:function () {
        this._refresh();
    }, setStore:function (store, query, queryOptions) {
        if (this._requestsPending(0)) {
            return;
        }
        this._setQuery(query, queryOptions);
        this._setStore(store);
        this._refresh(true);
    }, setQuery:function (query, queryOptions) {
        if (this._requestsPending(0)) {
            return;
        }
        this._setQuery(query, queryOptions);
        this._refresh(true);
    }, setItems:function (items) {
        this.items = items;
        this._setStore(this.store);
        this._refresh(true);
    }, _setQuery:function (query, queryOptions) {
        this.query = query;
        this.queryOptions = queryOptions || this.queryOptions;
    }, _setStore:function (store) {
        if (this.store && this._store_connects) {
            array.forEach(this._store_connects, this.disconnect, this);
        }
        this.store = store;
        if (this.store) {
            var f = this.store.getFeatures();
            var h = [];
            this._canEdit = !!f["dojo.data.api.Write"] && !!f["dojo.data.api.Identity"];
            this._hasIdentity = !!f["dojo.data.api.Identity"];
            if (!!f["dojo.data.api.Notification"] && !this.items) {
                h.push(this.connect(this.store, "onSet", "_onSet"));
                h.push(this.connect(this.store, "onNew", "_onNew"));
                h.push(this.connect(this.store, "onDelete", "_onDelete"));
            }
            if (this._canEdit) {
                h.push(this.connect(this.store, "revert", "_onRevert"));
            }
            this._store_connects = h;
        }
    }, _onFetchBegin:function (size, req) {
        if (!this.scroller) {
            return;
        }
        if (this.rowCount != size) {
            if (req.isRender) {
                this.scroller.init(size, this.keepRows, this.rowsPerPage);
                this.rowCount = size;
                this._setAutoHeightAttr(this.autoHeight, true);
                this._skipRowRenormalize = true;
                this.prerender();
                this._skipRowRenormalize = false;
            } else {
                this.updateRowCount(size);
            }
        }
        if (!size) {
            this.views.render();
            this._resize();
            this.showMessage(this.noDataMessage);
            this.focus.initFocusView();
        } else {
            this.showMessage();
        }
    }, _onFetchComplete:function (items, req) {
        if (!this.scroller) {
            return;
        }
        if (items && items.length > 0) {
            array.forEach(items, function (item, idx) {
                this._addItem(item, req.start + idx, true);
            }, this);
            this.updateRows(req.start, items.length);
            if (req.isRender) {
                this.setScrollTop(0);
                this.postrender();
            } else {
                if (this._lastScrollTop) {
                    this.setScrollTop(this._lastScrollTop);
                }
            }
            if (has("ie")) {
                html.setSelectable(this.domNode, this.selectable);
            }
        }
        delete this._lastScrollTop;
        if (!this._isLoaded) {
            this._isLoading = false;
            this._isLoaded = true;
        }
        this._pending_requests[req.start] = false;
    }, _onFetchError:function (err, req) {
        console.log(err);
        delete this._lastScrollTop;
        if (!this._isLoaded) {
            this._isLoading = false;
            this._isLoaded = true;
            this.showMessage(this.errorMessage);
        }
        this._pending_requests[req.start] = false;
        this.onFetchError(err, req);
    }, onFetchError:function (err, req) {
    }, _fetch:function (start, isRender) {
        start = start || 0;
        if (this.store && !this._pending_requests[start]) {
            if (!this._isLoaded && !this._isLoading) {
                this._isLoading = true;
                this.showMessage(this.loadingMessage);
            }
            this._pending_requests[start] = true;
            try {
                if (this.items) {
                    var items = this.items;
                    var store = this.store;
                    this.rowsPerPage = items.length;
                    var req = {start:start, count:this.rowsPerPage, isRender:isRender};
                    this._onFetchBegin(items.length, req);
                    var waitCount = 0;
                    array.forEach(items, function (i) {
                        if (!store.isItemLoaded(i)) {
                            waitCount++;
                        }
                    });
                    if (waitCount === 0) {
                        this._onFetchComplete(items, req);
                    } else {
                        var onItem = function (item) {
                            waitCount--;
                            if (waitCount === 0) {
                                this._onFetchComplete(items, req);
                            }
                        };
                        array.forEach(items, function (i) {
                            if (!store.isItemLoaded(i)) {
                                store.loadItem({item:i, onItem:onItem, scope:this});
                            }
                        }, this);
                    }
                } else {
                    this.store.fetch({start:start, count:this.rowsPerPage, query:this.query, sort:this.getSortProps(), queryOptions:this.queryOptions, isRender:isRender, onBegin:lang.hitch(this, "_onFetchBegin"), onComplete:lang.hitch(this, "_onFetchComplete"), onError:lang.hitch(this, "_onFetchError")});
                }
            }
            catch (e) {
                this._onFetchError(e, {start:start, count:this.rowsPerPage});
            }
        }
    }, _clearData:function () {
        this.updateRowCount(0);
        this._by_idty = {};
        this._by_idx = [];
        this._pages = [];
        this._bop = this._eop = -1;
        this._isLoaded = false;
        this._isLoading = false;
    }, getItem:function (idx) {
        var data = this._by_idx[idx];
        if (!data || (data && !data.item)) {
            this._preparePage(idx);
            return null;
        }
        return data.item;
    }, getItemIndex:function (item) {
        return this._getItemIndex(item, false);
    }, _getItemIndex:function (item, isDeleted) {
        if (!isDeleted && !this.store.isItem(item)) {
            return -1;
        }
        var idty = this._hasIdentity ? this.store.getIdentity(item) : null;
        for (var i = 0, l = this._by_idx.length; i < l; i++) {
            var d = this._by_idx[i];
            if (d && ((idty && d.idty == idty) || (d.item === item))) {
                return i;
            }
        }
        return -1;
    }, filter:function (query, reRender) {
        this.query = query;
        if (reRender) {
            this._clearData();
        }
        this._fetch();
    }, _getItemAttr:function (idx, attr) {
        var item = this.getItem(idx);
        return (!item ? this.fetchText : this.store.getValue(item, attr));
    }, _render:function () {
        if (this.domNode.parentNode) {
            this.scroller.init(this.get("rowCount"), this.keepRows, this.rowsPerPage);
            this.prerender();
            this._fetch(0, true);
        }
    }, _requestsPending:function (inRowIndex) {
        return this._pending_requests[inRowIndex];
    }, _rowToPage:function (inRowIndex) {
        return (this.rowsPerPage ? Math.floor(inRowIndex / this.rowsPerPage) : inRowIndex);
    }, _pageToRow:function (inPageIndex) {
        return (this.rowsPerPage ? this.rowsPerPage * inPageIndex : inPageIndex);
    }, _preparePage:function (inRowIndex) {
        if ((inRowIndex < this._bop || inRowIndex >= this._eop) && !this._addingItem) {
            var pageIndex = this._rowToPage(inRowIndex);
            this._needPage(pageIndex);
            this._bop = pageIndex * this.rowsPerPage;
            this._eop = this._bop + (this.rowsPerPage || this.get("rowCount"));
        }
    }, _needPage:function (inPageIndex) {
        if (!this._pages[inPageIndex]) {
            this._pages[inPageIndex] = true;
            this._requestPage(inPageIndex);
        }
    }, _requestPage:function (inPageIndex) {
        var row = this._pageToRow(inPageIndex);
        var count = Math.min(this.rowsPerPage, this.get("rowCount") - row);
        if (count > 0) {
            this._requests++;
            if (!this._requestsPending(row)) {
                setTimeout(lang.hitch(this, "_fetch", row, false), 1);
            }
        }
    }, getCellName:function (inCell) {
        return inCell.field;
    }, _refresh:function (isRender) {
        this._clearData();
        this._fetch(0, isRender);
    }, sort:function () {
        this.edit.apply();
        this._lastScrollTop = this.scrollTop;
        this._refresh();
    }, canSort:function () {
        return (!this._isLoading);
    }, getSortProps:function () {
        var c = this.getCell(this.getSortIndex());
        if (!c) {
            if (this.sortFields) {
                return this.sortFields;
            }
            return null;
        } else {
            var desc = c["sortDesc"];
            var si = !(this.sortInfo > 0);
            if (typeof desc == "undefined") {
                desc = si;
            } else {
                desc = si ? !desc : desc;
            }
            return [{attribute:c.field, descending:desc}];
        }
    }, styleRowState:function (inRow) {
        if (this.store && this.store.getState) {
            var states = this.store.getState(inRow.index), c = "";
            for (var i = 0, ss = ["inflight", "error", "inserting"], s; s = ss[i]; i++) {
                if (states[s]) {
                    c = " dojoxGridRow-" + s;
                    break;
                }
            }
            inRow.customClasses += c;
        }
    }, onStyleRow:function (inRow) {
        this.styleRowState(inRow);
        this.inherited(arguments);
    }, canEdit:function (inCell, inRowIndex) {
        return this._canEdit;
    }, _copyAttr:function (idx, attr) {
        var row = {};
        var backstop = {};
        var src = this.getItem(idx);
        return this.store.getValue(src, attr);
    }, doStartEdit:function (inCell, inRowIndex) {
        if (!this._cache[inRowIndex]) {
            this._cache[inRowIndex] = this._copyAttr(inRowIndex, inCell.field);
        }
        this.onStartEdit(inCell, inRowIndex);
    }, doApplyCellEdit:function (inValue, inRowIndex, inAttrName) {
        this.store.fetchItemByIdentity({identity:this._by_idx[inRowIndex].idty, onItem:lang.hitch(this, function (item) {
            var oldValue = this.store.getValue(item, inAttrName);
            if (typeof oldValue == "number") {
                inValue = isNaN(inValue) ? inValue : parseFloat(inValue);
            } else {
                if (typeof oldValue == "boolean") {
                    inValue = inValue == "true" ? true : inValue == "false" ? false : inValue;
                } else {
                    if (oldValue instanceof Date) {
                        var asDate = new Date(inValue);
                        inValue = isNaN(asDate.getTime()) ? inValue : asDate;
                    }
                }
            }
            this.store.setValue(item, inAttrName, inValue);
            this.onApplyCellEdit(inValue, inRowIndex, inAttrName);
        })});
    }, doCancelEdit:function (inRowIndex) {
        var cache = this._cache[inRowIndex];
        if (cache) {
            this.updateRow(inRowIndex);
            delete this._cache[inRowIndex];
        }
        this.onCancelEdit.apply(this, arguments);
    }, doApplyEdit:function (inRowIndex, inDataAttr) {
        var cache = this._cache[inRowIndex];
        this.onApplyEdit(inRowIndex);
    }, removeSelectedRows:function () {
        if (this._canEdit) {
            this.edit.apply();
            var fx = lang.hitch(this, function (items) {
                if (items.length) {
                    array.forEach(items, this.store.deleteItem, this.store);
                    this.selection.clear();
                }
            });
            if (this.allItemsSelected) {
                this.store.fetch({query:this.query, queryOptions:this.queryOptions, onComplete:fx});
            } else {
                fx(this.selection.getSelected());
            }
        }
    }});
    DataGrid.cell_markupFactory = function (cellFunc, node, cellDef) {
        var field = lang.trim(html.attr(node, "field") || "");
        if (field) {
            cellDef.field = field;
        }
        cellDef.field = cellDef.field || cellDef.name;
        var fields = lang.trim(html.attr(node, "fields") || "");
        if (fields) {
            cellDef.fields = fields.split(",");
        }
        if (cellFunc) {
            cellFunc(node, cellDef);
        }
    };
    DataGrid.markupFactory = function (props, node, ctor, cellFunc) {
        return _Grid.markupFactory(props, node, ctor, lang.partial(DataGrid.cell_markupFactory, cellFunc));
    };
    return DataGrid;
});

