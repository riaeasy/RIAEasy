//>>built

define("dojox/mobile/pageTurningUtils", ["dojo/_base/kernel", "dojo/_base/array", "dojo/_base/connect", "dojo/_base/event", "dojo/dom-class", "dojo/dom-construct", "dojo/dom-style", "./_css3"], function (kernel, array, connect, event, domClass, domConstruct, domStyle, css3) {
    kernel.experimental("dojox.mobile.pageTurningUtils");
    return function () {
        this.w = 0;
        this.h = 0;
        this.turnfrom = "top";
        this.page = 1;
        this.dogear = 1;
        this.duration = 2;
        this.alwaysDogeared = false;
        this._styleParams = {};
        this._catalogNode = null;
        this._currentPageNode = null;
        this._transitionEndHandle = null;
        this.init = function (w, h, turnfrom, page, dogear, duration, alwaysDogeared) {
            this.w = w;
            this.h = h;
            this.turnfrom = turnfrom ? turnfrom : this.turnfrom;
            this.page = page ? page : this.page;
            this.dogear = typeof dogear !== "undefined" ? dogear : this.dogear;
            this.duration = typeof duration !== "undefined" ? duration : this.duration;
            this.alwaysDogeared = typeof alwaysDogeared !== "undefined" ? alwaysDogeared : this.alwaysDogeared;
            if (this.turnfrom === "bottom") {
                this.alwaysDogeared = true;
            }
            this._calcStyleParams();
        };
        this._calcStyleParams = function () {
            var tan58 = Math.tan(58 * Math.PI / 180), cos32 = Math.cos(32 * Math.PI / 180), sin32 = Math.sin(32 * Math.PI / 180), tan32 = Math.tan(32 * Math.PI / 180), w = this.w, h = this.h, page = this.page, turnfrom = this.turnfrom, params = this._styleParams;
            var fold = w * tan58, Q = fold, fw = Q * sin32 + Q * cos32 * tan58, fh = fold + w + w / tan58, dw = w * 0.11 * this.dogear, pw = w - dw, base = pw * cos32, cx, cy, dx, dy, fy;
            switch (this.turnfrom) {
              case "top":
                cx = fw - base;
                cy = base * tan58;
                dx = fw - dw;
                dy = cy + pw / tan58 - 7;
                fy = cy / cos32;
                params.init = {page:css3.add({top:-fy + "px", left:(-fw + (page === 2 ? w : 0)) + "px", width:fw + "px", height:fh + "px"}, {transformOrigin:"100% 0%"}), front:css3.add({width:w + "px", height:h + "px"}, {boxShadow:"0 0"}), back:css3.add({width:w + "px", height:h + "px"}, {boxShadow:"0 0"}), shadow:{display:"", left:fw + "px", height:h * 1.5 + "px"}};
                params.turnForward = {page:css3.add({}, {transform:"rotate(0deg)"}), front:css3.add({}, {transform:"translate(" + fw + "px," + fy + "px) rotate(0deg)", transformOrigin:"-110px -18px"}), back:css3.add({}, {transform:"translate(" + (fw - w) + "px," + fy + "px) rotate(0deg)", transformOrigin:"0px 0px"})};
                params.turnBackward = {page:css3.add({}, {transform:"rotate(-32deg)"}), front:css3.add({}, {transform:"translate(" + cx + "px," + cy + "px) rotate(32deg)", transformOrigin:"0px 0px"}), back:css3.add({}, {transform:"translate(" + dx + "px," + dy + "px) rotate(-32deg)", transformOrigin:"0px 0px"})};
                break;
              case "bottom":
                cx = fw - (h * sin32 + w * cos32) - 2;
                cy = fh - (h + w / tan32) * cos32;
                dx = fw;
                dy = fh - w / sin32 - h;
                fy = fh - w / tan32 - h;
                params.init = {page:css3.add({top:(-fy + 50) + "px", left:(-fw + (page === 2 ? w : 0)) + "px", width:fw + "px", height:fh + "px"}, {transformOrigin:"100% 100%"}), front:css3.add({width:w + "px", height:h + "px"}, {boxShadow:"0 0"}), back:css3.add({width:w + "px", height:h + "px"}, {boxShadow:"0 0"}), shadow:{display:"none"}};
                params.turnForward = {page:css3.add({}, {transform:"rotate(0deg)"}), front:css3.add({}, {transform:"translate(" + fw + "px," + fy + "px) rotate(0deg)", transformOrigin:"-220px 35px"}), back:css3.add({}, {transform:"translate(" + (w * 2) + "px," + fy + "px) rotate(0deg)", transformOrigin:"0px 0px"})};
                params.turnBackward = {page:css3.add({}, {transform:"rotate(32deg)"}), front:css3.add({}, {transform:"translate(" + cx + "px," + cy + "px) rotate(-32deg)", transformOrigin:"0px 0px"}), back:css3.add({}, {transform:"translate(" + dx + "px," + dy + "px) rotate(0deg)", transformOrigin:"0px 0px"})};
                break;
              case "left":
                cx = -w;
                cy = pw / tan32 - 2;
                dx = -pw;
                dy = fy = pw / sin32 + dw * sin32;
                params.init = {page:css3.add({top:-cy + "px", left:w + "px", width:fw + "px", height:fh + "px"}, {transformOrigin:"0% 0%"}), front:css3.add({width:w + "px", height:h + "px"}, {boxShadow:"0 0"}), back:css3.add({width:w + "px", height:h + "px"}, {boxShadow:"0 0"}), shadow:{display:"", left:"-4px", height:((page === 2 ? h * 1.5 : h) + 50) + "px"}};
                params.turnForward = {page:css3.add({}, {transform:"rotate(0deg)"}), front:css3.add({}, {transform:"translate(" + cx + "px," + cy + "px) rotate(0deg)", transformOrigin:"160px 68px"}), back:css3.add({}, {transform:"translate(0px," + cy + "px) rotate(0deg)", transformOrigin:"0px 0px"})};
                params.turnBackward = {page:css3.add({}, {transform:"rotate(32deg)"}), front:css3.add({}, {transform:"translate(" + (-dw) + "px," + dy + "px) rotate(-32deg)", transformOrigin:"0px 0px"}), back:css3.add({}, {transform:"translate(" + dx + "px," + dy + "px) rotate(32deg)", transformOrigin:"top right"})};
                break;
            }
            params.init.catalog = {width:(page === 2 ? w * 2 : w) + "px", height:((page === 2 ? h * 1.5 : h) + (turnfrom == "top" ? 0 : 50)) + "px"};
        };
        this.getChildren = function (node) {
            return array.filter(node.childNodes, function (n) {
                return n.nodeType === 1;
            });
        };
        this.getPages = function () {
            return this._catalogNode ? this.getChildren(this._catalogNode) : null;
        };
        this.getCurrentPage = function () {
            return this._currentPageNode;
        };
        this.getIndexOfPage = function (pageNode, pages) {
            if (!pages) {
                pages = this.getPages();
            }
            for (var i = 0; i < pages.length; i++) {
                if (pageNode === pages[i]) {
                    return i;
                }
            }
            return -1;
        };
        this.getNextPage = function (pageNode) {
            for (var n = pageNode.nextSibling; n; n = n.nextSibling) {
                if (n.nodeType === 1) {
                    return n;
                }
            }
            return null;
        };
        this.getPreviousPage = function (pageNode) {
            for (var n = pageNode.previousSibling; n; n = n.previousSibling) {
                if (n.nodeType === 1) {
                    return n;
                }
            }
            return null;
        };
        this.isPageTurned = function (pageNode) {
            return pageNode.style[css3.name("transform")] == "rotate(0deg)";
        };
        this._onPageTurned = function (e) {
            event.stop(e);
            if (domClass.contains(e.target, "mblPageTurningPage")) {
                this.onPageTurned(e.target);
            }
        };
        this.onPageTurned = function () {
        };
        this.initCatalog = function (catalogNode) {
            if (this._catalogNode != catalogNode) {
                if (this._transitionEndHandle) {
                    connect.disconnect(this._transitionEndHandle);
                }
                this._transitionEndHandle = connect.connect(catalogNode, css3.name("transitionEnd"), this, "_onPageTurned");
                this._catalogNode = catalogNode;
            }
            domClass.add(catalogNode, "mblPageTurningCatalog");
            domStyle.set(catalogNode, this._styleParams.init.catalog);
            var pages = this.getPages();
            array.forEach(pages, function (pageNode) {
                this.initPage(pageNode);
            }, this);
            this.resetCatalog();
        };
        this._getBaseZIndex = function () {
            return this._catalogNode.style.zIndex || 0;
        };
        this.resetCatalog = function () {
            var pages = this.getPages(), len = pages.length, base = this._getBaseZIndex();
            for (var i = len - 1; i >= 0; i--) {
                var pageNode = pages[i];
                this.showDogear(pageNode);
                if (this.isPageTurned(pageNode)) {
                    pageNode.style.zIndex = base + len + 1;
                } else {
                    pageNode.style.zIndex = base + len - i;
                    !this.alwaysDogeared && this.hideDogear(pageNode);
                    this._currentPageNode = pageNode;
                }
            }
            if (!this.alwaysDogeared && this._currentPageNode != pages[len - 1]) {
                this.showDogear(this._currentPageNode);
            }
        };
        this.initPage = function (pageNode, dir) {
            var childNodes = this.getChildren(pageNode);
            while (childNodes.length < 3) {
                pageNode.appendChild(domConstruct.create("div", null));
                childNodes = this.getChildren(pageNode);
            }
            var isFirst = !domClass.contains(pageNode, "mblPageTurningPage");
            domClass.add(pageNode, "mblPageTurningPage");
            domClass.add(childNodes[0], "mblPageTurningFront");
            domClass.add(childNodes[1], "mblPageTurningBack");
            domClass.add(childNodes[2], "mblPageTurningShadow");
            var p = this._styleParams.init;
            domStyle.set(pageNode, p.page);
            domStyle.set(childNodes[0], p.front);
            domStyle.set(childNodes[1], p.back);
            p.shadow && domStyle.set(childNodes[2], p.shadow);
            if (!dir) {
                if (isFirst && this._currentPageNode) {
                    var pages = this.getPages();
                    dir = this.getIndexOfPage(pageNode) < this.getIndexOfPage(this._currentPageNode) ? 1 : -1;
                } else {
                    dir = this.isPageTurned(pageNode) ? 1 : -1;
                }
            }
            this._turnPage(pageNode, dir, 0);
        };
        this.turnToNext = function (duration) {
            var nextPage = this.getNextPage(this._currentPageNode);
            if (nextPage) {
                this._turnPage(this._currentPageNode, 1, duration);
                this._currentPageNode = nextPage;
            }
        };
        this.turnToPrev = function (duration) {
            var prevPage = this.getPreviousPage(this._currentPageNode);
            if (prevPage) {
                this._turnPage(prevPage, -1, duration);
                this._currentPageNode = prevPage;
            }
        };
        this.goTo = function (index) {
            var pages = this.getPages();
            if (this._currentPageNode === pages[index] || pages.length <= index) {
                return;
            }
            var goBackward = index < this.getIndexOfPage(this._currentPageNode, pages);
            while (this._currentPageNode !== pages[index]) {
                goBackward ? this.turnToPrev(0) : this.turnToNext(0);
            }
        };
        this._turnPage = function (pageNode, dir, duration) {
            var childNodes = this.getChildren(pageNode), d = ((typeof duration !== "undefined") ? duration : this.duration) + "s", p = (dir === 1) ? this._styleParams.turnForward : this._styleParams.turnBackward;
            p.page[css3.name("transitionDuration")] = d;
            domStyle.set(pageNode, p.page);
            p.front[css3.name("transitionDuration")] = d;
            domStyle.set(childNodes[0], p.front);
            p.back[css3.name("transitionDuration")] = d;
            domStyle.set(childNodes[1], p.back);
            var pages = this.getPages(), nextPage = this.getNextPage(pageNode), len = pages.length, base = this._getBaseZIndex();
            if (dir === 1) {
                pageNode.style.zIndex = base + len + 1;
                if (!this.alwaysDogeared && nextPage && this.getNextPage(nextPage)) {
                    this.showDogear(nextPage);
                }
            } else {
                if (nextPage) {
                    nextPage.style.zIndex = base + len - this.getIndexOfPage(nextPage, pages);
                    !this.alwaysDogeared && this.hideDogear(nextPage);
                }
            }
        };
        this.showDogear = function (pageNode) {
            var childNodes = this.getChildren(pageNode);
            domStyle.set(pageNode, "overflow", "");
            childNodes[1] && domStyle.set(childNodes[1], "display", "");
            childNodes[2] && domStyle.set(childNodes[2], "display", this.turnfrom === "bottom" ? "none" : "");
        };
        this.hideDogear = function (pageNode) {
            if (this.turnfrom === "bottom") {
                return;
            }
            var childNodes = this.getChildren(pageNode);
            domStyle.set(pageNode, "overflow", "visible");
            childNodes[1] && domStyle.set(childNodes[1], "display", "none");
            childNodes[2] && domStyle.set(childNodes[2], "display", "none");
        };
    };
});

