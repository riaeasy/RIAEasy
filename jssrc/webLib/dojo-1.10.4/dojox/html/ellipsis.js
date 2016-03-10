//>>built

define("dojox/html/ellipsis", ["dojo/_base/kernel", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/Color", "dojo/colors"], function (d) {
    if (d.isFF < 7) {
        var delay = 1;
        if ("dojoxFFEllipsisDelay" in d.config) {
            delay = Number(d.config.dojoxFFEllipsisDelay);
            if (isNaN(delay)) {
                delay = 1;
            }
        }
        try {
            var createXULEllipsis = (function () {
                var sNS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
                var xml = document.createElementNS(sNS, "window");
                var label = document.createElementNS(sNS, "description");
                label.setAttribute("crop", "end");
                xml.appendChild(label);
                return function (n) {
                    var x = xml.cloneNode(true);
                    x.firstChild.setAttribute("value", n.textContent);
                    n.innerHTML = "";
                    n.appendChild(x);
                };
            })();
        }
        catch (e) {
        }
        var create = d.create;
        var dd = d.doc;
        var dp = d.place;
        var iFrame = create("iframe", {className:"dojoxEllipsisIFrame", src:"javascript:'<html><head><script>if(\"loadFirebugConsole\" in window){window.loadFirebugConsole();}</script></head><body></body></html>'", style:{display:"none"}});
        var rollRange = function (r, cnt) {
            if (r.collapsed) {
                return;
            }
            if (cnt > 0) {
                do {
                    rollRange(r);
                    cnt--;
                } while (cnt);
                return;
            }
            if (r.endContainer.nodeType == 3 && r.endOffset > 0) {
                r.setEnd(r.endContainer, r.endOffset - 1);
            } else {
                if (r.endContainer.nodeType == 3) {
                    r.setEndBefore(r.endContainer);
                    rollRange(r);
                    return;
                } else {
                    if (r.endOffset && r.endContainer.childNodes.length >= r.endOffset) {
                        var nCont = r.endContainer.childNodes[r.endOffset - 1];
                        if (nCont.nodeType == 3) {
                            r.setEnd(nCont, nCont.length - 1);
                        } else {
                            if (nCont.childNodes.length) {
                                r.setEnd(nCont, nCont.childNodes.length);
                                rollRange(r);
                                return;
                            } else {
                                r.setEndBefore(nCont);
                                rollRange(r);
                                return;
                            }
                        }
                    } else {
                        r.setEndBefore(r.endContainer);
                        rollRange(r);
                        return;
                    }
                }
            }
        };
        var createIFrameEllipsis = function (n) {
            var c = create("div", {className:"dojoxEllipsisContainer"});
            var e = create("div", {className:"dojoxEllipsisShown", style:{display:"none"}});
            n.parentNode.replaceChild(c, n);
            c.appendChild(n);
            c.appendChild(e);
            var i = iFrame.cloneNode(true);
            var ns = n.style;
            var es = e.style;
            var ranges;
            var resizeNode = function () {
                ns.display = "";
                es.display = "none";
                if (n.scrollWidth <= n.offsetWidth) {
                    return;
                }
                var r = dd.createRange();
                r.selectNodeContents(n);
                ns.display = "none";
                es.display = "";
                var done = false;
                do {
                    var numRolls = 1;
                    dp(r.cloneContents(), e, "only");
                    var sw = e.scrollWidth, ow = e.offsetWidth;
                    done = (sw <= ow);
                    var pct = (1 - ((ow * 1) / sw));
                    if (pct > 0) {
                        numRolls = Math.max(Math.round(e.textContent.length * pct) - 1, 1);
                    }
                    rollRange(r, numRolls);
                } while (!r.collapsed && !done);
            };
            i.onload = function () {
                i.contentWindow.onresize = resizeNode;
                resizeNode();
            };
            c.appendChild(i);
        };
        var hc = d.hasClass;
        var doc = d.doc;
        var s, fn, opt;
        if (doc.querySelectorAll) {
            s = doc;
            fn = "querySelectorAll";
            opt = ".dojoxEllipsis";
        } else {
            if (doc.getElementsByClassName) {
                s = doc;
                fn = "getElementsByClassName";
                opt = "dojoxEllipsis";
            } else {
                s = d;
                fn = "query";
                opt = ".dojoxEllipsis";
            }
        }
        fx = function () {
            d.forEach(s[fn].apply(s, [opt]), function (n) {
                if (!n || n._djx_ellipsis_done) {
                    return;
                }
                n._djx_ellipsis_done = true;
                if (createXULEllipsis && n.textContent == n.innerHTML && !hc(n, "dojoxEllipsisSelectable")) {
                    createXULEllipsis(n);
                } else {
                    createIFrameEllipsis(n);
                }
            });
        };
        d.addOnLoad(function () {
            var t = null;
            var c = null;
            var connFx = function () {
                if (c) {
                    d.disconnect(c);
                    c = null;
                }
                if (t) {
                    clearTimeout(t);
                }
                t = setTimeout(function () {
                    t = null;
                    fx();
                    c = d.connect(d.body(), "DOMSubtreeModified", connFx);
                }, delay);
            };
            connFx();
        });
    }
});

