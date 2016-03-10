//>>built

define("dojox/wire/ml/Transfer", ["dijit", "dojo", "dojox", "dojo/require!dijit/_Widget,dijit/_Container,dojox/wire/_base,dojox/wire/ml/Action"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.wire.ml.Transfer");
    dojo.require("dijit._Widget");
    dojo.require("dijit._Container");
    dojo.require("dojox.wire._base");
    dojo.require("dojox.wire.ml.Action");
    dojo.declare("dojox.wire.ml.Transfer", dojox.wire.ml.Action, {source:"", sourceStore:"", sourceAttribute:"", sourcePath:"", type:"", converter:"", target:"", targetStore:"", targetAttribute:"", targetPath:"", delimiter:"", _run:function () {
        var sourceWire = this._getWire("source");
        var targetWire = this._getWire("target");
        dojox.wire.transfer(sourceWire, targetWire, arguments);
    }, _getWire:function (which) {
        var args = undefined;
        if (which == "source") {
            args = {object:this.source, dataStore:this.sourceStore, attribute:this.sourceAttribute, path:this.sourcePath, type:this.type, converter:this.converter};
        } else {
            args = {object:this.target, dataStore:this.targetStore, attribute:this.targetAttribute, path:this.targetPath};
        }
        if (args.object) {
            if (args.object.length >= 9 && args.object.substring(0, 9) == "arguments") {
                args.property = args.object.substring(9);
                args.object = null;
            } else {
                var i = args.object.indexOf(".");
                if (i < 0) {
                    args.object = dojox.wire.ml._getValue(args.object);
                } else {
                    args.property = args.object.substring(i + 1);
                    args.object = dojox.wire.ml._getValue(args.object.substring(0, i));
                }
            }
        }
        if (args.dataStore) {
            args.dataStore = dojox.wire.ml._getValue(args.dataStore);
        }
        var childArgs = undefined;
        var children = this.getChildren();
        for (var i in children) {
            var child = children[i];
            if (child instanceof dojox.wire.ml.ChildWire && child.which == which) {
                if (!childArgs) {
                    childArgs = {};
                }
                child._addWire(this, childArgs);
            }
        }
        if (childArgs) {
            childArgs.object = dojox.wire.create(args);
            childArgs.dataStore = args.dataStore;
            args = childArgs;
        }
        return args;
    }});
    dojo.declare("dojox.wire.ml.ChildWire", dijit._Widget, {which:"source", object:"", property:"", type:"", converter:"", attribute:"", path:"", name:"", _addWire:function (parent, args) {
        if (this.name) {
            if (!args.children) {
                args.children = {};
            }
            args.children[this.name] = this._getWire(parent);
        } else {
            if (!args.children) {
                args.children = [];
            }
            args.children.push(this._getWire(parent));
        }
    }, _getWire:function (parent) {
        return {object:(this.object ? dojox.wire.ml._getValue(this.object) : undefined), property:this.property, type:this.type, converter:this.converter, attribute:this.attribute, path:this.path};
    }});
    dojo.declare("dojox.wire.ml.ColumnWire", dojox.wire.ml.ChildWire, {column:"", _addWire:function (parent, args) {
        if (this.column) {
            if (!args.columns) {
                args.columns = {};
            }
            args.columns[this.column] = this._getWire(parent);
        } else {
            if (!args.columns) {
                args.columns = [];
            }
            args.columns.push(this._getWire(parent));
        }
    }});
    dojo.declare("dojox.wire.ml.NodeWire", [dojox.wire.ml.ChildWire, dijit._Container], {titleProperty:"", titleAttribute:"", titlePath:"", _addWire:function (parent, args) {
        if (!args.nodes) {
            args.nodes = [];
        }
        args.nodes.push(this._getWires(parent));
    }, _getWires:function (parent) {
        var args = {node:this._getWire(parent), title:{type:"string", property:this.titleProperty, attribute:this.titleAttribute, path:this.titlePath}};
        var childArgs = [];
        var children = this.getChildren();
        for (var i in children) {
            var child = children[i];
            if (child instanceof dojox.wire.ml.NodeWire) {
                childArgs.push(child._getWires(parent));
            }
        }
        if (childArgs.length > 0) {
            args.children = childArgs;
        }
        return args;
    }});
    dojo.declare("dojox.wire.ml.SegmentWire", dojox.wire.ml.ChildWire, {_addWire:function (parent, args) {
        if (!args.segments) {
            args.segments = [];
        }
        args.segments.push(this._getWire(parent));
        if (parent.delimiter && !args.delimiter) {
            args.delimiter = parent.delimiter;
        }
    }});
});

