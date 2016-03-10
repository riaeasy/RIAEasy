//>>built

define("dojox/mobile/Switch", ["dojo/_base/array", "dojo/_base/connect", "dojo/_base/declare", "dojo/_base/event", "dojo/_base/window", "dojo/dom-class", "dojo/dom-construct", "dojo/dom-style", "dojo/dom-attr", "dojo/touch", "dijit/_Contained", "dijit/_WidgetBase", "./sniff", "./_maskUtils", "./common", "require"], function (array, connect, declare, event, win, domClass, domConstruct, domStyle, domAttr, touch, Contained, WidgetBase, has, maskUtils, dm, BidiSwitch) {
    var Switch = declare(0 ? "dojox.mobile.NonBidiSwitch" : "dojox.mobile.Switch", [WidgetBase, Contained], {value:"on", name:"", leftLabel:"ON", rightLabel:"OFF", shape:"mblSwDefaultShape", tabIndex:"0", _setTabIndexAttr:"", baseClass:"mblSwitch", role:"", buildRendering:function () {
        if (!this.templateString) {
            this.domNode = (this.srcNodeRef && this.srcNodeRef.tagName === "SPAN") ? this.srcNodeRef : domConstruct.create("span");
        }
        if (typeof this.domNode.style.msTouchAction != "undefined") {
            this.domNode.style.msTouchAction = "none";
        }
        this.inherited(arguments);
        if (!this.templateString) {
            var c = (this.srcNodeRef && this.srcNodeRef.className) || this.className || this["class"];
            if ((c = c.match(/mblSw.*Shape\d*/))) {
                this.shape = c;
            }
            domClass.add(this.domNode, this.shape);
            var nameAttr = this.name ? " name=\"" + this.name + "\"" : "";
            this.domNode.innerHTML = "<div class=\"mblSwitchInner\">" + "<div class=\"mblSwitchBg mblSwitchBgLeft\">" + "<div class=\"mblSwitchText mblSwitchTextLeft\"></div>" + "</div>" + "<div class=\"mblSwitchBg mblSwitchBgRight\">" + "<div class=\"mblSwitchText mblSwitchTextRight\"></div>" + "</div>" + "<div class=\"mblSwitchKnob\"></div>" + "<input type=\"hidden\"" + nameAttr + "></div>" + "</div>";
            var n = this.inner = this.domNode.firstChild;
            this.left = n.childNodes[0];
            this.right = n.childNodes[1];
            this.knob = n.childNodes[2];
            this.input = n.childNodes[3];
        }
        domAttr.set(this.domNode, "role", "checkbox");
        domAttr.set(this.domNode, "aria-checked", (this.value === "on") ? "true" : "false");
        this.switchNode = this.domNode;
        if (has("windows-theme")) {
            var rootNode = domConstruct.create("div", {className:"mblSwitchContainer"});
            this.labelNode = domConstruct.create("label", {"class":"mblSwitchLabel", "for":this.id}, rootNode);
            rootNode.appendChild(this.domNode.cloneNode(true));
            this.domNode = rootNode;
            this.focusNode = rootNode.childNodes[1];
            this.labelNode.innerHTML = (this.value == "off") ? this.rightLabel : this.leftLabel;
            this.switchNode = this.domNode.childNodes[1];
            var inner = this.inner = this.domNode.childNodes[1].firstChild;
            this.left = inner.childNodes[0];
            this.right = inner.childNodes[1];
            this.knob = inner.childNodes[2];
            this.input = inner.childNodes[3];
        }
    }, postCreate:function () {
        this.connect(this.switchNode, "onclick", "_onClick");
        this.connect(this.switchNode, "onkeydown", "_onClick");
        this._startHandle = this.connect(this.switchNode, touch.press, "onTouchStart");
        this._initialValue = this.value;
    }, startup:function () {
        if (!this._started) {
            this.resize();
        }
    }, resize:function () {
        if (has("windows-theme")) {
            domStyle.set(this.domNode, "width", "100%");
        } else {
            var value = domStyle.get(this.domNode, "width");
            var outWidth = value + "px";
            var innWidth = (value - domStyle.get(this.knob, "width")) + "px";
            domStyle.set(this.left, "width", outWidth);
            domStyle.set(this.right, this.isLeftToRight() ? {width:outWidth, left:innWidth} : {width:outWidth});
            domStyle.set(this.left.firstChild, "width", innWidth);
            domStyle.set(this.right.firstChild, "width", innWidth);
            domStyle.set(this.knob, "left", innWidth);
            if (this.value == "off") {
                domStyle.set(this.inner, "left", this.isLeftToRight() ? ("-" + innWidth) : 0);
            }
            this._hasMaskImage = false;
            this._createMaskImage();
        }
    }, _changeState:function (state, anim) {
        var on = (state === "on");
        this.left.style.display = "";
        this.right.style.display = "";
        this.inner.style.left = "";
        if (anim) {
            domClass.add(this.switchNode, "mblSwitchAnimation");
        }
        domClass.remove(this.switchNode, on ? "mblSwitchOff" : "mblSwitchOn");
        domClass.add(this.switchNode, on ? "mblSwitchOn" : "mblSwitchOff");
        domAttr.set(this.switchNode, "aria-checked", on ? "true" : "false");
        if (!on && !has("windows-theme")) {
            this.inner.style.left = (this.isLeftToRight() ? (-(domStyle.get(this.domNode, "width") - domStyle.get(this.knob, "width"))) : 0) + "px";
        }
        var _this = this;
        _this.defer(function () {
            _this.left.style.display = on ? "" : "none";
            _this.right.style.display = !on ? "" : "none";
            domClass.remove(_this.switchNode, "mblSwitchAnimation");
        }, anim ? 300 : 0);
    }, _createMaskImage:function () {
        if (this._timer) {
            this._timer.remove();
            delete this._timer;
        }
        if (this._hasMaskImage) {
            return;
        }
        var w = domStyle.get(this.domNode, "width"), h = domStyle.get(this.domNode, "height");
        this._width = (w - domStyle.get(this.knob, "width"));
        this._hasMaskImage = true;
        if (!(has("mask-image"))) {
            return;
        }
        var rDef = domStyle.get(this.left, "borderTopLeftRadius");
        if (rDef == "0px") {
            return;
        }
        var rDefs = rDef.split(" ");
        var rx = parseFloat(rDefs[0]), ry = (rDefs.length == 1) ? rx : parseFloat(rDefs[1]);
        var id = (this.shape + "Mask" + w + h + rx + ry).replace(/\./, "_");
        maskUtils.createRoundMask(this.switchNode, 0, 0, 0, 0, w, h, rx, ry, 1);
    }, _onClick:function (e) {
        if (e && e.type === "keydown" && e.keyCode !== 13) {
            return;
        }
        if (this.onClick(e) === false) {
            return;
        }
        if (this._moved) {
            return;
        }
        this._set("value", this.input.value = (this.value == "on") ? "off" : "on");
        this._changeState(this.value, true);
        this.onStateChanged(this.value);
    }, onClick:function () {
    }, onTouchStart:function (e) {
        this._moved = false;
        this.innerStartX = this.inner.offsetLeft;
        if (!this._conn) {
            this._conn = [this.connect(this.inner, touch.move, "onTouchMove"), this.connect(win.doc, touch.release, "onTouchEnd")];
            if (has("windows-theme")) {
                this._conn.push(this.connect(win.doc, "MSPointerCancel", "onTouchEnd"));
            }
        }
        this.touchStartX = e.touches ? e.touches[0].pageX : e.clientX;
        this.left.style.display = "";
        this.right.style.display = "";
        event.stop(e);
        this._createMaskImage();
    }, onTouchMove:function (e) {
        e.preventDefault();
        var dx;
        if (e.targetTouches) {
            if (e.targetTouches.length != 1) {
                return;
            }
            dx = e.targetTouches[0].clientX - this.touchStartX;
        } else {
            dx = e.clientX - this.touchStartX;
        }
        var pos = this.innerStartX + dx;
        var d = 10;
        if (pos <= -(this._width - d)) {
            pos = -this._width;
        }
        if (pos >= -d) {
            pos = 0;
        }
        this.inner.style.left = pos + "px";
        if (Math.abs(dx) > d) {
            this._moved = true;
        }
    }, onTouchEnd:function (e) {
        array.forEach(this._conn, connect.disconnect);
        this._conn = null;
        if (this.innerStartX == this.inner.offsetLeft) {
            if (1 && has("clicks-prevented")) {
                dm._sendClick(this.inner, e);
            }
            return;
        }
        var newState = (this.inner.offsetLeft < -(this._width / 2)) ? "off" : "on";
        newState = this._newState(newState);
        this._changeState(newState, true);
        if (newState != this.value) {
            this._set("value", this.input.value = newState);
            this.onStateChanged(newState);
        }
    }, _newState:function (newState) {
        return newState;
    }, onStateChanged:function (newState) {
        if (this.labelNode) {
            this.labelNode.innerHTML = newState == "off" ? this.rightLabel : this.leftLabel;
        }
    }, _setValueAttr:function (value) {
        this._changeState(value, false);
        if (this.value != value) {
            this._set("value", this.input.value = value);
            this.onStateChanged(value);
        }
    }, _setLeftLabelAttr:function (label) {
        this.leftLabel = label;
        this.left.firstChild.innerHTML = this._cv ? this._cv(label) : label;
    }, _setRightLabelAttr:function (label) {
        this.rightLabel = label;
        this.right.firstChild.innerHTML = this._cv ? this._cv(label) : label;
    }, reset:function () {
        this.set("value", this._initialValue);
    }});
    return 0 ? declare("dojox.mobile.Switch", [Switch, BidiSwitch]) : Switch;
});

