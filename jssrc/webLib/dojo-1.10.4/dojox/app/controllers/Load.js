//>>built

define("dojox/app/controllers/Load", ["require", "dojo/_base/lang", "dojo/_base/declare", "dojo/on", "dojo/Deferred", "dojo/when", "dojo/dom-style", "../Controller"], function (require, lang, declare, on, Deferred, when, domStyle, Controller, View) {
    return declare("dojox.app.controllers.Load", Controller, {_waitingQueue:[], constructor:function (app, events) {
        this.events = {"app-init":this.init, "app-load":this.load};
    }, init:function (event) {
        when(this.createView(event.parent, null, null, {templateString:event.templateString, controller:event.controller}, null, event.type), function (newView) {
            when(newView.start(), event.callback);
        });
    }, load:function (event) {
        this.app.log("in app/controllers/Load event.viewId=" + event.viewId + " event =", event);
        var views = event.viewId || "";
        var viewArray = [];
        var parts = views.split("+");
        while (parts.length > 0) {
            var viewId = parts.shift();
            viewArray.push(viewId);
        }
        var def;
        this.proceedLoadViewDef = new Deferred();
        if (viewArray && viewArray.length > 1) {
            for (var i = 0; i < viewArray.length - 1; i++) {
                var newEvent = lang.clone(event);
                newEvent.callback = null;
                newEvent.viewId = viewArray[i];
                this._waitingQueue.push(newEvent);
            }
            this.proceedLoadView(this._waitingQueue.shift());
            when(this.proceedLoadViewDef, lang.hitch(this, function () {
                var newEvent = lang.clone(event);
                newEvent.viewId = viewArray[i];
                def = this.loadView(newEvent);
                return def;
            }));
        } else {
            def = this.loadView(event);
            return def;
        }
    }, proceedLoadView:function (loadEvt) {
        var def = this.loadView(loadEvt);
        when(def, lang.hitch(this, function () {
            this.app.log("in app/controllers/Load proceedLoadView back from loadView for event", loadEvt);
            var nextEvt = this._waitingQueue.shift();
            if (nextEvt) {
                this.app.log("in app/controllers/Load proceedLoadView back from loadView calling this.proceedLoadView(nextEvt) for ", nextEvt);
                this.proceedLoadView(nextEvt);
            } else {
                this._waitingQueue = [];
                this.proceedLoadViewDef.resolve();
            }
        }));
    }, loadView:function (loadEvent) {
        var parent = loadEvent.parent || this.app;
        var viewId = loadEvent.viewId || "";
        var parts = viewId.split(",");
        var childId = parts.shift();
        var subIds = parts.join(",");
        var params = loadEvent.params || "";
        this._handleDefault = false;
        this._defaultHasPlus = false;
        var def = this.loadChild(parent, childId, subIds, params, loadEvent);
        if (loadEvent.callback) {
            when(def, lang.hitch(this, function () {
                if (this._handleDefault && !loadEvent.initLoad) {
                    this.app.log("logTransitions:", "", " emit app-transition this.childViews=[" + this.childViews + "]");
                    this.app.emit("app-transition", {viewId:this.childViews, defaultView:true, forceTransitionNone:loadEvent.forceTransitionNone, opts:{params:params}});
                }
                loadEvent.callback(this._handleDefault, this._defaultHasPlus);
            }));
        }
        return def;
    }, createChild:function (parent, childId, subIds, params) {
        var id = parent.id + "_" + childId;
        if (!params && parent.views[childId] && parent.views[childId].defaultParams) {
            params = parent.views[childId].defaultParams;
        }
        var view = parent.children[id];
        if (view) {
            if (params) {
                view.params = params;
            }
            this.app.log("in app/controllers/Load createChild view is already loaded so return the loaded view with the new parms ", view);
            return view;
        }
        var def = new Deferred();
        when(this.createView(parent, id, childId, null, params, parent.views[childId].type), function (newView) {
            parent.children[id] = newView;
            when(newView.start(), function (view) {
                def.resolve(view);
            });
        });
        return def;
    }, createView:function (parent, id, name, mixin, params, type) {
        var def = new Deferred();
        var app = this.app;
        require([type ? type : "../View"], function (View) {
            var newView = new View(lang.mixin({"app":app, "id":id, "name":name, "parent":parent}, {"params":params}, mixin));
            def.resolve(newView);
        });
        return def;
    }, loadChild:function (parent, childId, subIds, params, loadEvent) {
        if (!parent) {
            throw Error("No parent for Child '" + childId + "'.");
        }
        if (!childId) {
            var parts = parent.defaultView ? parent.defaultView.split(",") : "default";
            if (parent.defaultView && !loadEvent.initLoad) {
                var childViews = this._getViewNamesFromDefaults(parent);
                this.app.log("logTransitions:", "Load:loadChild", "setting _handleDefault true for parent.defaultView childViews=[" + childViews + "]");
                this._handleDefault = true;
                if (parent.defaultView.indexOf("+") >= 0) {
                    this._defaultHasPlus = true;
                }
            } else {
                childId = parts.shift();
                subIds = parts.join(",");
            }
        }
        var loadChildDeferred = new Deferred();
        var createPromise;
        try {
            createPromise = this.createChild(parent, childId, subIds, params);
        }
        catch (ex) {
            console.warn("logTransitions:", "", "emit reject load exception for =[" + childId + "]", ex);
            loadChildDeferred.reject("load child '" + childId + "' error.");
            return loadChildDeferred.promise;
        }
        when(createPromise, lang.hitch(this, function (child) {
            if (!subIds && child.defaultView) {
                var childViews = this._getViewNamesFromDefaults(child);
                this.app.log("logTransitions:", "Load:loadChild", " setting _handleDefault = true child.defaultView childViews=[" + childViews + "]");
                this._handleDefault = true;
                if (child.defaultView.indexOf("+") >= 0) {
                    this._defaultHasPlus = true;
                }
                this.childViews = childViews;
                loadChildDeferred.resolve();
            }
            var parts = subIds.split(",");
            childId = parts.shift();
            subIds = parts.join(",");
            if (childId) {
                var subLoadDeferred = this.loadChild(child, childId, subIds, params, loadEvent);
                when(subLoadDeferred, function () {
                    loadChildDeferred.resolve();
                }, function () {
                    loadChildDeferred.reject("load child '" + childId + "' error.");
                });
            } else {
                loadChildDeferred.resolve();
            }
        }), function () {
            console.warn("loadChildDeferred.REJECT() for [" + childId + "] subIds=[" + subIds + "]");
            loadChildDeferred.reject("load child '" + childId + "' error.");
        });
        return loadChildDeferred.promise;
    }, _getViewNamesFromDefaults:function (view) {
        var parent = view.parent;
        var parentNames = view.name;
        var viewNames = "";
        while (parent !== this.app) {
            parentNames = parent.name + "," + parentNames;
            parent = parent.parent;
        }
        var parts = view.defaultView.split("+");
        for (var item in parts) {
            parts[item] = parentNames + "," + parts[item];
        }
        viewNames = parts.join("+");
        return viewNames;
    }});
});

