//>>built

define("dojox/mvc/atBindingExtension", ["dojo/aspect", "dojo/_base/array", "dojo/_base/lang", "dijit/_WidgetBase", "./_atBindingMixin", "dijit/registry"], function (aspect, array, lang, _WidgetBase, _atBindingMixin) {
    return function (w) {
        array.forEach(arguments, function (w) {
            if (w.dataBindAttr) {
                console.warn("Detected a widget or a widget class that has already been applied data binding extension. Skipping...");
                return;
            }
            lang._mixin(w, _atBindingMixin.mixin);
            aspect.before(w, "postscript", function (params, srcNodeRef) {
                this._dbpostscript(params, srcNodeRef);
            });
            aspect.before(w, "startup", function () {
                if (this._started) {
                    return;
                }
                this._startAtWatchHandles();
            });
            aspect.before(w, "destroy", function () {
                this._stopAtWatchHandles();
            });
            aspect.around(w, "set", function (oldWidgetBaseSet) {
                return function (name, value) {
                    if (name == _atBindingMixin.prototype.dataBindAttr) {
                        return this._setBind(value);
                    } else {
                        if ((value || {}).atsignature == "dojox.mvc.at") {
                            return this._setAtWatchHandle(name, value);
                        }
                    }
                    return oldWidgetBaseSet.apply(this, lang._toArray(arguments));
                };
            });
        });
        return arguments;
    };
});

