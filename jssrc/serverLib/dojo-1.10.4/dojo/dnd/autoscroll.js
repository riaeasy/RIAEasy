//>>built

define("dojo/dnd/autoscroll", ["../_base/lang", "../sniff", "../_base/window", "../dom-geometry", "../dom-style", "../window"], function (lang, has, win, domGeom, domStyle, winUtils) {
    var exports = {};
    lang.setObject("dojo.dnd.autoscroll", exports);
    exports.getViewport = winUtils.getBox;
    exports.V_TRIGGER_AUTOSCROLL = 32;
    exports.H_TRIGGER_AUTOSCROLL = 32;
    exports.V_AUTOSCROLL_VALUE = 16;
    exports.H_AUTOSCROLL_VALUE = 16;
    var viewport, doc = win.doc, maxScrollTop = Infinity, maxScrollLeft = Infinity;
    exports.autoScrollStart = function (d) {
        doc = d;
        viewport = winUtils.getBox(doc);
        var html = win.body(doc).parentNode;
        maxScrollTop = Math.max(html.scrollHeight - viewport.h, 0);
        maxScrollLeft = Math.max(html.scrollWidth - viewport.w, 0);
    };
    exports.autoScroll = function (e) {
        var v = viewport || winUtils.getBox(doc), html = win.body(doc).parentNode, dx = 0, dy = 0;
        if (e.clientX < exports.H_TRIGGER_AUTOSCROLL) {
            dx = -exports.H_AUTOSCROLL_VALUE;
        } else {
            if (e.clientX > v.w - exports.H_TRIGGER_AUTOSCROLL) {
                dx = Math.min(exports.H_AUTOSCROLL_VALUE, maxScrollLeft - html.scrollLeft);
            }
        }
        if (e.clientY < exports.V_TRIGGER_AUTOSCROLL) {
            dy = -exports.V_AUTOSCROLL_VALUE;
        } else {
            if (e.clientY > v.h - exports.V_TRIGGER_AUTOSCROLL) {
                dy = Math.min(exports.V_AUTOSCROLL_VALUE, maxScrollTop - html.scrollTop);
            }
        }
        window.scrollBy(dx, dy);
    };
    exports._validNodes = {"div":1, "p":1, "td":1};
    exports._validOverflow = {"auto":1, "scroll":1};
    exports.autoScrollNodes = function (e) {
        var b, t, w, h, rx, ry, dx = 0, dy = 0, oldLeft, oldTop;
        for (var n = e.target; n; ) {
            if (n.nodeType == 1 && (n.tagName.toLowerCase() in exports._validNodes)) {
                var s = domStyle.getComputedStyle(n), overflow = (s.overflow.toLowerCase() in exports._validOverflow), overflowX = (s.overflowX.toLowerCase() in exports._validOverflow), overflowY = (s.overflowY.toLowerCase() in exports._validOverflow);
                if (overflow || overflowX || overflowY) {
                    b = domGeom.getContentBox(n, s);
                    t = domGeom.position(n, true);
                }
                if (overflow || overflowX) {
                    w = Math.min(exports.H_TRIGGER_AUTOSCROLL, b.w / 2);
                    rx = e.pageX - t.x;
                    if (has("webkit") || has("opera")) {
                        rx += win.body().scrollLeft;
                    }
                    dx = 0;
                    if (rx > 0 && rx < b.w) {
                        if (rx < w) {
                            dx = -w;
                        } else {
                            if (rx > b.w - w) {
                                dx = w;
                            }
                        }
                        oldLeft = n.scrollLeft;
                        n.scrollLeft = n.scrollLeft + dx;
                    }
                }
                if (overflow || overflowY) {
                    h = Math.min(exports.V_TRIGGER_AUTOSCROLL, b.h / 2);
                    ry = e.pageY - t.y;
                    if (has("webkit") || has("opera")) {
                        ry += win.body().scrollTop;
                    }
                    dy = 0;
                    if (ry > 0 && ry < b.h) {
                        if (ry < h) {
                            dy = -h;
                        } else {
                            if (ry > b.h - h) {
                                dy = h;
                            }
                        }
                        oldTop = n.scrollTop;
                        n.scrollTop = n.scrollTop + dy;
                    }
                }
                if (dx || dy) {
                    return;
                }
            }
            try {
                n = n.parentNode;
            }
            catch (x) {
                n = null;
            }
        }
        exports.autoScroll(e);
    };
    return exports;
});

