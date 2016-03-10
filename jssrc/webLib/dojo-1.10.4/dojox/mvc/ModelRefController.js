//>>built

define("dojox/mvc/ModelRefController", ["dojo/_base/array", "dojo/_base/declare", "dojo/_base/lang", "dojo/Stateful", "./_Controller"], function (array, declare, lang, Stateful, _Controller) {
    return declare("dojox.mvc.ModelRefController", _Controller, {ownProps:null, _refModelProp:"model", _refInModelProp:"model", model:null, postscript:function (params, srcNodeRef) {
        this._relTargetProp = (params || {})._refModelProp || this._refModelProp;
        this.inherited(arguments);
    }, get:function (name) {
        if (!this.hasControllerProperty(name)) {
            var model = this[this._refModelProp];
            return !model ? void 0 : model.get ? model.get(name) : model[name];
        }
        return this.inherited(arguments);
    }, _set:function (name, value) {
        if (!this.hasControllerProperty(name)) {
            var model = this[this._refModelProp];
            model && (model.set ? model.set(name, value) : (model[name] = value));
            return this;
        }
        return this.inherited(arguments);
    }, watch:function (name, callback) {
        if (this.hasControllerProperty(name)) {
            return this.inherited(arguments);
        }
        if (!callback) {
            callback = name;
            name = null;
        }
        var hm = null, hp = null, _self = this;
        function watchPropertiesInModel(model) {
            if (hp) {
                hp.unwatch();
            }
            if (model && lang.isFunction(model.set) && lang.isFunction(model.watch)) {
                hp = model.watch.apply(model, (name ? [name] : []).concat([function (name, old, current) {
                    callback.call(_self, name, old, current);
                }]));
            }
        }
        function reflectChangeInModel(old, current) {
            var props = {};
            if (!name) {
                array.forEach([old, current], function (model) {
                    var list = model && model.get("properties");
                    if (list) {
                        array.forEach(list, function (item) {
                            if (!_self.hasControllerProperty(item)) {
                                props[item] = 1;
                            }
                        });
                    } else {
                        for (var s in model) {
                            if (model.hasOwnProperty(s) && !_self.hasControllerProperty(s)) {
                                props[s] = 1;
                            }
                        }
                    }
                });
            } else {
                props[name] = 1;
            }
            for (var s in props) {
                callback.call(_self, s, !old ? void 0 : old.get ? old.get(s) : old[s], !current ? void 0 : current.get ? current.get(s) : current[s]);
            }
        }
        hm = Stateful.prototype.watch.call(this, this._refModelProp, function (name, old, current) {
            if (old === current) {
                return;
            }
            reflectChangeInModel(old, current);
            watchPropertiesInModel(current);
        });
        watchPropertiesInModel(this.get(this._refModelProp));
        var h = {};
        h.unwatch = h.remove = function () {
            if (hp) {
                hp.unwatch();
                hp = null;
            }
            if (hm) {
                hm.unwatch();
                hm = null;
            }
        };
        return h;
    }, hasControllerProperty:function (name) {
        return name == "_watchCallbacks" || name == this._refModelProp || name == this._refInModelProp || (name in (this.ownProps || {})) || (name in this.constructor.prototype) || /^dojoAttach(Point|Event)$/i.test(name);
    }});
});

