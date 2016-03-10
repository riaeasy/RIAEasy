//>>built

define("dojox/app/ViewBase", ["require", "dojo/when", "dojo/on", "dojo/dom-attr", "dojo/dom-style", "dojo/_base/declare", "dojo/_base/lang", "dojo/Deferred", "./utils/model", "./utils/constraints"], function (require, when, on, domAttr, domStyle, declare, lang, Deferred, model, constraints) {
    return declare("dojox.app.ViewBase", null, {constructor:function (params) {
        this.id = "";
        this.name = "";
        this.children = {};
        this.selectedChildren = {};
        this.loadedStores = {};
        this._started = false;
        lang.mixin(this, params);
        if (this.parent.views) {
            lang.mixin(this, this.parent.views[this.name]);
        }
    }, start:function () {
        if (this._started) {
            return this;
        }
        this._startDef = new Deferred();
        when(this.load(), lang.hitch(this, function () {
            this._createDataStore(this);
            this._setupModel();
        }));
        return this._startDef;
    }, load:function () {
        var vcDef = this._loadViewController();
        when(vcDef, lang.hitch(this, function (controller) {
            if (controller) {
                declare.safeMixin(this, controller);
            }
        }));
        return vcDef;
    }, _createDataStore:function () {
        if (this.parent.loadedStores) {
            lang.mixin(this.loadedStores, this.parent.loadedStores);
        }
        if (this.stores) {
            for (var item in this.stores) {
                if (item.charAt(0) !== "_") {
                    var type = this.stores[item].type ? this.stores[item].type : "dojo/store/Memory";
                    var config = {};
                    if (this.stores[item].params) {
                        lang.mixin(config, this.stores[item].params);
                    }
                    try {
                        var storeCtor = require(type);
                    }
                    catch (e) {
                        throw new Error(type + " must be listed in the dependencies");
                    }
                    if (config.data && lang.isString(config.data)) {
                        config.data = lang.getObject(config.data);
                    }
                    if (this.stores[item].observable) {
                        try {
                            var observableCtor = require("dojo/store/Observable");
                        }
                        catch (e) {
                            throw new Error("dojo/store/Observable must be listed in the dependencies");
                        }
                        this.stores[item].store = observableCtor(new storeCtor(config));
                    } else {
                        this.stores[item].store = new storeCtor(config);
                    }
                    this.loadedStores[item] = this.stores[item].store;
                }
            }
        }
    }, _setupModel:function () {
        if (!this.loadedModels) {
            var createPromise;
            try {
                createPromise = model(this.models, this.parent, this.app);
            }
            catch (e) {
                throw new Error("Error creating models: " + e.message);
            }
            when(createPromise, lang.hitch(this, function (models) {
                if (models) {
                    this.loadedModels = lang.isArray(models) ? models[0] : models;
                }
                this._startup();
            }), function (err) {
                throw new Error("Error creating models: " + err.message);
            });
        } else {
            this._startup();
        }
    }, _startup:function () {
        this._initViewHidden();
        this._needsResize = true;
        this._startLayout();
    }, _initViewHidden:function () {
        domStyle.set(this.domNode, "visibility", "hidden");
    }, _startLayout:function () {
        this.app.log("  > in app/ViewBase _startLayout firing layout for name=[", this.name, "], parent.name=[", this.parent.name, "]");
        if (!this.hasOwnProperty("constraint")) {
            this.constraint = domAttr.get(this.domNode, "data-app-constraint") || "center";
        }
        constraints.register(this.constraint);
        this.app.emit("app-initLayout", {"view":this, "callback":lang.hitch(this, function () {
            this.startup();
            this.app.log("  > in app/ViewBase calling init() name=[", this.name, "], parent.name=[", this.parent.name, "]");
            this.init();
            this._started = true;
            if (this._startDef) {
                this._startDef.resolve(this);
            }
        })});
    }, _loadViewController:function () {
        var viewControllerDef = new Deferred();
        var path;
        if (!this.controller) {
            this.app.log("  > in app/ViewBase _loadViewController no controller set for view name=[", this.name, "], parent.name=[", this.parent.name, "]");
            viewControllerDef.resolve(true);
            return viewControllerDef;
        } else {
            path = this.controller.replace(/(\.js)$/, "");
        }
        var requireSignal;
        try {
            var loadFile = path;
            var index = loadFile.indexOf("./");
            if (index >= 0) {
                loadFile = path.substring(index + 2);
            }
            requireSignal = require.on ? require.on("error", function (error) {
                if (viewControllerDef.isResolved() || viewControllerDef.isRejected()) {
                    return;
                }
                if (error.info[0] && (error.info[0].indexOf(loadFile) >= 0)) {
                    viewControllerDef.resolve(false);
                    if (requireSignal) {
                        requireSignal.remove();
                    }
                }
            }) : null;
            if (path.indexOf("./") == 0) {
                path = "app/" + path;
            }
            require([path], function (controller) {
                viewControllerDef.resolve(controller);
                if (requireSignal) {
                    requireSignal.remove();
                }
            });
        }
        catch (e) {
            viewControllerDef.reject(e);
            if (requireSignal) {
                requireSignal.remove();
            }
        }
        return viewControllerDef;
    }, init:function () {
    }, beforeActivate:function () {
    }, afterActivate:function () {
    }, beforeDeactivate:function () {
    }, afterDeactivate:function () {
    }, destroy:function () {
    }});
});

