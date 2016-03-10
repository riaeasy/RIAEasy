//>>built

define("dojox/app/View", ["require", "dojo/when", "dojo/on", "dojo/_base/declare", "dojo/_base/lang", "dojo/Deferred", "dijit/Destroyable", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "./ViewBase", "./utils/nls"], function (require, when, on, declare, lang, Deferred, Destroyable, _TemplatedMixin, _WidgetsInTemplateMixin, ViewBase, nls) {
    return declare("dojox.app.View", [_TemplatedMixin, _WidgetsInTemplateMixin, Destroyable, ViewBase], {constructor:function (params) {
    }, connect:function (obj, event, method) {
        return this.own(on(obj, event, lang.hitch(this, method)))[0];
    }, _loadTemplate:function () {
        if (this.templateString) {
            return true;
        } else {
            var tpl = this.template;
            var deps = this.dependencies ? this.dependencies : [];
            if (tpl) {
                if (tpl.indexOf("./") == 0) {
                    tpl = "app/" + tpl;
                }
                deps = deps.concat(["dojo/text!" + tpl]);
            }
            var def = new Deferred();
            if (deps.length > 0) {
                var requireSignal;
                try {
                    requireSignal = require.on ? require.on("error", lang.hitch(this, function (error) {
                        if (def.isResolved() || def.isRejected()) {
                            return;
                        }
                        if (error.info[0] && error.info[0].indexOf(this.template) >= 0) {
                            def.resolve(false);
                            if (requireSignal) {
                                requireSignal.remove();
                            }
                        }
                    })) : null;
                    require(deps, function () {
                        def.resolve.call(def, arguments);
                        if (requireSignal) {
                            requireSignal.remove();
                        }
                    });
                }
                catch (e) {
                    def.resolve(false);
                    if (requireSignal) {
                        requireSignal.remove();
                    }
                }
            } else {
                def.resolve(true);
            }
            var loadViewDeferred = new Deferred();
            when(def, lang.hitch(this, function () {
                this.templateString = this.template ? arguments[0][arguments[0].length - 1] : "<div></div>";
                loadViewDeferred.resolve(this);
            }));
            return loadViewDeferred;
        }
    }, load:function () {
        var tplDef = new Deferred();
        var defDef = this.inherited(arguments);
        var nlsDef = nls(this);
        when(defDef, lang.hitch(this, function () {
            when(nlsDef, lang.hitch(this, function (nls) {
                this.nls = lang.mixin({}, this.parent.nls);
                if (nls) {
                    lang.mixin(this.nls, nls);
                }
                when(this._loadTemplate(), function (value) {
                    tplDef.resolve(value);
                });
            }));
        }));
        return tplDef;
    }, _startup:function () {
        this.buildRendering();
        this.inherited(arguments);
    }});
});

