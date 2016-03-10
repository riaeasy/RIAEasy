//>>built

define("dojox/drawing/ui/dom/Toolbar", ["dojo", "../../util/common"], function (dojo, commonUtil) {
    dojo.deprecated("dojox.drawing.ui.dom.Toolbar", "It may not even make it to the 1.4 release.", 1.4);
    return dojo.declare("dojox.drawing.ui.dom.Toolbar", [], {baseClass:"drawingToolbar", buttonClass:"drawingButton", iconClass:"icon", constructor:function (props, node) {
        dojo.addOnLoad(this, function () {
            this.domNode = dojo.byId(node);
            dojo.addClass(this.domNode, this.baseClass);
            this.parse();
        });
    }, createIcon:function (node, constr) {
        var setup = constr && constr.setup ? constr.setup : {};
        if (setup.iconClass) {
            var icon = setup.iconClass ? setup.iconClass : "iconNone";
            var tip = setup.tooltip ? setup.tooltip : "Tool";
            var iNode = dojo.create("div", {title:tip}, node);
            dojo.addClass(iNode, this.iconClass);
            dojo.addClass(iNode, icon);
            dojo.connect(node, "mouseup", function (evt) {
                dojo.stopEvent(evt);
                dojo.removeClass(node, "active");
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
        }
    }, createTool:function (node) {
        node.innerHTML = "";
        var type = dojo.attr(node, "tool");
        this.toolNodes[type] = node;
        dojo.attr(node, "tabIndex", 1);
        var constr = dojo.getObject(type);
        this.createIcon(node, constr);
        this.drawing.registerTool(type, constr);
        dojo.connect(node, "mouseup", this, function (evt) {
            dojo.stopEvent(evt);
            dojo.removeClass(node, "active");
            this.onClick(type);
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
    }, parse:function () {
        var drawingId = dojo.attr(this.domNode, "drawingId");
        this.drawing = commonUtil.byId(drawingId);
        !this.drawing && console.error("Drawing not found based on 'drawingId' in Toolbar. ");
        this.toolNodes = {};
        var _sel;
        dojo.forEach(this.domNode.childNodes, function (node, i) {
            if (node.nodeType !== 1) {
                return;
            }
            node.className = this.buttonClass;
            var tool = dojo.attr(node, "tool");
            var action = dojo.attr(node, "action");
            var plugin = dojo.attr(node, "plugin");
            if (tool) {
                if (i == 0 || dojo.attr(node, "selected") == "true") {
                    _sel = tool;
                }
                this.createTool(node);
            } else {
                if (plugin) {
                    var p = {name:plugin, options:{}}, opt = dojo.attr(node, "options");
                    if (opt) {
                        p.options = eval("(" + opt + ")");
                    }
                    p.options.node = node;
                    node.innerHTML = "";
                    this.drawing.addPlugin(p);
                    this.createIcon(node, dojo.getObject(dojo.attr(node, "plugin")));
                }
            }
        }, this);
        this.drawing.initPlugins();
        dojo.connect(this.drawing, "setTool", this, "onSetTool");
        this.drawing.setTool(_sel);
    }, onClick:function (type) {
        this.drawing.setTool(type);
    }, onSetTool:function (type) {
        for (var n in this.toolNodes) {
            if (n == type) {
                dojo.addClass(this.toolNodes[type], "selected");
                this.toolNodes[type].blur();
            } else {
                dojo.removeClass(this.toolNodes[n], "selected");
            }
        }
    }});
});

