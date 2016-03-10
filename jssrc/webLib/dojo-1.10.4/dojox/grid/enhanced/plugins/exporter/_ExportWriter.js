//>>built

define("dojox/grid/enhanced/plugins/exporter/_ExportWriter", ["dojo/_base/declare"], function (declare) {
    return declare("dojox.grid.enhanced.plugins.exporter._ExportWriter", null, {constructor:function (writerArgs) {
    }, _getExportDataForCell:function (rowIndex, rowItem, cell, grid) {
        var data = (cell.get || grid.get).call(cell, rowIndex, rowItem);
        if (this.formatter) {
            return this.formatter(data, cell, rowIndex, rowItem);
        } else {
            return data;
        }
    }, beforeHeader:function (grid) {
        return true;
    }, afterHeader:function () {
    }, beforeContent:function (items) {
        return true;
    }, afterContent:function () {
    }, beforeContentRow:function (argObj) {
        return true;
    }, afterContentRow:function (argObj) {
    }, beforeView:function (argObj) {
        return true;
    }, afterView:function (argObj) {
    }, beforeSubrow:function (argObj) {
        return true;
    }, afterSubrow:function (argObj) {
    }, handleCell:function (argObj) {
    }, toString:function () {
        return "";
    }});
});

