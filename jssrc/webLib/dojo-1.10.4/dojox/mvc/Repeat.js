//>>built

define("dojox/mvc/Repeat", ["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/sniff", "dojo/_base/window", "dojo/dom", "dojo/dom-construct", "dojo/_base/array", "dojo/query", "dojo/when", "dijit/registry", "./_Container"], function (declare, lang, has, win, dom, domconstruct, array, query, when, registry, _Container) {
    return declare("dojox.mvc.Repeat", _Container, {index:0, useParent:"", removeRepeatNode:false, children:null, _relTargetProp:"children", startup:function () {
        if (this.removeRepeatNode) {
            var parent = null;
            if (lang.isFunction(this.getParent)) {
                if (this.getParent()) {
                    this.select = this.getParent().select;
                    this.onCheckStateChanged = this.getParent().onCheckStateChanged;
                }
            }
        }
        this.inherited(arguments);
        this._setChildrenAttr(this.children);
    }, postscript:function (params, srcNodeRef) {
        if (this.useParent && dom.byId(this.useParent)) {
            this.srcNodeRef = dom.byId(this.useParent);
        } else {
            this.srcNodeRef = dom.byId(srcNodeRef);
        }
        if (this.srcNodeRef) {
            var prop = this._attachTemplateNodes ? "inlineTemplateString" : "templateString";
            if (this[prop] == "") {
                this[prop] = this.srcNodeRef.innerHTML;
            }
            try {
                this.srcNodeRef.innerHTML = "";
            }
            catch (e) {
                while (this.srcNodeRef.firstChild) {
                    this.srcNodeRef.removeChild(this.srcNodeRef.firstChild);
                }
            }
        }
        this.inherited(arguments);
    }, _setChildrenAttr:function (value) {
        var children = this.children;
        this._set("children", value);
        if (this.binding != value) {
            this.set("ref", value);
        }
        if (this._started && (!this._builtOnce || children != value)) {
            this._builtOnce = true;
            this._buildContained(value);
        }
    }, _buildContained:function (children) {
        if (!children) {
            return;
        }
        if (this.useParent && dom.byId(this.useParent)) {
            this.srcNodeRef = dom.byId(this.useParent);
        }
        this._destroyBody();
        this._updateAddRemoveWatch(children);
        var insert = [], prop = this._attachTemplateNodes ? "inlineTemplateString" : "templateString";
        for (this.index = 0; lang.isFunction(children.get) ? children.get(this.index) : children[this.index]; this.index++) {
            insert.push(this._exprRepl(this[prop]));
        }
        var repeatNode = this.containerNode || this.srcNodeRef || this.domNode;
        if (has("ie") && /^(table|tbody)$/i.test(repeatNode.tagName)) {
            var div = win.doc.createElement("div");
            div.innerHTML = "<table><tbody>" + insert.join("") + "</tbody></table>";
            for (var tbody = div.getElementsByTagName("tbody")[0]; tbody.firstChild; ) {
                repeatNode.appendChild(tbody.firstChild);
            }
        } else {
            if (has("ie") && /^td$/i.test(repeatNode.tagName)) {
                var div = win.doc.createElement("div");
                div.innerHTML = "<table><tbody><tr>" + insert.join("") + "</tr></tbody></table>";
                for (var tr = div.getElementsByTagName("tr")[0]; tr.firstChild; ) {
                    repeatNode.appendChild(tr.firstChild);
                }
            } else {
                repeatNode.innerHTML = insert.join("");
            }
        }
        this.srcNodeRef = repeatNode;
        var _self = this;
        when(this._createBody(), function () {
            if (!_self.removeRepeatNode) {
                return;
            }
            var repeatnode = _self.domNode;
            if (!_self.savedParentId && _self.domNode.parentNode && _self.domNode.parentNode.id) {
                _self.savedParentId = _self.domNode.parentNode.id;
            }
            var repeatParent = dom.byId(_self.savedParentId);
            if (repeatnode && repeatnode.children) {
                var t3 = registry.findWidgets(repeatnode);
                var parentcnt = t3.length;
                for (var j = parentcnt; j > 0; j--) {
                    if (t3[j - 1].declaredClass == "dojox.mvc.Group") {
                        var cnt = repeatnode.children[j - 1].children.length;
                        var selForList = registry.byId(repeatParent.id).select;
                        for (var i = cnt; i > 0; i--) {
                            registry.byId(repeatnode.children[j - 1].id).select = selForList;
                            domconstruct.place(repeatnode.children[j - 1].removeChild(repeatnode.children[j - 1].children[i - 1]), repeatParent, "first");
                        }
                    } else {
                        domconstruct.place(repeatnode.removeChild(repeatnode.children[j - 1]), repeatParent, "first");
                    }
                }
                domconstruct.destroy(repeatnode);
            }
        });
    }, _updateAddRemoveWatch:function (children) {
        if (this._addRemoveWatch) {
            this._addRemoveWatch.unwatch();
        }
        var pThis = this;
        this._addRemoveWatch = lang.isFunction(children.watchElements) && children.watchElements(function (idx, removals, adds) {
            if (!removals || !adds || removals.length || adds.length) {
                pThis._buildContained(pThis.children);
            }
        });
    }});
});

