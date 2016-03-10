//>>built

define("dojox/gesture/Base", ["dojo/_base/kernel", "dojo/_base/declare", "dojo/_base/array", "dojo/_base/lang", "dojo/dom", "dojo/on", "dojo/touch", "dojo/has", "../main"], function (kernel, declare, array, lang, dom, on, touch, has, dojox) {
    kernel.experimental("dojox.gesture.Base");
    lang.getObject("gesture", true, dojox);
    return declare(null, {defaultEvent:" ", subEvents:[], touchOnly:false, _elements:null, constructor:function (args) {
        lang.mixin(this, args);
        this.init();
    }, init:function () {
        this._elements = [];
        if (!1 && this.touchOnly) {
            console.warn("Gestures:[", this.defaultEvent, "] is only supported on touch devices!");
            return;
        }
        var evt = this.defaultEvent;
        this.call = this._handle(evt);
        this._events = [evt];
        array.forEach(this.subEvents, function (subEvt) {
            this[subEvt] = this._handle(evt + "." + subEvt);
            this._events.push(evt + "." + subEvt);
        }, this);
    }, _handle:function (eventType) {
        var self = this;
        return function (node, listener) {
            var a = arguments;
            if (a.length > 2) {
                node = a[1];
                listener = a[2];
            }
            var isNode = node && (node.nodeType || node.attachEvent || node.addEventListener);
            if (!isNode) {
                return on(node, eventType, listener);
            } else {
                var onHandle = self._add(node, eventType, listener);
                var signal = {remove:function () {
                    onHandle.remove();
                    self._remove(node, eventType);
                }};
                return signal;
            }
        };
    }, _add:function (node, type, listener) {
        var element = this._getGestureElement(node);
        if (!element) {
            element = {target:node, data:{}, handles:{}};
            var _press = lang.hitch(this, "_process", element, "press");
            var _move = lang.hitch(this, "_process", element, "move");
            var _release = lang.hitch(this, "_process", element, "release");
            var _cancel = lang.hitch(this, "_process", element, "cancel");
            var handles = element.handles;
            if (this.touchOnly) {
                handles.press = on(node, "touchstart", _press);
                handles.move = on(node, "touchmove", _move);
                handles.release = on(node, "touchend", _release);
                handles.cancel = on(node, "touchcancel", _cancel);
            } else {
                handles.press = touch.press(node, _press);
                handles.move = touch.move(node, _move);
                handles.release = touch.release(node, _release);
                handles.cancel = touch.cancel(node, _cancel);
            }
            this._elements.push(element);
        }
        element.handles[type] = !element.handles[type] ? 1 : ++element.handles[type];
        return on(node, type, listener);
    }, _getGestureElement:function (node) {
        var i = 0, element;
        for (; i < this._elements.length; i++) {
            element = this._elements[i];
            if (element.target === node) {
                return element;
            }
        }
    }, _process:function (element, phase, e) {
        e._locking = e._locking || {};
        if (e._locking[this.defaultEvent] || this.isLocked(e.currentTarget)) {
            return;
        }
        if ((e.target.tagName != "INPUT" || e.target.type == "radio" || e.target.type == "checkbox") && e.target.tagName != "TEXTAREA") {
            e.preventDefault();
        }
        e._locking[this.defaultEvent] = true;
        this[phase](element.data, e);
    }, press:function (data, e) {
    }, move:function (data, e) {
    }, release:function (data, e) {
    }, cancel:function (data, e) {
    }, fire:function (node, event) {
        if (!node || !event) {
            return;
        }
        event.bubbles = true;
        event.cancelable = true;
        on.emit(node, event.type, event);
    }, _remove:function (node, type) {
        var element = this._getGestureElement(node);
        if (!element || !element.handles) {
            return;
        }
        element.handles[type]--;
        var handles = element.handles;
        if (!array.some(this._events, function (evt) {
            return handles[evt] > 0;
        })) {
            this._cleanHandles(handles);
            var i = array.indexOf(this._elements, element);
            if (i >= 0) {
                this._elements.splice(i, 1);
            }
        }
    }, _cleanHandles:function (handles) {
        for (var x in handles) {
            if (handles[x].remove) {
                handles[x].remove();
            }
            delete handles[x];
        }
    }, lock:function (node) {
        this._lock = node;
    }, unLock:function () {
        this._lock = null;
    }, isLocked:function (node) {
        if (!this._lock || !node) {
            return false;
        }
        return this._lock !== node && dom.isDescendant(node, this._lock);
    }, destroy:function () {
        array.forEach(this._elements, function (element) {
            this._cleanHandles(element.handles);
        }, this);
        this._elements = null;
    }});
});

