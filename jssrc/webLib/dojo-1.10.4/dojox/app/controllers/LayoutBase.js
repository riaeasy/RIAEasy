//>>built

define("dojox/app/controllers/LayoutBase", ["dojo/_base/lang", "dojo/_base/declare", "dojo/sniff", "dojo/_base/window", "dojo/_base/config", "dojo/dom-attr", "dojo/topic", "dojo/dom-style", "../utils/constraints", "../Controller"], function (lang, declare, has, win, config, domAttr, topic, domStyle, constraints, Controller) {
    return declare("dojox.app.controllers.LayoutBase", Controller, {constructor:function (app, events) {
        this.events = {"app-initLayout":this.initLayout, "app-layoutView":this.layoutView, "app-resize":this.onResize};
        if (config.mblHideAddressBar) {
            topic.subscribe("/dojox/mobile/afterResizeAll", lang.hitch(this, this.onResize));
        } else {
            this.bind(win.global, has("ios") ? "orientationchange" : "resize", lang.hitch(this, this.onResize));
        }
    }, onResize:function () {
        this._doResize(this.app);
        for (var hash in this.app.selectedChildren) {
            if (this.app.selectedChildren[hash]) {
                this._doResize(this.app.selectedChildren[hash]);
            }
        }
    }, initLayout:function (event) {
        domAttr.set(event.view.domNode, "id", event.view.id);
        if (event.callback) {
            event.callback();
        }
    }, _doLayout:function (view) {
        if (!view) {
            console.warn("layout empty view.");
        }
    }, _doResize:function (view) {
        this.app.log("in LayoutBase _doResize called for view.id=" + view.id + " view=", view);
        this._doLayout(view);
    }, layoutView:function (event) {
        var parent = event.parent || this.app;
        var view = event.view;
        if (!view) {
            return;
        }
        this.app.log("in LayoutBase layoutView called for event.view.id=" + event.view.id);
        var parentSelChild = constraints.getSelectedChild(parent, view.constraint);
        if (event.removeView) {
            view.viewShowing = false;
            this.hideView(view);
            if (view == parentSelChild) {
                constraints.setSelectedChild(parent, view.constraint, null);
            }
        } else {
            if (view !== parentSelChild) {
                if (parentSelChild) {
                    parentSelChild.viewShowing = false;
                    if (event.transition == "none" || event.currentLastSubChildMatch !== parentSelChild) {
                        this.hideView(parentSelChild);
                    }
                }
                view.viewShowing = true;
                this.showView(view);
                constraints.setSelectedChild(parent, view.constraint, view);
            } else {
                view.viewShowing = true;
            }
        }
    }, hideView:function (view) {
        this.app.log("logTransitions:", "LayoutBase" + " setting domStyle display none for view.id=[" + view.id + "], visibility=[" + view.domNode.style.visibility + "]");
        domStyle.set(view.domNode, "display", "none");
    }, showView:function (view) {
        if (view.domNode) {
            this.app.log("logTransitions:", "LayoutBase" + " setting domStyle display to display for view.id=[" + view.id + "], visibility=[" + view.domNode.style.visibility + "]");
            domStyle.set(view.domNode, "display", "");
        }
    }});
});

