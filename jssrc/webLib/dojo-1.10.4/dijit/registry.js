//>>built

define("dijit/registry", ["dojo/_base/array", "dojo/_base/window", "./main"], function (array, win, dijit) {
    var _widgetTypeCtr = {}, hash = {};
    var registry = {length:0, add:function (widget) {
        if (hash[widget.id]) {
            throw new Error("Tried to register widget with id==" + widget.id + " but that id is already registered");
        }
        hash[widget.id] = widget;
        this.length++;
    }, remove:function (id) {
        if (hash[id]) {
            delete hash[id];
            this.length--;
        }
    }, byId:function (id) {
        return typeof id == "string" ? hash[id] : id;
    }, byNode:function (node) {
        return hash[node.getAttribute("widgetId")];
    }, toArray:function () {
        var ar = [];
        for (var id in hash) {
            ar.push(hash[id]);
        }
        return ar;
    }, getUniqueId:function (widgetType) {
        var id;
        do {
            id = widgetType + "_" + (widgetType in _widgetTypeCtr ? ++_widgetTypeCtr[widgetType] : _widgetTypeCtr[widgetType] = 0);
        } while (hash[id]);
        return dijit._scopeName == "dijit" ? id : dijit._scopeName + "_" + id;
    }, findWidgets:function (root, skipNode) {
        var outAry = [];
        function getChildrenHelper(root) {
            for (var node = root.firstChild; node; node = node.nextSibling) {
                if (node.nodeType == 1) {
                    var widgetId = node.getAttribute("widgetId");
                    if (widgetId) {
                        var widget = hash[widgetId];
                        if (widget) {
                            outAry.push(widget);
                        }
                    } else {
                        if (node !== skipNode) {
                            getChildrenHelper(node);
                        }
                    }
                }
            }
        }
        getChildrenHelper(root);
        return outAry;
    }, _destroyAll:function () {
        dijit._curFocus = null;
        dijit._prevFocus = null;
        dijit._activeStack = [];
        array.forEach(registry.findWidgets(win.body()), function (widget) {
            if (!widget._destroyed) {
                if (widget.destroyRecursive) {
                    widget.destroyRecursive();
                } else {
                    if (widget.destroy) {
                        widget.destroy();
                    }
                }
            }
        });
    }, getEnclosingWidget:function (node) {
        while (node) {
            var id = node.nodeType == 1 && node.getAttribute("widgetId");
            if (id) {
                return hash[id];
            }
            node = node.parentNode;
        }
        return null;
    }, _hash:hash};
    dijit.registry = registry;
    return registry;
});

