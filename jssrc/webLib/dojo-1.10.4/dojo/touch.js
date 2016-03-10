//>>built

define("dojo/touch", ["./_base/kernel", "./aspect", "./dom", "./dom-class", "./_base/lang", "./on", "./has", "./mouse", "./domReady", "./_base/window"], function (dojo, aspect, dom, domClass, lang, on, has, mouse, domReady, win) {
    var ios4 = has("ios") < 5;
    var hasPointer = has("pointer-events") || has("MSPointer"), pointer = (function () {
        var pointer = {};
        for (var type in {down:1, move:1, up:1, cancel:1, over:1, out:1}) {
            pointer[type] = has("MSPointer") ? "MSPointer" + type.charAt(0).toUpperCase() + type.slice(1) : "pointer" + type;
        }
        return pointer;
    })();
    var hasTouch = has("touch-events");
    var clicksInited, clickTracker, useTarget = false, clickTarget, clickX, clickY, clickDx, clickDy, clickTime;
    var lastTouch;
    function dualEvent(mouseType, touchType, pointerType) {
        if (hasPointer && pointerType) {
            return function (node, listener) {
                return on(node, pointerType, listener);
            };
        } else {
            if (hasTouch) {
                return function (node, listener) {
                    var handle1 = on(node, touchType, function (evt) {
                        listener.call(this, evt);
                        lastTouch = (new Date()).getTime();
                    }), handle2 = on(node, mouseType, function (evt) {
                        if (!lastTouch || (new Date()).getTime() > lastTouch + 1000) {
                            listener.call(this, evt);
                        }
                    });
                    return {remove:function () {
                        handle1.remove();
                        handle2.remove();
                    }};
                };
            } else {
                return function (node, listener) {
                    return on(node, mouseType, listener);
                };
            }
        }
    }
    function marked(node) {
        do {
            if (node.dojoClick !== undefined) {
                return node;
            }
        } while (node = node.parentNode);
    }
    function doClicks(e, moveType, endType) {
        var markedNode = marked(e.target);
        clickTracker = !e.target.disabled && markedNode && markedNode.dojoClick;
        if (clickTracker) {
            useTarget = (clickTracker == "useTarget");
            clickTarget = (useTarget ? markedNode : e.target);
            if (useTarget) {
                e.preventDefault();
            }
            clickX = e.changedTouches ? e.changedTouches[0].pageX - win.global.pageXOffset : e.clientX;
            clickY = e.changedTouches ? e.changedTouches[0].pageY - win.global.pageYOffset : e.clientY;
            clickDx = (typeof clickTracker == "object" ? clickTracker.x : (typeof clickTracker == "number" ? clickTracker : 0)) || 4;
            clickDy = (typeof clickTracker == "object" ? clickTracker.y : (typeof clickTracker == "number" ? clickTracker : 0)) || 4;
            if (!clicksInited) {
                clicksInited = true;
                function updateClickTracker(e) {
                    if (useTarget) {
                        clickTracker = dom.isDescendant(win.doc.elementFromPoint((e.changedTouches ? e.changedTouches[0].pageX - win.global.pageXOffset : e.clientX), (e.changedTouches ? e.changedTouches[0].pageY - win.global.pageYOffset : e.clientY)), clickTarget);
                    } else {
                        clickTracker = clickTracker && (e.changedTouches ? e.changedTouches[0].target : e.target) == clickTarget && Math.abs((e.changedTouches ? e.changedTouches[0].pageX - win.global.pageXOffset : e.clientX) - clickX) <= clickDx && Math.abs((e.changedTouches ? e.changedTouches[0].pageY - win.global.pageYOffset : e.clientY) - clickY) <= clickDy;
                    }
                }
                win.doc.addEventListener(moveType, function (e) {
                    updateClickTracker(e);
                    if (useTarget) {
                        e.preventDefault();
                    }
                }, true);
                win.doc.addEventListener(endType, function (e) {
                    updateClickTracker(e);
                    if (clickTracker) {
                        clickTime = (new Date()).getTime();
                        var target = (useTarget ? clickTarget : e.target);
                        if (target.tagName === "LABEL") {
                            target = dom.byId(target.getAttribute("for")) || target;
                        }
                        var src = (e.changedTouches) ? e.changedTouches[0] : e;
                        var clickEvt = document.createEvent("MouseEvents");
                        clickEvt._dojo_click = true;
                        clickEvt.initMouseEvent("click", true, true, e.view, e.detail, src.screenX, src.screenY, src.clientX, src.clientY, e.ctrlKey, e.altKey, e.shiftKey, e.metaKey, 0, null);
                        setTimeout(function () {
                            on.emit(target, "click", clickEvt);
                            clickTime = (new Date()).getTime();
                        }, 0);
                    }
                }, true);
                function stopNativeEvents(type) {
                    win.doc.addEventListener(type, function (e) {
                        if (!e._dojo_click && (new Date()).getTime() <= clickTime + 1000 && !(e.target.tagName == "INPUT" && domClass.contains(e.target, "dijitOffScreen"))) {
                            e.stopPropagation();
                            e.stopImmediatePropagation && e.stopImmediatePropagation();
                            if (type == "click" && (e.target.tagName != "INPUT" || e.target.type == "radio" || e.target.type == "checkbox") && e.target.tagName != "TEXTAREA" && e.target.tagName != "AUDIO" && e.target.tagName != "VIDEO") {
                                e.preventDefault();
                            }
                        }
                    }, true);
                }
                stopNativeEvents("click");
                stopNativeEvents("mousedown");
                stopNativeEvents("mouseup");
            }
        }
    }
    var hoveredNode;
    if (hasPointer) {
        domReady(function () {
            win.doc.addEventListener(pointer.down, function (evt) {
                doClicks(evt, pointer.move, pointer.up);
            }, true);
        });
    } else {
        if (hasTouch) {
            domReady(function () {
                hoveredNode = win.body();
                win.doc.addEventListener("touchstart", function (evt) {
                    lastTouch = (new Date()).getTime();
                    var oldNode = hoveredNode;
                    hoveredNode = evt.target;
                    on.emit(oldNode, "dojotouchout", {relatedTarget:hoveredNode, bubbles:true});
                    on.emit(hoveredNode, "dojotouchover", {relatedTarget:oldNode, bubbles:true});
                    doClicks(evt, "touchmove", "touchend");
                }, true);
                function copyEventProps(evt) {
                    var props = lang.delegate(evt, {bubbles:true});
                    if (has("ios") >= 6) {
                        props.touches = evt.touches;
                        props.altKey = evt.altKey;
                        props.changedTouches = evt.changedTouches;
                        props.ctrlKey = evt.ctrlKey;
                        props.metaKey = evt.metaKey;
                        props.shiftKey = evt.shiftKey;
                        props.targetTouches = evt.targetTouches;
                    }
                    return props;
                }
                on(win.doc, "touchmove", function (evt) {
                    lastTouch = (new Date()).getTime();
                    var newNode = win.doc.elementFromPoint(evt.pageX - (ios4 ? 0 : win.global.pageXOffset), evt.pageY - (ios4 ? 0 : win.global.pageYOffset));
                    if (newNode) {
                        if (hoveredNode !== newNode) {
                            on.emit(hoveredNode, "dojotouchout", {relatedTarget:newNode, bubbles:true});
                            on.emit(newNode, "dojotouchover", {relatedTarget:hoveredNode, bubbles:true});
                            hoveredNode = newNode;
                        }
                        if (!on.emit(newNode, "dojotouchmove", copyEventProps(evt))) {
                            evt.preventDefault();
                        }
                    }
                });
                on(win.doc, "touchend", function (evt) {
                    lastTouch = (new Date()).getTime();
                    var node = win.doc.elementFromPoint(evt.pageX - (ios4 ? 0 : win.global.pageXOffset), evt.pageY - (ios4 ? 0 : win.global.pageYOffset)) || win.body();
                    on.emit(node, "dojotouchend", copyEventProps(evt));
                });
            });
        }
    }
    var touch = {press:dualEvent("mousedown", "touchstart", pointer.down), move:dualEvent("mousemove", "dojotouchmove", pointer.move), release:dualEvent("mouseup", "dojotouchend", pointer.up), cancel:dualEvent(mouse.leave, "touchcancel", hasPointer ? pointer.cancel : null), over:dualEvent("mouseover", "dojotouchover", pointer.over), out:dualEvent("mouseout", "dojotouchout", pointer.out), enter:mouse._eventHandler(dualEvent("mouseover", "dojotouchover", pointer.over)), leave:mouse._eventHandler(dualEvent("mouseout", "dojotouchout", pointer.out))};
    1 && (dojo.touch = touch);
    return touch;
});

