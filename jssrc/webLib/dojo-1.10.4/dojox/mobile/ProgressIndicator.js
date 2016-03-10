//>>built

define("dojox/mobile/ProgressIndicator", ["dojo/_base/config", "dojo/_base/declare", "dojo/_base/lang", "dojo/dom-class", "dojo/dom-construct", "dojo/dom-geometry", "dojo/dom-style", "dojo/has", "dijit/_Contained", "dijit/_WidgetBase", "./_css3", "require"], function (config, declare, lang, domClass, domConstruct, domGeometry, domStyle, has, Contained, WidgetBase, css3, BidiProgressIndicator) {
    var cls = declare("dojox.mobile.ProgressIndicator", [WidgetBase, Contained], {interval:100, size:40, removeOnStop:true, startSpinning:false, center:true, colors:null, baseClass:"mblProgressIndicator", constructor:function () {
        this.colors = [];
        this._bars = [];
    }, buildRendering:function () {
        this.inherited(arguments);
        if (this.center) {
            domClass.add(this.domNode, "mblProgressIndicatorCenter");
        }
        this.containerNode = domConstruct.create("div", {className:"mblProgContainer"}, this.domNode);
        this.spinnerNode = domConstruct.create("div", null, this.containerNode);
        for (var i = 0; i < 12; i++) {
            var div = domConstruct.create("div", {className:"mblProg mblProg" + i}, this.spinnerNode);
            this._bars.push(div);
        }
        this.scale(this.size);
        if (this.startSpinning) {
            this.start();
        }
    }, scale:function (size) {
        var scale = size / 40;
        domStyle.set(this.containerNode, css3.add({}, {transform:"scale(" + scale + ")", transformOrigin:"0 0"}));
        domGeometry.setMarginBox(this.domNode, {w:size, h:size});
        domGeometry.setMarginBox(this.containerNode, {w:size / scale, h:size / scale});
    }, start:function () {
        if (this.imageNode) {
            var img = this.imageNode;
            var l = Math.round((this.containerNode.offsetWidth - img.offsetWidth) / 2);
            var t = Math.round((this.containerNode.offsetHeight - img.offsetHeight) / 2);
            img.style.margin = t + "px " + l + "px";
            return;
        }
        var cntr = 0;
        var _this = this;
        var n = 12;
        this.timer = setInterval(function () {
            cntr--;
            cntr = cntr < 0 ? n - 1 : cntr;
            var c = _this.colors;
            for (var i = 0; i < n; i++) {
                var idx = (cntr + i) % n;
                if (c[idx]) {
                    _this._bars[i].style.backgroundColor = c[idx];
                } else {
                    domClass.replace(_this._bars[i], "mblProg" + idx + "Color", "mblProg" + (idx === n - 1 ? 0 : idx + 1) + "Color");
                }
            }
        }, this.interval);
    }, stop:function () {
        if (this.timer) {
            clearInterval(this.timer);
        }
        this.timer = null;
        if (this.removeOnStop && this.domNode && this.domNode.parentNode) {
            this.domNode.parentNode.removeChild(this.domNode);
        }
    }, setImage:function (file) {
        if (file) {
            this.imageNode = domConstruct.create("img", {src:file}, this.containerNode);
            this.spinnerNode.style.display = "none";
        } else {
            if (this.imageNode) {
                this.containerNode.removeChild(this.imageNode);
                this.imageNode = null;
            }
            this.spinnerNode.style.display = "";
        }
    }, destroy:function () {
        this.inherited(arguments);
        if (this === cls._instance) {
            cls._instance = null;
        }
    }});
    cls = 0 ? declare("dojox.mobile.ProgressIndicator", [cls, BidiProgressIndicator]) : cls;
    cls._instance = null;
    cls.getInstance = function (props) {
        if (!cls._instance) {
            cls._instance = new cls(props);
        }
        return cls._instance;
    };
    return cls;
});

