//>>built

define("dojox/grid/enhanced/_PluginManager", ["dojo/_base/kernel", "dojo/_base/lang", "dojo/_base/declare", "dojo/_base/array", "dojo/_base/connect", "./_Events", "./_FocusManager", "../util"], function (dojo, lang, declare, array, connect, _Events, _FocusManager, util) {
    var _PluginManager = declare("dojox.grid.enhanced._PluginManager", null, {_options:null, _plugins:null, _connects:null, constructor:function (inGrid) {
        this.grid = inGrid;
        this._store = inGrid.store;
        this._options = {};
        this._plugins = [];
        this._connects = [];
        this._parseProps(this.grid.plugins);
        inGrid.connect(inGrid, "_setStore", lang.hitch(this, function (store) {
            if (this._store !== store) {
                this.forEach("onSetStore", [store, this._store]);
                this._store = store;
            }
        }));
    }, startup:function () {
        this.forEach("onStartUp");
    }, preInit:function () {
        this.grid.focus.destroy();
        this.grid.focus = new _FocusManager(this.grid);
        new _Events(this.grid);
        this._init(true);
        this.forEach("onPreInit");
    }, postInit:function () {
        this._init(false);
        array.forEach(this.grid.views.views, this._initView, this);
        this._connects.push(connect.connect(this.grid.views, "addView", lang.hitch(this, this._initView)));
        if (this._plugins.length > 0) {
            var edit = this.grid.edit;
            if (edit) {
                edit.styleRow = function (inRow) {
                };
            }
        }
        this.forEach("onPostInit");
    }, forEach:function (func, args) {
        array.forEach(this._plugins, function (p) {
            if (!p || !p[func]) {
                return;
            }
            p[func].apply(p, args ? args : []);
        });
    }, _parseProps:function (plugins) {
        if (!plugins) {
            return;
        }
        var p, loading = {}, options = this._options, grid = this.grid;
        var registry = _PluginManager.registry;
        for (p in plugins) {
            if (plugins[p]) {
                this._normalize(p, plugins, registry, loading);
            }
        }
        if (options.dnd) {
            options.columnReordering = false;
        }
        lang.mixin(grid, options);
    }, _normalize:function (p, plugins, registry, loading) {
        if (!registry[p]) {
            throw new Error("Plugin " + p + " is required.");
        }
        if (loading[p]) {
            throw new Error("Recursive cycle dependency is not supported.");
        }
        var options = this._options;
        if (options[p]) {
            return options[p];
        }
        loading[p] = true;
        options[p] = lang.mixin({}, registry[p], lang.isObject(plugins[p]) ? plugins[p] : {});
        var dependencies = options[p]["dependency"];
        if (dependencies) {
            if (!lang.isArray(dependencies)) {
                dependencies = options[p]["dependency"] = [dependencies];
            }
            array.forEach(dependencies, function (dependency) {
                if (!this._normalize(dependency, plugins, registry, loading)) {
                    throw new Error("Plugin " + dependency + " is required.");
                }
            }, this);
        }
        delete loading[p];
        return options[p];
    }, _init:function (pre) {
        var p, preInit, options = this._options;
        for (p in options) {
            preInit = options[p]["preInit"];
            if ((pre ? preInit : !preInit) && options[p]["class"] && !this.pluginExisted(p)) {
                this.loadPlugin(p);
            }
        }
    }, loadPlugin:function (name) {
        var option = this._options[name];
        if (!option) {
            return null;
        }
        var plugin = this.getPlugin(name);
        if (plugin) {
            return plugin;
        }
        var dependencies = option["dependency"];
        array.forEach(dependencies, function (dependency) {
            if (!this.loadPlugin(dependency)) {
                throw new Error("Plugin " + dependency + " is required.");
            }
        }, this);
        var cls = option["class"];
        delete option["class"];
        plugin = new this.getPluginClazz(cls)(this.grid, option);
        this._plugins.push(plugin);
        return plugin;
    }, _initView:function (view) {
        if (!view) {
            return;
        }
        util.funnelEvents(view.contentNode, view, "doContentEvent", ["mouseup", "mousemove"]);
        util.funnelEvents(view.headerNode, view, "doHeaderEvent", ["mouseup"]);
    }, pluginExisted:function (name) {
        return !!this.getPlugin(name);
    }, getPlugin:function (name) {
        var plugins = this._plugins;
        name = name.toLowerCase();
        for (var i = 0, len = plugins.length; i < len; i++) {
            if (name == plugins[i]["name"].toLowerCase()) {
                return plugins[i];
            }
        }
        return null;
    }, getPluginClazz:function (clazz) {
        if (lang.isFunction(clazz)) {
            return clazz;
        }
        var errorMsg = "Please make sure Plugin \"" + clazz + "\" is existed.";
        try {
            var cls = lang.getObject(clazz);
            if (!cls) {
                throw new Error(errorMsg);
            }
            return cls;
        }
        catch (e) {
            throw new Error(errorMsg);
        }
    }, isFixedCell:function (cell) {
        return cell && (cell.isRowSelector || cell.fixedPos);
    }, destroy:function () {
        array.forEach(this._connects, connect.disconnect);
        this.forEach("destroy");
        if (this.grid.unwrap) {
            this.grid.unwrap();
        }
        delete this._connects;
        delete this._plugins;
        delete this._options;
    }});
    _PluginManager.registerPlugin = function (clazz, props) {
        if (!clazz) {
            console.warn("Failed to register plugin, class missed!");
            return;
        }
        var cls = _PluginManager;
        cls.registry = cls.registry || {};
        cls.registry[clazz.prototype.name] = lang.mixin({"class":clazz}, (props ? props : {}));
    };
    return _PluginManager;
});

