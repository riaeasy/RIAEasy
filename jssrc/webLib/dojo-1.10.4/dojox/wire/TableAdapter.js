//>>built

define("dojox/wire/TableAdapter", ["dijit", "dojo", "dojox", "dojo/require!dojox/wire/CompositeWire"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.wire.TableAdapter");
    dojo.require("dojox.wire.CompositeWire");
    dojo.declare("dojox.wire.TableAdapter", dojox.wire.CompositeWire, {_wireClass:"dojox.wire.TableAdapter", constructor:function (args) {
        this._initializeChildren(this.columns);
    }, _getValue:function (object) {
        if (!object || !this.columns) {
            return object;
        }
        var array = object;
        if (!dojo.isArray(array)) {
            array = [array];
        }
        var rows = [];
        for (var i in array) {
            var row = this._getRow(array[i]);
            rows.push(row);
        }
        return rows;
    }, _setValue:function (object, value) {
        throw new Error("Unsupported API: " + this._wireClass + "._setValue");
    }, _getRow:function (object) {
        var row = (dojo.isArray(this.columns) ? [] : {});
        for (var c in this.columns) {
            row[c] = this.columns[c].getValue(object);
        }
        return row;
    }});
});

