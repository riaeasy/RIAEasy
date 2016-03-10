//>>built

define("dojox/mvc/_Controller", ["dojo/_base/declare", "dojo/_base/lang", "dojo/Stateful", "./_atBindingMixin"], function (declare, lang, Stateful, _atBindingMixin) {
    return declare("dojox.mvc._Controller", [Stateful, _atBindingMixin], {postscript:function (params, srcNodeRef) {
        if (this._applyAttributes) {
            return this.inherited(arguments);
        }
        this._dbpostscript(params, srcNodeRef);
        if (params) {
            this.params = params;
            for (var s in params) {
                this.set(s, params[s]);
            }
        }
        var registry;
        try {
            registry = require("dijit/registry");
            this.id = this.id || (srcNodeRef || {}).id || registry.getUniqueId(this.declaredClass.replace(/\./g, "_"));
            registry.add(this);
        }
        catch (e) {
        }
        if (!srcNodeRef) {
            this.startup();
        } else {
            srcNodeRef.setAttribute("widgetId", this.id);
        }
    }, startup:function () {
        if (!this._applyAttributes) {
            this._startAtWatchHandles();
        }
        this.inherited(arguments);
    }, destroy:function () {
        this._beingDestroyed = true;
        if (!this._applyAttributes) {
            this._stopAtWatchHandles();
        }
        this.inherited(arguments);
        if (!this._applyAttributes) {
            try {
                require("dijit/registry").remove(this.id);
            }
            catch (e) {
            }
        }
        this._destroyed = true;
    }, set:function (name, value) {
        if (typeof name === "object") {
            for (var x in name) {
                if (name.hasOwnProperty(x)) {
                    this.set(x, name[x]);
                }
            }
            return this;
        }
        if (!this._applyAttributes) {
            if ((value || {}).atsignature == "dojox.mvc.at") {
                return this._setAtWatchHandle(name, value);
            } else {
                var setterName = "_set" + name.replace(/^[a-z]/, function (c) {
                    return c.toUpperCase();
                }) + "Attr";
                if (this[setterName]) {
                    this[setterName](value);
                } else {
                    this._set(name, value);
                }
                return this;
            }
        }
        return this.inherited(arguments);
    }, _set:function (name, value) {
        if (!this._applyAttributes) {
            return this._changeAttrValue(name, value);
        }
        return this.inherited(arguments);
    }});
});

