//>>built

define("dojox/mvc/_DataBindingMixin", ["dojo/_base/kernel", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/declare", "dojo/Stateful", "dijit/registry"], function (kernel, lang, array, declare, Stateful, registry) {
    kernel.deprecated("dojox.mvc._DataBindingMixin", "Use dojox/mvc/at for data binding.");
    return declare("dojox.mvc._DataBindingMixin", null, {ref:null, isValid:function () {
        var valid = this.get("valid");
        return typeof valid != "undefined" ? valid : this.get("binding") ? this.get("binding").get("valid") : true;
    }, _dbstartup:function () {
        if (this._databound) {
            return;
        }
        this._unwatchArray(this._viewWatchHandles);
        this._viewWatchHandles = [this.watch("ref", function (name, old, current) {
            if (this._databound && old !== current) {
                this._setupBinding();
            }
        }), this.watch("value", function (name, old, current) {
            if (this._databound) {
                var binding = this.get("binding");
                if (binding) {
                    if (!((current && old) && (old.valueOf() === current.valueOf()))) {
                        binding.set("value", current);
                    }
                }
            }
        })];
        this._beingBound = true;
        this._setupBinding();
        delete this._beingBound;
        this._databound = true;
    }, _setupBinding:function (parentBinding) {
        if (!this.ref) {
            return;
        }
        var ref = this.ref, pw, pb, binding;
        if (ref && lang.isFunction(ref.toPlainObject)) {
            binding = ref;
        } else {
            if (/^\s*expr\s*:\s*/.test(ref)) {
                ref = ref.replace(/^\s*expr\s*:\s*/, "");
                binding = lang.getObject(ref);
            } else {
                if (/^\s*rel\s*:\s*/.test(ref)) {
                    ref = ref.replace(/^\s*rel\s*:\s*/, "");
                    parentBinding = parentBinding || this._getParentBindingFromDOM();
                    if (parentBinding) {
                        binding = lang.getObject("" + ref, false, parentBinding);
                    }
                } else {
                    if (/^\s*widget\s*:\s*/.test(ref)) {
                        ref = ref.replace(/^\s*widget\s*:\s*/, "");
                        var tokens = ref.split(".");
                        if (tokens.length == 1) {
                            binding = registry.byId(ref).get("binding");
                        } else {
                            pb = registry.byId(tokens.shift()).get("binding");
                            binding = lang.getObject(tokens.join("."), false, pb);
                        }
                    } else {
                        parentBinding = parentBinding || this._getParentBindingFromDOM();
                        if (parentBinding) {
                            binding = lang.getObject("" + ref, false, parentBinding);
                        } else {
                            try {
                                var b = lang.getObject("" + ref) || {};
                                if (lang.isFunction(b.set) && lang.isFunction(b.watch)) {
                                    binding = b;
                                }
                            }
                            catch (err) {
                                if (ref.indexOf("${") == -1) {
                                    console.warn("dojox/mvc/_DataBindingMixin: '" + this.domNode + "' widget with illegal ref not evaluating to a dojo/Stateful node: '" + ref + "'");
                                }
                            }
                        }
                    }
                }
            }
        }
        if (binding) {
            if (lang.isFunction(binding.toPlainObject)) {
                this.binding = binding;
                if (this[this._relTargetProp || "target"] !== binding) {
                    this.set(this._relTargetProp || "target", binding);
                }
                this._updateBinding("binding", null, binding);
            } else {
                console.warn("dojox/mvc/_DataBindingMixin: '" + this.domNode + "' widget with illegal ref not evaluating to a dojo/Stateful node: '" + ref + "'");
            }
        }
    }, _isEqual:function (one, other) {
        return one === other || isNaN(one) && typeof one === "number" && isNaN(other) && typeof other === "number";
    }, _updateBinding:function (name, old, current) {
        this._unwatchArray(this._modelWatchHandles);
        var binding = this.get("binding");
        if (binding && lang.isFunction(binding.watch)) {
            var pThis = this;
            this._modelWatchHandles = [binding.watch("value", function (name, old, current) {
                if (pThis._isEqual(old, current)) {
                    return;
                }
                if (pThis._isEqual(pThis.get("value"), current)) {
                    return;
                }
                pThis.set("value", current);
            }), binding.watch("valid", function (name, old, current) {
                pThis._updateProperty(name, old, current, true);
                if (current !== pThis.get(name)) {
                    if (pThis.validate && lang.isFunction(pThis.validate)) {
                        pThis.validate();
                    }
                }
            }), binding.watch("required", function (name, old, current) {
                pThis._updateProperty(name, old, current, false, name, current);
            }), binding.watch("readOnly", function (name, old, current) {
                pThis._updateProperty(name, old, current, false, name, current);
            }), binding.watch("relevant", function (name, old, current) {
                pThis._updateProperty(name, old, current, false, "disabled", !current);
            })];
            var val = binding.get("value");
            if (val != null) {
                this.set("value", val);
            }
        }
        this._updateChildBindings();
    }, _updateProperty:function (name, old, current, defaultValue, setPropName, setPropValue) {
        if (old === current) {
            return;
        }
        if (current === null && defaultValue !== undefined) {
            current = defaultValue;
        }
        if (current !== this.get("binding").get(name)) {
            this.get("binding").set(name, current);
        }
        if (setPropName) {
            this.set(setPropName, setPropValue);
        }
    }, _updateChildBindings:function (parentBind) {
        var binding = this.get("binding") || parentBind;
        if (binding && !this._beingBound) {
            array.forEach(registry.findWidgets(this.domNode), function (widget) {
                if (widget.ref && widget._setupBinding) {
                    widget._setupBinding(binding);
                } else {
                    widget._updateChildBindings(binding);
                }
            });
        }
    }, _getParentBindingFromDOM:function () {
        var pn = this.domNode.parentNode, pw, pb;
        while (pn) {
            pw = registry.getEnclosingWidget(pn);
            if (pw) {
                pb = pw.get("binding");
                if (pb && lang.isFunction(pb.toPlainObject)) {
                    break;
                }
            }
            pn = pw ? pw.domNode.parentNode : null;
        }
        return pb;
    }, _unwatchArray:function (watchHandles) {
        array.forEach(watchHandles, function (h) {
            h.unwatch();
        });
    }});
});

