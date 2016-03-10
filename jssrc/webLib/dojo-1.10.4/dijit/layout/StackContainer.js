//>>built

define("dijit/layout/StackContainer", ["dojo/_base/array", "dojo/cookie", "dojo/_base/declare", "dojo/dom-class", "dojo/dom-construct", "dojo/has", "dojo/_base/lang", "dojo/on", "dojo/ready", "dojo/topic", "dojo/when", "../registry", "../_WidgetBase", "./_LayoutWidget"], function (array, cookie, declare, domClass, domConstruct, has, lang, on, ready, topic, when, registry, _WidgetBase, _LayoutWidget) {
    if (has("dijit-legacy-requires")) {
        ready(0, function () {
            var requires = ["dijit/layout/StackController"];
            require(requires);
        });
    }
    var StackContainer = declare("dijit.layout.StackContainer", _LayoutWidget, {doLayout:true, persist:false, baseClass:"dijitStackContainer", buildRendering:function () {
        this.inherited(arguments);
        domClass.add(this.domNode, "dijitLayoutContainer");
    }, postCreate:function () {
        this.inherited(arguments);
        this.own(on(this.domNode, "keydown", lang.hitch(this, "_onKeyDown")));
    }, startup:function () {
        if (this._started) {
            return;
        }
        var children = this.getChildren();
        array.forEach(children, this._setupChild, this);
        if (this.persist) {
            this.selectedChildWidget = registry.byId(cookie(this.id + "_selectedChild"));
        } else {
            array.some(children, function (child) {
                if (child.selected) {
                    this.selectedChildWidget = child;
                }
                return child.selected;
            }, this);
        }
        var selected = this.selectedChildWidget;
        if (!selected && children[0]) {
            selected = this.selectedChildWidget = children[0];
            selected.selected = true;
        }
        topic.publish(this.id + "-startup", {children:children, selected:selected, textDir:this.textDir});
        this.inherited(arguments);
    }, resize:function () {
        if (!this._hasBeenShown) {
            this._hasBeenShown = true;
            var selected = this.selectedChildWidget;
            if (selected) {
                this._showChild(selected);
            }
        }
        this.inherited(arguments);
    }, _setupChild:function (child) {
        var childNode = child.domNode, wrapper = domConstruct.place("<div role='tabpanel' class='" + this.baseClass + "ChildWrapper dijitHidden'>", child.domNode, "replace"), label = child["aria-label"] || child.title || child.label;
        if (label) {
            wrapper.setAttribute("aria-label", label);
        }
        domConstruct.place(childNode, wrapper);
        child._wrapper = wrapper;
        this.inherited(arguments);
        if (childNode.style.display == "none") {
            childNode.style.display = "block";
        }
        child.domNode.removeAttribute("title");
    }, addChild:function (child, insertIndex) {
        this.inherited(arguments);
        if (this._started) {
            topic.publish(this.id + "-addChild", child, insertIndex);
            this.layout();
            if (!this.selectedChildWidget) {
                this.selectChild(child);
            }
        }
    }, removeChild:function (page) {
        var idx = array.indexOf(this.getChildren(), page);
        this.inherited(arguments);
        domConstruct.destroy(page._wrapper);
        delete page._wrapper;
        if (this._started) {
            topic.publish(this.id + "-removeChild", page);
        }
        if (this._descendantsBeingDestroyed) {
            return;
        }
        if (this.selectedChildWidget === page) {
            this.selectedChildWidget = undefined;
            if (this._started) {
                var children = this.getChildren();
                if (children.length) {
                    this.selectChild(children[Math.max(idx - 1, 0)]);
                }
            }
        }
        if (this._started) {
            this.layout();
        }
    }, selectChild:function (page, animate) {
        var d;
        page = registry.byId(page);
        if (this.selectedChildWidget != page) {
            d = this._transition(page, this.selectedChildWidget, animate);
            this._set("selectedChildWidget", page);
            topic.publish(this.id + "-selectChild", page);
            if (this.persist) {
                cookie(this.id + "_selectedChild", this.selectedChildWidget.id);
            }
        }
        return when(d || true);
    }, _transition:function (newWidget, oldWidget) {
        if (oldWidget) {
            this._hideChild(oldWidget);
        }
        var d = this._showChild(newWidget);
        if (newWidget.resize) {
            if (this.doLayout) {
                newWidget.resize(this._containerContentBox || this._contentBox);
            } else {
                newWidget.resize();
            }
        }
        return d;
    }, _adjacent:function (forward) {
        var children = this.getChildren();
        var index = array.indexOf(children, this.selectedChildWidget);
        index += forward ? 1 : children.length - 1;
        return children[index % children.length];
    }, forward:function () {
        return this.selectChild(this._adjacent(true), true);
    }, back:function () {
        return this.selectChild(this._adjacent(false), true);
    }, _onKeyDown:function (e) {
        topic.publish(this.id + "-containerKeyDown", {e:e, page:this});
    }, layout:function () {
        var child = this.selectedChildWidget;
        if (child && child.resize) {
            if (this.doLayout) {
                child.resize(this._containerContentBox || this._contentBox);
            } else {
                child.resize();
            }
        }
    }, _showChild:function (page) {
        var children = this.getChildren();
        page.isFirstChild = (page == children[0]);
        page.isLastChild = (page == children[children.length - 1]);
        page._set("selected", true);
        if (page._wrapper) {
            domClass.replace(page._wrapper, "dijitVisible", "dijitHidden");
        }
        return (page._onShow && page._onShow()) || true;
    }, _hideChild:function (page) {
        page._set("selected", false);
        if (page._wrapper) {
            domClass.replace(page._wrapper, "dijitHidden", "dijitVisible");
        }
        page.onHide && page.onHide();
    }, closeChild:function (page) {
        var remove = page.onClose && page.onClose(this, page);
        if (remove) {
            this.removeChild(page);
            page.destroyRecursive();
        }
    }, destroyDescendants:function (preserveDom) {
        this._descendantsBeingDestroyed = true;
        this.selectedChildWidget = undefined;
        array.forEach(this.getChildren(), function (child) {
            if (!preserveDom) {
                this.removeChild(child);
            }
            child.destroyRecursive(preserveDom);
        }, this);
        this._descendantsBeingDestroyed = false;
    }});
    StackContainer.ChildWidgetProperties = {selected:false, disabled:false, closable:false, iconClass:"dijitNoIcon", showTitle:true};
    lang.extend(_WidgetBase, StackContainer.ChildWidgetProperties);
    return StackContainer;
});

