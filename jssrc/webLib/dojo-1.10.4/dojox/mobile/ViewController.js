//>>built

define("dojox/mobile/ViewController", ["dojo/_base/kernel", "dojo/_base/array", "dojo/_base/connect", "dojo/_base/declare", "dojo/_base/lang", "dojo/_base/window", "dojo/_base/Deferred", "dojo/dom", "dojo/dom-class", "dojo/dom-construct", "dojo/on", "dojo/ready", "dijit/registry", "./ProgressIndicator", "./TransitionEvent", "./viewRegistry"], function (dojo, array, connect, declare, lang, win, Deferred, dom, domClass, domConstruct, on, ready, registry, ProgressIndicator, TransitionEvent, viewRegistry) {
    var Controller = declare("dojox.mobile.ViewController", null, {dataHandlerClass:"dojox/mobile/dh/DataHandler", dataSourceClass:"dojox/mobile/dh/UrlDataSource", fileTypeMapClass:"dojox/mobile/dh/SuffixFileTypeMap", constructor:function () {
        this.viewMap = {};
        ready(lang.hitch(this, function () {
            on(win.body(), "startTransition", lang.hitch(this, "onStartTransition"));
        }));
    }, findTransitionViews:function (moveTo) {
        if (!moveTo) {
            return [];
        }
        moveTo.match(/^#?([^&?]+)(.*)/);
        var params = RegExp.$2;
        var view = registry.byId(RegExp.$1);
        if (!view) {
            return [];
        }
        for (var v = view.getParent(); v; v = v.getParent()) {
            if (v.isVisible && !v.isVisible()) {
                var sv = view.getShowingView();
                if (sv && sv.id !== view.id) {
                    view.show();
                }
                view = v;
            }
        }
        return [view.getShowingView(), view, params];
    }, openExternalView:function (transOpts, target) {
        var d = new Deferred();
        var id = this.viewMap[transOpts.url];
        if (id) {
            transOpts.moveTo = id;
            if (transOpts.noTransition) {
                registry.byId(id).hide();
            } else {
                new TransitionEvent(win.body(), transOpts).dispatch();
            }
            d.resolve(true);
            return d;
        }
        var refNode = null;
        for (var i = target.childNodes.length - 1; i >= 0; i--) {
            var c = target.childNodes[i];
            if (c.nodeType === 1) {
                var fixed = c.getAttribute("fixed") || c.getAttribute("data-mobile-fixed") || (registry.byNode(c) && registry.byNode(c).fixed);
                if (fixed === "bottom") {
                    refNode = c;
                    break;
                }
            }
        }
        var dh = transOpts.dataHandlerClass || this.dataHandlerClass;
        var ds = transOpts.dataSourceClass || this.dataSourceClass;
        var ft = transOpts.fileTypeMapClass || this.fileTypeMapClass;
        require([dh, ds, ft], lang.hitch(this, function (DataHandler, DataSource, FileTypeMap) {
            var handler = new DataHandler(new DataSource(transOpts.data || transOpts.url), target, refNode);
            var contentType = transOpts.contentType || FileTypeMap.getContentType(transOpts.url) || "html";
            handler.processData(contentType, lang.hitch(this, function (id) {
                if (id) {
                    this.viewMap[transOpts.url] = transOpts.moveTo = id;
                    if (transOpts.noTransition) {
                        registry.byId(id).hide();
                    } else {
                        new TransitionEvent(win.body(), transOpts).dispatch();
                    }
                    d.resolve(true);
                } else {
                    d.reject("Failed to load " + transOpts.url);
                }
            }));
        }));
        return d;
    }, onStartTransition:function (evt) {
        evt.preventDefault();
        if (!evt.detail) {
            return;
        }
        var detail = evt.detail;
        if (!detail.moveTo && !detail.href && !detail.url && !detail.scene) {
            return;
        }
        if (detail.url && !detail.moveTo) {
            var urlTarget = detail.urlTarget;
            var w = registry.byId(urlTarget);
            var target = w && w.containerNode || dom.byId(urlTarget);
            if (!target) {
                w = viewRegistry.getEnclosingView(evt.target);
                target = w && w.domNode.parentNode || win.body();
            }
            var src = registry.getEnclosingWidget(evt.target);
            if (src && src.callback) {
                detail.context = src;
                detail.method = src.callback;
            }
            this.openExternalView(detail, target);
            return;
        } else {
            if (detail.href) {
                if (detail.hrefTarget && detail.hrefTarget != "_self") {
                    win.global.open(detail.href, detail.hrefTarget);
                } else {
                    var view;
                    for (var v = viewRegistry.getEnclosingView(evt.target); v; v = viewRegistry.getParentView(v)) {
                        view = v;
                    }
                    if (view) {
                        view.performTransition(null, detail.transitionDir, detail.transition, evt.target, function () {
                            location.href = detail.href;
                        });
                    }
                }
                return;
            } else {
                if (detail.scene) {
                    connect.publish("/dojox/mobile/app/pushScene", [detail.scene]);
                    return;
                }
            }
        }
        var arr = this.findTransitionViews(detail.moveTo), fromView = arr[0], toView = arr[1], params = arr[2];
        if (!location.hash && !detail.hashchange) {
            viewRegistry.initialView = fromView;
        }
        if (detail.moveTo && toView) {
            detail.moveTo = (detail.moveTo.charAt(0) === "#" ? "#" + toView.id : toView.id) + params;
        }
        if (!fromView || (detail.moveTo && fromView === registry.byId(detail.moveTo.replace(/^#?([^&?]+).*/, "$1")))) {
            return;
        }
        src = registry.getEnclosingWidget(evt.target);
        if (src && src.callback) {
            detail.context = src;
            detail.method = src.callback;
        }
        fromView.performTransition(detail);
    }});
    Controller._instance = new Controller();
    Controller.getInstance = function () {
        return Controller._instance;
    };
    return Controller;
});

