//>>built

define("dojox/drawing/Drawing", ["dojo", "./defaults", "./manager/_registry", "./manager/keys", "./manager/Mouse", "./manager/Canvas", "./manager/Undo", "./manager/Anchors", "./manager/Stencil", "./manager/StencilUI", "./util/common"], function (dojo, defaults, registry, keys, Mouse, Canvas, Undo, Anchors, Stencil, StencilUI, utilCommon) {
    return dojo.declare("dojox.drawing.Drawing", [], {ready:false, mode:"", width:0, height:0, constructor:function (props, node) {
        var def = dojo.attr(node, "defaults");
        this.defaults = def ? (typeof def === "string" ? dojo.getObject(def) : def) : defaults;
        this.id = node.id || dijit.getUniqueId("dojox_drawing_Drawing");
        registry.register(this, "drawing");
        this.mode = (props.mode || dojo.attr(node, "mode") || "").toLowerCase();
        var box = dojo.contentBox(node);
        this.width = props.width || box.w;
        this.height = props.height || box.h;
        utilCommon.register(this);
        this.mouse = new Mouse({util:utilCommon, keys:keys, id:this.mode == "ui" ? "MUI" : "mse"});
        this.mouse.setEventMode(this.mode);
        this.tools = {};
        this.stencilTypes = {};
        this.stencilTypeMap = {};
        this.srcRefNode = node;
        this.domNode = node;
        if (props.plugins) {
            this.plugins = eval(props.plugins);
        } else {
            this.plugins = [];
        }
        this.widgetId = this.id;
        dojo.attr(this.domNode, "widgetId", this.widgetId);
        if (dijit && dijit.registry) {
            dijit.registry.add(this);
            console.log("using dijit");
        } else {
            dijit.registry = {objs:{}, add:function (obj) {
                this.objs[obj.id] = obj;
            }};
            dijit.byId = function (id) {
                return dijit.registry.objs[id];
            };
            dijit.registry.add(this);
        }
        var stencils = registry.getRegistered("stencil");
        for (var nm in stencils) {
            this.registerTool(stencils[nm].name);
        }
        var tools = registry.getRegistered("tool");
        for (nm in tools) {
            this.registerTool(tools[nm].name);
        }
        var plugs = registry.getRegistered("plugin");
        for (nm in plugs) {
            this.registerTool(plugs[nm].name);
        }
        this._createCanvas();
    }, _createCanvas:function () {
        console.info("drawing create canvas...");
        this.canvas = new Canvas({srcRefNode:this.domNode, util:utilCommon, mouse:this.mouse, width:this.width, height:this.height, callback:dojo.hitch(this, "onSurfaceReady")});
        this.initPlugins();
    }, resize:function (box) {
        box && dojo.style(this.domNode, {width:box.w + "px", height:box.h + "px"});
        if (!this.canvas) {
            this._createCanvas();
        } else {
            if (box) {
                this.canvas.resize(box.w, box.h);
            }
        }
    }, startup:function () {
    }, getShapeProps:function (data, mode) {
        var surface = data.stencilType;
        var ui = this.mode == "ui" || mode == "ui";
        return dojo.mixin({container:ui && !surface ? this.canvas.overlay.createGroup() : this.canvas.surface.createGroup(), util:utilCommon, keys:keys, mouse:this.mouse, drawing:this, drawingType:ui && !surface ? "ui" : "stencil", style:this.defaults.copy()}, data || {});
    }, addPlugin:function (plugin) {
        this.plugins.push(plugin);
        if (this.canvas.surfaceReady) {
            this.initPlugins();
        }
    }, initPlugins:function () {
        if (!this.canvas || !this.canvas.surfaceReady) {
            var c = dojo.connect(this, "onSurfaceReady", this, function () {
                dojo.disconnect(c);
                this.initPlugins();
            });
            return;
        }
        dojo.forEach(this.plugins, function (p, i) {
            var props = dojo.mixin({util:utilCommon, keys:keys, mouse:this.mouse, drawing:this, stencils:this.stencils, anchors:this.anchors, canvas:this.canvas}, p.options || {});
            this.registerTool(p.name, dojo.getObject(p.name));
            try {
                this.plugins[i] = new this.tools[p.name](props);
            }
            catch (e) {
                console.error("Failed to initilaize plugin:\t" + p.name + ". Did you require it?");
            }
        }, this);
        this.plugins = [];
        this.mouse.setCanvas();
    }, onSurfaceReady:function () {
        this.ready = true;
        this.mouse.init(this.canvas.domNode);
        this.undo = new Undo({keys:keys});
        this.anchors = new Anchors({drawing:this, mouse:this.mouse, undo:this.undo, util:utilCommon});
        if (this.mode == "ui") {
            this.uiStencils = new StencilUI({canvas:this.canvas, surface:this.canvas.surface, mouse:this.mouse, keys:keys});
        } else {
            this.stencils = new Stencil({canvas:this.canvas, surface:this.canvas.surface, mouse:this.mouse, undo:this.undo, keys:keys, anchors:this.anchors});
            this.uiStencils = new StencilUI({canvas:this.canvas, surface:this.canvas.surface, mouse:this.mouse, keys:keys});
        }
        if (dojox.gfx.renderer == "silverlight") {
            try {
                new dojox.drawing.plugins.drawing.Silverlight({util:utilCommon, mouse:this.mouse, stencils:this.stencils, anchors:this.anchors, canvas:this.canvas});
            }
            catch (e) {
                throw new Error("Attempted to install the Silverlight plugin, but it was not found.");
            }
        }
        dojo.forEach(this.plugins, function (p) {
            p.onSurfaceReady && p.onSurfaceReady();
        });
    }, addUI:function (type, options) {
        if (!this.ready) {
            var c = dojo.connect(this, "onSurfaceReady", this, function () {
                dojo.disconnect(c);
                this.addUI(type, options);
            });
            return false;
        }
        if (options && !options.data && !options.points) {
            options = {data:options};
        }
        if (!this.stencilTypes[type]) {
            if (type != "tooltip") {
                console.warn("Not registered:", type);
            }
            return null;
        }
        var s = this.uiStencils.register(new this.stencilTypes[type](this.getShapeProps(options, "ui")));
        return s;
    }, addStencil:function (type, options) {
        if (!this.ready) {
            var c = dojo.connect(this, "onSurfaceReady", this, function () {
                dojo.disconnect(c);
                this.addStencil(type, options);
            });
            return false;
        }
        if (options && !options.data && !options.points) {
            options = {data:options};
        }
        var s = this.stencils.register(new this.stencilTypes[type](this.getShapeProps(options)));
        this.currentStencil && this.currentStencil.moveToFront();
        return s;
    }, removeStencil:function (stencil) {
        this.stencils.unregister(stencil);
        stencil.destroy();
    }, removeAll:function () {
        this.stencils.removeAll();
    }, selectAll:function () {
        this.stencils.selectAll();
    }, toSelected:function (func) {
        this.stencils.toSelected.apply(this.stencils, arguments);
    }, exporter:function () {
        console.log("this.stencils", this.stencils);
        return this.stencils.exporter();
    }, importer:function (objects) {
        dojo.forEach(objects, function (m) {
            this.addStencil(m.type, m);
        }, this);
    }, changeDefaults:function (newStyle, value) {
        if (value != undefined && value) {
            for (var nm in newStyle) {
                this.defaults[nm] = newStyle[nm];
            }
        } else {
            for (var nm in newStyle) {
                for (var n in newStyle[nm]) {
                    this.defaults[nm][n] = newStyle[nm][n];
                }
            }
        }
        if (this.currentStencil != undefined && (!this.currentStencil.created || this.defaults.clickMode)) {
            this.unSetTool();
            this.setTool(this.currentType);
        }
    }, onRenderStencil:function (stencil) {
        this.stencils.register(stencil);
        this.unSetTool();
        if (!this.defaults.clickMode) {
            this.setTool(this.currentType);
        } else {
            this.defaults.clickable = true;
        }
    }, onDeleteStencil:function (stencil) {
        this.stencils.unregister(stencil);
    }, registerTool:function (type) {
        if (this.tools[type]) {
            return;
        }
        var constr = dojo.getObject(type);
        this.tools[type] = constr;
        var abbr = utilCommon.abbr(type);
        this.stencilTypes[abbr] = constr;
        this.stencilTypeMap[abbr] = type;
    }, getConstructor:function (abbr) {
        return this.stencilTypes[abbr];
    }, setTool:function (type) {
        if (this.mode == "ui") {
            return;
        }
        if (!this.canvas || !this.canvas.surface) {
            var c = dojo.connect(this, "onSurfaceReady", this, function () {
                dojo.disconnect(c);
                this.setTool(type);
            });
            return;
        }
        if (this.currentStencil) {
            this.unSetTool();
        }
        this.currentType = this.tools[type] ? type : this.stencilTypeMap[type];
        try {
            this.currentStencil = new this.tools[this.currentType]({container:this.canvas.surface.createGroup(), util:utilCommon, mouse:this.mouse, keys:keys});
            console.log("new tool is:", this.currentStencil.id, this.currentStencil);
            if (this.defaults.clickMode) {
                this.defaults.clickable = false;
            }
            this.currentStencil.connect(this.currentStencil, "onRender", this, "onRenderStencil");
            this.currentStencil.connect(this.currentStencil, "destroy", this, "onDeleteStencil");
        }
        catch (e) {
            console.error("dojox.drawing.setTool Error:", e);
            console.error(this.currentType + " is not a constructor: ", this.tools[this.currentType]);
        }
    }, set:function (name, value) {
        console.info("Attempting to set ", name, " to: ", value, ". Set currently not fully supported in Drawing");
    }, get:function (name) {
        return;
    }, unSetTool:function () {
        if (!this.currentStencil.created) {
            this.currentStencil.destroy();
        }
    }});
});

