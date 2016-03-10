//>>built

define("dojox/gauges/_Indicator", ["dojo/_base/lang", "dojo/_base/declare", "dojo/_base/fx", "dojo/_base/html", "dojo/_base/connect", "dijit/_Widget", "dojo/dom-construct", "dojo/dom-class"], function (lang, declare, fx, html, connect, Widget, dom, domClass) {
    return declare("dojox.gauges._Indicator", [Widget], {value:0, type:"", color:"black", strokeColor:"", label:"", font:{family:"sans-serif", size:"12px"}, length:0, width:0, offset:0, hover:"", front:false, easing:fx._defaultEasing, duration:1000, hideValue:false, noChange:false, interactionMode:"indicator", _gauge:null, title:"", startup:function () {
        if (this.onDragMove) {
            this.onDragMove = lang.hitch(this.onDragMove);
        }
        if (this.strokeColor === "") {
            this.strokeColor = undefined;
        }
    }, postCreate:function () {
        if (this.title === "") {
            html.style(this.domNode, "display", "none");
        }
        if (lang.isString(this.easing)) {
            this.easing = lang.getObject(this.easing);
        }
    }, buildRendering:function () {
        var n = this.domNode = this.srcNodeRef ? this.srcNodeRef : dom.create("div");
        domClass.add(n, "dojoxGaugeIndicatorDiv");
        var title = dom.create("label");
        if (this.title) {
            title.innerHTML = this.title + ":";
        }
        dom.place(title, n);
        this.valueNode = dom.create("input", {className:"dojoxGaugeIndicatorInput", size:5, value:this.value});
        dom.place(this.valueNode, n);
        connect.connect(this.valueNode, "onchange", this, this._update);
    }, _update:function () {
        this._updateValue(true);
    }, _updateValue:function (animate) {
        var value = this.valueNode.value;
        if (value === "") {
            this.value = null;
        } else {
            this.value = Number(value);
            this.hover = this.title + ": " + value;
        }
        if (this._gauge) {
            this.draw(this._gauge._indicatorsGroup, animate || animate == undefined ? false : true);
            this.valueNode.value = this.value;
            if ((this.title == "Target" || this.front) && this._gauge.moveIndicator) {
                this._gauge.moveIndicatorToFront(this);
            }
            this.valueChanged();
        }
    }, valueChanged:function () {
    }, update:function (value, animate) {
        if (!this.noChange) {
            this.valueNode.value = value;
            this._updateValue(animate);
        }
    }, handleMouseOver:function (e) {
        this._gauge._handleMouseOverIndicator(this, e);
    }, handleMouseOut:function (e) {
        this._gauge._handleMouseOutIndicator(this, e);
        this._gauge.gaugeContent.style.cursor = "";
    }, handleMouseDown:function (e) {
        this._gauge._handleMouseDownIndicator(this, e);
    }, handleTouchStart:function (e) {
        this._gauge.handleTouchStartIndicator(this, e);
    }, onDragMove:function () {
        this.value = Math.floor(this.value);
        this.valueNode.value = this.value;
        this.hover = this.title + ": " + this.value;
    }, draw:function (dontAnimate) {
    }, remove:function () {
        if (this.shape) {
            this.shape.parent.remove(this.shape);
        }
        this.shape = null;
        if (this.text) {
            this.text.parent.remove(this.text);
        }
        this.text = null;
    }});
});

