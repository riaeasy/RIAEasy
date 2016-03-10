//>>built

define("dojox/mobile/_ItemBase", ["dojo/_base/array", "dojo/_base/declare", "dojo/_base/lang", "dojo/_base/window", "dojo/dom-class", "dojo/touch", "dijit/registry", "dijit/_Contained", "dijit/_Container", "dijit/_WidgetBase", "./TransitionEvent", "./iconUtils", "./sniff", "./viewRegistry", "require"], function (array, declare, lang, win, domClass, touch, registry, Contained, Container, WidgetBase, TransitionEvent, iconUtils, has, viewRegistry, BidiItemBase) {
    var _ItemBase = declare(0 ? "dojox.mobile._NonBidiItemBase" : "dojox.mobile._ItemBase", [WidgetBase, Container, Contained], {icon:"", iconPos:"", alt:"", href:"", hrefTarget:"", moveTo:"", scene:"", clickable:false, url:"", urlTarget:"", back:false, transition:"", transitionDir:1, transitionOptions:null, callback:null, label:"", toggle:false, selected:false, tabIndex:"0", _setTabIndexAttr:"", paramsToInherit:"transition,icon", _selStartMethod:"none", _selEndMethod:"none", _delayedSelection:false, _duration:800, _handleClick:true, buildRendering:function () {
        this.inherited(arguments);
        this._isOnLine = this.inheritParams();
    }, startup:function () {
        if (this._started) {
            return;
        }
        if (!this._isOnLine) {
            this.inheritParams();
        }
        this._updateHandles();
        this.inherited(arguments);
    }, inheritParams:function () {
        var parent = this.getParent();
        if (parent) {
            array.forEach(this.paramsToInherit.split(/,/), function (p) {
                if (p.match(/icon/i)) {
                    var base = p + "Base", pos = p + "Pos";
                    if (this[p] && parent[base] && parent[base].charAt(parent[base].length - 1) === "/") {
                        this[p] = parent[base] + this[p];
                    }
                    if (!this[p]) {
                        this[p] = parent[base];
                    }
                    if (!this[pos]) {
                        this[pos] = parent[pos];
                    }
                }
                if (!this[p]) {
                    this[p] = parent[p];
                }
            }, this);
        }
        return !!parent;
    }, _updateHandles:function () {
        if (this._handleClick && this._selStartMethod === "touch") {
            if (!this._onTouchStartHandle) {
                this._onTouchStartHandle = this.connect(this.domNode, touch.press, "_onTouchStart");
            }
        } else {
            if (this._onTouchStartHandle) {
                this.disconnect(this._onTouchStartHandle);
                this._onTouchStartHandle = null;
            }
        }
    }, getTransOpts:function () {
        var opts = this.transitionOptions || {};
        array.forEach(["moveTo", "href", "hrefTarget", "url", "target", "urlTarget", "scene", "transition", "transitionDir"], function (p) {
            opts[p] = opts[p] || this[p];
        }, this);
        return opts;
    }, userClickAction:function () {
    }, defaultClickAction:function (e) {
        this.handleSelection(e);
        if (this.userClickAction(e) === false) {
            return;
        }
        this.makeTransition(e);
    }, handleSelection:function (e) {
        if (this._delayedSelection) {
            this.set("selected", true);
        }
        if (this._onTouchEndHandle) {
            this.disconnect(this._onTouchEndHandle);
            this._onTouchEndHandle = null;
        }
        var p = this.getParent();
        if (this.toggle) {
            this.set("selected", !this._currentSel);
        } else {
            if (p && p.selectOne) {
                this.set("selected", true);
            } else {
                if (this._selEndMethod === "touch") {
                    this.set("selected", false);
                } else {
                    if (this._selEndMethod === "timer") {
                        this.defer(function () {
                            this.set("selected", false);
                        }, this._duration);
                    }
                }
            }
        }
    }, makeTransition:function (e) {
        if (this.back && history) {
            history.back();
            return;
        }
        if (this.href && this.hrefTarget && this.hrefTarget != "_self") {
            win.global.open(this.href, this.hrefTarget || "_blank");
            this._onNewWindowOpened(e);
            return;
        }
        var opts = this.getTransOpts();
        var doTransition = !!(opts.moveTo || opts.href || opts.url || opts.target || opts.scene);
        if (this._prepareForTransition(e, doTransition ? opts : null) === false) {
            return;
        }
        if (doTransition) {
            this.setTransitionPos(e);
            new TransitionEvent(this.domNode, opts, e).dispatch();
        }
    }, _onNewWindowOpened:function () {
    }, _prepareForTransition:function (e, transOpts) {
    }, _onTouchStart:function (e) {
        if (this.getParent().isEditing || this.onTouchStart(e) === false) {
            return;
        }
        var enclosingScrollable = viewRegistry.getEnclosingScrollable(this.domNode);
        if (enclosingScrollable && domClass.contains(enclosingScrollable.containerNode, "mblScrollableScrollTo2")) {
            return;
        }
        if (!this._onTouchEndHandle && this._selStartMethod === "touch") {
            this._onTouchMoveHandle = this.connect(win.body(), touch.move, "_onTouchMove");
            this._onTouchEndHandle = this.connect(win.body(), touch.release, "_onTouchEnd");
        }
        this.touchStartX = e.touches ? e.touches[0].pageX : e.clientX;
        this.touchStartY = e.touches ? e.touches[0].pageY : e.clientY;
        this._currentSel = this.selected;
        if (this._delayedSelection) {
            this._selTimer = this.defer(function () {
                this.set("selected", true);
            }, 100);
        } else {
            this.set("selected", true);
        }
    }, onTouchStart:function () {
    }, _onTouchMove:function (e) {
        var x = e.touches ? e.touches[0].pageX : e.clientX;
        var y = e.touches ? e.touches[0].pageY : e.clientY;
        if (Math.abs(x - this.touchStartX) >= 4 || Math.abs(y - this.touchStartY) >= 4) {
            this.cancel();
            var p = this.getParent();
            if (p && p.selectOne) {
                this._prevSel && this._prevSel.set("selected", true);
            } else {
                this.set("selected", false);
            }
        }
    }, _disconnect:function () {
        this.disconnect(this._onTouchMoveHandle);
        this.disconnect(this._onTouchEndHandle);
        this._onTouchMoveHandle = this._onTouchEndHandle = null;
    }, cancel:function () {
        if (this._selTimer) {
            this._selTimer.remove();
            this._selTimer = null;
        }
        this._disconnect();
    }, _onTouchEnd:function (e) {
        if (!this._selTimer && this._delayedSelection) {
            return;
        }
        this.cancel();
        this._onClick(e);
    }, setTransitionPos:function (e) {
        var w = this;
        while (true) {
            w = w.getParent();
            if (!w || domClass.contains(w.domNode, "mblView")) {
                break;
            }
        }
        if (w) {
            w.clickedPosX = e.clientX;
            w.clickedPosY = e.clientY;
        }
    }, transitionTo:function (moveTo, href, url, scene) {
        var opts = (moveTo && typeof (moveTo) === "object") ? moveTo : {moveTo:moveTo, href:href, url:url, scene:scene, transition:this.transition, transitionDir:this.transitionDir};
        new TransitionEvent(this.domNode, opts).dispatch();
    }, _setIconAttr:function (icon) {
        if (!this._isOnLine) {
            this._pendingIcon = icon;
            return;
        }
        this._set("icon", icon);
        this.iconNode = iconUtils.setIcon(icon, this.iconPos, this.iconNode, this.alt, this.iconParentNode, this.refNode, this.position);
    }, _setLabelAttr:function (text) {
        this._set("label", text);
        this.labelNode.innerHTML = this._cv ? this._cv(text) : text;
    }, _setSelectedAttr:function (selected) {
        if (selected) {
            var p = this.getParent();
            if (p && p.selectOne) {
                var arr = array.filter(p.getChildren(), function (w) {
                    return w.selected;
                });
                array.forEach(arr, function (c) {
                    this._prevSel = c;
                    c.set("selected", false);
                }, this);
            }
        }
        this._set("selected", selected);
    }});
    return 0 ? declare("dojox.mobile._ItemBase", [_ItemBase, BidiItemBase]) : _ItemBase;
});

