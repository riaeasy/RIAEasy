//>>built

define("dojox/mobile/bookmarkable", ["dojo/_base/array", "dojo/_base/connect", "dojo/_base/lang", "dojo/_base/window", "dojo/hash", "dijit/registry", "./TransitionEvent", "./View", "./viewRegistry"], function (array, connect, lang, win, hash, registry, TransitionEvent, View, viewRegistry) {
    var b = {settingHash:false, transitionInfo:[], getTransitionInfo:function (fromViewId, toViewId) {
        return this.transitionInfo[fromViewId.replace(/^#/, "") + ":" + toViewId.replace(/^#/, "")];
    }, addTransitionInfo:function (fromViewId, toViewId, args) {
        this.transitionInfo[fromViewId.replace(/^#/, "") + ":" + toViewId.replace(/^#/, "")] = args;
    }, findTransitionViews:function (moveTo) {
        if (!moveTo) {
            return [];
        }
        var view = registry.byId(moveTo.replace(/^#/, ""));
        if (!view) {
            return [];
        }
        for (var v = view.getParent(); v; v = v.getParent()) {
            if (v.isVisible && !v.isVisible()) {
                view = v;
            }
        }
        return [view.getShowingView(), view];
    }, onHashChange:function (value) {
        if (this.settingHash) {
            this.settingHash = false;
            return;
        }
        var params = this.handleFragIds(value);
        params.hashchange = true;
        new TransitionEvent(win.body(), params).dispatch();
    }, handleFragIds:function (fragIds) {
        var arr, moveTo;
        if (!fragIds) {
            moveTo = viewRegistry.initialView.id;
            arr = this.findTransitionViews(moveTo);
        } else {
            var ids = fragIds.replace(/^#/, "").split(/,/);
            for (var i = 0; i < ids.length; i++) {
                var view = registry.byId(ids[i]);
                if (view.isVisible()) {
                    continue;
                }
                var success = true;
                for (var v = viewRegistry.getParentView(view); v; v = viewRegistry.getParentView(v)) {
                    if (array.indexOf(ids, v.id) === -1) {
                        success = false;
                        break;
                    }
                }
                if (!success) {
                    array.forEach(view.getSiblingViews(), function (v) {
                        v.domNode.style.display = (v === view) ? "" : "none";
                    });
                    continue;
                }
                arr = this.findTransitionViews(ids[i]);
                if (arr.length === 2) {
                    moveTo = ids[i];
                }
            }
        }
        var args = this.getTransitionInfo(arr[0].id, arr[1].id);
        var dir = 1;
        if (!args) {
            args = this.getTransitionInfo(arr[1].id, arr[0].id);
            dir = -1;
        }
        return {moveTo:"#" + moveTo, transitionDir:args ? args.transitionDir * dir : 1, transition:args ? args.transition : "none"};
    }, setFragIds:function (toView) {
        var arr = array.filter(viewRegistry.getViews(), function (v) {
            return v.isVisible();
        });
        this.settingHash = true;
        hash(array.map(arr, function (v) {
            return v.id;
        }).join(","));
    }};
    connect.subscribe("/dojo/hashchange", null, function () {
        b.onHashChange.apply(b, arguments);
    });
    lang.extend(View, {getTransitionInfo:function () {
        b.getTransitionInfo.apply(b, arguments);
    }, addTransitionInfo:function () {
        b.addTransitionInfo.apply(b, arguments);
    }, handleFragIds:function () {
        b.handleFragIds.apply(b, arguments);
    }, setFragIds:function () {
        b.setFragIds.apply(b, arguments);
    }});
    return b;
});

