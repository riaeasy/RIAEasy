//>>built

define("dojox/app/main", ["require", "dojo/_base/kernel", "dojo/_base/lang", "dojo/_base/declare", "dojo/_base/config", "dojo/_base/window", "dojo/Evented", "dojo/Deferred", "dojo/when", "dojo/has", "dojo/on", "dojo/ready", "dojo/dom-construct", "dojo/dom-attr", "./utils/model", "./utils/nls", "./module/lifecycle", "./utils/hash", "./utils/constraints", "./utils/config"], function (require, kernel, lang, declare, config, win, Evented, Deferred, when, has, on, ready, domConstruct, domAttr, model, nls, lifecycle, hash, constraints, configUtils) {
    has.add("app-log-api", (config["app"] || {}).debugApp);
    var Application = declare(Evented, {constructor:function (params, node) {
        declare.safeMixin(this, params);
        this.params = params;
        this.id = params.id;
        this.defaultView = params.defaultView;
        this.controllers = [];
        this.children = {};
        this.loadedModels = {};
        this.loadedStores = {};
        this.setDomNode(domConstruct.create("div", {id:this.id + "_Root", style:"width:100%; height:100%; overflow-y:hidden; overflow-x:hidden;"}));
        node.appendChild(this.domNode);
    }, createDataStore:function (params) {
        if (params.stores) {
            for (var item in params.stores) {
                if (item.charAt(0) !== "_") {
                    var type = params.stores[item].type ? params.stores[item].type : "dojo/store/Memory";
                    var config = {};
                    if (params.stores[item].params) {
                        lang.mixin(config, params.stores[item].params);
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
                    if (params.stores[item].observable) {
                        try {
                            var observableCtor = require("dojo/store/Observable");
                        }
                        catch (e) {
                            throw new Error("dojo/store/Observable must be listed in the dependencies");
                        }
                        params.stores[item].store = observableCtor(new storeCtor(config));
                    } else {
                        params.stores[item].store = new storeCtor(config);
                    }
                    this.loadedStores[item] = params.stores[item].store;
                }
            }
        }
    }, createControllers:function (controllers) {
        if (controllers) {
            var requireItems = [];
            for (var i = 0; i < controllers.length; i++) {
                requireItems.push(controllers[i]);
            }
            var def = new Deferred();
            var requireSignal;
            try {
                requireSignal = require.on ? require.on("error", function (error) {
                    if (def.isResolved() || def.isRejected()) {
                        return;
                    }
                    def.reject("load controllers error.");
                    if (requireSignal) {
                        requireSignal.remove();
                    }
                }) : null;
                require(requireItems, function () {
                    def.resolve.call(def, arguments);
                    if (requireSignal) {
                        requireSignal.remove();
                    }
                });
            }
            catch (e) {
                def.reject(e);
                if (requireSignal) {
                    requireSignal.remove();
                }
            }
            var controllerDef = new Deferred();
            when(def, lang.hitch(this, function () {
                for (var i = 0; i < arguments[0].length; i++) {
                    this.controllers.push((new arguments[0][i](this)).bind());
                }
                controllerDef.resolve(this);
            }), function () {
                controllerDef.reject("load controllers error.");
            });
            return controllerDef;
        }
    }, trigger:function (event, params) {
        kernel.deprecated("dojox.app.Application.trigger", "Use dojox.app.Application.emit instead", "2.0");
        this.emit(event, params);
    }, start:function () {
        this.createDataStore(this.params);
        var loadModelLoaderDeferred = new Deferred();
        var createPromise;
        try {
            createPromise = model(this.params.models, this, this);
        }
        catch (e) {
            loadModelLoaderDeferred.reject(e);
            return loadModelLoaderDeferred.promise;
        }
        when(createPromise, lang.hitch(this, function (models) {
            this.loadedModels = lang.isArray(models) ? models[0] : models;
            this.setupControllers();
            when(nls(this.params), lang.hitch(this, function (nls) {
                if (nls) {
                    lang.mixin(this.nls = {}, nls);
                }
                this.startup();
            }));
        }), function () {
            loadModelLoaderDeferred.reject("load model error.");
        });
    }, setDomNode:function (domNode) {
        var oldNode = this.domNode;
        this.domNode = domNode;
        this.emit("app-domNode", {oldNode:oldNode, newNode:domNode});
    }, setupControllers:function () {
        var currentHash = window.location.hash;
        this._startView = hash.getTarget(currentHash, this.defaultView);
        this._startParams = hash.getParams(currentHash);
    }, startup:function () {
        this.selectedChildren = {};
        var controllers = this.createControllers(this.params.controllers);
        if (this.hasOwnProperty("constraint")) {
            constraints.register(this.params.constraints);
        } else {
            this.constraint = "center";
        }
        var emitLoad = function () {
            this.emit("app-load", {viewId:this.defaultView, initLoad:true, params:this._startParams, callback:lang.hitch(this, function () {
                this.emit("app-transition", {viewId:this.defaultView, forceTransitionNone:true, opts:{params:this._startParams}});
                if (this.defaultView !== this._startView) {
                    this.emit("app-transition", {viewId:this._startView, opts:{params:this._startParams}});
                }
                this.setStatus(this.lifecycle.STARTED);
            })});
        };
        when(controllers, lang.hitch(this, function () {
            if (this.template) {
                this.emit("app-init", {app:this, name:this.name, type:this.type, parent:this, templateString:this.templateString, controller:this.controller, callback:lang.hitch(this, function (view) {
                    this.setDomNode(view.domNode);
                    emitLoad.call(this);
                })});
            } else {
                emitLoad.call(this);
            }
        }));
    }});
    function generateApp(config, node) {
        var path;
        config = configUtils.configProcessHas(config);
        if (!config.loaderConfig) {
            config.loaderConfig = {};
        }
        if (!config.loaderConfig.paths) {
            config.loaderConfig.paths = {};
        }
        if (!config.loaderConfig.paths["app"]) {
            path = window.location.pathname;
            if (path.charAt(path.length) != "/") {
                path = path.split("/");
                path.pop();
                path = path.join("/");
            }
            config.loaderConfig.paths["app"] = path;
        }
        require(config.loaderConfig);
        if (!config.modules) {
            config.modules = [];
        }
        config.modules.push("./module/lifecycle");
        var modules = config.modules.concat(config.dependencies ? config.dependencies : []);
        if (config.template) {
            path = config.template;
            if (path.indexOf("./") == 0) {
                path = "app/" + path;
            }
            modules.push("dojo/text!" + path);
        }
        require(modules, function () {
            var modules = [Application];
            for (var i = 0; i < config.modules.length; i++) {
                modules.push(arguments[i]);
            }
            if (config.template) {
                var ext = {templateString:arguments[arguments.length - 1]};
            }
            App = declare(modules, ext);
            ready(function () {
                var app = new App(config, node || win.body());
                if (has("app-log-api")) {
                    app.log = function () {
                        var msg = "";
                        try {
                            for (var i = 0; i < arguments.length - 1; i++) {
                                msg = msg + arguments[i];
                            }
                            console.log(msg, arguments[arguments.length - 1]);
                        }
                        catch (e) {
                        }
                    };
                } else {
                    app.log = function () {
                    };
                }
                app.transitionToView = function (target, transitionOptions, triggerEvent) {
                    var opts = {bubbles:true, cancelable:true, detail:transitionOptions, triggerEvent:triggerEvent || null};
                    on.emit(target, "startTransition", opts);
                };
                app.setStatus(app.lifecycle.STARTING);
                var globalAppName = app.id;
                if (window[globalAppName]) {
                    declare.safeMixin(app, window[globalAppName]);
                }
                window[globalAppName] = app;
                app.start();
            });
        });
    }
    return function (config, node) {
        if (!config) {
            throw new Error("App Config Missing");
        }
        if (config.validate) {
            require(["dojox/json/schema", "dojox/json/ref", "dojo/text!dojox/application/schema/application.json"], function (schema, appSchema) {
                schema = dojox.json.ref.resolveJson(schema);
                if (schema.validate(config, appSchema)) {
                    generateApp(config, node);
                }
            });
        } else {
            generateApp(config, node);
        }
    };
});

