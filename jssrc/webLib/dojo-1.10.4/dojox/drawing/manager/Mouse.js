//>>built

define("dojox/drawing/manager/Mouse", ["dojo", "../util/oo", "../defaults"], function (dojo, oo, defaults) {
    return oo.declare(function (options) {
        this.util = options.util;
        this.keys = options.keys;
        this.id = options.id || this.util.uid("mouse");
        this.currentNodeId = "";
        this.registered = {};
    }, {doublClickSpeed:400, _lastx:0, _lasty:0, __reg:0, _downOnCanvas:false, init:function (node) {
        this.container = node;
        this.setCanvas();
        var c;
        var _isDown = false;
        dojo.connect(this.container, "rightclick", this, function (evt) {
            console.warn("RIGHTCLICK");
        });
        dojo.connect(document.body, "mousedown", this, function (evt) {
        });
        dojo.connect(this.container, "mousedown", this, function (evt) {
            this.down(evt);
            if (evt.button != dojo.mouseButtons.RIGHT) {
                _isDown = true;
                c = dojo.connect(document, "mousemove", this, "drag");
            }
        });
        dojo.connect(document, "mouseup", this, function (evt) {
            dojo.disconnect(c);
            _isDown = false;
            this.up(evt);
        });
        dojo.connect(document, "mousemove", this, function (evt) {
            if (!_isDown) {
                this.move(evt);
            }
        });
        dojo.connect(this.keys, "onEsc", this, function (evt) {
            this._dragged = false;
        });
    }, setCanvas:function () {
        var pos = dojo.position(this.container.parentNode);
        this.origin = dojo.clone(pos);
    }, scrollOffset:function () {
        return {top:this.container.parentNode.scrollTop, left:this.container.parentNode.scrollLeft};
    }, resize:function (width, height) {
        if (this.origin) {
            this.origin.w = width;
            this.origin.h = height;
        }
    }, register:function (scope) {
        var handle = scope.id || "reg_" + (this.__reg++);
        if (!this.registered[handle]) {
            this.registered[handle] = scope;
        }
        return handle;
    }, unregister:function (handle) {
        if (!this.registered[handle]) {
            return;
        }
        delete this.registered[handle];
    }, _broadcastEvent:function (strEvt, obj) {
        for (var nm in this.registered) {
            if (this.registered[nm][strEvt]) {
                this.registered[nm][strEvt](obj);
            }
        }
    }, onDown:function (obj) {
        this._broadcastEvent(this.eventName("down"), obj);
    }, onDrag:function (obj) {
        var nm = this.eventName("drag");
        if (this._selected && nm == "onDrag") {
            nm = "onStencilDrag";
        }
        this._broadcastEvent(nm, obj);
    }, onMove:function (obj) {
        this._broadcastEvent("onMove", obj);
    }, overName:function (obj, evt) {
        var nm = obj.id.split(".");
        evt = evt.charAt(0).toUpperCase() + evt.substring(1);
        if (nm[0] == "dojox" && (defaults.clickable || !defaults.clickMode)) {
            return "onStencil" + evt;
        } else {
            return "on" + evt;
        }
    }, onOver:function (obj) {
        this._broadcastEvent(this.overName(obj, "over"), obj);
    }, onOut:function (obj) {
        this._broadcastEvent(this.overName(obj, "out"), obj);
    }, onUp:function (obj) {
        var nm = this.eventName("up");
        if (nm == "onStencilUp") {
            this._selected = true;
        } else {
            if (this._selected && nm == "onUp") {
                nm = "onStencilUp";
                this._selected = false;
            }
        }
        console.info("Up Event:", this.id, nm, "id:", obj.id);
        this._broadcastEvent(nm, obj);
        if (dojox.gfx.renderer == "silverlight") {
            return;
        }
        this._clickTime = new Date().getTime();
        if (this._lastClickTime) {
            if (this._clickTime - this._lastClickTime < this.doublClickSpeed) {
                var dnm = this.eventName("doubleClick");
                console.warn("DOUBLE CLICK", dnm, obj);
                this._broadcastEvent(dnm, obj);
            } else {
            }
        }
        this._lastClickTime = this._clickTime;
    }, zoom:1, setZoom:function (zoom) {
        this.zoom = 1 / zoom;
    }, setEventMode:function (mode) {
        this.mode = mode ? "on" + mode.charAt(0).toUpperCase() + mode.substring(1) : "";
    }, eventName:function (name) {
        name = name.charAt(0).toUpperCase() + name.substring(1);
        if (this.mode) {
            if (this.mode == "onPathEdit") {
                return "on" + name;
            }
            if (this.mode == "onUI") {
            }
            return this.mode + name;
        } else {
            if (!defaults.clickable && defaults.clickMode) {
                return "on" + name;
            }
            var dt = !this.drawingType || this.drawingType == "surface" || this.drawingType == "canvas" ? "" : this.drawingType;
            var t = !dt ? "" : dt.charAt(0).toUpperCase() + dt.substring(1);
            return "on" + t + name;
        }
    }, up:function (evt) {
        this.onUp(this.create(evt));
    }, down:function (evt) {
        this._downOnCanvas = true;
        var sc = this.scrollOffset();
        var dim = this._getXY(evt);
        this._lastpagex = dim.x;
        this._lastpagey = dim.y;
        var o = this.origin;
        var x = dim.x - o.x + sc.left;
        var y = dim.y - o.y + sc.top;
        var withinCanvas = x >= 0 && y >= 0 && x <= o.w && y <= o.h;
        x *= this.zoom;
        y *= this.zoom;
        o.startx = x;
        o.starty = y;
        this._lastx = x;
        this._lasty = y;
        this.drawingType = this.util.attr(evt, "drawingType") || "";
        var id = this._getId(evt);
        if (evt.button == dojo.mouseButtons.RIGHT && this.id == "mse") {
        } else {
            evt.preventDefault();
            dojo.stopEvent(evt);
        }
        this.onDown({mid:this.id, x:x, y:y, pageX:dim.x, pageY:dim.y, withinCanvas:withinCanvas, id:id});
    }, over:function (obj) {
        this.onOver(obj);
    }, out:function (obj) {
        this.onOut(obj);
    }, move:function (evt) {
        var obj = this.create(evt);
        if (this.id == "MUI") {
        }
        if (obj.id != this.currentNodeId) {
            var outObj = {};
            for (var nm in obj) {
                outObj[nm] = obj[nm];
            }
            outObj.id = this.currentNodeId;
            this.currentNodeId && this.out(outObj);
            obj.id && this.over(obj);
            this.currentNodeId = obj.id;
        }
        this.onMove(obj);
    }, drag:function (evt) {
        this.onDrag(this.create(evt, true));
    }, create:function (evt, squelchErrors) {
        var sc = this.scrollOffset();
        var dim = this._getXY(evt);
        var pagex = dim.x;
        var pagey = dim.y;
        var o = this.origin;
        var x = dim.x - o.x + sc.left;
        var y = dim.y - o.y + sc.top;
        var withinCanvas = x >= 0 && y >= 0 && x <= o.w && y <= o.h;
        x *= this.zoom;
        y *= this.zoom;
        var id = withinCanvas ? this._getId(evt, squelchErrors) : "";
        var ret = {mid:this.id, x:x, y:y, pageX:dim.x, pageY:dim.y, page:{x:dim.x, y:dim.y}, orgX:o.x, orgY:o.y, last:{x:this._lastx, y:this._lasty}, start:{x:this.origin.startx, y:this.origin.starty}, move:{x:pagex - this._lastpagex, y:pagey - this._lastpagey}, scroll:sc, id:id, withinCanvas:withinCanvas};
        this._lastx = x;
        this._lasty = y;
        this._lastpagex = pagex;
        this._lastpagey = pagey;
        dojo.stopEvent(evt);
        return ret;
    }, _getId:function (evt, squelchErrors) {
        return this.util.attr(evt, "id", null, squelchErrors);
    }, _getXY:function (evt) {
        return {x:evt.pageX, y:evt.pageY};
    }, setCursor:function (cursor, node) {
        if (!node) {
            dojo.style(this.container, "cursor", cursor);
        } else {
            dojo.style(node, "cursor", cursor);
        }
    }});
});

