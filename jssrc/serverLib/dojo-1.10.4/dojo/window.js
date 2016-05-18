//>>built

define("dojo/window", ["./_base/lang", "./sniff", "./_base/window", "./dom", "./dom-geometry", "./dom-style", "./dom-construct"], function (lang, has, baseWindow, dom, geom, style, domConstruct) {
    has.add("rtl-adjust-position-for-verticalScrollBar", function (win, doc) {
        var body = baseWindow.body(doc), scrollable = domConstruct.create("div", {style:{overflow:"scroll", overflowX:"visible", direction:"rtl", visibility:"hidden", position:"absolute", left:"0", top:"0", width:"64px", height:"64px"}}, body, "last"), div = domConstruct.create("div", {style:{overflow:"hidden", direction:"ltr"}}, scrollable, "last"), ret = geom.position(div).x != 0;
        scrollable.removeChild(div);
        body.removeChild(scrollable);
        return ret;
    });
    has.add("position-fixed-support", function (win, doc) {
        var body = baseWindow.body(doc), outer = domConstruct.create("span", {style:{visibility:"hidden", position:"fixed", left:"1px", top:"1px"}}, body, "last"), inner = domConstruct.create("span", {style:{position:"fixed", left:"0", top:"0"}}, outer, "last"), ret = geom.position(inner).x != geom.position(outer).x;
        outer.removeChild(inner);
        body.removeChild(outer);
        return ret;
    });
    var window = {getBox:function (doc) {
        doc = doc || baseWindow.doc;
        var scrollRoot = (doc.compatMode == "BackCompat") ? baseWindow.body(doc) : doc.documentElement, scroll = geom.docScroll(doc), w, h;
        if (has("touch")) {
            var uiWindow = window.get(doc);
            w = uiWindow.innerWidth || scrollRoot.clientWidth;
            h = uiWindow.innerHeight || scrollRoot.clientHeight;
        } else {
            w = scrollRoot.clientWidth;
            h = scrollRoot.clientHeight;
        }
        return {l:scroll.x, t:scroll.y, w:w, h:h};
    }, get:function (doc) {
        if (has("ie") && window !== document.parentWindow) {
            doc.parentWindow.execScript("document._parentWindow = window;", "Javascript");
            var win = doc._parentWindow;
            doc._parentWindow = null;
            return win;
        }
        return doc.parentWindow || doc.defaultView;
    }, scrollIntoView:function (node, pos) {
        try {
            node = dom.byId(node);
            var doc = node.ownerDocument || baseWindow.doc, body = baseWindow.body(doc), html = doc.documentElement || body.parentNode, isIE = has("ie"), isWK = has("webkit");
            if (node == body || node == html) {
                return;
            }
            if (!(has("mozilla") || isIE || isWK || has("opera") || has("trident")) && ("scrollIntoView" in node)) {
                node.scrollIntoView(false);
                return;
            }
            var backCompat = doc.compatMode == "BackCompat", rootWidth = Math.min(body.clientWidth || html.clientWidth, html.clientWidth || body.clientWidth), rootHeight = Math.min(body.clientHeight || html.clientHeight, html.clientHeight || body.clientHeight), scrollRoot = (isWK || backCompat) ? body : html, nodePos = pos || geom.position(node), el = node.parentNode, isFixed = function (el) {
                return (isIE <= 6 || (isIE == 7 && backCompat)) ? false : (has("position-fixed-support") && (style.get(el, "position").toLowerCase() == "fixed"));
            }, self = this, scrollElementBy = function (el, x, y) {
                if (el.tagName == "BODY" || el.tagName == "HTML") {
                    self.get(el.ownerDocument).scrollBy(x, y);
                } else {
                    x && (el.scrollLeft += x);
                    y && (el.scrollTop += y);
                }
            };
            if (isFixed(node)) {
                return;
            }
            while (el) {
                if (el == body) {
                    el = scrollRoot;
                }
                var elPos = geom.position(el), fixedPos = isFixed(el), rtl = style.getComputedStyle(el).direction.toLowerCase() == "rtl";
                if (el == scrollRoot) {
                    elPos.w = rootWidth;
                    elPos.h = rootHeight;
                    if (scrollRoot == html && (isIE || has("trident")) && rtl) {
                        elPos.x += scrollRoot.offsetWidth - elPos.w;
                    }
                    if (elPos.x < 0 || !isIE || isIE >= 9 || has("trident")) {
                        elPos.x = 0;
                    }
                    if (elPos.y < 0 || !isIE || isIE >= 9 || has("trident")) {
                        elPos.y = 0;
                    }
                } else {
                    var pb = geom.getPadBorderExtents(el);
                    elPos.w -= pb.w;
                    elPos.h -= pb.h;
                    elPos.x += pb.l;
                    elPos.y += pb.t;
                    var clientSize = el.clientWidth, scrollBarSize = elPos.w - clientSize;
                    if (clientSize > 0 && scrollBarSize > 0) {
                        if (rtl && has("rtl-adjust-position-for-verticalScrollBar")) {
                            elPos.x += scrollBarSize;
                        }
                        elPos.w = clientSize;
                    }
                    clientSize = el.clientHeight;
                    scrollBarSize = elPos.h - clientSize;
                    if (clientSize > 0 && scrollBarSize > 0) {
                        elPos.h = clientSize;
                    }
                }
                if (fixedPos) {
                    if (elPos.y < 0) {
                        elPos.h += elPos.y;
                        elPos.y = 0;
                    }
                    if (elPos.x < 0) {
                        elPos.w += elPos.x;
                        elPos.x = 0;
                    }
                    if (elPos.y + elPos.h > rootHeight) {
                        elPos.h = rootHeight - elPos.y;
                    }
                    if (elPos.x + elPos.w > rootWidth) {
                        elPos.w = rootWidth - elPos.x;
                    }
                }
                var l = nodePos.x - elPos.x, t = nodePos.y - elPos.y, r = l + nodePos.w - elPos.w, bot = t + nodePos.h - elPos.h;
                var s, old;
                if (r * l > 0 && (!!el.scrollLeft || el == scrollRoot || el.scrollWidth > el.offsetHeight)) {
                    s = Math[l < 0 ? "max" : "min"](l, r);
                    if (rtl && ((isIE == 8 && !backCompat) || isIE >= 9 || has("trident"))) {
                        s = -s;
                    }
                    old = el.scrollLeft;
                    scrollElementBy(el, s, 0);
                    s = el.scrollLeft - old;
                    nodePos.x -= s;
                }
                if (bot * t > 0 && (!!el.scrollTop || el == scrollRoot || el.scrollHeight > el.offsetHeight)) {
                    s = Math.ceil(Math[t < 0 ? "max" : "min"](t, bot));
                    old = el.scrollTop;
                    scrollElementBy(el, 0, s);
                    s = el.scrollTop - old;
                    nodePos.y -= s;
                }
                el = (el != scrollRoot) && !fixedPos && el.parentNode;
            }
        }
        catch (error) {
            console.error("scrollIntoView: " + error);
            node.scrollIntoView(false);
        }
    }};
    1 && lang.setObject("dojo.window", window);
    return window;
});

