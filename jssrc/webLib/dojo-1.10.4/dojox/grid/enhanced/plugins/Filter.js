//>>built

define("dojox/grid/enhanced/plugins/Filter", ["dojo/_base/declare", "dojo/_base/lang", "../_Plugin", "./Dialog", "./filter/FilterLayer", "./filter/FilterBar", "./filter/FilterDefDialog", "./filter/FilterStatusTip", "./filter/ClearFilterConfirm", "../../EnhancedGrid", "dojo/i18n!../nls/Filter"], function (declare, lang, _Plugin, Dialog, layers, FilterBar, FilterDefDialog, FilterStatusTip, ClearFilterConfirm, EnhancedGrid, nls) {
    var Filter = declare("dojox.grid.enhanced.plugins.Filter", _Plugin, {name:"filter", constructor:function (grid, args) {
        this.grid = grid;
        this.nls = nls;
        args = this.args = lang.isObject(args) ? args : {};
        if (typeof args.ruleCount != "number" || args.ruleCount < 0) {
            args.ruleCount = 3;
        }
        var rc = this.ruleCountToConfirmClearFilter = args.ruleCountToConfirmClearFilter;
        if (rc === undefined) {
            this.ruleCountToConfirmClearFilter = 2;
        }
        this._wrapStore();
        var obj = {"plugin":this};
        this.clearFilterDialog = new Dialog({refNode:this.grid.domNode, title:this.nls["clearFilterDialogTitle"], content:new ClearFilterConfirm(obj)});
        this.filterDefDialog = new FilterDefDialog(obj);
        this.filterBar = new FilterBar(obj);
        this.filterStatusTip = new FilterStatusTip(obj);
        grid.onFilterDefined = function () {
        };
        this.connect(grid.layer("filter"), "onFilterDefined", function (filter) {
            grid.onFilterDefined(grid.getFilter(), grid.getFilterRelation());
        });
    }, destroy:function () {
        this.inherited(arguments);
        try {
            this.grid.unwrap("filter");
            this.filterBar.destroyRecursive();
            this.filterBar = null;
            this.clearFilterDialog.destroyRecursive();
            this.clearFilterDialog = null;
            this.filterStatusTip.destroy();
            this.filterStatusTip = null;
            this.filterDefDialog.destroy();
            this.filterDefDialog = null;
            this.grid = null;
            this.args = null;
        }
        catch (e) {
            console.warn("Filter.destroy() error:", e);
        }
    }, _wrapStore:function () {
        var g = this.grid;
        var args = this.args;
        var filterLayer = args.isServerSide ? new layers.ServerSideFilterLayer(args) : new layers.ClientSideFilterLayer({cacheSize:args.filterCacheSize, fetchAll:args.fetchAllOnFirstFilter, getter:this._clientFilterGetter});
        layers.wrap(g, "_storeLayerFetch", filterLayer);
        this.connect(g, "_onDelete", lang.hitch(filterLayer, "invalidate"));
    }, onSetStore:function (store) {
        this.filterDefDialog.clearFilter(true);
    }, _clientFilterGetter:function (datarow, cell, rowIndex) {
        return cell.get(rowIndex, datarow);
    }});
    EnhancedGrid.registerPlugin(Filter);
    return Filter;
});

