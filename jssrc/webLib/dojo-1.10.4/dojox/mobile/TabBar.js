//>>built

define("dojox/mobile/TabBar", ["dojo/_base/array", "dojo/_base/declare", "dojo/_base/window", "dojo/dom-class", "dojo/dom-construct", "dojo/dom-geometry", "dojo/dom-style", "dojo/dom-attr", "dijit/_Contained", "dijit/_Container", "dijit/_WidgetBase", "./TabBarButton", "dojo/has", "require"], function (array, declare, win, domClass, domConstruct, domGeometry, domStyle, domAttr, Contained, Container, WidgetBase, TabBarButton, has, BidiTabBar) {
    var TabBar = declare(0 ? "dojox.mobile.NonBidiTabBar" : "dojox.mobile.TabBar", [WidgetBase, Container, Contained], {iconBase:"", iconPos:"", barType:"tabBar", closable:false, center:true, syncWithViews:false, tag:"ul", fill:"auto", selectOne:true, baseClass:"mblTabBar", _fixedButtonWidth:76, _fixedButtonMargin:17, _largeScreenWidth:500, buildRendering:function () {
        this.domNode = this.srcNodeRef || domConstruct.create(this.tag);
        domAttr.set(this.domNode, "role", "tablist");
        this.reset();
        this.inherited(arguments);
    }, postCreate:function () {
        if (this.syncWithViews) {
            var f = function (view, moveTo, dir, transition, context, method) {
                var child = array.filter(this.getChildren(), function (w) {
                    return w.moveTo === "#" + view.id || w.moveTo === view.id;
                })[0];
                if (child) {
                    child.set("selected", true);
                }
            };
            this.subscribe("/dojox/mobile/afterTransitionIn", f);
            this.subscribe("/dojox/mobile/startView", f);
        }
    }, startup:function () {
        if (this._started) {
            return;
        }
        this.inherited(arguments);
        this.resize();
    }, reset:function () {
        var prev = this._barType;
        if (typeof this.barType === "object") {
            this._barType = this.barType["*"];
            for (var c in this.barType) {
                if (domClass.contains(win.doc.documentElement, c)) {
                    this._barType = this.barType[c];
                    break;
                }
            }
        } else {
            this._barType = this.barType;
        }
        var cap = function (s) {
            return s.charAt(0).toUpperCase() + s.substring(1);
        };
        if (prev) {
            domClass.remove(this.domNode, this.baseClass + cap(prev));
        }
        domClass.add(this.domNode, this.baseClass + cap(this._barType));
    }, resize:function (size) {
        var i, w;
        if (size && size.w) {
            w = size.w;
        } else {
            w = domGeometry.getMarginBox(this.domNode).w;
        }
        var bw = this._fixedButtonWidth;
        var bm = this._fixedButtonMargin;
        var arr = array.map(this.getChildren(), function (w) {
            return w.domNode;
        });
        domClass.toggle(this.domNode, "mblTabBarNoIcons", !array.some(this.getChildren(), function (w) {
            return w.iconNode1;
        }));
        domClass.toggle(this.domNode, "mblTabBarNoText", !array.some(this.getChildren(), function (w) {
            return w.label;
        }));
        var margin = 0;
        if (this._barType == "tabBar") {
            this.containerNode.style.paddingLeft = "";
            margin = Math.floor((w - (bw + bm * 2) * arr.length) / 2);
            if (this.fill == "always" || (this.fill == "auto" && (w < this._largeScreenWidth || margin < 0))) {
                domClass.add(this.domNode, "mblTabBarFill");
                for (i = 0; i < arr.length; i++) {
                    arr[i].style.width = (100 / arr.length) + "%";
                    arr[i].style.margin = "0";
                }
            } else {
                for (i = 0; i < arr.length; i++) {
                    arr[i].style.width = bw + "px";
                    arr[i].style.margin = "0 " + bm + "px";
                }
                if (arr.length > 0) {
                    if (0 && !this.isLeftToRight()) {
                        arr[0].style.marginLeft = "0px";
                        arr[0].style.marginRight = margin + bm + "px";
                    } else {
                        arr[0].style.marginLeft = margin + bm + "px";
                    }
                }
                this.containerNode.style.padding = "0px";
            }
        } else {
            for (i = 0; i < arr.length; i++) {
                arr[i].style.width = arr[i].style.margin = "";
            }
            var parent = this.getParent();
            if (this.fill == "always") {
                domClass.add(this.domNode, "mblTabBarFill");
                for (i = 0; i < arr.length; i++) {
                    arr[i].style.width = (100 / arr.length) + "%";
                    if (this._barType != "segmentedControl" && this._barType != "standardTab") {
                        arr[i].style.margin = "0";
                    }
                }
            } else {
                if (this.center && (!parent || !domClass.contains(parent.domNode, "mblHeading"))) {
                    margin = w;
                    for (i = 0; i < arr.length; i++) {
                        margin -= domGeometry.getMarginBox(arr[i]).w;
                    }
                    margin = Math.floor(margin / 2);
                }
                if (0 && !this.isLeftToRight()) {
                    this.containerNode.style.paddingLeft = "0px";
                    this.containerNode.style.paddingRight = margin ? margin + "px" : "";
                } else {
                    this.containerNode.style.paddingLeft = margin ? margin + "px" : "";
                }
            }
        }
        if (size && size.w) {
            domGeometry.setMarginBox(this.domNode, size);
        }
    }, getSelectedTab:function () {
        return array.filter(this.getChildren(), function (w) {
            return w.selected;
        })[0];
    }, onCloseButtonClick:function (tab) {
        return true;
    }});
    return 0 ? declare("dojox.mobile.TabBar", [TabBar, BidiTabBar]) : TabBar;
});

