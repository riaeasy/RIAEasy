//>>built

define("dojox/gfx/utils", ["dojo/_base/kernel", "dojo/_base/lang", "./_base", "dojo/_base/html", "dojo/_base/array", "dojo/_base/window", "dojo/_base/json", "dojo/_base/Deferred", "dojo/_base/sniff", "require", "dojo/_base/config"], function (kernel, lang, g, html, arr, win, jsonLib, Deferred, has, require, config) {
    var gu = g.utils = {};
    lang.mixin(gu, {forEach:function (object, f, o) {
        o = o || kernel.global;
        f.call(o, object);
        if (object instanceof g.Surface || object instanceof g.Group) {
            arr.forEach(object.children, function (shape) {
                gu.forEach(shape, f, o);
            });
        }
    }, serialize:function (object) {
        var t = {}, v, isSurface = object instanceof g.Surface;
        if (isSurface || object instanceof g.Group) {
            t.children = arr.map(object.children, gu.serialize);
            if (isSurface) {
                return t.children;
            }
        } else {
            t.shape = object.getShape();
        }
        if (object.getTransform) {
            v = object.getTransform();
            if (v) {
                t.transform = v;
            }
        }
        if (object.getStroke) {
            v = object.getStroke();
            if (v) {
                t.stroke = v;
            }
        }
        if (object.getFill) {
            v = object.getFill();
            if (v) {
                t.fill = v;
            }
        }
        if (object.getFont) {
            v = object.getFont();
            if (v) {
                t.font = v;
            }
        }
        return t;
    }, toJson:function (object, prettyPrint) {
        return jsonLib.toJson(gu.serialize(object), prettyPrint);
    }, deserialize:function (parent, object) {
        if (object instanceof Array) {
            return arr.map(object, lang.hitch(null, gu.deserialize, parent));
        }
        var shape = ("shape" in object) ? parent.createShape(object.shape) : parent.createGroup();
        if ("transform" in object) {
            shape.setTransform(object.transform);
        }
        if ("stroke" in object) {
            shape.setStroke(object.stroke);
        }
        if ("fill" in object) {
            shape.setFill(object.fill);
        }
        if ("font" in object) {
            shape.setFont(object.font);
        }
        if ("children" in object) {
            arr.forEach(object.children, lang.hitch(null, gu.deserialize, shape));
        }
        return shape;
    }, fromJson:function (parent, json) {
        return gu.deserialize(parent, jsonLib.fromJson(json));
    }, toSvg:function (surface) {
        var deferred = new Deferred();
        if (g.renderer === "svg") {
            try {
                var svg = gu._cleanSvg(gu._innerXML(surface.rawNode));
                deferred.callback(svg);
            }
            catch (e) {
                deferred.errback(e);
            }
        } else {
            if (!gu._initSvgSerializerDeferred) {
                gu._initSvgSerializer();
            }
            var jsonForm = gu.toJson(surface);
            var serializer = function () {
                try {
                    var sDim = surface.getDimensions();
                    var width = sDim.width;
                    var height = sDim.height;
                    var node = gu._gfxSvgProxy.document.createElement("div");
                    gu._gfxSvgProxy.document.body.appendChild(node);
                    win.withDoc(gu._gfxSvgProxy.document, function () {
                        html.style(node, "width", width);
                        html.style(node, "height", height);
                    }, this);
                    var ts = gu._gfxSvgProxy[dojox._scopeName].gfx.createSurface(node, width, height);
                    var draw = function (surface) {
                        try {
                            gu._gfxSvgProxy[dojox._scopeName].gfx.utils.fromJson(surface, jsonForm);
                            var svg = gu._cleanSvg(node.innerHTML);
                            surface.clear();
                            surface.destroy();
                            gu._gfxSvgProxy.document.body.removeChild(node);
                            deferred.callback(svg);
                        }
                        catch (e) {
                            deferred.errback(e);
                        }
                    };
                    ts.whenLoaded(null, draw);
                }
                catch (ex) {
                    deferred.errback(ex);
                }
            };
            if (gu._initSvgSerializerDeferred.fired > 0) {
                serializer();
            } else {
                gu._initSvgSerializerDeferred.addCallback(serializer);
            }
        }
        return deferred;
    }, _gfxSvgProxy:null, _initSvgSerializerDeferred:null, _svgSerializerInitialized:function () {
        gu._initSvgSerializerDeferred.callback(true);
    }, _initSvgSerializer:function () {
        if (!gu._initSvgSerializerDeferred) {
            gu._initSvgSerializerDeferred = new Deferred();
            var f = win.doc.createElement("iframe");
            html.style(f, {display:"none", position:"absolute", width:"1em", height:"1em", top:"-10000px"});
            var intv;
            if (has("ie")) {
                f.onreadystatechange = function () {
                    if (f.contentWindow.document.readyState == "complete") {
                        f.onreadystatechange = function () {
                        };
                        intv = setInterval(function () {
                            if (f.contentWindow[kernel.scopeMap["dojo"][1]._scopeName] && f.contentWindow[kernel.scopeMap["dojox"][1]._scopeName].gfx && f.contentWindow[kernel.scopeMap["dojox"][1]._scopeName].gfx.utils) {
                                clearInterval(intv);
                                f.contentWindow.parent[kernel.scopeMap["dojox"][1]._scopeName].gfx.utils._gfxSvgProxy = f.contentWindow;
                                f.contentWindow.parent[kernel.scopeMap["dojox"][1]._scopeName].gfx.utils._svgSerializerInitialized();
                            }
                        }, 50);
                    }
                };
            } else {
                f.onload = function () {
                    f.onload = function () {
                    };
                    intv = setInterval(function () {
                        if (f.contentWindow[kernel.scopeMap["dojo"][1]._scopeName] && f.contentWindow[kernel.scopeMap["dojox"][1]._scopeName].gfx && f.contentWindow[kernel.scopeMap["dojox"][1]._scopeName].gfx.utils) {
                            clearInterval(intv);
                            f.contentWindow.parent[kernel.scopeMap["dojox"][1]._scopeName].gfx.utils._gfxSvgProxy = f.contentWindow;
                            f.contentWindow.parent[kernel.scopeMap["dojox"][1]._scopeName].gfx.utils._svgSerializerInitialized();
                        }
                    }, 50);
                };
            }
            var uri = (config["dojoxGfxSvgProxyFrameUrl"] || require.toUrl("dojox/gfx/resources/gfxSvgProxyFrame.html"));
            f.setAttribute("src", uri.toString());
            win.body().appendChild(f);
        }
    }, _innerXML:function (node) {
        if (node.innerXML) {
            return node.innerXML;
        } else {
            if (node.xml) {
                return node.xml;
            } else {
                if (typeof XMLSerializer != "undefined") {
                    return (new XMLSerializer()).serializeToString(node);
                }
            }
        }
        return null;
    }, _cleanSvg:function (svg) {
        if (svg) {
            if (svg.indexOf("xmlns=\"http://www.w3.org/2000/svg\"") == -1) {
                svg = svg.substring(4, svg.length);
                svg = "<svg xmlns=\"http://www.w3.org/2000/svg\"" + svg;
            }
            if (svg.indexOf("xmlns:xlink=\"http://www.w3.org/1999/xlink\"") == -1) {
                svg = svg.substring(4, svg.length);
                svg = "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\"" + svg;
            }
            if (svg.indexOf("xlink:href") === -1) {
                svg = svg.replace(/href\s*=/g, "xlink:href=");
            }
            svg = svg.replace(/<img\b([^>]*)>/gi, "<image $1 />");
            svg = svg.replace(/\bdojoGfx\w*\s*=\s*(['"])\w*\1/g, "");
            svg = svg.replace(/\b__gfxObject__\s*=\s*(['"])\w*\1/g, "");
            svg = svg.replace(/[=]([^"']+?)(\s|>)/g, "=\"$1\"$2");
            svg = svg.replace(/\bstroke-opacity\w*\s*=\s*(['"])undefined\1/g, "");
        }
        return svg;
    }});
    return gu;
});

