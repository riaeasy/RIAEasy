//>>built

define("dojo/mouse", ["./_base/kernel", "./on", "./has", "./dom", "./_base/window"], function (dojo, on, has, dom, win) {
    has.add("dom-quirks", win.doc && win.doc.compatMode == "BackCompat");
    has.add("events-mouseenter", win.doc && "onmouseenter" in win.doc.createElement("div"));
    has.add("events-mousewheel", win.doc && "onmousewheel" in win.doc);
    var mouseButtons;
    if ((has("dom-quirks") && has("ie")) || !has("dom-addeventlistener")) {
        mouseButtons = {LEFT:1, MIDDLE:4, RIGHT:2, isButton:function (e, button) {
            return e.button & button;
        }, isLeft:function (e) {
            return e.button & 1;
        }, isMiddle:function (e) {
            return e.button & 4;
        }, isRight:function (e) {
            return e.button & 2;
        }};
    } else {
        mouseButtons = {LEFT:0, MIDDLE:1, RIGHT:2, isButton:function (e, button) {
            return e.button == button;
        }, isLeft:function (e) {
            return e.button == 0;
        }, isMiddle:function (e) {
            return e.button == 1;
        }, isRight:function (e) {
            return e.button == 2;
        }};
    }
    dojo.mouseButtons = mouseButtons;
    function eventHandler(type, selectHandler) {
        var handler = function (node, listener) {
            return on(node, type, function (evt) {
                if (selectHandler) {
                    return selectHandler(evt, listener);
                }
                if (!dom.isDescendant(evt.relatedTarget, node)) {
                    return listener.call(this, evt);
                }
            });
        };
        handler.bubble = function (select) {
            return eventHandler(type, function (evt, listener) {
                var target = select(evt.target);
                var relatedTarget = evt.relatedTarget;
                if (target && (target != (relatedTarget && relatedTarget.nodeType == 1 && select(relatedTarget)))) {
                    return listener.call(target, evt);
                }
            });
        };
        return handler;
    }
    var wheel;
    if (has("events-mousewheel")) {
        wheel = "mousewheel";
    } else {
        wheel = function (node, listener) {
            return on(node, "DOMMouseScroll", function (evt) {
                evt.wheelDelta = -evt.detail;
                listener.call(this, evt);
            });
        };
    }
    return {_eventHandler:eventHandler, enter:eventHandler("mouseover"), leave:eventHandler("mouseout"), wheel:wheel, isLeft:mouseButtons.isLeft, isMiddle:mouseButtons.isMiddle, isRight:mouseButtons.isRight};
});

