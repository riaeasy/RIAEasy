//>>built

define("dojox/layout/ResizeHandle", ["dojo/_base/kernel", "dojo/_base/lang", "dojo/_base/connect", "dojo/_base/array", "dojo/_base/event", "dojo/_base/fx", "dojo/_base/window", "dojo/fx", "dojo/dom", "dojo/dom-class", "dojo/dom-geometry", "dojo/dom-style", "dojo/_base/declare", "dojo/touch", "dijit/_base/manager", "dijit/_Widget", "dijit/_TemplatedMixin"], function (kernel, lang, connect, arrayUtil, eventUtil, fxBase, windowBase, fxUtil, domUtil, domClass, domGeometry, domStyle, declare, touch, manager, Widget, TemplatedMixin) {
    kernel.experimental("dojox.layout.ResizeHandle");
    var _ResizeHelper = declare("dojox.layout._ResizeHelper", Widget, {show:function () {
        domStyle.set(this.domNode, "display", "");
    }, hide:function () {
        domStyle.set(this.domNode, "display", "none");
    }, resize:function (dim) {
        domGeometry.setMarginBox(this.domNode, dim);
    }});
    var ResizeHandle = declare("dojox.layout.ResizeHandle", [Widget, TemplatedMixin], {targetId:"", targetContainer:null, resizeAxis:"xy", activeResize:false, activeResizeClass:"dojoxResizeHandleClone", animateSizing:true, animateMethod:"chain", animateDuration:225, minHeight:100, minWidth:100, constrainMax:false, maxHeight:0, maxWidth:0, fixedAspect:false, intermediateChanges:false, startTopic:"/dojo/resize/start", endTopic:"/dojo/resize/stop", templateString:"<div dojoAttachPoint=\"resizeHandle\" class=\"dojoxResizeHandle\"><div></div></div>", postCreate:function () {
        this.connect(this.resizeHandle, touch.press, "_beginSizing");
        if (!this.activeResize) {
            this._resizeHelper = manager.byId("dojoxGlobalResizeHelper");
            if (!this._resizeHelper) {
                this._resizeHelper = new _ResizeHelper({id:"dojoxGlobalResizeHelper"}).placeAt(windowBase.body());
                domClass.add(this._resizeHelper.domNode, this.activeResizeClass);
            }
        } else {
            this.animateSizing = false;
        }
        if (!this.minSize) {
            this.minSize = {w:this.minWidth, h:this.minHeight};
        }
        if (this.constrainMax) {
            this.maxSize = {w:this.maxWidth, h:this.maxHeight};
        }
        this._resizeX = this._resizeY = false;
        var addClass = lang.partial(domClass.add, this.resizeHandle);
        switch (this.resizeAxis.toLowerCase()) {
          case "xy":
            this._resizeX = this._resizeY = true;
            addClass("dojoxResizeNW");
            break;
          case "x":
            this._resizeX = true;
            addClass("dojoxResizeW");
            break;
          case "y":
            this._resizeY = true;
            addClass("dojoxResizeN");
            break;
        }
    }, _beginSizing:function (e) {
        if (this._isSizing) {
            return;
        }
        connect.publish(this.startTopic, [this]);
        this.targetWidget = manager.byId(this.targetId);
        this.targetDomNode = this.targetWidget ? this.targetWidget.domNode : domUtil.byId(this.targetId);
        if (this.targetContainer) {
            this.targetDomNode = this.targetContainer;
        }
        if (!this.targetDomNode) {
            return;
        }
        if (!this.activeResize) {
            var c = domGeometry.position(this.targetDomNode, true);
            this._resizeHelper.resize({l:c.x, t:c.y, w:c.w, h:c.h});
            this._resizeHelper.show();
            if (!this.isLeftToRight()) {
                this._resizeHelper.startPosition = {l:c.x, t:c.y};
            }
        }
        this._isSizing = true;
        this.startPoint = {x:e.clientX, y:e.clientY};
        var style = domStyle.getComputedStyle(this.targetDomNode), borderModel = domGeometry.boxModel === "border-model", padborder = borderModel ? {w:0, h:0} : domGeometry.getPadBorderExtents(this.targetDomNode, style), margin = domGeometry.getMarginExtents(this.targetDomNode, style);
        this.startSize = {w:domStyle.get(this.targetDomNode, "width", style), h:domStyle.get(this.targetDomNode, "height", style), pbw:padborder.w, pbh:padborder.h, mw:margin.w, mh:margin.h};
        if (!this.isLeftToRight() && domStyle.get(this.targetDomNode, "position") == "absolute") {
            var p = domGeometry.position(this.targetDomNode, true);
            this.startPosition = {l:p.x, t:p.y};
        }
        this._pconnects = [connect.connect(windowBase.doc, touch.move, this, "_updateSizing"), connect.connect(windowBase.doc, touch.release, this, "_endSizing")];
        eventUtil.stop(e);
    }, _updateSizing:function (e) {
        if (this.activeResize) {
            this._changeSizing(e);
        } else {
            var tmp = this._getNewCoords(e, "border", this._resizeHelper.startPosition);
            if (tmp === false) {
                return;
            }
            this._resizeHelper.resize(tmp);
        }
        e.preventDefault();
    }, _getNewCoords:function (e, box, startPosition) {
        try {
            if (!e.clientX || !e.clientY) {
                return false;
            }
        }
        catch (err) {
            return false;
        }
        this._activeResizeLastEvent = e;
        var dx = (this.isLeftToRight() ? 1 : -1) * (this.startPoint.x - e.clientX), dy = this.startPoint.y - e.clientY, newW = this.startSize.w - (this._resizeX ? dx : 0), newH = this.startSize.h - (this._resizeY ? dy : 0), r = this._checkConstraints(newW, newH);
        startPosition = (startPosition || this.startPosition);
        if (startPosition && this._resizeX) {
            r.l = startPosition.l + dx;
            if (r.w != newW) {
                r.l += (newW - r.w);
            }
            r.t = startPosition.t;
        }
        switch (box) {
          case "margin":
            r.w += this.startSize.mw;
            r.h += this.startSize.mh;
          case "border":
            r.w += this.startSize.pbw;
            r.h += this.startSize.pbh;
            break;
        }
        return r;
    }, _checkConstraints:function (newW, newH) {
        if (this.minSize) {
            var tm = this.minSize;
            if (newW < tm.w) {
                newW = tm.w;
            }
            if (newH < tm.h) {
                newH = tm.h;
            }
        }
        if (this.constrainMax && this.maxSize) {
            var ms = this.maxSize;
            if (newW > ms.w) {
                newW = ms.w;
            }
            if (newH > ms.h) {
                newH = ms.h;
            }
        }
        if (this.fixedAspect) {
            var w = this.startSize.w, h = this.startSize.h, delta = w * newH - h * newW;
            if (delta < 0) {
                newW = newH * w / h;
            } else {
                if (delta > 0) {
                    newH = newW * h / w;
                }
            }
        }
        return {w:newW, h:newH};
    }, _changeSizing:function (e) {
        var isWidget = this.targetWidget && lang.isFunction(this.targetWidget.resize), tmp = this._getNewCoords(e, isWidget && "margin");
        if (tmp === false) {
            return;
        }
        if (isWidget) {
            this.targetWidget.resize(tmp);
        } else {
            if (this.animateSizing) {
                var anim = fxUtil[this.animateMethod]([fxBase.animateProperty({node:this.targetDomNode, properties:{width:{start:this.startSize.w, end:tmp.w}}, duration:this.animateDuration}), fxBase.animateProperty({node:this.targetDomNode, properties:{height:{start:this.startSize.h, end:tmp.h}}, duration:this.animateDuration})]);
                anim.play();
            } else {
                domStyle.set(this.targetDomNode, {width:tmp.w + "px", height:tmp.h + "px"});
            }
        }
        if (this.intermediateChanges) {
            this.onResize(e);
        }
    }, _endSizing:function (e) {
        arrayUtil.forEach(this._pconnects, connect.disconnect);
        var pub = lang.partial(connect.publish, this.endTopic, [this]);
        if (!this.activeResize) {
            this._resizeHelper.hide();
            this._changeSizing(e);
            setTimeout(pub, this.animateDuration + 15);
        } else {
            pub();
        }
        this._isSizing = false;
        this.onResize(e);
    }, onResize:function (e) {
    }});
    return ResizeHandle;
});

