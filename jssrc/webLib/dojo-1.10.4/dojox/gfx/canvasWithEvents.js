//>>built

define("dojox/gfx/canvasWithEvents", ["dojo/_base/lang", "dojo/_base/declare", "dojo/has", "dojo/on", "dojo/aspect", "dojo/touch", "dojo/_base/Color", "dojo/dom", "dojo/dom-geometry", "dojo/_base/window", "./_base", "./canvas", "./shape", "./matrix"], function (lang, declare, has, on, aspect, touch, Color, dom, domGeom, win, g, canvas, shapeLib, m) {
    function makeFakeEvent(event) {
        var fakeEvent = {};
        for (var k in event) {
            if (typeof event[k] === "function") {
                fakeEvent[k] = lang.hitch(event, k);
            } else {
                fakeEvent[k] = event[k];
            }
        }
        return fakeEvent;
    }
    has.add("dom-mutableEvents", function () {
        var event = document.createEvent("UIEvents");
        try {
            if (Object.defineProperty) {
                Object.defineProperty(event, "type", {value:"foo"});
            } else {
                event.type = "foo";
            }
            return event.type === "foo";
        }
        catch (e) {
            return false;
        }
    });
    var canvasWithEvents = g.canvasWithEvents = {};
    canvasWithEvents.Shape = declare("dojox.gfx.canvasWithEvents.Shape", canvas.Shape, {_testInputs:function (ctx, pos) {
        if (this.clip || (!this.canvasFill && this.strokeStyle)) {
            this._hitTestPixel(ctx, pos);
        } else {
            this._renderShape(ctx);
            var length = pos.length, t = this.getTransform();
            for (var i = 0; i < length; ++i) {
                var input = pos[i];
                if (input.target) {
                    continue;
                }
                var x = input.x, y = input.y, p = t ? m.multiplyPoint(m.invert(t), x, y) : {x:x, y:y};
                input.target = this._hitTestGeometry(ctx, p.x, p.y);
            }
        }
    }, _hitTestPixel:function (ctx, pos) {
        for (var i = 0; i < pos.length; ++i) {
            var input = pos[i];
            if (input.target) {
                continue;
            }
            var x = input.x, y = input.y;
            ctx.clearRect(0, 0, 1, 1);
            ctx.save();
            ctx.translate(-x, -y);
            this._render(ctx, true);
            input.target = ctx.getImageData(0, 0, 1, 1).data[0] ? this : null;
            ctx.restore();
        }
    }, _hitTestGeometry:function (ctx, x, y) {
        return ctx.isPointInPath(x, y) ? this : null;
    }, _renderFill:function (ctx, apply) {
        if (ctx.pickingMode) {
            if ("canvasFill" in this && apply) {
                ctx.fill();
            }
            return;
        }
        this.inherited(arguments);
    }, _renderStroke:function (ctx) {
        if (this.strokeStyle && ctx.pickingMode) {
            var c = this.strokeStyle.color;
            try {
                this.strokeStyle.color = new Color(ctx.strokeStyle);
                this.inherited(arguments);
            }
            finally {
                this.strokeStyle.color = c;
            }
        } else {
            this.inherited(arguments);
        }
    }, getEventSource:function () {
        return this.surface.rawNode;
    }, on:function (type, listener) {
        var expectedTarget = this.rawNode;
        return on(this.getEventSource(), type, function (event) {
            if (dom.isDescendant(event.target, expectedTarget)) {
                listener.apply(expectedTarget, arguments);
            }
        });
    }, connect:function (name, object, method) {
        if (name.substring(0, 2) == "on") {
            name = name.substring(2);
        }
        return this.on(name, method ? lang.hitch(object, method) : lang.hitch(null, object));
    }, disconnect:function (handle) {
        handle.remove();
    }});
    canvasWithEvents.Group = declare("dojox.gfx.canvasWithEvents.Group", [canvasWithEvents.Shape, canvas.Group], {_testInputs:function (ctx, pos) {
        var children = this.children, t = this.getTransform(), i, j, input;
        if (children.length === 0) {
            return;
        }
        var posbk = [];
        for (i = 0; i < pos.length; ++i) {
            input = pos[i];
            posbk[i] = {x:input.x, y:input.y};
            if (input.target) {
                continue;
            }
            var x = input.x, y = input.y;
            var p = t ? m.multiplyPoint(m.invert(t), x, y) : {x:x, y:y};
            input.x = p.x;
            input.y = p.y;
        }
        for (i = children.length - 1; i >= 0; --i) {
            children[i]._testInputs(ctx, pos);
            var allFound = true;
            for (j = 0; j < pos.length; ++j) {
                if (pos[j].target == null) {
                    allFound = false;
                    break;
                }
            }
            if (allFound) {
                break;
            }
        }
        if (this.clip) {
            for (i = 0; i < pos.length; ++i) {
                input = pos[i];
                input.x = posbk[i].x;
                input.y = posbk[i].y;
                if (input.target) {
                    ctx.clearRect(0, 0, 1, 1);
                    ctx.save();
                    ctx.translate(-input.x, -input.y);
                    this._render(ctx, true);
                    if (!ctx.getImageData(0, 0, 1, 1).data[0]) {
                        input.target = null;
                    }
                    ctx.restore();
                }
            }
        } else {
            for (i = 0; i < pos.length; ++i) {
                pos[i].x = posbk[i].x;
                pos[i].y = posbk[i].y;
            }
        }
    }});
    canvasWithEvents.Image = declare("dojox.gfx.canvasWithEvents.Image", [canvasWithEvents.Shape, canvas.Image], {_renderShape:function (ctx) {
        var s = this.shape;
        if (ctx.pickingMode) {
            ctx.fillRect(s.x, s.y, s.width, s.height);
        } else {
            this.inherited(arguments);
        }
    }, _hitTestGeometry:function (ctx, x, y) {
        var s = this.shape;
        return x >= s.x && x <= s.x + s.width && y >= s.y && y <= s.y + s.height ? this : null;
    }});
    canvasWithEvents.Text = declare("dojox.gfx.canvasWithEvents.Text", [canvasWithEvents.Shape, canvas.Text], {_testInputs:function (ctx, pos) {
        return this._hitTestPixel(ctx, pos);
    }});
    canvasWithEvents.Rect = declare("dojox.gfx.canvasWithEvents.Rect", [canvasWithEvents.Shape, canvas.Rect], {});
    canvasWithEvents.Circle = declare("dojox.gfx.canvasWithEvents.Circle", [canvasWithEvents.Shape, canvas.Circle], {});
    canvasWithEvents.Ellipse = declare("dojox.gfx.canvasWithEvents.Ellipse", [canvasWithEvents.Shape, canvas.Ellipse], {});
    canvasWithEvents.Line = declare("dojox.gfx.canvasWithEvents.Line", [canvasWithEvents.Shape, canvas.Line], {});
    canvasWithEvents.Polyline = declare("dojox.gfx.canvasWithEvents.Polyline", [canvasWithEvents.Shape, canvas.Polyline], {});
    canvasWithEvents.Path = declare("dojox.gfx.canvasWithEvents.Path", [canvasWithEvents.Shape, canvas.Path], {});
    canvasWithEvents.TextPath = declare("dojox.gfx.canvasWithEvents.TextPath", [canvasWithEvents.Shape, canvas.TextPath], {});
    var fixedEventData = null;
    canvasWithEvents.Surface = declare("dojox.gfx.canvasWithEvents.Surface", canvas.Surface, {constructor:function () {
        this._elementUnderPointer = null;
    }, fixTarget:function (listener) {
        var surface = this;
        return function (event) {
            var k;
            if (fixedEventData) {
                if (has("dom-mutableEvents")) {
                    Object.defineProperties(event, fixedEventData);
                } else {
                    event = makeFakeEvent(event);
                    for (k in fixedEventData) {
                        event[k] = fixedEventData[k].value;
                    }
                }
            } else {
                var canvas = surface.getEventSource(), target = canvas._dojoElementFromPoint((event.changedTouches ? event.changedTouches[0] : event).pageX, (event.changedTouches ? event.changedTouches[0] : event).pageY);
                if (has("dom-mutableEvents")) {
                    Object.defineProperties(event, {target:{value:target, configurable:true, enumerable:true}, gfxTarget:{value:target.shape, configurable:true, enumerable:true}});
                } else {
                    event = makeFakeEvent(event);
                    event.target = target;
                    event.gfxTarget = target.shape;
                }
            }
            if (1) {
                if (event.changedTouches && event.changedTouches[0]) {
                    var changedTouch = event.changedTouches[0];
                    for (k in changedTouch) {
                        if (!event[k]) {
                            if (has("dom-mutableEvents")) {
                                Object.defineProperty(event, k, {value:changedTouch[k], configurable:true, enumerable:true});
                            } else {
                                event[k] = changedTouch[k];
                            }
                        }
                    }
                }
                event.corrected = event;
            }
            return listener.call(this, event);
        };
    }, _checkPointer:function (event) {
        function emit(types, target, relatedTarget) {
            var oldBubbles = event.bubbles;
            for (var i = 0, type; (type = types[i]); ++i) {
                fixedEventData = {target:{value:target, configurable:true, enumerable:true}, gfxTarget:{value:target.shape, configurable:true, enumerable:true}, relatedTarget:{value:relatedTarget, configurable:true, enumerable:true}};
                Object.defineProperty(event, "bubbles", {value:type.bubbles, configurable:true, enumerable:true});
                on.emit(canvas, type.type, event);
                fixedEventData = null;
            }
            Object.defineProperty(event, "bubbles", {value:oldBubbles, configurable:true, enumerable:true});
        }
        var TYPES = {out:[{type:"mouseout", bubbles:true}, {type:"MSPointerOut", bubbles:true}, {type:"pointerout", bubbles:true}, {type:"mouseleave", bubbles:false}, {type:"dojotouchout", bubbles:true}], over:[{type:"mouseover", bubbles:true}, {type:"MSPointerOver", bubbles:true}, {type:"pointerover", bubbles:true}, {type:"mouseenter", bubbles:false}, {type:"dojotouchover", bubbles:true}]}, elementUnderPointer = event.target, oldElementUnderPointer = this._elementUnderPointer, canvas = this.getEventSource();
        if (oldElementUnderPointer !== elementUnderPointer) {
            if (oldElementUnderPointer && oldElementUnderPointer !== canvas) {
                emit(TYPES.out, oldElementUnderPointer, elementUnderPointer);
            }
            this._elementUnderPointer = elementUnderPointer;
            if (elementUnderPointer && elementUnderPointer !== canvas) {
                emit(TYPES.over, elementUnderPointer, oldElementUnderPointer);
            }
        }
    }, getEventSource:function () {
        return this.rawNode;
    }, on:function (type, listener) {
        return on(this.getEventSource(), type, listener);
    }, connect:function (name, object, method) {
        if (name.substring(0, 2) == "on") {
            name = name.substring(2);
        }
        return this.on(name, method ? lang.hitch(object, method) : object);
    }, disconnect:function (handle) {
        handle.remove();
    }, _initMirrorCanvas:function () {
        this._initMirrorCanvas = function () {
        };
        var canvas = this.getEventSource(), mirror = this.mirrorCanvas = canvas.ownerDocument.createElement("canvas");
        mirror.width = 1;
        mirror.height = 1;
        mirror.style.position = "absolute";
        mirror.style.left = mirror.style.top = "-99999px";
        canvas.parentNode.appendChild(mirror);
        var moveEvt = "mousemove";
        if (has("pointer-events")) {
            moveEvt = "pointermove";
        } else {
            if (has("MSPointer")) {
                moveEvt = "MSPointerMove";
            } else {
                if (has("touch-events")) {
                    moveEvt = "touchmove";
                }
            }
        }
        on(canvas, moveEvt, lang.hitch(this, "_checkPointer"));
    }, destroy:function () {
        if (this.mirrorCanvas) {
            this.mirrorCanvas.parentNode.removeChild(this.mirrorCanvas);
            this.mirrorCanvas = null;
        }
        this.inherited(arguments);
    }});
    canvasWithEvents.createSurface = function (parentNode, width, height) {
        if (!width && !height) {
            var pos = domGeom.position(parentNode);
            width = width || pos.w;
            height = height || pos.h;
        }
        if (typeof width === "number") {
            width = width + "px";
        }
        if (typeof height === "number") {
            height = height + "px";
        }
        var surface = new canvasWithEvents.Surface(), parent = dom.byId(parentNode), canvas = parent.ownerDocument.createElement("canvas");
        canvas.width = g.normalizedLength(width);
        canvas.height = g.normalizedLength(height);
        parent.appendChild(canvas);
        surface.rawNode = canvas;
        surface._parent = parent;
        surface.surface = surface;
        g._base._fixMsTouchAction(surface);
        var oldAddEventListener = canvas.addEventListener, oldRemoveEventListener = canvas.removeEventListener, listeners = [];
        var addEventListenerImpl = function (type, listener, useCapture) {
            surface._initMirrorCanvas();
            var actualListener = surface.fixTarget(listener);
            listeners.push({original:listener, actual:actualListener});
            oldAddEventListener.call(this, type, actualListener, useCapture);
        };
        var removeEventListenerImpl = function (type, listener, useCapture) {
            for (var i = 0, record; (record = listeners[i]); ++i) {
                if (record.original === listener) {
                    oldRemoveEventListener.call(this, type, record.actual, useCapture);
                    listeners.splice(i, 1);
                    break;
                }
            }
        };
        try {
            Object.defineProperties(canvas, {addEventListener:{value:addEventListenerImpl, enumerable:true, configurable:true}, removeEventListener:{value:removeEventListenerImpl}});
        }
        catch (e) {
            canvas.addEventListener = addEventListenerImpl;
            canvas.removeEventListener = removeEventListenerImpl;
        }
        canvas._dojoElementFromPoint = function (x, y) {
            if (!surface.mirrorCanvas) {
                return this;
            }
            var surfacePosition = domGeom.position(this, true);
            x -= surfacePosition.x;
            y -= surfacePosition.y;
            var mirror = surface.mirrorCanvas, ctx = mirror.getContext("2d"), children = surface.children;
            ctx.clearRect(0, 0, mirror.width, mirror.height);
            ctx.save();
            ctx.strokeStyle = "rgba(127,127,127,1.0)";
            ctx.fillStyle = "rgba(127,127,127,1.0)";
            ctx.pickingMode = true;
            var inputs = [{x:x, y:y}];
            for (var i = children.length - 1; i >= 0; i--) {
                children[i]._testInputs(ctx, inputs);
                if (inputs[0].target) {
                    break;
                }
            }
            ctx.restore();
            return inputs[0] && inputs[0].target ? inputs[0].target.rawNode : this;
        };
        return surface;
    };
    var Creator = {createObject:function () {
        var shape = this.inherited(arguments), listeners = {};
        shape.rawNode = {shape:shape, ownerDocument:shape.surface.rawNode.ownerDocument, parentNode:shape.parent ? shape.parent.rawNode : null, addEventListener:function (type, listener) {
            var listenersOfType = listeners[type] = (listeners[type] || []);
            for (var i = 0, record; (record = listenersOfType[i]); ++i) {
                if (record.listener === listener) {
                    return;
                }
            }
            listenersOfType.push({listener:listener, handle:aspect.after(this, "on" + type, shape.surface.fixTarget(listener), true)});
        }, removeEventListener:function (type, listener) {
            var listenersOfType = listeners[type];
            if (!listenersOfType) {
                return;
            }
            for (var i = 0, record; (record = listenersOfType[i]); ++i) {
                if (record.listener === listener) {
                    record.handle.remove();
                    listenersOfType.splice(i, 1);
                    return;
                }
            }
        }};
        return shape;
    }};
    canvasWithEvents.Group.extend(Creator);
    canvasWithEvents.Surface.extend(Creator);
    return canvasWithEvents;
});

