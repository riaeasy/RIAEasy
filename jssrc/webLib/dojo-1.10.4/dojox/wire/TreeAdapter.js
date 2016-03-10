//>>built

define("dojox/wire/TreeAdapter", ["dijit", "dojo", "dojox", "dojo/require!dojox/wire/CompositeWire"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.wire.TreeAdapter");
    dojo.require("dojox.wire.CompositeWire");
    dojo.declare("dojox.wire.TreeAdapter", dojox.wire.CompositeWire, {_wireClass:"dojox.wire.TreeAdapter", constructor:function (args) {
        this._initializeChildren(this.nodes);
    }, _getValue:function (object) {
        if (!object || !this.nodes) {
            return object;
        }
        var array = object;
        if (!dojo.isArray(array)) {
            array = [array];
        }
        var nodes = [];
        for (var i in array) {
            for (var i2 in this.nodes) {
                nodes = nodes.concat(this._getNodes(array[i], this.nodes[i2]));
            }
        }
        return nodes;
    }, _setValue:function (object, value) {
        throw new Error("Unsupported API: " + this._wireClass + "._setValue");
    }, _initializeChildren:function (children) {
        if (!children) {
            return;
        }
        for (var i in children) {
            var child = children[i];
            if (child.node) {
                child.node.parent = this;
                if (!dojox.wire.isWire(child.node)) {
                    child.node = dojox.wire.create(child.node);
                }
            }
            if (child.title) {
                child.title.parent = this;
                if (!dojox.wire.isWire(child.title)) {
                    child.title = dojox.wire.create(child.title);
                }
            }
            if (child.children) {
                this._initializeChildren(child.children);
            }
        }
    }, _getNodes:function (object, child) {
        var array = null;
        if (child.node) {
            array = child.node.getValue(object);
            if (!array) {
                return [];
            }
            if (!dojo.isArray(array)) {
                array = [array];
            }
        } else {
            array = [object];
        }
        var nodes = [];
        for (var i in array) {
            object = array[i];
            var node = {};
            if (child.title) {
                node.title = child.title.getValue(object);
            } else {
                node.title = object;
            }
            if (child.children) {
                var children = [];
                for (var i2 in child.children) {
                    children = children.concat(this._getNodes(object, child.children[i2]));
                }
                if (children.length > 0) {
                    node.children = children;
                }
            }
            nodes.push(node);
        }
        return nodes;
    }});
});

