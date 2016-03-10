//>>built

define("dojo/_base/connect", ["./kernel", "../on", "../topic", "../aspect", "./event", "../mouse", "./sniff", "./lang", "../keys"], function (dojo, on, hub, aspect, eventModule, mouse, has, lang) {
    has.add("events-keypress-typed", function () {
        var testKeyEvent = {charCode:0};
        try {
            testKeyEvent = document.createEvent("KeyboardEvent");
            (testKeyEvent.initKeyboardEvent || testKeyEvent.initKeyEvent).call(testKeyEvent, "keypress", true, true, null, false, false, false, false, 9, 3);
        }
        catch (e) {
        }
        return testKeyEvent.charCode == 0 && !has("opera");
    });
    function connect_(obj, event, context, method, dontFix) {
        method = lang.hitch(context, method);
        if (!obj || !(obj.addEventListener || obj.attachEvent)) {
            return aspect.after(obj || dojo.global, event, method, true);
        }
        if (typeof event == "string" && event.substring(0, 2) == "on") {
            event = event.substring(2);
        }
        if (!obj) {
            obj = dojo.global;
        }
        if (!dontFix) {
            switch (event) {
              case "keypress":
                event = keypress;
                break;
              case "mouseenter":
                event = mouse.enter;
                break;
              case "mouseleave":
                event = mouse.leave;
                break;
            }
        }
        return on(obj, event, method, dontFix);
    }
    var _punctMap = {106:42, 111:47, 186:59, 187:43, 188:44, 189:45, 190:46, 191:47, 192:96, 219:91, 220:92, 221:93, 222:39, 229:113};
    var evtCopyKey = has("mac") ? "metaKey" : "ctrlKey";
    var _synthesizeEvent = function (evt, props) {
        var faux = lang.mixin({}, evt, props);
        setKeyChar(faux);
        faux.preventDefault = function () {
            evt.preventDefault();
        };
        faux.stopPropagation = function () {
            evt.stopPropagation();
        };
        return faux;
    };
    function setKeyChar(evt) {
        evt.keyChar = evt.charCode ? String.fromCharCode(evt.charCode) : "";
        evt.charOrCode = evt.keyChar || evt.keyCode;
    }
    var keypress;
    if (has("events-keypress-typed")) {
        var _trySetKeyCode = function (e, code) {
            try {
                return (e.keyCode = code);
            }
            catch (e) {
                return 0;
            }
        };
        keypress = function (object, listener) {
            var keydownSignal = on(object, "keydown", function (evt) {
                var k = evt.keyCode;
                var unprintable = (k != 13) && k != 32 && (k != 27 || !has("ie")) && (k < 48 || k > 90) && (k < 96 || k > 111) && (k < 186 || k > 192) && (k < 219 || k > 222) && k != 229;
                if (unprintable || evt.ctrlKey) {
                    var c = unprintable ? 0 : k;
                    if (evt.ctrlKey) {
                        if (k == 3 || k == 13) {
                            return listener.call(evt.currentTarget, evt);
                        } else {
                            if (c > 95 && c < 106) {
                                c -= 48;
                            } else {
                                if ((!evt.shiftKey) && (c >= 65 && c <= 90)) {
                                    c += 32;
                                } else {
                                    c = _punctMap[c] || c;
                                }
                            }
                        }
                    }
                    var faux = _synthesizeEvent(evt, {type:"keypress", faux:true, charCode:c});
                    listener.call(evt.currentTarget, faux);
                    if (has("ie")) {
                        _trySetKeyCode(evt, faux.keyCode);
                    }
                }
            });
            var keypressSignal = on(object, "keypress", function (evt) {
                var c = evt.charCode;
                c = c >= 32 ? c : 0;
                evt = _synthesizeEvent(evt, {charCode:c, faux:true});
                return listener.call(this, evt);
            });
            return {remove:function () {
                keydownSignal.remove();
                keypressSignal.remove();
            }};
        };
    } else {
        if (has("opera")) {
            keypress = function (object, listener) {
                return on(object, "keypress", function (evt) {
                    var c = evt.which;
                    if (c == 3) {
                        c = 99;
                    }
                    c = c < 32 && !evt.shiftKey ? 0 : c;
                    if (evt.ctrlKey && !evt.shiftKey && c >= 65 && c <= 90) {
                        c += 32;
                    }
                    return listener.call(this, _synthesizeEvent(evt, {charCode:c}));
                });
            };
        } else {
            keypress = function (object, listener) {
                return on(object, "keypress", function (evt) {
                    setKeyChar(evt);
                    return listener.call(this, evt);
                });
            };
        }
    }
    var connect = {_keypress:keypress, connect:function (obj, event, context, method, dontFix) {
        var a = arguments, args = [], i = 0;
        args.push(typeof a[0] == "string" ? null : a[i++], a[i++]);
        var a1 = a[i + 1];
        args.push(typeof a1 == "string" || typeof a1 == "function" ? a[i++] : null, a[i++]);
        for (var l = a.length; i < l; i++) {
            args.push(a[i]);
        }
        return connect_.apply(this, args);
    }, disconnect:function (handle) {
        if (handle) {
            handle.remove();
        }
    }, subscribe:function (topic, context, method) {
        return hub.subscribe(topic, lang.hitch(context, method));
    }, publish:function (topic, args) {
        return hub.publish.apply(hub, [topic].concat(args));
    }, connectPublisher:function (topic, obj, event) {
        var pf = function () {
            connect.publish(topic, arguments);
        };
        return event ? connect.connect(obj, event, pf) : connect.connect(obj, pf);
    }, isCopyKey:function (e) {
        return e[evtCopyKey];
    }};
    connect.unsubscribe = connect.disconnect;
    1 && lang.mixin(dojo, connect);
    return connect;
});

