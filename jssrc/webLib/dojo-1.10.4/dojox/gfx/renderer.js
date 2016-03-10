//>>built

define("dojox/gfx/renderer", ["./_base", "dojo/_base/lang", "dojo/_base/sniff", "dojo/_base/window", "dojo/_base/config"], function (g, lang, has, win, config) {
    var currentRenderer = null;
    has.add("vml", function (global, document, element) {
        element.innerHTML = "<v:shape adj=\"1\"/>";
        var supported = ("adj" in element.firstChild);
        element.innerHTML = "";
        return supported;
    });
    return {load:function (id, require, load) {
        if (currentRenderer && id != "force") {
            load(currentRenderer);
            return;
        }
        var renderer = config.forceGfxRenderer, renderers = !renderer && (lang.isString(config.gfxRenderer) ? config.gfxRenderer : "svg,vml,canvas,silverlight").split(","), silverlightObject, silverlightFlag;
        while (!renderer && renderers.length) {
            switch (renderers.shift()) {
              case "svg":
                if ("SVGAngle" in win.global) {
                    renderer = "svg";
                }
                break;
              case "vml":
                if (has("vml")) {
                    renderer = "vml";
                }
                break;
              case "silverlight":
                try {
                    if (has("ie")) {
                        silverlightObject = new ActiveXObject("AgControl.AgControl");
                        if (silverlightObject && silverlightObject.IsVersionSupported("1.0")) {
                            silverlightFlag = true;
                        }
                    } else {
                        if (navigator.plugins["Silverlight Plug-In"]) {
                            silverlightFlag = true;
                        }
                    }
                }
                catch (e) {
                    silverlightFlag = false;
                }
                finally {
                    silverlightObject = null;
                }
                if (silverlightFlag) {
                    renderer = "silverlight";
                }
                break;
              case "canvas":
                if (win.global.CanvasRenderingContext2D) {
                    renderer = "canvas";
                }
                break;
            }
        }
        if (renderer === "canvas" && config.canvasEvents !== false) {
            renderer = "canvasWithEvents";
        }
        if (config.isDebug) {
            console.log("gfx renderer = " + renderer);
        }
        function loadRenderer() {
            require(["dojox/gfx/" + renderer], function (module) {
                g.renderer = renderer;
                currentRenderer = module;
                load(module);
            });
        }
        if (renderer == "svg" && typeof window.svgweb != "undefined") {
            window.svgweb.addOnLoad(loadRenderer);
        } else {
            loadRenderer();
        }
    }};
});

