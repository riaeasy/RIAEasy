//>>built

define("dojo/dom-geometry", ["./sniff", "./_base/window", "./dom", "./dom-style"], function (has, win, dom, style) {
    var geom = {};
    geom.boxModel = "content-box";
    if (has("ie")) {
        geom.boxModel = document.compatMode == "BackCompat" ? "border-box" : "content-box";
    }
    geom.getPadExtents = function getPadExtents(node, computedStyle) {
        node = dom.byId(node);
        var s = computedStyle || style.getComputedStyle(node), px = style.toPixelValue, l = px(node, s.paddingLeft), t = px(node, s.paddingTop), r = px(node, s.paddingRight), b = px(node, s.paddingBottom);
        return {l:l, t:t, r:r, b:b, w:l + r, h:t + b};
    };
    var none = "none";
    geom.getBorderExtents = function getBorderExtents(node, computedStyle) {
        node = dom.byId(node);
        var px = style.toPixelValue, s = computedStyle || style.getComputedStyle(node), l = s.borderLeftStyle != none ? px(node, s.borderLeftWidth) : 0, t = s.borderTopStyle != none ? px(node, s.borderTopWidth) : 0, r = s.borderRightStyle != none ? px(node, s.borderRightWidth) : 0, b = s.borderBottomStyle != none ? px(node, s.borderBottomWidth) : 0;
        return {l:l, t:t, r:r, b:b, w:l + r, h:t + b};
    };
    geom.getPadBorderExtents = function getPadBorderExtents(node, computedStyle) {
        node = dom.byId(node);
        var s = computedStyle || style.getComputedStyle(node), p = geom.getPadExtents(node, s), b = geom.getBorderExtents(node, s);
        return {l:p.l + b.l, t:p.t + b.t, r:p.r + b.r, b:p.b + b.b, w:p.w + b.w, h:p.h + b.h};
    };
    geom.getMarginExtents = function getMarginExtents(node, computedStyle) {
        node = dom.byId(node);
        var s = computedStyle || style.getComputedStyle(node), px = style.toPixelValue, l = px(node, s.marginLeft), t = px(node, s.marginTop), r = px(node, s.marginRight), b = px(node, s.marginBottom);
        return {l:l, t:t, r:r, b:b, w:l + r, h:t + b};
    };
    geom.getMarginBox = function getMarginBox(node, computedStyle) {
        node = dom.byId(node);
        var s = computedStyle || style.getComputedStyle(node), me = geom.getMarginExtents(node, s), l = node.offsetLeft - me.l, t = node.offsetTop - me.t, p = node.parentNode, px = style.toPixelValue, pcs;
        if (has("mozilla")) {
            var sl = parseFloat(s.left), st = parseFloat(s.top);
            if (!isNaN(sl) && !isNaN(st)) {
                l = sl;
                t = st;
            } else {
                if (p && p.style) {
                    pcs = style.getComputedStyle(p);
                    if (pcs.overflow != "visible") {
                        l += pcs.borderLeftStyle != none ? px(node, pcs.borderLeftWidth) : 0;
                        t += pcs.borderTopStyle != none ? px(node, pcs.borderTopWidth) : 0;
                    }
                }
            }
        } else {
            if (has("opera") || (has("ie") == 8 && !has("quirks"))) {
                if (p) {
                    pcs = style.getComputedStyle(p);
                    l -= pcs.borderLeftStyle != none ? px(node, pcs.borderLeftWidth) : 0;
                    t -= pcs.borderTopStyle != none ? px(node, pcs.borderTopWidth) : 0;
                }
            }
        }
        return {l:l, t:t, w:node.offsetWidth + me.w, h:node.offsetHeight + me.h};
    };
    geom.getContentBox = function getContentBox(node, computedStyle) {
        node = dom.byId(node);
        var s = computedStyle || style.getComputedStyle(node), w = node.clientWidth, h, pe = geom.getPadExtents(node, s), be = geom.getBorderExtents(node, s);
        if (!w) {
            w = node.offsetWidth;
            h = node.offsetHeight;
        } else {
            h = node.clientHeight;
            be.w = be.h = 0;
        }
        if (has("opera")) {
            pe.l += be.l;
            pe.t += be.t;
        }
        return {l:pe.l, t:pe.t, w:w - pe.w - be.w, h:h - pe.h - be.h};
    };
    function setBox(node, l, t, w, h, u) {
        u = u || "px";
        var s = node.style;
        if (!isNaN(l)) {
            s.left = l + u;
        }
        if (!isNaN(t)) {
            s.top = t + u;
        }
        if (w >= 0) {
            s.width = w + u;
        }
        if (h >= 0) {
            s.height = h + u;
        }
    }
    function isButtonTag(node) {
        return node.tagName.toLowerCase() == "button" || node.tagName.toLowerCase() == "input" && (node.getAttribute("type") || "").toLowerCase() == "button";
    }
    function usesBorderBox(node) {
        return geom.boxModel == "border-box" || node.tagName.toLowerCase() == "table" || isButtonTag(node);
    }
    geom.setContentSize = function setContentSize(node, box, computedStyle) {
        node = dom.byId(node);
        var w = box.w, h = box.h;
        if (usesBorderBox(node)) {
            var pb = geom.getPadBorderExtents(node, computedStyle);
            if (w >= 0) {
                w += pb.w;
            }
            if (h >= 0) {
                h += pb.h;
            }
        }
        setBox(node, NaN, NaN, w, h);
    };
    var nilExtents = {l:0, t:0, w:0, h:0};
    geom.setMarginBox = function setMarginBox(node, box, computedStyle) {
        node = dom.byId(node);
        var s = computedStyle || style.getComputedStyle(node), w = box.w, h = box.h, pb = usesBorderBox(node) ? nilExtents : geom.getPadBorderExtents(node, s), mb = geom.getMarginExtents(node, s);
        if (has("webkit")) {
            if (isButtonTag(node)) {
                var ns = node.style;
                if (w >= 0 && !ns.width) {
                    ns.width = "4px";
                }
                if (h >= 0 && !ns.height) {
                    ns.height = "4px";
                }
            }
        }
        if (w >= 0) {
            w = Math.max(w - pb.w - mb.w, 0);
        }
        if (h >= 0) {
            h = Math.max(h - pb.h - mb.h, 0);
        }
        setBox(node, box.l, box.t, w, h);
    };
    geom.isBodyLtr = function isBodyLtr(doc) {
        doc = doc || win.doc;
        return (win.body(doc).dir || doc.documentElement.dir || "ltr").toLowerCase() == "ltr";
    };
    geom.docScroll = function docScroll(doc) {
        doc = doc || win.doc;
        var node = win.doc.parentWindow || win.doc.defaultView;
        return "pageXOffset" in node ? {x:node.pageXOffset, y:node.pageYOffset} : (node = has("quirks") ? win.body(doc) : doc.documentElement) && {x:geom.fixIeBiDiScrollLeft(node.scrollLeft || 0, doc), y:node.scrollTop || 0};
    };
    if (has("ie")) {
        geom.getIeDocumentElementOffset = function getIeDocumentElementOffset(doc) {
            doc = doc || win.doc;
            var de = doc.documentElement;
            if (has("ie") < 8) {
                var r = de.getBoundingClientRect(), l = r.left, t = r.top;
                if (has("ie") < 7) {
                    l += de.clientLeft;
                    t += de.clientTop;
                }
                return {x:l < 0 ? 0 : l, y:t < 0 ? 0 : t};
            } else {
                return {x:0, y:0};
            }
        };
    }
    geom.fixIeBiDiScrollLeft = function fixIeBiDiScrollLeft(scrollLeft, doc) {
        doc = doc || win.doc;
        var ie = has("ie");
        if (ie && !geom.isBodyLtr(doc)) {
            var qk = has("quirks"), de = qk ? win.body(doc) : doc.documentElement, pwin = win.global;
            if (ie == 6 && !qk && pwin.frameElement && de.scrollHeight > de.clientHeight) {
                scrollLeft += de.clientLeft;
            }
            return (ie < 8 || qk) ? (scrollLeft + de.clientWidth - de.scrollWidth) : -scrollLeft;
        }
        return scrollLeft;
    };
    geom.position = function (node, includeScroll) {
        node = dom.byId(node);
        var db = win.body(node.ownerDocument), ret = node.getBoundingClientRect();
        ret = {x:ret.left, y:ret.top, w:ret.right - ret.left, h:ret.bottom - ret.top};
        if (has("ie") < 9) {
            var offset = geom.getIeDocumentElementOffset(node.ownerDocument);
            ret.x -= offset.x + (has("quirks") ? db.clientLeft + db.offsetLeft : 0);
            ret.y -= offset.y + (has("quirks") ? db.clientTop + db.offsetTop : 0);
        }
        if (includeScroll) {
            var scroll = geom.docScroll(node.ownerDocument);
            ret.x += scroll.x;
            ret.y += scroll.y;
        }
        return ret;
    };
    geom.getMarginSize = function getMarginSize(node, computedStyle) {
        node = dom.byId(node);
        var me = geom.getMarginExtents(node, computedStyle || style.getComputedStyle(node));
        var size = node.getBoundingClientRect();
        return {w:(size.right - size.left) + me.w, h:(size.bottom - size.top) + me.h};
    };
    geom.normalizeEvent = function (event) {
        if (!("layerX" in event)) {
            event.layerX = event.offsetX;
            event.layerY = event.offsetY;
        }
        if (!has("dom-addeventlistener")) {
            var se = event.target;
            var doc = (se && se.ownerDocument) || document;
            var docBody = has("quirks") ? doc.body : doc.documentElement;
            var offset = geom.getIeDocumentElementOffset(doc);
            event.pageX = event.clientX + geom.fixIeBiDiScrollLeft(docBody.scrollLeft || 0, doc) - offset.x;
            event.pageY = event.clientY + (docBody.scrollTop || 0) - offset.y;
        }
    };
    return geom;
});

