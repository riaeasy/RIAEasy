//>>built

define("dojox/widget/Portlet", ["dojo/_base/declare", "dojo/_base/kernel", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/event", "dojo/_base/connect", "dojo/dom-style", "dojo/dom-class", "dojo/dom-construct", "dojo/fx", "dijit/registry", "dijit/TitlePane", "dijit/_Container", "./PortletSettings", "./PortletDialogSettings"], function (declare, kernel, lang, array, event, connect, domStyle, domClass, domConstruct, fx, registry, TitlePane, _Container, PortletSettings, PortletDialogSettings) {
    kernel.experimental("dojox.widget.Portlet");
    return declare("dojox.widget.Portlet", [TitlePane, _Container], {resizeChildren:true, closable:true, _parents:null, _size:null, dragRestriction:false, buildRendering:function () {
        this.inherited(arguments);
        domStyle.set(this.domNode, "visibility", "hidden");
    }, postCreate:function () {
        this.inherited(arguments);
        domClass.add(this.domNode, "dojoxPortlet");
        domClass.remove(this.arrowNode, "dijitArrowNode");
        domClass.add(this.arrowNode, "dojoxPortletIcon dojoxArrowDown");
        domClass.add(this.titleBarNode, "dojoxPortletTitle");
        domClass.add(this.hideNode, "dojoxPortletContentOuter");
        domClass.add(this.domNode, "dojoxPortlet-" + (!this.dragRestriction ? "movable" : "nonmovable"));
        var _this = this;
        if (this.resizeChildren) {
            this.subscribe("/dnd/drop", function () {
                _this._updateSize();
            });
            this.subscribe("/Portlet/sizechange", function (widget) {
                _this.onSizeChange(widget);
            });
            this.connect(window, "onresize", function () {
                _this._updateSize();
            });
            var doSelectSubscribe = lang.hitch(this, function (id, lastId) {
                var widget = registry.byId(id);
                if (widget.selectChild) {
                    var s = this.subscribe(id + "-selectChild", function (child) {
                        var n = _this.domNode.parentNode;
                        while (n) {
                            if (n == child.domNode) {
                                _this.unsubscribe(s);
                                _this._updateSize();
                                break;
                            }
                            n = n.parentNode;
                        }
                    });
                    var child = registry.byId(lastId);
                    if (widget && child) {
                        _this._parents.push({parent:widget, child:child});
                    }
                }
            });
            var lastId;
            this._parents = [];
            for (var p = this.domNode.parentNode; p != null; p = p.parentNode) {
                var id = p.getAttribute ? p.getAttribute("widgetId") : null;
                if (id) {
                    doSelectSubscribe(id, lastId);
                    lastId = id;
                }
            }
        }
        this.connect(this.titleBarNode, "onmousedown", function (evt) {
            if (domClass.contains(evt.target, "dojoxPortletIcon")) {
                event.stop(evt);
                return false;
            }
            return true;
        });
        this.connect(this._wipeOut, "onEnd", function () {
            _this._publish();
        });
        this.connect(this._wipeIn, "onEnd", function () {
            _this._publish();
        });
        if (this.closable) {
            this.closeIcon = this._createIcon("dojoxCloseNode", "dojoxCloseNodeHover", lang.hitch(this, "onClose"));
            domStyle.set(this.closeIcon, "display", "");
        }
    }, startup:function () {
        if (this._started) {
            return;
        }
        var children = this.getChildren();
        this._placeSettingsWidgets();
        array.forEach(children, function (child) {
            try {
                if (!child.started && !child._started) {
                    child.startup();
                }
            }
            catch (e) {
                console.log(this.id + ":" + this.declaredClass, e);
            }
        });
        this.inherited(arguments);
        domStyle.set(this.domNode, "visibility", "visible");
    }, _placeSettingsWidgets:function () {
        array.forEach(this.getChildren(), lang.hitch(this, function (child) {
            if (child.portletIconClass && child.toggle && !child.get("portlet")) {
                this._createIcon(child.portletIconClass, child.portletIconHoverClass, lang.hitch(child, "toggle"));
                domConstruct.place(child.domNode, this.containerNode, "before");
                child.set("portlet", this);
                this._settingsWidget = child;
            }
        }));
    }, _createIcon:function (clazz, hoverClazz, fn) {
        var icon = domConstruct.create("div", {"class":"dojoxPortletIcon " + clazz, "waiRole":"presentation"});
        domConstruct.place(icon, this.arrowNode, "before");
        this.connect(icon, "onclick", fn);
        if (hoverClazz) {
            this.connect(icon, "onmouseover", function () {
                domClass.add(icon, hoverClazz);
            });
            this.connect(icon, "onmouseout", function () {
                domClass.remove(icon, hoverClazz);
            });
        }
        return icon;
    }, onClose:function (evt) {
        domStyle.set(this.domNode, "display", "none");
    }, onSizeChange:function (widget) {
        if (widget == this) {
            return;
        }
        this._updateSize();
    }, _updateSize:function () {
        if (!this.open || !this._started || !this.resizeChildren) {
            return;
        }
        if (this._timer) {
            clearTimeout(this._timer);
        }
        this._timer = setTimeout(lang.hitch(this, function () {
            var size = {w:domStyle.get(this.domNode, "width"), h:domStyle.get(this.domNode, "height")};
            for (var i = 0; i < this._parents.length; i++) {
                var p = this._parents[i];
                var sel = p.parent.selectedChildWidget;
                if (sel && sel != p.child) {
                    return;
                }
            }
            if (this._size) {
                if (this._size.w == size.w && this._size.h == size.h) {
                    return;
                }
            }
            this._size = size;
            var fns = ["resize", "layout"];
            this._timer = null;
            var kids = this.getChildren();
            array.forEach(kids, function (child) {
                for (var i = 0; i < fns.length; i++) {
                    if (lang.isFunction(child[fns[i]])) {
                        try {
                            child[fns[i]]();
                        }
                        catch (e) {
                            console.log(e);
                        }
                        break;
                    }
                }
            });
            this.onUpdateSize();
        }), 100);
    }, onUpdateSize:function () {
    }, _publish:function () {
        connect.publish("/Portlet/sizechange", [this]);
    }, _onTitleClick:function (evt) {
        if (evt.target == this.arrowNode) {
            this.inherited(arguments);
        }
    }, addChild:function (child) {
        this._size = null;
        this.inherited(arguments);
        if (this._started) {
            this._placeSettingsWidgets();
            this._updateSize();
        }
        if (this._started && !child.started && !child._started) {
            child.startup();
        }
    }, destroyDescendants:function (preserveDom) {
        this.inherited(arguments);
        if (this._settingsWidget) {
            this._settingsWidget.destroyRecursive(preserveDom);
        }
    }, destroy:function () {
        if (this._timer) {
            clearTimeout(this._timer);
        }
        this.inherited(arguments);
    }, _setCss:function () {
        this.inherited(arguments);
        domStyle.set(this.arrowNode, "display", this.toggleable ? "" : "none");
    }});
});

