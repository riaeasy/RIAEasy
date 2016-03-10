//>>built

define("dijit/WidgetSet", ["dojo/_base/array", "dojo/_base/declare", "dojo/_base/kernel", "./registry"], function (array, declare, kernel, registry) {
    var WidgetSet = declare("dijit.WidgetSet", null, {constructor:function () {
        this._hash = {};
        this.length = 0;
    }, add:function (widget) {
        if (this._hash[widget.id]) {
            throw new Error("Tried to register widget with id==" + widget.id + " but that id is already registered");
        }
        this._hash[widget.id] = widget;
        this.length++;
    }, remove:function (id) {
        if (this._hash[id]) {
            delete this._hash[id];
            this.length--;
        }
    }, forEach:function (func, thisObj) {
        thisObj = thisObj || kernel.global;
        var i = 0, id;
        for (id in this._hash) {
            func.call(thisObj, this._hash[id], i++, this._hash);
        }
        return this;
    }, filter:function (filter, thisObj) {
        thisObj = thisObj || kernel.global;
        var res = new WidgetSet(), i = 0, id;
        for (id in this._hash) {
            var w = this._hash[id];
            if (filter.call(thisObj, w, i++, this._hash)) {
                res.add(w);
            }
        }
        return res;
    }, byId:function (id) {
        return this._hash[id];
    }, byClass:function (cls) {
        var res = new WidgetSet(), id, widget;
        for (id in this._hash) {
            widget = this._hash[id];
            if (widget.declaredClass == cls) {
                res.add(widget);
            }
        }
        return res;
    }, toArray:function () {
        var ar = [];
        for (var id in this._hash) {
            ar.push(this._hash[id]);
        }
        return ar;
    }, map:function (func, thisObj) {
        return array.map(this.toArray(), func, thisObj);
    }, every:function (func, thisObj) {
        thisObj = thisObj || kernel.global;
        var x = 0, i;
        for (i in this._hash) {
            if (!func.call(thisObj, this._hash[i], x++, this._hash)) {
                return false;
            }
        }
        return true;
    }, some:function (func, thisObj) {
        thisObj = thisObj || kernel.global;
        var x = 0, i;
        for (i in this._hash) {
            if (func.call(thisObj, this._hash[i], x++, this._hash)) {
                return true;
            }
        }
        return false;
    }});
    array.forEach(["forEach", "filter", "byClass", "map", "every", "some"], function (func) {
        registry[func] = WidgetSet.prototype[func];
    });
    return WidgetSet;
});

