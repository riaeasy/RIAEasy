//>>built

define("dojox/drawing/plugins/drawing/Silverlight", ["dijit", "dojo", "dojox"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.drawing.plugins.drawing.Silverlight");
    dojox.drawing.plugins.drawing.Silverlight = dojox.drawing.util.oo.declare(function (options) {
        if (dojox.gfx.renderer != "silverlight") {
            return;
        }
        this.mouse = options.mouse;
        this.stencils = options.stencils;
        this.anchors = options.anchors;
        this.canvas = options.canvas;
        this.util = options.util;
        dojo.connect(this.stencils, "register", this, function (item) {
            var c1, c2, c3, c4, c5, self = this;
            var conMouse = function () {
                c1 = item.container.connect("onmousedown", function (evt) {
                    evt.superTarget = item;
                    self.mouse.down(evt);
                });
            };
            conMouse();
            c2 = dojo.connect(item, "setTransform", this, function () {
            });
            c3 = dojo.connect(item, "onBeforeRender", function () {
            });
            c4 = dojo.connect(item, "onRender", this, function () {
            });
            c5 = dojo.connect(item, "destroy", this, function () {
                dojo.forEach([c1, c2, c3, c4, c5], dojo.disconnect, dojo);
            });
        });
        dojo.connect(this.anchors, "onAddAnchor", this, function (anchor) {
            var c1 = anchor.shape.connect("onmousedown", this.mouse, function (evt) {
                evt.superTarget = anchor;
                this.down(evt);
            });
            var c2 = dojo.connect(anchor, "disconnectMouse", this, function () {
                dojo.disconnect(c1);
                dojo.disconnect(c2);
            });
        });
        this.mouse._down = function (evt) {
            var dim = this._getXY(evt);
            var x = dim.x - this.origin.x;
            var y = dim.y - this.origin.y;
            x *= this.zoom;
            y *= this.zoom;
            this.origin.startx = x;
            this.origin.starty = y;
            this._lastx = x;
            this._lasty = y;
            this.drawingType = this.util.attr(evt, "drawingType") || "";
            var id = this._getId(evt);
            var obj = {x:x, y:y, id:id};
            console.log(" > > > id:", id, "drawingType:", this.drawingType, "evt:", evt);
            this.onDown(obj);
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
        };
        this.mouse.down = function (evt) {
            clearTimeout(this.__downInv);
            if (this.util.attr(evt, "drawingType") == "surface") {
                this.__downInv = setTimeout(dojo.hitch(this, function () {
                    this._down(evt);
                }), 500);
                return;
            }
            this._down(evt);
        };
        this.mouse._getXY = function (evt) {
            if (evt.pageX) {
                return {x:evt.pageX, y:evt.pageY, cancelBubble:true};
            }
            console.log("EVT", evt);
            for (var nm in evt) {
            }
            console.log("EVTX", evt.x);
            if (evt.x !== undefined) {
                return {x:evt.x + this.origin.x, y:evt.y + this.origin.y};
            } else {
                return {x:evt.pageX, y:evt.pageY};
            }
        };
        this.mouse._getId = function (evt) {
            return this.util.attr(evt, "id");
        };
        this.util.attr = function (elem, prop, value, squelchErrors) {
            if (!elem) {
                return false;
            }
            try {
                var t;
                if (elem.superTarget) {
                    t = elem.superTarget;
                } else {
                    if (elem.superClass) {
                        t = elem.superClass;
                    } else {
                        if (elem.target) {
                            t = elem.target;
                        } else {
                            t = elem;
                        }
                    }
                }
                if (value !== undefined) {
                    elem[prop] = value;
                    return value;
                }
                if (t.tagName) {
                    if (prop == "drawingType" && t.tagName.toLowerCase() == "object") {
                        return "surface";
                    }
                    var r = dojo.attr(t, prop);
                }
                var r = t[prop];
                return r;
            }
            catch (e) {
                if (!squelchErrors) {
                }
                return false;
            }
        };
    }, {});
});

