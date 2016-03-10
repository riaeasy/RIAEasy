//>>built

define("dijit/typematic", ["dojo/_base/array", "dojo/_base/connect", "dojo/_base/lang", "dojo/on", "dojo/sniff", "./main"], function (array, connect, lang, on, has, dijit) {
    var typematic = (dijit.typematic = {_fireEventAndReload:function () {
        this._timer = null;
        this._callback(++this._count, this._node, this._evt);
        this._currentTimeout = Math.max(this._currentTimeout < 0 ? this._initialDelay : (this._subsequentDelay > 1 ? this._subsequentDelay : Math.round(this._currentTimeout * this._subsequentDelay)), this._minDelay);
        this._timer = setTimeout(lang.hitch(this, "_fireEventAndReload"), this._currentTimeout);
    }, trigger:function (evt, _this, node, callback, obj, subsequentDelay, initialDelay, minDelay) {
        if (obj != this._obj) {
            this.stop();
            this._initialDelay = initialDelay || 500;
            this._subsequentDelay = subsequentDelay || 0.9;
            this._minDelay = minDelay || 10;
            this._obj = obj;
            this._node = node;
            this._currentTimeout = -1;
            this._count = -1;
            this._callback = lang.hitch(_this, callback);
            this._evt = {faux:true};
            for (var attr in evt) {
                if (attr != "layerX" && attr != "layerY") {
                    var v = evt[attr];
                    if (typeof v != "function" && typeof v != "undefined") {
                        this._evt[attr] = v;
                    }
                }
            }
            this._fireEventAndReload();
        }
    }, stop:function () {
        if (this._timer) {
            clearTimeout(this._timer);
            this._timer = null;
        }
        if (this._obj) {
            this._callback(-1, this._node, this._evt);
            this._obj = null;
        }
    }, addKeyListener:function (node, keyObject, _this, callback, subsequentDelay, initialDelay, minDelay) {
        var type = "keyCode" in keyObject ? "keydown" : "charCode" in keyObject ? "keypress" : connect._keypress, attr = "keyCode" in keyObject ? "keyCode" : "charCode" in keyObject ? "charCode" : "charOrCode";
        var handles = [on(node, type, lang.hitch(this, function (evt) {
            if (evt[attr] == keyObject[attr] && (keyObject.ctrlKey === undefined || keyObject.ctrlKey == evt.ctrlKey) && (keyObject.altKey === undefined || keyObject.altKey == evt.altKey) && (keyObject.metaKey === undefined || keyObject.metaKey == (evt.metaKey || false)) && (keyObject.shiftKey === undefined || keyObject.shiftKey == evt.shiftKey)) {
                evt.stopPropagation();
                evt.preventDefault();
                typematic.trigger(evt, _this, node, callback, keyObject, subsequentDelay, initialDelay, minDelay);
            } else {
                if (typematic._obj == keyObject) {
                    typematic.stop();
                }
            }
        })), on(node, "keyup", lang.hitch(this, function () {
            if (typematic._obj == keyObject) {
                typematic.stop();
            }
        }))];
        return {remove:function () {
            array.forEach(handles, function (h) {
                h.remove();
            });
        }};
    }, addMouseListener:function (node, _this, callback, subsequentDelay, initialDelay, minDelay) {
        var handles = [on(node, "mousedown", lang.hitch(this, function (evt) {
            evt.preventDefault();
            typematic.trigger(evt, _this, node, callback, node, subsequentDelay, initialDelay, minDelay);
        })), on(node, "mouseup", lang.hitch(this, function (evt) {
            if (this._obj) {
                evt.preventDefault();
            }
            typematic.stop();
        })), on(node, "mouseout", lang.hitch(this, function (evt) {
            if (this._obj) {
                evt.preventDefault();
            }
            typematic.stop();
        })), on(node, "dblclick", lang.hitch(this, function (evt) {
            evt.preventDefault();
            if (has("ie") < 9) {
                typematic.trigger(evt, _this, node, callback, node, subsequentDelay, initialDelay, minDelay);
                setTimeout(lang.hitch(this, typematic.stop), 50);
            }
        }))];
        return {remove:function () {
            array.forEach(handles, function (h) {
                h.remove();
            });
        }};
    }, addListener:function (mouseNode, keyNode, keyObject, _this, callback, subsequentDelay, initialDelay, minDelay) {
        var handles = [this.addKeyListener(keyNode, keyObject, _this, callback, subsequentDelay, initialDelay, minDelay), this.addMouseListener(mouseNode, _this, callback, subsequentDelay, initialDelay, minDelay)];
        return {remove:function () {
            array.forEach(handles, function (h) {
                h.remove();
            });
        }};
    }});
    return typematic;
});

