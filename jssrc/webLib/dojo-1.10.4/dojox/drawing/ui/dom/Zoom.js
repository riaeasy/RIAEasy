//>>built

define("dojox/drawing/ui/dom/Zoom", ["dojo", "../../util/oo", "../../plugins/_Plugin"], function (dojo, oo, Plugin) {
    var Zoom = oo.declare(Plugin, function (options) {
        var cls = options.node.className;
        var txt = options.node.innerHTML;
        this.domNode = dojo.create("div", {id:"btnZoom", "class":"toolCombo"}, options.node, "replace");
        this.makeButton("ZoomIn", this.topClass);
        this.makeButton("Zoom100", this.midClass);
        this.makeButton("ZoomOut", this.botClass);
    }, {type:"dojox.drawing.ui.dom.Zoom", zoomInc:0.1, maxZoom:10, minZoom:0.1, zoomFactor:1, baseClass:"drawingButton", topClass:"toolComboTop", midClass:"toolComboMid", botClass:"toolComboBot", makeButton:function (name, cls) {
        var node = dojo.create("div", {id:"btn" + name, "class":this.baseClass + " " + cls, innerHTML:"<div title=\"Zoom In\" class=\"icon icon" + name + "\"></div>"}, this.domNode);
        dojo.connect(document, "mouseup", function (evt) {
            dojo.stopEvent(evt);
            dojo.removeClass(node, "active");
        });
        dojo.connect(node, "mouseup", this, function (evt) {
            dojo.stopEvent(evt);
            dojo.removeClass(node, "active");
            this["on" + name]();
        });
        dojo.connect(node, "mouseover", function (evt) {
            dojo.stopEvent(evt);
            dojo.addClass(node, "hover");
        });
        dojo.connect(node, "mousedown", this, function (evt) {
            dojo.stopEvent(evt);
            dojo.addClass(node, "active");
        });
        dojo.connect(node, "mouseout", this, function (evt) {
            dojo.stopEvent(evt);
            dojo.removeClass(node, "hover");
        });
    }, onZoomIn:function (evt) {
        this.zoomFactor += this.zoomInc;
        this.zoomFactor = Math.min(this.zoomFactor, this.maxZoom);
        this.canvas.setZoom(this.zoomFactor);
        this.mouse.setZoom(this.zoomFactor);
    }, onZoom100:function (evt) {
        this.zoomFactor = 1;
        this.canvas.setZoom(this.zoomFactor);
        this.mouse.setZoom(this.zoomFactor);
    }, onZoomOut:function (evt) {
        this.zoomFactor -= this.zoomInc;
        this.zoomFactor = Math.max(this.zoomFactor, this.minZoom);
        this.canvas.setZoom(this.zoomFactor);
        this.mouse.setZoom(this.zoomFactor);
    }});
    dojo.setObject("dojox.drawing.ui.dom.Zoom", Zoom);
    return Zoom;
});

