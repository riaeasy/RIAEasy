//>>built

define("dojox/drawing/plugins/tools/Pan", ["dojo/_base/lang", "../../util/oo", "../_Plugin", "../../manager/_registry"], function (lang, oo, Plugin, registry) {
    var Pan = oo.declare(Plugin, function (options) {
        this.domNode = options.node;
        var _scrollTimeout;
        this.toolbar = options.scope;
        this.connect(this.toolbar, "onToolClick", this, function () {
            this.onSetPan(false);
        });
        this.connect(this.keys, "onKeyUp", this, "onKeyUp");
        this.connect(this.keys, "onKeyDown", this, "onKeyDown");
        this.connect(this.keys, "onArrow", this, "onArrow");
        this.connect(this.anchors, "onAnchorUp", this, "checkBounds");
        this.connect(this.stencils, "register", this, "checkBounds");
        this.connect(this.canvas, "resize", this, "checkBounds");
        this.connect(this.canvas, "setZoom", this, "checkBounds");
        this.connect(this.canvas, "onScroll", this, function () {
            if (this._blockScroll) {
                this._blockScroll = false;
                return;
            }
            _scrollTimeout && clearTimeout(_scrollTimeout);
            _scrollTimeout = setTimeout(lang.hitch(this, "checkBounds"), 200);
        });
        this._mouseHandle = this.mouse.register(this);
    }, {selected:false, keyScroll:false, type:"dojox.drawing.plugins.tools.Pan", onPanUp:function (obj) {
        if (obj.id == this.button.id) {
            this.onSetPan(false);
        }
    }, onKeyUp:function (evt) {
        switch (evt.keyCode) {
          case 32:
            this.onSetPan(false);
            break;
          case 39:
          case 37:
          case 38:
          case 40:
            clearInterval(this._timer);
            break;
        }
    }, onKeyDown:function (evt) {
        if (evt.keyCode == 32) {
            this.onSetPan(true);
        }
    }, interval:20, onArrow:function (evt) {
        if (this._timer) {
            clearInterval(this._timer);
        }
        this._timer = setInterval(lang.hitch(this, function (evt) {
            this.canvas.domNode.parentNode.scrollLeft += evt.x * 10;
            this.canvas.domNode.parentNode.scrollTop += evt.y * 10;
        }, evt), this.interval);
    }, onSetPan:function (bool) {
        if (bool === true || bool === false) {
            this.selected = !bool;
        }
        console.log("ON SET PAN:", this.selected);
        if (this.selected) {
            this.selected = false;
            this.button.deselect();
        } else {
            this.selected = true;
            this.button.select();
        }
        this.mouse.setEventMode(this.selected ? "pan" : "");
    }, onPanDrag:function (obj) {
        var x = obj.x - obj.last.x;
        var y = obj.y - obj.last.y;
        this.canvas.domNode.parentNode.scrollTop -= obj.move.y;
        this.canvas.domNode.parentNode.scrollLeft -= obj.move.x;
        this.canvas.onScroll();
    }, onUp:function (obj) {
        if (obj.withinCanvas) {
            this.keyScroll = true;
        } else {
            this.keyScroll = false;
        }
    }, onStencilUp:function (obj) {
        this.checkBounds();
    }, onStencilDrag:function (obj) {
    }, checkBounds:function () {
        var log = function () {
        };
        var warn = function () {
        };
        var t = Infinity, r = -Infinity, b = -10000, l = 10000, sx = 0, sy = 0, dy = 0, dx = 0, mx = this.stencils.group ? this.stencils.group.getTransform() : {dx:0, dy:0}, sc = this.mouse.scrollOffset(), scY = sc.left ? 10 : 0, scX = sc.top ? 10 : 0, ch = this.canvas.height, cw = this.canvas.width, z = this.canvas.zoom, pch = this.canvas.parentHeight, pcw = this.canvas.parentWidth;
        this.stencils.withSelected(function (m) {
            var o = m.getBounds();
            warn("SEL BOUNDS:", o);
            t = Math.min(o.y1 + mx.dy, t);
            r = Math.max(o.x2 + mx.dx, r);
            b = Math.max(o.y2 + mx.dy, b);
            l = Math.min(o.x1 + mx.dx, l);
        });
        this.stencils.withUnselected(function (m) {
            var o = m.getBounds();
            warn("UN BOUNDS:", o);
            t = Math.min(o.y1, t);
            r = Math.max(o.x2, r);
            b = Math.max(o.y2, b);
            l = Math.min(o.x1, l);
            log("----------- B:", b, o.y2);
        });
        b *= z;
        var xscroll = 0, yscroll = 0;
        log("Bottom test", "b:", b, "z:", z, "ch:", ch, "pch:", pch, "top:", sc.top, "sy:", sy, "mx.dy:", mx.dy);
        if (b > pch || sc.top) {
            log("*bottom scroll*");
            ch = Math.max(b, pch + sc.top);
            sy = sc.top;
            xscroll += this.canvas.getScrollWidth();
        } else {
            if (!sy && ch > pch) {
                log("*bottom remove*");
                ch = pch;
            }
        }
        r *= z;
        if (r > pcw || sc.left) {
            cw = Math.max(r, pcw + sc.left);
            sx = sc.left;
            yscroll += this.canvas.getScrollWidth();
        } else {
            if (!sx && cw > pcw) {
                cw = pcw;
            }
        }
        cw += xscroll * 2;
        ch += yscroll * 2;
        this._blockScroll = true;
        this.stencils.group && this.stencils.group.applyTransform({dx:dx, dy:dy});
        this.stencils.withUnselected(function (m) {
            m.transformPoints({dx:dx, dy:dy});
        });
        this.canvas.setDimensions(cw, ch, sx, sy);
    }});
    Pan.setup = {name:"dojox.drawing.plugins.tools.Pan", tooltip:"Pan Tool", iconClass:"iconPan", button:false};
    lang.setObject("dojox.drawing.plugins.tools.Pan", Pan);
    registry.register(Pan.setup, "plugin");
    return Pan;
});

