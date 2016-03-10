//>>built

define("dojox/grid/enhanced/plugins/exporter/CSVWriter", ["dojo/_base/declare", "dojo/_base/array", "./_ExportWriter", "../Exporter"], function (declare, array, _ExportWriter, Exporter) {
    Exporter.registerWriter("csv", "dojox.grid.enhanced.plugins.exporter.CSVWriter");
    return declare("dojox.grid.enhanced.plugins.exporter.CSVWriter", _ExportWriter, {_separator:",", _newline:"\r\n", constructor:function (writerArgs) {
        if (writerArgs) {
            this._separator = writerArgs.separator ? writerArgs.separator : this._separator;
            this._newline = writerArgs.newline ? writerArgs.newline : this._newline;
        }
        this._headers = [];
        this._dataRows = [];
    }, _formatCSVCell:function (cellValue) {
        if (cellValue === null || cellValue === undefined) {
            return "";
        }
        var result = String(cellValue).replace(/"/g, "\"\"");
        if (result.indexOf(this._separator) >= 0 || result.search(/[" \t\r\n]/) >= 0) {
            result = "\"" + result + "\"";
        }
        return result;
    }, beforeContentRow:function (arg_obj) {
        var row = [], func = this._formatCSVCell;
        array.forEach(arg_obj.grid.layout.cells, function (cell) {
            if (!cell.hidden && array.indexOf(arg_obj.spCols, cell.index) < 0) {
                row.push(func(this._getExportDataForCell(arg_obj.rowIndex, arg_obj.row, cell, arg_obj.grid)));
            }
        }, this);
        this._dataRows.push(row);
        return false;
    }, handleCell:function (arg_obj) {
        var cell = arg_obj.cell;
        if (arg_obj.isHeader && !cell.hidden && array.indexOf(arg_obj.spCols, cell.index) < 0) {
            this._headers.push(cell.name || cell.field);
        }
    }, toString:function () {
        var result = this._headers.join(this._separator);
        for (var i = this._dataRows.length - 1; i >= 0; --i) {
            this._dataRows[i] = this._dataRows[i].join(this._separator);
        }
        return result + this._newline + this._dataRows.join(this._newline);
    }});
});

