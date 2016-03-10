//>>built

define("dojox/drawing/plugins/tools/Zoom", ["dojo/_base/lang", "../../util/oo", "../_Plugin", "../../manager/_registry"], function (lang, oo, Plugin, registry) {
    var zoomInc = Math.pow(2, 0.25), maxZoom = 10, minZoom = 0.1, zoomFactor = 1, dt;
    if (!lang.getObject("dojox.drawing.plugins.tools")) {
        lang.setObject("dojox.drawing.plugins.tools", {});
    }
    dt = dojox.drawing.plugins.tools;
    dt.ZoomIn = oo.declare(Plugin, function (options) {
    }, {type:"dojox.drawing.plugins.tools.ZoomIn", onZoomIn:function () {
        zoomFactor *= zoomInc;
        zoomFactor = Math.min(zoomFactor, maxZoom);
        this.canvas.setZoom(zoomFactor);
        this.mouse.setZoom(zoomFactor);
    }, onClick:function () {
        this.onZoomIn();
    }});
    dt.Zoom100 = oo.declare(Plugin, function (options) {
    }, {type:"dojox.drawing.plugins.tools.Zoom100", onZoom100:function () {
        zoomFactor = 1;
        this.canvas.setZoom(zoomFactor);
        this.mouse.setZoom(zoomFactor);
    }, onClick:function () {
        this.onZoom100();
    }});
    dt.ZoomOut = oo.declare(Plugin, function (options) {
    }, {type:"dojox.drawing.plugins.tools.ZoomOut", onZoomOut:function () {
        zoomFactor /= zoomInc;
        zoomFactor = Math.max(zoomFactor, minZoom);
        this.canvas.setZoom(zoomFactor);
        this.mouse.setZoom(zoomFactor);
    }, onClick:function () {
        this.onZoomOut();
    }});
    dt.ZoomIn.setup = {name:"dojox.drawing.plugins.tools.ZoomIn", tooltip:"Zoom In"};
    registry.register(dt.ZoomIn.setup, "plugin");
    dt.Zoom100.setup = {name:"dojox.drawing.plugins.tools.Zoom100", tooltip:"Zoom to 100%"};
    registry.register(dt.Zoom100.setup, "plugin");
    dt.ZoomOut.setup = {name:"dojox.drawing.plugins.tools.ZoomOut", tooltip:"Zoom In"};
    registry.register(dt.ZoomOut.setup, "plugin");
    return dt;
});

