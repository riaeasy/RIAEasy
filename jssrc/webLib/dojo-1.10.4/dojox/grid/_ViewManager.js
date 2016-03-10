//>>built

define("dojox/grid/_ViewManager", ["dojo/_base/declare", "dojo/_base/sniff", "dojo/dom-class"], function (declare, has, domClass) {
    return declare("dojox.grid._ViewManager", null, {constructor:function (inGrid) {
        this.grid = inGrid;
    }, defaultWidth:200, views:[], resize:function () {
        this.onEach("resize");
    }, render:function () {
        this.onEach("render");
    }, addView:function (inView) {
        inView.idx = this.views.length;
        this.views.push(inView);
    }, destroyViews:function () {
        for (var i = 0, v; v = this.views[i]; i++) {
            v.destroy();
        }
        this.views = [];
    }, getContentNodes:function () {
        var nodes = [];
        for (var i = 0, v; v = this.views[i]; i++) {
            nodes.push(v.contentNode);
        }
        return nodes;
    }, forEach:function (inCallback) {
        for (var i = 0, v; v = this.views[i]; i++) {
            inCallback(v, i);
        }
    }, onEach:function (inMethod, inArgs) {
        inArgs = inArgs || [];
        for (var i = 0, v; v = this.views[i]; i++) {
            if (inMethod in v) {
                v[inMethod].apply(v, inArgs);
            }
        }
    }, normalizeHeaderNodeHeight:function () {
        var rowNodes = [];
        for (var i = 0, v; (v = this.views[i]); i++) {
            if (v.headerContentNode.firstChild) {
                rowNodes.push(v.headerContentNode);
            }
        }
        this.normalizeRowNodeHeights(rowNodes);
    }, normalizeRowNodeHeights:function (inRowNodes) {
        var h = 0;
        var currHeights = [];
        if (this.grid.rowHeight) {
            h = this.grid.rowHeight;
        } else {
            if (inRowNodes.length <= 1) {
                return;
            }
            for (var i = 0, n; (n = inRowNodes[i]); i++) {
                if (!domClass.contains(n, "dojoxGridNonNormalizedCell")) {
                    currHeights[i] = n.firstChild.offsetHeight;
                    h = Math.max(h, currHeights[i]);
                }
            }
            h = (h >= 0 ? h : 0);
            if ((has("mozilla") || has("ie") > 8) && h) {
                h++;
            }
        }
        for (i = 0; (n = inRowNodes[i]); i++) {
            if (currHeights[i] != h) {
                n.firstChild.style.height = h + "px";
            }
        }
    }, resetHeaderNodeHeight:function () {
        for (var i = 0, v, n; (v = this.views[i]); i++) {
            n = v.headerContentNode.firstChild;
            if (n) {
                n.style.height = "";
            }
        }
    }, renormalizeRow:function (inRowIndex) {
        var rowNodes = [];
        for (var i = 0, v, n; (v = this.views[i]) && (n = v.getRowNode(inRowIndex)); i++) {
            n.firstChild.style.height = "";
            rowNodes.push(n);
        }
        this.normalizeRowNodeHeights(rowNodes);
    }, getViewWidth:function (inIndex) {
        return this.views[inIndex].getWidth() || this.defaultWidth;
    }, measureHeader:function () {
        this.resetHeaderNodeHeight();
        this.forEach(function (inView) {
            inView.headerContentNode.style.height = "";
        });
        var h = 0;
        this.forEach(function (inView) {
            h = Math.max(inView.headerNode.offsetHeight, h);
        });
        return h;
    }, measureContent:function () {
        var h = 0;
        this.forEach(function (inView) {
            h = Math.max(inView.domNode.offsetHeight, h);
        });
        return h;
    }, findClient:function (inAutoWidth) {
        var c = this.grid.elasticView || -1;
        if (c < 0) {
            for (var i = 1, v; (v = this.views[i]); i++) {
                if (v.viewWidth) {
                    for (i = 1; (v = this.views[i]); i++) {
                        if (!v.viewWidth) {
                            c = i;
                            break;
                        }
                    }
                    break;
                }
            }
        }
        if (c < 0) {
            c = Math.floor(this.views.length / 2);
        }
        return c;
    }, arrange:function (l, w) {
        var i, v, vw, len = this.views.length, self = this;
        var c = (w <= 0 ? len : this.findClient());
        var setPosition = function (v, l) {
            var ds = v.domNode.style;
            var hs = v.headerNode.style;
            if (!self.grid.isLeftToRight()) {
                ds.right = l + "px";
                if (has("ff") < 4) {
                    hs.right = l + v.getScrollbarWidth() + "px";
                } else {
                    hs.right = l + "px";
                }
                if (!has("webkit") && hs.width != "auto") {
                    hs.width = parseInt(hs.width, 10) - v.getScrollbarWidth() + "px";
                }
            } else {
                ds.left = l + "px";
                hs.left = l + "px";
            }
            ds.top = 0 + "px";
            hs.top = 0;
        };
        for (i = 0; (v = this.views[i]) && (i < c); i++) {
            vw = this.getViewWidth(i);
            v.setSize(vw, 0);
            setPosition(v, l);
            if (v.headerContentNode && v.headerContentNode.firstChild) {
                vw = v.getColumnsWidth() + v.getScrollbarWidth();
            } else {
                vw = v.domNode.offsetWidth;
            }
            l += vw;
        }
        i++;
        var r = w;
        for (var j = len - 1; (v = this.views[j]) && (i <= j); j--) {
            vw = this.getViewWidth(j);
            v.setSize(vw, 0);
            vw = v.domNode.offsetWidth;
            r -= vw;
            setPosition(v, r);
        }
        if (c < len) {
            v = this.views[c];
            vw = Math.max(1, r - l);
            v.setSize(vw + "px", 0);
            setPosition(v, l);
        }
        return l;
    }, renderRow:function (inRowIndex, inNodes, skipRenorm) {
        var rowNodes = [];
        for (var i = 0, v, n, rowNode; (v = this.views[i]) && (n = inNodes[i]); i++) {
            rowNode = v.renderRow(inRowIndex);
            n.appendChild(rowNode);
            rowNodes.push(rowNode);
        }
        if (!skipRenorm) {
            this.normalizeRowNodeHeights(rowNodes);
        }
    }, rowRemoved:function (inRowIndex) {
        this.onEach("rowRemoved", [inRowIndex]);
    }, updateRow:function (inRowIndex, skipRenorm) {
        for (var i = 0, v; v = this.views[i]; i++) {
            v.updateRow(inRowIndex);
        }
        if (!skipRenorm) {
            this.renormalizeRow(inRowIndex);
        }
    }, updateRowStyles:function (inRowIndex) {
        this.onEach("updateRowStyles", [inRowIndex]);
    }, setScrollTop:function (inTop) {
        var top = inTop;
        for (var i = 0, v; v = this.views[i]; i++) {
            top = v.setScrollTop(inTop);
            if (has("ie") && v.headerNode && v.scrollboxNode) {
                v.headerNode.scrollLeft = v.scrollboxNode.scrollLeft;
            }
        }
        return top;
    }, getFirstScrollingView:function () {
        for (var i = 0, v; (v = this.views[i]); i++) {
            if (v.hasHScrollbar() || v.hasVScrollbar()) {
                return v;
            }
        }
        return null;
    }});
});

