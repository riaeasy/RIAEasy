//>>built

define("dojox/wire/CompositeWire", ["dijit", "dojo", "dojox", "dojo/require!dojox/wire/_base,dojox/wire/Wire"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.wire.CompositeWire");
    dojo.require("dojox.wire._base");
    dojo.require("dojox.wire.Wire");
    dojo.declare("dojox.wire.CompositeWire", dojox.wire.Wire, {_wireClass:"dojox.wire.CompositeWire", constructor:function (args) {
        this._initializeChildren(this.children);
    }, _getValue:function (object) {
        if (!object || !this.children) {
            return object;
        }
        var value = (dojo.isArray(this.children) ? [] : {});
        for (var c in this.children) {
            value[c] = this.children[c].getValue(object);
        }
        return value;
    }, _setValue:function (object, value) {
        if (!object || !this.children) {
            return object;
        }
        for (var c in this.children) {
            this.children[c].setValue(value[c], object);
        }
        return object;
    }, _initializeChildren:function (children) {
        if (!children) {
            return;
        }
        for (var c in children) {
            var child = children[c];
            child.parent = this;
            if (!dojox.wire.isWire(child)) {
                children[c] = dojox.wire.create(child);
            }
        }
    }});
});

