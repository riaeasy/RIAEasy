//>>built

define("dojox/dtl/_Templated", ["dojo/aspect", "dojo/_base/declare", "./_base", "dijit/_TemplatedMixin", "dojo/dom-construct", "dojo/cache", "dojo/_base/array", "dojo/string", "dojo/parser"], function (aspect, declare, dd, TemplatedMixin, domConstruct, Cache, Array, dString, Parser) {
    return declare("dojox.dtl._Templated", TemplatedMixin, {_dijitTemplateCompat:false, buildRendering:function () {
        var node;
        if (this.domNode && !this._template) {
            return;
        }
        if (!this._template) {
            var t = this.getCachedTemplate(this.templatePath, this.templateString, this._skipNodeCache);
            if (t instanceof dd.Template) {
                this._template = t;
            } else {
                node = t.cloneNode(true);
            }
        }
        if (!node) {
            var context = new dd._Context(this);
            if (!this._created) {
                delete context._getter;
            }
            var nodes = domConstruct.toDom(this._template.render(context));
            if (nodes.nodeType !== 1 && nodes.nodeType !== 3) {
                for (var i = 0, l = nodes.childNodes.length; i < l; ++i) {
                    node = nodes.childNodes[i];
                    if (node.nodeType == 1) {
                        break;
                    }
                }
            } else {
                node = nodes;
            }
        }
        this._attachTemplateNodes(node);
        if (this.widgetsInTemplate) {
            var parser = Parser, qry, attr;
            if (parser._query != "[dojoType]") {
                qry = parser._query;
                attr = parser._attrName;
                parser._query = "[dojoType]";
                parser._attrName = "dojoType";
            }
            var cw = (this._startupWidgets = Parser.parse(node, {noStart:!this._earlyTemplatedStartup, inherited:{dir:this.dir, lang:this.lang}}));
            if (qry) {
                parser._query = qry;
                parser._attrName = attr;
            }
            for (var i = 0; i < cw.length; i++) {
                this._processTemplateNode(cw[i], function (n, p) {
                    return n[p];
                }, function (widget, type, callback) {
                    if (type in widget) {
                        return aspect.after(widget, type, callback, true);
                    } else {
                        return widget.on(type, callback, true);
                    }
                });
            }
        }
        if (this.domNode) {
            domConstruct.place(node, this.domNode, "before");
            this.destroyDescendants();
            domConstruct.destroy(this.domNode);
        }
        this.domNode = node;
        this._fillContent(this.srcNodeRef);
    }, _processTemplateNode:function (baseNode, getAttrFunc, attachFunc) {
        if (this.widgetsInTemplate && (getAttrFunc(baseNode, "dojoType") || getAttrFunc(baseNode, "data-dojo-type"))) {
            return true;
        }
        this.inherited(arguments);
    }, _templateCache:{}, getCachedTemplate:function (templatePath, templateString, alwaysUseString) {
        var tmplts = this._templateCache;
        var key = templateString || templatePath;
        if (tmplts[key]) {
            return tmplts[key];
        }
        templateString = dString.trim(templateString || Cache(templatePath, {sanitize:true}));
        if (this._dijitTemplateCompat && (alwaysUseString || templateString.match(/\$\{([^\}]+)\}/g))) {
            templateString = this._stringRepl(templateString);
        }
        if (alwaysUseString || !templateString.match(/\{[{%]([^\}]+)[%}]\}/g)) {
            return tmplts[key] = domConstruct.toDom(templateString);
        } else {
            return tmplts[key] = new dd.Template(templateString);
        }
    }, render:function () {
        this.buildRendering();
    }, startup:function () {
        Array.forEach(this._startupWidgets, function (w) {
            if (w && !w._started && w.startup) {
                w.startup();
            }
        });
        this.inherited(arguments);
    }});
});

