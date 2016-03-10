//>>built

define("dojox/mvc/WidgetList", ["require", "dojo/_base/array", "dojo/_base/lang", "dojo/_base/declare", "dijit/_Container", "dijit/_WidgetBase", "./Templated"], function (require, array, lang, declare, _Container, _WidgetBase, Templated) {
    var childTypeAttr = "data-mvc-child-type", childMixinsAttr = "data-mvc-child-mixins", childParamsAttr = "data-mvc-child-props", childBindingsAttr = "data-mvc-child-bindings", undef;
    function evalParams(params) {
        return eval("({" + params + "})");
    }
    function unwatchElements(w) {
        for (var h = null; h = (w._handles || []).pop(); ) {
            h.unwatch();
        }
    }
    function flatten(a) {
        var flattened = [];
        array.forEach(a, function (item) {
            [].push.apply(flattened, item);
        });
        return flattened;
    }
    function loadModules(items, callback) {
        if (this.childClz) {
            callback(this.childClz);
        } else {
            if (this.childType) {
                var typesForItems = !lang.isFunction(this.childType) && !lang.isFunction(this.childMixins) ? [[this.childType].concat(this.childMixins && this.childMixins.split(",") || [])] : array.map(items, function (item) {
                    var type = lang.isFunction(this.childType) ? this.childType.call(item, this) : this.childType, mixins = lang.isFunction(this.childMixins) ? this.childMixins.call(item, this) : this.childMixins;
                    return type ? [type].concat(lang.isArray(mixins) ? mixins : mixins ? mixins.split(",") : []) : ["dojox/mvc/Templated"];
                }, this);
                require(array.filter(array.map(flatten(typesForItems), function (type) {
                    return lang.getObject(type) ? undef : type;
                }), function (type) {
                    return type !== undef;
                }), function () {
                    callback.apply(this, array.map(typesForItems, function (types) {
                        var clzList = array.map(types, function (type) {
                            return lang.getObject(type) || require(type);
                        });
                        return clzList.length > 1 ? declare(clzList, {}) : clzList[0];
                    }));
                });
            } else {
                callback(Templated);
            }
        }
    }
    var WidgetList = declare("dojox.mvc.WidgetList", [_WidgetBase, _Container], {childClz:null, childType:"", childMixins:"", childParams:null, childBindings:null, children:null, partialRebuild:false, _relTargetProp:"children", postMixInProperties:function () {
        this.inherited(arguments);
        if (this[childTypeAttr]) {
            this.childType = this[childTypeAttr];
        }
        if (this[childMixinsAttr]) {
            this.childMixins = this[childMixinsAttr];
        }
    }, startup:function () {
        this.inherited(arguments);
        this._setChildrenAttr(this.children);
    }, _setChildrenAttr:function (value) {
        var children = this.children;
        this._set("children", value);
        if (this._started && (!this._builtOnce || children != value)) {
            this._builtOnce = true;
            this._buildChildren(value);
            if (lang.isArray(value)) {
                var _self = this;
                value.watch !== {}.watch && (this._handles = this._handles || []).push(value.watch(function (name, old, current) {
                    if (!isNaN(name)) {
                        var w = _self.getChildren()[name - 0];
                        w && w.set(w._relTargetProp || "target", current);
                    }
                }));
            }
        }
    }, _buildChildren:function (children) {
        unwatchElements(this);
        for (var cw = this.getChildren(), w = null; w = cw.pop(); ) {
            this.removeChild(w);
            w.destroy();
        }
        if (!lang.isArray(children)) {
            return;
        }
        var _self = this, seq = this._buildChildrenSeq = (this._buildChildrenSeq || 0) + 1, initial = {idx:0, removals:[], adds:[].concat(children)}, changes = [initial];
        function loadedModule(change) {
            if (this._beingDestroyed || this._buildChildrenSeq > seq) {
                return;
            }
            var list = [].slice.call(arguments, 1);
            change.clz = lang.isFunction(this.childType) || lang.isFunction(this.childMixins) ? list : list[0];
            for (var item = null; item = changes.shift(); ) {
                if (!item.clz) {
                    changes.unshift(item);
                    break;
                }
                for (var i = 0, l = (item.removals || []).length; i < l; ++i) {
                    this.removeChild(item.idx);
                }
                array.forEach(array.map(item.adds, function (child, idx) {
                    var params = {ownerDocument:this.ownerDocument, parent:this, indexAtStartup:item.idx + idx}, childClz = lang.isArray(item.clz) ? item.clz[idx] : item.clz;
                    params[(lang.isFunction(this.childParams) && this.childParams.call(params, this) || this.childParams || this[childParamsAttr] && evalParams.call(params, this[childParamsAttr]) || {})._relTargetProp || childClz.prototype._relTargetProp || "target"] = child;
                    var childParams = this.childParams || this[childParamsAttr] && evalParams.call(params, this[childParamsAttr]), childBindings = this.childBindings || this[childBindingsAttr] && evalParams.call(params, this[childBindingsAttr]);
                    if (this.templateString && !params.templateString && !childClz.prototype.templateString) {
                        params.templateString = this.templateString;
                    }
                    if (childBindings && !params.bindings && !childClz.prototype.bindings) {
                        params.bindings = childBindings;
                    }
                    return new childClz(lang.delegate(lang.isFunction(childParams) ? childParams.call(params, this) : childParams, params));
                }, this), function (child, idx) {
                    this.addChild(child, item.idx + idx);
                }, this);
            }
        }
        lang.isFunction(children.watchElements) && (this._handles = this._handles || []).push(children.watchElements(function (idx, removals, adds) {
            if (!removals || !adds || !_self.partialRebuild) {
                _self._buildChildren(children);
            } else {
                var change = {idx:idx, removals:removals, adds:adds};
                changes.push(change);
                loadModules.call(_self, adds, lang.hitch(_self, loadedModule, change));
            }
        }));
        loadModules.call(this, children, lang.hitch(this, loadedModule, initial));
    }, destroy:function () {
        unwatchElements(this);
        this.inherited(arguments);
    }});
    WidgetList.prototype[childTypeAttr] = WidgetList.prototype[childMixinsAttr] = WidgetList.prototype[childParamsAttr] = WidgetList.prototype[childBindingsAttr] = "";
    return WidgetList;
});

