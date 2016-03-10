//>>built

define("dojox/image/LightboxNano", ["dojo/_base/lang", "dojo/_base/declare", "dojo/_base/array", "dojo/_base/fx", "dojo/dom", "dojo/dom-construct", "dojo/dom-geometry", "dojo/dom-style", "dojo/dom-class", "dojo/on", "dojo/query", "dojo/fx"], function (lang, declare, array, baseFx, dom, domConstruct, domGeometry, domStyle, domClass, on, query, fx) {
    var abs = "absolute", vis = "visibility";
    getViewport = function () {
        var scrollRoot = (document.compatMode == "BackCompat") ? document.body : document.documentElement, scroll = domGeometry.docScroll();
        return {w:scrollRoot.clientWidth, h:scrollRoot.clientHeight, l:scroll.x, t:scroll.y};
    };
    return declare("dojox.image.LightboxNano", null, {href:"", duration:500, preloadDelay:5000, constructor:function (p, n) {
        var _this = this, a;
        lang.mixin(_this, p);
        n = _this._node = dom.byId(n);
        if (n) {
            if (!/a/i.test(n.tagName)) {
                a = domConstruct.create("a", {href:_this.href, "class":n.className}, n, "after");
                n.className = "";
                a.appendChild(n);
                n = a;
            }
            domStyle.set(n, "position", "relative");
            domConstruct.create("div", {"class":"nano-enlarge", style:{position:"absolute", display:"none"}}, n);
            dom.setSelectable(n, false);
            _this._onClickEvt = on(n, "click", lang.hitch(_this, "_load"));
        }
        if (_this.href) {
            setTimeout(function () {
                (new Image()).src = _this.href;
                _this._hideLoading();
            }, _this.preloadDelay);
        }
    }, destroy:function () {
        var a = this._connects || [];
        a.push(this._onClickEvt);
        array.forEach(a, function (signal) {
            signal.remove();
        });
        domConstruct.destroy(this._node);
    }, _load:function (e) {
        var _this = this;
        e && e.preventDefault();
        if (!_this._loading) {
            _this._loading = true;
            _this._reset();
            var i = _this._img = domConstruct.create("img", {"class":"nano-image nano-image-hidden"}, document.body), l, ln = _this._loadingNode, n = query("img", _this._node)[0] || _this._node, a = domGeometry.position(n, true), c = domGeometry.getContentBox(n), b = domGeometry.getBorderExtents(n);
            if (ln == null) {
                _this._loadingNode = ln = domConstruct.create("div", {"class":"nano-loading", style:{position:"absolute", display:""}}, _this._node, "after");
                l = domGeometry.getMarginBox(ln);
                domStyle.set(ln, {left:parseInt((c.w - l.w) / 2) + "px", top:parseInt((c.h - l.h) / 2) + "px"});
            }
            c.x = a.x - 10 + b.l;
            c.y = a.y - 10 + b.t;
            _this._start = c;
            _this._connects = [on(i, "load", lang.hitch(_this, "_show"))];
            i.src = _this.href;
        }
    }, _hideLoading:function () {
        if (this._loadingNode) {
            domStyle.set(this._loadingNode, "display", "none");
        }
        this._loadingNode = false;
    }, _show:function () {
        var _this = this, vp = getViewport(), w = _this._img.width, h = _this._img.height, vpw = parseInt((vp.w - 20) * 0.9), vph = parseInt((vp.h - 20) * 0.9), bg = _this._bg = domConstruct.create("div", {"class":"nano-background", style:{opacity:0}}, document.body);
        if (_this._loadingNode) {
            _this._hideLoading();
        }
        domClass.remove(_this._img, "nano-image-hidden");
        domStyle.set(_this._node, vis, "hidden");
        _this._loading = false;
        _this._connects = _this._connects.concat([on(document, "mousedown", lang.hitch(_this, "_hide")), on(document, "keypress", lang.hitch(_this, "_key")), on(window, "resize", lang.hitch(_this, "_sizeBg"))]);
        if (w > vpw) {
            h = h * vpw / w;
            w = vpw;
        }
        if (h > vph) {
            w = w * vph / h;
            h = vph;
        }
        _this._end = {x:(vp.w - 20 - w) / 2 + vp.l, y:(vp.h - 20 - h) / 2 + vp.t, w:w, h:h};
        _this._sizeBg();
        fx.combine([_this._anim(_this._img, _this._coords(_this._start, _this._end)), _this._anim(bg, {opacity:0.5})]).play();
    }, _sizeBg:function () {
        var dd = document.documentElement;
        domStyle.set(this._bg, {top:0, left:0, width:dd.scrollWidth + "px", height:dd.scrollHeight + "px"});
    }, _key:function (e) {
        e.preventDefault();
        this._hide();
    }, _coords:function (s, e) {
        return {left:{start:s.x, end:e.x}, top:{start:s.y, end:e.y}, width:{start:s.w, end:e.w}, height:{start:s.h, end:e.h}};
    }, _hide:function () {
        var _this = this;
        array.forEach(_this._connects, function (signal) {
            signal.remove();
        });
        _this._connects = [];
        fx.combine([_this._anim(_this._img, _this._coords(_this._end, _this._start), "_reset"), _this._anim(_this._bg, {opacity:0})]).play();
    }, _reset:function () {
        domStyle.set(this._node, vis, "visible");
        domConstruct.destroy(this._img);
        domConstruct.destroy(this._bg);
        this._img = this._bg = null;
        this._node.focus();
    }, _anim:function (node, args, onEnd) {
        return baseFx.animateProperty({node:node, duration:this.duration, properties:args, onEnd:onEnd ? lang.hitch(this, onEnd) : null});
    }, show:function (args) {
        args = args || {};
        this.href = args.href || this.href;
        var n = dom.byId(args.origin), vp = getViewport();
        this._node = n || domConstruct.create("div", {style:{position:abs, width:0, hieght:0, left:(vp.l + (vp.w / 2)) + "px", top:(vp.t + (vp.h / 2)) + "px"}}, document.body);
        this._load();
        if (!n) {
            domConstruct.destroy(this._node);
        }
    }});
});

