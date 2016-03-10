//>>built

define("dijit/_WidgetsInTemplateMixin", ["dojo/_base/array", "dojo/aspect", "dojo/_base/declare", "dojo/_base/lang", "dojo/parser"], function (array, aspect, declare, lang, parser) {
    return declare("dijit._WidgetsInTemplateMixin", null, {_earlyTemplatedStartup:false, widgetsInTemplate:true, contextRequire:null, _beforeFillContent:function () {
        if (this.widgetsInTemplate) {
            var node = this.domNode;
            if (this.containerNode && !this.searchContainerNode) {
                this.containerNode.stopParser = true;
            }
            parser.parse(node, {noStart:!this._earlyTemplatedStartup, template:true, inherited:{dir:this.dir, lang:this.lang, textDir:this.textDir}, propsThis:this, contextRequire:this.contextRequire, scope:"dojo"}).then(lang.hitch(this, function (widgets) {
                this._startupWidgets = widgets;
                for (var i = 0; i < widgets.length; i++) {
                    this._processTemplateNode(widgets[i], function (n, p) {
                        return n[p];
                    }, function (widget, type, callback) {
                        if (type in widget) {
                            return widget.connect(widget, type, callback);
                        } else {
                            return widget.on(type, callback, true);
                        }
                    });
                }
                if (this.containerNode && this.containerNode.stopParser) {
                    delete this.containerNode.stopParser;
                }
            }));
            if (!this._startupWidgets) {
                throw new Error(this.declaredClass + ": parser returned unfilled promise (probably waiting for module auto-load), " + "unsupported by _WidgetsInTemplateMixin.   Must pre-load all supporting widgets before instantiation.");
            }
        }
    }, _processTemplateNode:function (baseNode, getAttrFunc, attachFunc) {
        if (getAttrFunc(baseNode, "dojoType") || getAttrFunc(baseNode, "data-dojo-type")) {
            return true;
        }
        return this.inherited(arguments);
    }, startup:function () {
        array.forEach(this._startupWidgets, function (w) {
            if (w && !w._started && w.startup) {
                w.startup();
            }
        });
        this._startupWidgets = null;
        this.inherited(arguments);
    }});
});

