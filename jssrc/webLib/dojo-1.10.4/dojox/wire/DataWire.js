//>>built

define("dojox/wire/DataWire", ["dijit", "dojo", "dojox", "dojo/require!dojox/wire/Wire"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.wire.DataWire");
    dojo.require("dojox.wire.Wire");
    dojo.declare("dojox.wire.DataWire", dojox.wire.Wire, {_wireClass:"dojox.wire.DataWire", constructor:function (args) {
        if (!this.dataStore && this.parent) {
            this.dataStore = this.parent.dataStore;
        }
    }, _getValue:function (object) {
        if (!object || !this.attribute || !this.dataStore) {
            return object;
        }
        var value = object;
        var list = this.attribute.split(".");
        for (var i in list) {
            value = this._getAttributeValue(value, list[i]);
            if (!value) {
                return undefined;
            }
        }
        return value;
    }, _setValue:function (object, value) {
        if (!object || !this.attribute || !this.dataStore) {
            return object;
        }
        var item = object;
        var list = this.attribute.split(".");
        var last = list.length - 1;
        for (var i = 0; i < last; i++) {
            item = this._getAttributeValue(item, list[i]);
            if (!item) {
                return undefined;
            }
        }
        this._setAttributeValue(item, list[last], value);
        return object;
    }, _getAttributeValue:function (item, attribute) {
        var value = undefined;
        var i1 = attribute.indexOf("[");
        if (i1 >= 0) {
            var i2 = attribute.indexOf("]");
            var index = attribute.substring(i1 + 1, i2);
            attribute = attribute.substring(0, i1);
            var array = this.dataStore.getValues(item, attribute);
            if (array) {
                if (!index) {
                    value = array;
                } else {
                    value = array[index];
                }
            }
        } else {
            value = this.dataStore.getValue(item, attribute);
        }
        return value;
    }, _setAttributeValue:function (item, attribute, value) {
        var i1 = attribute.indexOf("[");
        if (i1 >= 0) {
            var i2 = attribute.indexOf("]");
            var index = attribute.substring(i1 + 1, i2);
            attribute = attribute.substring(0, i1);
            var array = null;
            if (!index) {
                array = value;
            } else {
                array = this.dataStore.getValues(item, attribute);
                if (!array) {
                    array = [];
                }
                array[index] = value;
            }
            this.dataStore.setValues(item, attribute, array);
        } else {
            this.dataStore.setValue(item, attribute, value);
        }
    }});
});

