//>>built

define("dijit/layout/StackController", ["dojo/_base/array", "dojo/_base/declare", "dojo/dom-class", "dojo/dom-construct", "dojo/keys", "dojo/_base/lang", "dojo/on", "dojo/topic", "../focus", "../registry", "../_Widget", "../_TemplatedMixin", "../_Container", "../form/ToggleButton", "dojo/touch"], function (array, declare, domClass, domConstruct, keys, lang, on, topic, focus, registry, _Widget, _TemplatedMixin, _Container, ToggleButton) {
    var StackButton = declare("dijit.layout._StackButton", ToggleButton, {tabIndex:"-1", closeButton:false, _aria_attr:"aria-selected", buildRendering:function (evt) {
        this.inherited(arguments);
        (this.focusNode || this.domNode).setAttribute("role", "tab");
    }});
    var StackController = declare("dijit.layout.StackController", [_Widget, _TemplatedMixin, _Container], {baseClass:"dijitStackController", templateString:"<span role='tablist' data-dojo-attach-event='onkeydown'></span>", containerId:"", buttonWidget:StackButton, buttonWidgetCloseClass:"dijitStackCloseButton", pane2button:function (id) {
        return registry.byId(this.id + "_" + id);
    }, postCreate:function () {
        this.inherited(arguments);
        this.own(topic.subscribe(this.containerId + "-startup", lang.hitch(this, "onStartup")), topic.subscribe(this.containerId + "-addChild", lang.hitch(this, "onAddChild")), topic.subscribe(this.containerId + "-removeChild", lang.hitch(this, "onRemoveChild")), topic.subscribe(this.containerId + "-selectChild", lang.hitch(this, "onSelectChild")), topic.subscribe(this.containerId + "-containerKeyDown", lang.hitch(this, "onContainerKeyDown")));
        this.containerNode.dojoClick = true;
        this.own(on(this.containerNode, "click", lang.hitch(this, function (evt) {
            var button = registry.getEnclosingWidget(evt.target);
            if (button != this.containerNode && !button.disabled && button.page) {
                for (var target = evt.target; target !== this.containerNode; target = target.parentNode) {
                    if (domClass.contains(target, this.buttonWidgetCloseClass)) {
                        this.onCloseButtonClick(button.page);
                        break;
                    } else {
                        if (target == button.domNode) {
                            this.onButtonClick(button.page);
                            break;
                        }
                    }
                }
            }
        })));
    }, onStartup:function (info) {
        this.textDir = info.textDir;
        array.forEach(info.children, this.onAddChild, this);
        if (info.selected) {
            this.onSelectChild(info.selected);
        }
        var containerNode = registry.byId(this.containerId).containerNode, pane2button = lang.hitch(this, "pane2button"), paneToButtonAttr = {"title":"label", "showtitle":"showLabel", "iconclass":"iconClass", "closable":"closeButton", "tooltip":"title", "disabled":"disabled", "textdir":"textdir"}, connectFunc = function (attr, buttonAttr) {
            return on(containerNode, "attrmodified-" + attr, function (evt) {
                var button = pane2button(evt.detail && evt.detail.widget && evt.detail.widget.id);
                if (button) {
                    button.set(buttonAttr, evt.detail.newValue);
                }
            });
        };
        for (var attr in paneToButtonAttr) {
            this.own(connectFunc(attr, paneToButtonAttr[attr]));
        }
    }, destroy:function (preserveDom) {
        this.destroyDescendants(preserveDom);
        this.inherited(arguments);
    }, onAddChild:function (page, insertIndex) {
        var Cls = lang.isString(this.buttonWidget) ? lang.getObject(this.buttonWidget) : this.buttonWidget;
        var button = new Cls({id:this.id + "_" + page.id, name:this.id + "_" + page.id, label:page.title, disabled:page.disabled, ownerDocument:this.ownerDocument, dir:page.dir, lang:page.lang, textDir:page.textDir || this.textDir, showLabel:page.showTitle, iconClass:page.iconClass, closeButton:page.closable, title:page.tooltip, page:page});
        this.addChild(button, insertIndex);
        page.controlButton = button;
        if (!this._currentChild) {
            this.onSelectChild(page);
        }
        var labelledby = page._wrapper.getAttribute("aria-labelledby") ? page._wrapper.getAttribute("aria-labelledby") + " " + button.id : button.id;
        page._wrapper.removeAttribute("aria-label");
        page._wrapper.setAttribute("aria-labelledby", labelledby);
    }, onRemoveChild:function (page) {
        if (this._currentChild === page) {
            this._currentChild = null;
        }
        var button = this.pane2button(page.id);
        if (button) {
            this.removeChild(button);
            button.destroy();
        }
        delete page.controlButton;
    }, onSelectChild:function (page) {
        if (!page) {
            return;
        }
        if (this._currentChild) {
            var oldButton = this.pane2button(this._currentChild.id);
            oldButton.set("checked", false);
            oldButton.focusNode.setAttribute("tabIndex", "-1");
        }
        var newButton = this.pane2button(page.id);
        newButton.set("checked", true);
        this._currentChild = page;
        newButton.focusNode.setAttribute("tabIndex", "0");
        var container = registry.byId(this.containerId);
    }, onButtonClick:function (page) {
        var button = this.pane2button(page.id);
        focus.focus(button.focusNode);
        if (this._currentChild && this._currentChild.id === page.id) {
            button.set("checked", true);
        }
        var container = registry.byId(this.containerId);
        container.selectChild(page);
    }, onCloseButtonClick:function (page) {
        var container = registry.byId(this.containerId);
        container.closeChild(page);
        if (this._currentChild) {
            var b = this.pane2button(this._currentChild.id);
            if (b) {
                focus.focus(b.focusNode || b.domNode);
            }
        }
    }, adjacent:function (forward) {
        if (!this.isLeftToRight() && (!this.tabPosition || /top|bottom/.test(this.tabPosition))) {
            forward = !forward;
        }
        var children = this.getChildren();
        var idx = array.indexOf(children, this.pane2button(this._currentChild.id)), current = children[idx];
        var child;
        do {
            idx = (idx + (forward ? 1 : children.length - 1)) % children.length;
            child = children[idx];
        } while (child.disabled && child != current);
        return child;
    }, onkeydown:function (e, fromContainer) {
        if (this.disabled || e.altKey) {
            return;
        }
        var forward = null;
        if (e.ctrlKey || !e._djpage) {
            switch (e.keyCode) {
              case keys.LEFT_ARROW:
              case keys.UP_ARROW:
                if (!e._djpage) {
                    forward = false;
                }
                break;
              case keys.PAGE_UP:
                if (e.ctrlKey) {
                    forward = false;
                }
                break;
              case keys.RIGHT_ARROW:
              case keys.DOWN_ARROW:
                if (!e._djpage) {
                    forward = true;
                }
                break;
              case keys.PAGE_DOWN:
                if (e.ctrlKey) {
                    forward = true;
                }
                break;
              case keys.HOME:
                var children = this.getChildren();
                for (var idx = 0; idx < children.length; idx++) {
                    var child = children[idx];
                    if (!child.disabled) {
                        this.onButtonClick(child.page);
                        break;
                    }
                }
                e.stopPropagation();
                e.preventDefault();
                break;
              case keys.END:
                var children = this.getChildren();
                for (var idx = children.length - 1; idx >= 0; idx--) {
                    var child = children[idx];
                    if (!child.disabled) {
                        this.onButtonClick(child.page);
                        break;
                    }
                }
                e.stopPropagation();
                e.preventDefault();
                break;
              case keys.DELETE:
              case "W".charCodeAt(0):
                if (this._currentChild.closable && (e.keyCode == keys.DELETE || e.ctrlKey)) {
                    this.onCloseButtonClick(this._currentChild);
                    e.stopPropagation();
                    e.preventDefault();
                }
                break;
              case keys.TAB:
                if (e.ctrlKey) {
                    this.onButtonClick(this.adjacent(!e.shiftKey).page);
                    e.stopPropagation();
                    e.preventDefault();
                }
                break;
            }
            if (forward !== null) {
                this.onButtonClick(this.adjacent(forward).page);
                e.stopPropagation();
                e.preventDefault();
            }
        }
    }, onContainerKeyDown:function (info) {
        info.e._djpage = info.page;
        this.onkeydown(info.e);
    }});
    StackController.StackButton = StackButton;
    return StackController;
});

