//>>built

define("dojox/mobile/View", ["dojo/_base/array", "dojo/_base/config", "dojo/_base/connect", "dojo/_base/declare", "dojo/_base/lang", "dojo/sniff", "dojo/_base/window", "dojo/_base/Deferred", "dojo/dom", "dojo/dom-class", "dojo/dom-construct", "dojo/dom-geometry", "dojo/dom-style", "dijit/registry", "dijit/_Contained", "dijit/_Container", "dijit/_WidgetBase", "./ViewController", "./common", "./transition", "./viewRegistry", "./_css3"], function (array, config, connect, declare, lang, has, win, Deferred, dom, domClass, domConstruct, domGeometry, domStyle, registry, Contained, Container, WidgetBase, ViewController, common, transitDeferred, viewRegistry, css3) {
    var dm = lang.getObject("dojox.mobile", true);
    return declare("dojox.mobile.View", [WidgetBase, Container, Contained], {selected:false, keepScrollPos:true, tag:"div", baseClass:"mblView", constructor:function (params, node) {
        if (node) {
            dom.byId(node).style.visibility = "hidden";
        }
    }, destroy:function () {
        viewRegistry.remove(this.id);
        this.inherited(arguments);
    }, buildRendering:function () {
        if (!this.templateString) {
            this.domNode = this.containerNode = this.srcNodeRef || domConstruct.create(this.tag);
        }
        this._animEndHandle = this.connect(this.domNode, css3.name("animationEnd"), "onAnimationEnd");
        this._animStartHandle = this.connect(this.domNode, css3.name("animationStart"), "onAnimationStart");
        if (!config.mblCSS3Transition) {
            this._transEndHandle = this.connect(this.domNode, css3.name("transitionEnd"), "onAnimationEnd");
        }
        if (has("mblAndroid3Workaround")) {
            domStyle.set(this.domNode, css3.name("transformStyle"), "preserve-3d");
        }
        viewRegistry.add(this);
        this.inherited(arguments);
    }, startup:function () {
        if (this._started) {
            return;
        }
        if (this._visible === undefined) {
            var views = this.getSiblingViews();
            var ids = location.hash && location.hash.substring(1).split(/,/);
            var fragView, selectedView, firstView;
            array.forEach(views, function (v, i) {
                if (array.indexOf(ids, v.id) !== -1) {
                    fragView = v;
                }
                if (i == 0) {
                    firstView = v;
                }
                if (v.selected) {
                    selectedView = v;
                }
                v._visible = false;
            }, this);
            (fragView || selectedView || firstView)._visible = true;
        }
        if (this._visible) {
            this.show(true, true);
            this.defer(function () {
                this.onStartView();
                connect.publish("/dojox/mobile/startView", [this]);
            });
        }
        if (this.domNode.style.visibility === "hidden") {
            this.domNode.style.visibility = "inherit";
        }
        this.inherited(arguments);
        var parent = this.getParent();
        if (!parent || !parent.resize) {
            this.resize();
        }
        if (!this._visible) {
            this.hide();
        }
    }, resize:function () {
        array.forEach(this.getChildren(), function (child) {
            if (child.resize) {
                child.resize();
            }
        });
    }, onStartView:function () {
    }, onBeforeTransitionIn:function (moveTo, dir, transition, context, method) {
    }, onAfterTransitionIn:function (moveTo, dir, transition, context, method) {
    }, onBeforeTransitionOut:function (moveTo, dir, transition, context, method) {
    }, onAfterTransitionOut:function (moveTo, dir, transition, context, method) {
    }, _clearClasses:function (node) {
        if (!node) {
            return;
        }
        var classes = [];
        array.forEach(lang.trim(node.className || "").split(/\s+/), function (c) {
            if (c.match(/^mbl\w*View$/) || c.indexOf("mbl") === -1) {
                classes.push(c);
            }
        }, this);
        node.className = classes.join(" ");
    }, _fixViewState:function (toNode) {
        var nodes = this.domNode.parentNode.childNodes;
        for (var i = 0; i < nodes.length; i++) {
            var n = nodes[i];
            if (n.nodeType === 1 && domClass.contains(n, "mblView")) {
                this._clearClasses(n);
            }
        }
        this._clearClasses(toNode);
        var toWidget = registry.byNode(toNode);
        if (toWidget) {
            toWidget._inProgress = false;
        }
    }, convertToId:function (moveTo) {
        if (typeof (moveTo) == "string") {
            return moveTo.replace(/^#?([^&?]+).*/, "$1");
        }
        return moveTo;
    }, _isBookmarkable:function (detail) {
        return detail.moveTo && (config.mblForceBookmarkable || detail.moveTo.charAt(0) === "#") && !detail.hashchange;
    }, performTransition:function (moveTo, transitionDir, transition, context, method) {
        if (this._inProgress) {
            return;
        }
        this._inProgress = true;
        var detail, optArgs;
        if (moveTo && typeof (moveTo) === "object") {
            detail = moveTo;
            optArgs = transitionDir;
        } else {
            detail = {moveTo:moveTo, transitionDir:transitionDir, transition:transition, context:context, method:method};
            optArgs = [];
            for (var i = 5; i < arguments.length; i++) {
                optArgs.push(arguments[i]);
            }
        }
        this._detail = detail;
        this._optArgs = optArgs;
        this._arguments = [detail.moveTo, detail.transitionDir, detail.transition, detail.context, detail.method];
        if (detail.moveTo === "#") {
            return;
        }
        var toNode;
        if (detail.moveTo) {
            toNode = this.convertToId(detail.moveTo);
        } else {
            if (!this._dummyNode) {
                this._dummyNode = win.doc.createElement("div");
                win.body().appendChild(this._dummyNode);
            }
            toNode = this._dummyNode;
        }
        if (this.addTransitionInfo && typeof (detail.moveTo) == "string" && this._isBookmarkable(detail)) {
            this.addTransitionInfo(this.id, detail.moveTo, {transitionDir:detail.transitionDir, transition:detail.transition});
        }
        var fromNode = this.domNode;
        var fromTop = fromNode.offsetTop;
        toNode = this.toNode = dom.byId(toNode);
        if (!toNode) {
            console.log("dojox/mobile/View.performTransition: destination view not found: " + detail.moveTo);
            return;
        }
        toNode.style.visibility = "hidden";
        toNode.style.display = "";
        this._fixViewState(toNode);
        var toWidget = registry.byNode(toNode);
        if (toWidget) {
            if (config.mblAlwaysResizeOnTransition || !toWidget._resized) {
                common.resizeAll(null, toWidget);
                toWidget._resized = true;
            }
            if (detail.transition && detail.transition != "none") {
                toWidget._addTransitionPaddingTop(fromTop);
            }
            toWidget.load && toWidget.load();
            toWidget.movedFrom = fromNode.id;
        }
        if (has("mblAndroidWorkaround") && !config.mblCSS3Transition && detail.transition && detail.transition != "none") {
            domStyle.set(toNode, css3.name("transformStyle"), "preserve-3d");
            domStyle.set(fromNode, css3.name("transformStyle"), "preserve-3d");
            domClass.add(toNode, "mblAndroidWorkaround");
        }
        this.onBeforeTransitionOut.apply(this, this._arguments);
        connect.publish("/dojox/mobile/beforeTransitionOut", [this].concat(lang._toArray(this._arguments)));
        if (toWidget) {
            if (this.keepScrollPos && !this.getParent()) {
                var scrollTop = win.body().scrollTop || win.doc.documentElement.scrollTop || win.global.pageYOffset || 0;
                fromNode._scrollTop = scrollTop;
                var toTop = (detail.transitionDir == 1) ? 0 : (toNode._scrollTop || 0);
                toNode.style.top = "0px";
                if (scrollTop > 1 || toTop !== 0) {
                    fromNode.style.top = toTop - scrollTop + "px";
                    if (!(has("ios") >= 7) && config.mblHideAddressBar !== false) {
                        this.defer(function () {
                            win.global.scrollTo(0, (toTop || 1));
                        });
                    }
                }
            } else {
                toNode.style.top = "0px";
            }
            toWidget.onBeforeTransitionIn.apply(toWidget, this._arguments);
            connect.publish("/dojox/mobile/beforeTransitionIn", [toWidget].concat(lang._toArray(this._arguments)));
        }
        toNode.style.display = "none";
        toNode.style.visibility = "inherit";
        common.fromView = this;
        common.toView = toWidget;
        this._doTransition(fromNode, toNode, detail.transition, detail.transitionDir);
    }, _addTransitionPaddingTop:function (value) {
        this.containerNode.style.paddingTop = value + "px";
    }, _removeTransitionPaddingTop:function () {
        this.containerNode.style.paddingTop = "";
    }, _toCls:function (s) {
        return "mbl" + s.charAt(0).toUpperCase() + s.substring(1);
    }, _doTransition:function (fromNode, toNode, transition, transitionDir) {
        var rev = (transitionDir == -1) ? " mblReverse" : "";
        toNode.style.display = "";
        if (!transition || transition == "none") {
            this.domNode.style.display = "none";
            this.invokeCallback();
        } else {
            if (config.mblCSS3Transition) {
                Deferred.when(transitDeferred, lang.hitch(this, function (transit) {
                    var toPosition = domStyle.get(toNode, "position");
                    domStyle.set(toNode, "position", "absolute");
                    Deferred.when(transit(fromNode, toNode, {transition:transition, reverse:(transitionDir === -1) ? true : false}), lang.hitch(this, function () {
                        domStyle.set(toNode, "position", toPosition);
                        toNode.style.paddingTop = "";
                        this.invokeCallback();
                    }));
                }));
            } else {
                if (transition.indexOf("cube") != -1) {
                    if (has("ipad")) {
                        domStyle.set(toNode.parentNode, {webkitPerspective:1600});
                    } else {
                        if (has("ios")) {
                            domStyle.set(toNode.parentNode, {webkitPerspective:800});
                        }
                    }
                }
                var s = this._toCls(transition);
                if (has("mblAndroidWorkaround")) {
                    var _this = this;
                    _this.defer(function () {
                        domClass.add(fromNode, s + " mblOut" + rev);
                        domClass.add(toNode, s + " mblIn" + rev);
                        domClass.remove(toNode, "mblAndroidWorkaround");
                        _this.defer(function () {
                            domClass.add(fromNode, "mblTransition");
                            domClass.add(toNode, "mblTransition");
                        }, 30);
                    }, 70);
                } else {
                    domClass.add(fromNode, s + " mblOut" + rev);
                    domClass.add(toNode, s + " mblIn" + rev);
                    this.defer(function () {
                        domClass.add(fromNode, "mblTransition");
                        domClass.add(toNode, "mblTransition");
                    }, 100);
                }
                var fromOrigin = "50% 50%";
                var toOrigin = "50% 50%";
                var scrollTop, posX, posY;
                if (transition.indexOf("swirl") != -1 || transition.indexOf("zoom") != -1) {
                    if (this.keepScrollPos && !this.getParent()) {
                        scrollTop = win.body().scrollTop || win.doc.documentElement.scrollTop || win.global.pageYOffset || 0;
                    } else {
                        scrollTop = -domGeometry.position(fromNode, true).y;
                    }
                    posY = win.global.innerHeight / 2 + scrollTop;
                    fromOrigin = "50% " + posY + "px";
                    toOrigin = "50% " + posY + "px";
                } else {
                    if (transition.indexOf("scale") != -1) {
                        var viewPos = domGeometry.position(fromNode, true);
                        posX = ((this.clickedPosX !== undefined) ? this.clickedPosX : win.global.innerWidth / 2) - viewPos.x;
                        if (this.keepScrollPos && !this.getParent()) {
                            scrollTop = win.body().scrollTop || win.doc.documentElement.scrollTop || win.global.pageYOffset || 0;
                        } else {
                            scrollTop = -viewPos.y;
                        }
                        posY = ((this.clickedPosY !== undefined) ? this.clickedPosY : win.global.innerHeight / 2) + scrollTop;
                        fromOrigin = posX + "px " + posY + "px";
                        toOrigin = posX + "px " + posY + "px";
                    }
                }
                domStyle.set(fromNode, css3.add({}, {transformOrigin:fromOrigin}));
                domStyle.set(toNode, css3.add({}, {transformOrigin:toOrigin}));
            }
        }
    }, onAnimationStart:function (e) {
    }, onAnimationEnd:function (e) {
        var name = e.animationName || e.target.className;
        if (name.indexOf("Out") === -1 && name.indexOf("In") === -1 && name.indexOf("Shrink") === -1) {
            return;
        }
        var isOut = false;
        if (domClass.contains(this.domNode, "mblOut")) {
            isOut = true;
            this.domNode.style.display = "none";
            domClass.remove(this.domNode, [this._toCls(this._detail.transition), "mblIn", "mblOut", "mblReverse"]);
        } else {
            this._removeTransitionPaddingTop();
        }
        domStyle.set(this.domNode, css3.add({}, {transformOrigin:""}));
        if (name.indexOf("Shrink") !== -1) {
            var li = e.target;
            li.style.display = "none";
            domClass.remove(li, "mblCloseContent");
            var p = viewRegistry.getEnclosingScrollable(this.domNode);
            p && p.onTouchEnd();
        }
        if (isOut) {
            this.invokeCallback();
        }
        this._clearClasses(this.domNode);
        this.clickedPosX = this.clickedPosY = undefined;
        if (name.indexOf("Cube") !== -1 && name.indexOf("In") !== -1 && has("ios")) {
            this.domNode.parentNode.style[css3.name("perspective")] = "";
        }
    }, invokeCallback:function () {
        this.onAfterTransitionOut.apply(this, this._arguments);
        connect.publish("/dojox/mobile/afterTransitionOut", [this].concat(this._arguments));
        var toWidget = registry.byNode(this.toNode);
        if (toWidget) {
            toWidget.onAfterTransitionIn.apply(toWidget, this._arguments);
            connect.publish("/dojox/mobile/afterTransitionIn", [toWidget].concat(this._arguments));
            toWidget.movedFrom = undefined;
            if (this.setFragIds && this._isBookmarkable(this._detail)) {
                this.setFragIds(toWidget);
            }
        }
        if (has("mblAndroidWorkaround")) {
            this.defer(function () {
                if (toWidget) {
                    domStyle.set(this.toNode, css3.name("transformStyle"), "");
                }
                domStyle.set(this.domNode, css3.name("transformStyle"), "");
            });
        }
        var c = this._detail.context, m = this._detail.method;
        if (c || m) {
            if (!m) {
                m = c;
                c = null;
            }
            c = c || win.global;
            if (typeof (m) == "string") {
                c[m].apply(c, this._optArgs);
            } else {
                if (typeof (m) == "function") {
                    m.apply(c, this._optArgs);
                }
            }
        }
        this._detail = this._optArgs = this._arguments = undefined;
        this._inProgress = false;
    }, isVisible:function (checkAncestors) {
        var visible = function (node) {
            return domStyle.get(node, "display") !== "none";
        };
        if (checkAncestors) {
            for (var n = this.domNode; n.tagName !== "BODY"; n = n.parentNode) {
                if (!visible(n)) {
                    return false;
                }
            }
            return true;
        } else {
            return visible(this.domNode);
        }
    }, getShowingView:function () {
        var nodes = this.domNode.parentNode.childNodes;
        for (var i = 0; i < nodes.length; i++) {
            var n = nodes[i];
            if (n.nodeType === 1 && domClass.contains(n, "mblView") && n.style.display !== "none") {
                return registry.byNode(n);
            }
        }
        return null;
    }, getSiblingViews:function () {
        if (!this.domNode.parentNode) {
            return [this];
        }
        return array.map(array.filter(this.domNode.parentNode.childNodes, function (n) {
            return n.nodeType === 1 && domClass.contains(n, "mblView");
        }), function (n) {
            return registry.byNode(n);
        });
    }, show:function (noEvent, doNotHideOthers) {
        var out = this.getShowingView();
        if (!noEvent) {
            if (out) {
                out.onBeforeTransitionOut(out.id);
                connect.publish("/dojox/mobile/beforeTransitionOut", [out, out.id]);
            }
            this.onBeforeTransitionIn(this.id);
            connect.publish("/dojox/mobile/beforeTransitionIn", [this, this.id]);
        }
        if (doNotHideOthers) {
            this.domNode.style.display = "";
        } else {
            array.forEach(this.getSiblingViews(), function (v) {
                v.domNode.style.display = (v === this) ? "" : "none";
            }, this);
        }
        this.load && this.load();
        if (!noEvent) {
            if (out) {
                out.onAfterTransitionOut(out.id);
                connect.publish("/dojox/mobile/afterTransitionOut", [out, out.id]);
            }
            this.onAfterTransitionIn(this.id);
            connect.publish("/dojox/mobile/afterTransitionIn", [this, this.id]);
        }
    }, hide:function () {
        this.domNode.style.display = "none";
    }});
});

