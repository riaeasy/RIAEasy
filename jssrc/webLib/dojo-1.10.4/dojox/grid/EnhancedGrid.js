//>>built

define("dojox/grid/EnhancedGrid", ["dojo/_base/kernel", "../main", "dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/sniff", "dojo/dom", "dojo/dom-geometry", "./DataGrid", "./DataSelection", "./enhanced/_PluginManager", "./enhanced/plugins/_SelectionPreserver", "dojo/i18n!./enhanced/nls/EnhancedGrid"], function (dojo, dojox, declare, lang, array, has, dom, domGeometry, DataGrid, DataSelection, _PluginManager, _SelectionPreserver, nls) {
    dojo.experimental("dojox.grid.EnhancedGrid");
    var EnhancedGrid = declare("dojox.grid.EnhancedGrid", DataGrid, {plugins:null, pluginMgr:null, _pluginMgrClass:_PluginManager, postMixInProperties:function () {
        this._nls = nls;
        this.inherited(arguments);
    }, postCreate:function () {
        this.pluginMgr = new this._pluginMgrClass(this);
        this.pluginMgr.preInit();
        this.inherited(arguments);
        this.pluginMgr.postInit();
    }, plugin:function (name) {
        return this.pluginMgr.getPlugin(name);
    }, startup:function () {
        this.inherited(arguments);
        this.pluginMgr.startup();
    }, createSelection:function () {
        this.selection = new dojox.grid.enhanced.DataSelection(this);
    }, canSort:function (colIndex, field) {
        return true;
    }, doKeyEvent:function (e) {
        try {
            var view = this.focus.focusView;
            view.content.decorateEvent(e);
            if (!e.cell) {
                view.header.decorateEvent(e);
            }
        }
        catch (e) {
        }
        this.inherited(arguments);
    }, doApplyCellEdit:function (inValue, inRowIndex, inAttrName) {
        if (!inAttrName) {
            this.invalidated[inRowIndex] = true;
            return;
        }
        this.inherited(arguments);
    }, mixin:function (target, source) {
        var props = {};
        for (var p in source) {
            if (p == "_inherited" || p == "declaredClass" || p == "constructor" || source["privates"] && source["privates"][p]) {
                continue;
            }
            props[p] = source[p];
        }
        lang.mixin(target, props);
    }, _copyAttr:function (idx, attr) {
        if (!attr) {
            return;
        }
        return this.inherited(arguments);
    }, _getHeaderHeight:function () {
        this.inherited(arguments);
        return domGeometry.getMarginBox(this.viewsHeaderNode).h;
    }, _fetch:function (start, isRender) {
        if (this.items) {
            return this.inherited(arguments);
        }
        start = start || 0;
        if (this.store && !this._pending_requests[start]) {
            if (!this._isLoaded && !this._isLoading) {
                this._isLoading = true;
                this.showMessage(this.loadingMessage);
            }
            this._pending_requests[start] = true;
            try {
                var req = {start:start, count:this.rowsPerPage, query:this.query, sort:this.getSortProps(), queryOptions:this.queryOptions, isRender:isRender, onBegin:lang.hitch(this, "_onFetchBegin"), onComplete:lang.hitch(this, "_onFetchComplete"), onError:lang.hitch(this, "_onFetchError")};
                this._storeLayerFetch(req);
            }
            catch (e) {
                this._onFetchError(e, {start:start, count:this.rowsPerPage});
            }
        }
        return 0;
    }, _storeLayerFetch:function (req) {
        this.store.fetch(req);
    }, getCellByField:function (field) {
        return array.filter(this.layout.cells, function (cell) {
            return cell.field == field;
        })[0];
    }, onMouseUp:function (e) {
    }, createView:function () {
        var view = this.inherited(arguments);
        if (has("mozilla")) {
            var ascendDom = function (inNode, inWhile) {
                for (var n = inNode; n && inWhile(n); n = n.parentNode) {
                }
                return n;
            };
            var makeNotTagName = function (inTagName) {
                var name = inTagName.toUpperCase();
                return function (node) {
                    return node.tagName != name;
                };
            };
            var func = view.header.getCellX;
            view.header.getCellX = function (e) {
                var x = func.call(view.header, e);
                var n = ascendDom(e.target, makeNotTagName("th"));
                if (n && n !== e.target && dom.isDescendant(e.target, n)) {
                    x += n.firstChild.offsetLeft;
                }
                return x;
            };
        }
        return view;
    }, destroy:function () {
        delete this._nls;
        this.pluginMgr.destroy();
        this.inherited(arguments);
    }});
    declare("dojox.grid.enhanced.DataSelection", DataSelection, {constructor:function (grid) {
        if (grid.keepSelection) {
            if (this.preserver) {
                this.preserver.destroy();
            }
            this.preserver = new _SelectionPreserver(this);
        }
    }, _range:function (inFrom, inTo) {
        this.grid._selectingRange = true;
        this.inherited(arguments);
        this.grid._selectingRange = false;
        this.onChanged();
    }, deselectAll:function (inItemOrIndex) {
        this.grid._selectingRange = true;
        this.inherited(arguments);
        this.grid._selectingRange = false;
        this.onChanged();
    }});
    EnhancedGrid.markupFactory = function (props, node, ctor, cellFunc) {
        return dojox.grid._Grid.markupFactory(props, node, ctor, lang.partial(DataGrid.cell_markupFactory, cellFunc));
    };
    EnhancedGrid.registerPlugin = function (clazz, props) {
        _PluginManager.registerPlugin(clazz, props);
    };
    return EnhancedGrid;
});

