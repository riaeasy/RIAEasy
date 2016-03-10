//>>built

define("dojo/on", ["./has!dom-addeventlistener?:./aspect", "./_base/kernel", "./sniff"], function (aspect, dojo, has) {
    "use strict";
    if (1) {
        var major = window.ScriptEngineMajorVersion;
        has.add("jscript", major && (major() + ScriptEngineMinorVersion() / 10));
        has.add("event-orientationchange", 1 && !has("android"));
        has.add("event-stopimmediatepropagation", window.Event && !!window.Event.prototype && !!window.Event.prototype.stopImmediatePropagation);
        has.add("event-focusin", function (global, doc, element) {
            return "onfocusin" in element;
        });
        if (1) {
            has.add("touch-can-modify-event-delegate", function () {
                var EventDelegate = function () {
                };
                EventDelegate.prototype = document.createEvent("MouseEvents");
                try {
                    var eventDelegate = new EventDelegate;
                    eventDelegate.target = null;
                    return eventDelegate.target === null;
                }
                catch (e) {
                    return false;
                }
            });
        }
    }
    var on = function (target, type, listener, dontFix) {
        if (typeof target.on == "function" && typeof type != "function" && !target.nodeType) {
            return target.on(type, listener);
        }
        return on.parse(target, type, listener, addListener, dontFix, this);
    };
    on.pausable = function (target, type, listener, dontFix) {
        var paused;
        var signal = on(target, type, function () {
            if (!paused) {
                return listener.apply(this, arguments);
            }
        }, dontFix);
        signal.pause = function () {
            paused = true;
        };
        signal.resume = function () {
            paused = false;
        };
        return signal;
    };
    on.once = function (target, type, listener, dontFix) {
        var signal = on(target, type, function () {
            signal.remove();
            return listener.apply(this, arguments);
        });
        return signal;
    };
    on.parse = function (target, type, listener, addListener, dontFix, matchesTarget) {
        if (type.call) {
            return type.call(matchesTarget, target, listener);
        }
        if (type instanceof Array) {
            events = type;
        } else {
            if (type.indexOf(",") > -1) {
                var events = type.split(/\s*,\s*/);
            }
        }
        if (events) {
            var handles = [];
            var i = 0;
            var eventName;
            while (eventName = events[i++]) {
                handles.push(on.parse(target, eventName, listener, addListener, dontFix, matchesTarget));
            }
            handles.remove = function () {
                for (var i = 0; i < handles.length; i++) {
                    handles[i].remove();
                }
            };
            return handles;
        }
        return addListener(target, type, listener, dontFix, matchesTarget);
    };
    var touchEvents = /^touch/;
    function addListener(target, type, listener, dontFix, matchesTarget) {
        var selector = type.match(/(.*):(.*)/);
        if (selector) {
            type = selector[2];
            selector = selector[1];
            return on.selector(selector, type).call(matchesTarget, target, listener);
        }
        if (1) {
            if (touchEvents.test(type)) {
                listener = fixTouchListener(listener);
            }
            if (!has("event-orientationchange") && (type == "orientationchange")) {
                type = "resize";
                target = window;
                listener = fixTouchListener(listener);
            }
        }
        if (addStopImmediate) {
            listener = addStopImmediate(listener);
        }
        if (target.addEventListener) {
            var capture = type in captures, adjustedType = capture ? captures[type] : type;
            target.addEventListener(adjustedType, listener, capture);
            return {remove:function () {
                target.removeEventListener(adjustedType, listener, capture);
            }};
        }
        type = "on" + type;
        if (fixAttach && target.attachEvent) {
            return fixAttach(target, type, listener);
        }
        throw new Error("Target must be an event emitter");
    }
    on.matches = function (node, selector, context, children, matchesTarget) {
        matchesTarget = matchesTarget && matchesTarget.matches ? matchesTarget : dojo.query;
        children = children !== false;
        if (node.nodeType != 1) {
            node = node.parentNode;
        }
        while (!matchesTarget.matches(node, selector, context)) {
            if (node == context || children === false || !(node = node.parentNode) || node.nodeType != 1) {
                return false;
            }
        }
        return node;
    };
    on.selector = function (selector, eventType, children) {
        return function (target, listener) {
            var matchesTarget = typeof selector == "function" ? {matches:selector} : this, bubble = eventType.bubble;
            function select(eventTarget) {
                return on.matches(eventTarget, selector, target, children, matchesTarget);
            }
            if (bubble) {
                return on(target, bubble(select), listener);
            }
            return on(target, eventType, function (event) {
                var eventTarget = select(event.target);
                if (eventTarget) {
                    return listener.call(eventTarget, event);
                }
            });
        };
    };
    function syntheticPreventDefault() {
        this.cancelable = false;
        this.defaultPrevented = true;
    }
    function syntheticStopPropagation() {
        this.bubbles = false;
    }
    var slice = [].slice, syntheticDispatch = on.emit = function (target, type, event) {
        var args = slice.call(arguments, 2);
        var method = "on" + type;
        if ("parentNode" in target) {
            var newEvent = args[0] = {};
            for (var i in event) {
                newEvent[i] = event[i];
            }
            newEvent.preventDefault = syntheticPreventDefault;
            newEvent.stopPropagation = syntheticStopPropagation;
            newEvent.target = target;
            newEvent.type = type;
            event = newEvent;
        }
        do {
            target[method] && target[method].apply(target, args);
        } while (event && event.bubbles && (target = target.parentNode));
        return event && event.cancelable && event;
    };
    var captures = has("event-focusin") ? {} : {focusin:"focus", focusout:"blur"};
    if (!has("event-stopimmediatepropagation")) {
        var stopImmediatePropagation = function () {
            this.immediatelyStopped = true;
            this.modified = true;
        };
        var addStopImmediate = function (listener) {
            return function (event) {
                if (!event.immediatelyStopped) {
                    event.stopImmediatePropagation = stopImmediatePropagation;
                    return listener.apply(this, arguments);
                }
            };
        };
    }
    if (has("dom-addeventlistener")) {
        on.emit = function (target, type, event) {
            if (target.dispatchEvent && document.createEvent) {
                var ownerDocument = target.ownerDocument || document;
                var nativeEvent = ownerDocument.createEvent("HTMLEvents");
                nativeEvent.initEvent(type, !!event.bubbles, !!event.cancelable);
                for (var i in event) {
                    if (!(i in nativeEvent)) {
                        nativeEvent[i] = event[i];
                    }
                }
                return target.dispatchEvent(nativeEvent) && nativeEvent;
            }
            return syntheticDispatch.apply(on, arguments);
        };
    } else {
        on._fixEvent = function (evt, sender) {
            if (!evt) {
                var w = sender && (sender.ownerDocument || sender.document || sender).parentWindow || window;
                evt = w.event;
            }
            if (!evt) {
                return evt;
            }
            try {
                if (lastEvent && evt.type == lastEvent.type && evt.srcElement == lastEvent.target) {
                    evt = lastEvent;
                }
            }
            catch (e) {
            }
            if (!evt.target) {
                evt.target = evt.srcElement;
                evt.currentTarget = (sender || evt.srcElement);
                if (evt.type == "mouseover") {
                    evt.relatedTarget = evt.fromElement;
                }
                if (evt.type == "mouseout") {
                    evt.relatedTarget = evt.toElement;
                }
                if (!evt.stopPropagation) {
                    evt.stopPropagation = stopPropagation;
                    evt.preventDefault = preventDefault;
                }
                switch (evt.type) {
                  case "keypress":
                    var c = ("charCode" in evt ? evt.charCode : evt.keyCode);
                    if (c == 10) {
                        c = 0;
                        evt.keyCode = 13;
                    } else {
                        if (c == 13 || c == 27) {
                            c = 0;
                        } else {
                            if (c == 3) {
                                c = 99;
                            }
                        }
                    }
                    evt.charCode = c;
                    _setKeyChar(evt);
                    break;
                }
            }
            return evt;
        };
        var lastEvent, IESignal = function (handle) {
            this.handle = handle;
        };
        IESignal.prototype.remove = function () {
            delete _dojoIEListeners_[this.handle];
        };
        var fixListener = function (listener) {
            return function (evt) {
                evt = on._fixEvent(evt, this);
                var result = listener.call(this, evt);
                if (evt.modified) {
                    if (!lastEvent) {
                        setTimeout(function () {
                            lastEvent = null;
                        });
                    }
                    lastEvent = evt;
                }
                return result;
            };
        };
        var fixAttach = function (target, type, listener) {
            listener = fixListener(listener);
            if (((target.ownerDocument ? target.ownerDocument.parentWindow : target.parentWindow || target.window || window) != top || has("jscript") < 5.8) && !has("config-_allow_leaks")) {
                if (typeof _dojoIEListeners_ == "undefined") {
                    _dojoIEListeners_ = [];
                }
                var emitter = target[type];
                if (!emitter || !emitter.listeners) {
                    var oldListener = emitter;
                    emitter = Function("event", "var callee = arguments.callee; for(var i = 0; i<callee.listeners.length; i++){var listener = _dojoIEListeners_[callee.listeners[i]]; if(listener){listener.call(this,event);}}");
                    emitter.listeners = [];
                    target[type] = emitter;
                    emitter.global = this;
                    if (oldListener) {
                        emitter.listeners.push(_dojoIEListeners_.push(oldListener) - 1);
                    }
                }
                var handle;
                emitter.listeners.push(handle = (emitter.global._dojoIEListeners_.push(listener) - 1));
                return new IESignal(handle);
            }
            return aspect.after(target, type, listener, true);
        };
        var _setKeyChar = function (evt) {
            evt.keyChar = evt.charCode ? String.fromCharCode(evt.charCode) : "";
            evt.charOrCode = evt.keyChar || evt.keyCode;
        };
        var stopPropagation = function () {
            this.cancelBubble = true;
        };
        var preventDefault = on._preventDefault = function () {
            this.bubbledKeyCode = this.keyCode;
            if (this.ctrlKey) {
                try {
                    this.keyCode = 0;
                }
                catch (e) {
                }
            }
            this.defaultPrevented = true;
            this.returnValue = false;
            this.modified = true;
        };
    }
    if (1) {
        var EventDelegate = function () {
        };
        var windowOrientation = window.orientation;
        var fixTouchListener = function (listener) {
            return function (originalEvent) {
                var event = originalEvent.corrected;
                if (!event) {
                    var type = originalEvent.type;
                    try {
                        delete originalEvent.type;
                    }
                    catch (e) {
                    }
                    if (originalEvent.type) {
                        if (has("touch-can-modify-event-delegate")) {
                            EventDelegate.prototype = originalEvent;
                            event = new EventDelegate;
                        } else {
                            event = {};
                            for (var name in originalEvent) {
                                event[name] = originalEvent[name];
                            }
                        }
                        event.preventDefault = function () {
                            originalEvent.preventDefault();
                        };
                        event.stopPropagation = function () {
                            originalEvent.stopPropagation();
                        };
                    } else {
                        event = originalEvent;
                        event.type = type;
                    }
                    originalEvent.corrected = event;
                    if (type == "resize") {
                        if (windowOrientation == window.orientation) {
                            return null;
                        }
                        windowOrientation = window.orientation;
                        event.type = "orientationchange";
                        return listener.call(this, event);
                    }
                    if (!("rotation" in event)) {
                        event.rotation = 0;
                        event.scale = 1;
                    }
                    var firstChangeTouch = event.changedTouches[0];
                    for (var i in firstChangeTouch) {
                        delete event[i];
                        event[i] = firstChangeTouch[i];
                    }
                }
                return listener.call(this, event);
            };
        };
    }
    return on;
});

